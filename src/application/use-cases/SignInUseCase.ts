/**
 * SignInUseCase — orchestrates email/password sign-in.
 *
 * Enforces both per-email (FR-006) and per-IP rate limiting before
 * delegating credential verification to the {@link AuthService} port.
 * Returns a typed result that callers use to construct HTTP responses;
 * never throws.
 *
 * @module
 */

import type { AuthService } from '../ports/AuthService.js';
import type { Logger } from '../ports/Logger.js';
import type { RateLimiter } from '../ports/RateLimiter.js';
import {
  MAX_ATTEMPTS,
  SIGN_IN_EMAIL_MAX_ATTEMPTS,
  SIGN_IN_EMAIL_WINDOW_SECONDS,
  SIGN_IN_WINDOW_SECONDS,
} from '../ports/RateLimiter.js';

/**
 * Input DTO for the sign-in use case.
 */
type SignInRequest = {
  /** The user's email address. */
  email: string;
  /** The user's plaintext password. */
  password: string;
  /** Client IP address used for rate limit key construction. */
  ip: string;
};

/**
 * Result type returned by {@link SignInUseCase.execute}.
 *
 * On success, `sessionToken` is the opaque session token that the presentation
 * layer uses to construct a `Set-Cookie` header via `buildSessionCookie`. On
 * failure, `kind` identifies the error category:
 * - `invalid_credentials` — wrong email or password
 * - `rate_limited` — IP or email has exceeded the allowed attempt window
 * - `service_error` — infrastructure failure (DB unavailable, etc.)
 */
type SignInResult =
  | { ok: true; sessionToken: string }
  | {
      ok: false;
      kind: 'invalid_credentials' | 'rate_limited' | 'service_error';
      retryAfter?: number;
    };

/**
 * Orchestrates email/password sign-in with per-email and per-IP rate limiting.
 *
 * Flow:
 * 1. Atomically check-and-increment the per-email counter (FR-006); reject with
 * `rate_limited` if ≥ 10 attempts within 60 minutes. The atomic operation eliminates the
 * TOCTOU race between a separate check and increment during the Argon2id window.
 * 2. Atomically check-and-increment the rate limiter for the client IP in a single DO call;
 * reject with `rate_limited` if the limit is exceeded (counter unchanged on rejection).
 * 3. Delegate to {@link AuthService.signIn}; adapter maps better-auth responses to types.
 * 4. Run timing-oracle defence on non-rate-limited failures (FR-007).
 *
 * @example
 * ```typescript
 * const useCase = new SignInUseCase(authService, rateLimiter, logger);
 * const result = await useCase.execute({ email, password, ip });
 * if (result.ok) {
 *   response.headers.set('Set-Cookie', buildSessionCookie(result.sessionToken));
 * }
 * ```
 */
export class SignInUseCase {
  /** Auth port interface, injected at construction time. */
  private readonly authService: AuthService;

  /** Rate limiter port interface, injected at construction time. */
  private readonly rateLimiter: RateLimiter;

  /** Logger port interface, injected at construction time. */
  private readonly logger: Logger;

  /**
   * Creates a new SignInUseCase.
   *
   * @param authService - Auth service port; implemented by BetterAuthService.
   * @param rateLimiter - Rate limiter port; implemented by KvRateLimiter.
   * @param logger - Logger port; implemented by ConsoleLogger.
   */
  constructor(authService: AuthService, rateLimiter: RateLimiter, logger: Logger) {
    this.authService = authService;
    this.rateLimiter = rateLimiter;
    this.logger = logger;
  }

  /**
   * Executes the sign-in flow.
   *
   * @param request - Sign-in credentials and client IP address.
   * @returns A typed result; never throws.
   */
  async execute(request: SignInRequest): Promise<SignInResult> {
    try {
      // Per-email rate limit (FR-006): atomic check-and-increment eliminates the
      // TOCTOU race between a separate check and increment. Successful logins also
      // consume one attempt slot; max overshoot is min(concurrentRequests, windowCapacity).
      const emailKey = `ratelimit:sign-in-email:${request.email.toLowerCase()}`;
      const emailCheck = await this.rateLimiter.checkAndIncrement(
        emailKey,
        SIGN_IN_EMAIL_WINDOW_SECONDS,
        SIGN_IN_EMAIL_MAX_ATTEMPTS
      );
      if (!emailCheck.allowed) {
        return { ok: false, kind: 'rate_limited', retryAfter: emailCheck.retryAfter };
      }

      // Per-IP rate limit (atomic check-and-increment)
      const ipKey = `ratelimit:sign-in:${request.ip}`;
      const rateCheck = await this.rateLimiter.checkAndIncrement(
        ipKey,
        SIGN_IN_WINDOW_SECONDS,
        MAX_ATTEMPTS
      );
      if (!rateCheck.allowed) {
        return { ok: false, kind: 'rate_limited', retryAfter: rateCheck.retryAfter };
      }

      const result = await this.authService.signIn({
        email: request.email,
        password: request.password,
      });

      // Timing oracle defence — run Argon2id on every non-rate-limited failure (FR-007)
      if (!result.ok && result.kind !== 'rate_limited') {
        // Intentional: return value discarded; only the Argon2id timing side-effect matters.
        await this.authService.verifyDummyPassword(request.password);
      }

      return result;
    } catch (error: unknown) {
      this.logger.error('SignInUseCase: unexpected error during sign-in', error);
      return { ok: false, kind: 'service_error' };
    }
  }
}
