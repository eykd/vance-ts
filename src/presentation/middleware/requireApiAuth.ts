/**
 * requireApiAuth middleware — session validation for JSON API routes.
 *
 * Creates a Hono middleware that validates the session token and resolves the
 * authenticated user's workspace for every request to `/api/v1/*` routes.
 * Returns 401 JSON for unauthenticated requests and 503 JSON on infrastructure
 * errors. On success, populates `c.var.user`, `c.var.session`, and
 * `c.var.workspaceId` for downstream handlers.
 *
 * Unlike createRequireAuth (for HTML routes), this middleware returns JSON error
 * responses instead of HTML redirects — appropriate for API consumers.
 *
 * @module
 */

import type { Context, Next } from 'hono';

import type { AuthService } from '../../application/ports/AuthService.js';
import type { WorkspaceRepository } from '../../domain/interfaces/WorkspaceRepository.js';
import type { AppEnv } from '../types.js';
import { extractSessionToken } from '../utils/cookieBuilder.js';

/** JSON error envelope for unauthenticated requests. */
const UNAUTHENTICATED_BODY = JSON.stringify({
  error: { code: 'unauthenticated', message: 'Authentication required' },
});

/** JSON error envelope for service unavailability. */
const SERVICE_ERROR_BODY = JSON.stringify({
  error: { code: 'service_error', message: 'Service unavailable' },
});

/** JSON error envelope when workspace is missing for an authenticated user. */
const WORKSPACE_NOT_FOUND_BODY = JSON.stringify({
  error: { code: 'service_error', message: 'Workspace not provisioned' },
});

/** Shared headers for JSON error responses. */
const JSON_HEADERS = { 'Content-Type': 'application/json' };

/** Shared headers for 503 responses with retry guidance. */
const SERVICE_ERROR_HEADERS = { 'Content-Type': 'application/json', 'Retry-After': '30' };

/**
 * Creates a Hono middleware that guards JSON API routes behind session
 * authentication and workspace resolution.
 *
 * Extracts the session token from the request cookies and validates it via the
 * AuthService port. If no session cookie is present or the session is expired,
 * returns 401 with a JSON error envelope. On D1 or infrastructure errors,
 * returns 503 with `Retry-After: 30`. On success, resolves the workspace for
 * the authenticated user and populates `c.var.user`, `c.var.session`, and
 * `c.var.workspaceId` for downstream handlers.
 *
 * @param authService - The AuthService port for session validation.
 * @param workspaceRepository - Repository for resolving the workspace by user ID.
 * @returns A Hono middleware function for use with `app.use('/api/v1/*', ...)`.
 */
export function createRequireApiAuth(
  authService: AuthService,
  workspaceRepository: WorkspaceRepository
): (c: Context<AppEnv>, next: Next) => Promise<Response | void> {
  return async function requireApiAuth(c: Context<AppEnv>, next: Next): Promise<Response | void> {
    const cookieHeader = c.req.header('Cookie') ?? '';
    const sessionToken = extractSessionToken(cookieHeader);

    if (sessionToken === null) {
      return new Response(UNAUTHENTICATED_BODY, { status: 401, headers: JSON_HEADERS });
    }

    let sessionResult: Awaited<ReturnType<AuthService['getSession']>>;
    try {
      sessionResult = await authService.getSession({ sessionToken });
    } catch {
      return new Response(SERVICE_ERROR_BODY, {
        status: 503,
        headers: SERVICE_ERROR_HEADERS,
      });
    }

    if (sessionResult === null) {
      return new Response(UNAUTHENTICATED_BODY, { status: 401, headers: JSON_HEADERS });
    }

    let workspace: Awaited<ReturnType<WorkspaceRepository['getByUserId']>>;
    try {
      workspace = await workspaceRepository.getByUserId(sessionResult.user.id);
    } catch {
      return new Response(SERVICE_ERROR_BODY, {
        status: 503,
        headers: SERVICE_ERROR_HEADERS,
      });
    }

    if (workspace === null) {
      return new Response(WORKSPACE_NOT_FOUND_BODY, {
        status: 503,
        headers: SERVICE_ERROR_HEADERS,
      });
    }

    c.set('user', sessionResult.user);
    c.set('session', sessionResult.session);
    c.set('workspaceId', workspace.id);
    await next();
  };
}
