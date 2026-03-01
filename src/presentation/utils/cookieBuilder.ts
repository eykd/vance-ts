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
 * Builds a Set-Cookie header value for the Better Auth session cookie.
 *
 * Sets a 30-day Max-Age to match the server-side session lifetime configured in
 * better-auth (`session.expiresIn: 2_592_000`).
 *
 * @param token - The opaque session token returned by the auth service
 * @returns A Set-Cookie header value string
 */
export function buildSessionCookie(token: string): string {
  return `${SESSION_COOKIE_NAME}=${token}; ${SESSION_COOKIE_ATTRIBUTES}; Max-Age=2592000`;
}

/**
 * Extracts the session token value from a Cookie request header string.
 *
 * @param cookieHeader - The value of the Cookie request header, or null if absent
 * @returns The session token string, or null if the session cookie is not present
 */
export function extractSessionToken(cookieHeader: string | null): string | null {
  if (cookieHeader === null || cookieHeader === '') {
    return null;
  }
  const prefix = `${SESSION_COOKIE_NAME}=`;
  for (const part of cookieHeader.split(';')) {
    const trimmed = part.trim();
    if (trimmed.startsWith(prefix)) {
      return trimmed.slice(prefix.length);
    }
  }
  return null;
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
