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
 * Error raised when per-render evaluation count exceeds MAX_EVALUATIONS.
 *
 * Guards against exponential-time grammar expansion from branching mutual recursion.
 */
export class RenderBudgetError extends DomainError {
  /** The evaluation count at the time the limit was exceeded. */
  readonly evaluationCount: number;

  /**
   * Creates a new RenderBudgetError.
   *
   * @param evaluationCount - The evaluation count when the limit was hit.
   */
  constructor(evaluationCount: number) {
    super('render_budget', `Render budget exceeded: ${String(evaluationCount)} evaluations`);
    this.name = 'RenderBudgetError';
    this.evaluationCount = evaluationCount;
  }
}

/**
 * Error raised when include chain depth exceeds MAX_INCLUDE_DEPTH.
 */
export class IncludeDepthError extends DomainError {
  /** The grammar module that triggered the depth limit. */
  readonly moduleName: string;

  /** The depth at the time the limit was exceeded. */
  readonly depth: number;

  /**
   * Creates a new IncludeDepthError.
   *
   * @param moduleName - The grammar module at the depth limit.
   * @param depth - The depth when the limit was hit.
   */
  constructor(moduleName: string, depth: number) {
    super('include_depth', `Include depth exceeded at "${moduleName}" (depth ${String(depth)})`);
    this.name = 'IncludeDepthError';
    this.moduleName = moduleName;
    this.depth = depth;
  }
}

/**
 * Error raised when total resolved grammars exceed MAX_INCLUDE_COUNT.
 */
export class IncludeLimitError extends DomainError {
  /** The count of resolved grammars when the limit was exceeded. */
  readonly count: number;

  /**
   * Creates a new IncludeLimitError.
   *
   * @param count - The grammar count when the limit was hit.
   */
  constructor(count: number) {
    super('include_limit', `Include limit exceeded: ${String(count)} grammars resolved`);
    this.name = 'IncludeLimitError';
    this.count = count;
  }
}

/**
 * Error raised when an included grammar module cannot be found in storage.
 */
export class ModuleNotFoundError extends DomainError {
  /** The key of the missing grammar module. */
  readonly moduleName: string;

  /**
   * Creates a new ModuleNotFoundError.
   *
   * @param moduleName - The grammar key that was not found.
   * @param message - Optional human-readable message; defaults to a standard message.
   */
  constructor(moduleName: string, message?: string) {
    super('module_not_found', message ?? `Included grammar "${moduleName}" not found in storage`);
    this.name = 'ModuleNotFoundError';
    this.moduleName = moduleName;
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
