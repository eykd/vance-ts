import { toHex } from '../../shared/hex';

const CSRF_COOKIE_NAME = '__Host-csrf';
const CSRF_COOKIE_ATTRIBUTES = 'HttpOnly; Secure; SameSite=Strict; Path=/';

/**
 * Generates a cryptographically random 256-bit CSRF token as a hex string.
 *
 * @returns A 64-character lowercase hex string
 */
export function generateCsrfToken(): string {
  return toHex(crypto.getRandomValues(new Uint8Array(32)));
}

/**
 * Derives a CSRF token via two-step HMAC-SHA256 with a dedicated sub-key.
 *
 * Key separation ensures the CSRF sub-key is distinct from any other key
 * derived from the same master secret:
 * `csrfSubKey = HMAC(masterSecret, 'csrf-v1')`,
 * then `token = HMAC(csrfSubKey, message)`.
 *
 * The message should include a domain-separation prefix (e.g. "csrf:v1:{sessionToken}")
 * to additionally prevent cross-protocol token reuse within the CSRF domain.
 *
 * @param message      - The message to sign (e.g. "csrf:v1:{sessionToken}")
 * @param masterSecret - The master signing secret (e.g. BETTER_AUTH_SECRET from env)
 * @returns A 64-character lowercase hex string
 */
export async function deriveCsrfToken(message: string, masterSecret: string): Promise<string> {
  const encoder = new TextEncoder();
  // Step 1: derive the dedicated csrf-v1 sub-key
  const masterKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(masterSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const csrfSubKeyBuffer = await crypto.subtle.sign('HMAC', masterKey, encoder.encode('csrf-v1'));
  // Step 2: sign the message with the sub-key
  const csrfKey = await crypto.subtle.importKey(
    'raw',
    csrfSubKeyBuffer,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', csrfKey, encoder.encode(message));
  return toHex(new Uint8Array(signature));
}

/**
 * Builds a Set-Cookie header value for the CSRF cookie with a 1-hour expiry.
 *
 * @param token - The CSRF token to store in the cookie
 * @returns A Set-Cookie header value string
 */
export function buildCsrfCookie(token: string): string {
  return `${CSRF_COOKIE_NAME}=${token}; ${CSRF_COOKIE_ATTRIBUTES}; Max-Age=3600`;
}

/**
 * Builds a Set-Cookie header value that clears the CSRF cookie.
 *
 * @returns A Set-Cookie header value string with Max-Age=0
 */
export function clearCsrfCookie(): string {
  return `${CSRF_COOKIE_NAME}=; ${CSRF_COOKIE_ATTRIBUTES}; Max-Age=0`;
}

/**
 * 30 days in seconds — matches better-auth `session.expiresIn`.
 * Shared by both buildSessionCookie() and buildAuthIndicatorCookie()
 * so that the indicator cookie expires in lockstep with the session.
 */
const THIRTY_DAY_MAX_AGE = 2_592_000;

const AUTH_INDICATOR_COOKIE_NAME = '__Host-auth_status';
const AUTH_INDICATOR_COOKIE_ATTRIBUTES = 'Secure; SameSite=Lax; Path=/';

/**
 * Builds a Set-Cookie header value for the auth indicator cookie.
 *
 * This cookie is intentionally NOT HttpOnly so that client-side JavaScript
 * (Alpine.js auth store) can read it. It carries no secret — only a flag
 * indicating that the user has an active session.
 *
 * @returns A Set-Cookie header value string
 */
export function buildAuthIndicatorCookie(): string {
  return `${AUTH_INDICATOR_COOKIE_NAME}=1; ${AUTH_INDICATOR_COOKIE_ATTRIBUTES}; Max-Age=${THIRTY_DAY_MAX_AGE}`;
}

/**
 * Builds a Set-Cookie header value that clears the auth indicator cookie.
 *
 * @returns A Set-Cookie header value string with Max-Age=0
 */
export function clearAuthIndicatorCookie(): string {
  return `${AUTH_INDICATOR_COOKIE_NAME}=; ${AUTH_INDICATOR_COOKIE_ATTRIBUTES}; Max-Age=0`;
}

const SESSION_COOKIE_ATTRIBUTES = 'HttpOnly; Secure; SameSite=Lax; Path=/';

/**
 * Builds a Set-Cookie header value for the Better Auth session cookie.
 *
 * Sets a 30-day Max-Age to match the server-side session lifetime configured in
 * better-auth (`session.expiresIn: 2_592_000`).
 *
 * @param token - The opaque session token returned by the auth service.
 * @param sessionCookieName - The session cookie name matching better-auth's configured prefix.
 * @returns A Set-Cookie header value string
 */
export function buildSessionCookie(token: string, sessionCookieName: string): string {
  return `${sessionCookieName}=${token}; ${SESSION_COOKIE_ATTRIBUTES}; Max-Age=${THIRTY_DAY_MAX_AGE}`;
}

/**
 * Builds a Set-Cookie header value that clears the Better Auth session cookie.
 *
 * @param sessionCookieName - The session cookie name matching better-auth's configured prefix.
 * @returns A Set-Cookie header value string with Max-Age=0
 */
export function clearSessionCookie(sessionCookieName: string): string {
  return `${sessionCookieName}=; ${SESSION_COOKIE_ATTRIBUTES}; Max-Age=0`;
}

/**
 * Extracts a named cookie's value from a Cookie request header string.
 *
 * @param cookieHeader - The value of the Cookie request header, or null if absent
 * @param cookieName   - The name of the cookie to extract
 * @returns The cookie value, or null if the cookie is not present
 */
function extractCookieValue(cookieHeader: string | null, cookieName: string): string | null {
  if (cookieHeader === null || cookieHeader === '') {
    return null;
  }
  const prefix = `${cookieName}=`;
  for (const part of cookieHeader.split(';')) {
    const trimmed = part.trim();
    if (trimmed.startsWith(prefix)) {
      return trimmed.slice(prefix.length);
    }
  }
  return null;
}

/**
 * Extracts the session token value from a Cookie request header string.
 *
 * @param cookieHeader - The value of the Cookie request header, or null if absent.
 * @param sessionCookieName - The session cookie name matching better-auth's configured prefix.
 * @returns The session token string, or null if the session cookie is not present
 */
export function extractSessionToken(
  cookieHeader: string | null,
  sessionCookieName: string
): string | null {
  return extractCookieValue(cookieHeader, sessionCookieName);
}

/**
 * Returns true when the Cookie request header contains a Better Auth session cookie.
 *
 * @param cookieHeader - The value of the Cookie request header, or null if absent.
 * @param sessionCookieName - The session cookie name matching better-auth's configured prefix.
 * @returns True if a session cookie is present
 */
export function hasSessionCookie(cookieHeader: string | null, sessionCookieName: string): boolean {
  return extractCookieValue(cookieHeader, sessionCookieName) !== null;
}

/**
 * Returns true when the Cookie request header contains the auth indicator cookie.
 *
 * @param cookieHeader - The value of the Cookie request header, or null if absent
 * @returns True if the auth indicator cookie is present
 */
export function hasAuthIndicatorCookie(cookieHeader: string | null): boolean {
  return extractCookieValue(cookieHeader, AUTH_INDICATOR_COOKIE_NAME) !== null;
}

/**
 * Extracts the CSRF token value from a Cookie header string.
 *
 * @param cookieHeader - The value of the Cookie request header, or null if absent
 * @returns The CSRF token string, or null if the cookie is not present
 */
export function extractCsrfTokenFromCookies(cookieHeader: string | null): string | null {
  return extractCookieValue(cookieHeader, CSRF_COOKIE_NAME);
}
