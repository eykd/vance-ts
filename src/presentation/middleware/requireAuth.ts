import type { UserResponse } from '../../application/dto/UserResponse';
import type { GetCurrentUserUseCase } from '../../application/use-cases/GetCurrentUserUseCase';
import { extractSessionIdFromCookies } from '../utils/cookieBuilder';
import { applySecurityHeaders } from '../utils/securityHeaders';

/** Dependencies required by the requireAuth middleware. */
interface RequireAuthDeps {
  /** Use case for validating the session and retrieving user data. */
  readonly getCurrentUserUseCase: GetCurrentUserUseCase;
}

/** Result when the user is authenticated. */
interface AuthenticatedResult {
  readonly type: 'authenticated';
  readonly user: UserResponse;
}

/** Result when authentication fails and a redirect is needed. */
interface RedirectResult {
  readonly type: 'redirect';
  readonly response: Response;
}

/** Discriminated union result of the auth check. */
type AuthCheckResult = AuthenticatedResult | RedirectResult;

/**
 * Checks whether the request has a valid session.
 *
 * Returns the authenticated user if the session is valid, or a redirect
 * Response to the login page if not.
 *
 * @param request - The incoming HTTP request
 * @param deps - The middleware dependencies
 * @returns Auth check result with either user data or redirect response
 */
export async function requireAuth(
  request: Request,
  deps: RequireAuthDeps
): Promise<AuthCheckResult> {
  const cookieHeader = request.headers.get('Cookie');
  const sessionId = extractSessionIdFromCookies(cookieHeader);

  if (sessionId === null) {
    return { type: 'redirect', response: buildLoginRedirect(request.url) };
  }

  const result = await deps.getCurrentUserUseCase.execute(sessionId);
  if (!result.success) {
    return { type: 'redirect', response: buildLoginRedirect(request.url) };
  }

  return { type: 'authenticated', user: result.value };
}

/**
 * Checks whether a pathname is safe for use as a redirect target.
 *
 * Rejects paths that could be used for open redirect attacks:
 * protocol-relative URLs (`//evil.com`), newline injection, and null bytes.
 *
 * @param pathname - The pathname to validate
 * @returns True if the path is safe for redirect
 */
function isSafeRedirectPath(pathname: string): boolean {
  /**
   * Per the URL specification, `URL.pathname` always starts with '/' for
   * HTTP(S) URLs, making this branch unreachable in practice. The defensive
   * guard prevents an open redirect if the assumption ever breaks.
   */
  /* istanbul ignore next -- guaranteed by URL spec for HTTP(S) */
  if (!pathname.startsWith('/')) {
    return false;
  }
  if (pathname.startsWith('//')) {
    return false;
  }
  if (/[\n\r\0]|%0[aAdD]|%00/i.test(pathname)) {
    return false;
  }
  return true;
}

/**
 * Builds a 303 redirect response to the login page.
 *
 * Preserves the original request path as a `redirectTo` query parameter
 * so the login page can redirect back after successful authentication.
 * Paths under `/auth/` are excluded to avoid redirect loops. Unsafe
 * paths (protocol-relative, containing newlines or null bytes) are
 * excluded to prevent open redirect attacks.
 *
 * @param requestUrl - The full URL of the original request
 * @returns A redirect Response with security headers
 */
function buildLoginRedirect(requestUrl: string): Response {
  const { pathname } = new URL(requestUrl);

  let location = '/auth/login';
  if (!pathname.startsWith('/auth/') && isSafeRedirectPath(pathname)) {
    location += `?redirectTo=${encodeURIComponent(pathname)}`;
  }

  const headers = new Headers();
  headers.set('Location', location);
  applySecurityHeaders(headers);

  return new Response(null, { status: 303, headers });
}
