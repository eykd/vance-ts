import { html } from '../../utils/html.js';
import { appLayout } from '../layouts/appLayout.js';

/** Props for the dashboard page template. */
export interface DashboardPageProps {
  /** Number of items in the inbox. */
  readonly inboxCount: number;
  /** Number of active actions. */
  readonly actionCount: number;
}

/**
 * Renders the dashboard page as a complete HTML document.
 *
 * Displays inbox and action counts plus a quick capture form.
 *
 * @param props - The dashboard page properties
 * @returns A complete HTML document string
 */
export function dashboardPage(props: DashboardPageProps): string {
  const content = html`<h1>Dashboard</h1>
    <div>Inbox: ${props.inboxCount}</div>
    <div>Actions: ${props.actionCount}</div>
    <form hx-post="/app/_/inbox/capture">
      <input type="text" name="title" placeholder="Quick capture…" required />
      <button type="submit">Capture</button>
    </form>`;

  return appLayout({ title: 'Dashboard', content });
}
