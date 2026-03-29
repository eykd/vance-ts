/**
 * Origin-check utilities for cross-origin request protection.
 *
 * Validates the `Origin` header on state-changing (POST) requests against the
 * application's own origin derived from `BETTER_AUTH_URL`. Closes a gap where
 * better-auth's built-in `formCsrfMiddleware` skips origin validation on
 * cookie-less requests without Fetch Metadata headers.
 *
 * @module
 */

import type { MiddlewareHandler } from 'hono/types';

/** JSON error body for rejected cross-origin requests. */
const FORBIDDEN_BODY = JSON.stringify({
  error: { code: 'origin_not_allowed', message: 'Cross-origin requests are not allowed' },
});

/** HTTP methods considered safe (idempotent, no side effects). */
const SAFE_METHODS = new Set(['GET', 'HEAD']);

/**
 * Checks whether the given Origin header value matches the expected origin
 * derived from the site URL.
 *
 * @param originHeader - The Origin header value (undefined when absent).
 * @param siteUrl - The application's public URL (typically `BETTER_AUTH_URL`).
 * @returns True when the origin matches, false otherwise.
 */
export function isOriginAllowed(originHeader: string | undefined, siteUrl: string): boolean {
  const origin = originHeader ?? '';
  if (origin === '' || origin === 'null') return false;
  return origin === new URL(siteUrl).origin;
}

/**
 * Creates a Hono middleware that rejects cross-origin POST requests.
 *
 * Derives the expected origin (scheme + host + port) from the provided site URL
 * and compares it against the `Origin` request header. POST requests with a
 * missing or non-matching origin receive a 403 JSON response.
 *
 * @param siteUrl - The application's public URL (typically `BETTER_AUTH_URL`).
 * @returns A Hono middleware handler.
 */
export function createOriginCheckMiddleware(siteUrl: string): MiddlewareHandler {
  const expectedOrigin = new URL(siteUrl).origin;

  return async function originCheck(c, next): Promise<Response | void> {
    if (SAFE_METHODS.has(c.req.method)) {
      return next();
    }

    const origin = c.req.header('Origin') ?? '';
    if (origin === '' || origin === 'null' || origin !== expectedOrigin) {
      return new Response(FORBIDDEN_BODY, {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return next();
  };
}
