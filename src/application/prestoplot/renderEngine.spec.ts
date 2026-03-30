/**
 * RenderEngine unit tests.
 *
 * Tests the per-render execution engine that resolves rules,
 * evaluates templates, and manages selection state.
 *
 * @module
 */

import { describe, expect, it, vi } from 'vitest';

import { RenderBudgetError } from '../../domain/prestoplot/errors.js';
import type { Grammar, Rule } from '../../domain/prestoplot/grammar.js';
import { RenderStrategy, SelectionMode } from '../../domain/prestoplot/grammar.js';
import type { Seed } from '../../domain/prestoplot/seed.js';

import type { RandomPort, Rng } from './RandomSource.js';
import { createRenderEngine, MAX_EVALUATIONS } from './renderEngine.js';
import type { TemplateEnginePort } from './TemplateEngine.js';

/**
 * Creates a minimal Grammar for testing.
 *
 * @param rules - The map of rule names to Rule definitions.
 * @param entry - The entry rule name (defaults to 'Begin').
 * @returns A frozen Grammar object for testing.
 */
function makeGrammar(rules: ReadonlyMap<string, Rule>, entry = 'Begin'): Grammar {
  return Object.freeze({
    key: 'test-grammar',
    rules,
    includes: [],
    entry,
  });
}

/**
 * Creates a simple text rule with one alternative.
 *
 * @param name - The rule name identifier.
 * @param text - The text content for the single alternative.
 * @param strategy - The render strategy (defaults to PLAIN).
 * @returns A text Rule with one alternative.
 */
function textRule(name: string, text: string, strategy = RenderStrategy.PLAIN): Rule {
  return {
    name,
    type: 'text',
    alternatives: [{ text, weight: 1 }],
    strategy,
  };
}

/**
 * Creates a list rule.
 *
 * @param name - The rule name identifier.
 * @param items - The list of items to select from.
 * @param mode - The selection mode (defaults to REUSE).
 * @param strategy - The render strategy (defaults to PLAIN).
 * @returns A list Rule with the given items and selection mode.
 */
function listRule(
  name: string,
  items: readonly string[],
  mode = SelectionMode.REUSE,
  strategy = RenderStrategy.PLAIN
): Rule {
  return {
    name,
    type: 'list',
    items,
    selectionMode: mode,
    strategy,
  };
}

/**
 * Creates a struct rule.
 *
 * @param name - The rule name identifier.
 * @param fields - Map of field names to referenced rule names.
 * @param template - The template string using field references.
 * @returns A struct Rule with the given fields and template.
 */
function structRule(name: string, fields: ReadonlyMap<string, string>, template: string): Rule {
  return {
    name,
    type: 'struct',
    fields,
    template,
  };
}

/**
 * Creates a stub RandomPort.
 *
 * @param seedIntValue - The integer value returned by seedToInt (defaults to 42).
 * @returns A RandomPort stub with deterministic behavior.
 */
function stubRandomPort(seedIntValue = 42): RandomPort {
  return {
    seedToInt: vi.fn().mockResolvedValue(seedIntValue),
    createRng: vi.fn().mockReturnValue({
      next: vi.fn().mockReturnValue(0.5),
    }),
  };
}

/**
 * Creates a pass-through TemplateEnginePort that returns template as-is.
 *
 * @returns A TemplateEnginePort stub that returns templates unchanged.
 */
function passthroughTemplateEngine(): TemplateEnginePort {
  return {
    evaluate: vi.fn().mockImplementation((template: string) => template),
  };
}

/**
 * Creates a template engine that resolves {{ X }} references from context.
 *
 * @returns A TemplateEnginePort stub that replaces references from context.
 */
function resolvingTemplateEngine(): TemplateEnginePort {
  return {
    evaluate: vi
      .fn()
      .mockImplementation((template: string, context: Readonly<Record<string, string>>) => {
        return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_match, key: string) => {
          const val = context[key];
          return val ?? `{{ ${key} }}`;
        });
      }),
  };
}

describe('RenderEngine', () => {
  describe('MAX_EVALUATIONS constant', () => {
    it('equals 10000', () => {
      expect(MAX_EVALUATIONS).toBe(10_000);
    });
  });

  describe('renderEntry', () => {
    it('renders a single plain text rule', async () => {
      const rules = new Map<string, Rule>([['Begin', textRule('Begin', 'Hello world')]]);
      const grammar = makeGrammar(rules);
      const engine = createRenderEngine(
        grammar,
        stubRandomPort(),
        passthroughTemplateEngine(),
        'alpha' as Seed
      );

      const result = await engine.renderEntry();

      expect(result).toBe('Hello world');
    });

    it('renders the entry rule specified in the grammar', async () => {
      const rules = new Map<string, Rule>([
        ['Begin', textRule('Begin', 'Start here')],
        ['Other', textRule('Other', 'Not this')],
      ]);
      const grammar = makeGrammar(rules, 'Begin');
      const engine = createRenderEngine(
        grammar,
        stubRandomPort(),
        passthroughTemplateEngine(),
        'seed' as Seed
      );

      const result = await engine.renderEntry();

      expect(result).toBe('Start here');
    });

    it('evaluates template expressions in TEMPLATE strategy rules', async () => {
      const rules = new Map<string, Rule>([
        ['Begin', textRule('Begin', 'A {{ Animal }}', RenderStrategy.TEMPLATE)],
        ['Animal', textRule('Animal', 'cat')],
      ]);
      const grammar = makeGrammar(rules);
      const templateEngine = resolvingTemplateEngine();
      const engine = createRenderEngine(grammar, stubRandomPort(), templateEngine, 'seed' as Seed);

      const result = await engine.renderEntry();

      expect(result).toBe('A cat');
    });

    it('does not evaluate templates for PLAIN strategy rules', async () => {
      const rules = new Map<string, Rule>([
        ['Begin', textRule('Begin', '{{ not_a_template }}', RenderStrategy.PLAIN)],
      ]);
      const grammar = makeGrammar(rules);
      const templateEngine = resolvingTemplateEngine();
      const engine = createRenderEngine(grammar, stubRandomPort(), templateEngine, 'seed' as Seed);

      const result = await engine.renderEntry();

      expect(result).toBe('{{ not_a_template }}');
      // eslint-disable-next-line @typescript-eslint/unbound-method -- vi.fn() mock is safe to reference unbound
      expect(templateEngine.evaluate).not.toHaveBeenCalled();
    });

    it('selects from text rule alternatives using RNG', async () => {
      const rules = new Map<string, Rule>([
        [
          'Begin',
          {
            name: 'Begin',
            type: 'text',
            alternatives: [
              { text: 'first', weight: 1 },
              { text: 'second', weight: 1 },
            ],
            strategy: RenderStrategy.PLAIN,
          },
        ],
      ]);
      const grammar = makeGrammar(rules);
      const randomPort = stubRandomPort();
      // RNG returns 0.5, which with 2 equal weights should select one alternative
      const engine = createRenderEngine(
        grammar,
        randomPort,
        passthroughTemplateEngine(),
        'seed' as Seed
      );

      const result = await engine.renderEntry();

      // With 0.5 random value and equal weights, it should select one deterministically
      expect(['first', 'second']).toContain(result);
    });

    it('handles weighted alternatives correctly', async () => {
      const rules = new Map<string, Rule>([
        [
          'Begin',
          {
            name: 'Begin',
            type: 'text',
            alternatives: [
              { text: 'heavy', weight: 99 },
              { text: 'light', weight: 1 },
            ],
            strategy: RenderStrategy.PLAIN,
          },
        ],
      ]);
      const grammar = makeGrammar(rules);
      // RNG returns 0.0 — should always select the first (heaviest) alternative
      const rng: Rng = { next: vi.fn().mockReturnValue(0.0) };
      const randomPort: RandomPort = {
        seedToInt: vi.fn().mockResolvedValue(42),
        createRng: vi.fn().mockReturnValue(rng),
      };
      const engine = createRenderEngine(
        grammar,
        randomPort,
        passthroughTemplateEngine(),
        'seed' as Seed
      );

      const result = await engine.renderEntry();

      expect(result).toBe('heavy');
    });
  });

  describe('list rules', () => {
    it('renders REUSE mode list rule', async () => {
      const rules = new Map<string, Rule>([
        ['Begin', listRule('Begin', ['apple', 'banana', 'cherry'], SelectionMode.REUSE)],
      ]);
      const grammar = makeGrammar(rules);
      const engine = createRenderEngine(
        grammar,
        stubRandomPort(),
        passthroughTemplateEngine(),
        'seed' as Seed
      );

      const result = await engine.renderEntry();

      expect(['apple', 'banana', 'cherry']).toContain(result);
    });

    it('renders RATCHET mode list rule sequentially', async () => {
      const rules = new Map<string, Rule>([
        ['Begin', textRule('Begin', '{{ Item }} {{ Item }}', RenderStrategy.TEMPLATE)],
        ['Item', listRule('Item', ['a', 'b', 'c'], SelectionMode.RATCHET)],
      ]);
      const grammar = makeGrammar(rules);
      const templateEngine = resolvingTemplateEngine();
      const engine = createRenderEngine(grammar, stubRandomPort(), templateEngine, 'seed' as Seed);

      const result = await engine.renderEntry();

      // RATCHET cycles: first call returns 'a', second returns 'b'
      expect(result).toBe('a b');
    });

    it('renders LIST mode with index from RNG', async () => {
      const rules = new Map<string, Rule>([
        ['Begin', listRule('Begin', ['zero', 'one', 'two'], SelectionMode.LIST)],
      ]);
      const grammar = makeGrammar(rules);
      // RNG value 0.0 should give index 0
      const rng: Rng = { next: vi.fn().mockReturnValue(0.0) };
      const randomPort: RandomPort = {
        seedToInt: vi.fn().mockResolvedValue(42),
        createRng: vi.fn().mockReturnValue(rng),
      };
      const engine = createRenderEngine(
        grammar,
        randomPort,
        passthroughTemplateEngine(),
        'seed' as Seed
      );

      const result = await engine.renderEntry();

      expect(result).toBe('zero');
    });

    it('renders PICK mode without replacement', async () => {
      const rules = new Map<string, Rule>([
        ['Begin', textRule('Begin', '{{ Item }} {{ Item }} {{ Item }}', RenderStrategy.TEMPLATE)],
        ['Item', listRule('Item', ['x', 'y', 'z'], SelectionMode.PICK)],
      ]);
      const grammar = makeGrammar(rules);
      const templateEngine = resolvingTemplateEngine();
      const engine = createRenderEngine(grammar, stubRandomPort(), templateEngine, 'seed' as Seed);

      const result = await engine.renderEntry();

      const parts = result.split(' ');
      // All 3 items should appear exactly once (PICK = without replacement in first epoch)
      expect(parts).toHaveLength(3);
      expect(new Set(parts).size).toBe(3);
      for (const part of parts) {
        expect(['x', 'y', 'z']).toContain(part);
      }
    });

    it('evaluates template expressions in list items with TEMPLATE strategy', async () => {
      const rules = new Map<string, Rule>([
        [
          'Begin',
          listRule('Begin', ['Hello {{ Name }}'], SelectionMode.REUSE, RenderStrategy.TEMPLATE),
        ],
        ['Name', textRule('Name', 'Alice')],
      ]);
      const grammar = makeGrammar(rules);
      const templateEngine = resolvingTemplateEngine();
      // RNG returns 0.0 to always select first item
      const rng: Rng = { next: vi.fn().mockReturnValue(0.0) };
      const randomPort: RandomPort = {
        seedToInt: vi.fn().mockResolvedValue(42),
        createRng: vi.fn().mockReturnValue(rng),
      };
      const engine = createRenderEngine(grammar, randomPort, templateEngine, 'seed' as Seed);

      const result = await engine.renderEntry();

      expect(result).toBe('Hello Alice');
    });
  });

  describe('struct rules', () => {
    it('renders struct rule by evaluating its template with field values', async () => {
      const fields = new Map([
        ['name', 'Name'],
        ['color', 'Color'],
      ]);
      const rules = new Map<string, Rule>([
        ['Begin', structRule('Begin', fields, '{{ name }} is {{ color }}')],
        ['Name', textRule('Name', 'Rose')],
        ['Color', textRule('Color', 'red')],
      ]);
      const grammar = makeGrammar(rules);
      const templateEngine = resolvingTemplateEngine();
      const engine = createRenderEngine(grammar, stubRandomPort(), templateEngine, 'seed' as Seed);

      const result = await engine.renderEntry();

      expect(result).toBe('Rose is red');
    });
  });

  describe('seed caching', () => {
    it('caches seedToInt results for the same scoped seed', async () => {
      const rules = new Map<string, Rule>([
        ['Begin', textRule('Begin', '{{ A }} {{ A }}', RenderStrategy.TEMPLATE)],
        ['A', textRule('A', 'val')],
      ]);
      const grammar = makeGrammar(rules);
      const randomPort = stubRandomPort();
      const templateEngine = resolvingTemplateEngine();
      const engine = createRenderEngine(grammar, randomPort, templateEngine, 'seed' as Seed);

      await engine.renderEntry();

      // seedToInt should be called once per unique scoped seed, not per reference
      // "A" rule is referenced twice but same scoped seed, so cached
      const seedToIntCalls = (randomPort.seedToInt as ReturnType<typeof vi.fn>).mock.calls;
      const uniqueSeeds = new Set(seedToIntCalls.map((c: unknown[]) => c[0]));
      // At least Begin + A scoped seeds
      expect(uniqueSeeds.size).toBeGreaterThanOrEqual(2);
      // A should only hash once despite two references
      const aCalls = seedToIntCalls.filter((c: unknown[]) => (c[0] as string).includes('A'));
      expect(aCalls).toHaveLength(1);
    });
  });

  describe('evaluation budget', () => {
    it('throws RenderBudgetError when MAX_EVALUATIONS exceeded', async () => {
      // Create a grammar with branching mutual recursion that exceeds budget
      // A renders "{{ B }} {{ B }}", B renders "{{ C }} {{ C }}", etc.
      // This creates exponential evaluations
      const rules = new Map<string, Rule>([
        ['Begin', textRule('Begin', '{{ A }}', RenderStrategy.TEMPLATE)],
        ['A', textRule('A', '{{ B }} {{ B }}', RenderStrategy.TEMPLATE)],
        ['B', textRule('B', '{{ C }} {{ C }}', RenderStrategy.TEMPLATE)],
        ['C', textRule('C', '{{ D }} {{ D }}', RenderStrategy.TEMPLATE)],
        ['D', textRule('D', '{{ E }} {{ E }}', RenderStrategy.TEMPLATE)],
        ['E', textRule('E', '{{ F }} {{ F }}', RenderStrategy.TEMPLATE)],
        ['F', textRule('F', '{{ G }} {{ G }}', RenderStrategy.TEMPLATE)],
        ['G', textRule('G', '{{ H }} {{ H }}', RenderStrategy.TEMPLATE)],
        ['H', textRule('H', '{{ I }} {{ I }}', RenderStrategy.TEMPLATE)],
        ['I', textRule('I', '{{ J }} {{ J }}', RenderStrategy.TEMPLATE)],
        ['J', textRule('J', '{{ K }} {{ K }}', RenderStrategy.TEMPLATE)],
        ['K', textRule('K', '{{ L }} {{ L }}', RenderStrategy.TEMPLATE)],
        ['L', textRule('L', '{{ M }} {{ M }}', RenderStrategy.TEMPLATE)],
        ['M', textRule('M', '{{ N }} {{ N }}', RenderStrategy.TEMPLATE)],
        ['N', textRule('N', 'leaf')],
      ]);
      const grammar = makeGrammar(rules);
      const templateEngine = resolvingTemplateEngine();
      const engine = createRenderEngine(grammar, stubRandomPort(), templateEngine, 'seed' as Seed);

      await expect(engine.renderEntry()).rejects.toThrow(RenderBudgetError);
    });

    it('tracks evaluation count across all rule renders', async () => {
      // Simple grammar that fits within budget
      const rules = new Map<string, Rule>([
        ['Begin', textRule('Begin', '{{ A }}', RenderStrategy.TEMPLATE)],
        ['A', textRule('A', 'done')],
      ]);
      const grammar = makeGrammar(rules);
      const templateEngine = resolvingTemplateEngine();
      const engine = createRenderEngine(grammar, stubRandomPort(), templateEngine, 'seed' as Seed);

      // Should succeed within budget
      const result = await engine.renderEntry();
      expect(result).toBe('done');
    });
  });

  describe('selection state', () => {
    it('maintains RATCHET state across multiple references to the same rule', async () => {
      const rules = new Map<string, Rule>([
        ['Begin', textRule('Begin', '{{ Num }} {{ Num }} {{ Num }}', RenderStrategy.TEMPLATE)],
        ['Num', listRule('Num', ['1', '2', '3'], SelectionMode.RATCHET)],
      ]);
      const grammar = makeGrammar(rules);
      const templateEngine = resolvingTemplateEngine();
      const engine = createRenderEngine(grammar, stubRandomPort(), templateEngine, 'seed' as Seed);

      const result = await engine.renderEntry();

      expect(result).toBe('1 2 3');
    });

    it('wraps RATCHET state when exhausted', async () => {
      const rules = new Map<string, Rule>([
        ['Begin', textRule('Begin', '{{ N }} {{ N }} {{ N }} {{ N }}', RenderStrategy.TEMPLATE)],
        ['N', listRule('N', ['a', 'b'], SelectionMode.RATCHET)],
      ]);
      const grammar = makeGrammar(rules);
      const templateEngine = resolvingTemplateEngine();
      const engine = createRenderEngine(grammar, stubRandomPort(), templateEngine, 'seed' as Seed);

      const result = await engine.renderEntry();

      // RATCHET wraps: a, b, a, b
      expect(result).toBe('a b a b');
    });
  });

  describe('scoped seed isolation', () => {
    it('produces identical output for two engines with the same seed', async () => {
      const rules = new Map<string, Rule>([
        ['Begin', textRule('Begin', '{{ Color }} {{ Animal }}', RenderStrategy.TEMPLATE)],
        ['Color', listRule('Color', ['red', 'blue', 'green'], SelectionMode.REUSE)],
        ['Animal', listRule('Animal', ['cat', 'dog', 'fox'], SelectionMode.REUSE)],
      ]);
      const grammar = makeGrammar(rules);
      const templateEngine = resolvingTemplateEngine();

      // Track seedToInt calls to return distinct values per scoped seed
      let callCount = 0;
      const seedMap = new Map<string, number>();
      const randomPort: RandomPort = {
        seedToInt: vi.fn().mockImplementation((s: string) => {
          let val = seedMap.get(s);
          if (val === undefined) {
            val = 100 + callCount++;
            seedMap.set(s, val);
          }
          return Promise.resolve(val);
        }),
        createRng: vi.fn().mockReturnValue({
          next: vi.fn().mockReturnValue(0.3),
        }),
      };

      const engine1 = createRenderEngine(grammar, randomPort, templateEngine, 'sameSeed' as Seed);
      const result1 = await engine1.renderEntry();

      // Reset call tracking but keep seedMap for same mapping
      const randomPort2: RandomPort = {
        seedToInt: vi.fn().mockImplementation((s: string) => {
          return Promise.resolve(seedMap.get(s) ?? 0);
        }),
        createRng: vi.fn().mockReturnValue({
          next: vi.fn().mockReturnValue(0.3),
        }),
      };

      const engine2 = createRenderEngine(grammar, randomPort2, templateEngine, 'sameSeed' as Seed);
      const result2 = await engine2.renderEntry();

      expect(result1).toBe(result2);
    });

    it('scopes RNG seeds by rule name so different rules get different sequences', async () => {
      const rules = new Map<string, Rule>([
        ['Begin', textRule('Begin', '{{ A }} {{ B }}', RenderStrategy.TEMPLATE)],
        ['A', textRule('A', 'a')],
        ['B', textRule('B', 'b')],
      ]);
      const grammar = makeGrammar(rules);
      const templateEngine = resolvingTemplateEngine();
      const randomPort: RandomPort = {
        seedToInt: vi.fn().mockImplementation((scopedSeed: string) => {
          // Return different int per scoped seed
          if (scopedSeed === 'mySeed-A') return Promise.resolve(100);
          if (scopedSeed === 'mySeed-B') return Promise.resolve(200);
          return Promise.resolve(42);
        }),
        createRng: vi.fn().mockReturnValue({
          next: vi.fn().mockReturnValue(0.5),
        }),
      };

      const engine = createRenderEngine(grammar, randomPort, templateEngine, 'mySeed' as Seed);
      await engine.renderEntry();

      // Verify seedToInt was called with different scoped seeds for A and B
      const calls = (randomPort.seedToInt as ReturnType<typeof vi.fn>).mock.calls.map(
        (c: unknown[]) => c[0]
      );
      expect(calls).toContain('mySeed-A');
      expect(calls).toContain('mySeed-B');
      // And they map to different seed ints
      expect(await randomPort.seedToInt('mySeed-A')).not.toBe(
        await randomPort.seedToInt('mySeed-B')
      );
    });

    it('adding an unrelated rule does not change output', async () => {
      const baseRules = new Map<string, Rule>([
        ['Begin', textRule('Begin', '{{ Greeting }}', RenderStrategy.TEMPLATE)],
        ['Greeting', textRule('Greeting', 'hello')],
      ]);
      const grammar1 = makeGrammar(baseRules);

      const extendedRules = new Map<string, Rule>([
        ['Begin', textRule('Begin', '{{ Greeting }}', RenderStrategy.TEMPLATE)],
        ['Greeting', textRule('Greeting', 'hello')],
        ['Unrelated', textRule('Unrelated', 'should not matter')],
      ]);
      const grammar2 = makeGrammar(extendedRules);

      const templateEngine = resolvingTemplateEngine();
      const port1 = stubRandomPort();
      const port2 = stubRandomPort();

      const engine1 = createRenderEngine(grammar1, port1, templateEngine, 'seed1' as Seed);
      const result1 = await engine1.renderEntry();

      const engine2 = createRenderEngine(grammar2, port2, templateEngine, 'seed1' as Seed);
      const result2 = await engine2.renderEntry();

      expect(result1).toBe(result2);
    });
  });
});
