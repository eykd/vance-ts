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
import { actionsPage } from '../templates/pages/actions.js';
import { dashboardPage } from '../templates/pages/dashboard.js';
import { inboxPage } from '../templates/pages/inbox.js';

/**
 * HTTP handlers for authenticated application pages.
 *
 * Coordinates page rendering by delegating to use cases and composing
 * template output. Use case instances are injected at construction time.
 */
export class AppPageHandlers {
  /**
   * Creates a new AppPageHandlers instance.
   *
   * @param listInboxItems - Use case for listing inbox items.
   * @param listActions - Use case for listing actions.
   */
  constructor(
    private readonly listInboxItems: ListInboxItemsUseCase,
    private readonly listActions: ListActionsUseCase
  ) {}

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

  /**
   * Handles GET /app/inbox — renders the inbox page.
   *
   * Fetches inbox items for the current workspace, then renders
   * each item with its title and a Clarify button.
   *
   * @param c - The Hono request context.
   * @returns An HTML response containing the inbox page.
   */
  async handleGetInbox(c: Context): Promise<Response> {
    const workspaceId = c.get('workspaceId') as string;

    const items = await this.listInboxItems.execute({ workspaceId });

    return c.html(inboxPage({ items }));
  }

  /**
   * Handles GET /app/actions — renders the actions page.
   *
   * Fetches actions for the current workspace, then renders
   * each action with its title and status.
   *
   * @param c - The Hono request context.
   * @returns An HTML response containing the actions page.
   */
  async handleGetActions(c: Context): Promise<Response> {
    const workspaceId = c.get('workspaceId') as string;

    const actions = await this.listActions.execute({ workspaceId });

    return c.html(actionsPage({ actions }));
  }
}
