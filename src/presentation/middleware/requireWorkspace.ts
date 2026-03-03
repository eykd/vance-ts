/**
 * requireWorkspace middleware — workspace and actor resolution for protected routes.
 *
 * Sits after `requireAuth` on all `/api/v1/*` and `/app/*` routes. Resolves the
 * authenticated user's workspace and human actor once per request and injects them
 * into Hono context as `workspaceId` and `actorId`.
 *
 * Returns 503 if workspace or actor is missing (indicates provisioning failure).
 * An empty actorId MUST NOT fall through — doing so would produce audit events
 * with an empty actor_id, violating the FK constraint and causing silent data corruption.
 *
 * @module
 */

import type { Context, Next } from 'hono';

import type { ActorRepository } from '../../domain/interfaces/ActorRepository.js';
import type { WorkspaceRepository } from '../../domain/interfaces/WorkspaceRepository.js';
import type { AppEnv } from '../types.js';

/** JSON error body returned on provisioning failure. */
const PROVISIONING_FAILED_ERROR = {
  error: {
    code: 'provisioning_failed',
    message: 'Workspace setup is not complete. Please retry or contact support.',
  },
} as const;

/**
 * Creates a Hono middleware that resolves the workspace and human actor for
 * the authenticated user on every request.
 *
 * Must be mounted after `createRequireAuth` — it reads `c.var.user` which is
 * populated by the auth middleware. On success, sets `c.var.workspaceId` and
 * `c.var.actorId` for downstream handlers.
 *
 * Security invariant: if the actor lookup returns `null`, the middleware
 * returns 503 immediately. It never sets `actorId` to an empty string — an
 * empty string would pass TypeScript checks but fail the `actor_id NOT NULL
 * REFERENCES actor(id)` FK constraint at the D1 level, producing an unhandled
 * 500 instead of a clean 503.
 *
 * @param workspaceRepo - Repository for workspace lookups.
 * @param actorRepo - Repository for actor lookups.
 * @returns A Hono middleware function for use with `app.use()`.
 */
export function createRequireWorkspace(
  workspaceRepo: WorkspaceRepository,
  actorRepo: ActorRepository,
): (c: Context<AppEnv>, next: Next) => Promise<Response | void> {
  return async function requireWorkspace(
    c: Context<AppEnv>,
    next: Next,
  ): Promise<Response | void> {
    const user = c.var.user;

    const workspace = await workspaceRepo.getByUserId(user.id);
    if (!workspace) {
      if (c.req.header('HX-Request') === 'true') {
        return new Response(null, {
          status: 503,
          headers: { 'HX-Redirect': '/auth/sign-in' },
        });
      }
      return c.json(PROVISIONING_FAILED_ERROR, 503);
    }

    const actor = await actorRepo.getHumanActorByWorkspaceId(workspace.id);
    if (!actor) {
      // Security: MUST return 503 here — never fall through with an empty actorId.
      // An empty string would violate audit_event.actor_id FK constraint at D1.
      if (c.req.header('HX-Request') === 'true') {
        return new Response(null, {
          status: 503,
          headers: { 'HX-Redirect': '/auth/sign-in' },
        });
      }
      return c.json(PROVISIONING_FAILED_ERROR, 503);
    }

    c.set('workspaceId', workspace.id);
    c.set('actorId', actor.id);
    await next();
  };
}
