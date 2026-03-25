import { ALPINE_JS_PATH, HTMX_JS_PATH, STYLES_CSS_PATH } from '../../generated/assetPaths';
import { html, safe } from '../../utils/html';

/** Props for the auth layout template. */
interface AuthLayoutProps {
  /** Page title (auto-escaped for XSS safety). */
  readonly title: string;
  /**
   * Inner HTML content (pre-escaped by caller).
   *
   * **Security**: Never interpolate user input into Alpine.js directives
   * (x-data, x-bind, \@click, etc.) as this enables arbitrary JS execution (XSS).
   * Only pass developer-controlled HTML via safe().
   */
  readonly content: string;
}

/**
 * Renders a full HTML page for authentication screens.
 *
 * Uses self-hosted CSS and JS assets with an HTMX security config.
 * The title is auto-escaped; content is trusted and rendered as-is.
 *
 * @param props - The layout properties
 * @returns A complete HTML document string
 */
export function authLayout(props: AuthLayoutProps): string {
  return html`<!DOCTYPE html>
    <html lang="en" data-theme="clawtask-dark">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="robots" content="noindex, nofollow" />
        <meta
          name="htmx-config"
          content='{"selfRequestsOnly":true,"allowScriptTags":false,"allowEval":false}'
        />
        <title>${props.title} | ClawTask</title>
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
      <body class="min-h-screen bg-base-200 flex flex-col items-center justify-center">
        <a
          href="#main-content"
          class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-content focus:rounded"
        >
          Skip to content
        </a>
        <a href="/" class="flex items-center gap-2 mb-6">
          <img src="/favicon.svg" class="size-8" alt="ClawTask logo" />
          <span class="text-xl font-semibold">ClawTask</span>
        </a>
        <main id="main-content">
          <div class="card w-full max-w-md bg-base-100 shadow-xl">
            <div class="card-body">${safe(props.content)}</div>
          </div>
        </main>
      </body>
    </html>`;
}
