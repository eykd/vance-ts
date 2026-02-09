import { UnauthorizedError } from '../../domain/errors/UnauthorizedError';
import type { SessionRepository } from '../../domain/interfaces/SessionRepository';
import type { TimeProvider } from '../../domain/interfaces/TimeProvider';
import type { UserRepository } from '../../domain/interfaces/UserRepository';
import type { Result } from '../../domain/types/Result';
import { err, ok } from '../../domain/types/Result';
import { SessionId } from '../../domain/value-objects/SessionId';
import type { UserResponse } from '../dto/UserResponse';

/**
 * Use case for retrieving the currently authenticated user's profile.
 *
 * Validates the session and maps the User entity to a UserResponse DTO.
 */
export class GetCurrentUserUseCase {
  private readonly userRepository: UserRepository;
  private readonly sessionRepository: SessionRepository;
  private readonly timeProvider: TimeProvider;

  /**
   * Creates a new GetCurrentUserUseCase instance.
   *
   * @param userRepository - Repository for user persistence
   * @param sessionRepository - Repository for session persistence
   * @param timeProvider - Provider for current time
   */
  constructor(
    userRepository: UserRepository,
    sessionRepository: SessionRepository,
    timeProvider: TimeProvider
  ) {
    this.userRepository = userRepository;
    this.sessionRepository = sessionRepository;
    this.timeProvider = timeProvider;
  }

  /**
   * Retrieves the current user's profile from a session ID.
   *
   * @param sessionId - The session ID string to look up
   * @returns The user profile or an unauthorized error
   */
  async execute(sessionId: string): Promise<Result<UserResponse, UnauthorizedError>> {
    let sessionIdVO: SessionId;
    try {
      sessionIdVO = SessionId.fromString(sessionId);
    } catch {
      return err(new UnauthorizedError('Invalid session'));
    }

    const session = await this.sessionRepository.findById(sessionIdVO);
    if (session === null) {
      return err(new UnauthorizedError('Invalid session'));
    }

    const nowIso = new Date(this.timeProvider.now()).toISOString();
    if (session.isExpired(nowIso)) {
      return err(new UnauthorizedError('Session expired'));
    }

    const user = await this.userRepository.findById(session.userId);
    if (user === null) {
      return err(new UnauthorizedError('Invalid session'));
    }

    return ok({
      id: user.id.toString(),
      email: user.email.value,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    });
  }
}
