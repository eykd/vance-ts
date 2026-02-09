/**
 * Builds the Content-Security-Policy header value.
 *
 * Directives:
 * - `default-src 'self'` — only same-origin by default
 * - `script-src 'self' https://cdn.tailwindcss.com https://unpkg.com` — allows Tailwind CSS, HTMX, and Alpine.js CDN scripts
 * - `style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net` — allows DaisyUI CDN stylesheet and inline styles
 * - `img-src 'self'` — same-origin images only
 * - `connect-src 'self'` — allows HTMX XHR to same origin
 * - `frame-ancestors 'none'` — prevents framing (clickjacking)
 * - `form-action 'self'` — forms can only submit to same origin
 *
 * @returns The CSP header value string
 */
export function buildCspHeaderValue(): string {
  return [
    "default-src 'self'",
    "script-src 'self' https://cdn.tailwindcss.com https://unpkg.com",
    "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
    "img-src 'self'",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "form-action 'self'",
  ].join('; ');
}

/**
 * Applies standard security headers to a Headers object.
 *
 * Sets CSP, X-Content-Type-Options, X-Frame-Options, and Referrer-Policy.
 *
 * @param headers - The Headers object to mutate
 */
export function applySecurityHeaders(headers: Headers): void {
  headers.set('Content-Security-Policy', buildCspHeaderValue());
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'DENY');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
}
