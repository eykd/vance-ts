/**
 * requireAuth middleware — session validation for protected routes.
 *
 * Creates a Hono middleware that validates the session token on every request
 * to protected routes. Redirects unauthenticated requests to the sign-in page,
 * preserving the original URL via `redirectTo`. Returns 503 on D1 errors.
 *
 * @module
 */

import type { Context, Next } from 'hono';

import type { AuthService } from '../../application/ports/AuthService.js';
import type { AppEnv } from '../types.js';
import {
  buildCsrfCookie,
  clearAuthIndicatorCookie,
  clearSessionCookie,
  deriveCsrfToken,
  extractSessionToken,
  hasSessionCookie,
} from '../utils/cookieBuilder.js';

/**
 * Creates a Hono middleware that guards routes behind session authentication.
 *
 * Extracts the session token from the request cookies and validates it via the
 * AuthService port. If no session cookie is present, redirects immediately to
 * `/auth/sign-in`. If the token is present but invalid/expired, clears the
 * stale cookie and redirects. On D1 error, returns 503 with `Retry-After: 30`.
 * On success, derives a session-bound CSRF token via HMAC-SHA256, sets the
 * `__Host-csrf` cookie, and populates `c.var.user`, `c.var.session`, and
 * `c.var.csrfToken` for downstream handlers.
 *
 * @param authService - The AuthService port for session validation.
 * @param secret - The BETTER_AUTH_SECRET for HMAC-SHA256 CSRF derivation.
 * @returns A Hono middleware function for use with `app.use()`.
 */
export function createRequireAuth(
  authService: AuthService,
  secret: string
): (c: Context<AppEnv>, next: Next) => Promise<Response | void> {
  return async function requireAuth(c: Context<AppEnv>, next: Next): Promise<Response | void> {
    const url = new URL(c.req.url);
    const redirectTo = encodeURIComponent(url.pathname + url.search);
    const cookieHeader = c.req.header('Cookie') ?? '';

    const sessionToken = extractSessionToken(cookieHeader);
    if (sessionToken === null) {
      return c.redirect(`/auth/sign-in?redirectTo=${redirectTo}`, 302);
    }

    let session: Awaited<ReturnType<AuthService['getSession']>>;
    try {
      session = await authService.getSession({ sessionToken });
    } catch {
      // D1 or infrastructure error: signal temporary unavailability
      return new Response('Service Unavailable', {
        status: 503,
        headers: { 'Retry-After': '30' },
      });
    }

    if (session === null) {
      if (hasSessionCookie(cookieHeader)) {
        c.header('Set-Cookie', clearSessionCookie());
      }
      if (cookieHeader.includes('auth_status=')) {
        c.header('Set-Cookie', clearAuthIndicatorCookie(), { append: true });
      }
      return c.redirect(`/auth/sign-in?redirectTo=${redirectTo}`, 302);
    }

    // Derive a session-bound CSRF token via two-step HMAC-SHA256:
    //   csrfSubKey = HMAC(masterSecret, 'csrf-v1')
    //   csrfToken  = HMAC(csrfSubKey, "csrf:v1:{sessionToken}")
    // The dedicated sub-key enforces key separation; the domain prefix further
    // prevents cross-protocol confusion within the CSRF domain.
    // Deterministic per session — consistent across multi-tab usage, no KV storage required.
    const csrfToken = await deriveCsrfToken(`csrf:v1:${session.session.token}`, secret);
    c.header('Set-Cookie', buildCsrfCookie(csrfToken), { append: true });
    c.set('user', session.user);
    c.set('session', session.session);
    c.set('csrfToken', csrfToken);
    await next();
  };
}
