import type { Context } from 'hono';

/**
 * Returns a 404 JSON response for unmatched app partial routes.
 *
 * @param c - Hono context
 * @returns JSON response with 404 status
 */
export function appPartialNotFound(c: Context): Response {
  return c.json({ error: 'Not found' }, 404);
}
