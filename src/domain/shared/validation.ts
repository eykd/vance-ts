/**
 * Shared domain validation helpers.
 *
 * Centralises common input validation used across entity factory methods.
 *
 * @module
 */

import { DomainError } from '../errors/DomainError.js';

/**
 * Throws a DomainError if the string is empty or whitespace-only.
 *
 * @param value - The string to validate.
 * @param errorCode - The error code to throw.
 */
export function requireNonBlank(value: string, errorCode: string): void {
  if (value.trim().length === 0) {
    throw new DomainError(errorCode);
  }
}

/**
 * Throws a DomainError if the string exceeds the maximum length.
 *
 * @param value - The string to validate.
 * @param max - The maximum allowed length.
 * @param errorCode - The error code to throw.
 */
export function requireMaxLength(value: string, max: number, errorCode: string): void {
  if (value.length > max) {
    throw new DomainError(errorCode);
  }
}
