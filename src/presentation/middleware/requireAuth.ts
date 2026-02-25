/**
 * requireAuth middleware — session validation for protected routes.
 *
 * Creates a Hono middleware that validates the session cookie on every request
 * to protected routes. Redirects unauthenticated requests to the sign-in page,
 * preserving the original URL via `redirectTo`.
 *
 * NOTE: Stub implementation — full logic to be completed in tb-ltk.6.12.1.
 *
 * @module
 */

import type { Context, Next } from 'hono';

import type { AuthService } from '../../application/ports/AuthService.js';
import type { AppEnv } from '../types.js';

/**
 * Creates a Hono middleware that guards routes behind session authentication.
 *
 * Validates the session from request cookies via the AuthService port. On
 * failure, redirects to `/auth/sign-in` with the original URL preserved as
 * `redirectTo`. On success, populates `c.var.user`, `c.var.session`, and
 * `c.var.csrfToken` for downstream handlers.
 *
 * Stub implementation — to be completed in tb-ltk.6.12.1.
 *
 * @param authService - The AuthService port for session validation.
 * @param _secret - The BETTER_AUTH_SECRET for HMAC-SHA256 CSRF derivation.
 * @returns A Hono middleware function for use with `app.use()`.
 */
export function createRequireAuth(
  authService: AuthService,
  _secret: string
): (c: Context<AppEnv>, next: Next) => Promise<Response | void> {
  return async function requireAuth(c: Context<AppEnv>, next: Next): Promise<Response | void> {
    // Stub — implementation in tb-ltk.6.12.1
    const session = await authService.getSession({ headers: c.req.raw.headers });
    if (session === null) {
      const url = new URL(c.req.url);
      const redirectTo = encodeURIComponent(url.pathname + url.search);
      return c.redirect(`/auth/sign-in?redirectTo=${redirectTo}`, 302);
    }
    await next();
  };
}
