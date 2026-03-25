/**
 * Determines whether a URL path is an API route.
 *
 * API routes are identified by the `/api/` prefix. The check is case-sensitive
 * and requires the trailing slash to avoid false positives on paths like `/api-v2/`.
 *
 * @param path - The URL path to check
 * @returns `true` if the path starts with `/api/`, `false` otherwise
 */
export function isApiRoute(path: string): boolean {
  return path.startsWith('/api/');
}
