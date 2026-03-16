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
function isPlainHttpLocalhost(authUrl: string): boolean {
  return authUrl.startsWith('http://localhost') || authUrl.startsWith('http://127.0.0.1');
}

/**
 * Returns the better-auth session cookie name for the given auth URL.
 *
 * On localhost (plain HTTP), the `__Host-` prefix is dropped because it
 * requires `Secure: true` — a constraint that cannot be satisfied on
 * plain HTTP. This mirrors the `cookiePrefix` logic in `infrastructure/auth.ts`.
 *
 * @param authUrl - The BETTER_AUTH_URL value from the Workers env.
 * @returns The session cookie name matching better-auth's configured cookie prefix.
 */
export function getSessionCookieName(authUrl: string): string {
  return isPlainHttpLocalhost(authUrl)
    ? 'better-auth.session_token'
    : '__Host-better-auth.session_token';
}

/**
 * Returns the CSRF cookie name for the given auth URL.
 *
 * On localhost (plain HTTP), the `__Host-` prefix is dropped because it
 * requires `Secure: true` — a constraint that cannot be satisfied on
 * plain HTTP. Firefox and Safari may silently drop `__Host-` cookies
 * on plain HTTP, causing CSRF validation failures.
 *
 * @param authUrl - The BETTER_AUTH_URL value from the Workers env.
 * @returns The CSRF cookie name (`__Host-csrf` or `csrf`).
 */
export function getCsrfCookieName(authUrl: string): string {
  return isPlainHttpLocalhost(authUrl) ? 'csrf' : '__Host-csrf';
}

/**
 * Returns the auth indicator cookie name for the given auth URL.
 *
 * On localhost (plain HTTP), the `__Host-` prefix is dropped because it
 * requires `Secure: true` — a constraint that cannot be satisfied on
 * plain HTTP. Firefox and Safari may silently drop `__Host-` cookies
 * on plain HTTP, causing the client-side auth store to miss the indicator.
 *
 * @param authUrl - The BETTER_AUTH_URL value from the Workers env.
 * @returns The auth indicator cookie name (`__Host-auth_status` or `auth_status`).
 */
export function getAuthIndicatorCookieName(authUrl: string): string {
  return isPlainHttpLocalhost(authUrl) ? 'auth_status' : '__Host-auth_status';
}
