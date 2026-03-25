/**
 * RequestPasswordResetUseCase — orchestrates password reset requests.
 *
 * Enforces per-IP rate limiting before delegating to the {@link AuthService}
 * port. Always returns success to the caller to prevent email enumeration
 * (FR-007). Never throws.
 *
 * @module
 */

import type { AuthService } from '../ports/AuthService.js';
import type { Logger } from '../ports/Logger.js';
import type { RateLimiter } from '../ports/RateLimiter.js';

/** Rate limit window for password reset requests (15 minutes). */
const RESET_WINDOW_SECONDS = 900;

/** Maximum password reset requests per IP within the window. */
const RESET_MAX_ATTEMPTS = 5;

/**
 * Input DTO for the password reset request use case.
 */
export type RequestPasswordResetRequest = {
  /** The email address requesting the password reset. */
  readonly email: string;
  /** Client IP address used for rate limit key construction. */
  readonly ip: string;
};

/**
 * Result type returned by {@link RequestPasswordResetUseCase.execute}.
 *
 * `rate_limited` — IP has exceeded the allowed attempt window.
 * Success is returned for all non-rate-limited requests, even if the
 * email doesn't exist, to prevent email enumeration.
 */
export type RequestPasswordResetResult =
  | { ok: true }
  | { ok: false; kind: 'rate_limited'; retryAfter?: number };

/**
 * Orchestrates password reset requests with per-IP rate limiting.
 *
 * Flow:
 * 1. Check per-IP rate limit; reject with `rate_limited` if exceeded.
 * 2. Delegate to {@link AuthService.requestPasswordReset}.
 * 3. Return success regardless of outcome (anti-enumeration).
 */
export class RequestPasswordResetUseCase {
  /** Auth port interface, injected at construction time. */
  private readonly authService: AuthService;

  /** Rate limiter port interface, injected at construction time. */
  private readonly rateLimiter: RateLimiter;

  /** Logger port interface, injected at construction time. */
  private readonly logger: Logger;

  /**
   * Creates a new RequestPasswordResetUseCase.
   *
   * @param authService - Auth service port; implemented by BetterAuthService.
   * @param rateLimiter - Rate limiter port; implemented by DurableObjectRateLimiter.
   * @param logger - Logger port; implemented by ConsoleLogger.
   */
  constructor(authService: AuthService, rateLimiter: RateLimiter, logger: Logger) {
    this.authService = authService;
    this.rateLimiter = rateLimiter;
    this.logger = logger;
  }

  /**
   * Executes the password reset request flow.
   *
   * @param request - Reset request parameters and client IP.
   * @returns A typed result; never throws.
   */
  async execute(request: RequestPasswordResetRequest): Promise<RequestPasswordResetResult> {
    try {
      const ipKey = `ratelimit:password-reset:${request.ip}`;
      const rateCheck = await this.rateLimiter.checkAndIncrement(
        ipKey,
        RESET_WINDOW_SECONDS,
        RESET_MAX_ATTEMPTS
      );
      if (!rateCheck.allowed) {
        return { ok: false, kind: 'rate_limited', retryAfter: rateCheck.retryAfter };
      }

      await this.authService.requestPasswordReset({
        email: request.email,
        redirectTo: '/auth/reset-password',
      });

      // Always return success to prevent email enumeration (FR-007).
      // The auth service handles timing-safe responses internally.
      return { ok: true };
    } catch (error: unknown) {
      this.logger.error('RequestPasswordResetUseCase: unexpected error', error);
      // Still return success to prevent information leakage
      return { ok: true };
    }
  }
}
