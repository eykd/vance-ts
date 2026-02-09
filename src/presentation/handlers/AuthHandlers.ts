import type { LoginUseCase } from '../../application/use-cases/LoginUseCase';
import type { LogoutUseCase } from '../../application/use-cases/LogoutUseCase';
import type { RegisterUseCase } from '../../application/use-cases/RegisterUseCase';
import { ConflictError } from '../../domain/errors/ConflictError';
import { RateLimitError } from '../../domain/errors/RateLimitError';
import { ValidationError } from '../../domain/errors/ValidationError';
import type { Logger } from '../../domain/interfaces/Logger';
import type { RateLimitConfig, RateLimiter } from '../../domain/interfaces/RateLimiter';
import { CsrfToken } from '../../domain/value-objects/CsrfToken';
import { validateDoubleSubmitCsrf } from '../middleware/csrfProtection';
import { checkRateLimit } from '../middleware/rateLimiter';
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

/** Rate limit configuration for login attempts at presentation level. */
const LOGIN_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 10,
  windowSeconds: 60,
};

/** Rate limit configuration for registration attempts. */
const REGISTER_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 5,
  windowSeconds: 300,
};

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

  /**
   * Creates a new AuthHandlers instance.
   *
   * @param loginUseCase - Use case for authenticating users
   * @param registerUseCase - Use case for creating new accounts
   * @param logoutUseCase - Use case for terminating sessions
   * @param rateLimiter - Service for rate limiting requests
   * @param logger - Logger for security and error events
   */
  constructor(
    loginUseCase: LoginUseCase,
    registerUseCase: RegisterUseCase,
    logoutUseCase: LogoutUseCase,
    rateLimiter: RateLimiter,
    logger: Logger
  ) {
    this.loginUseCase = loginUseCase;
    this.registerUseCase = registerUseCase;
    this.logoutUseCase = logoutUseCase;
    this.rateLimiter = rateLimiter;
    this.logger = logger;
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
    headers.append('Set-Cookie', buildCsrfCookie(csrfToken.toString()));

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
    headers.append('Set-Cookie', buildCsrfCookie(csrfToken.toString()));

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
    const cookieCsrf = extractCsrfTokenFromCookies(request.headers.get('Cookie'));

    const csrfResponse = validateDoubleSubmitCsrf(formCsrf, cookieCsrf);
    if (csrfResponse !== null) {
      return csrfResponse;
    }

    const rateLimitResponse = await checkRateLimit(
      request,
      { rateLimiter: this.rateLimiter, logger: this.logger },
      LOGIN_RATE_LIMIT,
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
        return htmlResponse(
          '<h1>Too Many Requests</h1><p>Please try again later.</p>',
          429,
          headers
        );
      }

      this.logger.security('login_failed', { ip, action: 'login' });

      const errorMessage =
        error instanceof ValidationError ? error.message : 'Invalid email or password';

      const newCsrfToken = CsrfToken.generate();
      const headers = new Headers();
      headers.append('Set-Cookie', buildCsrfCookie(newCsrfToken.toString()));

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
    headers.append('Set-Cookie', buildSessionCookie(result.value.sessionId.toString()));
    headers.append('Set-Cookie', buildCsrfCookie(result.value.csrfToken.toString()));
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
    const cookieCsrf = extractCsrfTokenFromCookies(request.headers.get('Cookie'));

    const csrfResponse = validateDoubleSubmitCsrf(formCsrf, cookieCsrf);
    if (csrfResponse !== null) {
      return csrfResponse;
    }

    const rateLimitResponse = await checkRateLimit(
      request,
      { rateLimiter: this.rateLimiter, logger: this.logger },
      REGISTER_RATE_LIMIT,
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
        error instanceof ConflictError ? 'Registration failed. Please try again.' : error.message;

      const fieldErrors = error instanceof ValidationError ? error.fields : undefined;

      const newCsrfToken = CsrfToken.generate();
      const headers = new Headers();
      headers.append('Set-Cookie', buildCsrfCookie(newCsrfToken.toString()));

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
    const cookieCsrf = extractCsrfTokenFromCookies(request.headers.get('Cookie'));

    const csrfResponse = validateDoubleSubmitCsrf(formCsrf, cookieCsrf);
    if (csrfResponse !== null) {
      return csrfResponse;
    }

    const sessionId = extractSessionIdFromCookies(request.headers.get('Cookie')) ?? '';
    await this.logoutUseCase.execute(sessionId);

    const headers = new Headers();
    headers.append('Set-Cookie', clearSessionCookie());
    headers.append('Set-Cookie', clearCsrfCookie());
    applySecurityHeaders(headers);
    headers.set('Location', '/auth/login');

    return new Response(null, { status: 303, headers });
  }
}
