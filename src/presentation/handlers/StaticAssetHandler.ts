import type { Context } from 'hono';

import type { Env } from '../../shared/env';

/**
 * Delegates the request to the ASSETS binding for static file serving.
 *
 * When ASSETS returns a 404 with an empty body (Content-Length: 0),
 * fetches the Hugo-generated 404.html page and returns it with a 404
 * status so visitors see a styled "Page Not Found" page instead of a
 * blank white screen.
 *
 * @param c - Hono context with Cloudflare Workers Env bindings
 * @returns The response from the static asset service, or a 404 page
 */
export async function staticAssetFallthrough(c: Context<{ Bindings: Env }>): Promise<Response> {
  const response = await c.env.ASSETS.fetch(c.req.raw);

  if (response.status === 404 && response.headers.get('content-length') === '0') {
    const notFoundReq = new Request(new URL('/404.html', c.req.url));
    const pageResponse = await c.env.ASSETS.fetch(notFoundReq);
    if (pageResponse.ok) {
      return new Response(pageResponse.body, {
        status: 404,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }
  }

  return response;
}
