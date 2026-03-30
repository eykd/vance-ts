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
  });

  describe('successful render', () => {
    it('returns ok result with rendered text', async () => {
      const dto = makeDto('test-grammar');
      const storage = stubStorage({ 'test-grammar': dto });
      const request: RenderStoryRequest = { grammarKey: 'test-grammar', seed: 'alpha' };

      const result = await renderStory(request, storage, stubRandomPort(), stubTemplateEngine());

      expect(result.ok).toBe(true);
      if (result.ok) {
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
    it('maps invalid (empty) seed to invalid_seed result', async () => {
      const storage = stubStorage({});
      const request: RenderStoryRequest = { grammarKey: 'any', seed: '' };

      const result = await renderStory(request, storage, stubRandomPort(), stubTemplateEngine());

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.kind).toBe('invalid_seed');
      }
    });

    it('maps whitespace-only seed to invalid_seed result', async () => {
      const storage = stubStorage({});
      const request: RenderStoryRequest = { grammarKey: 'any', seed: '   ' };

      const result = await renderStory(request, storage, stubRandomPort(), stubTemplateEngine());

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.kind).toBe('invalid_seed');
      }
    });

    it('maps seed exceeding MAX_SEED_LENGTH to invalid_seed result', async () => {
      const storage = stubStorage({});
      const longSeed = 'a'.repeat(MAX_SEED_LENGTH + 1);
      const request: RenderStoryRequest = { grammarKey: 'any', seed: longSeed };

      const result = await renderStory(request, storage, stubRandomPort(), stubTemplateEngine());

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.kind).toBe('invalid_seed');
      }
    });

    it('accepts seed at exactly MAX_SEED_LENGTH', async () => {
      const dto = makeDto('test');
      const storage = stubStorage({ test: dto });
      const exactSeed = 'a'.repeat(MAX_SEED_LENGTH);
      const request: RenderStoryRequest = { grammarKey: 'test', seed: exactSeed };

      const result = await renderStory(request, storage, stubRandomPort(), stubTemplateEngine());

      expect(result.ok).toBe(true);
    });

    it('maps missing grammar to module_not_found result', async () => {
      const storage = stubStorage({});
      const request: RenderStoryRequest = { grammarKey: 'nonexistent', seed: 'alpha' };

      const result = await renderStory(request, storage, stubRandomPort(), stubTemplateEngine());

      expect(result.ok).toBe(false);
      if (!result.ok) {
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

      expect(result.ok).toBe(false);
      if (!result.ok) {
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

      expect(result.ok).toBe(false);
      if (!result.ok) {
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

      expect(result.ok).toBe(false);
      if (!result.ok) {
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

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.kind).toBe('template_error');
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

      expect(result.ok).toBe(false);
      if (!result.ok) {
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
      expect(result.ok).toBe(false);
    });
  });

  describe('RenderStoryResult type discrimination', () => {
    it('success result has ok: true and text', async () => {
      const dto = makeDto('test');
      const storage = stubStorage({ test: dto });
      const request: RenderStoryRequest = { grammarKey: 'test', seed: 'good-seed' };

      const result = await renderStory(request, storage, stubRandomPort(), stubTemplateEngine());

      expect(result).toEqual({ ok: true, text: 'Hello from test' });
    });

    it('error results have ok: false and kind', async () => {
      const storage = stubStorage({});
      const request: RenderStoryRequest = { grammarKey: 'missing', seed: 'alpha' };

      const result = await renderStory(request, storage, stubRandomPort(), stubTemplateEngine());

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(typeof result.kind).toBe('string');
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

      expect(result1.ok).toBe(true);
      expect(result2.ok).toBe(true);
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

      expect(result1.ok).toBe(true);
      expect(result2.ok).toBe(true);
      if (result1.ok && result2.ok) {
        expect(result1.text).toBe(result2.text);
      }
    });
  });
});
