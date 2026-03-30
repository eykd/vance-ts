import { describe, expect, it } from 'vitest';

import {
  type Grammar,
  type ListRule,
  RenderStrategy,
  SelectionMode,
  type StructRule,
  type TextRule,
  createGrammar,
} from '../../domain/prestoplot/grammar.js';

import { grammarFromDto, grammarToDto, isGrammarDto } from './dto.js';
import type { GrammarDto } from './GrammarStorage.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Build a valid Grammar for testing.
 *
 * @param key - Grammar key.
 * @param rulesEntries - Rule entries as name/rule tuples.
 * @param entry - Entry rule name.
 * @param includes - Optional include keys.
 * @returns A validated Grammar.
 */
function makeGrammar(
  key: string,
  rulesEntries: Array<[string, TextRule | ListRule | StructRule]>,
  entry: string,
  includes: string[] = []
): Grammar {
  const result = createGrammar(key, new Map(rulesEntries), entry, includes);
  if (!result.success) {
    throw new Error(`Failed to create grammar: ${result.error.message}`);
  }
  return result.value;
}

const textRule: TextRule = {
  name: 'greeting',
  type: 'text',
  alternatives: [
    { text: 'Hello', weight: 1 },
    { text: 'Hi', weight: 2 },
  ],
  strategy: RenderStrategy.PLAIN,
};

const listRule: ListRule = {
  name: 'colors',
  type: 'list',
  items: ['red', 'green', 'blue'],
  selectionMode: SelectionMode.PICK,
  strategy: RenderStrategy.PLAIN,
};

const structRule: StructRule = {
  name: 'sentence',
  type: 'struct',
  fields: new Map([
    ['greeting', 'greeting'],
    ['color', 'colors'],
  ]),
  template: '{{ greeting }}, the color is {{ color }}',
};

// ---------------------------------------------------------------------------
// isGrammarDto (runtime type guard)
// ---------------------------------------------------------------------------

describe('isGrammarDto', () => {
  it('returns true for a valid GrammarDto', () => {
    const dto: GrammarDto = {
      version: 1,
      key: 'test',
      entry: 'main',
      includes: [],
      rules: {},
    };
    expect(isGrammarDto(dto)).toBe(true);
  });

  it('returns false for null', () => {
    expect(isGrammarDto(null)).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isGrammarDto(undefined)).toBe(false);
  });

  it('returns false for a non-object', () => {
    expect(isGrammarDto('string')).toBe(false);
    expect(isGrammarDto(42)).toBe(false);
  });

  it('returns false when version is not 1', () => {
    expect(isGrammarDto({ version: 2, key: 'k', entry: 'e', includes: [], rules: {} })).toBe(false);
  });

  it('returns false when version is missing', () => {
    expect(isGrammarDto({ key: 'k', entry: 'e', includes: [], rules: {} })).toBe(false);
  });

  it('returns false when key is not a string', () => {
    expect(isGrammarDto({ version: 1, key: 123, entry: 'e', includes: [], rules: {} })).toBe(false);
  });

  it('returns false when entry is not a string', () => {
    expect(isGrammarDto({ version: 1, key: 'k', entry: null, includes: [], rules: {} })).toBe(
      false
    );
  });

  it('returns false when includes is not an array', () => {
    expect(isGrammarDto({ version: 1, key: 'k', entry: 'e', includes: 'nope', rules: {} })).toBe(
      false
    );
  });

  it('returns false when rules is not an object', () => {
    expect(isGrammarDto({ version: 1, key: 'k', entry: 'e', includes: [], rules: 'nope' })).toBe(
      false
    );
  });

  it('returns false when rules is an array', () => {
    expect(isGrammarDto({ version: 1, key: 'k', entry: 'e', includes: [], rules: [] })).toBe(false);
  });

  it('returns false when rules is null', () => {
    expect(isGrammarDto({ version: 1, key: 'k', entry: 'e', includes: [], rules: null })).toBe(
      false
    );
  });
});

// ---------------------------------------------------------------------------
// grammarToDto
// ---------------------------------------------------------------------------

describe('grammarToDto', () => {
  it('converts a grammar with a text rule', () => {
    const grammar = makeGrammar('g1', [['greeting', textRule]], 'greeting');
    const dto = grammarToDto(grammar);

    expect(dto.version).toBe(1);
    expect(dto.key).toBe('g1');
    expect(dto.entry).toBe('greeting');
    expect(dto.includes).toEqual([]);
    expect(dto.rules['greeting']).toEqual({
      name: 'greeting',
      type: 'text',
      alternatives: [
        { text: 'Hello', weight: 1 },
        { text: 'Hi', weight: 2 },
      ],
      strategy: 'PLAIN',
    });
  });

  it('converts a grammar with a list rule', () => {
    const grammar = makeGrammar('g2', [['colors', listRule]], 'colors');
    const dto = grammarToDto(grammar);

    expect(dto.rules['colors']).toEqual({
      name: 'colors',
      type: 'list',
      items: ['red', 'green', 'blue'],
      selectionMode: 'PICK',
      strategy: 'PLAIN',
    });
  });

  it('converts a grammar with a struct rule (Map fields → object)', () => {
    const grammar = makeGrammar(
      'g3',
      [
        ['greeting', textRule],
        ['colors', listRule],
        ['sentence', structRule],
      ],
      'sentence'
    );
    const dto = grammarToDto(grammar);

    expect(dto.rules['sentence']).toEqual({
      name: 'sentence',
      type: 'struct',
      fields: { greeting: 'greeting', color: 'colors' },
      template: '{{ greeting }}, the color is {{ color }}',
    });
  });

  it('preserves includes', () => {
    const grammar = makeGrammar('g4', [['greeting', textRule]], 'greeting', ['base', 'extra']);
    const dto = grammarToDto(grammar);
    expect(dto.includes).toEqual(['base', 'extra']);
  });

  it('preserves rule key order (insertion order)', () => {
    const grammar = makeGrammar(
      'ordered',
      [
        ['alpha', { ...textRule, name: 'alpha' }],
        ['beta', { ...textRule, name: 'beta' }],
        ['gamma', { ...textRule, name: 'gamma' }],
      ],
      'alpha'
    );
    const dto = grammarToDto(grammar);
    expect(Object.keys(dto.rules)).toEqual(['alpha', 'beta', 'gamma']);
  });
});

// ---------------------------------------------------------------------------
// grammarFromDto
// ---------------------------------------------------------------------------

describe('grammarFromDto', () => {
  it('round-trips a grammar with text rule', () => {
    const grammar = makeGrammar('rt1', [['greeting', textRule]], 'greeting');
    const dto = grammarToDto(grammar);
    const result = grammarFromDto(dto);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.key).toBe('rt1');
      expect(result.value.entry).toBe('greeting');
      const rule = result.value.rules.get('greeting') as TextRule;
      expect(rule.type).toBe('text');
      expect(rule.alternatives).toEqual(textRule.alternatives);
      expect(rule.strategy).toBe(RenderStrategy.PLAIN);
    }
  });

  it('round-trips a grammar with list rule', () => {
    const grammar = makeGrammar('rt2', [['colors', listRule]], 'colors');
    const dto = grammarToDto(grammar);
    const result = grammarFromDto(dto);

    expect(result.success).toBe(true);
    if (result.success) {
      const rule = result.value.rules.get('colors') as ListRule;
      expect(rule.type).toBe('list');
      expect(rule.items).toEqual(['red', 'green', 'blue']);
      expect(rule.selectionMode).toBe(SelectionMode.PICK);
    }
  });

  it('round-trips a grammar with struct rule (preserves Map field order)', () => {
    const grammar = makeGrammar(
      'rt3',
      [
        ['greeting', textRule],
        ['colors', listRule],
        ['sentence', structRule],
      ],
      'sentence'
    );
    const dto = grammarToDto(grammar);
    const result = grammarFromDto(dto);

    expect(result.success).toBe(true);
    if (result.success) {
      const rule = result.value.rules.get('sentence') as StructRule;
      expect(rule.type).toBe('struct');
      expect([...rule.fields.entries()]).toEqual([
        ['greeting', 'greeting'],
        ['color', 'colors'],
      ]);
      expect(rule.template).toBe('{{ greeting }}, the color is {{ color }}');
    }
  });

  it('round-trip preserves rule key order', () => {
    const grammar = makeGrammar(
      'ordered',
      [
        ['alpha', { ...textRule, name: 'alpha' }],
        ['beta', { ...textRule, name: 'beta' }],
        ['gamma', { ...textRule, name: 'gamma' }],
      ],
      'alpha'
    );
    const dto = grammarToDto(grammar);
    const result = grammarFromDto(dto);

    expect(result.success).toBe(true);
    if (result.success) {
      expect([...result.value.rules.keys()]).toEqual(['alpha', 'beta', 'gamma']);
    }
  });

  it('returns error for invalid version', () => {
    const dto: GrammarDto = { version: 2, key: 'bad', entry: 'main', includes: [], rules: {} };
    const result = grammarFromDto(dto);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('unsupported_version');
    }
  });

  it('returns error for unknown rule type', () => {
    const dto: GrammarDto = {
      version: 1,
      key: 'bad',
      entry: 'x',
      includes: [],
      rules: { x: { name: 'x', type: 'unknown' } },
    };
    const result = grammarFromDto(dto);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('unknown_rule_type');
    }
  });

  it('returns error when raw rule is not an object', () => {
    const dto: GrammarDto = {
      version: 1,
      key: 'bad',
      entry: 'x',
      includes: [],
      rules: { x: 'not-an-object' },
    };
    const result = grammarFromDto(dto);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('invalid_rule');
    }
  });

  it('returns error when raw rule is null', () => {
    const dto: GrammarDto = {
      version: 1,
      key: 'bad',
      entry: 'x',
      includes: [],
      rules: { x: null },
    };
    const result = grammarFromDto(dto);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('invalid_rule');
    }
  });

  it('returns error when rule type is not a string', () => {
    const dto: GrammarDto = {
      version: 1,
      key: 'bad',
      entry: 'x',
      includes: [],
      rules: { x: { name: 'x', type: 42 } },
    };
    const result = grammarFromDto(dto);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('invalid_rule');
    }
  });

  it('returns error when text rule has non-array alternatives', () => {
    const dto: GrammarDto = {
      version: 1,
      key: 'bad',
      entry: 'x',
      includes: [],
      rules: { x: { name: 'x', type: 'text', alternatives: 'not-array', strategy: 'PLAIN' } },
    };
    const result = grammarFromDto(dto);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('invalid_rule');
    }
  });

  it('falls back to map key when rule name is not a string', () => {
    const dto: GrammarDto = {
      version: 1,
      key: 'ok',
      entry: 'x',
      includes: [],
      rules: {
        x: {
          name: 123,
          type: 'text',
          alternatives: [{ text: 'hi', weight: 1 }],
          strategy: 'PLAIN',
        },
      },
    };
    const result = grammarFromDto(dto);
    expect(result.success).toBe(true);
    if (result.success) {
      const rule = result.value.rules.get('x');
      expect(rule?.name).toBe('x');
    }
  });

  it('returns error when text rule has non-string strategy', () => {
    const dto: GrammarDto = {
      version: 1,
      key: 'bad',
      entry: 'x',
      includes: [],
      rules: {
        x: { name: 'x', type: 'text', alternatives: [{ text: 'hi', weight: 1 }], strategy: 99 },
      },
    };
    const result = grammarFromDto(dto);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('invalid_rule');
    }
  });

  it('returns error when list rule has non-array items', () => {
    const dto: GrammarDto = {
      version: 1,
      key: 'bad',
      entry: 'x',
      includes: [],
      rules: {
        x: {
          name: 'x',
          type: 'list',
          items: 'not-array',
          selectionMode: 'PICK',
          strategy: 'PLAIN',
        },
      },
    };
    const result = grammarFromDto(dto);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('invalid_rule');
    }
  });

  it('returns error when list rule has non-string selectionMode', () => {
    const dto: GrammarDto = {
      version: 1,
      key: 'bad',
      entry: 'x',
      includes: [],
      rules: {
        x: { name: 'x', type: 'list', items: ['a'], selectionMode: 42, strategy: 'PLAIN' },
      },
    };
    const result = grammarFromDto(dto);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('invalid_rule');
    }
  });

  it('returns error when struct rule has non-object fields', () => {
    const dto: GrammarDto = {
      version: 1,
      key: 'bad',
      entry: 'x',
      includes: [],
      rules: {
        x: { name: 'x', type: 'struct', fields: 'not-object', template: '{{ a }}' },
      },
    };
    const result = grammarFromDto(dto);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('invalid_rule');
    }
  });

  it('returns error when struct rule has non-string template', () => {
    const dto: GrammarDto = {
      version: 1,
      key: 'bad',
      entry: 'x',
      includes: [],
      rules: {
        x: { name: 'x', type: 'struct', fields: { a: 'b' }, template: 42 },
      },
    };
    const result = grammarFromDto(dto);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('invalid_rule');
    }
  });

  it('preserves includes through round-trip', () => {
    const grammar = makeGrammar('inc', [['greeting', textRule]], 'greeting', ['base', 'extra']);
    const dto = grammarToDto(grammar);
    const result = grammarFromDto(dto);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.includes).toEqual(['base', 'extra']);
    }
  });
});
