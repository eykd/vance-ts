import type { Session } from '../entities/Session';
import type { SessionId } from '../value-objects/SessionId';

/**
 * Port defining how the domain expects to persist and retrieve Session entities.
 *
 * Implementations live in the infrastructure layer (e.g., KVSessionRepository).
 */
export interface SessionRepository {
  /**
   * Finds a session by its unique identifier.
   *
   * @param id - The SessionId value object to search by
   * @returns The Session entity if found, or null
   */
  findById(id: SessionId): Promise<Session | null>;

  /**
   * Persists a Session entity (insert or update).
   *
   * @param session - The Session entity to save
   */
  save(session: Session): Promise<void>;

  /**
   * Deletes a session by its unique identifier.
   *
   * @param id - The SessionId of the session to delete
   */
  delete(id: SessionId): Promise<void>;

  /**
   * Deletes all sessions belonging to a specific user.
   *
   * @param userId - The user ID whose sessions should be deleted
   */
  deleteAllForUser(userId: string): Promise<void>;

  /**
   * Updates the last activity timestamp for a session.
   *
   * @param id - The SessionId of the session to update
   * @param now - Current UTC ISO 8601 timestamp
   */
  updateActivity(id: SessionId, now: string): Promise<void>;
}
