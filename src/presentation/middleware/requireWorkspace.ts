/**
 * requireWorkspace middleware — workspace and actor resolution for protected routes.
 *
 * Creates a Hono middleware that resolves the workspace and human actor for the
 * authenticated user on every request to protected routes. Returns 503 if workspace
 * or actor is missing (indicates provisioning failure). Injects `workspaceId` and
 * `actorId` into Hono context for downstream handlers.
 *
 * Must be registered after `requireAuth` or `requireApiAuth` on all `/api/v1/*`
 * and `/app/*` routes.
 *
 * @module
 */

import type { Context, Next } from 'hono';

import type { ActorRepository } from '../../domain/interfaces/ActorRepository.js';
import type { WorkspaceRepository } from '../../domain/interfaces/WorkspaceRepository.js';
import type { AppEnv } from '../types.js';

/**
 * Creates a Hono middleware that resolves workspace and actor for the authenticated user.
 *
 * Reads `c.var.user` (set by `requireAuth`) and queries the workspace repository by user ID.
 * If no workspace exists, returns 503 — indicating provisioning failure. If the human actor
 * is missing, also returns 503. On success, sets `c.var.workspaceId` and `c.var.actorId`
 * for use in downstream route handlers.
 *
 * HTMX requests (identified by `HX-Request: true`) receive a 503 with `HX-Redirect` to
 * `/auth/sign-in` instead of a JSON error body.
 *
 * @param workspaceRepo - Repository for looking up workspaces by user ID.
 * @param actorRepo - Repository for looking up the human actor by workspace ID.
 * @returns A Hono middleware function for use with `app.use()`.
 */
export function createRequireWorkspace(
  workspaceRepo: WorkspaceRepository,
  actorRepo: ActorRepository
): (c: Context<AppEnv>, next: Next) => Promise<Response | void> {
  return async function requireWorkspace(c: Context<AppEnv>, next: Next): Promise<Response | void> {
    const user = c.var.user;
    const workspace = await workspaceRepo.getByUserId(user.id);

    if (workspace == null) {
      if (c.req.header('HX-Request') === 'true') {
        return new Response(null, {
          status: 503,
          headers: { 'HX-Redirect': '/auth/sign-in' },
        });
      }
      return c.json(
        { error: { code: 'workspace_not_found', message: 'Workspace setup is not complete.' } },
        503
      );
    }

    const actor = await actorRepo.getHumanActorByWorkspaceId(workspace.id);
    const actorId = actor?.id;
    if (actorId == null || actorId === '') {
      return c.json(
        { error: { code: 'workspace_not_found', message: 'Workspace actor not found.' } },
        503
      );
    }

    c.set('workspaceId', workspace.id);
    c.set('actorId', actorId);
    await next();
  };
}
