import { applySecurityHeaders } from '../utils/securityHeaders.js';

/**
 * Fetches a pre-built error page from ASSETS and returns it with the given status.
 * Falls back to minimal inline HTML if the ASSETS fetch fails (FR-008).
 *
 * @remarks Only status code 500 is currently supported in the path mapping.
 * The mapping (`>= 500 → /500/`, `< 500 → /404.html`) is semantically correct
 * only for 404 and 5xx. Future callers requiring 403, 429, etc. should extend
 * the mapping to a lookup table.
 *
 * @remarks The ASSETS.fetch() subrequest counts against the Cloudflare Workers
 * 50-subrequest limit. If the handler that threw had already consumed many
 * subrequests (D1 queries, KV lookups, external fetches), this fetch could
 * exceed the limit and throw. The try-catch falls back to inline HTML in
 * that scenario.
 *
 * @param assets - The Cloudflare ASSETS Fetcher binding
 * @param statusCode - The HTTP status code to return
 * @returns A Response containing the error page HTML with security headers
 */
export async function serveErrorPage(assets: Fetcher, statusCode: number): Promise<Response> {
  // Map status codes to Hugo-generated error page paths.
  // Currently only 500 is called; the binary split is reserved for future callers.
  const errorPagePath = statusCode >= 500 ? '/500/' : '/404.html';

  try {
    // Use a stable synthetic origin — ASSETS routes by path, not origin.
    // This avoids coupling to the failing request's URL and prevents
    // new URL(requestUrl) from throwing on malformed URLs.
    const errorPageResponse = await assets.fetch(
      new Request(`https://worker.internal${errorPagePath}`, {
        headers: { Accept: 'text/html' },
      })
    );

    if (errorPageResponse.ok) {
      const headers = new Headers({
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store, no-cache',
      });
      applySecurityHeaders(headers);
      return new Response(errorPageResponse.body, {
        status: statusCode,
        headers,
      });
    }
  } catch {
    // Fall through to inline fallback
  }

  // FR-008: Fallback if error page itself fails
  const fallbackHeaders = new Headers({
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-store, no-cache',
  });
  applySecurityHeaders(fallbackHeaders);
  return new Response(fallbackErrorHtml(statusCode), {
    status: statusCode,
    headers: fallbackHeaders,
  });
}

/**
 * Returns an HTMX error fragment for partial request failures.
 *
 * Extracted as a template function (consistent with authErrorPage/rateLimitPage
 * pattern) to enable unit testing and centralize error fragment markup.
 *
 * @returns An HTML string containing a DaisyUI alert-error with a reload link
 */
export function htmxErrorFragment(): string {
  return '<div class="alert alert-error"><span>Something went wrong.</span><a href="" class="link link-neutral underline" hx-boost="false">Reload page</a></div>';
}

/**
 * Generates minimal inline HTML fallback when ASSETS is unavailable.
 *
 * Includes lang="en", viewport meta, and sanitized status code.
 * Does not expose any internal error details (FR-005).
 *
 * @param statusCode - The HTTP status code to display
 * @returns A minimal HTML string suitable for error responses
 */
function fallbackErrorHtml(statusCode: number): string {
  const title = statusCode >= 500 ? 'Server Error' : 'Not Found';
  const message =
    statusCode >= 500
      ? 'Something went wrong. Please try again later.'
      : 'The page you requested could not be found.';
  const safeCode = String(Math.floor(statusCode));
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head><body><h1>${safeCode} ${title}</h1><p>${message}</p><p><a href="/">Go Home</a></p></body></html>`;
}
