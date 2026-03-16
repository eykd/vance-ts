/**
 * SignUpUseCase — orchestrates new account registration.
 *
 * Enforces KV-backed IP rate limiting and delegates credential creation to
 * the {@link AuthService} port. Returns a typed result that callers use to
 * construct HTTP responses; never throws.
 *
 * @module
 */

import { COMMON_PASSWORDS } from '../../domain/value-objects/common-passwords.js';
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
 * identifies the error category and its origin:
 * - `email_taken` — an account with this email already exists (from `AuthService.signUp`)
 * - `weak_password` — password too short/long per auth config (from `AuthService.signUp`)
 * - `password_too_common` — password is in the OWASP blocklist (detected in this use case)
 * - `rate_limited` — IP exceeded the allowed attempt window (`RateLimiter` or `AuthService`)
 * - `service_error` — infrastructure failure, e.g. DB unavailable (`AuthService` or `RateLimiter`)
 */
export type SignUpResult =
  | { ok: true }
  | {
      ok: false;
      kind:
        | 'email_taken'
        | 'weak_password'
        | 'password_too_common'
        | 'rate_limited'
        | 'service_error';
      retryAfter?: number;
    };

/**
 * Orchestrates email/password registration with IP rate limiting.
 *
 * Flow:
 * 1. Atomically check-and-increment the rate limiter for the client IP in a single DO call;
 * reject with `rate_limited` if the limit is exceeded (counter unchanged on rejection).
 * 2. Check the password against the common-password blocklist; reject with
 * `password_too_common` if found (better-auth v1.4.x provides no validate hook).
 * 3. Derive `name` from the email prefix (required by better-auth v1.4.x).
 * 4. Delegate to {@link AuthService.signUp}; adapter maps better-auth responses to types.
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

      const rateCheck = await this.rateLimiter.checkAndIncrement(key, REGISTER_WINDOW_SECONDS);
      if (!rateCheck.allowed) {
        return { ok: false, kind: 'rate_limited', retryAfter: rateCheck.retryAfter };
      }

      if (COMMON_PASSWORDS.has(request.password.toLowerCase())) {
        return { ok: false, kind: 'password_too_common' };
      }

      // noUncheckedIndexedAccess: split('@')[0] is always defined; undefined check is unreachable.
      const prefix = request.email.split('@')[0];
      const name = prefix !== undefined && prefix !== '' ? prefix : request.email;

      const result = await this.authService.signUp({
        email: request.email,
        password: request.password,
        name,
      });

      return result;
    } catch {
      return { ok: false, kind: 'service_error' };
    }
  }
}
