/**
 * Grammar aggregate root and related domain types.
 *
 * A Grammar is a named collection of rules that together produce rendered text.
 * Rules come in three types: TextRule (weighted alternatives), ListRule (ordered
 * items with a selection mode), and StructRule (key-value fields with a template).
 *
 * @module domain/prestoplot/grammar
 */

import type { Result } from '../shared/Result.js';

import { GrammarParseError } from './errors.js';

/**
 * How alternatives are chosen from a list rule.
 */
export enum SelectionMode {
  /** With replacement — items may repeat. */
  REUSE = 'REUSE',
  /** Without replacement — Fisher-Yates shuffle per epoch. */
  PICK = 'PICK',
  /** Sequential cycling — 0, 1, 2, ..., 0, 1, 2, ... */
  RATCHET = 'RATCHET',
  /** Character-level Markov chain generation. */
  MARKOV = 'MARKOV',
  /** Index access — returns item at given index. */
  LIST = 'LIST',
}

/**
 * Whether rendered text contains template expressions or is literal.
 */
export enum RenderStrategy {
  /** Text contains {{ expression }} markers to evaluate. */
  TEMPLATE = 'TEMPLATE',
  /** Text is literal — no template processing. */
  PLAIN = 'PLAIN',
}

/**
 * A text alternative with a selection weight.
 */
export interface WeightedAlternative {
  /** Template string or plain text. */
  readonly text: string;
  /** Positive number, default 1. */
  readonly weight: number;
}

/**
 * A rule that selects from weighted text alternatives.
 */
export interface TextRule {
  /** Unique name within grammar. */
  readonly name: string;
  /** Discriminant for the Rule union. */
  readonly type: 'text';
  /** At least one weighted alternative. */
  readonly alternatives: readonly WeightedAlternative[];
  /** Whether text contains template expressions. */
  readonly strategy: RenderStrategy;
}

/**
 * A rule that selects from an ordered list of items.
 */
export interface ListRule {
  /** Unique name within grammar. */
  readonly name: string;
  /** Discriminant for the Rule union. */
  readonly type: 'list';
  /** At least one item. */
  readonly items: readonly string[];
  /** How items are selected. */
  readonly selectionMode: SelectionMode;
  /** Whether items contain template expressions. */
  readonly strategy: RenderStrategy;
}

/**
 * A rule that composes fields into a template string.
 */
export interface StructRule {
  /** Unique name within grammar. */
  readonly name: string;
  /** Discriminant for the Rule union. */
  readonly type: 'struct';
  /** Field name → rule name or literal value. */
  readonly fields: ReadonlyMap<string, string>;
  /** Template with {{ field }} references. */
  readonly template: string;
}

/**
 * Discriminated union of all rule types.
 */
export type Rule = TextRule | ListRule | StructRule;

/**
 * Grammar aggregate root — a named collection of rules.
 */
export interface Grammar {
  /** Unique identifier. */
  readonly key: string;
  /** All rules in this grammar. */
  readonly rules: ReadonlyMap<string, Rule>;
  /** Grammar keys to include (resolved transitively). */
  readonly includes: readonly string[];
  /** Default rule name to render. */
  readonly entry: string;
}

/**
 * Creates a validated Grammar aggregate.
 *
 * @param key - Unique grammar identifier.
 * @param rules - Map of rule name to Rule.
 * @param entry - The default rule name to render.
 * @param includes - Optional list of grammar keys to include.
 * @returns Ok with a Grammar, or Err with GrammarParseError.
 */
export function createGrammar(
  key: string,
  rules: ReadonlyMap<string, Rule>,
  entry: string,
  includes: readonly string[] = []
): Result<Grammar, GrammarParseError> {
  if (key.length === 0) {
    return {
      success: false,
      error: new GrammarParseError('invalid_key', 'Grammar key must not be empty'),
    };
  }

  if (rules.size === 0) {
    return {
      success: false,
      error: new GrammarParseError('empty_grammar', 'Grammar must contain at least one rule'),
    };
  }

  if (!rules.has(entry)) {
    return {
      success: false,
      error: new GrammarParseError(
        'entry_not_found',
        `Entry rule "${entry}" not found in grammar rules`
      ),
    };
  }

  return {
    success: true,
    value: Object.freeze({
      key,
      rules,
      includes: Object.freeze([...includes]),
      entry,
    }),
  };
}
