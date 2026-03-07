import type { Context } from 'hono';

import { html } from '../utils/html.js';

/** Use case contract expected by AppPartialHandlers. */
interface CaptureInboxUseCase {
  /** Executes the capture inbox item use case. */
  execute(input: {
    workspaceId: string;
    title: string;
  }): Promise<{ id: string; title: string; status: string }>;
}

/** Use case contract for clarifying an inbox item into an action. */
interface ClarifyInboxUseCase {
  /** Executes the clarify inbox item use case. */
  execute(input: {
    workspaceId: string;
    inboxItemId: string;
    title: string;
    areaId: string;
    contextId: string;
    actorId: string;
  }): Promise<{ id: string; title: string }>;
}

/**
 * Handlers for HTMX partial responses under /app/_/.
 */
export class AppPartialHandlers {
  private readonly captureInbox: CaptureInboxUseCase;
  private readonly clarifyInbox?: ClarifyInboxUseCase;

  /**
   * Creates an AppPartialHandlers instance.
   *
   * @param captureInbox - Use case for capturing inbox items.
   * @param clarifyInbox - Use case for clarifying inbox items into actions.
   */
  constructor(captureInbox: CaptureInboxUseCase, clarifyInbox?: ClarifyInboxUseCase) {
    this.captureInbox = captureInbox;
    this.clarifyInbox = clarifyInbox;
  }

  /**
   * Handles POST to capture an inbox item, returning an HTML partial.
   *
   * @param c - Hono context with workspaceId set by middleware.
   * @returns HTML partial response containing the captured item.
   */
  async handleCaptureInbox(c: Context): Promise<Response> {
    const formData = await c.req.formData();
    const title = formData.get('title') as string;
    const workspaceId = c.get('workspaceId') as string;
    const result = await this.captureInbox.execute({ workspaceId, title });
    return c.html(html`<li>${result.title}</li>`);
  }

  /**
   * Handles POST to clarify an inbox item into an action, returning an HTML partial.
   *
   * @param c - Hono context with workspaceId and actorId set by middleware.
   * @returns HTML partial response containing the action title.
   */
  async handleClarifyInbox(c: Context): Promise<Response> {
    const formData = await c.req.formData();
    const title = formData.get('title') as string;
    const areaId = formData.get('areaId') as string;
    const contextId = formData.get('contextId') as string;
    const workspaceId = c.get('workspaceId') as string;
    const actorId = c.get('actorId') as string;
    const inboxItemId = c.req.param('id');
    const result = await this.clarifyInbox!.execute({
      workspaceId,
      inboxItemId,
      title,
      areaId,
      contextId,
      actorId,
    });
    return c.html(html`<li>${result.title}</li>`);
  }
}

/**
 * Returns a 404 JSON response for unmatched app partial routes.
 *
 * @param c - Hono context
 * @returns JSON response with 404 status
 */
export function appPartialNotFound(c: Context): Response {
  return c.json({ error: 'Not found' }, 404);
}
