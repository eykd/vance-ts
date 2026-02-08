/**
 * Domain error types for the authentication system.
 *
 * All errors extend DomainError and include a machine-readable error code
 * for identifying error types.
 */

export { DomainError } from './DomainError';
export { ValidationError } from './ValidationError';
export { ConflictError } from './ConflictError';
export { UnauthorizedError } from './UnauthorizedError';
export { NotFoundError } from './NotFoundError';
export { RateLimitError } from './RateLimitError';
