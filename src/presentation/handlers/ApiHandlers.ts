import type { Context } from 'hono';

/**
 * Returns a JSON health check response.
 *
 * @param c - Hono context
 * @returns JSON response with status ok
 */
export function healthCheck(c: Context): Response {
  return c.json({ status: 'ok' });
}

/**
 * Returns a 404 JSON response for unmatched API routes.
 *
 * @param c - Hono context
 * @returns JSON response with 404 status
 */
export function apiNotFound(c: Context): Response {
  return c.json({ error: { code: 'not_found', message: 'Not found' } }, 404);
}
