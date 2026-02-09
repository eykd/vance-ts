/**
 * Extracts the client IP address from a Cloudflare Workers request.
 *
 * Only trusts the CF-Connecting-IP header, which is set by Cloudflare's edge
 * network and cannot be spoofed by clients. Headers like X-Real-IP and
 * X-Forwarded-For are intentionally ignored because they can be forged.
 *
 * @param request - The incoming HTTP request
 * @returns The client IP address string, or "unknown" if not determinable
 */
export function extractClientIp(request: Request): string {
  const cfIp = request.headers.get('CF-Connecting-IP');
  if (cfIp !== null) {
    return cfIp;
  }

  return 'unknown';
}
