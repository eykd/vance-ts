import { html, safe } from '../../utils/html.js';
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
  const allClear =
    props.inboxCount === 0 && props.actionCount === 0
      ? html`<p class="text-base-content/50 text-sm mt-6">All clear. Enjoy the calm.</p>`
      : '';

  const content = html`<div class="container mx-auto px-4 py-8 animate-fade-up">
    <div class="mb-8">
      <h1 class="text-3xl font-bold font-serif mb-1">Dashboard</h1>
      <p class="text-base-content/60">What's on your mind?</p>
    </div>
    <div class="grid gap-4 sm:grid-cols-2 mb-8">
      <div class="card bg-base-100 border border-base-300 p-6">
        <div class="text-sm text-base-content/60 mb-1">📥 Inbox</div>
        <div class="text-2xl font-bold font-serif">${props.inboxCount}</div>
      </div>
      <div class="card bg-base-100 border border-base-300 p-6">
        <div class="text-sm text-base-content/60 mb-1">⚡ Actions</div>
        <div class="text-2xl font-bold font-serif">${props.actionCount}</div>
      </div>
    </div>
    ${safe(allClear)}
    <form
      hx-post="/app/_/inbox/capture"
      hx-target="#captured-items"
      hx-swap="beforeend"
      hx-on::after-request="if(event.detail.successful) this.reset()"
      class="flex gap-2"
    >
      <input
        type="text"
        name="title"
        placeholder="What's rattling around in your head?"
        required
        class="input input-bordered flex-1"
      />
      <button type="submit" class="btn btn-primary">Capture</button>
    </form>
    <ul id="captured-items" class="mt-4 space-y-1"></ul>
  </div>`;

  return appLayout({ title: 'Dashboard', content });
}
