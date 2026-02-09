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
    return { type: 'redirect', response: buildLoginRedirect() };
  }

  const result = await deps.getCurrentUserUseCase.execute(sessionId);
  if (!result.success) {
    return { type: 'redirect', response: buildLoginRedirect() };
  }

  return { type: 'authenticated', user: result.value };
}

/**
 * Builds a 303 redirect response to the login page.
 *
 * @returns A redirect Response with security headers
 */
function buildLoginRedirect(): Response {
  const headers = new Headers();
  headers.set('Location', '/auth/login');
  applySecurityHeaders(headers);

  return new Response(null, { status: 303, headers });
}
