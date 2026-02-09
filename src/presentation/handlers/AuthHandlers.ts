import type { LoginUseCase } from '../../application/use-cases/LoginUseCase';
import type { LogoutUseCase } from '../../application/use-cases/LogoutUseCase';
import type { RegisterUseCase } from '../../application/use-cases/RegisterUseCase';
import { RateLimitError } from '../../domain/errors/RateLimitError';
import { ValidationError } from '../../domain/errors/ValidationError';
import type { Logger } from '../../domain/interfaces/Logger';
import type { RateLimitConfig, RateLimiter } from '../../domain/interfaces/RateLimiter';
import { CsrfToken } from '../../domain/value-objects/CsrfToken';
import type { CookieOptions } from '../../types/CookieOptions';
import { DEFAULT_COOKIE_OPTIONS } from '../../types/CookieOptions';
import { validateDoubleSubmitCsrf } from '../middleware/csrfProtection';
import { checkRateLimit } from '../middleware/rateLimiter';
import { rateLimitPage } from '../templates/pages/errorPages';
import { loginPage } from '../templates/pages/login';
import { registerPage } from '../templates/pages/register';
import {
  buildCsrfCookie,
  buildSessionCookie,
  clearCsrfCookie,
  clearSessionCookie,
  extractCsrfTokenFromCookies,
  extractSessionIdFromCookies,
} from '../utils/cookieBuilder';
import { extractClientIp } from '../utils/extractClientIp';
import { htmlResponse } from '../utils/htmlResponse';
import { redirectResponse } from '../utils/htmxResponse';
import { getFormField, parseFormBody } from '../utils/parseFormBody';
import { applySecurityHeaders } from '../utils/securityHeaders';

/**
 * HTTP handlers for authentication routes.
 *
 * Coordinates CSRF protection, rate limiting, form parsing, and use case
 * invocation for login, register, and logout flows.
 */
export class AuthHandlers {
  private readonly loginUseCase: LoginUseCase;
  private readonly registerUseCase: RegisterUseCase;
  private readonly logoutUseCase: LogoutUseCase;
  private readonly rateLimiter: RateLimiter;
  private readonly logger: Logger;
  private readonly cookieOptions: CookieOptions;
  private readonly loginRateLimit: RateLimitConfig;
  private readonly registerRateLimit: RateLimitConfig;

  /**
   * Creates a new AuthHandlers instance.
   *
   * @param loginUseCase - Use case for authenticating users
   * @param registerUseCase - Use case for creating new accounts
   * @param logoutUseCase - Use case for terminating sessions
   * @param rateLimiter - Service for rate limiting requests
   * @param logger - Logger for security and error events
   * @param cookieOptions - Cookie naming and security options
   * @param loginRateLimit - Rate limit config for login attempts
   * @param registerRateLimit - Rate limit config for registration attempts
   */
  constructor(
    loginUseCase: LoginUseCase,
    registerUseCase: RegisterUseCase,
    logoutUseCase: LogoutUseCase,
    rateLimiter: RateLimiter,
    logger: Logger,
    cookieOptions: CookieOptions = DEFAULT_COOKIE_OPTIONS,
    loginRateLimit: RateLimitConfig,
    registerRateLimit: RateLimitConfig
  ) {
    this.loginUseCase = loginUseCase;
    this.registerUseCase = registerUseCase;
    this.logoutUseCase = logoutUseCase;
    this.rateLimiter = rateLimiter;
    this.logger = logger;
    this.cookieOptions = cookieOptions;
    this.loginRateLimit = loginRateLimit;
    this.registerRateLimit = registerRateLimit;
  }

  /**
   * Handles GET /auth/login — renders the login form.
   *
   * @param request - The incoming HTTP request
   * @returns HTML response with login page and CSRF cookie
   */
  handleGetLogin(request: Request): Response {
    const csrfToken = CsrfToken.generate();
    const url = new URL(request.url);
    const redirectTo = url.searchParams.get('redirectTo') ?? undefined;

    const headers = new Headers();
    headers.append(
      'Set-Cookie',
      buildCsrfCookie(csrfToken.toString(), undefined, this.cookieOptions)
    );

    return htmlResponse(loginPage({ csrfToken: csrfToken.toString(), redirectTo }), 200, headers);
  }

  /**
   * Handles GET /auth/register — renders the registration form.
   *
   * @param _request - The incoming HTTP request (unused)
   * @returns HTML response with register page and CSRF cookie
   */
  handleGetRegister(_request: Request): Response {
    const csrfToken = CsrfToken.generate();

    const headers = new Headers();
    headers.append(
      'Set-Cookie',
      buildCsrfCookie(csrfToken.toString(), undefined, this.cookieOptions)
    );

    return htmlResponse(registerPage({ csrfToken: csrfToken.toString() }), 200, headers);
  }

  /**
   * Handles POST /auth/login — authenticates user credentials.
   *
   * @param request - The incoming HTTP request with form data
   * @returns Redirect on success, or re-rendered login page on failure
   */
  async handlePostLogin(request: Request): Promise<Response> {
    const form = await parseFormBody(request);
    const formCsrf = getFormField(form, '_csrf');
    const cookieCsrf = extractCsrfTokenFromCookies(
      request.headers.get('Cookie'),
      this.cookieOptions
    );

    const csrfResponse = validateDoubleSubmitCsrf(formCsrf, cookieCsrf);
    if (csrfResponse !== null) {
      return csrfResponse;
    }

    const rateLimitResponse = await checkRateLimit(
      request,
      { rateLimiter: this.rateLimiter, logger: this.logger },
      this.loginRateLimit,
      'login'
    );
    if (rateLimitResponse !== null) {
      return rateLimitResponse;
    }

    const email = getFormField(form, 'email') ?? '';
    const password = getFormField(form, 'password') ?? '';
    const redirectTo = getFormField(form, 'redirectTo') ?? undefined;
    const ip = extractClientIp(request);
    const userAgent = request.headers.get('User-Agent') ?? '';

    const result = await this.loginUseCase.execute({
      email,
      password,
      redirectTo,
      ipAddress: ip,
      userAgent,
    });

    if (!result.success) {
      const error = result.error;

      if (error instanceof RateLimitError) {
        const headers = new Headers();
        headers.set('Retry-After', String(error.retryAfter));
        return htmlResponse(rateLimitPage(), 429, headers);
      }

      this.logger.security('login_failed', { ip, action: 'login' });

      const errorMessage =
        error instanceof ValidationError ? error.message : 'Invalid email or password';

      const newCsrfToken = CsrfToken.generate();
      const headers = new Headers();
      headers.append(
        'Set-Cookie',
        buildCsrfCookie(newCsrfToken.toString(), undefined, this.cookieOptions)
      );

      return htmlResponse(
        loginPage({
          csrfToken: newCsrfToken.toString(),
          error: errorMessage,
          email,
          redirectTo,
        }),
        200,
        headers
      );
    }

    const headers = new Headers();
    headers.append(
      'Set-Cookie',
      buildSessionCookie(result.value.sessionId.toString(), undefined, this.cookieOptions)
    );
    headers.append(
      'Set-Cookie',
      buildCsrfCookie(result.value.csrfToken.toString(), undefined, this.cookieOptions)
    );
    applySecurityHeaders(headers);

    return redirectResponse(request, result.value.redirectTo, headers);
  }

  /**
   * Handles POST /auth/register — creates a new user account.
   *
   * @param request - The incoming HTTP request with form data
   * @returns Redirect to login on success, or re-rendered register page on failure
   */
  async handlePostRegister(request: Request): Promise<Response> {
    const form = await parseFormBody(request);
    const formCsrf = getFormField(form, '_csrf');
    const cookieCsrf = extractCsrfTokenFromCookies(
      request.headers.get('Cookie'),
      this.cookieOptions
    );

    const csrfResponse = validateDoubleSubmitCsrf(formCsrf, cookieCsrf);
    if (csrfResponse !== null) {
      return csrfResponse;
    }

    const rateLimitResponse = await checkRateLimit(
      request,
      { rateLimiter: this.rateLimiter, logger: this.logger },
      this.registerRateLimit,
      'register'
    );
    if (rateLimitResponse !== null) {
      return rateLimitResponse;
    }

    const email = getFormField(form, 'email') ?? '';
    const password = getFormField(form, 'password') ?? '';
    const confirmPassword = getFormField(form, 'confirmPassword') ?? '';

    const result = await this.registerUseCase.execute({
      email,
      password,
      confirmPassword,
    });

    if (!result.success) {
      const error = result.error;

      const errorMessage =
        error instanceof ValidationError ? error.message : 'Registration failed. Please try again.';

      const fieldErrors = error instanceof ValidationError ? error.fields : undefined;

      const newCsrfToken = CsrfToken.generate();
      const headers = new Headers();
      headers.append(
        'Set-Cookie',
        buildCsrfCookie(newCsrfToken.toString(), undefined, this.cookieOptions)
      );

      return htmlResponse(
        registerPage({
          csrfToken: newCsrfToken.toString(),
          error: errorMessage,
          email,
          fieldErrors,
        }),
        200,
        headers
      );
    }

    const headers = new Headers();
    applySecurityHeaders(headers);
    headers.set('Location', '/auth/login?registered=true');

    return new Response(null, { status: 303, headers });
  }

  /**
   * Handles POST /auth/logout — terminates the user session.
   *
   * @param request - The incoming HTTP request
   * @returns Redirect to login page with cleared cookies
   */
  async handlePostLogout(request: Request): Promise<Response> {
    const form = await parseFormBody(request);
    const formCsrf = getFormField(form, '_csrf');
    const cookieCsrf = extractCsrfTokenFromCookies(
      request.headers.get('Cookie'),
      this.cookieOptions
    );

    const csrfResponse = validateDoubleSubmitCsrf(formCsrf, cookieCsrf);
    if (csrfResponse !== null) {
      return csrfResponse;
    }

    const sessionId =
      extractSessionIdFromCookies(request.headers.get('Cookie'), this.cookieOptions) ?? '';
    await this.logoutUseCase.execute(sessionId);

    const headers = new Headers();
    headers.append('Set-Cookie', clearSessionCookie(this.cookieOptions));
    headers.append('Set-Cookie', clearCsrfCookie(this.cookieOptions));
    applySecurityHeaders(headers);
    headers.set('Location', '/auth/login');

    return new Response(null, { status: 303, headers });
  }
}
