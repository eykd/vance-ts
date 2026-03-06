/**
 * ActionApiHandlers — JSON API handlers for Actions and inbox clarification.
 *
 * @module
 */

import type { Context } from 'hono';

import type { ActivateActionUseCase } from '../../application/use-cases/ActivateActionUseCase.js';
import type { ClarifyInboxItemToActionUseCase } from '../../application/use-cases/ClarifyInboxItemToActionUseCase.js';
import type { CompleteActionUseCase } from '../../application/use-cases/CompleteActionUseCase.js';
import { DomainError } from '../../domain/errors/DomainError.js';
import type { AppEnv } from '../types.js';

/**
 * Factory that creates the action API handler object.
 *
 * @param clarifyUseCase - Use case for clarifying inbox items into actions.
 * @param activateUseCase - Use case for activating actions.
 * @param completeUseCase - Use case for completing actions.
 * @returns An object containing the route handler methods.
 */
export function createActionApiHandlers(
  clarifyUseCase: ClarifyInboxItemToActionUseCase,
  activateUseCase: ActivateActionUseCase,
  completeUseCase: CompleteActionUseCase
): {
  handleClarify(c: Context<AppEnv>): Promise<Response>;
  handleActivate(c: Context<AppEnv>): Promise<Response>;
  handleComplete(c: Context<AppEnv>): Promise<Response>;
} {
  return {
    /**
     * Handles `POST /api/v1/inbox/:id/clarify`.
     *
     * @param c - Hono context with workspaceId and actorId set by middleware.
     * @returns JSON response with created action.
     */
    async handleClarify(c: Context<AppEnv>): Promise<Response> {
      const inboxItemId = c.req.param('id');
      const workspaceId = c.get('workspaceId');
      const actorId = c.get('actorId');
      let body: Record<string, unknown>;
      try {
        body = await c.req.json<Record<string, unknown>>();
      } catch {
        return c.json(
          { error: { code: 'invalid_json', message: 'Request body must be valid JSON' } },
          400
        );
      }
      if (
        typeof body['title'] !== 'string' ||
        typeof body['areaId'] !== 'string' ||
        typeof body['contextId'] !== 'string'
      ) {
        return c.json(
          {
            error: {
              code: 'validation_error',
              message: 'title, areaId, and contextId are required and must be strings',
            },
          },
          400
        );
      }
      try {
        const result = await clarifyUseCase.execute({
          workspaceId,
          inboxItemId,
          title: body['title'],
          areaId: body['areaId'],
          contextId: body['contextId'],
          actorId,
        });
        return c.json(result, 200);
      } catch (err: unknown) {
        if (err instanceof DomainError) {
          return c.json({ error: { code: err.code, message: err.message } }, 422);
        }
        return c.json(
          { error: { code: 'service_error', message: 'An unexpected error occurred' } },
          500
        );
      }
    },

    /**
     * Handles `POST /api/v1/actions/:id/activate`.
     *
     * @param c - Hono context with workspaceId and actorId set by middleware.
     * @returns JSON response with activated action.
     */
    async handleActivate(c: Context<AppEnv>): Promise<Response> {
      const actionId = c.req.param('id');
      const workspaceId = c.get('workspaceId');
      const actorId = c.get('actorId');
      try {
        const result = await activateUseCase.execute({ workspaceId, actionId, actorId });
        return c.json(result, 200);
      } catch (err: unknown) {
        if (err instanceof DomainError) {
          return c.json({ error: { code: err.code, message: err.message } }, 422);
        }
        return c.json(
          { error: { code: 'service_error', message: 'An unexpected error occurred' } },
          500
        );
      }
    },

    /**
     * Handles `POST /api/v1/actions/:id/complete`.
     *
     * @param c - Hono context with workspaceId and actorId set by middleware.
     * @returns JSON response with completed action.
     */
    async handleComplete(c: Context<AppEnv>): Promise<Response> {
      const actionId = c.req.param('id');
      const workspaceId = c.get('workspaceId');
      const actorId = c.get('actorId');
      try {
        const result = await completeUseCase.execute({ workspaceId, actionId, actorId });
        return c.json(result, 200);
      } catch (err: unknown) {
        if (err instanceof DomainError) {
          return c.json({ error: { code: err.code, message: err.message } }, 422);
        }
        return c.json(
          { error: { code: 'service_error', message: 'An unexpected error occurred' } },
          500
        );
      }
    },
  };
}
