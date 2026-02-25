import type { Context } from 'hono';

import type { Env } from '../../shared/env';

/**
 * Delegates the request to the ASSETS binding for static file serving.
 *
 * @param c - Hono context with Cloudflare Workers Env bindings
 * @returns The response from the static asset service
 */
export function staticAssetFallthrough(c: Context<{ Bindings: Env }>): Promise<Response> {
  return c.env.ASSETS.fetch(c.req.raw);
}
