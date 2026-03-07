/**
 * AreaApiHandlers — JSON API handlers for the Areas resource.
 *
 * Handles requests under `GET /api/v1/areas`. Reads the workspace ID
 * populated by the requireApiAuth middleware and delegates to the
 * {@link ListAreasUseCase} for data retrieval.
 *
 * @module
 */

import type { Context } from 'hono';

import type { ListAreasUseCase } from '../../application/use-cases/ListAreasUseCase.js';
import type { AppEnv } from '../types.js';
import { apiErrorResponse } from '../utils/apiErrorResponse.js';

/**
 * Factory that creates the area API handler object.
 *
 * Accepts a pre-wired use case instance so the handlers remain testable
 * without a full dependency injection container.
 *
 * @param listAreasUseCase - Use case for listing workspace areas.
 * @returns An object containing the route handler methods.
 */
export function createAreaApiHandlers(listAreasUseCase: ListAreasUseCase): {
  handleListAreas(c: Context<AppEnv>): Promise<Response>;
} {
  return {
    /**
     * Handles `GET /api/v1/areas`.
     *
     * Returns all areas belonging to the authenticated user's workspace as a
     * JSON array. The workspaceId is sourced from the context variable set by
     * the requireApiAuth middleware.
     *
     * @param c - Hono context with workspaceId set by requireApiAuth.
     * @returns JSON array of AreaDto objects on success, or a 500 error envelope on failure.
     */
    async handleListAreas(c: Context<AppEnv>): Promise<Response> {
      const workspaceId = c.get('workspaceId');
      try {
        const areas = await listAreasUseCase.execute({ workspaceId });
        return c.json(areas);
      } catch (err: unknown) {
        return apiErrorResponse(c, err);
      }
    },
  };
}
