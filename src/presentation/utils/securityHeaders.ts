// style-src uses 'self' only — no 'unsafe-inline' needed.
// Alpine.js visibility toggling uses x-bind:class with Tailwind's `hidden`
// utility class instead of x-show (which sets element.style.display inline).
// The x-cloak attribute + [x-cloak] { display: none } CSS rule handles
// initial hide before Alpine processes directives.
const CSP_DIRECTIVES: readonly string[] = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self'",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "base-uri 'self'",
  'upgrade-insecure-requests',
];

/**
 * Builds a Content-Security-Policy header value with all sources restricted to 'self'.
 *
 * @returns Semicolon-separated CSP directives string
 */
export function buildCspHeaderValue(): string {
  return CSP_DIRECTIVES.join('; ');
}

/**
 * Applies a full set of security headers to the given Headers object.
 *
 * Sets Content-Security-Policy, X-Content-Type-Options, X-Frame-Options,
 * Referrer-Policy, Strict-Transport-Security, X-Permitted-Cross-Domain-Policies,
 * Permissions-Policy, and Cross-Origin-Opener-Policy.
 * Existing headers on the object are preserved.
 *
 * @param headers - The Headers object to mutate
 */
export function applySecurityHeaders(headers: Headers): void {
  headers.set('Content-Security-Policy', buildCspHeaderValue());
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'DENY');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  headers.set('X-Permitted-Cross-Domain-Policies', 'none');
  headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=(), usb=()');
  headers.set('Cross-Origin-Opener-Policy', 'same-origin');
}
