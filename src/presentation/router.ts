import type { GetCurrentUserUseCase } from '../application/use-cases/GetCurrentUserUseCase';
import type { Logger } from '../domain/interfaces/Logger';
import type { CookieOptions } from '../domain/types/CookieOptions';

import type { AuthHandlers } from './handlers/AuthHandlers';
import { type RequireAuthDeps, requireAuth as defaultRequireAuth } from './middleware/requireAuth';
import { applySecurityHeaders } from './utils/securityHeaders';

/** Dependencies required by the router. */
export interface RouterDeps {
  /** HTTP auth handlers. */
  readonly authHandlers: Pick<
    AuthHandlers,
    | 'handleGetLogin'
    | 'handleGetRegister'
    | 'handlePostLogin'
    | 'handlePostRegister'
    | 'handlePostLogout'
  >;

  /** Use case for validating sessions (used by requireAuth). */
  readonly getCurrentUserUseCase: GetCurrentUserUseCase;

  /** Cookie naming and security options. */
  readonly cookieOptions: CookieOptions;

  /** Logger for error reporting. */
  readonly logger: Logger;

  /** Optional override for requireAuth (for testing). */
  readonly requireAuthFn?: typeof defaultRequireAuth;
}

/**
 * Handles an incoming HTTP request by routing to the appropriate handler.
 *
 * Routes:
 * - GET/POST `/auth/login` - Login page and form submission
 * - GET/POST `/auth/register` - Registration page and form submission
 * - POST `/auth/logout` - Session termination
 * - `/app/*` - Protected routes requiring authentication
 * - Everything else - 404
 *
 * @param request - The incoming HTTP request
 * @param deps - Router dependencies
 * @returns The HTTP response
 */
export async function handleRequest(request: Request, deps: RouterDeps): Promise<Response> {
  try {
    const url = new URL(request.url);
    const { pathname } = url;
    const method = request.method;

    if (pathname === '/auth/login') {
      if (method === 'GET') {
        return deps.authHandlers.handleGetLogin(request);
      }
      if (method === 'POST') {
        return await deps.authHandlers.handlePostLogin(request);
      }
      return methodNotAllowed('GET, POST');
    }

    if (pathname === '/auth/register') {
      if (method === 'GET') {
        return deps.authHandlers.handleGetRegister(request);
      }
      if (method === 'POST') {
        return await deps.authHandlers.handlePostRegister(request);
      }
      return methodNotAllowed('GET, POST');
    }

    if (pathname === '/auth/logout') {
      if (method === 'POST') {
        return await deps.authHandlers.handlePostLogout(request);
      }
      return methodNotAllowed('POST');
    }

    if (pathname.startsWith('/app/')) {
      const requireAuthFn = deps.requireAuthFn ?? defaultRequireAuth;
      const authDeps: RequireAuthDeps = {
        getCurrentUserUseCase: deps.getCurrentUserUseCase,
        cookieOptions: deps.cookieOptions,
      };

      const authResult = await requireAuthFn(request, authDeps);
      if (authResult.type === 'redirect') {
        return authResult.response;
      }

      // TODO: Route to appropriate /app/* handler once implemented
      return new Response('OK', {
        status: 200,
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    return notFound();
  } catch (thrown: unknown) {
    const error = thrown instanceof Error ? thrown : new Error(String(thrown));
    deps.logger.error('Unhandled request error', error, {
      url: request.url,
      method: request.method,
    });
    return internalServerError();
  }
}

/**
 * Builds a 405 Method Not Allowed response with security headers.
 *
 * @param allow - Comma-separated list of allowed methods
 * @returns A 405 response
 */
function methodNotAllowed(allow: string): Response {
  const headers = new Headers();
  headers.set('Allow', allow);
  applySecurityHeaders(headers);

  return new Response('Method Not Allowed', { status: 405, headers });
}

/**
 * Builds a 404 Not Found response with security headers.
 *
 * @returns A 404 response
 */
function notFound(): Response {
  const headers = new Headers();
  applySecurityHeaders(headers);

  return new Response('Not Found', { status: 404, headers });
}

/**
 * Builds a 500 Internal Server Error response with security headers.
 *
 * @returns A 500 response with a generic error message
 */
function internalServerError(): Response {
  const headers = new Headers();
  applySecurityHeaders(headers);

  return new Response('Internal Server Error', { status: 500, headers });
}
