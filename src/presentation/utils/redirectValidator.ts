/**
 * Allowlist of first path segments that are valid post-login redirect destinations.
 *
 * Only paths whose first path segment is in this set are accepted.
 * Anything not explicitly listed is rejected by default (deny-by-default).
 *
 * - '' (empty string): represents the root path '/'
 * - 'app': application routes such as '/app/dashboard'
 * - 'dashboard': top-level dashboard route '/dashboard/'
 * - 'posts': blog content routes such as '/posts/why-most-okrs-fail'
 */
const ALLOWED_FIRST_SEGMENTS = new Set(['', 'app', 'dashboard', 'posts']);

/**
 * Validates and sanitizes the redirectTo query parameter to prevent open redirect attacks.
 *
 * Uses an explicit allowlist: only paths whose first path segment is in
 * {@link ALLOWED_FIRST_SEGMENTS} are accepted. Everything else returns '/'.
 *
 * Validation steps:
 * 1. Decode: decodeURIComponent(raw) — prevents URL-encoded bypass attempts
 * 2. Parse: new URL(decoded, 'http://localhost') — canonicalises the URL
 * 3. Origin check: reject URLs not resolving to localhost origin (handles cross-origin URLs
 * and protocol-relative URLs such as //evil.com which resolve to http://evil.com)
 * 4. Extract first segment: the path component between the first and second '/'
 * 5. Allowlist check: the first segment must be in ALLOWED_FIRST_SEGMENTS
 *
 * @param raw - The raw redirectTo string from the query parameter, or null if absent
 * @returns A validated relative path string, or '/' if the input is absent or invalid
 */
export function validateRedirectTo(raw: string | null): string {
  if (raw === null || raw === '') {
    return '/';
  }

  let decoded: string;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    return '/';
  }

  let parsed: URL;
  try {
    parsed = new URL(decoded, 'http://localhost');
  } catch {
    return '/';
  }

  // Reject any URL that does not resolve to the same origin.
  // This handles cross-origin absolute URLs (https://evil.com) and
  // protocol-relative URLs (//evil.com → http://evil.com).
  if (parsed.origin !== 'http://localhost') {
    return '/';
  }

  const candidate = parsed.pathname + parsed.search;

  // Extract the first path segment: '/app/dashboard' → 'app', '/' → ''
  const firstSegment = candidate.split('/')[1] ?? '';

  // Allowlist: only accept paths in explicitly permitted areas.
  // Deny by default — anything not on the list returns '/'.
  if (!ALLOWED_FIRST_SEGMENTS.has(firstSegment)) {
    return '/';
  }

  return candidate;
}
