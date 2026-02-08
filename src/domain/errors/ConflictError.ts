import { DomainError } from './DomainError';

/**
 * Thrown when a resource conflicts with existing state.
 *
 * Examples:
 * - Email address already registered
 * - Username already taken
 * - Duplicate session ID
 * - Unique constraint violation
 *
 * This error indicates the requested operation cannot be completed because
 * it would violate a uniqueness constraint or conflict with existing data.
 * It should be returned from use cases (wrapped in Result type) and mapped
 * to HTTP 409 Conflict responses.
 */
export class ConflictError extends DomainError {
  readonly code = 'CONFLICT';
}
