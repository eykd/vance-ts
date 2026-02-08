import { DomainError } from './DomainError';

/**
 * Thrown when business validation rules are violated.
 *
 * Examples:
 * - Invalid email format
 * - Password too weak
 * - Passwords do not match
 * - Required field missing
 *
 * This error indicates client-provided data failed domain validation rules.
 * It should be returned from use cases (wrapped in Result type) and mapped
 * to HTTP 422 Unprocessable Entity responses.
 */
export class ValidationError extends DomainError {
  readonly code = 'VALIDATION_ERROR';

  /**
   * Optional field-level validation errors.
   *
   * @example
   * ```typescript
   * {
   *   email: ['Must be a valid email address'],
   *   password: ['Must be at least 12 characters', 'Cannot be a common password']
   * }
   * ```
   */
  readonly fields?: Record<string, string[]>;

  /**
   * Creates a new validation error.
   *
   * @param message - Human-readable error description
   * @param fields - Optional field-level validation errors
   */
  constructor(message: string, fields?: Record<string, string[]>) {
    super(message);
    this.fields = fields !== undefined ? { ...fields } : undefined;
  }
}
