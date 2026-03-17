/**
 * Maps a better-auth error query-parameter value to an HTTP status code.
 *
 * Most auth errors (invalid state, bad token, malformed callback) are
 * client errors (400). Server-side failures map to 500.
 *
 * @param errorCode - The `error` query-parameter value, or null/empty
 * @returns The appropriate HTTP status code
 */
export function authErrorStatusCode(errorCode: string | null): number {
  if (errorCode === 'internal_server_error') {
    return 500;
  }
  return 400;
}
