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

/** Use case contract for action state transitions (activate, complete). */
interface ActionCommandUseCase {
  /** Executes the action command use case. */
  execute(input: {
    workspaceId: string;
    actionId: string;
    actorId: string;
  }): Promise<{ id: string; title: string; status: string }>;
}

/**
 * Handlers for HTMX partial responses under /app/_/.
 */
export class AppPartialHandlers {
  private readonly captureInbox: CaptureInboxUseCase;
  private readonly clarifyInbox: ClarifyInboxUseCase;
  private readonly activateAction: ActionCommandUseCase;
  private readonly completeAction: ActionCommandUseCase;

  /**
   * Creates an AppPartialHandlers instance.
   *
   * @param captureInbox - Use case for capturing inbox items.
   * @param clarifyInbox - Use case for clarifying inbox items into actions.
   * @param activateAction - Use case for activating actions.
   * @param completeAction - Use case for completing actions.
   */
  constructor(
    captureInbox: CaptureInboxUseCase,
    clarifyInbox: ClarifyInboxUseCase,
    activateAction: ActionCommandUseCase,
    completeAction: ActionCommandUseCase
  ) {
    this.captureInbox = captureInbox;
    this.clarifyInbox = clarifyInbox;
    this.activateAction = activateAction;
    this.completeAction = completeAction;
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
   * Handles POST to activate an action, returning an HTML partial.
   *
   * @param c - Hono context with workspaceId and actorId set by middleware.
   * @returns HTML partial response containing the activated action status.
   */
  async handleActivateAction(c: Context): Promise<Response> {
    return this.executeActionCommand(c, this.activateAction);
  }

  /**
   * Handles POST to complete an action, returning an HTML partial.
   *
   * @param c - Hono context with workspaceId and actorId set by middleware.
   * @returns HTML partial response containing the completed action status.
   */
  async handleCompleteAction(c: Context): Promise<Response> {
    return this.executeActionCommand(c, this.completeAction);
  }

  /**
   * Executes an action command use case and returns an HTML partial with the status.
   *
   * @param c - Hono context with workspaceId and actorId set by middleware.
   * @param useCase - The action command use case to execute.
   * @returns HTML partial response containing the action status.
   */
  private async executeActionCommand(c: Context, useCase: ActionCommandUseCase): Promise<Response> {
    const workspaceId = c.get('workspaceId') as string;
    const actorId = c.get('actorId') as string;
    const actionId = c.req.param('id');
    const result = await useCase.execute({ workspaceId, actionId, actorId });
    return c.html(html`<li>${result.status}</li>`);
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
    const result = await this.clarifyInbox.execute({
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
