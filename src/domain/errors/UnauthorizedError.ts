import { DomainError } from './DomainError';

/**
 * Thrown when authentication is required but not provided or invalid.
 *
 * Examples:
 * - Invalid email or password
 * - Account locked due to failed login attempts
 * - Session expired
 * - Missing authentication credentials
 *
 * This error indicates the user must authenticate (or re-authenticate) to
 * access the requested resource. It should be returned from use cases
 * (wrapped in Result type) and mapped to HTTP 401 Unauthorized responses.
 *
 * SECURITY NOTE: Error messages must be generic to prevent user enumeration.
 * Never reveal whether an email exists or which part of authentication failed.
 */
export class UnauthorizedError extends DomainError {
  readonly code = 'UNAUTHORIZED';
}
