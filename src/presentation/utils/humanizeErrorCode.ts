/**
 * Converts a snake_case error code to a human-readable sentence.
 *
 * Replaces underscores with spaces and capitalizes the first letter.
 *
 * @param code - Machine-readable error code (e.g. `'action_not_found'`).
 * @returns Human-readable message (e.g. `'Action not found'`).
 */
export function humanizeErrorCode(code: string): string {
  const words = code.replace(/_/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}
