/** Cookie name for the session identifier. Uses `__Host-` prefix for origin binding. */
export const SESSION_COOKIE_NAME = '__Host-session';

/** Cookie name for the CSRF token. Uses `__Host-` prefix for origin binding. */
export const CSRF_COOKIE_NAME = '__Host-csrf';

/** Default session max age in seconds (7 days). */
export const SESSION_MAX_AGE_SECONDS = 604800;

/**
 * Builds a secure session cookie string.
 *
 * Attributes: HttpOnly (no JS access), Secure, SameSite=Lax, Path=/.
 *
 * @param sessionId - The session identifier value
 * @param maxAge - Cookie max age in seconds (defaults to 7 days)
 * @returns The formatted Set-Cookie value
 */
export function buildSessionCookie(
  sessionId: string,
  maxAge: number = SESSION_MAX_AGE_SECONDS
): string {
  return `${SESSION_COOKIE_NAME}=${sessionId}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${String(maxAge)}`;
}

/**
 * Builds a CSRF cookie string readable by JavaScript.
 *
 * NOT HttpOnly so that client-side JS can read the token for double-submit.
 * Attributes: Secure, SameSite=Lax, Path=/.
 *
 * @param csrfToken - The CSRF token value
 * @param maxAge - Cookie max age in seconds (defaults to 7 days)
 * @returns The formatted Set-Cookie value
 */
export function buildCsrfCookie(
  csrfToken: string,
  maxAge: number = SESSION_MAX_AGE_SECONDS
): string {
  return `${CSRF_COOKIE_NAME}=${csrfToken}; Secure; SameSite=Lax; Path=/; Max-Age=${String(maxAge)}`;
}

/**
 * Builds a Set-Cookie value that clears the session cookie.
 *
 * @returns The formatted Set-Cookie value with Max-Age=0
 */
export function clearSessionCookie(): string {
  return `${SESSION_COOKIE_NAME}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}

/**
 * Builds a Set-Cookie value that clears the CSRF cookie.
 *
 * @returns The formatted Set-Cookie value with Max-Age=0
 */
export function clearCsrfCookie(): string {
  return `${CSRF_COOKIE_NAME}=; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}

/**
 * Parses a named cookie value from a Cookie header string.
 *
 * @param cookieHeader - The raw Cookie header value
 * @param name - The cookie name to find
 * @returns The cookie value, or null if not found
 */
function parseCookie(cookieHeader: string | null, name: string): string | null {
  if (cookieHeader === null || cookieHeader === '') {
    return null;
  }

  const pairs = cookieHeader.split(';');
  for (const pair of pairs) {
    const [key, ...rest] = pair.split('=');
    /* istanbul ignore next -- split always returns at least one element */
    if (key?.trim() === name) {
      const value = rest.join('=').trim();
      return value === '' ? null : value;
    }
  }

  return null;
}

/**
 * Extracts the session ID from a Cookie header.
 *
 * @param cookieHeader - The raw Cookie header value
 * @returns The session ID, or null if not present
 */
export function extractSessionIdFromCookies(cookieHeader: string | null): string | null {
  return parseCookie(cookieHeader, SESSION_COOKIE_NAME);
}

/**
 * Extracts the CSRF token from a Cookie header.
 *
 * @param cookieHeader - The raw Cookie header value
 * @returns The CSRF token, or null if not present
 */
export function extractCsrfTokenFromCookies(cookieHeader: string | null): string | null {
  return parseCookie(cookieHeader, CSRF_COOKIE_NAME);
}
