// style-src uses 'self' only — no 'unsafe-inline' needed.
// Alpine.js visibility toggling uses x-bind:class with Tailwind's `hidden`
// utility class instead of x-show (which sets element.style.display inline).
// The x-cloak attribute + [x-cloak] { display: none } CSS rule handles
// initial hide before Alpine processes directives.
/** CSP directive strings joined to form the Content-Security-Policy header value. */
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
 * Security header name-value pairs applied to all dynamic responses.
 *
 * Exported as a flat array so callers can choose *how* to apply them:
 * `Headers.set()` for plain Response objects, or `c.header()` for Hono
 * contexts (which bypasses the `c.res` setter's header-merging logic
 * that can duplicate headers on HEAD requests).
 */
export const SECURITY_HEADERS: ReadonlyArray<readonly [string, string]> = [
  ['Content-Security-Policy', buildCspHeaderValue()],
  ['X-Content-Type-Options', 'nosniff'],
  ['X-Frame-Options', 'DENY'],
  ['Referrer-Policy', 'strict-origin-when-cross-origin'],
  ['Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload'],
  ['X-Permitted-Cross-Domain-Policies', 'none'],
  ['Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=(), usb=()'],
  ['Cross-Origin-Opener-Policy', 'same-origin'],
];

/**
 * Cache-Control value for dynamic, non-cacheable responses (auth pages, error pages).
 *
 * `no-store` prevents caching entirely; `no-cache` is a belt-and-suspenders
 * directive for legacy proxies that ignore `no-store`.
 */
export const CACHE_CONTROL_NO_STORE = 'no-store, no-cache' as const;

/**
 * Applies a full set of security headers to the given Headers object.
 *
 * Sets Content-Security-Policy, X-Content-Type-Options, X-Frame-Options,
 * Referrer-Policy, Strict-Transport-Security, X-Permitted-Cross-Domain-Policies,
 * Permissions-Policy, and Cross-Origin-Opener-Policy.
 * Existing headers on the object are preserved; Cache-Control is intentionally
 * omitted so each handler can set its own caching policy.
 *
 * @param headers - The Headers object to mutate
 */
export function applySecurityHeaders(headers: Headers): void {
  for (const [name, value] of SECURITY_HEADERS) {
    headers.set(name, value);
  }
}
