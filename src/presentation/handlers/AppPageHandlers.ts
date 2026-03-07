/**
 * AppPageHandlers — HTTP handlers for HTML-rendered application pages.
 *
 * Handles dashboard rendering by coordinating inbox and action use cases.
 *
 * @module
 */

import type { Context } from 'hono';

import type { ListActionsUseCase } from '../../application/use-cases/ListActionsUseCase.js';
import type { ListInboxItemsUseCase } from '../../application/use-cases/ListInboxItemsUseCase.js';
import { dashboardPage } from '../templates/pages/dashboard.js';

/**
 * HTTP handlers for authenticated application pages.
 *
 * Coordinates page rendering by delegating to use cases and composing
 * template output. Use case instances are injected at construction time.
 */
export class AppPageHandlers {
  /** Injected list-inbox-items use case. */
  private readonly listInboxItems: ListInboxItemsUseCase;

  /** Injected list-actions use case. */
  private readonly listActions: ListActionsUseCase;

  /**
   * Creates a new AppPageHandlers instance.
   *
   * @param listInboxItems - Use case for listing inbox items.
   * @param listActions - Use case for listing actions.
   */
  constructor(listInboxItems: ListInboxItemsUseCase, listActions: ListActionsUseCase) {
    this.listInboxItems = listInboxItems;
    this.listActions = listActions;
  }

  /**
   * Handles GET /app — renders the dashboard page.
   *
   * Fetches inbox items and actions for the current workspace, then
   * renders the dashboard template with the counts.
   *
   * @param c - The Hono request context.
   * @returns An HTML response containing the dashboard page.
   */
  async handleGetDashboard(c: Context): Promise<Response> {
    const workspaceId = c.get('workspaceId') as string;

    const [inboxItems, actions] = await Promise.all([
      this.listInboxItems.execute({ workspaceId }),
      this.listActions.execute({ workspaceId }),
    ]);

    return c.html(
      dashboardPage({
        inboxCount: inboxItems.length,
        actionCount: actions.length,
      })
    );
  }
}
