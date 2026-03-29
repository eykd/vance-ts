/**
 * Ensures all Set-Cookie headers on a Response include the `Secure` attribute.
 *
 * Defense-in-depth measure for the `/api/auth/*` pass-through handler:
 * better-auth is configured with `defaultCookieAttributes.secure: true`, but
 * the `useSecureCookies` flag is intentionally `false` (to avoid the
 * `__Secure-` prefix that would conflict with the `__Host-` prefix). This
 * utility guarantees the Secure attribute is present regardless of how
 * better-auth serialises cookies internally.
 *
 * @param response - The Response whose Set-Cookie headers should be checked.
 * @returns The same Response with Secure enforced on all Set-Cookie headers.
 */
export function ensureSecureCookies(response: Response): Response {
  const cookies = response.headers.getSetCookie();
  if (cookies.length === 0) {
    return response;
  }

  response.headers.delete('set-cookie');
  for (const cookie of cookies) {
    const hasSecure = /;\s*secure/i.test(cookie);
    response.headers.append('set-cookie', hasSecure ? cookie : `${cookie}; Secure`);
  }

  return response;
}
