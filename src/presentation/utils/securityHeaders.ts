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
 * Note: `'unsafe-inline'` in style-src is required because the Tailwind CDN
 * play script injects `<style>` elements at runtime. In production, replace
 * with nonce-based CSP or self-hosted Tailwind.
 *
 * @returns The CSP header value string
 */
export function buildCspHeaderValue(): string {
  return [
    "default-src 'self'",
    "script-src 'self' https://cdn.tailwindcss.com https://unpkg.com",
    // FIXME: 'unsafe-inline' is required for the Tailwind CDN play script which
    // injects <style> elements. Replace with nonce-based CSP or self-hosted
    // Tailwind in production.
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
