/**
 * Validates a redirect URL to prevent open redirect attacks.
 *
 * Only allows relative paths starting with "/" that do not:
 * - Start with "//" (protocol-relative URLs)
 * - Contain "://" (absolute URLs)
 * - Contain backslashes (path traversal attempts)
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

  if (url.startsWith('//')) {
    return null;
  }

  if (url.includes('://')) {
    return null;
  }

  if (url.includes('\\')) {
    return null;
  }

  return url;
}
