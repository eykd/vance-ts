/**
 * InboxItemApiHandlers — JSON API handlers for the Inbox resource.
 *
 * @module
 */

import type { Context } from 'hono';

import type { CaptureInboxItemUseCase } from '../../application/use-cases/CaptureInboxItemUseCase.js';
import type { ListInboxItemsUseCase } from '../../application/use-cases/ListInboxItemsUseCase.js';
import type { AppEnv } from '../types.js';
import { apiErrorResponse } from '../utils/apiErrorResponse.js';

/**
 * Factory that creates the inbox item API handler object.
 *
 * @param captureUseCase - Use case for capturing inbox items.
 * @param listUseCase - Use case for listing inbox items.
 * @returns An object containing the route handler methods.
 */
export function createInboxItemApiHandlers(
  captureUseCase: CaptureInboxItemUseCase,
  listUseCase: ListInboxItemsUseCase
): {
  handleCaptureInboxItem(c: Context<AppEnv>): Promise<Response>;
  handleListInboxItems(c: Context<AppEnv>): Promise<Response>;
} {
  return {
    /**
     * Handles `POST /api/v1/inbox`.
     *
     * @param c - Hono context with workspaceId set by requireApiAuth.
     * @returns JSON response with created inbox item.
     */
    async handleCaptureInboxItem(c: Context<AppEnv>): Promise<Response> {
      let body: Record<string, unknown>;
      try {
        body = await c.req.json<Record<string, unknown>>();
      } catch {
        return c.json(
          { error: { code: 'invalid_json', message: 'Request body must be valid JSON' } },
          400
        );
      }
      if (typeof body['title'] !== 'string' || body['title'].trim() === '') {
        return c.json(
          {
            error: { code: 'validation_error', message: 'title is required and must be a string' },
          },
          400
        );
      }
      const workspaceId = c.get('workspaceId');
      const actorId = c.get('actorId');
      const result = await captureUseCase.execute({
        workspaceId,
        title: body['title'],
        actorId,
      });
      if (!result.ok) {
        return c.json({ error: { code: result.code, message: result.kind } }, 422);
      }
      return c.json(result.data, 201);
    },

    /**
     * Handles `GET /api/v1/inbox`.
     *
     * @param c - Hono context with workspaceId set by requireApiAuth.
     * @returns JSON response with array of inbox item DTOs.
     */
    async handleListInboxItems(c: Context<AppEnv>): Promise<Response> {
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
