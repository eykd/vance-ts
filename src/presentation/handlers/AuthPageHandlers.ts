/**
 * AuthPageHandlers — HTTP handlers for HTML-rendered auth pages.
 *
 * Handles sign-in form rendering (GET) and submission (POST). Enforces
 * CSRF protection, input validation, and timing oracle defence (FR-007).
 *
 * @module
 */

import type { RequestPasswordResetUseCase } from '../../application/use-cases/RequestPasswordResetUseCase.js';
import type { ResetPasswordUseCase } from '../../application/use-cases/ResetPasswordUseCase.js';
import type { SignInUseCase } from '../../application/use-cases/SignInUseCase.js';
import type { SignOutUseCase } from '../../application/use-cases/SignOutUseCase.js';
import type { SignUpUseCase } from '../../application/use-cases/SignUpUseCase.js';
import { forgotPasswordPage } from '../templates/pages/forgotPassword.js';
import { loginPage } from '../templates/pages/login.js';
import { rateLimitPage } from '../templates/pages/rateLimit.js';
import { registerPage } from '../templates/pages/register.js';
import { resetPasswordPage } from '../templates/pages/resetPassword.js';
import { signOutPage } from '../templates/pages/signOut.js';
import {
  buildAuthIndicatorCookie,
  buildCsrfCookie,
  buildSessionCookie,
  clearAuthIndicatorCookie,
  clearCsrfCookie,
  clearSessionCookie,
  extractCsrfTokenFromCookies,
  extractSessionToken,
  generateCsrfToken,
  hasSessionCookie,
} from '../utils/cookieBuilder.js';
import { extractClientIp } from '../utils/extractClientIp.js';
import { validateRedirectTo } from '../utils/redirectValidator.js';
import { applySecurityHeaders } from '../utils/securityHeaders.js';
import { timingSafeStringEqual } from '../utils/timingSafeEqual.js';

/** Maximum allowed body size for HTML auth form submissions, in bytes (4 KB). */
const MAX_BODY_BYTES = 4096;

/** User-facing error message for password confirmation mismatch. */
const PASSWORD_MISMATCH_ERROR = 'Passwords do not match';

/**
 * Maps sign-up failure kinds to user-facing error messages rendered in the
 * registration form. Covers weak passwords, common passwords, and service errors.
 */
const SIGN_UP_ERROR_MESSAGES: Record<
  'weak_password' | 'invalid_email' | 'password_too_common' | 'service_error',
  string
> = {
  weak_password: 'Password must be at least 12 characters',
  invalid_email: 'Please enter a valid email address',
  password_too_common: 'Password is too common. Please choose a different password.',
  service_error: 'An error occurred. Please try again.',
};

/**
 * Maps reset-password failure kinds to user-facing error messages rendered
 * in the reset password form.
 */
const RESET_PASSWORD_ERROR_MESSAGES: Record<
  'invalid_token' | 'weak_password' | 'password_too_common' | 'service_error',
  string
> = {
  invalid_token: 'This reset link is invalid or has expired. Please request a new one.',
  weak_password: 'Password must be at least 12 characters',
  password_too_common: 'Password is too common. Please choose a different password.',
  service_error: 'An error occurred. Please try again.',
};

/**
 * HTTP handlers for HTML-rendered auth pages.
 *
 * Coordinates sign-in form rendering (GET) and form submission (POST).
 * Use case instances are injected at construction time; this class never
 * depends on infrastructure directly.
 */
export class AuthPageHandlers {
  /** Injected sign-in use case. */
  private readonly signInUseCase: SignInUseCase;

  /** Injected sign-up use case. */
  private readonly signUpUseCase: SignUpUseCase;

  /** Injected sign-out use case. */
  private readonly signOutUseCase: SignOutUseCase;

  /** Injected request-password-reset use case. */
  private readonly requestPasswordResetUseCase: RequestPasswordResetUseCase;

  /** Injected reset-password use case. */
  private readonly resetPasswordUseCase: ResetPasswordUseCase;

  /** The session cookie name matching better-auth's configured cookie prefix. */
  private readonly sessionCookieName: string;

  /** The CSRF cookie name (drops `__Host-` prefix on localhost). */
  private readonly csrfCookieName: string;

  /** The auth indicator cookie name (drops `__Host-` prefix on localhost). */
  private readonly authIndicatorCookieName: string;

  /**
   * Creates a new AuthPageHandlers instance.
   *
   * @param signInUseCase - The sign-in orchestration use case.
   * @param signUpUseCase - The sign-up orchestration use case.
   * @param signOutUseCase - The sign-out orchestration use case.
   * @param requestPasswordResetUseCase - The password reset request use case.
   * @param resetPasswordUseCase - The password reset use case.
   * @param sessionCookieName - The session cookie name matching better-auth's configured prefix.
   * @param csrfCookieName - The CSRF cookie name (e.g. `__Host-csrf` or `csrf` on localhost).
   * @param authIndicatorCookieName - The auth indicator cookie name (e.g. `__Host-auth_status` or `auth_status` on localhost).
   */
  constructor(
    signInUseCase: SignInUseCase,
    signUpUseCase: SignUpUseCase,
    signOutUseCase: SignOutUseCase,
    requestPasswordResetUseCase: RequestPasswordResetUseCase,
    resetPasswordUseCase: ResetPasswordUseCase,
    sessionCookieName: string,
    csrfCookieName: string,
    authIndicatorCookieName: string
  ) {
    this.signInUseCase = signInUseCase;
    this.signUpUseCase = signUpUseCase;
    this.signOutUseCase = signOutUseCase;
    this.requestPasswordResetUseCase = requestPasswordResetUseCase;
    this.resetPasswordUseCase = resetPasswordUseCase;
    this.sessionCookieName = sessionCookieName;
    this.csrfCookieName = csrfCookieName;
    this.authIndicatorCookieName = authIndicatorCookieName;
  }

  /**
   * Builds standard HTML response headers for auth pages.
   *
   * Generates a fresh CSRF token, sets Content-Type, Cache-Control, the CSRF
   * cookie, and all security headers. Returns both the Headers object and the
   * raw token so callers can embed it in the rendered form.
   *
   * @returns An object containing the populated Headers and the raw CSRF token string.
   */
  private makeFreshAuthHeaders(): { headers: Headers; csrfToken: string } {
    const csrfToken = generateCsrfToken();
    const headers = new Headers();
    headers.set('Content-Type', 'text/html; charset=utf-8');
    headers.set('Set-Cookie', buildCsrfCookie(csrfToken, this.csrfCookieName));
    headers.set('Cache-Control', 'no-store, no-cache');
    applySecurityHeaders(headers);
    return { headers, csrfToken };
  }

  /**
   * Validates and parses an HTML auth form submission.
   *
   * Checks Content-Type, enforces the body-size limit, and verifies the
   * double-submit CSRF token. Returns the parsed URLSearchParams on success or
   * an early-exit Response (415 / 413 / 403) on any validation failure.
   *
   * @param request - The incoming HTTP request to validate and parse.
   * @returns The parsed URLSearchParams on success, or an early-exit Response on failure.
   */
  private async parseValidatedAuthForm(request: Request): Promise<URLSearchParams | Response> {
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
    const csrfCookieToken = extractCsrfTokenFromCookies(
      request.headers.get('Cookie'),
      this.csrfCookieName
    );

    if (csrfCookieToken === null || !timingSafeStringEqual(csrfFormToken, csrfCookieToken)) {
      return new Response('Forbidden', { status: 403 });
    }

    return form;
  }

  /**
   * Builds a 303 redirect response with optional Set-Cookie headers.
   *
   * Centralises the redirect-with-cookies pattern used by sign-in success,
   * sign-up success, and all three sign-out branches.
   *
   * @param location - The redirect target URL.
   * @param cookies - Zero or more Set-Cookie header values to append.
   * @returns A 303 Response with Location and Set-Cookie headers.
   */
  private static buildRedirect(location: string, cookies: string[] = []): Response {
    const headers = new Headers();
    headers.set('Location', location);
    for (const cookie of cookies) {
      headers.append('Set-Cookie', cookie);
    }
    return new Response(null, { status: 303, headers });
  }

  /**
   * Builds a styled 429 Too Many Requests response with an optional Retry-After header.
   *
   * Uses the shared auth layout for consistent branding with other auth error pages.
   *
   * @param retryAfter - Optional seconds until the client may retry.
   * @returns A styled 429 HTML Response with security headers and optional Retry-After.
   */
  private static buildRateLimitedResponse(retryAfter?: number): Response {
    const headers = new Headers();
    headers.set('Content-Type', 'text/html; charset=utf-8');
    headers.set('Cache-Control', 'no-store, no-cache');
    if (retryAfter !== undefined) {
      headers.set('Retry-After', String(retryAfter));
    }
    applySecurityHeaders(headers);
    const body = rateLimitPage({ retryAfter });
    return new Response(body, { status: 429, headers });
  }

  /**
   * Handles GET /auth/sign-in.
   *
   * Redirects already-authenticated users to the validated `redirectTo`
   * destination (or `/` when absent) with a 303. Otherwise generates a
   * fresh CSRF token, stores it in the CSRF cookie, and renders the sign-in
   * form. Sets `Cache-Control: no-store, no-cache` to prevent caching of the
   * CSRF-bearing response.
   *
   * @param request - The incoming HTTP request.
   * @returns A 303 redirect if already authenticated, or a 200 HTML response with Set-Cookie and Cache-Control headers.
   */
  handleGetSignIn(request: Request): Response {
    const url = new URL(request.url);
    const validated = validateRedirectTo(url.searchParams.get('redirectTo'));

    if (hasSessionCookie(request.headers.get('Cookie'), this.sessionCookieName)) {
      return AuthPageHandlers.buildRedirect(validated);
    }

    const registeredSuccess = url.searchParams.get('registered') === 'true';
    const passwordResetSuccess = url.searchParams.get('reset') === 'true';
    const redirectTo = validated !== '/' ? validated : undefined;

    const { headers, csrfToken } = this.makeFreshAuthHeaders();
    return new Response(
      loginPage({ csrfToken, redirectTo, registeredSuccess, passwordResetSuccess }),
      { headers }
    );
  }

  /**
   * Handles POST /auth/sign-in.
   *
   * Validates Content-Type, body size, and CSRF token before delegating to
   * {@link SignInUseCase}. On success, forwards the session cookie and
   * issues a 303 redirect. Timing oracle defence (FR-007) is enforced
   * inside {@link SignInUseCase}.
   *
   * @param request - The incoming HTTP request.
   * @returns The appropriate HTTP response.
   */
  async handlePostSignIn(request: Request): Promise<Response> {
    const formOrError = await this.parseValidatedAuthForm(request);
    if (formOrError instanceof Response) {
      return formOrError;
    }

    const email = (formOrError.get('email') ?? '').toLowerCase().trim();
    const password = formOrError.get('password') ?? '';
    const redirectTo = validateRedirectTo(formOrError.get('redirectTo'));
    const ip = extractClientIp(request);

    const result = await this.signInUseCase.execute({ email, password, ip });

    if (result.ok) {
      return AuthPageHandlers.buildRedirect(redirectTo, [
        buildSessionCookie(result.sessionToken, this.sessionCookieName),
        buildAuthIndicatorCookie(this.authIndicatorCookieName),
        clearCsrfCookie(this.csrfCookieName),
      ]);
    }

    if (result.kind === 'rate_limited') {
      return AuthPageHandlers.buildRateLimitedResponse(result.retryAfter);
    }

    const { headers: errorHeaders, csrfToken } = this.makeFreshAuthHeaders();
    const errorMessage =
      result.kind === 'service_error'
        ? 'An error occurred. Please try again.'
        : 'Invalid email or password';
    const body = loginPage({
      csrfToken,
      email,
      error: errorMessage,
      redirectTo: redirectTo !== '/' ? redirectTo : undefined,
    });

    return new Response(body, { headers: errorHeaders });
  }

  /**
   * Handles GET /auth/sign-up.
   *
   * Redirects already-authenticated users to `/` (303). Otherwise generates a
   * fresh CSRF token, stores it in the CSRF cookie, and renders the registration
   * form. Sets `Cache-Control: no-store, no-cache` to prevent caching of the
   * CSRF-bearing response.
   *
   * @param request - The incoming HTTP request.
   * @returns A 303 redirect if already authenticated, or a 200 HTML response with Set-Cookie and Cache-Control headers.
   */
  handleGetSignUp(request: Request): Response {
    if (hasSessionCookie(request.headers.get('Cookie'), this.sessionCookieName)) {
      return AuthPageHandlers.buildRedirect('/');
    }

    const { headers, csrfToken } = this.makeFreshAuthHeaders();
    return new Response(registerPage({ csrfToken }), { headers });
  }

  /**
   * Handles POST /auth/sign-up.
   *
   * Validates Content-Type, body size, and CSRF token before delegating to
   * {@link SignUpUseCase}. On success (or `email_taken`), redirects to
   * `/auth/sign-in?registered=true` — both outcomes produce the same response
   * to prevent email enumeration (FR-007). On `weak_password` or
   * `service_error`, re-renders the form with an appropriate error message.
   *
   * @param request - The incoming HTTP request.
   * @returns The appropriate HTTP response.
   */
  // No indicator cookie on sign-up: user is redirected to sign-in, which sets it on success.
  async handlePostSignUp(request: Request): Promise<Response> {
    const formOrError = await this.parseValidatedAuthForm(request);
    if (formOrError instanceof Response) {
      return formOrError;
    }

    const email = (formOrError.get('email') ?? '').toLowerCase().trim();
    const password = formOrError.get('password') ?? '';
    const passwordConfirm = formOrError.get('password_confirm') ?? '';
    const ip = extractClientIp(request);

    if (password !== passwordConfirm) {
      const { headers: errorHeaders, csrfToken } = this.makeFreshAuthHeaders();
      const body = registerPage({
        csrfToken,
        email,
        fieldErrors: { password_confirm: PASSWORD_MISMATCH_ERROR },
      });
      return new Response(body, { headers: errorHeaders });
    }

    const result = await this.signUpUseCase.execute({ email, password, ip });

    if (result.ok || result.kind === 'email_taken') {
      return AuthPageHandlers.buildRedirect('/auth/sign-in?registered=true');
    }

    if (result.kind === 'rate_limited') {
      return AuthPageHandlers.buildRateLimitedResponse(result.retryAfter);
    }

    const { headers: errorHeaders, csrfToken } = this.makeFreshAuthHeaders();

    // invalid_email — show as per-field error on the email input
    if (result.kind === 'invalid_email') {
      const body = registerPage({
        csrfToken,
        email,
        fieldErrors: { email: SIGN_UP_ERROR_MESSAGES[result.kind] },
      });
      return new Response(body, { headers: errorHeaders });
    }

    // weak_password and password_too_common — show as per-field error on the password input
    if (result.kind === 'weak_password' || result.kind === 'password_too_common') {
      const body = registerPage({
        csrfToken,
        email,
        fieldErrors: { password: SIGN_UP_ERROR_MESSAGES[result.kind] },
      });
      return new Response(body, { headers: errorHeaders });
    }

    // service_error — show as general error banner
    const errorMessage = SIGN_UP_ERROR_MESSAGES[result.kind];
    const body = registerPage({ csrfToken, email, error: errorMessage });

    return new Response(body, { headers: errorHeaders });
  }

  /**
   * Handles GET /auth/sign-out.
   *
   * Renders a sign-out confirmation page with a CSRF-protected form that
   * submits a POST to `/auth/sign-out`. Generates a fresh CSRF token and
   * sets appropriate cache and security headers.
   *
   * @param _request - The incoming HTTP request (unused, kept for handler signature consistency).
   * @returns A 200 HTML response with the sign-out confirmation form.
   */
  handleGetSignOut(_request: Request): Response {
    const { headers, csrfToken } = this.makeFreshAuthHeaders();
    return new Response(signOutPage({ csrfToken }), { headers });
  }

  /**
   * Handles POST /auth/sign-out.
   *
   * Validates Content-Type, body size, and CSRF token before checking for an
   * active session cookie. Delegates to {@link SignOutUseCase} to invalidate
   * the session server-side. On success, clears the session and CSRF cookies
   * and redirects to the sign-in page. On service error, redirects to the
   * home page gracefully — the session may still be valid and the user is
   * sent home without disruption. If no session cookie is detected in the
   * request, redirects to the sign-in page immediately without calling the
   * use case.
   *
   * @param request - The incoming HTTP request.
   * @returns The appropriate HTTP response.
   */
  async handlePostSignOut(request: Request): Promise<Response> {
    const formOrError = await this.parseValidatedAuthForm(request);
    if (formOrError instanceof Response) {
      return formOrError;
    }

    const cookieHeader = request.headers.get('Cookie') ?? '';
    if (!hasSessionCookie(cookieHeader, this.sessionCookieName)) {
      // Clear indicator cookie even without a session — cookie may linger after expiry
      return AuthPageHandlers.buildRedirect('/auth/sign-in', [
        clearAuthIndicatorCookie(this.authIndicatorCookieName),
      ]);
    }

    const sessionToken = extractSessionToken(cookieHeader, this.sessionCookieName);
    if (sessionToken === null || sessionToken === '') {
      return AuthPageHandlers.buildRedirect('/auth/sign-in', [
        clearAuthIndicatorCookie(this.authIndicatorCookieName),
      ]);
    }

    const result = await this.signOutUseCase.execute({ sessionToken });

    if (result.ok) {
      // 303 redirect + Set-Cookie headers are atomic — browser applies all cookies before navigating
      return AuthPageHandlers.buildRedirect('/auth/sign-in', [
        clearSessionCookie(this.sessionCookieName),
        clearAuthIndicatorCookie(this.authIndicatorCookieName),
        clearCsrfCookie(this.csrfCookieName),
      ]);
    }

    // service_error — redirect home gracefully; session may still be valid
    // Still clear indicator cookie so UI reflects uncertain auth state
    return AuthPageHandlers.buildRedirect('/', [
      clearAuthIndicatorCookie(this.authIndicatorCookieName),
    ]);
  }

  /**
   * Handles GET /auth/forgot-password.
   *
   * Renders the forgot-password form with a fresh CSRF token. If a `success=true`
   * query parameter is present, shows a success banner.
   *
   * @param request - The incoming HTTP request.
   * @returns A 200 HTML response with the forgot-password form.
   */
  handleGetForgotPassword(request: Request): Response {
    const url = new URL(request.url);
    const success = url.searchParams.get('success') === 'true';
    const { headers, csrfToken } = this.makeFreshAuthHeaders();
    return new Response(forgotPasswordPage({ csrfToken, success }), { headers });
  }

  /**
   * Handles POST /auth/forgot-password.
   *
   * Validates Content-Type, body size, and CSRF token before delegating to
   * {@link RequestPasswordResetUseCase}. Always redirects to the success state
   * to prevent email enumeration.
   *
   * @param request - The incoming HTTP request.
   * @returns The appropriate HTTP response.
   */
  async handlePostForgotPassword(request: Request): Promise<Response> {
    const formOrError = await this.parseValidatedAuthForm(request);
    if (formOrError instanceof Response) {
      return formOrError;
    }

    const email = (formOrError.get('email') ?? '').toLowerCase().trim();
    const ip = extractClientIp(request);

    const result = await this.requestPasswordResetUseCase.execute({ email, ip });

    if (!result.ok && result.kind === 'rate_limited') {
      return AuthPageHandlers.buildRateLimitedResponse(result.retryAfter);
    }

    // Always redirect to success to prevent email enumeration
    return AuthPageHandlers.buildRedirect('/auth/forgot-password?success=true');
  }

  /**
   * Handles GET /auth/reset-password.
   *
   * Renders the reset-password form with the verification token from the
   * query string. If no token is present, shows an error.
   *
   * @param request - The incoming HTTP request.
   * @returns A 200 HTML response with the reset-password form, or 400 if no token.
   */
  handleGetResetPassword(request: Request): Response {
    const url = new URL(request.url);
    const token = url.searchParams.get('token') ?? '';
    const { headers, csrfToken } = this.makeFreshAuthHeaders();

    if (token === '') {
      const body = resetPasswordPage({
        csrfToken,
        token: '',
        error: RESET_PASSWORD_ERROR_MESSAGES.invalid_token,
      });
      return new Response(body, { status: 400, headers });
    }

    return new Response(resetPasswordPage({ csrfToken, token }), { headers });
  }

  /**
   * Handles POST /auth/reset-password.
   *
   * Validates Content-Type, body size, and CSRF token before delegating to
   * {@link ResetPasswordUseCase}. On success, redirects to sign-in with a
   * success message. On failure, re-renders the form with an error.
   *
   * @param request - The incoming HTTP request.
   * @returns The appropriate HTTP response.
   */
  async handlePostResetPassword(request: Request): Promise<Response> {
    const formOrError = await this.parseValidatedAuthForm(request);
    if (formOrError instanceof Response) {
      return formOrError;
    }

    const token = formOrError.get('token') ?? '';
    const newPassword = formOrError.get('password') ?? '';

    if (token === '') {
      const { headers: errorHeaders, csrfToken } = this.makeFreshAuthHeaders();
      const body = resetPasswordPage({
        csrfToken,
        token: '',
        error: RESET_PASSWORD_ERROR_MESSAGES.invalid_token,
      });
      return new Response(body, { status: 400, headers: errorHeaders });
    }

    const result = await this.resetPasswordUseCase.execute({ token, newPassword });

    if (result.ok) {
      return AuthPageHandlers.buildRedirect('/auth/sign-in?reset=true');
    }

    const { headers: errorHeaders, csrfToken } = this.makeFreshAuthHeaders();

    if (result.kind === 'weak_password' || result.kind === 'password_too_common') {
      const body = resetPasswordPage({
        csrfToken,
        token,
        passwordError: RESET_PASSWORD_ERROR_MESSAGES[result.kind],
      });
      return new Response(body, { headers: errorHeaders });
    }

    // invalid_token or service_error
    const body = resetPasswordPage({
      csrfToken,
      token,
      error: RESET_PASSWORD_ERROR_MESSAGES[result.kind],
    });
    return new Response(body, { headers: errorHeaders });
  }
}
