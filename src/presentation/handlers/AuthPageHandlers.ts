/**
 * AuthPageHandlers — HTTP handlers for HTML-rendered auth pages.
 *
 * Handles sign-in form rendering (GET) and submission (POST). Enforces
 * CSRF protection, input validation, and timing oracle defence (FR-007).
 *
 * @module
 */

import type { SignInUseCase } from '../../application/use-cases/SignInUseCase.js';
import { verifyPassword } from '../../domain/services/passwordHasher.js';
import { loginPage } from '../templates/pages/login.js';
import {
  buildCsrfCookie,
  clearCsrfCookie,
  extractCsrfTokenFromCookies,
  generateCsrfToken,
} from '../utils/cookieBuilder.js';
import { extractClientIp } from '../utils/extractClientIp.js';
import { validateRedirectTo } from '../utils/redirectValidator.js';
import { applySecurityHeaders } from '../utils/securityHeaders.js';

/** Maximum allowed body size for HTML auth form submissions, in bytes (4 KB). */
const MAX_BODY_BYTES = 4096;

/**
 * HTTP handlers for HTML-rendered auth pages.
 *
 * Coordinates sign-in form rendering (GET) and form submission (POST).
 * Use case instances are injected at construction time; this class never
 * depends on infrastructure directly.
 */
export class AuthPageHandlers {
  /**
   * Pre-computed PBKDF2 dummy hash for timing oracle defence (FR-007).
   *
   * `verifyPassword(submittedPassword, DUMMY_HASH)` is called on every
   * non-rate-limited authentication failure so that the "email not found"
   * (~5 ms DB miss) code path takes the same wall-clock time as "email
   * found, wrong password" (~30 ms PBKDF2), preventing timing-based
   * email enumeration attacks.
   */
  static readonly DUMMY_HASH =
    'pbkdf2$600000$d4e2f8056a3b7c91d4e2f8056a3b7c91$5f3a9b7c1e4d2a8f6b0c5e9d3a7f2b1e4c8d0a6f9e3c7b5a1f4e8d2c6a0f4e98';

  /** Injected sign-in use case. */
  private readonly signInUseCase: SignInUseCase;

  /**
   * Creates a new AuthPageHandlers instance.
   *
   * @param signInUseCase - The sign-in orchestration use case.
   */
  constructor(signInUseCase: SignInUseCase) {
    this.signInUseCase = signInUseCase;
  }

  /**
   * Handles GET /auth/sign-in.
   *
   * Generates a fresh CSRF token, stores it in the `__Secure-csrf` cookie,
   * and renders the sign-in form. Sets `Cache-Control: no-store, no-cache`
   * to prevent caching of the CSRF-bearing response.
   *
   * @param request - The incoming HTTP request.
   * @returns A 200 HTML response with Set-Cookie and Cache-Control headers.
   */
  handleGetSignIn(request: Request): Response {
    const url = new URL(request.url);
    const registeredSuccess = url.searchParams.get('registered') === 'true';
    const redirectTo = url.searchParams.get('redirectTo') ?? undefined;

    const csrfToken = generateCsrfToken();
    const headers = new Headers();
    headers.set('Content-Type', 'text/html; charset=utf-8');
    headers.set('Set-Cookie', buildCsrfCookie(csrfToken));
    headers.set('Cache-Control', 'no-store, no-cache');
    applySecurityHeaders(headers);

    return new Response(loginPage({ csrfToken, redirectTo, registeredSuccess }), { headers });
  }

  /**
   * Handles POST /auth/sign-in.
   *
   * Validates Content-Type, body size, and CSRF token before delegating to
   * {@link SignInUseCase}. On success, forwards the session cookie and
   * issues a 303 redirect. On any non-rate-limited authentication failure,
   * runs PBKDF2 via {@link verifyPassword} against {@link DUMMY_HASH} to
   * equalise response timing and prevent email enumeration (FR-007).
   *
   * @param request - The incoming HTTP request.
   * @returns The appropriate HTTP response.
   */
  async handlePostSignIn(request: Request): Promise<Response> {
    const contentType = request.headers.get('Content-Type') ?? '';
    if (!contentType.includes('application/x-www-form-urlencoded')) {
      return new Response('Unsupported Media Type', { status: 415 });
    }

    const rawBody = await request.text();
    if (rawBody.length > MAX_BODY_BYTES) {
      return new Response('Content Too Large', { status: 413 });
    }

    const form = new URLSearchParams(rawBody);
    const csrfFormToken = form.get('_csrf') ?? '';
    const csrfCookieToken = extractCsrfTokenFromCookies(request.headers.get('Cookie'));

    if (csrfCookieToken === null || csrfFormToken !== csrfCookieToken) {
      return new Response('Forbidden', { status: 403 });
    }

    const email = form.get('email') ?? '';
    const password = form.get('password') ?? '';
    const redirectTo = validateRedirectTo(form.get('redirectTo'));
    const ip = extractClientIp(request);

    const result = await this.signInUseCase.execute({ email, password, ip });

    if (result.ok) {
      const headers = new Headers();
      headers.set('Location', redirectTo);
      headers.append('Set-Cookie', result.sessionCookie);
      headers.append('Set-Cookie', clearCsrfCookie());
      return new Response(null, { status: 303, headers });
    }

    if (result.kind === 'rate_limited') {
      const headers = new Headers();
      if (result.retryAfter !== undefined) {
        headers.set('Retry-After', String(result.retryAfter));
      }
      return new Response('Too Many Requests', { status: 429, headers });
    }

    // Timing oracle defence — run PBKDF2 on every non-rate-limited failure (FR-007)
    await verifyPassword(password, AuthPageHandlers.DUMMY_HASH);

    const csrfToken = generateCsrfToken();
    const errorHeaders = new Headers();
    errorHeaders.set('Content-Type', 'text/html; charset=utf-8');
    errorHeaders.set('Set-Cookie', buildCsrfCookie(csrfToken));
    errorHeaders.set('Cache-Control', 'no-store, no-cache');
    applySecurityHeaders(errorHeaders);

    const body = loginPage({
      csrfToken,
      email,
      error: 'Invalid email or password',
      redirectTo: redirectTo !== '/' ? redirectTo : undefined,
    });

    return new Response(body, { headers: errorHeaders });
  }
}
