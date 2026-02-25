/**
 * SignUpUseCase — orchestrates new account registration.
 *
 * Enforces KV-backed IP rate limiting and delegates credential creation to
 * the {@link AuthService} port. Returns a typed result that callers use to
 * construct HTTP responses; never throws.
 *
 * @module
 */

import type { AuthService } from '../ports/AuthService.js';
import type { RateLimiter } from '../ports/RateLimiter.js';
import { REGISTER_WINDOW_SECONDS } from '../ports/RateLimiter.js';

/**
 * Input DTO for the sign-up use case.
 */
export type SignUpRequest = {
  /** The user's email address. */
  email: string;
  /** The user's plaintext password. */
  password: string;
  /** Client IP address used for rate limit key construction. */
  ip: string;
};

/**
 * Result type returned by {@link SignUpUseCase.execute}.
 *
 * On success, the caller should redirect to sign-in. On failure, `kind`
 * identifies the error category:
 * - `email_taken` — an account with this email already exists
 * - `weak_password` — the password does not meet strength requirements
 * - `rate_limited` — IP has exceeded the allowed attempt window
 * - `service_error` — infrastructure failure (DB unavailable, etc.)
 */
export type SignUpResult =
  | { ok: true }
  | {
      ok: false;
      kind: 'email_taken' | 'weak_password' | 'rate_limited' | 'service_error';
      retryAfter?: number;
    };

/**
 * Orchestrates email/password registration with IP rate limiting.
 *
 * Flow:
 * 1. Check KV rate limiter for the client IP; reject with `rate_limited` if exceeded.
 * 2. Derive `name` from the email prefix (required by better-auth v1.4.x).
 * 3. Delegate to {@link AuthService.signUp}; adapter maps better-auth responses to types.
 * 4. Increment the KV counter on `email_taken` or `weak_password` to enforce the window.
 *    Counter is not incremented on infrastructure errors, rate limits, or successes.
 *
 * @example
 * ```typescript
 * const useCase = new SignUpUseCase(authService, rateLimiter);
 * const result = await useCase.execute({ email, password, ip });
 * if (result.ok) {
 *   return redirect('/auth/sign-in?registered=true');
 * }
 * ```
 */
export class SignUpUseCase {
  /** Auth port interface, injected at construction time. */
  private readonly authService: AuthService;

  /** Rate limiter port interface, injected at construction time. */
  private readonly rateLimiter: RateLimiter;

  /**
   * Creates a new SignUpUseCase.
   *
   * @param authService - Auth service port; implemented by BetterAuthService.
   * @param rateLimiter - Rate limiter port; implemented by KvRateLimiter.
   */
  constructor(authService: AuthService, rateLimiter: RateLimiter) {
    this.authService = authService;
    this.rateLimiter = rateLimiter;
  }

  /**
   * Executes the sign-up flow.
   *
   * @param request - Registration details and client IP address.
   * @returns A typed result; never throws.
   */
  async execute(request: SignUpRequest): Promise<SignUpResult> {
    try {
      const key = `ratelimit:register:${request.ip}`;

      const rateCheck = await this.rateLimiter.check(key);
      if (!rateCheck.allowed) {
        return { ok: false, kind: 'rate_limited', retryAfter: rateCheck.retryAfter };
      }

      const name = request.email.split('@')[0] ?? request.email;

      const result = await this.authService.signUp({
        email: request.email,
        password: request.password,
        name,
        ip: request.ip,
      });

      if (!result.ok && (result.kind === 'email_taken' || result.kind === 'weak_password')) {
        await this.rateLimiter.increment(key, REGISTER_WINDOW_SECONDS);
      }

      return result;
    } catch {
      return { ok: false, kind: 'service_error' };
    }
  }
}
