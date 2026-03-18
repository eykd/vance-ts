/**
 * Returns true when the auth URL targets plain-HTTP localhost.
 *
 * The `__Host-` cookie prefix requires `Secure: true` by spec (RFC 6265bis).
 * On plain HTTP localhost the invariant cannot be satisfied, so callers
 * drop the prefix for local development.
 *
 * @param authUrl - The BETTER_AUTH_URL value from the Workers env.
 * @returns True when the URL starts with `http://localhost` or `http://127.0.0.1`.
 */
export function isPlainHttpLocalhost(authUrl: string): boolean {
  return authUrl.startsWith('http://localhost') || authUrl.startsWith('http://127.0.0.1');
}
