// SECURITY TRADE-OFF: style-src 'unsafe-inline' — accepted, documented below.
//
// Why 'unsafe-inline' is required:
//   Alpine.js's x-show directive sets element.style.display programmatically
//   via JavaScript. Without 'unsafe-inline' in style-src, browsers block this
//   and x-show directives silently stop working (elements never hide/show).
//
// Why nonce/hash approaches do NOT solve this:
//   CSP style-src nonces and hashes only apply to <style> elements and static
//   style HTML attributes present at parse time. They do NOT permit JavaScript
//   to write element.style.xxx dynamically. Alpine.js's inline-style
//   requirement cannot be satisfied with nonces or hashes without replacing
//   Alpine.js or rewriting all x-show directives as x-cloak + CSS classes.
//
// Risk assessment (LOW):
//   CSS injection (attribute-selector data exfiltration) requires an attacker
//   to inject arbitrary style attributes or <style> blocks into the page.
//   The auth templates mitigate this because:
//   - All user-supplied values are escaped via escapeHtml before rendering
//   - No user-controlled strings are interpolated into style contexts
//   - No user-generated HTML content is rendered in these pages
//   - script-src 'self' remains strict, blocking injected JavaScript execution
//
// If the risk profile changes (e.g. user-generated HTML is added to auth pages):
//   Replace Alpine.js x-show with x-cloak + CSS class toggling, then remove
//   'unsafe-inline' and use style-src 'self' only.
const CSP_DIRECTIVES: readonly string[] = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
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
