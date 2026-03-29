/**
 * DomainError — base error class for domain rule violations.
 *
 * Thrown by entity factory functions and domain methods when business
 * invariants are violated (e.g. invalid state transitions, validation failures).
 *
 * @module
 */

/**
 * Error thrown when a domain business rule is violated.
 *
 * Always carries a machine-readable `code` string so callers can
 * distinguish error categories without parsing message strings.
 */
export class DomainError extends Error {
  /** Machine-readable error code (e.g. `'name_required'`, `'already_archived'`). */
  readonly code: string;

  /**
   * Creates a new DomainError.
   *
   * @param code - Machine-readable error code.
   * @param message - Optional human-readable message; defaults to `code`.
   */
  constructor(code: string, message?: string) {
    super(message ?? code);
    this.name = 'DomainError';
    this.code = code;
  }
}
