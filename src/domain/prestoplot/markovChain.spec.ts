/**
 * Unit tests for the character-level Markov chain module.
 *
 * @module domain/prestoplot/markovChain.spec
 */

import { describe, expect, it } from 'vitest';

import {
  generateMarkov,
  MARKOV_END,
  MARKOV_START,
  markovDeadEnd,
  MAX_MARKOV_CORPUS_PRODUCT,
  rngChoice,
  trainMarkovChain,
} from './markovChain.js';
import type { Rng } from './selectionModes.js';

/**
 * Creates a deterministic RNG from a sequence of values.
 *
 * @param values - Sequence of [0,1) values to cycle through.
 * @returns A Rng that returns values in order, cycling.
 */
function fakeRng(values: number[]): Rng {
  let i = 0;
  return {
    next(): number {
      const v = values[i % values.length]!;
      i++;
      return v;
    },
  };
}

describe('markovChain', () => {
  describe('MARKOV_START / MARKOV_END', () => {
    it('exports STX sentinel as \\x02', () => {
      expect(MARKOV_START).toBe('\x02');
    });

    it('exports ETX sentinel as \\x03', () => {
      expect(MARKOV_END).toBe('\x03');
    });
  });

  describe('MAX_MARKOV_CORPUS_PRODUCT', () => {
    it('equals 100_000', () => {
      expect(MAX_MARKOV_CORPUS_PRODUCT).toBe(100_000);
    });
  });

  describe('rngChoice', () => {
    it('selects the only item from a single-element array', () => {
      const rng = fakeRng([0.5]);
      expect(rngChoice(['a'], rng)).toBe('a');
    });

    it('selects item at floor(rng * length)', () => {
      const rng = fakeRng([0.0]);
      expect(rngChoice(['a', 'b', 'c'], rng)).toBe('a');
    });

    it('selects last item when rng approaches 1', () => {
      const rng = fakeRng([0.999]);
      expect(rngChoice(['a', 'b', 'c'], rng)).toBe('c');
    });

    it('clamps to last item if rng is exactly at boundary', () => {
      const rng = fakeRng([0.9999999999999999]);
      const result = rngChoice(['a', 'b', 'c'], rng);
      expect(result).toBe('c');
    });
  });

  describe('markovDeadEnd', () => {
    it('has code markov_dead_end', () => {
      const e = markovDeadEnd('ab');
      expect(e.code).toBe('markov_dead_end');
    });

    it('stores the dead key', () => {
      const e = markovDeadEnd('xy');
      expect(e.deadKey).toBe('xy');
    });

    it('includes the key in the message', () => {
      const e = markovDeadEnd('ab');
      expect(e.message).toBe('Markov dead end at key: "ab"');
    });
  });

  describe('trainMarkovChain', () => {
    it('returns failure for empty corpus', () => {
      const result = trainMarkovChain([]);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(RangeError);
      }
    });

    it('returns failure for order < 1', () => {
      const result = trainMarkovChain(['foo'], 0);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(RangeError);
      }
    });

    it('returns failure for negative order', () => {
      const result = trainMarkovChain(['foo'], -1);
      expect(result.success).toBe(false);
    });

    it('defaults to order 2', () => {
      const result = trainMarkovChain(['cat']);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.order).toBe(2);
      }
    });

    it('builds transitions for "cat" with order 2', () => {
      const result = trainMarkovChain(['cat']);
      expect(result.success).toBe(true);
      if (result.success) {
        const t = result.value.transitions;
        expect(t.get('\x02\x02')).toEqual(['c']);
        expect(t.get('\x02c')).toEqual(['a']);
        expect(t.get('ca')).toEqual(['t']);
        expect(t.get('at')).toEqual(['\x03']);
      }
    });

    it('builds transitions with order 1', () => {
      const result = trainMarkovChain(['ab'], 1);
      expect(result.success).toBe(true);
      if (result.success) {
        const t = result.value.transitions;
        expect(t.get('\x02')).toEqual(['a']);
        expect(t.get('a')).toEqual(['b']);
        expect(t.get('b')).toEqual(['\x03']);
      }
    });

    it('merges successors from multiple corpus strings', () => {
      const result = trainMarkovChain(['cat', 'car'], 2);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.transitions.get('ca')).toEqual(['t', 'r']);
      }
    });

    it('accumulates duplicate successors for frequency weighting', () => {
      const result = trainMarkovChain(['aa', 'aa'], 1);
      expect(result.success).toBe(true);
      if (result.success) {
        const t = result.value.transitions;
        expect(t.get('\x02')).toEqual(['a', 'a']);
        expect(t.get('a')).toEqual(['a', '\x03', 'a', '\x03']);
      }
    });

    it('returns a Map for transitions', () => {
      const result = trainMarkovChain(['x']);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.transitions).toBeInstanceOf(Map);
      }
    });
  });

  describe('generateMarkov', () => {
    it('generates "cat" deterministically from trained model', () => {
      const trained = trainMarkovChain(['cat']);
      expect(trained.success).toBe(true);
      if (!trained.success) return;
      const rng = fakeRng([0.0]);
      const result = generateMarkov(trained.value, rng);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe('cat');
      }
    });

    it('generates from order-1 model', () => {
      const trained = trainMarkovChain(['ab'], 1);
      expect(trained.success).toBe(true);
      if (!trained.success) return;
      const rng = fakeRng([0.0]);
      const result = generateMarkov(trained.value, rng);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe('ab');
      }
    });

    it('returns failure when maxLength < 1', () => {
      const trained = trainMarkovChain(['cat']);
      expect(trained.success).toBe(true);
      if (!trained.success) return;
      const rng = fakeRng([0.0]);
      const result = generateMarkov(trained.value, rng, 0);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(RangeError);
      }
    });

    it('returns failure when maxLength is negative', () => {
      const trained = trainMarkovChain(['cat']);
      expect(trained.success).toBe(true);
      if (!trained.success) return;
      const rng = fakeRng([0.0]);
      const result = generateMarkov(trained.value, rng, -1);
      expect(result.success).toBe(false);
    });

    it('truncates output at maxLength', () => {
      const trained = trainMarkovChain(['cat']);
      expect(trained.success).toBe(true);
      if (!trained.success) return;
      const rng = fakeRng([0.0]);
      const result = generateMarkov(trained.value, rng, 2);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe('ca');
      }
    });

    it('defaults maxLength to 100', () => {
      const trained = trainMarkovChain(['a'.repeat(200)], 1);
      expect(trained.success).toBe(true);
      if (!trained.success) return;
      const rng = fakeRng([0.0]);
      const result = generateMarkov(trained.value, rng);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.length).toBe(100);
      }
    });

    it('returns MarkovDeadEndError on dead-end state', () => {
      const transitions = new Map<string, string[]>();
      transitions.set('\x02\x02', ['x']);
      transitions.set('\x02x', ['y']);
      // "xy" has no entry → dead end
      const model = { order: 2, transitions };
      const rng = fakeRng([0.0]);
      const result = generateMarkov(model, rng);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toHaveProperty('code', 'markov_dead_end');
      }
    });

    it('MarkovDeadEndError has the correct dead key', () => {
      const transitions = new Map<string, string[]>();
      transitions.set('\x02', ['z']);
      // "z" has no entry → dead end
      const model = { order: 1, transitions };
      const rng = fakeRng([0.0]);
      const result = generateMarkov(model, rng);
      expect(result.success).toBe(false);
      if (!result.success && 'deadKey' in result.error) {
        expect(result.error.deadKey).toBe('z');
      }
    });

    it('continues from a start string', () => {
      const trained = trainMarkovChain(['cat', 'car'], 2);
      expect(trained.success).toBe(true);
      if (!trained.success) return;
      const rng = fakeRng([0.0]);
      const result = generateMarkov(trained.value, rng, 100, 'ca');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe('cat');
      }
    });

    it('pads short start string with MARKOV_START', () => {
      const trained = trainMarkovChain(['cat'], 2);
      expect(trained.success).toBe(true);
      if (!trained.success) return;
      const rng = fakeRng([0.0]);
      const result = generateMarkov(trained.value, rng, 100, 'c');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe('cat');
      }
    });

    it('uses last N chars of long start string', () => {
      const trained = trainMarkovChain(['cat'], 2);
      expect(trained.success).toBe(true);
      if (!trained.success) return;
      const rng = fakeRng([0.0]);
      const result = generateMarkov(trained.value, rng, 100, 'xxc');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toHaveProperty('code', 'markov_dead_end');
      }
    });

    it('uses rng to select among multiple successors', () => {
      const trained = trainMarkovChain(['cat', 'car'], 2);
      expect(trained.success).toBe(true);
      if (!trained.success) return;
      // first two: "\x02\x02"→c, "\x02c"→a, then "ca"→pick index 1 = "r"
      const rng = fakeRng([0.0, 0.0, 0.5]);
      const result = generateMarkov(trained.value, rng);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe('car');
      }
    });

    it('stops when ETX is selected', () => {
      const trained = trainMarkovChain(['a'], 1);
      expect(trained.success).toBe(true);
      if (!trained.success) return;
      const rng = fakeRng([0.0]);
      const result = generateMarkov(trained.value, rng);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe('a');
      }
    });
  });
});
