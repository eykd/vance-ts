import { html, safe } from '../../utils/html';

/** Props for the auth layout template. */
interface AuthLayoutProps {
  /** Page title displayed in the browser tab. */
  readonly title: string;
  /** HTML content to render inside the card. */
  readonly content: string;
}

/**
 * Renders the full HTML document layout for authentication pages.
 *
 * Includes DaisyUI/Tailwind CSS, HTMX, and Alpine.js CDN scripts.
 * Content is rendered inside a centered card component.
 *
 * @param props - The layout properties
 * @returns A complete HTML document string
 */
export function authLayout(props: AuthLayoutProps): string {
  return html`<!DOCTYPE html>
    <html lang="en" data-theme="light">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${props.title}</title>
        <link
          href="https://cdn.jsdelivr.net/npm/daisyui@4/dist/full.min.css"
          rel="stylesheet"
          integrity="sha384-2V5uSMIWpBK7suX6yRDZH6ll7ktPJF2O58y0HSz+HiFCBCsmqZpxX1AZB4qAHuYI"
          crossorigin="anonymous"
        />
        <!-- FIXME: Tailwind CDN play script generates CSS dynamically, making SRI impossible.
             Replace with self-hosted Tailwind build in production. -->
        <script src="https://cdn.tailwindcss.com" crossorigin="anonymous"></script>
        <script
          src="https://unpkg.com/htmx.org@2"
          integrity="sha384-/TgkGk7p307TH7EXJDuUlgG3Ce1UVolAOFopFekQkkXihi5u/6OCvVKyz1W+idaz"
          crossorigin="anonymous"
        ></script>
        <script
          defer
          src="https://unpkg.com/alpinejs@3"
          integrity="sha384-LXWjKwDZz29o7TduNe+r/UxaolHh5FsSvy2W7bDHSZ8jJeGgDeuNnsDNHoxpSgDi"
          crossorigin="anonymous"
        ></script>
        <meta
          name="htmx-config"
          content='{"selfRequestsOnly":true,"allowScriptTags":false,"allowEval":false}'
        />
      </head>
      <body class="min-h-screen flex items-center justify-center bg-base-200">
        <div class="card w-full max-w-md bg-base-100 shadow-xl">
          <div class="card-body">${safe(props.content)}</div>
        </div>
      </body>
    </html>`;
}
