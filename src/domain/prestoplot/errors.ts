/**
 * Prestoplot domain error types.
 *
 * All errors extend DomainError and carry machine-readable codes
 * for programmatic handling without message parsing.
 *
 * @module domain/prestoplot/errors
 */

import { DomainError } from '../errors/DomainError.js';

/**
 * Error raised when a YAML grammar file fails structural validation.
 *
 * Examples: unknown rule type, missing entry rule, invalid weight.
 */
export class GrammarParseError extends DomainError {
  /**
   * Creates a new GrammarParseError.
   *
   * @param code - Machine-readable error code.
   * @param message - Optional human-readable message; defaults to code.
   */
  constructor(code: string, message?: string) {
    super(code, message);
    this.name = 'GrammarParseError';
  }
}

/**
 * Error raised when a referenced rule does not exist in the grammar.
 */
export class RuleNotFoundError extends DomainError {
  /** The name of the missing rule. */
  readonly ruleName: string;

  /**
   * Creates a new RuleNotFoundError.
   *
   * @param ruleName - The name of the rule that was not found.
   */
  constructor(ruleName: string) {
    super('rule_not_found', `Rule "${ruleName}" not found`);
    this.name = 'RuleNotFoundError';
    this.ruleName = ruleName;
  }
}

/**
 * Error raised when grammar includes form a cycle.
 */
export class CircularIncludeError extends DomainError {
  /** The include chain that formed the cycle. */
  readonly chain: readonly string[];

  /**
   * Creates a new CircularIncludeError.
   *
   * @param chain - The grammar keys forming the cycle (last repeats first).
   */
  constructor(chain: readonly string[]) {
    super('circular_include', `Circular include detected: ${chain.join(' → ')}`);
    this.name = 'CircularIncludeError';
    this.chain = [...chain];
  }
}

/**
 * Error raised when a seed value is invalid (e.g. empty string).
 */
export class InvalidSeedError extends DomainError {
  /**
   * Creates a new InvalidSeedError.
   *
   * @param message - Human-readable message describing the issue.
   */
  constructor(message: string) {
    super('invalid_seed', message);
    this.name = 'InvalidSeedError';
  }
}

/**
 * Error raised during template expression evaluation.
 */
export class TemplateError extends DomainError {
  /**
   * Creates a new TemplateError.
   *
   * @param code - Machine-readable error code.
   * @param message - Human-readable message.
   */
  constructor(code: string, message: string) {
    super(code, message);
    this.name = 'TemplateError';
  }
}

/**
 * Error raised during grammar storage operations.
 */
export class StorageError extends DomainError {
  /**
   * Creates a new StorageError.
   *
   * @param code - Machine-readable error code.
   * @param message - Human-readable message.
   * @param cause - Optional underlying error.
   */
  constructor(code: string, message: string, cause?: Error) {
    super(code, message);
    this.name = 'StorageError';
    if (cause !== undefined) {
      this.cause = cause;
    }
  }
}
