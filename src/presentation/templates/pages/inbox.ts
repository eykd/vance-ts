import { html, safe } from '../../utils/html.js';

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
    .map((item) => html`<li>${item.title} <button type="button">Clarify</button></li>`)
    .join('');

  return html`<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Inbox</title>
      </head>
      <body>
        <h1>Inbox</h1>
        <ul>
          ${safe(itemsHtml)}
        </ul>
      </body>
    </html>`;
}
