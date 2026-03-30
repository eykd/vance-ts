/**
 * Grammar aggregate and related type unit tests.
 *
 * @module
 */

import { describe, expect, it } from 'vitest';

import { DomainError } from '../errors/DomainError.js';

import {
  RenderStrategy,
  SelectionMode,
  createGrammar,
  type ListRule,
  type Rule,
  type StructRule,
  type TextRule,
  type WeightedAlternative,
} from './grammar.js';

describe('SelectionMode', () => {
  it('defines all five modes', () => {
    expect(SelectionMode.REUSE).toBe('REUSE');
    expect(SelectionMode.PICK).toBe('PICK');
    expect(SelectionMode.RATCHET).toBe('RATCHET');
    expect(SelectionMode.MARKOV).toBe('MARKOV');
    expect(SelectionMode.LIST).toBe('LIST');
  });
});

describe('RenderStrategy', () => {
  it('defines TEMPLATE and PLAIN', () => {
    expect(RenderStrategy.TEMPLATE).toBe('TEMPLATE');
    expect(RenderStrategy.PLAIN).toBe('PLAIN');
  });
});

describe('WeightedAlternative', () => {
  it('holds text and weight', () => {
    const alt: WeightedAlternative = { text: 'A distant star.', weight: 2 };

    expect(alt.text).toBe('A distant star.');
    expect(alt.weight).toBe(2);
  });
});

describe('TextRule', () => {
  it('has type text with alternatives and strategy', () => {
    const rule: TextRule = {
      name: 'description',
      type: 'text',
      alternatives: [{ text: 'Hello', weight: 1 }],
      strategy: RenderStrategy.PLAIN,
    };

    expect(rule.type).toBe('text');
    expect(rule.alternatives).toHaveLength(1);
    expect(rule.strategy).toBe(RenderStrategy.PLAIN);
  });
});

describe('ListRule', () => {
  it('has type list with items and selection mode', () => {
    const rule: ListRule = {
      name: 'animals',
      type: 'list',
      items: ['cat', 'dog', 'fish'],
      selectionMode: SelectionMode.PICK,
      strategy: RenderStrategy.PLAIN,
    };

    expect(rule.type).toBe('list');
    expect(rule.items).toEqual(['cat', 'dog', 'fish']);
    expect(rule.selectionMode).toBe(SelectionMode.PICK);
  });
});

describe('StructRule', () => {
  it('has type struct with fields and template', () => {
    const rule: StructRule = {
      name: 'planet',
      type: 'struct',
      fields: new Map([
        ['name', 'planet_name'],
        ['class', 'planet_class'],
      ]),
      template: '{{ name }} is a {{ class }} planet.',
    };

    expect(rule.type).toBe('struct');
    expect(rule.fields.get('name')).toBe('planet_name');
    expect(rule.template).toContain('{{ name }}');
  });
});

describe('Rule union type', () => {
  it('discriminates on type field', () => {
    const text: Rule = {
      name: 'greeting',
      type: 'text',
      alternatives: [{ text: 'Hi', weight: 1 }],
      strategy: RenderStrategy.TEMPLATE,
    };

    const list: Rule = {
      name: 'colors',
      type: 'list',
      items: ['red'],
      selectionMode: SelectionMode.REUSE,
      strategy: RenderStrategy.PLAIN,
    };

    const struct: Rule = {
      name: 'ship',
      type: 'struct',
      fields: new Map([['name', 'ship_name']]),
      template: '{{ name }}',
    };

    // Type narrowing via discriminant
    if (text.type === 'text') {
      expect(text.alternatives).toBeDefined();
    }
    if (list.type === 'list') {
      expect(list.items).toBeDefined();
    }
    if (struct.type === 'struct') {
      expect(struct.fields).toBeDefined();
    }
  });
});

describe('createGrammar', () => {
  it('creates a grammar with key, rules, entry, and empty includes', () => {
    const rules = new Map<string, Rule>([
      [
        'main',
        {
          name: 'main',
          type: 'text',
          alternatives: [{ text: 'Hello world', weight: 1 }],
          strategy: RenderStrategy.PLAIN,
        },
      ],
    ]);

    const result = createGrammar('test-grammar', rules, 'main');

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.key).toBe('test-grammar');
      expect(result.value.rules.size).toBe(1);
      expect(result.value.entry).toBe('main');
      expect(result.value.includes).toEqual([]);
    }
  });

  it('accepts includes list', () => {
    const rules = new Map<string, Rule>([
      [
        'main',
        {
          name: 'main',
          type: 'text',
          alternatives: [{ text: 'A', weight: 1 }],
          strategy: RenderStrategy.PLAIN,
        },
      ],
    ]);

    const result = createGrammar('my-grammar', rules, 'main', ['shared-names']);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.includes).toEqual(['shared-names']);
    }
  });

  it('rejects empty rules map', () => {
    const rules = new Map<string, Rule>();
    const result = createGrammar('empty', rules, 'main');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(DomainError);
      expect(result.error.code).toBe('empty_grammar');
    }
  });

  it('rejects when entry rule does not exist in rules', () => {
    const rules = new Map<string, Rule>([
      [
        'greeting',
        {
          name: 'greeting',
          type: 'text',
          alternatives: [{ text: 'Hi', weight: 1 }],
          strategy: RenderStrategy.PLAIN,
        },
      ],
    ]);

    const result = createGrammar('bad-entry', rules, 'nonexistent');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('entry_not_found');
    }
  });

  it('rejects empty key', () => {
    const rules = new Map<string, Rule>([
      [
        'main',
        {
          name: 'main',
          type: 'text',
          alternatives: [{ text: 'A', weight: 1 }],
          strategy: RenderStrategy.PLAIN,
        },
      ],
    ]);

    const result = createGrammar('', rules, 'main');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('invalid_key');
    }
  });

  it('produces readonly rules map', () => {
    const rules = new Map<string, Rule>([
      [
        'main',
        {
          name: 'main',
          type: 'text',
          alternatives: [{ text: 'A', weight: 1 }],
          strategy: RenderStrategy.PLAIN,
        },
      ],
    ]);

    const result = createGrammar('readonly-test', rules, 'main');

    expect(result.success).toBe(true);
    if (result.success) {
      // ReadonlyMap does not have set method at compile time;
      // at runtime, verify the grammar has expected shape
      expect(result.value.rules.get('main')).toBeDefined();
    }
  });

  it('creates a grammar with multiple rule types', () => {
    const rules = new Map<string, Rule>([
      [
        'main',
        {
          name: 'main',
          type: 'text',
          alternatives: [{ text: '{{ creature }}', weight: 1 }],
          strategy: RenderStrategy.TEMPLATE,
        },
      ],
      [
        'creature',
        {
          name: 'creature',
          type: 'list',
          items: ['dragon', 'unicorn'],
          selectionMode: SelectionMode.REUSE,
          strategy: RenderStrategy.PLAIN,
        },
      ],
      [
        'planet',
        {
          name: 'planet',
          type: 'struct',
          fields: new Map([['name', 'planet_name']]),
          template: '{{ name }}',
        },
      ],
    ]);

    const result = createGrammar('multi-type', rules, 'main');

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.rules.size).toBe(3);
    }
  });
});
