/**
 * Shared domain validation helpers.
 *
 * Centralises common input validation used across entity factory methods.
 * Returns Result types instead of throwing to represent validation failures
 * as values.
 *
 * @module
 */

import { DomainError } from '../errors/DomainError.js';

import type { Result } from './Result.js';
import { err, ok } from './Result.js';

/**
 * Returns a failure Result if the string is empty or whitespace-only.
 *
 * @param value - The string to validate.
 * @param errorCode - The error code for the failure.
 * @returns Ok on valid input, or an error Result with a DomainError.
 */
export function requireNonBlank(value: string, errorCode: string): Result<void, DomainError> {
  if (value.trim().length === 0) {
    return err(new DomainError(errorCode));
  }
  return ok(undefined);
}

/**
 * Returns a failure Result if the string exceeds the maximum length.
 *
 * @param value - The string to validate.
 * @param max - The maximum allowed length.
 * @param errorCode - The error code for the failure.
 * @returns Ok on valid input, or an error Result with a DomainError.
 */
export function requireMaxLength(
  value: string,
  max: number,
  errorCode: string
): Result<void, DomainError> {
  if (value.length > max) {
    return err(new DomainError(errorCode));
  }
  return ok(undefined);
}
