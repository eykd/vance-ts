/**
 * ActionApiHandlers — JSON API handlers for Actions and inbox clarification.
 *
 * @module
 */

import type { Context } from 'hono';

import type {
  ActivateActionResult,
  ActivateActionUseCase,
} from '../../application/use-cases/ActivateActionUseCase.js';
import type { ClarifyInboxItemToActionUseCase } from '../../application/use-cases/ClarifyInboxItemToActionUseCase.js';
import type {
  CompleteActionResult,
  CompleteActionUseCase,
} from '../../application/use-cases/CompleteActionUseCase.js';
import type { ListActionsUseCase } from '../../application/use-cases/ListActionsUseCase.js';
import type { AppEnv } from '../types.js';
import { apiErrorResponse } from '../utils/apiErrorResponse.js';
import { humanizeErrorCode } from '../utils/humanizeErrorCode.js';

/** Use case contract for action state transitions (activate, complete). */
interface ActionCommandUseCase {
  /** Executes the action command. */
  execute(input: {
    workspaceId: string;
    actionId: string;
    actorId: string;
  }): Promise<ActivateActionResult | CompleteActionResult>;
}

/**
 * Maps a use case error kind to an HTTP status code.
 *
 * @param kind - The error kind from the use case result.
 * @returns The corresponding HTTP status code.
 */
function mapKindToStatus(kind: string): 404 | 409 | 500 {
  if (kind === 'action_not_found') {
    return 404;
  }
  if (kind === 'invalid_status_transition') {
    return 409;
  }
  return 500;
}

/**
 * Extracts action command params from context, executes the use case, and returns JSON.
 *
 * @param c - Hono context with workspaceId and actorId set by middleware.
 * @param useCase - The action command use case to execute.
 * @returns JSON response with action result or error envelope.
 */
async function executeActionCommand(
  c: Context<AppEnv>,
  useCase: ActionCommandUseCase
): Promise<Response> {
  const actionId = c.req.param('id') as string;
  const workspaceId = c.get('workspaceId');
  const actorId = c.get('actorId');
  const result = await useCase.execute({ workspaceId, actionId, actorId });
  if (!result.ok) {
    return c.json(
      { error: { code: result.kind, message: humanizeErrorCode(result.kind) } },
      mapKindToStatus(result.kind)
    );
  }
  return c.json(result.data, 200);
}

/**
 * Factory that creates the action API handler object.
 *
 * @param clarifyUseCase - Use case for clarifying inbox items into actions.
 * @param activateUseCase - Use case for activating actions.
 * @param completeUseCase - Use case for completing actions.
 * @param listUseCase - Use case for listing actions.
 * @returns An object containing the route handler methods.
 */
export function createActionApiHandlers(
  clarifyUseCase: ClarifyInboxItemToActionUseCase,
  activateUseCase: ActivateActionUseCase,
  completeUseCase: CompleteActionUseCase,
  listUseCase: ListActionsUseCase
): {
  handleClarify(c: Context<AppEnv>): Promise<Response>;
  handleActivate(c: Context<AppEnv>): Promise<Response>;
  handleComplete(c: Context<AppEnv>): Promise<Response>;
  handleListActions(c: Context<AppEnv>): Promise<Response>;
} {
  return {
    /**
     * Handles `POST /api/v1/inbox/:id/clarify`.
     *
     * @param c - Hono context with workspaceId and actorId set by middleware.
     * @returns JSON response with created action.
     */
    async handleClarify(c: Context<AppEnv>): Promise<Response> {
      const inboxItemId = c.req.param('id') as string;
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
      const result = await clarifyUseCase.execute({
        workspaceId,
        inboxItemId,
        title: body['title'],
        areaId: body['areaId'],
        contextId: body['contextId'],
        actorId,
      });
      if (!result.ok) {
        const status =
          result.kind === 'inbox_item_not_found' ||
          result.kind === 'area_not_found_or_archived' ||
          result.kind === 'context_not_found'
            ? 404
            : result.kind === 'already_clarified'
              ? 409
              : 422;
        return c.json(
          { error: { code: result.kind, message: humanizeErrorCode(result.kind) } },
          status
        );
      }
      return c.json(result.data, 200);
    },

    /**
     * Handles `POST /api/v1/actions/:id/activate`.
     *
     * @param c - Hono context with workspaceId and actorId set by middleware.
     * @returns JSON response with activated action.
     */
    async handleActivate(c: Context<AppEnv>): Promise<Response> {
      return executeActionCommand(c, activateUseCase);
    },

    /**
     * Handles `POST /api/v1/actions/:id/complete`.
     *
     * @param c - Hono context with workspaceId and actorId set by middleware.
     * @returns JSON response with completed action.
     */
    async handleComplete(c: Context<AppEnv>): Promise<Response> {
      return executeActionCommand(c, completeUseCase);
    },

    /**
     * Handles `GET /api/v1/actions`.
     *
     * @param c - Hono context with workspaceId set by requireApiAuth.
     * @returns JSON response with array of action DTOs.
     */
    async handleListActions(c: Context<AppEnv>): Promise<Response> {
      const workspaceId = c.get('workspaceId');
      try {
        const result = await listUseCase.execute({ workspaceId });
        return c.json(result, 200);
      } catch (err: unknown) {
        return apiErrorResponse(c, err);
      }
    },
  };
}
