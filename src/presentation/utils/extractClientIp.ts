/**
 * Extracts the client IP address from a request using standard proxy headers.
 *
 * Priority: CF-Connecting-IP > X-Real-IP > X-Forwarded-For (first) > "unknown".
 *
 * @param request - The incoming HTTP request
 * @returns The client IP address string, or "unknown" if not determinable
 */
export function extractClientIp(request: Request): string {
  const cfIp = request.headers.get('CF-Connecting-IP');
  if (cfIp !== null) {
    return cfIp;
  }

  const realIp = request.headers.get('X-Real-IP');
  if (realIp !== null) {
    return realIp;
  }

  const forwardedFor = request.headers.get('X-Forwarded-For');
  if (forwardedFor !== null) {
    const firstIp = forwardedFor.split(',')[0];
    /* istanbul ignore next -- split always returns at least one element */
    if (firstIp !== undefined) {
      return firstIp.trim();
    }
  }

  return 'unknown';
}
