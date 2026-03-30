/**
 * RenderStoryService unit tests.
 *
 * Tests the public entry point for grammar-based text generation.
 * Verifies the never-throws contract and all error variant mappings.
 *
 * @module
 */

import { describe, expect, it, vi } from 'vitest';

import { StorageError, TemplateError } from '../../domain/prestoplot/errors.js';

import type { GrammarDto, StoragePort } from './GrammarStorage.js';
import type { RandomPort } from './RandomSource.js';
import {
  GRAMMAR_KEY_PATTERN,
  MAX_GRAMMAR_KEY_LENGTH,
  MAX_INCLUDE_COUNT,
  MAX_INCLUDE_DEPTH,
  MAX_SEED_LENGTH,
  renderStory,
} from './renderStoryService.js';
import type { RenderStoryRequest } from './renderStoryService.js';
import type { TemplateEnginePort } from './TemplateEngine.js';

/**
 * Creates an in-memory StoragePort with pre-loaded DTOs.
 *
 * @param dtos - Map of grammar keys to their DTO representations.
 * @returns A StoragePort stub backed by the provided DTOs.
 */
function stubStorage(dtos: Record<string, GrammarDto>): StoragePort {
  return {
    load: vi.fn().mockImplementation((key: string) => Promise.resolve(dtos[key] ?? null)),
    save: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
    keys: vi.fn().mockResolvedValue(Object.keys(dtos)),
  };
}

/**
 * Creates a minimal GrammarDto.
 *
 * @param key - The grammar key identifier.
 * @param entry - The entry rule name (defaults to 'Begin').
 * @param includes - List of included grammar keys.
 * @returns A minimal GrammarDto for testing.
 */
function makeDto(key: string, entry = 'Begin', includes: readonly string[] = []): GrammarDto {
  return {
    version: 1,
    key,
    entry,
    includes: [...includes],
    rules: {
      [entry]: {
        type: 'text',
        alternatives: [{ text: 'Hello from ' + key, weight: 1 }],
        strategy: 'PLAIN',
      },
    },
  };
}

/**
 * Creates a stub RandomPort.
 *
 * @returns A RandomPort stub with deterministic behavior.
 */
function stubRandomPort(): RandomPort {
  return {
    seedToInt: vi.fn().mockResolvedValue(42),
    createRng: vi.fn().mockReturnValue({
      next: vi.fn().mockReturnValue(0.5),
    }),
  };
}

/**
 * Creates a pass-through TemplateEnginePort.
 *
 * @returns A TemplateEnginePort stub that returns templates unchanged.
 */
function stubTemplateEngine(): TemplateEnginePort {
  return {
    evaluate: vi.fn().mockImplementation((template: string) => template),
  };
}

describe('RenderStoryService', () => {
  describe('constants', () => {
    it('MAX_SEED_LENGTH equals 256', () => {
      expect(MAX_SEED_LENGTH).toBe(256);
    });

    it('MAX_INCLUDE_DEPTH equals 20', () => {
      expect(MAX_INCLUDE_DEPTH).toBe(20);
    });

    it('MAX_INCLUDE_COUNT equals 50', () => {
      expect(MAX_INCLUDE_COUNT).toBe(50);
    });

    it('MAX_GRAMMAR_KEY_LENGTH equals 128', () => {
      expect(MAX_GRAMMAR_KEY_LENGTH).toBe(128);
    });

    it('GRAMMAR_KEY_PATTERN matches valid keys', () => {
      expect(GRAMMAR_KEY_PATTERN.test('hello')).toBe(true);
      expect(GRAMMAR_KEY_PATTERN.test('crew-chatter')).toBe(true);
      expect(GRAMMAR_KEY_PATTERN.test('a0_b-c')).toBe(true);
    });

    it('GRAMMAR_KEY_PATTERN rejects invalid keys', () => {
      expect(GRAMMAR_KEY_PATTERN.test('')).toBe(false);
      expect(GRAMMAR_KEY_PATTERN.test('0abc')).toBe(false);
      expect(GRAMMAR_KEY_PATTERN.test('Hello')).toBe(false);
      expect(GRAMMAR_KEY_PATTERN.test('a b')).toBe(false);
      expect(GRAMMAR_KEY_PATTERN.test('../etc')).toBe(false);
    });
  });

  describe('successful render', () => {
    it('returns ok result with rendered text', async () => {
      const dto = makeDto('test-grammar');
      const storage = stubStorage({ 'test-grammar': dto });
      const request: RenderStoryRequest = { grammarKey: 'test-grammar', seed: 'alpha' };

      const result = await renderStory(request, storage, stubRandomPort(), stubTemplateEngine());

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.text).toBe('Hello from test-grammar');
      }
    });

    it('produces deterministic output for the same seed', async () => {
      const dto = makeDto('det-grammar');
      const storage = stubStorage({ 'det-grammar': dto });
      const request: RenderStoryRequest = { grammarKey: 'det-grammar', seed: 'seed-42' };

      const result1 = await renderStory(request, storage, stubRandomPort(), stubTemplateEngine());
      const result2 = await renderStory(request, storage, stubRandomPort(), stubTemplateEngine());

      expect(result1).toEqual(result2);
    });
  });

  describe('never-throws contract', () => {
    it('maps grammar key exceeding MAX_GRAMMAR_KEY_LENGTH to invalid_key result', async () => {
      const storage = stubStorage({});
      const longKey = 'a'.repeat(MAX_GRAMMAR_KEY_LENGTH + 1);
      const request: RenderStoryRequest = { grammarKey: longKey, seed: 'alpha' };

      const result = await renderStory(request, storage, stubRandomPort(), stubTemplateEngine());

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.kind).toBe('invalid_key');
      }
    });

    it('accepts grammar key at exactly MAX_GRAMMAR_KEY_LENGTH', async () => {
      const exactKey = 'a'.repeat(MAX_GRAMMAR_KEY_LENGTH);
      const dto = makeDto(exactKey);
      const storage = stubStorage({ [exactKey]: dto });
      const request: RenderStoryRequest = { grammarKey: exactKey, seed: 'alpha' };

      const result = await renderStory(request, storage, stubRandomPort(), stubTemplateEngine());

      expect(result.success).toBe(true);
    });

    it('maps grammar key with invalid format to invalid_key result', async () => {
      const storage = stubStorage({});
      const request: RenderStoryRequest = { grammarKey: '../traversal', seed: 'alpha' };

      const result = await renderStory(request, storage, stubRandomPort(), stubTemplateEngine());

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.kind).toBe('invalid_key');
      }
    });

    it('maps empty grammar key to invalid_key result', async () => {
      const storage = stubStorage({});
      const request: RenderStoryRequest = { grammarKey: '', seed: 'alpha' };

      const result = await renderStory(request, storage, stubRandomPort(), stubTemplateEngine());

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.kind).toBe('invalid_key');
      }
    });

    it('maps uppercase grammar key to invalid_key result', async () => {
      const storage = stubStorage({});
      const request: RenderStoryRequest = { grammarKey: 'InvalidKey', seed: 'alpha' };

      const result = await renderStory(request, storage, stubRandomPort(), stubTemplateEngine());

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.kind).toBe('invalid_key');
      }
    });

    it('maps invalid (empty) seed to invalid_seed result', async () => {
      const storage = stubStorage({});
      const request: RenderStoryRequest = { grammarKey: 'any', seed: '' };

      const result = await renderStory(request, storage, stubRandomPort(), stubTemplateEngine());

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.kind).toBe('invalid_seed');
      }
    });

    it('maps whitespace-only seed to invalid_seed result', async () => {
      const storage = stubStorage({});
      const request: RenderStoryRequest = { grammarKey: 'any', seed: '   ' };

      const result = await renderStory(request, storage, stubRandomPort(), stubTemplateEngine());

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.kind).toBe('invalid_seed');
      }
    });

    it('maps seed exceeding MAX_SEED_LENGTH to invalid_seed result', async () => {
      const storage = stubStorage({});
      const longSeed = 'a'.repeat(MAX_SEED_LENGTH + 1);
      const request: RenderStoryRequest = { grammarKey: 'any', seed: longSeed };

      const result = await renderStory(request, storage, stubRandomPort(), stubTemplateEngine());

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.kind).toBe('invalid_seed');
      }
    });

    it('accepts seed at exactly MAX_SEED_LENGTH', async () => {
      const dto = makeDto('test');
      const storage = stubStorage({ test: dto });
      const exactSeed = 'a'.repeat(MAX_SEED_LENGTH);
      const request: RenderStoryRequest = { grammarKey: 'test', seed: exactSeed };

      const result = await renderStory(request, storage, stubRandomPort(), stubTemplateEngine());

      expect(result.success).toBe(true);
    });

    it('maps missing grammar to module_not_found result', async () => {
      const storage = stubStorage({});
      const request: RenderStoryRequest = { grammarKey: 'nonexistent', seed: 'alpha' };

      const result = await renderStory(request, storage, stubRandomPort(), stubTemplateEngine());

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.kind).toBe('module_not_found');
        expect(result.moduleName).toBe('nonexistent');
      }
    });

    it('maps storage load failure to storage_error result', async () => {
      const storage: StoragePort = {
        load: vi.fn().mockRejectedValue(new StorageError('read_failed', 'KV down')),
        save: vi.fn(),
        delete: vi.fn(),
        keys: vi.fn(),
      };
      const request: RenderStoryRequest = { grammarKey: 'any', seed: 'alpha' };

      const result = await renderStory(request, storage, stubRandomPort(), stubTemplateEngine());

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.kind).toBe('storage_error');
      }
    });

    it('maps generic storage throw to storage_error result', async () => {
      const storage: StoragePort = {
        load: vi.fn().mockRejectedValue(new Error('network timeout')),
        save: vi.fn(),
        delete: vi.fn(),
        keys: vi.fn(),
      };
      const request: RenderStoryRequest = { grammarKey: 'any', seed: 'alpha' };

      const result = await renderStory(request, storage, stubRandomPort(), stubTemplateEngine());

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.kind).toBe('storage_error');
      }
    });

    it('maps crypto.subtle failure to seed_error result', async () => {
      const dto = makeDto('test');
      const storage = stubStorage({ test: dto });
      const randomPort: RandomPort = {
        seedToInt: vi.fn().mockRejectedValue(new Error('crypto unavailable')),
        createRng: vi.fn().mockReturnValue({ next: vi.fn().mockReturnValue(0.5) }),
      };
      const request: RenderStoryRequest = { grammarKey: 'test', seed: 'alpha' };

      const result = await renderStory(request, storage, randomPort, stubTemplateEngine());

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.kind).toBe('seed_error');
      }
    });

    it('maps TemplateError to template_error result', async () => {
      const dto = makeDto('test');
      // Modify DTO to have TEMPLATE strategy
      (dto.rules['Begin'] as Record<string, unknown>)['strategy'] = 'TEMPLATE';
      (
        (dto.rules['Begin'] as Record<string, unknown>)['alternatives'] as Array<
          Record<string, unknown>
        >
      )[0]!['text'] = '{{ missing }}';
      const storage = stubStorage({ test: dto });
      const templateEngine: TemplateEnginePort = {
        evaluate: vi.fn().mockImplementation(() => {
          throw new TemplateError('unresolved_ref', 'Unknown ref "missing"');
        }),
      };
      const request: RenderStoryRequest = { grammarKey: 'test', seed: 'alpha' };

      const result = await renderStory(request, storage, stubRandomPort(), templateEngine);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.kind).toBe('template_error');
      }
    });

    it('maps RenderError to render_error result for unsupported MARKOV mode', async () => {
      const dto: GrammarDto = {
        version: 1,
        key: 'markov-test',
        entry: 'Begin',
        includes: [],
        rules: {
          Begin: {
            name: 'Begin',
            type: 'list',
            items: ['alpha', 'beta'],
            selectionMode: 'MARKOV',
            strategy: 'PLAIN',
          },
        },
      };
      const storage = stubStorage({ 'markov-test': dto });
      const request: RenderStoryRequest = { grammarKey: 'markov-test', seed: 'alpha' };

      const result = await renderStory(request, storage, stubRandomPort(), stubTemplateEngine());

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.kind).toBe('render_error');
        if (result.kind === 'render_error') {
          expect(result.message).toContain('MARKOV');
        }
      }
    });

    it('maps RenderBudgetError to render_budget result', async () => {
      // Create a grammar that will exceed evaluation budget
      const rules: Record<string, unknown> = {};
      // Create deep branching recursion: Begin -> A -> B -> ... each doubling
      const letters = 'ABCDEFGHIJKLMN';
      rules['Begin'] = {
        type: 'text',
        alternatives: [{ text: '{{ A }}', weight: 1 }],
        strategy: 'TEMPLATE',
      };
      for (let i = 0; i < letters.length - 1; i++) {
        const current = letters[i]!;
        const next = letters[i + 1]!;
        rules[current] = {
          type: 'text',
          alternatives: [{ text: `{{ ${next} }} {{ ${next} }}`, weight: 1 }],
          strategy: 'TEMPLATE',
        };
      }
      rules[letters[letters.length - 1]!] = {
        type: 'text',
        alternatives: [{ text: 'leaf', weight: 1 }],
        strategy: 'PLAIN',
      };

      const dto: GrammarDto = {
        version: 1,
        key: 'budget-buster',
        entry: 'Begin',
        includes: [],
        rules,
      };
      const storage = stubStorage({ 'budget-buster': dto });
      const request: RenderStoryRequest = { grammarKey: 'budget-buster', seed: 'alpha' };

      const result = await renderStory(request, storage, stubRandomPort(), stubTemplateEngine());

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.kind).toBe('render_budget');
      }
    });

    it('never throws for any error scenario', async () => {
      const storage: StoragePort = {
        load: vi.fn().mockRejectedValue(new TypeError('unexpected')),
        save: vi.fn(),
        delete: vi.fn(),
        keys: vi.fn(),
      };
      const request: RenderStoryRequest = { grammarKey: 'any', seed: 'alpha' };

      // Must not throw — should return an error result
      const result = await renderStory(request, storage, stubRandomPort(), stubTemplateEngine());
      expect(result.success).toBe(false);
    });
  });

  describe('RenderStoryResult type discrimination', () => {
    it('success result has success: true and text', async () => {
      const dto = makeDto('test');
      const storage = stubStorage({ test: dto });
      const request: RenderStoryRequest = { grammarKey: 'test', seed: 'good-seed' };

      const result = await renderStory(request, storage, stubRandomPort(), stubTemplateEngine());

      expect(result).toEqual({ success: true, text: 'Hello from test' });
    });

    it('error results have success: false and kind', async () => {
      const storage = stubStorage({});
      const request: RenderStoryRequest = { grammarKey: 'missing', seed: 'alpha' };

      const result = await renderStory(request, storage, stubRandomPort(), stubTemplateEngine());

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(typeof result.kind).toBe('string');
      }
    });
  });

  describe('include resolution', () => {
    /**
     * Creates a GrammarDto with custom rules map.
     *
     * @param key - Grammar key.
     * @param rules - Rule map.
     * @param includes - Include list.
     * @param entry - Entry rule name.
     * @returns A GrammarDto with the given rules.
     */
    function makeDtoWithRules(
      key: string,
      rules: Record<string, unknown>,
      includes: readonly string[] = [],
      entry = 'Begin'
    ): GrammarDto {
      return { version: 1, key, entry, includes: [...includes], rules };
    }

    /**
     * Creates a simple text rule DTO value.
     *
     * @param text - The text for the single alternative.
     * @returns A plain text rule object.
     */
    function textRule(text: string): Record<string, unknown> {
      return {
        type: 'text',
        alternatives: [{ text, weight: 1 }],
        strategy: 'PLAIN',
      };
    }

    it('resolves BFS left-to-right: loads level-1 before level-2', async () => {
      // a includes [b, c], b includes [d]
      // BFS order: load b and c (level 1), then d (level 2)
      const loadOrder: string[] = [];
      const dtos: Record<string, GrammarDto> = {
        a: makeDtoWithRules('a', { Begin: textRule('from a') }, ['b', 'c']),
        b: makeDtoWithRules('b', { Begin: textRule('from b'), Shared: textRule('from b') }, ['d']),
        c: makeDtoWithRules('c', { Begin: textRule('from c'), Extra: textRule('from c') }),
        d: makeDtoWithRules('d', { Begin: textRule('from d'), Deep: textRule('from d') }),
      };
      const storage: StoragePort = {
        load: vi.fn().mockImplementation((key: string) => {
          loadOrder.push(key);
          return Promise.resolve(dtos[key] ?? null);
        }),
        save: vi.fn(),
        delete: vi.fn(),
        keys: vi.fn(),
      };

      const result = await renderStory(
        { grammarKey: 'a', seed: 'test' },
        storage,
        stubRandomPort(),
        stubTemplateEngine()
      );

      expect(result.success).toBe(true);
      // First load is a (root), then b and c (level 1), then d (level 2)
      expect(loadOrder).toEqual(['a', 'b', 'c', 'd']);
    });

    it('loads same-level includes in parallel via Promise.all', async () => {
      // a includes [b, c, d] — all three should be loaded in parallel
      let concurrentCalls = 0;
      let maxConcurrent = 0;
      const dtos: Record<string, GrammarDto> = {
        a: makeDtoWithRules('a', { Begin: textRule('from a') }, ['b', 'c', 'd']),
        b: makeDtoWithRules('b', { Begin: textRule('from b') }),
        c: makeDtoWithRules('c', { Begin: textRule('from c') }),
        d: makeDtoWithRules('d', { Begin: textRule('from d') }),
      };
      const storage: StoragePort = {
        load: vi.fn().mockImplementation((key: string) => {
          concurrentCalls++;
          if (concurrentCalls > maxConcurrent) {
            maxConcurrent = concurrentCalls;
          }
          return new Promise((resolve) => {
            // Simulate async delay
            setTimeout(() => {
              concurrentCalls--;
              resolve(dtos[key] ?? null);
            }, 10);
          });
        }),
        save: vi.fn(),
        delete: vi.fn(),
        keys: vi.fn(),
      };

      const result = await renderStory(
        { grammarKey: 'a', seed: 'test' },
        storage,
        stubRandomPort(),
        stubTemplateEngine()
      );

      expect(result.success).toBe(true);
      // b, c, d should have been loaded concurrently (max concurrent >= 3)
      expect(maxConcurrent).toBeGreaterThanOrEqual(3);
    });

    it('detects circular includes via path stack: a→b→a', async () => {
      const dtos: Record<string, GrammarDto> = {
        a: makeDtoWithRules('a', { Begin: textRule('from a') }, ['b']),
        b: makeDtoWithRules('b', { Begin: textRule('from b') }, ['a']),
      };
      const storage = stubStorage(dtos);

      const result = await renderStory(
        { grammarKey: 'a', seed: 'test' },
        storage,
        stubRandomPort(),
        stubTemplateEngine()
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.kind).toBe('circular_include');
        if (result.kind === 'circular_include') {
          expect(result.chain).toContain('a');
          expect(result.chain).toContain('b');
        }
      }
    });

    it('detects circular includes: a→b→c→a', async () => {
      const dtos: Record<string, GrammarDto> = {
        a: makeDtoWithRules('a', { Begin: textRule('from a') }, ['b']),
        b: makeDtoWithRules('b', { Begin: textRule('from b') }, ['c']),
        c: makeDtoWithRules('c', { Begin: textRule('from c') }, ['a']),
      };
      const storage = stubStorage(dtos);

      const result = await renderStory(
        { grammarKey: 'a', seed: 'test' },
        storage,
        stubRandomPort(),
        stubTemplateEngine()
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.kind).toBe('circular_include');
      }
    });

    it('handles diamond includes without error: a→[b,c], b→d, c→d', async () => {
      const dtos: Record<string, GrammarDto> = {
        a: makeDtoWithRules('a', { Begin: textRule('from a') }, ['b', 'c']),
        b: makeDtoWithRules('b', { Begin: textRule('from b') }, ['d']),
        c: makeDtoWithRules('c', { Begin: textRule('from c') }, ['d']),
        d: makeDtoWithRules('d', { Begin: textRule('from d'), Leaf: textRule('from d') }),
      };
      const storage = stubStorage(dtos);

      const result = await renderStory(
        { grammarKey: 'a', seed: 'test' },
        storage,
        stubRandomPort(),
        stubTemplateEngine()
      );

      expect(result.success).toBe(true);
      // d should only be loaded once (dedup)
      const loadCalls = (storage.load as ReturnType<typeof vi.fn>).mock.calls.map(
        (c: unknown[]) => c[0]
      );
      const dLoadCount = loadCalls.filter((k: unknown) => k === 'd').length;
      expect(dLoadCount).toBe(1);
    });

    it('left-to-right precedence: first include rule wins', async () => {
      // a includes [b, c], both b and c define rule "Color"
      // b's "Color" should win (left-to-right)
      const dtos: Record<string, GrammarDto> = {
        a: makeDtoWithRules(
          'a',
          {
            Begin: {
              type: 'text',
              alternatives: [{ text: '{{ Color }}', weight: 1 }],
              strategy: 'TEMPLATE',
            },
          },
          ['b', 'c']
        ),
        b: makeDtoWithRules('b', { Begin: textRule('from b'), Color: textRule('blue') }),
        c: makeDtoWithRules('c', { Begin: textRule('from c'), Color: textRule('red') }),
      };
      const storage = stubStorage(dtos);

      const templateEngine: TemplateEnginePort = {
        evaluate: vi.fn().mockImplementation((t: string) => t),
      };

      const result = await renderStory(
        { grammarKey: 'a', seed: 'test' },
        storage,
        stubRandomPort(),
        templateEngine
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.text).toBe('blue');
      }
    });

    it('parent rules override included rules', async () => {
      // a has its own "Color" rule and includes b which also has "Color"
      // a's "Color" should win
      const dtos: Record<string, GrammarDto> = {
        a: makeDtoWithRules(
          'a',
          {
            Begin: {
              type: 'text',
              alternatives: [{ text: '{{ Color }}', weight: 1 }],
              strategy: 'TEMPLATE',
            },
            Color: textRule('green'),
          },
          ['b']
        ),
        b: makeDtoWithRules('b', { Begin: textRule('from b'), Color: textRule('red') }),
      };
      const storage = stubStorage(dtos);

      const templateEngine: TemplateEnginePort = {
        evaluate: vi.fn().mockImplementation((t: string) => t),
      };

      const result = await renderStory(
        { grammarKey: 'a', seed: 'test' },
        storage,
        stubRandomPort(),
        templateEngine
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.text).toBe('green');
      }
    });

    it('accepts include chain at exactly MAX_INCLUDE_DEPTH=20', async () => {
      // Create a chain of 21 grammars: g0→g1→g2→...→g20
      // g0 is root (depth 0), g20 is at depth 20 — exactly at the limit
      const dtos: Record<string, GrammarDto> = {};
      for (let i = 0; i <= 20; i++) {
        const key = `g${String(i)}`;
        const includes = i < 20 ? [`g${String(i + 1)}`] : [];
        dtos[key] = makeDtoWithRules(key, { Begin: textRule(`from ${key}`) }, includes);
      }
      const storage = stubStorage(dtos);

      const result = await renderStory(
        { grammarKey: 'g0', seed: 'test' },
        storage,
        stubRandomPort(),
        stubTemplateEngine()
      );

      expect(result.success).toBe(true);
    });

    it('rejects include chain at MAX_INCLUDE_DEPTH + 1 = 21', async () => {
      // Create a chain of 22 grammars: g0→g1→g2→...→g21
      const dtos: Record<string, GrammarDto> = {};
      for (let i = 0; i <= 21; i++) {
        const key = `g${String(i)}`;
        const includes = i < 21 ? [`g${String(i + 1)}`] : [];
        dtos[key] = makeDtoWithRules(key, { Begin: textRule(`from ${key}`) }, includes);
      }
      const storage = stubStorage(dtos);

      const result = await renderStory(
        { grammarKey: 'g0', seed: 'test' },
        storage,
        stubRandomPort(),
        stubTemplateEngine()
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.kind).toBe('include_depth');
      }
    });

    it('accepts exactly MAX_INCLUDE_COUNT=50 total grammars', async () => {
      // Root + 49 includes = 50 total in the seen set (at the limit)
      const dtos: Record<string, GrammarDto> = {};
      const includes: string[] = [];
      for (let i = 0; i < 49; i++) {
        const key = `child${String(i)}`;
        includes.push(key);
        dtos[key] = makeDtoWithRules(key, { Begin: textRule(`from ${key}`) });
      }
      dtos['root'] = makeDtoWithRules('root', { Begin: textRule('from root') }, includes);
      const storage = stubStorage(dtos);

      const result = await renderStory(
        { grammarKey: 'root', seed: 'test' },
        storage,
        stubRandomPort(),
        stubTemplateEngine()
      );

      expect(result.success).toBe(true);
    });

    it('rejects when total grammar count exceeds MAX_INCLUDE_COUNT=50', async () => {
      // Create a wide grammar that includes 51 children
      const dtos: Record<string, GrammarDto> = {};
      const includes: string[] = [];
      for (let i = 0; i < 51; i++) {
        const key = `child${String(i)}`;
        includes.push(key);
        dtos[key] = makeDtoWithRules(key, { Begin: textRule(`from ${key}`) });
      }
      dtos['root'] = makeDtoWithRules('root', { Begin: textRule('from root') }, includes);
      const storage = stubStorage(dtos);

      const result = await renderStory(
        { grammarKey: 'root', seed: 'test' },
        storage,
        stubRandomPort(),
        stubTemplateEngine()
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.kind).toBe('include_limit');
      }
    });

    it('per-include error: missing included grammar returns module_not_found', async () => {
      const dtos: Record<string, GrammarDto> = {
        a: makeDtoWithRules('a', { Begin: textRule('from a') }, ['missing-grammar']),
      };
      const storage = stubStorage(dtos);

      const result = await renderStory(
        { grammarKey: 'a', seed: 'test' },
        storage,
        stubRandomPort(),
        stubTemplateEngine()
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.kind).toBe('module_not_found');
        if (result.kind === 'module_not_found') {
          expect(result.moduleName).toBe('missing-grammar');
        }
      }
    });

    it('per-include error: invalid included grammar DTO returns parse_error', async () => {
      const dtos: Record<string, GrammarDto> = {
        a: makeDtoWithRules('a', { Begin: textRule('from a') }, ['bad']),
        bad: { version: 999, key: 'bad', entry: 'Begin', includes: [], rules: {} },
      };
      const storage = stubStorage(dtos);

      const result = await renderStory(
        { grammarKey: 'a', seed: 'test' },
        storage,
        stubRandomPort(),
        stubTemplateEngine()
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.kind).toBe('parse_error');
      }
    });

    it('post-include StructRule validation: field references missing rule', async () => {
      // a has a StructRule whose field references "MissingRule"
      // b is included but does not provide "MissingRule"
      const dtos: Record<string, GrammarDto> = {
        a: makeDtoWithRules(
          'a',
          {
            Begin: {
              type: 'struct',
              fields: { name: 'MissingRule' },
              template: '{{ name }}',
            },
          },
          ['b']
        ),
        b: makeDtoWithRules('b', { Begin: textRule('from b'), Other: textRule('other') }),
      };
      const storage = stubStorage(dtos);

      const result = await renderStory(
        { grammarKey: 'a', seed: 'test' },
        storage,
        stubRandomPort(),
        stubTemplateEngine()
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.kind).toBe('parse_error');
      }
    });

    it('post-include StructRule validation passes when include provides required rule', async () => {
      // a has a StructRule whose field references "NameRule"
      // b provides "NameRule"
      const dtos: Record<string, GrammarDto> = {
        a: makeDtoWithRules(
          'a',
          {
            Begin: {
              type: 'struct',
              fields: { name: 'NameRule' },
              template: '{{ name }}',
            },
          },
          ['b']
        ),
        b: makeDtoWithRules('b', { Begin: textRule('from b'), NameRule: textRule('Alice') }),
      };
      const storage = stubStorage(dtos);

      // Template engine that substitutes context values into {{ field }} placeholders
      const templateEngine: TemplateEnginePort = {
        evaluate: vi.fn().mockImplementation((template: string, ctx: Record<string, string>) => {
          let result = template;
          for (const [key, value] of Object.entries(ctx)) {
            result = result.replace(new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g'), value);
          }
          return result;
        }),
      };

      const result = await renderStory(
        { grammarKey: 'a', seed: 'test' },
        storage,
        stubRandomPort(),
        templateEngine
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.text).toBe('Alice');
      }
    });

    it('transitive includes resolve correctly: a→b→c provides rules to a', async () => {
      const dtos: Record<string, GrammarDto> = {
        a: makeDtoWithRules(
          'a',
          {
            Begin: {
              type: 'text',
              alternatives: [{ text: '{{ Deep }}', weight: 1 }],
              strategy: 'TEMPLATE',
            },
          },
          ['b']
        ),
        b: makeDtoWithRules('b', { Begin: textRule('from b') }, ['c']),
        c: makeDtoWithRules('c', { Begin: textRule('from c'), Deep: textRule('deep-value') }),
      };
      const storage = stubStorage(dtos);

      const templateEngine: TemplateEnginePort = {
        evaluate: vi.fn().mockImplementation((t: string) => t),
      };

      const result = await renderStory(
        { grammarKey: 'a', seed: 'test' },
        storage,
        stubRandomPort(),
        templateEngine
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.text).toBe('deep-value');
      }
    });

    it('grammar with no includes resolves unchanged', async () => {
      const dto = makeDto('simple');
      const storage = stubStorage({ simple: dto });

      const result = await renderStory(
        { grammarKey: 'simple', seed: 'test' },
        storage,
        stubRandomPort(),
        stubTemplateEngine()
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.text).toBe('Hello from simple');
      }
    });
  });

  describe('seed isolation and rule independence', () => {
    it('two renderStory calls with same seed produce identical output', async () => {
      const dto = makeDto('grammar-a');
      const storage = stubStorage({ 'grammar-a': dto });
      const request: RenderStoryRequest = { grammarKey: 'grammar-a', seed: 'deterministic' };

      const result1 = await renderStory(request, storage, stubRandomPort(), stubTemplateEngine());
      const result2 = await renderStory(request, storage, stubRandomPort(), stubTemplateEngine());

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result1).toEqual(result2);
    });

    it('different seeds produce potentially different scoped seed ints', async () => {
      const dto = makeDto('grammar-b');
      const storage = stubStorage({ 'grammar-b': dto });

      const seedToIntCalls: string[] = [];
      const trackingRandomPort: RandomPort = {
        seedToInt: vi.fn().mockImplementation((s: string) => {
          seedToIntCalls.push(s);
          return Promise.resolve(42);
        }),
        createRng: vi.fn().mockReturnValue({
          next: vi.fn().mockReturnValue(0.5),
        }),
      };

      const req1: RenderStoryRequest = { grammarKey: 'grammar-b', seed: 'alpha' };
      const req2: RenderStoryRequest = { grammarKey: 'grammar-b', seed: 'beta' };

      await renderStory(req1, storage, trackingRandomPort, stubTemplateEngine());
      const alphaSeeds = [...seedToIntCalls];
      seedToIntCalls.length = 0;

      await renderStory(req2, storage, trackingRandomPort, stubTemplateEngine());
      const betaSeeds = [...seedToIntCalls];

      // Scoped seeds should differ because base seed differs
      expect(alphaSeeds.length).toBeGreaterThan(0);
      expect(betaSeeds.length).toBeGreaterThan(0);
      expect(alphaSeeds[0]).not.toBe(betaSeeds[0]);
    });

    it('adding an unrelated rule to grammar does not change rendered output', async () => {
      const smallDto: GrammarDto = {
        version: 1,
        key: 'small',
        entry: 'Begin',
        includes: [],
        rules: {
          Begin: {
            type: 'text',
            alternatives: [{ text: 'fixed output', weight: 1 }],
            strategy: 'PLAIN',
          },
        },
      };

      const extendedDto: GrammarDto = {
        version: 1,
        key: 'extended',
        entry: 'Begin',
        includes: [],
        rules: {
          Begin: {
            type: 'text',
            alternatives: [{ text: 'fixed output', weight: 1 }],
            strategy: 'PLAIN',
          },
          Extra: {
            type: 'text',
            alternatives: [{ text: 'never reached', weight: 1 }],
            strategy: 'PLAIN',
          },
        },
      };

      const storage = stubStorage({ small: smallDto, extended: extendedDto });

      const result1 = await renderStory(
        { grammarKey: 'small', seed: 'iso' },
        storage,
        stubRandomPort(),
        stubTemplateEngine()
      );
      const result2 = await renderStory(
        { grammarKey: 'extended', seed: 'iso' },
        storage,
        stubRandomPort(),
        stubTemplateEngine()
      );

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      if (result1.success && result2.success) {
        expect(result1.text).toBe(result2.text);
      }
    });
  });
});
