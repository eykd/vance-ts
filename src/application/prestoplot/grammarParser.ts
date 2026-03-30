/**
 * Parses YAML grammar source into the Grammar domain type.
 *
 * Lives in the application layer; depends on the `yaml` npm package (v2.x,
 * CF-compatible). Validates grammar structure, rule types, naming conventions,
 * and security constraints at parse time.
 *
 * @module application/prestoplot/grammarParser
 */

import { parse as yamlParse } from 'yaml';

import { GrammarParseError } from '../../domain/prestoplot/errors.js';
import {
  type Grammar,
  type ListRule,
  type Rule,
  RenderStrategy,
  SelectionMode,
  type StructRule,
  type TextRule,
  type WeightedAlternative,
  createGrammar,
} from '../../domain/prestoplot/grammar.js';
import { MAX_MARKOV_CORPUS_PRODUCT } from '../../domain/prestoplot/markovChain.js';
import { type Result, err, ok } from '../../domain/shared/Result.js';

import { GRAMMAR_KEY_PATTERN } from './constants.js';

/** Maximum YAML source size in UTF-16 code units (256 KB). */
export const MAX_GRAMMAR_SOURCE_BYTES = 262_144;

/** Maximum template string length per rule. */
export const MAX_TEMPLATE_LENGTH = 10_000;

/** Maximum Markov order value. */
export const MAX_MARKOV_ORDER = 10;

/** Pattern for valid rule names: starts with letter or underscore, alphanumeric + underscore. */
const RULE_NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

/** Reserved top-level YAML keys that are not rule names. */
const RESERVED_KEYS = new Set(['include', 'render']);

/** JavaScript prototype property names that must not be used as rule names. */
const REJECTED_RULE_NAMES = new Set([
  'constructor',
  'toString',
  'valueOf',
  '__proto__',
  'hasOwnProperty',
  'isPrototypeOf',
  'propertyIsEnumerable',
  '__defineGetter__',
  '__defineSetter__',
  '__lookupGetter__',
  '__lookupSetter__',
]);

/** Result type for grammar parsing operations. */
type ParseResult = Result<Grammar, GrammarParseError>;

/** Result type for individual rule parsing operations. */
type RuleResult = Result<Rule, GrammarParseError>;

/**
 * Parses a YAML grammar source string into a validated Grammar domain object.
 *
 * @param source - Raw YAML string.
 * @param moduleName - Grammar key / module name (used in entry and error messages).
 * @returns Ok with a Grammar, or Err with GrammarParseError.
 */
export function parseGrammar(source: string, moduleName: string): ParseResult {
  const sizeCheck = validateSourceSize(source);
  if (!sizeCheck.success) {
    return sizeCheck;
  }

  const keyCheck = validateGrammarKey(moduleName);
  if (!keyCheck.success) {
    return keyCheck;
  }

  const docResult = parseYaml(source, moduleName);
  if (!docResult.success) {
    return docResult;
  }
  const doc = docResult.value;

  const includesResult = extractIncludes(doc, moduleName);
  if (!includesResult.success) {
    return includesResult;
  }

  const strategyResult = extractRenderStrategy(doc, moduleName);
  if (!strategyResult.success) {
    return strategyResult;
  }

  const rulesResult = extractRules(doc, moduleName, strategyResult.value);
  if (!rulesResult.success) {
    return rulesResult;
  }

  return createGrammar(moduleName, rulesResult.value, 'Begin', includesResult.value);
}

/**
 * Validates that the YAML source does not exceed the maximum size.
 *
 * @param source - Raw YAML source string.
 * @returns Ok on success, Err if source exceeds MAX_GRAMMAR_SOURCE_BYTES.
 */
function validateSourceSize(source: string): Result<void, GrammarParseError> {
  if (source.length > MAX_GRAMMAR_SOURCE_BYTES) {
    return err(
      new GrammarParseError('source_too_large', 'Grammar source exceeds maximum size of 256KB')
    );
  }
  return ok(undefined);
}

/**
 * Validates that a grammar key matches the required pattern.
 *
 * @param key - Grammar key to validate.
 * @returns Ok on success, Err if key is invalid.
 */
function validateGrammarKey(key: string): Result<void, GrammarParseError> {
  if (!GRAMMAR_KEY_PATTERN.test(key)) {
    return err(
      new GrammarParseError(
        'invalid_key',
        `Grammar key "${key}" must match pattern ${GRAMMAR_KEY_PATTERN.toString()}`
      )
    );
  }
  return ok(undefined);
}

/**
 * Parses YAML source with safety options.
 *
 * @param source - Raw YAML string.
 * @param moduleName - Module name for error messages.
 * @returns Ok with parsed document, Err on YAML parse failure.
 */
function parseYaml(
  source: string,
  moduleName: string
): Result<Record<string, unknown>, GrammarParseError> {
  let doc: unknown;
  try {
    doc = yamlParse(source, {
      schema: 'json',
      maxAliasCount: 100,
      uniqueKeys: true,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return err(
      new GrammarParseError('yaml_parse_error', `YAML parse error in "${moduleName}": ${message}`)
    );
  }

  if (doc === null || doc === undefined || typeof doc !== 'object' || Array.isArray(doc)) {
    return err(
      new GrammarParseError('invalid_structure', `Grammar "${moduleName}" must be a YAML mapping`)
    );
  }

  return ok(doc as Record<string, unknown>);
}

/**
 * Extracts the optional include list from the parsed YAML.
 *
 * @param doc - Parsed YAML document.
 * @param moduleName - Module name for error messages.
 * @returns Ok with include list, Err if include is not a string array.
 */
function extractIncludes(
  doc: Record<string, unknown>,
  moduleName: string
): Result<readonly string[], GrammarParseError> {
  const raw = doc['include'];
  if (raw === undefined || raw === null) {
    return ok([]);
  }
  if (!Array.isArray(raw)) {
    return err(
      new GrammarParseError(
        'invalid_includes',
        `Grammar "${moduleName}": "include" must be an array of strings`
      )
    );
  }
  for (const item of raw) {
    if (typeof item !== 'string') {
      return err(
        new GrammarParseError(
          'invalid_includes',
          `Grammar "${moduleName}": "include" items must be strings, got ${typeof item}`
        )
      );
    }
    if (!GRAMMAR_KEY_PATTERN.test(item)) {
      return err(
        new GrammarParseError(
          'invalid_includes',
          `Grammar "${moduleName}": include key "${item}" must match pattern ${GRAMMAR_KEY_PATTERN.toString()}`
        )
      );
    }
  }
  return ok(raw as string[]);
}

/**
 * Extracts the optional render strategy from the parsed YAML.
 *
 * @param doc - Parsed YAML document.
 * @param moduleName - Module name for error messages.
 * @returns Ok with render strategy, Err if unrecognized.
 */
function extractRenderStrategy(
  doc: Record<string, unknown>,
  moduleName: string
): Result<RenderStrategy, GrammarParseError> {
  const raw = doc['render'];
  if (raw === undefined || raw === null) {
    return ok(RenderStrategy.TEMPLATE);
  }
  if (typeof raw !== 'string') {
    return err(
      new GrammarParseError(
        'invalid_render_strategy',
        `Grammar "${moduleName}": "render" must be a string`
      )
    );
  }
  const lower = raw.toLowerCase();
  if (lower === 'ftemplate' || lower === 'jinja2') {
    return ok(RenderStrategy.TEMPLATE);
  }
  if (lower === 'plain') {
    return ok(RenderStrategy.PLAIN);
  }
  return err(
    new GrammarParseError(
      'invalid_render_strategy',
      `Grammar "${moduleName}": unknown render strategy "${raw}"`
    )
  );
}

/**
 * Extracts and validates all rules from the parsed YAML document.
 *
 * @param doc - Parsed YAML document.
 * @param moduleName - Module name for error messages.
 * @param defaultStrategy - Default render strategy for rules.
 * @returns Ok with rules map, Err on invalid rule structure.
 */
function extractRules(
  doc: Record<string, unknown>,
  moduleName: string,
  defaultStrategy: RenderStrategy
): Result<Map<string, Rule>, GrammarParseError> {
  const rules = new Map<string, Rule>();

  for (const [key, value] of Object.entries(doc)) {
    if (RESERVED_KEYS.has(key)) {
      continue;
    }

    const nameCheck = validateRuleName(key, moduleName);
    if (!nameCheck.success) {
      return nameCheck;
    }

    const ruleResult = parseRule(key, value, moduleName, defaultStrategy);
    if (!ruleResult.success) {
      return ruleResult;
    }
    rules.set(key, ruleResult.value);
  }

  return ok(rules);
}

/**
 * Validates a rule name against naming constraints.
 *
 * @param name - Rule name to validate.
 * @param moduleName - Module name for error messages.
 * @returns Ok on success, Err if the rule name is invalid.
 */
function validateRuleName(name: string, moduleName: string): Result<void, GrammarParseError> {
  if (!RULE_NAME_PATTERN.test(name)) {
    return err(
      new GrammarParseError(
        'invalid_rule_name',
        `Grammar "${moduleName}": rule name "${name}" must match pattern ${RULE_NAME_PATTERN.toString()}`
      )
    );
  }
  if (REJECTED_RULE_NAMES.has(name)) {
    return err(
      new GrammarParseError(
        'invalid_rule_name',
        `Grammar "${moduleName}": rule name "${name}" is a reserved JavaScript identifier`
      )
    );
  }
  if (name.includes('-')) {
    return err(
      new GrammarParseError(
        'invalid_rule_name',
        `Grammar "${moduleName}": rule name "${name}" must not contain hyphens (used as seed separator)`
      )
    );
  }
  return ok(undefined);
}

/**
 * Parses a single rule from its YAML value, inferring the rule type.
 *
 * @param name - Rule name.
 * @param value - Raw YAML value.
 * @param moduleName - Module name for error messages.
 * @param defaultStrategy - Default render strategy.
 * @returns Ok with a Rule, Err on invalid rule structure.
 */
function parseRule(
  name: string,
  value: unknown,
  moduleName: string,
  defaultStrategy: RenderStrategy
): RuleResult {
  if (typeof value === 'string') {
    return parseTextRule(name, value, moduleName, defaultStrategy);
  }
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return err(
        new GrammarParseError(
          'empty_alternatives',
          `Grammar "${moduleName}": rule "${name}" must have at least one item or weighted alternative`
        )
      );
    }
    if (hasWeightedAlternatives(value)) {
      return parseWeightedAlternatives(name, value, moduleName, defaultStrategy);
    }
    return parseListRule(name, value, moduleName, defaultStrategy);
  }
  if (typeof value === 'object' && value !== null) {
    return parseStructRule(name, value as Record<string, unknown>, moduleName);
  }
  return err(
    new GrammarParseError(
      'unknown_rule_type',
      `Grammar "${moduleName}": rule "${name}" has unsupported YAML type ${typeof value}`
    )
  );
}

/**
 * Parses a TextRule from a YAML string value.
 *
 * @param name - Rule name.
 * @param value - The string value.
 * @param moduleName - Module name for error messages.
 * @param strategy - Render strategy.
 * @returns Ok with a TextRule, Err if template exceeds length limit.
 */
function parseTextRule(
  name: string,
  value: string,
  moduleName: string,
  strategy: RenderStrategy
): Result<TextRule, GrammarParseError> {
  const normalized = normalizeText(value);

  if (normalized.length > MAX_TEMPLATE_LENGTH) {
    return err(
      new GrammarParseError(
        'template_too_long',
        `Grammar "${moduleName}": rule "${name}" template exceeds maximum length of ${String(MAX_TEMPLATE_LENGTH)}`
      )
    );
  }

  const alternatives: WeightedAlternative[] = [{ text: normalized, weight: 1 }];

  return ok({
    name,
    type: 'text' as const,
    alternatives,
    strategy: detectStrategy(normalized, strategy),
  });
}

/**
 * Detects whether a string contains template expressions.
 *
 * @param text - Text to inspect.
 * @param defaultStrategy - Default strategy to use.
 * @returns TEMPLATE if text contains expressions, otherwise the default.
 */
function detectStrategy(text: string, defaultStrategy: RenderStrategy): RenderStrategy {
  if (text.includes('{{') || /\{[A-Za-z_]/.test(text)) {
    return RenderStrategy.TEMPLATE;
  }
  return defaultStrategy;
}

/**
 * Checks if an array contains weighted alternative objects.
 * An array is weighted alternatives if any non-options item has a `text` key.
 *
 * @param value - Array to check.
 * @returns True if the array contains weighted alternative objects.
 */
function hasWeightedAlternatives(value: unknown[]): boolean {
  if (value.length === 0) {
    return false;
  }
  return isWeightedAlternativeObject(value[0]);
}

/**
 * Checks if a value is a weighted alternative object (mapping with a `text` key and no `mode` key).
 *
 * @param value - Value to check.
 * @returns True if value is a weighted alternative object.
 */
function isWeightedAlternativeObject(value: unknown): boolean {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    'text' in (value as Record<string, unknown>) &&
    !('mode' in (value as Record<string, unknown>))
  );
}

/**
 * Parses a list of weighted alternative objects into a TextRule.
 *
 * @param name - Rule name.
 * @param items - Array of weighted alternative objects.
 * @param moduleName - Module name for error messages.
 * @param defaultStrategy - Default render strategy.
 * @returns Ok with a TextRule, Err on invalid weighted alternative structure.
 */
function parseWeightedAlternatives(
  name: string,
  items: unknown[],
  moduleName: string,
  defaultStrategy: RenderStrategy
): Result<TextRule, GrammarParseError> {
  if (items.length === 0) {
    return err(
      new GrammarParseError(
        'empty_alternatives',
        `Grammar "${moduleName}": rule "${name}" must have at least one weighted alternative`
      )
    );
  }

  const alternatives: WeightedAlternative[] = [];
  let hasTemplate = false;

  for (let i = 0; i < items.length; i++) {
    const item = items[i] as Record<string, unknown>;
    const rawText = item['text'];

    if (typeof rawText !== 'string') {
      return err(
        new GrammarParseError(
          'invalid_weighted_text',
          `Grammar "${moduleName}": rule "${name}" weighted alternative at index ${String(i)}: text must be a string, got ${typeof rawText}`
        )
      );
    }

    const normalized = normalizeText(rawText);

    if (normalized.length > MAX_TEMPLATE_LENGTH) {
      return err(
        new GrammarParseError(
          'template_too_long',
          `Grammar "${moduleName}": rule "${name}" weighted alternative at index ${String(i)} template exceeds maximum length of ${String(MAX_TEMPLATE_LENGTH)}`
        )
      );
    }

    if (normalized.includes('{{') || /\{[A-Za-z_]/.test(normalized)) {
      hasTemplate = true;
    }

    const rawWeight = item['weight'];
    let weight = 1;
    if (rawWeight !== undefined && rawWeight !== null) {
      const weightCheck = validateWeight(rawWeight, name, i, moduleName);
      if (!weightCheck.success) {
        return weightCheck;
      }
      weight = weightCheck.value;
    }

    alternatives.push({ text: normalized, weight });
  }

  const strategy = hasTemplate ? RenderStrategy.TEMPLATE : defaultStrategy;

  return ok({
    name,
    type: 'text' as const,
    alternatives,
    strategy,
  });
}

/**
 * Validates that a weight is a positive finite number.
 *
 * @param raw - Raw weight value.
 * @param ruleName - Rule name for error messages.
 * @param index - Item index for error messages.
 * @param moduleName - Module name for error messages.
 * @returns Ok with validated weight, Err on invalid weight.
 */
function validateWeight(
  raw: unknown,
  ruleName: string,
  index: number,
  moduleName: string
): Result<number, GrammarParseError> {
  if (typeof raw !== 'number' || !Number.isFinite(raw) || raw <= 0) {
    return err(
      new GrammarParseError(
        'invalid_weight',
        `Grammar "${moduleName}": rule "${ruleName}" weight at index ${String(index)} must be a positive number, got ${String(raw)}`
      )
    );
  }
  return ok(raw);
}

/**
 * Parses a ListRule from a YAML array value.
 *
 * @param name - Rule name.
 * @param value - The array value.
 * @param moduleName - Module name for error messages.
 * @param defaultStrategy - Default render strategy.
 * @returns Ok with a ListRule, Err on invalid list structure.
 */
function parseListRule(
  name: string,
  value: unknown[],
  moduleName: string,
  defaultStrategy: RenderStrategy
): Result<ListRule, GrammarParseError> {
  let mode = SelectionMode.REUSE;
  let markovOrder: number | undefined;
  let startIndex = 0;

  // Check if first item is an options object
  if (value.length > 0 && isOptionsObject(value[0])) {
    const opts = value[0] as Record<string, unknown>;
    const modeResult = parseSelectionMode(opts['mode'], name, moduleName);
    if (!modeResult.success) {
      return modeResult;
    }
    mode = modeResult.value;

    if (mode === SelectionMode.MARKOV && opts['order'] !== undefined) {
      const orderResult = validateMarkovOrder(opts['order'], name, moduleName);
      if (!orderResult.success) {
        return orderResult;
      }
      markovOrder = orderResult.value;
    }

    startIndex = 1;
  }

  // Validate remaining items are strings
  const items: string[] = [];
  for (let i = startIndex; i < value.length; i++) {
    const item = value[i];
    if (typeof item !== 'string') {
      return err(
        new GrammarParseError(
          'invalid_list_item',
          `Grammar "${moduleName}": rule "${name}" list item at index ${String(i)} must be a string, got ${typeof item}`
        )
      );
    }
    items.push(item);
  }

  // MARKOV-specific validations
  if (mode === SelectionMode.MARKOV) {
    const markovCheck = validateMarkovItems(items, name, moduleName, markovOrder);
    if (!markovCheck.success) {
      return markovCheck;
    }
  }

  const strategy = mode === SelectionMode.MARKOV ? RenderStrategy.PLAIN : defaultStrategy;

  return ok({
    name,
    type: 'list' as const,
    items,
    selectionMode: mode,
    strategy,
  });
}

/**
 * Checks if a value is an options object (mapping with a `mode` key).
 *
 * @param value - Value to check.
 * @returns True if value is an options object.
 */
function isOptionsObject(value: unknown): boolean {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    'mode' in (value as Record<string, unknown>)
  );
}

/**
 * Parses and validates a selection mode string.
 *
 * @param raw - Raw mode value.
 * @param ruleName - Rule name for error messages.
 * @param moduleName - Module name for error messages.
 * @returns Ok with SelectionMode, Err on unrecognized mode.
 */
function parseSelectionMode(
  raw: unknown,
  ruleName: string,
  moduleName: string
): Result<SelectionMode, GrammarParseError> {
  if (typeof raw !== 'string') {
    return err(
      new GrammarParseError(
        'invalid_mode',
        `Grammar "${moduleName}": rule "${ruleName}" mode must be a string`
      )
    );
  }
  const upper = raw.toUpperCase();
  const valid: Record<string, SelectionMode> = {
    REUSE: SelectionMode.REUSE,
    PICK: SelectionMode.PICK,
    RATCHET: SelectionMode.RATCHET,
    MARKOV: SelectionMode.MARKOV,
    LIST: SelectionMode.LIST,
  };
  const result = valid[upper];
  if (result === undefined) {
    return err(
      new GrammarParseError(
        'invalid_mode',
        `Grammar "${moduleName}": rule "${ruleName}" has unrecognized mode "${raw}"`
      )
    );
  }
  return ok(result);
}

/**
 * Validates a Markov order value.
 *
 * @param raw - Raw order value.
 * @param ruleName - Rule name for error messages.
 * @param moduleName - Module name for error messages.
 * @returns Ok with validated order, Err on invalid order.
 */
function validateMarkovOrder(
  raw: unknown,
  ruleName: string,
  moduleName: string
): Result<number, GrammarParseError> {
  if (typeof raw !== 'number' || !Number.isInteger(raw) || raw < 1 || raw > MAX_MARKOV_ORDER) {
    return err(
      new GrammarParseError(
        'invalid_markov_order',
        `Grammar "${moduleName}": MARKOV rule "${ruleName}": order must be an integer between 1 and ${String(MAX_MARKOV_ORDER)}, got ${String(raw)}`
      )
    );
  }
  return ok(raw);
}

/**
 * Validates MARKOV-specific item constraints.
 *
 * @param items - List items.
 * @param ruleName - Rule name for error messages.
 * @param moduleName - Module name for error messages.
 * @param order - Optional Markov order.
 * @returns Ok on success, Err on MARKOV constraint violations.
 */
function validateMarkovItems(
  items: string[],
  ruleName: string,
  moduleName: string,
  order: number | undefined
): Result<void, GrammarParseError> {
  // Must have at least one non-empty item
  const nonEmpty = items.filter((item) => item.length > 0);
  if (nonEmpty.length === 0) {
    return err(
      new GrammarParseError(
        'invalid_markov_corpus',
        `Grammar "${moduleName}": MARKOV rule "${ruleName}" requires at least one non-empty training item`
      )
    );
  }

  // Items must not contain template syntax
  for (const item of items) {
    if (item.includes('{') || item.includes('{{')) {
      return err(
        new GrammarParseError(
          'invalid_markov_item',
          `Grammar "${moduleName}": MARKOV rule "${ruleName}" items must be plain strings, not templates`
        )
      );
    }
  }

  // Check corpus product limit
  const effectiveOrder = order ?? 2;
  const totalChars = items.reduce((sum, item) => sum + item.length, 0);
  if (totalChars * effectiveOrder > MAX_MARKOV_CORPUS_PRODUCT) {
    return err(
      new GrammarParseError(
        'markov_corpus_too_large',
        `Grammar "${moduleName}": MARKOV rule "${ruleName}" corpus product (${String(totalChars)} chars × ${String(effectiveOrder)} order = ${String(totalChars * effectiveOrder)}) exceeds maximum of ${String(MAX_MARKOV_CORPUS_PRODUCT)}`
      )
    );
  }

  return ok(undefined);
}

/**
 * Parses a StructRule from a YAML mapping value.
 *
 * @param name - Rule name.
 * @param value - The mapping value.
 * @param moduleName - Module name for error messages.
 * @returns Ok with a StructRule, Err on invalid struct structure.
 */
function parseStructRule(
  name: string,
  value: Record<string, unknown>,
  moduleName: string
): Result<StructRule, GrammarParseError> {
  const fields = new Map<string, string>();

  for (const [fieldName, fieldValue] of Object.entries(value)) {
    if (typeof fieldValue !== 'string') {
      return err(
        new GrammarParseError(
          'invalid_struct_field',
          `Grammar "${moduleName}": StructRule "${name}" field "${fieldName}" must be a string, got ${typeof fieldValue}`
        )
      );
    }
    fields.set(fieldName, normalizeText(fieldValue));
  }

  if (fields.size === 0) {
    return err(
      new GrammarParseError(
        'empty_struct',
        `Grammar "${moduleName}": StructRule "${name}" must have at least one field`
      )
    );
  }

  // Build a default template from fields
  const template = [...fields.keys()].map((f) => `{{ ${f} }}`).join(' ');

  return ok({
    name,
    type: 'struct' as const,
    fields,
    template,
  });
}

/**
 * Normalizes text by removing common leading whitespace and trimming.
 *
 * @param text - Text to normalize.
 * @returns Normalized text.
 */
function normalizeText(text: string): string {
  const lines = text.split('\n');
  if (lines.length <= 1) {
    return text.trim();
  }

  // Find minimum indentation (ignoring empty lines)
  let minIndent = Infinity;
  for (const line of lines) {
    if (line.trim().length === 0) {
      continue;
    }
    const indent = line.length - line.trimStart().length;
    if (indent < minIndent) {
      minIndent = indent;
    }
  }

  if (minIndent === Infinity || minIndent === 0) {
    return text.trim();
  }

  // Remove common indentation
  const dedented = lines.map((line) => {
    if (line.trim().length === 0) {
      return '';
    }
    return line.slice(minIndent);
  });

  return dedented.join('\n').trim();
}
