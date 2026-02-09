import { Session } from '../../domain/entities/Session';
import type { SessionRepository } from '../../domain/interfaces/SessionRepository';
import { CsrfToken } from '../../domain/value-objects/CsrfToken';
import { SessionId } from '../../domain/value-objects/SessionId';
import { UserId } from '../../domain/value-objects/UserId';

/**
 * In-memory mock implementation of SessionRepository for testing.
 *
 * Stores sessions in a Map keyed by session ID string. Tracks delete
 * and deleteAllForUser calls for test assertions.
 */
export class MockSessionRepository implements SessionRepository {
  private readonly sessions: Map<string, Session> = new Map<string, Session>();

  /** Session IDs passed to delete(), in call order. */
  readonly deleteCalls: string[] = [];

  /** User IDs passed to deleteAllForUser(), in call order. */
  readonly deleteAllForUserCalls: string[] = [];

  /**
   * Finds a session by its unique identifier.
   *
   * @param id - The SessionId value object to search by
   * @returns The Session if found, or null
   */
  findById(id: SessionId): Promise<Session | null> {
    const session = this.sessions.get(id.toString());
    return Promise.resolve(session ?? null);
  }

  /**
   * Persists a Session entity, overwriting any existing session with the same ID.
   *
   * @param session - The Session entity to save
   * @returns Resolves when the session is stored
   */
  save(session: Session): Promise<void> {
    this.sessions.set(session.sessionId.toString(), session);
    return Promise.resolve();
  }

  /**
   * Deletes a session by its unique identifier and records the call.
   *
   * @param id - The SessionId of the session to delete
   * @returns Resolves when the deletion is complete
   */
  delete(id: SessionId): Promise<void> {
    this.deleteCalls.push(id.toString());
    this.sessions.delete(id.toString());
    return Promise.resolve();
  }

  /**
   * Deletes all sessions for a user and records the call.
   *
   * @param userId - The UserId whose sessions should be deleted
   * @returns Resolves when all matching sessions are deleted
   */
  deleteAllForUser(userId: UserId): Promise<void> {
    this.deleteAllForUserCalls.push(userId.toString());
    for (const [key, session] of this.sessions.entries()) {
      if (session.userId.toString() === userId.toString()) {
        this.sessions.delete(key);
      }
    }
    return Promise.resolve();
  }

  /**
   * Updates the last activity timestamp for a session.
   *
   * If the session is not found, this is a no-op.
   *
   * @param id - The SessionId of the session to update
   * @param now - Current UTC ISO 8601 timestamp
   * @returns Resolves when the update is complete
   */
  updateActivity(id: SessionId, now: string): Promise<void> {
    const session = this.sessions.get(id.toString());
    if (session !== undefined) {
      const updated = Session.reconstitute({
        sessionId: SessionId.fromString(session.sessionId.toString()),
        userId: UserId.fromString(session.userId.toString()),
        csrfToken: CsrfToken.fromString(session.csrfToken.toString()),
        expiresAt: session.expiresAt,
        lastActivityAt: now,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
        createdAt: session.createdAt,
      });
      this.sessions.set(id.toString(), updated);
    }
    return Promise.resolve();
  }

  /**
   * Test helper: adds a session directly to the in-memory store.
   *
   * @param session - The Session entity to add
   */
  addSession(session: Session): void {
    this.sessions.set(session.sessionId.toString(), session);
  }

  /**
   * Test helper: retrieves a session by ID string directly from the store.
   *
   * @param id - The session ID string to look up
   * @returns The Session if found, or undefined
   */
  getById(id: string): Session | undefined {
    return this.sessions.get(id);
  }
}
