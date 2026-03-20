/**
 * Body size limit middleware — rejects requests with oversized Content-Length.
 *
 * Prevents DoS attacks where a huge Content-Length header (e.g. 999999999)
 * with a small body causes the server to hang waiting for the declared bytes.
 * Checks the Content-Length header on POST, PUT, and PATCH requests and
 * returns 413 Content Too Large if it exceeds the configured limit.
 *
 * @module
 */

import type { Context, Next } from 'hono';

/** Default maximum request body size: 1 MB. */
const DEFAULT_MAX_BODY_BYTES = 1_048_576;

/** HTTP methods that never carry a request body. */
const BODYLESS_METHODS = new Set(['GET', 'HEAD', 'OPTIONS', 'DELETE']);

/** Pre-serialised JSON error body for 413 responses. */
const CONTENT_TOO_LARGE_BODY = JSON.stringify({
  error: { code: 'content_too_large', message: 'Request body exceeds size limit' },
});

/** Shared headers for JSON error responses. */
const JSON_HEADERS = { 'Content-Type': 'application/json' };

/**
 * Creates a Hono middleware that rejects requests whose Content-Length header
 * exceeds the configured byte limit.
 *
 * Methods without a body (GET, HEAD, OPTIONS, DELETE) are passed through
 * unconditionally. For POST, PUT, and PATCH, the middleware checks the
 * Content-Length header and returns 413 if it exceeds `maxBytes`.
 *
 * Requests without a Content-Length header (e.g. chunked transfer) are
 * allowed through — Cloudflare Workers enforces its own upstream limit.
 *
 * @param maxBytes - Maximum allowed Content-Length in bytes. Defaults to 1 MB.
 * @returns A Hono middleware function.
 */
export function createBodyLimitMiddleware(
  maxBytes: number = DEFAULT_MAX_BODY_BYTES
): (c: Context, next: Next) => Promise<Response | void> {
  return async function bodyLimit(c: Context, next: Next): Promise<Response | void> {
    if (BODYLESS_METHODS.has(c.req.method)) {
      return next();
    }

    const contentLength = c.req.header('content-length');
    if (contentLength !== undefined) {
      const length = parseInt(contentLength, 10);
      if (!Number.isNaN(length) && length > 0 && length > maxBytes) {
        return new Response(CONTENT_TOO_LARGE_BODY, {
          status: 413,
          headers: JSON_HEADERS,
        });
      }
    }

    return next();
  };
}
