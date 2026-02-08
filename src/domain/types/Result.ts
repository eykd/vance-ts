/**
 * Result type for representing operations that can succeed or fail.
 *
 * Use this type instead of throwing errors from use cases. This makes
 * error handling explicit and forces callers to handle both success
 * and failure cases.
 *
 * @template T - The type of the success value
 * @template E - The type of the error (defaults to Error)
 *
 * @example
 * ```typescript
 * function divide(a: number, b: number): Result<number, string> {
 *   if (b === 0) {
 *     return err('Cannot divide by zero');
 *   }
 *   return ok(a / b);
 * }
 *
 * const result = divide(10, 2);
 * if (result.success) {
 *   console.log(result.value); // 5
 * } else {
 *   console.error(result.error);
 * }
 * ```
 */
export type Result<T, E = Error> =
  | { readonly success: true; readonly value: T }
  | { readonly success: false; readonly error: E };

/**
 * Creates a successful Result.
 *
 * @param value - The success value to wrap
 * @returns A Result representing success
 */
export function ok<T>(value: T): Result<T, never> {
  return { success: true, value };
}

/**
 * Creates a failed Result.
 *
 * @param error - The error to wrap
 * @returns A Result representing failure
 */
export function err<E>(error: E): Result<never, E> {
  return { success: false, error };
}
