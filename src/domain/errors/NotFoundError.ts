import { DomainError } from './DomainError';

/**
 * Thrown when a requested resource does not exist.
 *
 * Examples:
 * - User ID not found in database
 * - Session ID not found in KV store
 * - Entity does not exist
 *
 * This error indicates the requested resource could not be found.
 * It should be returned from use cases (wrapped in Result type) and mapped
 * to HTTP 404 Not Found responses.
 *
 * SECURITY NOTE: In authentication contexts, this error should NOT be
 * exposed to clients as it reveals whether a user exists. Instead, return
 * UnauthorizedError with a generic message like "Invalid email or password".
 */
export class NotFoundError extends DomainError {
  readonly code = 'NOT_FOUND';
}
