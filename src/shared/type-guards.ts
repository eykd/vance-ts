/**
 * Check that a value is a non-null object (not an array).
 *
 * @param v - The value to check
 * @returns True if v is a plain object
 */
export function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}
