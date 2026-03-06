/**
 * InboxItemApiHandlers — JSON API handlers for the Inbox resource.
 *
 * @module
 */

import type { Context } from 'hono';

import type { CaptureInboxItemUseCase } from '../../application/use-cases/CaptureInboxItemUseCase.js';
import type { ListInboxItemsUseCase } from '../../application/use-cases/ListInboxItemsUseCase.js';
import type { AppEnv } from '../types.js';

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
      const body = await c.req.json<{ title: string }>();
      const workspaceId = c.get('workspaceId');
      const actorId = c.get('actorId');
      const result = await captureUseCase.execute({
        workspaceId,
        title: body.title,
        actorId,
      });
      return c.json(result, 201);
    },

    /**
     * Handles `GET /api/v1/inbox`.
     *
     * @param c - Hono context with workspaceId set by requireApiAuth.
     * @returns JSON response with array of inbox item DTOs.
     */
    async handleListInboxItems(c: Context<AppEnv>): Promise<Response> {
      const workspaceId = c.get('workspaceId');
      const result = await listUseCase.execute({ workspaceId });
      return c.json(result, 200);
    },
  };
}
