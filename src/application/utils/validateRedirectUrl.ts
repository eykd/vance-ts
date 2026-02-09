/**
 * Validates a redirect URL to prevent open redirect attacks.
 *
 * Only allows relative paths starting with "/" that do not:
 * - Start with "//" (protocol-relative URLs)
 * - Contain "://" (absolute URLs)
 * - Contain backslashes (path traversal attempts)
 *
 * Decodes URL-encoded characters before validation to prevent
 * bypass via percent-encoding (e.g., %2F for /, %5C for \).
 * Rejects malformed percent-encoding.
 *
 * @param url - The redirect URL to validate
 * @returns The validated URL or null if invalid
 */
export function validateRedirectUrl(url: string | undefined): string | null {
  if (url === undefined || url === '') {
    return '/';
  }

  if (!url.startsWith('/')) {
    return null;
  }

  let decoded: string;
  try {
    decoded = decodeURIComponent(url);
  } catch {
    return null;
  }

  if (decoded.startsWith('//')) {
    return null;
  }

  if (decoded.includes('://')) {
    return null;
  }

  if (decoded.includes('\\')) {
    return null;
  }

  return decoded;
}
