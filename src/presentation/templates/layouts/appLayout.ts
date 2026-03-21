import { html, safe } from '../../utils/html.js';

/** Props for the app layout template. */
export interface AppLayoutProps {
  /** Page title (auto-escaped for XSS safety). */
  readonly title: string;
  /**
   * Inner HTML content (pre-escaped by caller).
   *
   * **Security**: Only pass developer-controlled HTML via safe().
   */
  readonly content: string;
}

/**
 * Renders a full HTML page for authenticated application screens.
 *
 * Provides a consistent document shell for app pages (dashboard, inbox, actions).
 * The title is auto-escaped; content is trusted and rendered as-is.
 *
 * @param props - The layout properties
 * @returns A complete HTML document string
 */
export function appLayout(props: AppLayoutProps): string {
  return html`<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <title>${props.title}</title>
      </head>
      <body>
        ${safe(props.content)}
      </body>
    </html>`;
}
