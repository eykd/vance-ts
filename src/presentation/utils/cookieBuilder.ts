import type { CookieOptions } from '../../domain/types/CookieOptions';
import { DEFAULT_COOKIE_OPTIONS } from '../../domain/types/CookieOptions';

/** Cookie name for the session identifier. Uses `__Host-` prefix for origin binding. */
export const SESSION_COOKIE_NAME = '__Host-session';

/** Cookie name for the CSRF token. Uses `__Host-` prefix for origin binding. */
export const CSRF_COOKIE_NAME = '__Host-csrf';

/** Default session max age in seconds (7 days). */
export const SESSION_MAX_AGE_SECONDS = 604800;

/**
 * Builds a secure session cookie string.
 *
 * Attributes: HttpOnly (no JS access), SameSite=Lax, Path=/.
 * Secure attribute is included unless `options.secure` is false.
 *
 * @param sessionId - The session identifier value
 * @param maxAge - Cookie max age in seconds (defaults to 7 days)
 * @param options - Cookie naming and security options (defaults to production)
 * @returns The formatted Set-Cookie value
 */
export function buildSessionCookie(
  sessionId: string,
  maxAge: number = SESSION_MAX_AGE_SECONDS,
  options: CookieOptions = DEFAULT_COOKIE_OPTIONS
): string {
  const secure = options.secure ? '; Secure' : '';
  return `${options.sessionName}=${sessionId}; HttpOnly${secure}; SameSite=Lax; Path=/; Max-Age=${String(maxAge)}`;
}

/**
 * Builds a CSRF cookie string readable by JavaScript.
 *
 * NOT HttpOnly so that client-side JS can read the token for double-submit.
 * Attributes: SameSite=Lax, Path=/.
 * Secure attribute is included unless `options.secure` is false.
 *
 * @param csrfToken - The CSRF token value
 * @param maxAge - Cookie max age in seconds (defaults to 7 days)
 * @param options - Cookie naming and security options (defaults to production)
 * @returns The formatted Set-Cookie value
 */
export function buildCsrfCookie(
  csrfToken: string,
  maxAge: number = SESSION_MAX_AGE_SECONDS,
  options: CookieOptions = DEFAULT_COOKIE_OPTIONS
): string {
  const secure = options.secure ? '; Secure' : '';
  return `${options.csrfName}=${csrfToken}${secure}; SameSite=Lax; Path=/; Max-Age=${String(maxAge)}`;
}

/**
 * Builds a Set-Cookie value that clears the session cookie.
 *
 * @param options - Cookie naming and security options (defaults to production)
 * @returns The formatted Set-Cookie value with Max-Age=0
 */
export function clearSessionCookie(options: CookieOptions = DEFAULT_COOKIE_OPTIONS): string {
  const secure = options.secure ? '; Secure' : '';
  return `${options.sessionName}=; HttpOnly${secure}; SameSite=Lax; Path=/; Max-Age=0`;
}

/**
 * Builds a Set-Cookie value that clears the CSRF cookie.
 *
 * @param options - Cookie naming and security options (defaults to production)
 * @returns The formatted Set-Cookie value with Max-Age=0
 */
export function clearCsrfCookie(options: CookieOptions = DEFAULT_COOKIE_OPTIONS): string {
  const secure = options.secure ? '; Secure' : '';
  return `${options.csrfName}=${secure}; SameSite=Lax; Path=/; Max-Age=0`;
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
    /**
     * `String.prototype.split()` is guaranteed by the ECMAScript specification
     * to return an array with at least one element, so `key` is always defined.
     * The optional chain (`?.`) satisfies TypeScript's `noUncheckedIndexedAccess`.
     */
    /* istanbul ignore next -- guaranteed by ECMAScript spec */
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
 * @param options - Cookie naming and security options (defaults to production)
 * @returns The session ID, or null if not present
 */
export function extractSessionIdFromCookies(
  cookieHeader: string | null,
  options: CookieOptions = DEFAULT_COOKIE_OPTIONS
): string | null {
  return parseCookie(cookieHeader, options.sessionName);
}

/**
 * Extracts the CSRF token from a Cookie header.
 *
 * @param cookieHeader - The raw Cookie header value
 * @param options - Cookie naming and security options (defaults to production)
 * @returns The CSRF token, or null if not present
 */
export function extractCsrfTokenFromCookies(
  cookieHeader: string | null,
  options: CookieOptions = DEFAULT_COOKIE_OPTIONS
): string | null {
  return parseCookie(cookieHeader, options.csrfName);
}
