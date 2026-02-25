const BLOCKED_PREFIXES = ['//', '/api/', '/auth/'];

/**
 * Validates and sanitizes the redirectTo query parameter to prevent open redirect attacks.
 *
 * Validation rules:
 * 1. Decode: decodeURIComponent(raw) — prevents URL-encoded bypass attempts
 * 2. Canonicalise: new URL(decoded, 'http://localhost') — extracts only pathname + search
 * 3. Accept if: starts with '/', does NOT start with '//', does NOT start with '/api/' or '/auth/'
 * 4. Default: returns '/' for absent, invalid, or rejected input
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

  const candidate = parsed.pathname + parsed.search;

  if (!candidate.startsWith('/')) {
    return '/';
  }

  for (const prefix of BLOCKED_PREFIXES) {
    if (candidate.startsWith(prefix)) {
      return '/';
    }
  }

  return candidate;
}
