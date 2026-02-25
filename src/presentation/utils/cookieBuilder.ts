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
 * Derives a CSRF token via HMAC-SHA256 keyed on the provided secret.
 *
 * The message should include a domain-separation prefix (e.g. "csrf:v1:{sessionToken}")
 * to prevent cross-protocol token reuse.
 *
 * @param message - The message to sign (e.g. "csrf:v1:{sessionToken}")
 * @param secret  - The signing secret (e.g. AUTH_SECRET from env)
 * @returns A 64-character lowercase hex string
 */
export async function deriveCsrfToken(message: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
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

const SESSION_COOKIE_NAME = '__Host-better-auth.session_token';
const SESSION_COOKIE_ATTRIBUTES = 'HttpOnly; Secure; SameSite=Lax; Path=/';

/**
 * Builds a Set-Cookie header value that clears the Better Auth session cookie.
 *
 * @returns A Set-Cookie header value string with Max-Age=0
 */
export function clearSessionCookie(): string {
  return `${SESSION_COOKIE_NAME}=; ${SESSION_COOKIE_ATTRIBUTES}; Max-Age=0`;
}

/**
 * Returns true when the Cookie request header contains a Better Auth session cookie.
 *
 * @param cookieHeader - The value of the Cookie request header, or null if absent
 * @returns True if a session cookie is present
 */
export function hasSessionCookie(cookieHeader: string | null): boolean {
  if (cookieHeader === null || cookieHeader === '') {
    return false;
  }
  return cookieHeader.includes(`${SESSION_COOKIE_NAME}=`);
}

/**
 * Extracts the CSRF token value from a Cookie header string.
 *
 * @param cookieHeader - The value of the Cookie request header, or null if absent
 * @returns The CSRF token string, or null if the cookie is not present
 */
export function extractCsrfTokenFromCookies(cookieHeader: string | null): string | null {
  if (cookieHeader === null || cookieHeader === '') {
    return null;
  }
  const prefix = `${CSRF_COOKIE_NAME}=`;
  for (const part of cookieHeader.split(';')) {
    const trimmed = part.trim();
    if (trimmed.startsWith(prefix)) {
      return trimmed.slice(prefix.length);
    }
  }
  return null;
}
