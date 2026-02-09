/**
 * Builds the Content-Security-Policy header value.
 *
 * Directives:
 * - `default-src 'self'` — only same-origin by default
 * - `script-src 'self'` — no inline scripts (no `unsafe-inline`)
 * - `style-src 'self' 'unsafe-inline'` — allows DaisyUI/Tailwind inline styles
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
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
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
