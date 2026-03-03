/**
 * ContextApiHandlers — JSON API handlers for the Contexts resource.
 *
 * Handles requests under `GET /api/v1/contexts`. Reads the workspace ID
 * populated by the requireApiAuth middleware and delegates to the
 * {@link ListContextsUseCase} for data retrieval.
 *
 * @module
 */

import type { Context } from 'hono';

import type { ListContextsUseCase } from '../../application/use-cases/ListContextsUseCase.js';
import type { AppEnv } from '../types.js';

/**
 * Factory that creates the context API handler object.
 *
 * Accepts a pre-wired use case instance so the handlers remain testable
 * without a full dependency injection container.
 *
 * @param listContextsUseCase - Use case for listing workspace contexts.
 * @returns An object containing the route handler methods.
 */
export function createContextApiHandlers(listContextsUseCase: ListContextsUseCase): {
  handleListContexts(c: Context<AppEnv>): Promise<Response>;
} {
  return {
    /**
     * Handles `GET /api/v1/contexts`.
     *
     * Returns all contexts belonging to the authenticated user's workspace as a
     * JSON array. The workspaceId is sourced from the context variable set by
     * the requireApiAuth middleware.
     *
     * @param c - Hono context with workspaceId set by requireApiAuth.
     * @returns JSON array of ContextDto objects on success, or a 500 error envelope on failure.
     */
    async handleListContexts(c: Context<AppEnv>): Promise<Response> {
      const workspaceId = c.get('workspaceId');
      try {
        const contexts = await listContextsUseCase.execute({ workspaceId });
        return c.json(contexts);
      } catch {
        return c.json(
          { error: { code: 'service_error', message: 'An unexpected error occurred' } },
          500
        );
      }
    },
  };
}
