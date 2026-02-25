/**
 * SignUpUseCase — orchestrates new account registration.
 *
 * Enforces KV-backed IP rate limiting and delegates credential creation to
 * the {@link AuthService} port. Returns a typed result that callers use to
 * construct HTTP responses; never throws.
 *
 * NOTE: Stub implementation — full logic to be completed in tb-ltk.6.9.2.
 *
 * @module
 */

import type { AuthService } from '../ports/AuthService.js';
import type { RateLimiter } from '../ports/RateLimiter.js';

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
 * Stub implementation — to be completed in tb-ltk.6.9.2.
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
   * @param _request - Registration details and client IP address.
   * @returns A typed result; never throws.
   */
  async execute(_request: SignUpRequest): Promise<SignUpResult> {
    // Stub — implementation in tb-ltk.6.9.2
    void this.authService;
    void this.rateLimiter;
    return { ok: false, kind: 'service_error' };
  }
}
