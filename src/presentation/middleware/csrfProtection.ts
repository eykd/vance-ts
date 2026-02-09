import { constantTimeEqual } from '../../domain/value-objects/constant-time-equal';
import { forbiddenPage } from '../templates/pages/errorPages';
import { htmlResponse } from '../utils/htmlResponse';

/**
 * Validates a double-submit CSRF token pair.
 *
 * Compares the form-submitted token with the cookie token using
 * constant-time comparison to prevent timing attacks.
 *
 * @param formToken - The CSRF token from the form body (_csrf field), or null
 * @param cookieToken - The CSRF token from the cookie header, or null
 * @returns Null if valid, or a 403 Response if invalid
 */
export function validateDoubleSubmitCsrf(
  formToken: string | null,
  cookieToken: string | null
): Response | null {
  if (formToken === null || cookieToken === null) {
    return htmlResponse(forbiddenPage(), 403);
  }

  if (!constantTimeEqual(formToken, cookieToken)) {
    return htmlResponse(forbiddenPage(), 403);
  }

  return null;
}
