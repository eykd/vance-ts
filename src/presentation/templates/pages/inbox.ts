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
      (item) =>
        html`<li>
          ${item.title} <button hx-post="/app/_/inbox/${item.id}/clarify">Clarify</button>
        </li>`
    )
    .join('');

  const content = html`<h1>Inbox</h1>
    <ul>
      ${safe(itemsHtml)}
    </ul>`;

  return appLayout({ title: 'Inbox', content });
}
