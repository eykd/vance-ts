import { ALPINE_JS_PATH, HTMX_JS_PATH, STYLES_CSS_PATH } from '../../generated/assetPaths';
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
    <html lang="en" data-theme="clawtask-dark">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta
          name="htmx-config"
          content='{"selfRequestsOnly":true,"allowScriptTags":false,"allowEval":false}'
        />
        <title>${props.title}</title>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400..700;1,400..700&family=Fragment+Mono:ital@0;1&family=Lexend:wght@300..700&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="${safe(STYLES_CSS_PATH)}" />
        <script src="${safe(HTMX_JS_PATH)}"></script>
        <script defer src="${safe(ALPINE_JS_PATH)}"></script>
      </head>
      <body>
        <nav
          class="navbar bg-base-100/50 backdrop-blur-sm border-b border-base-300"
          aria-label="App navigation"
        >
          <div class="navbar-start">
            <a href="/" class="btn btn-ghost font-serif text-xl text-primary">ClawTask</a>
          </div>
          <div class="navbar-center">
            <ul class="menu menu-horizontal px-1">
              <li><a href="/app">Dashboard</a></li>
              <li><a href="/app/inbox">Inbox</a></li>
              <li><a href="/app/actions">Actions</a></li>
            </ul>
          </div>
          <div class="navbar-end">
            <a href="/auth/sign-out" class="btn btn-ghost btn-sm">Sign Out</a>
          </div>
        </nav>
        ${safe(props.content)}
      </body>
    </html>`;
}
