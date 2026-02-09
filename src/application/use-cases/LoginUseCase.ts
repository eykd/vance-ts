import { Session } from '../../domain/entities/Session';
import { User } from '../../domain/entities/User';
import { RateLimitError } from '../../domain/errors/RateLimitError';
import { UnauthorizedError } from '../../domain/errors/UnauthorizedError';
import { ValidationError } from '../../domain/errors/ValidationError';
import type { PasswordHasher } from '../../domain/interfaces/PasswordHasher';
import type { RateLimitConfig, RateLimiter } from '../../domain/interfaces/RateLimiter';
import type { SessionRepository } from '../../domain/interfaces/SessionRepository';
import type { TimeProvider } from '../../domain/interfaces/TimeProvider';
import type { UserRepository } from '../../domain/interfaces/UserRepository';
import type { Result } from '../../domain/types/Result';
import { err, ok } from '../../domain/types/Result';
import { CsrfToken } from '../../domain/value-objects/CsrfToken';
import { Email } from '../../domain/value-objects/Email';
import { Password } from '../../domain/value-objects/Password';
import { SessionId } from '../../domain/value-objects/SessionId';
import type { AuthResult } from '../dto/AuthResult';
import type { LoginRequest } from '../dto/LoginRequest';
import { validateRedirectUrl } from '../utils/validateRedirectUrl';

/**
 * Dummy hash used when user is not found to prevent timing attacks.
 * Ensures passwordHasher.verify() is always called regardless of user existence.
 */
const DUMMY_HASH = 'hashed:dummy_value_for_timing';

/** Rate limit configuration for login attempts. */
const LOGIN_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 5,
  windowSeconds: 60,
  blockDurationSeconds: 300,
};

/**
 * Use case for authenticating a user with email and password.
 *
 * Implements security measures including constant-time comparison,
 * account lockout, and open redirect prevention.
 */
export class LoginUseCase {
  private readonly userRepository: UserRepository;
  private readonly sessionRepository: SessionRepository;
  private readonly passwordHasher: PasswordHasher;
  private readonly timeProvider: TimeProvider;
  private readonly rateLimiter: RateLimiter;

  /**
   * Creates a new LoginUseCase instance.
   *
   * @param userRepository - Repository for user persistence
   * @param sessionRepository - Repository for session persistence
   * @param passwordHasher - Service for password hashing and verification
   * @param timeProvider - Provider for current time
   * @param rateLimiter - Service for rate limiting login attempts
   */
  constructor(
    userRepository: UserRepository,
    sessionRepository: SessionRepository,
    passwordHasher: PasswordHasher,
    timeProvider: TimeProvider,
    rateLimiter: RateLimiter
  ) {
    this.userRepository = userRepository;
    this.sessionRepository = sessionRepository;
    this.passwordHasher = passwordHasher;
    this.timeProvider = timeProvider;
    this.rateLimiter = rateLimiter;
  }

  /**
   * Authenticates a user and creates a new session.
   *
   * @param request - The login request containing credentials and metadata
   * @returns Authentication result or validation/unauthorized error
   */
  async execute(
    request: LoginRequest
  ): Promise<Result<AuthResult, ValidationError | UnauthorizedError | RateLimitError>> {
    const redirectTo = validateRedirectUrl(request.redirectTo);
    if (redirectTo === null) {
      return err(
        new ValidationError('Invalid redirect URL', {
          redirectTo: ['Redirect URL must be a relative path'],
        })
      );
    }

    let email: Email;
    try {
      email = Email.create(request.email);
    } catch (error: unknown) {
      /* istanbul ignore else -- Email.create only throws ValidationError */
      if (error instanceof ValidationError) {
        return err(error);
      }
      /* istanbul ignore next */
      throw error;
    }

    let password: Password;
    try {
      password = Password.createUnchecked(request.password);
    } catch (error: unknown) {
      /* istanbul ignore else -- Password.createUnchecked only throws ValidationError */
      if (error instanceof ValidationError) {
        return err(error);
      }
      /* istanbul ignore next */
      throw error;
    }

    const rateLimitResult = await this.rateLimiter.checkLimit(
      email.normalizedValue,
      'login',
      LOGIN_RATE_LIMIT
    );
    if (!rateLimitResult.allowed) {
      return err(
        new RateLimitError('Too many login attempts', rateLimitResult.retryAfterSeconds ?? 300)
      );
    }

    const user = await this.userRepository.findByEmail(email);
    if (user === null) {
      await this.passwordHasher.verify(password.plaintext, DUMMY_HASH);
      return err(new UnauthorizedError('Invalid email or password'));
    }

    const now = this.timeProvider.now();
    const nowIso = new Date(now).toISOString();

    if (user.isLocked(nowIso)) {
      return err(new UnauthorizedError('Account is temporarily locked'));
    }

    const passwordValid = await this.passwordHasher.verify(password.plaintext, user.passwordHash);
    if (!passwordValid) {
      const lockoutExpiry = new Date(now + User.LOCK_DURATION_MS).toISOString();
      const updatedUser = user.recordFailedLogin(nowIso, lockoutExpiry);
      await this.userRepository.save(updatedUser);
      return err(new UnauthorizedError('Invalid email or password'));
    }

    const updatedUser = user.recordSuccessfulLogin(nowIso, request.ipAddress, request.userAgent);
    await this.userRepository.save(updatedUser);

    const sessionId = SessionId.generate();
    const csrfToken = CsrfToken.generate();
    const expiresAt = new Date(now + Session.SESSION_DURATION_MS).toISOString();

    const session = Session.create({
      sessionId,
      userId: user.id,
      csrfToken,
      ipAddress: request.ipAddress,
      userAgent: request.userAgent,
      now: nowIso,
      expiresAt,
    });
    await this.sessionRepository.save(session);

    return ok({
      userId: user.id.toString(),
      sessionId: sessionId.toString(),
      csrfToken: csrfToken.toString(),
      redirectTo,
    });
  }
}
