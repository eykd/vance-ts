import { html, safe } from '../../utils/html.js';
import { appLayout } from '../layouts/appLayout.js';

/** A single action item for display on the actions page. */
export interface ActionsPageItem {
  /** The action identifier. */
  readonly id: string;
  /** The action title. */
  readonly title: string;
  /** The action status. */
  readonly status: string;
}

/** Props for the actions page template. */
export interface ActionsPageProps {
  /** The actions to display. */
  readonly actions: readonly ActionsPageItem[];
}

/**
 * Maps an action status to a DaisyUI badge class.
 *
 * @param status - The action status string
 * @returns The badge class suffix
 */
function badgeClass(status: string): string {
  switch (status) {
    case 'active':
      return 'badge-success';
    case 'ready':
      return 'badge-warning';
    default:
      return 'badge-ghost';
  }
}

/**
 * Renders a single action list item with optional Activate button.
 *
 * @param action - The action item to render
 * @param index - The item index for staggered animation
 * @returns An HTML list item string
 */
function actionItem(action: ActionsPageItem, index: number): string {
  const activateButton =
    action.status === 'inactive' || action.status === 'ready'
      ? html` <button hx-post="/app/_/actions/${action.id}/activate" class="btn btn-sm btn-primary">
          Activate
        </button>`
      : '';

  const completeButton =
    action.status === 'active'
      ? html` <button hx-post="/app/_/actions/${action.id}/complete" class="btn btn-sm btn-success">
          Complete
        </button>`
      : '';

  return html`<li
    data-id="${action.id}"
    class="flex items-center justify-between p-3 bg-base-100 border border-base-300 rounded-lg animate-slide-in"
    style="animation-delay: ${safe(String(index * 50))}ms"
  >
    <div>
      <span>${action.title}</span>
      <span class="badge badge-sm ${safe(badgeClass(action.status))} ml-2">${action.status}</span>
    </div>
    <div class="flex gap-2">${safe(activateButton)}${safe(completeButton)}</div>
  </li>`;
}

/**
 * Renders the actions page as a complete HTML document.
 *
 * @param props - The actions page properties
 * @returns A complete HTML document string
 */
export function actionsPage(props: ActionsPageProps): string {
  const items = props.actions.map((action, index) => actionItem(action, index)).join('');

  const emptyState =
    props.actions.length === 0
      ? html`<div class="text-center py-16 text-base-content/60">
          <p class="text-lg">No actions yet. Clarify some inbox items to get moving.</p>
        </div>`
      : '';

  const content = html`<div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold font-serif mb-8">Actions</h1>
    ${safe(emptyState)}
    <ul class="space-y-2">
      ${safe(items)}
    </ul>
  </div>`;

  return appLayout({ title: 'Actions', content });
}
