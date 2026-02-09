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
        <link href="https://cdn.jsdelivr.net/npm/daisyui@4/dist/full.min.css" rel="stylesheet" />
        <script src="https://cdn.tailwindcss.com"></script>
        <script src="https://unpkg.com/htmx.org@2"></script>
        <script defer src="https://unpkg.com/alpinejs@3"></script>
      </head>
      <body class="min-h-screen flex items-center justify-center bg-base-200">
        <div class="card w-full max-w-md bg-base-100 shadow-xl">
          <div class="card-body">${safe(props.content)}</div>
        </div>
      </body>
    </html>`;
}
