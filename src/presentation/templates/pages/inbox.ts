import { html, safe } from '../../utils/html.js';
import { appLayout } from '../layouts/appLayout.js';

/** A single inbox item for the inbox page. */
export interface InboxPageItem {
  /** Unique identifier. */
  readonly id: string;
  /** Title of the inbox item. */
  readonly title: string;
}

/** An area option for the clarify form select. */
export interface InboxPageArea {
  /** Unique identifier. */
  readonly id: string;
  /** Display name. */
  readonly name: string;
}

/** A context option for the clarify form select. */
export interface InboxPageContext {
  /** Unique identifier. */
  readonly id: string;
  /** Display name. */
  readonly name: string;
}

/** Props for the inbox page template. */
export interface InboxPageProps {
  /** The inbox items to display. */
  readonly items: readonly InboxPageItem[];
  /** Available areas for the clarify form. */
  readonly areas: readonly InboxPageArea[];
  /** Available contexts for the clarify form. */
  readonly contexts: readonly InboxPageContext[];
}

/**
 * Renders a clarify modal for a single inbox item.
 *
 * @param item - The inbox item to create a modal for.
 * @param areas - Available areas for the select.
 * @param contexts - Available contexts for the select.
 * @returns HTML string for the modal dialog.
 */
function clarifyModal(
  item: InboxPageItem,
  areas: readonly InboxPageArea[],
  contexts: readonly InboxPageContext[]
): string {
  const areaOptions = areas.map((a) => html`<option value="${a.id}">${a.name}</option>`).join('');

  const contextOptions = contexts
    .map((ctx) => html`<option value="${ctx.id}">${ctx.name}</option>`)
    .join('');

  return html`<dialog id="clarify-modal-${item.id}" class="modal">
    <div class="modal-box">
      <h3 class="text-lg font-bold mb-4">Clarify Item</h3>
      <form hx-post="/app/_/inbox/${item.id}/clarify" hx-swap="outerHTML" hx-target="closest li">
        <label class="label" for="clarify-title-${item.id}">Title</label>
        <input
          id="clarify-title-${item.id}"
          type="text"
          name="title"
          value="${item.title}"
          class="input input-bordered w-full"
          required
        />
        <label class="label mt-2" for="clarify-area-${item.id}">Area</label>
        <select
          id="clarify-area-${item.id}"
          name="areaId"
          class="select select-bordered w-full"
          required
        >
          <option value="" disabled selected>Select an area</option>
          ${safe(areaOptions)}
        </select>
        <label class="label mt-2" for="clarify-context-${item.id}">Context</label>
        <select
          id="clarify-context-${item.id}"
          name="contextId"
          class="select select-bordered w-full"
          required
        >
          <option value="" disabled selected>Select a context</option>
          ${safe(contextOptions)}
        </select>
        <div class="modal-action">
          <button type="button" class="btn" onclick="this.closest('dialog').close()">Cancel</button>
          <button type="submit" class="btn btn-primary">Clarify</button>
        </div>
      </form>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
  </dialog>`;
}

/**
 * Renders the inbox page as a complete HTML document.
 *
 * Lists all inbox items with their titles and a Clarify button that opens
 * a modal form to collect title, area, and context before submitting.
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
          <button
            type="button"
            class="btn btn-sm btn-outline"
            onclick="document.getElementById('clarify-modal-${item.id}').showModal()"
          >
            Clarify
          </button>
          ${safe(clarifyModal(item, props.areas, props.contexts))}
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
