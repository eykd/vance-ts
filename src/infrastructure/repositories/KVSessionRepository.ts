import { Session } from '../../domain/entities/Session';
import type { SessionRepository } from '../../domain/interfaces/SessionRepository';
import type { TimeProvider } from '../../domain/interfaces/TimeProvider';
import { CsrfToken } from '../../domain/value-objects/CsrfToken';
import { SessionId } from '../../domain/value-objects/SessionId';
import { UserId } from '../../domain/value-objects/UserId';
import type { KVNamespace } from '../types/CloudflareTypes';

/**
 * Shape of the serialized session data stored in KV.
 *
 * This type is file-private and must not be exported.
 */
interface SessionRecord {
  readonly sessionId: string;
  readonly userId: string;
  readonly csrfToken: string;
  readonly expiresAt: string;
  readonly lastActivityAt: string;
  readonly ipAddress: string;
  readonly userAgent: string;
  readonly createdAt: string;
}

/**
 * Converts a Session entity to a serializable record.
 *
 * @param session - The Session entity to serialize
 * @returns A plain object suitable for JSON serialization
 */
function toRecord(session: Session): SessionRecord {
  return {
    sessionId: session.sessionId.toString(),
    userId: session.userId.toString(),
    csrfToken: session.csrfToken.toString(),
    expiresAt: session.expiresAt,
    lastActivityAt: session.lastActivityAt,
    ipAddress: session.ipAddress,
    userAgent: session.userAgent,
    createdAt: session.createdAt,
  };
}

/**
 * Reconstitutes a Session entity from a stored record.
 *
 * @param record - The stored session record
 * @returns A Session entity
 */
function toDomain(record: SessionRecord): Session {
  return Session.reconstitute({
    sessionId: SessionId.fromString(record.sessionId),
    userId: UserId.fromString(record.userId),
    csrfToken: CsrfToken.fromString(record.csrfToken),
    expiresAt: record.expiresAt,
    lastActivityAt: record.lastActivityAt,
    ipAddress: record.ipAddress,
    userAgent: record.userAgent,
    createdAt: record.createdAt,
  });
}

/**
 * Calculates the TTL in seconds from an expiry timestamp.
 *
 * @param expiresAt - UTC ISO 8601 expiry timestamp
 * @param nowMs - Current time in milliseconds since epoch
 * @returns TTL in seconds, minimum 1
 */
function calculateTtl(expiresAt: string, nowMs: number): number {
  const ttl = Math.ceil((Date.parse(expiresAt) - nowMs) / 1000);
  return Math.max(1, ttl);
}

/**
 * KV-backed implementation of the SessionRepository port.
 *
 * Stores sessions as JSON with TTL-based automatic expiration.
 * Maintains a user-to-sessions index for bulk operations.
 *
 * Key patterns:
 * - `session:{sessionId}` - Session data (JSON)
 * - `user_sessions:{userId}` - Array of session IDs (JSON)
 */
export class KVSessionRepository implements SessionRepository {
  /** TTL for the user session index during delete operations (24 hours). */
  private static readonly INDEX_TTL_SECONDS = 86400;

  private readonly kv: KVNamespace;
  private readonly timeProvider: TimeProvider;

  /**
   * Creates a new KVSessionRepository.
   *
   * @param kv - The KV namespace binding
   * @param timeProvider - Provides the current time for deterministic testing
   */
  constructor(kv: KVNamespace, timeProvider: TimeProvider) {
    this.kv = kv;
    this.timeProvider = timeProvider;
  }

  /**
   * Finds a session by its unique identifier.
   *
   * Returns null if the session is not found or if stored data is corrupt.
   * Corrupt entries are automatically cleaned up.
   *
   * @param id - The SessionId value object to search by
   * @returns The Session entity if found, or null
   */
  async findById(id: SessionId): Promise<Session | null> {
    const key = `session:${id.toString()}`;
    const raw = await this.kv.get(key);

    if (raw === null) {
      return null;
    }

    try {
      const record = JSON.parse(raw) as SessionRecord;
      return toDomain(record);
    } catch {
      await this.kv.delete(key);
      return null;
    }
  }

  /**
   * Persists a Session entity with TTL-based expiration.
   *
   * Also updates the user-to-sessions index with the same TTL as the session.
   *
   * @param session - The Session entity to save
   */
  async save(session: Session): Promise<void> {
    const key = `session:${session.sessionId.toString()}`;
    const record = toRecord(session);
    const ttl = calculateTtl(session.expiresAt, this.timeProvider.now());

    await this.kv.put(key, JSON.stringify(record), { expirationTtl: ttl });
    await this.addToUserIndex(session.userId.toString(), session.sessionId.toString());
  }

  /**
   * Deletes a session by its unique identifier.
   *
   * Also removes the session from the user-to-sessions index.
   * Handles non-existent sessions gracefully.
   *
   * @param id - The SessionId of the session to delete
   */
  async delete(id: SessionId): Promise<void> {
    const key = `session:${id.toString()}`;
    const raw = await this.kv.get(key);

    if (raw !== null) {
      try {
        const record = JSON.parse(raw) as SessionRecord;
        await this.removeFromUserIndex(record.userId, id.toString());
      } catch {
        // Corrupt data — just delete the key
      }
    }

    await this.kv.delete(key);
  }

  /**
   * Deletes all sessions belonging to a specific user.
   *
   * Loads the user index, deletes each session key, then deletes the index.
   *
   * @param userId - The UserId whose sessions should be deleted
   */
  async deleteAllForUser(userId: UserId): Promise<void> {
    const indexKey = `user_sessions:${userId.toString()}`;
    const raw = await this.kv.get(indexKey);

    if (raw !== null) {
      try {
        const sessionIds = JSON.parse(raw) as string[];
        const deletePromises = sessionIds.map((sid) => this.kv.delete(`session:${sid}`));
        await Promise.all(deletePromises);
      } catch {
        // Corrupt index — just delete it
      }
    }

    await this.kv.delete(indexKey);
  }

  /**
   * Updates the last activity timestamp for a session.
   *
   * Loads the session, updates lastActivityAt, and re-saves with recalculated TTL.
   * No-ops gracefully if the session does not exist.
   *
   * @param id - The SessionId of the session to update
   * @param now - Current UTC ISO 8601 timestamp
   */
  async updateActivity(id: SessionId, now: string): Promise<void> {
    const key = `session:${id.toString()}`;
    const raw = await this.kv.get(key);

    if (raw === null) {
      return;
    }

    try {
      const record = JSON.parse(raw) as SessionRecord;
      const updatedRecord: SessionRecord = { ...record, lastActivityAt: now };
      const ttl = calculateTtl(record.expiresAt, this.timeProvider.now());

      await this.kv.put(key, JSON.stringify(updatedRecord), { expirationTtl: ttl });
    } catch {
      // Corrupt data — clean up
      await this.kv.delete(key);
    }
  }

  /**
   * Adds a session ID to the user's session index.
   *
   * Uses the dedicated INDEX_TTL_SECONDS constant so the index outlives
   * any individual session and is not prematurely expired.
   *
   * @param userId - The user ID string
   * @param sessionId - The session ID string to add
   */
  private async addToUserIndex(userId: string, sessionId: string): Promise<void> {
    const indexKey = `user_sessions:${userId}`;
    const raw = await this.kv.get(indexKey);

    let sessionIds: string[] = [];
    if (raw !== null) {
      try {
        sessionIds = JSON.parse(raw) as string[];
      } catch {
        sessionIds = [];
      }
    }

    const sessionSet = new Set(sessionIds);
    sessionSet.add(sessionId);

    await this.kv.put(indexKey, JSON.stringify([...sessionSet]), {
      expirationTtl: KVSessionRepository.INDEX_TTL_SECONDS,
    });
  }

  /**
   * Removes a session ID from the user's session index.
   *
   * @param userId - The user ID string
   * @param sessionId - The session ID string to remove
   */
  private async removeFromUserIndex(userId: string, sessionId: string): Promise<void> {
    const indexKey = `user_sessions:${userId}`;
    const raw = await this.kv.get(indexKey);

    if (raw === null) {
      return;
    }

    try {
      const sessionIds = JSON.parse(raw) as string[];
      const filtered = sessionIds.filter((sid) => sid !== sessionId);

      if (filtered.length === 0) {
        await this.kv.delete(indexKey);
      } else {
        await this.kv.put(indexKey, JSON.stringify(filtered), {
          expirationTtl: KVSessionRepository.INDEX_TTL_SECONDS,
        });
      }
    } catch {
      await this.kv.delete(indexKey);
    }
  }
}
