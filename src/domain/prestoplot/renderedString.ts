/**
 * RenderedString value object — wraps generated text with rendering metadata.
 *
 * Immutable. Created via the `createRenderedString` factory.
 *
 * @module domain/prestoplot/renderedString
 */

/**
 * Immutable value object holding rendered text and its source rule name.
 */
export interface RenderedString {
  /** The rendered output text. */
  readonly text: string;

  /** The name of the rule that produced this text. */
  readonly ruleName: string;

  /** Returns the rendered text. */
  toString(): string;
}

/**
 * Creates a new immutable RenderedString.
 *
 * @param text - The rendered output text.
 * @param ruleName - The name of the source rule.
 * @returns An immutable RenderedString value object.
 */
export function createRenderedString(text: string, ruleName: string): RenderedString {
  return Object.freeze({
    text,
    ruleName,
    toString(): string {
      return text;
    },
  });
}
