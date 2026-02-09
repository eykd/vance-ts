const ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
};

const ESCAPE_REGEX = /[&<>"']/g;

/**
 * Escapes HTML special characters to prevent XSS attacks.
 *
 * Replaces `& < > " '` with their corresponding HTML entities.
 *
 * @param str - The string to escape
 * @returns The escaped string safe for HTML insertion
 */
export function escapeHtml(str: string): string {
  return str.replace(
    ESCAPE_REGEX,
    /* istanbul ignore next -- regex only matches keys present in ESCAPE_MAP */
    (char) => ESCAPE_MAP[char] ?? char
  );
}

/**
 * Tagged template literal that auto-escapes interpolated values.
 *
 * Static template parts are left as-is (they are trusted developer markup).
 * Interpolated values are escaped via {@link escapeHtml} to prevent XSS.
 *
 * @param strings - The static template parts
 * @param values - The interpolated values to escape
 * @returns The assembled HTML string with escaped interpolations
 */
export function html(strings: TemplateStringsArray, ...values: unknown[]): string {
  let result = '';
  for (let i = 0; i < strings.length; i++) {
    result += strings[i];
    if (i < values.length) {
      result += escapeHtml(String(values[i]));
    }
  }
  return result;
}
