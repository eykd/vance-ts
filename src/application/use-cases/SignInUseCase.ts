/**
 * SignInUseCase — orchestrates email/password sign-in.
 *
 * Enforces KV-backed IP rate limiting before delegating credential
 * verification to the {@link AuthService} port. Returns a typed result
 * that callers use to construct HTTP responses; never throws.
 *
 * @module
 */

import { verifyPassword } from '../../domain/services/passwordHasher.js';
import { toHex } from '../../shared/hex.js';
import type { AuthService } from '../ports/AuthService.js';
import type { RateLimiter } from '../ports/RateLimiter.js';
import { SIGN_IN_WINDOW_SECONDS } from '../ports/RateLimiter.js';

/**
 * Generates a randomly-salted dummy Argon2id hash string at module load time.
 *
 * The hash is in `argon2id$<memory_kb>$<time_cost>$<parallelism>$<salt-hex>$<filler-hex>`
 * format so that {@link verifyPassword} performs a full Argon2id computation
 * against it, equalising response time for non-existent-email vs wrong-password
 * paths (timing oracle defence, FR-007).
 *
 * Using fresh random bytes for both salt and filler ensures the value differs
 * on every Worker deployment, eliminating the timing-attack surface that a
 * hardcoded public constant would expose.
 *
 * @returns A valid-format Argon2id hash string with a fresh random salt.
 */
function generateDummyHash(): string {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const filler = crypto.getRandomValues(new Uint8Array(32));
  return `argon2id$19456$2$1$${toHex(salt)}$${toHex(filler)}`;
}

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
  /**
   * Per-startup Argon2id dummy hash for timing oracle defence (FR-007).
   *
   * `verifyPassword(submittedPassword, DUMMY_HASH)` is called on every
   * non-rate-limited authentication failure so that the "email not found"
   * (fast DB miss) code path takes the same wall-clock time as "email
   * found, wrong password" (full Argon2id computation), preventing
   * timing-based email enumeration attacks.
   *
   * Generated once at module load with a fresh random salt — changes per
   * deployment so the value is never observable in source code or binaries.
   */
  static readonly DUMMY_HASH = generateDummyHash();

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
    try {
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

      // Timing oracle defence — run Argon2id on every non-rate-limited failure (FR-007)
      if (!result.ok && result.kind !== 'rate_limited') {
        await verifyPassword(request.password, SignInUseCase.DUMMY_HASH);
      }

      return result;
    } catch {
      return { ok: false, kind: 'service_error' };
    }
  }
}
