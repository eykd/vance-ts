/**
 * SQL writer module for generating batched INSERT statements.
 *
 * @module sql-writer
 */

/**
 * Escapes a string for safe inclusion in SQL by doubling single quotes.
 *
 * @param value - The string to escape
 * @returns The escaped string
 */
export function escapeSQL(value: string): string {
  return value.replace(/'/g, "''");
}
