import { applySecurityHeaders } from './securityHeaders';

/**
 * Creates an HTML Response with security headers applied.
 *
 * @param body - The HTML string body
 * @param status - The HTTP status code (defaults to 200)
 * @param extraHeaders - Optional additional headers to include
 * @returns A Response with content type text/html and security headers
 */
export function htmlResponse(body: string, status: number = 200, extraHeaders?: Headers): Response {
  const headers = new Headers(extraHeaders);
  headers.set('Content-Type', 'text/html; charset=utf-8');
  applySecurityHeaders(headers);

  return new Response(body, { status, headers });
}
