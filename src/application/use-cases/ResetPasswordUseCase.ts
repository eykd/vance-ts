/**
 * ResetPasswordUseCase — orchestrates password reset with a verification token.
 *
 * Validates the new password against the common-password list before
 * delegating to the {@link AuthService} port. Never throws.
 *
 * @module
 */

import { COMMON_PASSWORDS } from '../../domain/value-objects/common-passwords.js';
import type { AuthService } from '../ports/AuthService.js';
import type { Logger } from '../ports/Logger.js';

/**
 * Input DTO for the password reset use case.
 */
export type ResetPasswordRequest = {
  /** The verification token from the reset URL. */
  readonly token: string;
  /** The new password to set. */
  readonly newPassword: string;
};

/**
 * Result type returned by {@link ResetPasswordUseCase.execute}.
 *
 * - `invalid_token` — token is invalid, expired, or already used.
 * - `weak_password` — password does not meet strength requirements.
 * - `password_too_common` — password appears in the common passwords list.
 * - `service_error` — infrastructure failure.
 */
export type ResetPasswordResult =
  | { ok: true }
  | {
      ok: false;
      kind: 'invalid_token' | 'weak_password' | 'password_too_common' | 'service_error';
    };

/**
 * Orchestrates password reset with token verification and password validation.
 *
 * Flow:
 * 1. Check password against common-password list (same as sign-up).
 * 2. Delegate to {@link AuthService.resetPassword}.
 * 3. Return typed result.
 */
export class ResetPasswordUseCase {
  /** Auth port interface, injected at construction time. */
  private readonly authService: AuthService;

  /** Logger port interface, injected at construction time. */
  private readonly logger: Logger;

  /**
   * Creates a new ResetPasswordUseCase.
   *
   * @param authService - Auth service port; implemented by BetterAuthService.
   * @param logger - Logger port; implemented by ConsoleLogger.
   */
  constructor(authService: AuthService, logger: Logger) {
    this.authService = authService;
    this.logger = logger;
  }

  /**
   * Executes the password reset flow.
   *
   * @param request - Reset parameters including token and new password.
   * @returns A typed result; never throws.
   */
  async execute(request: ResetPasswordRequest): Promise<ResetPasswordResult> {
    try {
      if (COMMON_PASSWORDS.has(request.newPassword.toLowerCase())) {
        return { ok: false, kind: 'password_too_common' };
      }

      const result = await this.authService.resetPassword({
        token: request.token,
        newPassword: request.newPassword,
      });

      return result;
    } catch (error: unknown) {
      this.logger.error('ResetPasswordUseCase: unexpected error', error);
      return { ok: false, kind: 'service_error' };
    }
  }
}
