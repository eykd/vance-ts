/**
 * Base class for all domain-level errors.
 *
 * Domain errors represent violations of business rules or constraints
 * that occur within the domain layer. They should be caught and handled
 * by use cases, never thrown directly to the presentation layer.
 */
export abstract class DomainError extends Error {
  /**
   * Machine-readable error code for error identification.
   */
  abstract readonly code: string;

  /**
   * Creates a new domain error.
   *
   * @param message - Human-readable error description
   */
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
