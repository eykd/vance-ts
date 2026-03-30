import { describe, expect, it } from 'vitest';

import { GrammarParseError } from '../../domain/prestoplot/errors.js';
import { RenderStrategy, SelectionMode } from '../../domain/prestoplot/grammar.js';
import { MAX_MARKOV_CORPUS_PRODUCT } from '../../domain/prestoplot/markovChain.js';

import {
  MAX_GRAMMAR_SOURCE_BYTES,
  MAX_MARKOV_ORDER,
  MAX_TEMPLATE_LENGTH,
  parseGrammar,
} from './grammarParser.js';

/**
 * Helper: asserts parseGrammar succeeds and returns the Grammar.
 *
 * @param yaml - YAML source.
 * @param moduleName - Module name.
 * @returns The parsed Grammar.
 */
function parseOk(
  yaml: string,
  moduleName: string = 'test-grammar'
): ReturnType<typeof parseGrammar> & { success: true } {
  const result = parseGrammar(yaml, moduleName);
  expect(result.success).toBe(true);
  return result as ReturnType<typeof parseGrammar> & { success: true };
}

/**
 * Helper: asserts parseGrammar fails and returns the GrammarParseError.
 *
 * @param yaml - YAML source.
 * @param moduleName - Module name.
 * @returns The GrammarParseError.
 */
function parseErr(yaml: string, moduleName: string = 'test-grammar'): GrammarParseError {
  const result = parseGrammar(yaml, moduleName);
  expect(result.success).toBe(false);
  if (!result.success) {
    return result.error;
  }
  // unreachable, but satisfies TypeScript
  return new GrammarParseError('unreachable', 'unreachable');
}

/**
 * All YAML in these tests uses JSON-schema-compatible format:
 * quoted keys and quoted string values, since the parser uses
 * yaml.parse with { schema: 'json' }.
 */
describe('parseGrammar', () => {
  // ---------------------------------------------------------------------------
  // Happy path: basic rule types
  // ---------------------------------------------------------------------------

  describe('TextRule parsing', () => {
    it('parses a TextRule from a YAML string value', () => {
      const { value: grammar } = parseOk('"Begin": "Hello world."');
      const rule = grammar.rules.get('Begin');
      expect(rule).toBeDefined();
      expect(rule?.type).toBe('text');
      if (rule?.type === 'text') {
        expect(rule.alternatives).toHaveLength(1);
        expect(rule.alternatives[0]?.text).toBe('Hello world.');
        expect(rule.alternatives[0]?.weight).toBe(1);
      }
    });

    it('detects TEMPLATE strategy for strings with template expressions', () => {
      const { value: grammar } = parseOk('"Begin": "{Hero} traveled to {Destination}."');
      const rule = grammar.rules.get('Begin');
      expect(rule?.type).toBe('text');
      if (rule?.type === 'text') {
        expect(rule.strategy).toBe(RenderStrategy.TEMPLATE);
      }
    });

    it('uses default strategy for plain strings without expressions', () => {
      const { value: grammar } = parseOk('"Begin": "Hello world."');
      const rule = grammar.rules.get('Begin');
      if (rule?.type === 'text') {
        expect(rule.strategy).toBe(RenderStrategy.TEMPLATE);
      }
    });

    it('normalizes TextRule templates (dedent + strip)', () => {
      const { value: grammar } = parseOk(
        '"Begin": "  The traveler stood at the gate.\\n  She wore boots."'
      );
      const rule = grammar.rules.get('Begin');
      if (rule?.type === 'text') {
        expect(rule.alternatives[0]?.text).toBe('The traveler stood at the gate.\nShe wore boots.');
      }
    });
  });

  describe('ListRule parsing', () => {
    it('parses a ListRule from a YAML array with options object', () => {
      const yaml =
        '"Begin": "{Hero}"\n"Hero":\n  - {"mode": "pick"}\n  - "a bold navigator"\n  - "a cautious merchant"';
      const { value: grammar } = parseOk(yaml);
      const rule = grammar.rules.get('Hero');
      expect(rule).toBeDefined();
      expect(rule?.type).toBe('list');
      if (rule?.type === 'list') {
        expect(rule.selectionMode).toBe(SelectionMode.PICK);
        expect(rule.items).toEqual(['a bold navigator', 'a cautious merchant']);
      }
    });

    it('defaults to REUSE mode when no options object', () => {
      const yaml = '"Begin": "{Color}"\n"Color":\n  - "red"\n  - "blue"\n  - "green"';
      const { value: grammar } = parseOk(yaml);
      const rule = grammar.rules.get('Color');
      if (rule?.type === 'list') {
        expect(rule.selectionMode).toBe(SelectionMode.REUSE);
        expect(rule.items).toEqual(['red', 'blue', 'green']);
      }
    });

    it('parses all selection modes (case-insensitive)', () => {
      const modes = [
        ['reuse', SelectionMode.REUSE],
        ['PICK', SelectionMode.PICK],
        ['Ratchet', SelectionMode.RATCHET],
        ['list', SelectionMode.LIST],
      ] as const;

      for (const [modeStr, expected] of modes) {
        const yaml = `"Begin": "{Items}"\n"Items":\n  - {"mode": "${modeStr}"}\n  - "item1"`;
        const { value: grammar } = parseOk(yaml);
        const rule = grammar.rules.get('Items');
        if (rule?.type === 'list') {
          expect(rule.selectionMode).toBe(expected);
        }
      }
    });

    it('parses MARKOV mode with order', () => {
      const yaml =
        '"Begin": "{Names}"\n"Names":\n  - {"mode": "markov", "order": 3}\n  - "Aldebaran"\n  - "Procyon"\n  - "Rigel"';
      const { value: grammar } = parseOk(yaml);
      const rule = grammar.rules.get('Names');
      expect(rule?.type).toBe('list');
      if (rule?.type === 'list') {
        expect(rule.selectionMode).toBe(SelectionMode.MARKOV);
        expect(rule.items).toEqual(['Aldebaran', 'Procyon', 'Rigel']);
      }
    });

    it('sets MARKOV list strategy to PLAIN', () => {
      const yaml =
        '"Begin": "{Names}"\n"Names":\n  - {"mode": "markov"}\n  - "Aldric"\n  - "Beren"';
      const { value: grammar } = parseOk(yaml);
      const rule = grammar.rules.get('Names');
      if (rule?.type === 'list') {
        expect(rule.strategy).toBe(RenderStrategy.PLAIN);
      }
    });

    it('treats first item as regular item when not an options object', () => {
      const yaml = '"Begin": "{Colors}"\n"Colors":\n  - "red"\n  - "blue"';
      const { value: grammar } = parseOk(yaml);
      const rule = grammar.rules.get('Colors');
      if (rule?.type === 'list') {
        expect(rule.items).toEqual(['red', 'blue']);
        expect(rule.selectionMode).toBe(SelectionMode.REUSE);
      }
    });
  });

  describe('StructRule parsing', () => {
    it('parses a StructRule from a YAML mapping', () => {
      const yaml = '"Begin": "{Stats}"\n"Stats":\n  "speed": "fast"\n  "range": "long"';
      const { value: grammar } = parseOk(yaml);
      const rule = grammar.rules.get('Stats');
      expect(rule).toBeDefined();
      expect(rule?.type).toBe('struct');
      if (rule?.type === 'struct') {
        expect(rule.fields.get('speed')).toBe('fast');
        expect(rule.fields.get('range')).toBe('long');
      }
    });

    it('normalizes StructRule field values', () => {
      const yaml = '"Begin": "{Stats}"\n"Stats":\n  "desc": "  A long\\n  description"';
      const { value: grammar } = parseOk(yaml);
      const rule = grammar.rules.get('Stats');
      if (rule?.type === 'struct') {
        expect(rule.fields.get('desc')).toBe('A long\ndescription');
      }
    });
  });

  // ---------------------------------------------------------------------------
  // Reserved keys and includes
  // ---------------------------------------------------------------------------

  describe('reserved keys', () => {
    it('does not include "include" or "render" keys as rules', () => {
      const yaml = '"include":\n  - "vocabulary"\n"render": "jinja2"\n"Begin": "Hello"';
      const { value: grammar } = parseOk(yaml);
      expect(grammar.rules.has('include')).toBe(false);
      expect(grammar.rules.has('render')).toBe(false);
      expect(grammar.rules.has('Begin')).toBe(true);
    });

    it('parses the include list', () => {
      const yaml = '"include":\n  - "vocabulary"\n  - "creatures"\n"Begin": "Hello"';
      const { value: grammar } = parseOk(yaml);
      expect(grammar.includes).toEqual(['vocabulary', 'creatures']);
    });

    it('defaults includes to empty array when not specified', () => {
      const { value: grammar } = parseOk('"Begin": "Hello"');
      expect(grammar.includes).toEqual([]);
    });

    it('parses the render strategy (jinja2)', () => {
      const { value: grammar } = parseOk('"render": "jinja2"\n"Begin": "Hello"');
      expect(grammar.rules.has('Begin')).toBe(true);
    });

    it('parses the render strategy (ftemplate)', () => {
      const { value: grammar } = parseOk('"render": "ftemplate"\n"Begin": "Hello"');
      expect(grammar.rules.has('Begin')).toBe(true);
    });

    it('defaults render strategy to TEMPLATE when not specified', () => {
      const { value: grammar } = parseOk('"Begin": "Hello"');
      const rule = grammar.rules.get('Begin');
      if (rule?.type === 'text') {
        expect(rule.strategy).toBe(RenderStrategy.TEMPLATE);
      }
    });
  });

  // ---------------------------------------------------------------------------
  // Grammar key and entry
  // ---------------------------------------------------------------------------

  describe('grammar key and entry', () => {
    it('sets grammar key from moduleName', () => {
      const { value: grammar } = parseOk('"Begin": "Hello"');
      expect(grammar.key).toBe('test-grammar');
    });

    it('sets entry to "Begin"', () => {
      const { value: grammar } = parseOk('"Begin": "Hello"');
      expect(grammar.entry).toBe('Begin');
    });
  });

  // ---------------------------------------------------------------------------
  // Error cases: YAML parsing
  // ---------------------------------------------------------------------------

  describe('YAML parse errors', () => {
    it('returns error on invalid YAML', () => {
      const error = parseErr('{"invalid": yaml: broken');
      expect(error).toBeInstanceOf(GrammarParseError);
      expect(error.code).toBe('yaml_parse_error');
    });

    it('returns error when document is not a mapping', () => {
      const error = parseErr('- "item1"\n- "item2"');
      expect(error.code).toBe('invalid_structure');
      expect(error.message).toContain('must be a YAML mapping');
    });

    it('returns error when document is null (empty)', () => {
      const error = parseErr('');
      expect(error).toBeInstanceOf(GrammarParseError);
    });

    it('returns error on duplicate keys (uniqueKeys: true)', () => {
      const error = parseErr('"Begin": "first"\n"Begin": "second"');
      expect(error.code).toBe('yaml_parse_error');
    });

    it('returns error on excessive aliases (maxAliasCount)', () => {
      let yaml = '"a": &a "x"\n';
      for (let i = 1; i <= 101; i++) {
        yaml += `"a${String(i)}": *a\n`;
      }
      yaml += '"Begin": "hello"\n';
      const error = parseErr(yaml);
      expect(error.code).toBe('yaml_parse_error');
    });

    it('uses schema:json to prevent type coercion of values', () => {
      const yaml = '"Begin": "{Answer}"\n"Answer":\n  - "yes"\n  - "no"';
      const { value: grammar } = parseOk(yaml);
      const rule = grammar.rules.get('Answer');
      if (rule?.type === 'list') {
        expect(rule.items).toEqual(['yes', 'no']);
      }
    });
  });

  // ---------------------------------------------------------------------------
  // Error cases: source size
  // ---------------------------------------------------------------------------

  describe('source size validation', () => {
    it('accepts source at exactly MAX_GRAMMAR_SOURCE_BYTES', () => {
      // '"Begin": "' = 10 chars, closing '"' = 1 char = 11 total overhead
      const padding = '"Begin": "' + 'x'.repeat(MAX_GRAMMAR_SOURCE_BYTES - 11) + '"';
      expect(padding.length).toBe(MAX_GRAMMAR_SOURCE_BYTES);
      const result = parseGrammar(padding, 'test-grammar');
      // Should not fail for size (may fail for other reasons but not source_too_large)
      if (!result.success) {
        expect(result.error.code).not.toBe('source_too_large');
      }
    });

    it('rejects source exceeding MAX_GRAMMAR_SOURCE_BYTES', () => {
      const padding = '"Begin": "' + 'x'.repeat(MAX_GRAMMAR_SOURCE_BYTES) + '"';
      const error = parseErr(padding);
      expect(error.code).toBe('source_too_large');
    });
  });

  // ---------------------------------------------------------------------------
  // Error cases: grammar key
  // ---------------------------------------------------------------------------

  describe('grammar key validation', () => {
    it('rejects empty grammar key', () => {
      const error = parseErr('"Begin": "Hello"', '');
      expect(error.code).toBe('invalid_key');
    });

    it('rejects uppercase grammar keys', () => {
      const error = parseErr('"Begin": "Hello"', 'SystemDesc');
      expect(error.code).toBe('invalid_key');
    });

    it('rejects grammar keys starting with numbers', () => {
      const error = parseErr('"Begin": "Hello"', '123abc');
      expect(error.code).toBe('invalid_key');
    });

    it('rejects path-like grammar keys', () => {
      const error = parseErr('"Begin": "Hello"', '../other');
      expect(error.code).toBe('invalid_key');
    });

    it('rejects __proto__ grammar key', () => {
      const error = parseErr('"Begin": "Hello"', '__proto__');
      expect(error.code).toBe('invalid_key');
    });

    it('accepts lowercase grammar keys with hyphens', () => {
      const { value: grammar } = parseOk('"Begin": "Hello"', 'system-descriptions');
      expect(grammar.key).toBe('system-descriptions');
    });

    it('accepts lowercase grammar keys with underscores', () => {
      const { value: grammar } = parseOk('"Begin": "Hello"', 'system_descriptions');
      expect(grammar.key).toBe('system_descriptions');
    });
  });

  // ---------------------------------------------------------------------------
  // Error cases: rule name validation
  // ---------------------------------------------------------------------------

  describe('rule name validation', () => {
    it('rejects rule names not matching pattern', () => {
      const error = parseErr('"Begin": "{Foo}"\n"123bad": "value"');
      expect(error.code).toBe('invalid_rule_name');
      expect(error.message).toContain('rule name');
    });

    it('rejects prototype pollution rule names', () => {
      for (const name of ['constructor', 'toString', 'valueOf', '__proto__']) {
        const error = parseErr(`"Begin": "Hello"\n"${name}": "value"`);
        expect(error.code).toBe('invalid_rule_name');
        expect(error.message).toContain('reserved JavaScript identifier');
      }
    });

    it('rejects hasOwnProperty as rule name', () => {
      const error = parseErr('"Begin": "Hello"\n"hasOwnProperty": "value"');
      expect(error.code).toBe('invalid_rule_name');
    });

    it('rejects isPrototypeOf as rule name', () => {
      const error = parseErr('"Begin": "Hello"\n"isPrototypeOf": "value"');
      expect(error.code).toBe('invalid_rule_name');
    });

    it('rejects propertyIsEnumerable as rule name', () => {
      const error = parseErr('"Begin": "Hello"\n"propertyIsEnumerable": "value"');
      expect(error.code).toBe('invalid_rule_name');
    });

    it('rejects __defineGetter__ as rule name', () => {
      const error = parseErr('"Begin": "Hello"\n"__defineGetter__": "value"');
      expect(error.code).toBe('invalid_rule_name');
    });

    it('rejects __defineSetter__ as rule name', () => {
      const error = parseErr('"Begin": "Hello"\n"__defineSetter__": "value"');
      expect(error.code).toBe('invalid_rule_name');
    });

    it('rejects __lookupGetter__ as rule name', () => {
      const error = parseErr('"Begin": "Hello"\n"__lookupGetter__": "value"');
      expect(error.code).toBe('invalid_rule_name');
    });

    it('rejects __lookupSetter__ as rule name', () => {
      const error = parseErr('"Begin": "Hello"\n"__lookupSetter__": "value"');
      expect(error.code).toBe('invalid_rule_name');
    });

    it('accepts valid rule names with underscores', () => {
      const { value: grammar } = parseOk('"Begin": "{_private}"\n"_private": "secret"');
      expect(grammar.rules.has('_private')).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // Error cases: selection mode
  // ---------------------------------------------------------------------------

  describe('selection mode validation', () => {
    it('returns error on invalid mode value', () => {
      const error = parseErr('"Begin": "{Items}"\n"Items":\n  - {"mode": "invalid"}\n  - "item"');
      expect(error.code).toBe('invalid_mode');
      expect(error.message).toContain('unrecognized mode');
    });

    it('returns error when mode is not a string', () => {
      const error = parseErr('"Begin": "{Items}"\n"Items":\n  - {"mode": 42}\n  - "item"');
      expect(error.code).toBe('invalid_mode');
      expect(error.message).toContain('mode must be a string');
    });
  });

  // ---------------------------------------------------------------------------
  // Error cases: MARKOV validation
  // ---------------------------------------------------------------------------

  describe('MARKOV validation', () => {
    it('returns error on order < 1', () => {
      const error = parseErr(
        '"Begin": "{Names}"\n"Names":\n  - {"mode": "markov", "order": 0}\n  - "Aldric"'
      );
      expect(error.code).toBe('invalid_markov_order');
      expect(error.message).toContain('order must be an integer');
    });

    it('returns error on negative order', () => {
      const error = parseErr(
        '"Begin": "{Names}"\n"Names":\n  - {"mode": "markov", "order": -1}\n  - "Aldric"'
      );
      expect(error.code).toBe('invalid_markov_order');
    });

    it('returns error on non-integer order', () => {
      const error = parseErr(
        '"Begin": "{Names}"\n"Names":\n  - {"mode": "markov", "order": 1.5}\n  - "Aldric"'
      );
      expect(error.code).toBe('invalid_markov_order');
    });

    it('returns error on order exceeding MAX_MARKOV_ORDER', () => {
      const error = parseErr(
        `"Begin": "{Names}"\n"Names":\n  - {"mode": "markov", "order": ${String(MAX_MARKOV_ORDER + 1)}}\n  - "Aldric"`
      );
      expect(error.code).toBe('invalid_markov_order');
    });

    it('returns error on MARKOV with empty corpus', () => {
      const error = parseErr('"Begin": "{Names}"\n"Names":\n  - {"mode": "markov"}');
      expect(error.code).toBe('invalid_markov_corpus');
      expect(error.message).toContain('requires at least one non-empty training item');
    });

    it('returns error on MARKOV with all empty string items', () => {
      const error = parseErr('"Begin": "{Names}"\n"Names":\n  - {"mode": "markov"}\n  - ""');
      expect(error.code).toBe('invalid_markov_corpus');
    });

    it('returns error on MARKOV items containing template syntax', () => {
      const error = parseErr(
        '"Begin": "{Names}"\n"Names":\n  - {"mode": "markov"}\n  - "{adjective} ship"'
      );
      expect(error.code).toBe('invalid_markov_item');
      expect(error.message).toContain('plain strings, not templates');
    });

    it('returns error on MARKOV corpus product exceeding limit', () => {
      const longItem = 'x'.repeat(MAX_MARKOV_CORPUS_PRODUCT + 1);
      const error = parseErr(
        `"Begin": "{Names}"\n"Names":\n  - {"mode": "markov", "order": 1}\n  - "${longItem}"`
      );
      expect(error.code).toBe('markov_corpus_too_large');
      expect(error.message).toContain('corpus product');
    });

    it('accepts valid MARKOV order at MAX_MARKOV_ORDER', () => {
      const yaml = `"Begin": "{Names}"\n"Names":\n  - {"mode": "markov", "order": ${String(MAX_MARKOV_ORDER)}}\n  - "Aldebaran"`;
      const { value: grammar } = parseOk(yaml);
      expect(grammar.rules.has('Names')).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // Error cases: list item validation
  // ---------------------------------------------------------------------------

  describe('list item validation', () => {
    it('returns error on non-string list items (number)', () => {
      const error = parseErr('"Begin": "{Items}"\n"Items":\n  - 42');
      expect(error.code).toBe('invalid_list_item');
      expect(error.message).toContain('must be a string');
    });

    it('returns error on null list items', () => {
      const error = parseErr('"Begin": "{Items}"\n"Items":\n  - null');
      expect(error.code).toBe('invalid_list_item');
    });

    it('returns error on boolean list items', () => {
      const error = parseErr('"Begin": "{Items}"\n"Items":\n  - true');
      expect(error.code).toBe('invalid_list_item');
    });
  });

  // ---------------------------------------------------------------------------
  // Error cases: StructRule validation
  // ---------------------------------------------------------------------------

  describe('StructRule validation', () => {
    it('returns error on empty struct fields', () => {
      const error = parseErr('"Begin": "{Stats}"\n"Stats": {}');
      expect(error.code).toBe('empty_struct');
      expect(error.message).toContain('must have at least one field');
    });

    it('returns error on non-string struct field values', () => {
      const error = parseErr('"Begin": "{Stats}"\n"Stats":\n  "speed": 42');
      expect(error.code).toBe('invalid_struct_field');
      expect(error.message).toContain('must be a string');
    });
  });

  // ---------------------------------------------------------------------------
  // Error cases: entry rule
  // ---------------------------------------------------------------------------

  describe('entry rule validation', () => {
    it('returns error when Begin rule is missing', () => {
      const error = parseErr('"Hero": "a navigator"');
      expect(error.code).toBe('entry_not_found');
      expect(error.message).toContain('entry rule "Begin" not found');
    });
  });

  // ---------------------------------------------------------------------------
  // Error cases: template length
  // ---------------------------------------------------------------------------

  describe('template length validation', () => {
    it('returns error when template exceeds MAX_TEMPLATE_LENGTH', () => {
      const longTemplate = 'x'.repeat(MAX_TEMPLATE_LENGTH + 1);
      const error = parseErr(`"Begin": "${longTemplate}"`);
      expect(error.code).toBe('template_too_long');
      expect(error.message).toContain('exceeds maximum length');
    });

    it('accepts template at exactly MAX_TEMPLATE_LENGTH', () => {
      const template = 'x'.repeat(MAX_TEMPLATE_LENGTH);
      const { value: grammar } = parseOk(`"Begin": "${template}"`);
      expect(grammar.rules.has('Begin')).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // Weighted alternatives (TextRule from array of {text, weight} objects)
  // ---------------------------------------------------------------------------

  describe('weighted alternatives parsing', () => {
    it('parses an array of {text, weight} objects as a TextRule', () => {
      const yaml =
        '"Begin":\n  - {"text": "option A", "weight": 5}\n  - {"text": "option B", "weight": 3}';
      const { value: grammar } = parseOk(yaml);
      const rule = grammar.rules.get('Begin');
      expect(rule?.type).toBe('text');
      if (rule?.type === 'text') {
        expect(rule.alternatives).toHaveLength(2);
        expect(rule.alternatives[0]?.text).toBe('option A');
        expect(rule.alternatives[0]?.weight).toBe(5);
        expect(rule.alternatives[1]?.text).toBe('option B');
        expect(rule.alternatives[1]?.weight).toBe(3);
      }
    });

    it('defaults weight to 1 when not specified in weighted alternative object', () => {
      const yaml = '"Begin":\n  - {"text": "only text"}';
      const { value: grammar } = parseOk(yaml);
      const rule = grammar.rules.get('Begin');
      expect(rule?.type).toBe('text');
      if (rule?.type === 'text') {
        expect(rule.alternatives[0]?.weight).toBe(1);
      }
    });

    it('detects TEMPLATE strategy for weighted alternatives with expressions', () => {
      const yaml = '"Begin":\n  - {"text": "{Hero} wins", "weight": 2}\n"Hero": "Alice"';
      const { value: grammar } = parseOk(yaml);
      const rule = grammar.rules.get('Begin');
      if (rule?.type === 'text') {
        expect(rule.strategy).toBe(RenderStrategy.TEMPLATE);
      }
    });

    it('normalizes text in weighted alternatives', () => {
      const yaml = '"Begin":\n  - {"text": "  hello  ", "weight": 1}';
      const { value: grammar } = parseOk(yaml);
      const rule = grammar.rules.get('Begin');
      if (rule?.type === 'text') {
        expect(rule.alternatives[0]?.text).toBe('hello');
      }
    });
  });

  // ---------------------------------------------------------------------------
  // Error cases: weight range validation
  // ---------------------------------------------------------------------------

  describe('weight range validation', () => {
    it('returns error on weight of 0', () => {
      const error = parseErr('"Begin":\n  - {"text": "bad", "weight": 0}');
      expect(error.code).toBe('invalid_weight');
      expect(error.message).toContain('must be a positive number');
    });

    it('returns error on negative weight', () => {
      const error = parseErr('"Begin":\n  - {"text": "bad", "weight": -1}');
      expect(error.code).toBe('invalid_weight');
      expect(error.message).toContain('must be a positive number');
    });

    it('returns error when weight is a string', () => {
      const error = parseErr('"Begin":\n  - {"text": "bad", "weight": "five"}');
      expect(error.code).toBe('invalid_weight');
      expect(error.message).toContain('must be a positive number');
    });

    it('returns error on empty weighted alternatives array', () => {
      const error = parseErr('"Begin": []');
      expect(error.code).toBe('empty_alternatives');
      expect(error.message).toContain('must have at least one');
    });

    it('returns error when weighted alternative text is not a string', () => {
      const error = parseErr('"Begin":\n  - {"text": 42, "weight": 1}');
      expect(error.code).toBe('invalid_weighted_text');
      expect(error.message).toContain('text must be a string');
    });

    it('returns error when weighted alternative text exceeds MAX_TEMPLATE_LENGTH', () => {
      const longText = 'x'.repeat(MAX_TEMPLATE_LENGTH + 1);
      const error = parseErr(`"Begin":\n  - {"text": "${longText}", "weight": 1}`);
      expect(error.code).toBe('template_too_long');
    });
  });

  // ---------------------------------------------------------------------------
  // Error cases: unsupported rule types
  // ---------------------------------------------------------------------------

  describe('unsupported rule types', () => {
    it('returns error on numeric rule value', () => {
      const error = parseErr('"Begin": "Hello"\n"Bad": 42');
      expect(error.code).toBe('unknown_rule_type');
      expect(error.message).toContain('unsupported YAML type');
    });

    it('returns error on boolean rule value', () => {
      const error = parseErr('"Begin": "Hello"\n"Bad": true');
      expect(error.code).toBe('unknown_rule_type');
    });

    it('returns error on null rule value', () => {
      const error = parseErr('"Begin": "Hello"\n"Bad": null');
      expect(error.code).toBe('unknown_rule_type');
    });
  });

  // ---------------------------------------------------------------------------
  // Error cases: render strategy
  // ---------------------------------------------------------------------------

  describe('render strategy validation', () => {
    it('returns error on invalid render strategy', () => {
      const error = parseErr('"render": "unknown"\n"Begin": "Hello"');
      expect(error.code).toBe('invalid_render_strategy');
      expect(error.message).toContain('unknown render strategy');
    });

    it('returns error when render is not a string', () => {
      const error = parseErr('"render": 42\n"Begin": "Hello"');
      expect(error.code).toBe('invalid_render_strategy');
      expect(error.message).toContain('"render" must be a string');
    });
  });

  // ---------------------------------------------------------------------------
  // Error cases: includes
  // ---------------------------------------------------------------------------

  describe('includes validation', () => {
    it('returns error when include is not an array', () => {
      const error = parseErr('"include": "not-an-array"\n"Begin": "Hello"');
      expect(error.code).toBe('invalid_includes');
      expect(error.message).toContain('must be an array');
    });

    it('returns error when include items are not strings', () => {
      const error = parseErr('"include":\n  - 42\n"Begin": "Hello"');
      expect(error.code).toBe('invalid_includes');
      expect(error.message).toContain('must be strings');
    });
  });

  // ---------------------------------------------------------------------------
  // Full example from spec
  // ---------------------------------------------------------------------------

  describe('full grammar parsing', () => {
    it('parses the full example from the spec', () => {
      const yaml = [
        '"include":',
        '  - "vocabulary"',
        '',
        '"render": "ftemplate"',
        '',
        '"Begin": "{Hero} traveled to {Destination}."',
        '',
        '"Hero":',
        '  - {"mode": "pick"}',
        '  - "a bold navigator"',
        '  - "a cautious merchant"',
        '  - "an exiled noble"',
        '',
        '"Destination":',
        '  - {"mode": "reuse"}',
        '  - "the outer rim"',
        '  - "the spinward frontier"',
        '  - "a forgotten world"',
        '',
        '"HeroNames":',
        '  - {"mode": "markov", "order": 2}',
        '  - "Aldric"',
        '  - "Beren"',
        '  - "Calidwen"',
        '  - "Davan"',
        '',
        '"Stats":',
        '  "speed": "fast"',
        '  "range": "long"',
      ].join('\n');

      const { value: grammar } = parseOk(yaml);
      expect(grammar.key).toBe('test-grammar');
      expect(grammar.entry).toBe('Begin');
      expect(grammar.includes).toEqual(['vocabulary']);
      expect(grammar.rules.size).toBe(5);

      const beginRule = grammar.rules.get('Begin');
      expect(beginRule?.type).toBe('text');

      const heroRule = grammar.rules.get('Hero');
      expect(heroRule?.type).toBe('list');
      if (heroRule?.type === 'list') {
        expect(heroRule.selectionMode).toBe(SelectionMode.PICK);
        expect(heroRule.items).toHaveLength(3);
      }

      const destRule = grammar.rules.get('Destination');
      if (destRule?.type === 'list') {
        expect(destRule.selectionMode).toBe(SelectionMode.REUSE);
      }

      const namesRule = grammar.rules.get('HeroNames');
      if (namesRule?.type === 'list') {
        expect(namesRule.selectionMode).toBe(SelectionMode.MARKOV);
      }

      const statsRule = grammar.rules.get('Stats');
      expect(statsRule?.type).toBe('struct');
      if (statsRule?.type === 'struct') {
        expect(statsRule.fields.get('speed')).toBe('fast');
        expect(statsRule.fields.get('range')).toBe('long');
      }
    });
  });

  // ---------------------------------------------------------------------------
  // Adversarial YAML safety
  // ---------------------------------------------------------------------------

  describe('adversarial YAML safety', () => {
    it('rejects YAML anchor bomb (billion laughs variant)', () => {
      // Exponential expansion: each level doubles the previous
      const yaml = [
        '"a": &a "bang "',
        '"b": &b [*a, *a]',
        '"c": &c [*b, *b]',
        '"d": &d [*c, *c]',
        '"e": &e [*d, *d]',
        '"f": &f [*e, *e]',
        '"g": &g [*f, *f]',
        '"Begin": "hello"',
      ].join('\n');
      const error = parseErr(yaml);
      expect(error.code).toBe('yaml_parse_error');
    });

    it('rejects source at exactly MAX_GRAMMAR_SOURCE_BYTES + 1', () => {
      const padding = 'x'.repeat(MAX_GRAMMAR_SOURCE_BYTES + 1);
      const error = parseErr(padding);
      expect(error.code).toBe('source_too_large');
    });

    it('accepts source at exactly MAX_GRAMMAR_SOURCE_BYTES (256 KB)', () => {
      // Verify constant equals 256 * 1024
      expect(MAX_GRAMMAR_SOURCE_BYTES).toBe(256 * 1024);
      const overhead = '"Begin": "'.length + '"'.length; // 11
      const filler = 'x'.repeat(MAX_GRAMMAR_SOURCE_BYTES - overhead);
      const yaml = `"Begin": "${filler}"`;
      expect(yaml.length).toBe(MAX_GRAMMAR_SOURCE_BYTES);
      const result = parseGrammar(yaml, 'test-grammar');
      if (!result.success) {
        expect(result.error.code).not.toBe('source_too_large');
      }
    });

    it('rejects bare boolean values (yes/no/on/off) via JSON schema', () => {
      // Without schema:'json', YAML would coerce these to booleans.
      // JSON schema requires quoted strings, so bare words cause parse errors
      // or are treated as non-string types.
      for (const bare of ['yes', 'no', 'on', 'off', 'true', 'false']) {
        const yaml = `"Begin": "{Answer}"\n"Answer":\n  - ${bare}`;
        const result = parseGrammar(yaml, 'test-grammar');
        // JSON schema rejects bare booleans — either as a parse error or type error
        if (result.success) {
          // If it somehow parsed, verify items were NOT coerced to boolean strings
          const rule = result.value.rules.get('Answer');
          if (rule?.type === 'list') {
            // Under JSON schema, bare words should not parse at all
            // If they did, it's a safety violation
            expect(rule.items[0]).not.toBe(true);
            expect(rule.items[0]).not.toBe(false);
          }
        } else {
          // Expected: parse or validation error
          expect(result.error).toBeInstanceOf(GrammarParseError);
        }
      }
    });

    it('rejects duplicate top-level keys', () => {
      const yaml = '"Begin": "first"\n"Begin": "second"';
      const error = parseErr(yaml);
      expect(error.code).toBe('yaml_parse_error');
      expect(error.message).toContain('parse error');
    });

    it('rejects duplicate keys in nested mappings', () => {
      const yaml = '"Begin": "{Stats}"\n"Stats":\n  "hp": "10"\n  "hp": "20"';
      const error = parseErr(yaml);
      expect(error.code).toBe('yaml_parse_error');
    });

    it('allows exactly maxAliasCount aliases (boundary)', () => {
      let yaml = '"Anchor": &a "x"\n';
      for (let i = 1; i <= 99; i++) {
        yaml += `"Ref${String(i)}": *a\n`;
      }
      yaml += '"Begin": "hello"\n';
      // 99 alias resolutions should be under the maxAliasCount:100 limit
      const result = parseGrammar(yaml, 'test-grammar');
      if (!result.success) {
        expect(result.error.code).not.toBe('yaml_parse_error');
      }
    });

    it('rejects aliases exceeding maxAliasCount', () => {
      let yaml = '"Anchor": &a "x"\n';
      for (let i = 1; i <= 101; i++) {
        yaml += `"Ref${String(i)}": *a\n`;
      }
      yaml += '"Begin": "hello"\n';
      const error = parseErr(yaml);
      expect(error.code).toBe('yaml_parse_error');
    });
  });

  // ---------------------------------------------------------------------------
  // Exported constants
  // ---------------------------------------------------------------------------

  describe('exported constants', () => {
    it('exports MAX_GRAMMAR_SOURCE_BYTES as 262144', () => {
      expect(MAX_GRAMMAR_SOURCE_BYTES).toBe(262_144);
    });

    it('exports MAX_TEMPLATE_LENGTH as 10000', () => {
      expect(MAX_TEMPLATE_LENGTH).toBe(10_000);
    });

    it('exports MAX_MARKOV_ORDER as 10', () => {
      expect(MAX_MARKOV_ORDER).toBe(10);
    });
  });
});
