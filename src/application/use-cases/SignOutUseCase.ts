/**
 * SignOutUseCase — orchestrates user sign-out.
 *
 * Delegates sign-out to the {@link AuthService} port and returns the
 * clear-cookie header the handler must forward. Returns a typed result that
 * callers use to construct HTTP responses; never throws.
 *
 * @module
 */

import type { AuthService } from '../ports/AuthService.js';

/**
 * Input DTO for the sign-out use case.
 */
export type SignOutRequest = {
  /** The raw session cookie value from the request (used to identify the session). */
  sessionCookie: string;
};

/**
 * Result type returned by {@link SignOutUseCase.execute}.
 *
 * On success, `clearCookieHeader` is the `Set-Cookie` value that clears the
 * session cookie in the browser. On failure:
 * - `service_error` — infrastructure failure (DB unavailable, etc.)
 */
export type SignOutResult =
  | { ok: true; clearCookieHeader: string }
  | { ok: false; kind: 'service_error' };

/**
 * Orchestrates user sign-out by delegating to the AuthService port.
 *
 * Catches all exceptions from the auth service and returns a typed
 * `service_error` result instead of propagating them.
 */
export class SignOutUseCase {
  /** Auth port interface, injected at construction time. */
  private readonly authService: AuthService;

  /**
   * Creates a new SignOutUseCase.
   *
   * @param authService - Auth service port; implemented by BetterAuthService.
   */
  constructor(authService: AuthService) {
    this.authService = authService;
  }

  /**
   * Executes the sign-out flow.
   *
   * @param request - Sign-out parameters including the session cookie.
   * @returns A typed result; never throws.
   */
  async execute(request: SignOutRequest): Promise<SignOutResult> {
    try {
      return await this.authService.signOut({ sessionCookie: request.sessionCookie });
    } catch {
      return { ok: false, kind: 'service_error' };
    }
  }
}
