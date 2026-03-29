import type { Context } from 'hono';

import type { ActivateActionResult } from '../../application/use-cases/ActivateActionUseCase.js';
import type { CaptureInboxItemResult } from '../../application/use-cases/CaptureInboxItemUseCase.js';
import type { ClarifyInboxItemResult } from '../../application/use-cases/ClarifyInboxItemToActionUseCase.js';
import type { CompleteActionResult } from '../../application/use-cases/CompleteActionUseCase.js';
import { html } from '../utils/html.js';

/** Use case contract expected by AppPartialHandlers. */
interface CaptureInboxUseCase {
  /** Executes the capture inbox item use case. */
  execute(input: { workspaceId: string; title: string }): Promise<CaptureInboxItemResult>;
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
  }): Promise<ClarifyInboxItemResult>;
}

/** Use case contract for action state transitions (activate, complete). */
interface ActionCommandUseCase {
  /** Executes the action command use case. */
  execute(input: {
    workspaceId: string;
    actionId: string;
    actorId: string;
  }): Promise<ActivateActionResult | CompleteActionResult>;
}

/**
 * Handlers for HTMX partial responses under /app/_/.
 */
export class AppPartialHandlers {
  /**
   * Creates an AppPartialHandlers instance.
   *
   * @param captureInbox - Use case for capturing inbox items.
   * @param clarifyInbox - Use case for clarifying inbox items into actions.
   * @param activateAction - Use case for activating actions.
   * @param completeAction - Use case for completing actions.
   */
  constructor(
    private readonly captureInbox: CaptureInboxUseCase,
    private readonly clarifyInbox: ClarifyInboxUseCase,
    private readonly activateAction: ActionCommandUseCase,
    private readonly completeAction: ActionCommandUseCase
  ) {}

  /**
   * Handles POST to capture an inbox item, returning an HTML partial.
   *
   * @param c - Hono context with workspaceId set by middleware.
   * @returns HTML partial response containing the captured item.
   */
  async handleCaptureInbox(c: Context): Promise<Response> {
    let formData: FormData;
    try {
      formData = await c.req.formData();
    } catch {
      return c.html(html`<li>Error: invalid_form_data</li>`, 422);
    }
    const title = formData.get('title');
    if (typeof title !== 'string' || title.trim().length === 0) {
      return c.html(html`<li>Error: missing_title</li>`, 422);
    }
    const workspaceId = c.get('workspaceId') as string;
    const result = await this.captureInbox.execute({ workspaceId, title });
    if (!result.ok) {
      return c.html(html`<li>Error: ${result.kind}</li>`, 422);
    }
    c.header('HX-Trigger', 'inboxItemCaptured');
    return c.html(html`<li>${result.data.title}</li>`);
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
    const actionId = c.req.param('id') as string;
    const result = await useCase.execute({ workspaceId, actionId, actorId });
    if (!result.ok) {
      return c.html(html`<li>Error: ${result.kind}</li>`, 422);
    }
    return c.html(html`<li>${result.data.status}</li>`);
  }

  /**
   * Handles POST to clarify an inbox item into an action, returning an HTML partial.
   *
   * @param c - Hono context with workspaceId and actorId set by middleware.
   * @returns HTML partial response containing the action title.
   */
  async handleClarifyInbox(c: Context): Promise<Response> {
    const inboxItemId = c.req.param('id') as string;
    let formData: FormData;
    try {
      formData = await c.req.formData();
    } catch {
      return c.html(
        html`<div role="alert" class="alert alert-error mt-2">
          <span>Error: invalid_form_data</span>
        </div>`,
        422
      );
    }
    const title = formData.get('title');
    const areaId = formData.get('areaId');
    const contextId = formData.get('contextId');
    if (typeof title !== 'string' || typeof areaId !== 'string' || typeof contextId !== 'string') {
      c.header('HX-Retarget', `#clarify-error-${inboxItemId}`);
      c.header('HX-Reswap', 'innerHTML');
      return c.html(
        html`<div role="alert" class="alert alert-error mt-2">
          <span>Error: missing_fields</span>
        </div>`,
        422
      );
    }
    const workspaceId = c.get('workspaceId') as string;
    const actorId = c.get('actorId') as string;
    const result = await this.clarifyInbox.execute({
      workspaceId,
      inboxItemId,
      title,
      areaId,
      contextId,
      actorId,
    });
    if (!result.ok) {
      c.header('HX-Retarget', `#clarify-error-${inboxItemId}`);
      c.header('HX-Reswap', 'innerHTML');
      return c.html(
        html`<div role="alert" class="alert alert-error mt-2"><span>${result.kind}</span></div>`,
        422
      );
    }
    return c.body('', 200);
  }
}

/**
 * Returns a 404 JSON response for unmatched app partial routes.
 *
 * @param c - Hono context
 * @returns JSON response with 404 status
 */
export function appPartialNotFound(c: Context): Response {
  return c.json({ error: { code: 'not_found', message: 'Not found' } }, 404);
}
