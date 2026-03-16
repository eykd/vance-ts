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
  const isLocal = authUrl.startsWith('http://localhost') || authUrl.startsWith('http://127.0.0.1');
  return isLocal ? 'better-auth.session_token' : '__Host-better-auth.session_token';
}
