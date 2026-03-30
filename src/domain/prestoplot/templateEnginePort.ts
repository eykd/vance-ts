/**
 * Template engine port interface.
 *
 * Defines the contract for evaluating template expressions in rendered
 * text. The engine resolves references against a context of already-rendered
 * rule outputs and variables.
 *
 * @module domain/prestoplot/templateEnginePort
 */

/**
 * Port for evaluating template expressions in rendered text.
 *
 * Implementations handle specific template syntaxes (e.g., Jinja2 subset)
 * while keeping the application layer decoupled from parsing details.
 */
export interface TemplateEnginePort {
  /**
   * Evaluate template expressions in the given text.
   *
   * Resolves references against the provided context (rule outputs, variables).
   * Returns plain text with all expressions replaced.
   *
   * @param template - The text containing template expressions.
   * @param context - Map of variable names to already-rendered string values.
   * @param depth - Current recursion depth for cycle detection.
   * @returns Plain text with all expressions resolved.
   * @throws {import('./errors.js').TemplateError} On unresolvable references, syntax errors, or depth exceeding MAX_DEPTH (50).
   */
  evaluate(template: string, context: Readonly<Record<string, string>>, depth: number): string;
}
