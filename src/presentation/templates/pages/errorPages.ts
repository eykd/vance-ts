import { html } from '../../utils/html';

/**
 * Renders the 403 Forbidden error page for invalid CSRF tokens.
 *
 * @returns HTML string for the forbidden page
 */
export function forbiddenPage(): string {
  return html`<h1>Forbidden</h1>
    <p>Invalid CSRF token.</p>`;
}

/**
 * Renders the 429 Too Many Requests error page.
 *
 * @returns HTML string for the rate limit page
 */
export function rateLimitPage(): string {
  return html`<h1>Too Many Requests</h1>
    <p>Please try again later.</p>`;
}
