import { html } from '../../utils/html.js';

/** Props for the actions page template. */
export interface ActionsPageProps {
  /** The actions to display. */
  readonly actions: readonly unknown[];
}

/**
 * Renders the actions page as a complete HTML document.
 *
 * @param props - The actions page properties
 * @returns A complete HTML document string
 */
export function actionsPage(props: ActionsPageProps): string {
  void props;
  return html`<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Actions</title>
      </head>
      <body>
        <h1>Actions</h1>
      </body>
    </html>`;
}
