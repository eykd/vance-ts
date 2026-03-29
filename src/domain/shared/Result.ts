/**
 * Result type for representing success or failure without throwing exceptions.
 *
 * Used throughout the domain layer to make error paths explicit in function
 * signatures rather than relying on thrown exceptions.
 *
 * @module
 */

/**
 * A discriminated union representing either a successful value or a failure.
 *
 * @template T - The type of the success value.
 * @template E - The type of the error value.
 */
export type Result<T, E = Error> = { success: true; value: T } | { success: false; error: E };

/**
 * Creates a successful Result wrapping the given value.
 *
 * @param value - The success value.
 * @returns A Result indicating success.
 */
export function ok<T>(value: T): Result<T, never> {
  return { success: true, value };
}

/**
 * Creates a failed Result wrapping the given error.
 *
 * @param error - The error value.
 * @returns A Result indicating failure.
 */
export function err<E>(error: E): Result<never, E> {
  return { success: false, error };
}
