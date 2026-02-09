import type { SessionRepository } from '../../domain/interfaces/SessionRepository';
import type { Result } from '../../domain/types/Result';
import { ok } from '../../domain/types/Result';
import { SessionId } from '../../domain/value-objects/SessionId';

/**
 * Use case for terminating a user session.
 *
 * Logout is always successful from the user's perspective.
 * Invalid or non-existent session IDs are silently ignored.
 */
export class LogoutUseCase {
  private readonly sessionRepository: SessionRepository;

  /**
   * Creates a new LogoutUseCase instance.
   *
   * @param sessionRepository - Repository for session persistence
   */
  constructor(sessionRepository: SessionRepository) {
    this.sessionRepository = sessionRepository;
  }

  /**
   * Terminates a session by ID.
   *
   * @param sessionId - The session ID string to terminate
   * @returns Always returns ok(undefined)
   */
  async execute(sessionId: string): Promise<Result<void, never>> {
    let sessionIdVO: SessionId;
    try {
      sessionIdVO = SessionId.fromString(sessionId);
    } catch {
      return ok(undefined);
    }

    await this.sessionRepository.delete(sessionIdVO);
    return ok(undefined);
  }
}
