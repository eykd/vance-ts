import { type DomainError } from '../../domain/errors';
import { ConflictError } from '../../domain/errors/ConflictError';
import { NotFoundError } from '../../domain/errors/NotFoundError';
import { RateLimitError } from '../../domain/errors/RateLimitError';
import { UnauthorizedError } from '../../domain/errors/UnauthorizedError';
import { ValidationError } from '../../domain/errors/ValidationError';
import type { Logger } from '../../domain/interfaces/Logger';

/**
 * Maps domain error types to HTTP status codes.
 *
 * This function belongs in the presentation layer because HTTP status codes
 * are an HTTP concern, not a domain concern. Domain errors express business
 * rule violations; this mapper translates them to the HTTP protocol.
 *
 * @param error - A domain error to map
 * @param logger - Logger for warning about unmapped error types
 * @returns The appropriate HTTP status code
 */
export function mapErrorToStatusCode(error: DomainError, logger: Logger): number {
  if (error instanceof ValidationError) return 422;
  if (error instanceof UnauthorizedError) return 401;
  if (error instanceof NotFoundError) return 404;
  if (error instanceof ConflictError) return 409;
  if (error instanceof RateLimitError) return 429;
  logger.warn(`Unmapped domain error type: ${error.name} (code: ${error.code})`);
  return 500;
}

/**
 * Returns a generic, safe error message for client-facing responses.
 *
 * SECURITY: Never expose internal error details (database errors, stack
 * traces, internal IDs). This function returns only safe, generic messages
 * that do not reveal system internals or aid attackers.
 *
 * @param error - A domain error to generate a safe message for
 * @returns A generic message safe for client display
 */
export function getGenericErrorMessage(error: DomainError): string {
  if (error instanceof ValidationError) return 'Invalid request data';
  if (error instanceof UnauthorizedError) return 'Authentication required';
  if (error instanceof NotFoundError) return 'Resource not found';
  if (error instanceof ConflictError) return 'Resource already exists';
  if (error instanceof RateLimitError) return 'Too many requests. Please try again later.';
  return 'An error occurred';
}
