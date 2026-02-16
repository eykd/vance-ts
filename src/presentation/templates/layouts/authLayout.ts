import { ALPINE_JS_PATH, HTMX_JS_PATH, STYLES_CSS_PATH } from '../../generated/assetPaths';
import { html, safe } from '../../utils/html';

/** Props for the auth layout template. */
export interface AuthLayoutProps {
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
    <html lang="en" data-theme="turtlebased">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta
          name="htmx-config"
          content='{"selfRequestsOnly":true,"allowScriptTags":false,"allowEval":false}'
        />
        <title>${props.title}</title>
        <link rel="stylesheet" href="${safe(STYLES_CSS_PATH)}" />
        <script src="${safe(HTMX_JS_PATH)}"></script>
        <script defer src="${safe(ALPINE_JS_PATH)}"></script>
      </head>
      <body class="min-h-screen bg-base-200 flex items-center justify-center">
        <div class="card w-full max-w-md bg-base-100 shadow-xl">
          <div class="card-body">${safe(props.content)}</div>
        </div>
      </body>
    </html>`;
}
