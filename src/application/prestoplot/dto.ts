/**
 * Grammar DTO conversion functions and runtime type guards.
 *
 * Converts between domain {@link Grammar} aggregates and persistence-layer
 * {@link GrammarDto} objects. The DTO format uses version 1, with plain
 * objects for rule serialization (Map fields become plain objects).
 *
 * @module application/prestoplot/dto
 */

import { GrammarParseError } from '../../domain/prestoplot/errors.js';
import {
  type Grammar,
  type ListRule,
  type RenderStrategy,
  type Rule,
  type SelectionMode,
  type StructRule,
  type TextRule,
  createGrammar,
} from '../../domain/prestoplot/grammar.js';
import type { Result } from '../../domain/shared/Result.js';

import type { GrammarDto } from './GrammarStorage.js';

/** Current DTO schema version. */
const DTO_VERSION = 1;

// ---------------------------------------------------------------------------
// Runtime type guard
// ---------------------------------------------------------------------------

/**
 * Runtime type guard for {@link GrammarDto}.
 *
 * Validates that a value has the correct shape and version for a GrammarDto.
 *
 * @param value - The value to check.
 * @returns True if value is a valid GrammarDto with version 1.
 */
export function isGrammarDto(value: unknown): value is GrammarDto {
  if (value === null || value === undefined || typeof value !== 'object') {
    return false;
  }
  const obj = value as Record<string, unknown>;
  return (
    obj['version'] === DTO_VERSION &&
    typeof obj['key'] === 'string' &&
    typeof obj['entry'] === 'string' &&
    Array.isArray(obj['includes']) &&
    typeof obj['rules'] === 'object' &&
    obj['rules'] !== null &&
    !Array.isArray(obj['rules'])
  );
}

// ---------------------------------------------------------------------------
// grammarToDto
// ---------------------------------------------------------------------------

/**
 * Serializes a rule to a plain object for DTO storage.
 *
 * @param rule - The domain rule to serialize.
 * @returns A plain object representing the rule.
 */
function ruleToPlain(rule: Rule): Record<string, unknown> {
  switch (rule.type) {
    case 'text':
      return {
        name: rule.name,
        type: rule.type,
        alternatives: rule.alternatives.map((a) => ({ text: a.text, weight: a.weight })),
        strategy: rule.strategy,
      };
    case 'list':
      return {
        name: rule.name,
        type: rule.type,
        items: [...rule.items],
        selectionMode: rule.selectionMode,
        strategy: rule.strategy,
      };
    case 'struct':
      return {
        name: rule.name,
        type: rule.type,
        fields: Object.fromEntries(rule.fields),
        template: rule.template,
      };
  }
}

/**
 * Converts a domain {@link Grammar} to a {@link GrammarDto}.
 *
 * @param grammar - The domain grammar aggregate.
 * @returns A GrammarDto with version 1.
 */
export function grammarToDto(grammar: Grammar): GrammarDto {
  const rules: Record<string, unknown> = {};
  for (const [name, rule] of grammar.rules) {
    rules[name] = ruleToPlain(rule);
  }
  return {
    version: DTO_VERSION,
    key: grammar.key,
    entry: grammar.entry,
    includes: [...grammar.includes],
    rules,
  };
}

// ---------------------------------------------------------------------------
// grammarFromDto
// ---------------------------------------------------------------------------

/**
 * Deserializes a plain rule object back to a domain Rule.
 *
 * @param raw - The raw serialized rule.
 * @param key - The map key for this rule, used as fallback name.
 * @returns Ok with a Rule, or Err with GrammarParseError.
 */
function ruleFromPlain(raw: unknown, key: string): Result<Rule, GrammarParseError> {
  if (raw === null || raw === undefined || typeof raw !== 'object' || Array.isArray(raw)) {
    return {
      success: false,
      error: new GrammarParseError('invalid_rule', 'Rule must be a non-null object'),
    };
  }

  const obj = raw as Record<string, unknown>;
  const type = obj['type'];

  if (typeof type !== 'string') {
    return {
      success: false,
      error: new GrammarParseError('invalid_rule', 'Rule type must be a string'),
    };
  }

  switch (type) {
    case 'text': {
      const name = typeof obj['name'] === 'string' ? obj['name'] : key;
      const alternatives = obj['alternatives'];
      const strategy = obj['strategy'];
      if (!Array.isArray(alternatives) || typeof strategy !== 'string') {
        return {
          success: false,
          error: new GrammarParseError(
            'invalid_rule',
            'Text rule has invalid alternatives or strategy'
          ),
        };
      }
      return {
        success: true,
        value: {
          name,
          type: 'text',
          alternatives: (alternatives as Array<{ text: string; weight: number }>).map((a) => ({
            text: a.text,
            weight: a.weight,
          })),
          strategy: strategy as RenderStrategy,
        } satisfies TextRule,
      };
    }
    case 'list': {
      const name = typeof obj['name'] === 'string' ? obj['name'] : key;
      const items = obj['items'];
      const selectionMode = obj['selectionMode'];
      const strategy = obj['strategy'];
      if (
        !Array.isArray(items) ||
        typeof selectionMode !== 'string' ||
        typeof strategy !== 'string'
      ) {
        return {
          success: false,
          error: new GrammarParseError(
            'invalid_rule',
            'List rule has invalid items, selectionMode, or strategy'
          ),
        };
      }
      return {
        success: true,
        value: {
          name,
          type: 'list',
          items: items as string[],
          selectionMode: selectionMode as SelectionMode,
          strategy: strategy as RenderStrategy,
        } satisfies ListRule,
      };
    }
    case 'struct': {
      const name = typeof obj['name'] === 'string' ? obj['name'] : key;
      const fields = obj['fields'];
      const template = obj['template'];
      if (
        fields === null ||
        fields === undefined ||
        typeof fields !== 'object' ||
        Array.isArray(fields) ||
        typeof template !== 'string'
      ) {
        return {
          success: false,
          error: new GrammarParseError(
            'invalid_rule',
            'Struct rule has invalid fields or template'
          ),
        };
      }
      return {
        success: true,
        value: {
          name,
          type: 'struct',
          fields: new Map(Object.entries(fields as Record<string, string>)),
          template,
        } satisfies StructRule,
      };
    }
    default:
      return {
        success: false,
        error: new GrammarParseError('unknown_rule_type', `Unknown rule type "${String(type)}"`),
      };
  }
}

/**
 * Converts a {@link GrammarDto} back to a domain {@link Grammar}.
 *
 * @param dto - The DTO to convert.
 * @returns Ok with a Grammar, or Err with GrammarParseError.
 */
export function grammarFromDto(dto: GrammarDto): Result<Grammar, GrammarParseError> {
  if (dto.version !== DTO_VERSION) {
    return {
      success: false,
      error: new GrammarParseError(
        'unsupported_version',
        `Unsupported DTO version: ${String(dto.version)}`
      ),
    };
  }

  const rules = new Map<string, Rule>();
  for (const [name, raw] of Object.entries(dto.rules)) {
    const result = ruleFromPlain(raw, name);
    if (!result.success) {
      return result;
    }
    rules.set(name, result.value);
  }

  return createGrammar(dto.key, rules, dto.entry, dto.includes as string[]);
}
