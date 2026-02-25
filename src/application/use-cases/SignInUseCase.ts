/**
 * SignInUseCase — orchestrates email/password sign-in.
 *
 * Enforces KV-backed IP rate limiting before delegating credential
 * verification to the {@link AuthService} port. Returns a typed result
 * that callers use to construct HTTP responses; never throws.
 *
 * @module
 */

import type { AuthService } from '../ports/AuthService.js';
import type { RateLimiter } from '../ports/RateLimiter.js';
import { SIGN_IN_WINDOW_SECONDS } from '../ports/RateLimiter.js';

/**
 * Input DTO for the sign-in use case.
 */
export type SignInRequest = {
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
 * On success, `sessionCookie` is the raw `Set-Cookie` header value from
 * better-auth that the handler must forward to the browser. On failure,
 * `kind` identifies the error category:
 * - `invalid_credentials` — wrong email or password
 * - `rate_limited` — IP has exceeded the allowed attempt window
 * - `service_error` — infrastructure failure (DB unavailable, etc.)
 */
export type SignInResult =
  | { ok: true; sessionCookie: string }
  | {
      ok: false;
      kind: 'invalid_credentials' | 'rate_limited' | 'service_error';
      retryAfter?: number;
    };

/**
 * Orchestrates email/password sign-in with IP rate limiting.
 *
 * Flow:
 * 1. Check KV rate limiter for the client IP; reject with `rate_limited` if exceeded.
 * 2. Delegate to {@link AuthService.signIn}; adapter maps better-auth responses to types.
 * 3. Increment the KV counter on `invalid_credentials` to enforce the brute-force window.
 * Counter is not incremented on infrastructure errors or successes.
 *
 * @example
 * ```typescript
 * const useCase = new SignInUseCase(authService, rateLimiter);
 * const result = await useCase.execute({ email, password, ip });
 * if (result.ok) {
 *   response.headers.set('Set-Cookie', result.sessionCookie);
 * }
 * ```
 */
export class SignInUseCase {
  /** Auth port interface, injected at construction time. */
  private readonly authService: AuthService;

  /** Rate limiter port interface, injected at construction time. */
  private readonly rateLimiter: RateLimiter;

  /**
   * Creates a new SignInUseCase.
   *
   * @param authService - Auth service port; implemented by BetterAuthService.
   * @param rateLimiter - Rate limiter port; implemented by KvRateLimiter.
   */
  constructor(authService: AuthService, rateLimiter: RateLimiter) {
    this.authService = authService;
    this.rateLimiter = rateLimiter;
  }

  /**
   * Executes the sign-in flow.
   *
   * @param request - Sign-in credentials and client IP address.
   * @returns A typed result; never throws.
   */
  async execute(request: SignInRequest): Promise<SignInResult> {
    const key = `ratelimit:sign-in:${request.ip}`;

    const rateCheck = await this.rateLimiter.check(key);
    if (!rateCheck.allowed) {
      return { ok: false, kind: 'rate_limited', retryAfter: rateCheck.retryAfter };
    }

    const result = await this.authService.signIn({
      email: request.email,
      password: request.password,
      ip: request.ip,
    });

    if (!result.ok && result.kind === 'invalid_credentials') {
      await this.rateLimiter.increment(key, SIGN_IN_WINDOW_SECONDS);
    }

    return result;
  }
}
