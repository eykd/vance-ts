/**
 * Shared utilities for prestoplot storage adapters.
 *
 * @module infrastructure/prestoplot/storageUtils
 */

import { StorageError } from '../../domain/prestoplot/errors.js';

/**
 * Wraps an unknown error as a StorageError.
 *
 * @param code - Machine-readable error code.
 * @param message - Human-readable message.
 * @param cause - The underlying error.
 * @returns A StorageError wrapping the cause.
 */
export function wrapError(code: string, message: string, cause: unknown): StorageError {
  const err = cause instanceof Error ? cause : new Error(String(cause));
  return new StorageError(code, message, err);
}
