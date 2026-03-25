import { html, safe } from '../../utils/html.js';
import { appLayout } from '../layouts/appLayout.js';

/** A single inbox item for the inbox page. */
export interface InboxPageItem {
  /** Unique identifier. */
  readonly id: string;
  /** Title of the inbox item. */
  readonly title: string;
}

/** Props for the inbox page template. */
export interface InboxPageProps {
  /** The inbox items to display. */
  readonly items: readonly InboxPageItem[];
}

/**
 * Renders the inbox page as a complete HTML document.
 *
 * Lists all inbox items with their titles and a Clarify button for each.
 *
 * @param props - The inbox page properties
 * @returns A complete HTML document string
 */
export function inboxPage(props: InboxPageProps): string {
  const itemsHtml = props.items
    .map(
      (item, index) =>
        html`<li
          class="flex items-center justify-between p-3 bg-base-100 border border-base-300 rounded-lg animate-slide-in"
          style="animation-delay: ${safe(String(index * 50))}ms"
        >
          <span>${item.title}</span>
          <button hx-post="/app/_/inbox/${item.id}/clarify" class="btn btn-sm btn-outline">
            Clarify
          </button>
        </li>`
    )
    .join('');

  const emptyState =
    props.items.length === 0
      ? html`<div class="text-center py-16 text-base-content/60">
          <p class="text-lg mb-2">Your inbox is empty.</p>
          <p>That's either very zen or very suspicious. 🦞</p>
        </div>`
      : '';

  const content = html`<div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold font-serif mb-8">Inbox</h1>
    ${safe(emptyState)}
    <ul class="space-y-2">
      ${safe(itemsHtml)}
    </ul>
  </div>`;

  return appLayout({ title: 'Inbox', content });
}
