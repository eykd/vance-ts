const MAX_IP_LENGTH = 45;

/**
 * Sanitizes a raw IP string by stripping characters not valid in an IP address.
 *
 * Accepts only digits, hex letters (A-F), dots, and colons. Returns "unknown"
 * if the sanitized result is empty or exceeds the maximum length for an IP
 * address (45 characters).
 *
 * @param raw - The raw IP string to sanitize
 * @returns A sanitized IP string, or "unknown" if invalid
 */
export function sanitizeIp(raw: string): string {
  const sanitized = raw.replace(/[^0-9A-Fa-f:.]/g, '');
  if (sanitized.length === 0 || sanitized.length > MAX_IP_LENGTH) {
    return 'unknown';
  }
  return sanitized;
}

/**
 * Extracts the client IP address from a Cloudflare Workers request.
 *
 * Reads the CF-Connecting-IP header exclusively. X-Forwarded-For is intentionally
 * ignored because it is client-controlled and can be used to spoof IPs for rate
 * limit bypass.
 *
 * @param request - The incoming Workers Request
 * @returns The sanitized client IP string, or "unknown" if the header is absent or invalid
 */
export function extractClientIp(request: Request): string {
  const raw = request.headers.get('CF-Connecting-IP');
  if (raw === null) {
    return 'unknown';
  }
  return sanitizeIp(raw);
}
