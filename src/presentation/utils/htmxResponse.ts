import { applySecurityHeaders } from './securityHeaders';

/**
 * Checks whether a request was initiated by HTMX.
 *
 * @param request - The incoming HTTP request
 * @returns True if the HX-Request header is present
 */
export function isHtmxRequest(request: Request): boolean {
  return request.headers.get('HX-Request') !== null;
}

/**
 * Creates a redirect response that is HTMX-aware.
 *
 * HTMX requires a 200 status with `HX-Redirect` header (not 3xx).
 * Standard browser requests get a 303 See Other with `Location` header.
 *
 * @param request - The original request (used to detect HTMX)
 * @param url - The URL to redirect to
 * @param extraHeaders - Optional additional headers (e.g., Set-Cookie)
 * @returns A redirect Response appropriate for the request type
 */
export function redirectResponse(request: Request, url: string, extraHeaders?: Headers): Response {
  const headers = new Headers(extraHeaders);
  applySecurityHeaders(headers);

  if (isHtmxRequest(request)) {
    headers.set('HX-Redirect', url);
    return new Response(null, { status: 200, headers });
  }

  headers.set('Location', url);
  return new Response(null, { status: 303, headers });
}
