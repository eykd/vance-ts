/**
 * Unit tests for selection mode algorithms.
 *
 * Tests REUSE, PICK, RATCHET, and LIST selection modes with
 * deterministic RNG stubs and state management.
 *
 * @module domain/prestoplot/selectionModes.spec
 */

import { describe, expect, it } from 'vitest';

import {
  createSelectionState,
  selectList,
  selectPick,
  selectRatchet,
  selectReuse,
} from './selectionModes.js';
import type { SelectionState } from './selectionModes.js';

/**
 * Creates a deterministic Rng stub that returns values from a sequence.
 *
 * @param values - The sequence of float values in [0, 1) to return.
 * @returns An Rng that returns values in order, cycling if exhausted.
 */
function stubRng(values: number[]): { next(): number } {
  let i = 0;
  return {
    next(): number {
      const v = values[i % values.length]!;
      i++;
      return v;
    },
  };
}

describe('selectionModes', () => {
  const items = ['alpha', 'beta', 'gamma'] as const;

  describe('selectReuse', () => {
    it('selects item at index derived from rng', () => {
      // 0.0 * 3 = 0 → items[0]
      const rng = stubRng([0.0]);
      expect(selectReuse([...items], rng)).toBe('alpha');
    });

    it('selects different items for different rng values', () => {
      // 0.5 * 3 = 1.5 → floor = 1 → items[1]
      const rng = stubRng([0.5]);
      expect(selectReuse([...items], rng)).toBe('beta');
    });

    it('falls back to last item when float precision yields length', () => {
      // 0.999999... * 3 could theoretically reach 3 → clamped to 2
      const rng = stubRng([0.9999999999999999]);
      expect(selectReuse([...items], rng)).toBe('gamma');
    });

    it('works with single-item list', () => {
      const rng = stubRng([0.5]);
      expect(selectReuse(['only'], rng)).toBe('only');
    });

    it('allows repeats across multiple calls', () => {
      const rng = stubRng([0.0, 0.0, 0.0]);
      expect(selectReuse([...items], rng)).toBe('alpha');
      expect(selectReuse([...items], rng)).toBe('alpha');
      expect(selectReuse([...items], rng)).toBe('alpha');
    });
  });

  describe('selectPick', () => {
    it('returns each item exactly once per epoch', () => {
      const state = createSelectionState();
      const key = 'seed-rule';
      // With 3 items, we need an RNG for Fisher-Yates shuffle
      // Fisher-Yates: i=2: rand [0,2], i=1: rand [0,1]
      // 0.0 * 3 = 0 → swap(2, 0): [gamma, beta, alpha]
      // 0.0 * 2 = 0 → swap(1, 0): [beta, gamma, alpha]
      // Order: beta, gamma, alpha
      const rng = stubRng([0.0, 0.0]);
      const results: string[] = [];
      results.push(selectPick([...items], rng, key, state));
      results.push(selectPick([...items], rng, key, state));
      results.push(selectPick([...items], rng, key, state));

      // All three items appear exactly once
      expect(results.sort()).toEqual(['alpha', 'beta', 'gamma']);
    });

    it('starts a new epoch when all items exhausted', () => {
      const state = createSelectionState();
      const key = 'seed-rule';
      // Use values that produce known shuffles
      const rng = stubRng([0.0, 0.0]);
      // Exhaust first epoch (3 items)
      selectPick([...items], rng, key, state);
      selectPick([...items], rng, key, state);
      selectPick([...items], rng, key, state);

      // 4th call triggers new epoch with reshuffle
      const fourth = selectPick([...items], rng, key, state);
      expect(items).toContain(fourth);
    });

    it('uses separate state per key', () => {
      const state = createSelectionState();
      const rng = stubRng([0.0, 0.0, 0.5, 0.5]);
      const r1 = selectPick([...items], rng, 'key-a', state);
      const r2 = selectPick([...items], rng, 'key-b', state);
      // Both should get items from independent shuffles
      expect(items).toContain(r1);
      expect(items).toContain(r2);
    });

    it('works with single-item list', () => {
      const state = createSelectionState();
      const rng = stubRng([0.0]);
      expect(selectPick(['only'], rng, 'key', state)).toBe('only');
      // Second call starts new epoch
      expect(selectPick(['only'], rng, 'key', state)).toBe('only');
    });

    it('falls back to last item for float precision in shuffle', () => {
      const state = createSelectionState();
      // 0.9999... for both shuffle steps
      const rng = stubRng([0.9999999999999999, 0.9999999999999999]);
      const result = selectPick([...items], rng, 'key', state);
      expect(items).toContain(result);
    });
  });

  describe('selectRatchet', () => {
    it('cycles through items sequentially', () => {
      const state = createSelectionState();
      const key = 'rule';
      expect(selectRatchet([...items], key, state)).toBe('alpha');
      expect(selectRatchet([...items], key, state)).toBe('beta');
      expect(selectRatchet([...items], key, state)).toBe('gamma');
    });

    it('wraps around after exhausting items', () => {
      const state = createSelectionState();
      const key = 'rule';
      selectRatchet([...items], key, state);
      selectRatchet([...items], key, state);
      selectRatchet([...items], key, state);
      expect(selectRatchet([...items], key, state)).toBe('alpha');
    });

    it('uses separate counters per key', () => {
      const state = createSelectionState();
      expect(selectRatchet([...items], 'a', state)).toBe('alpha');
      expect(selectRatchet([...items], 'b', state)).toBe('alpha');
      expect(selectRatchet([...items], 'a', state)).toBe('beta');
      expect(selectRatchet([...items], 'b', state)).toBe('beta');
    });

    it('works with single-item list', () => {
      const state = createSelectionState();
      expect(selectRatchet(['only'], 'key', state)).toBe('only');
      expect(selectRatchet(['only'], 'key', state)).toBe('only');
    });
  });

  describe('selectList', () => {
    it('returns item at given index', () => {
      expect(selectList([...items], 0)).toBe('alpha');
      expect(selectList([...items], 1)).toBe('beta');
      expect(selectList([...items], 2)).toBe('gamma');
    });

    it('falls back to last item for out-of-bounds index', () => {
      expect(selectList([...items], 5)).toBe('gamma');
      expect(selectList([...items], 100)).toBe('gamma');
    });

    it('clamps negative index to first item', () => {
      expect(selectList([...items], -1)).toBe('alpha');
    });

    it('works with single-item list', () => {
      expect(selectList(['only'], 0)).toBe('only');
      expect(selectList(['only'], 5)).toBe('only');
    });
  });

  describe('createSelectionState', () => {
    it('creates empty state', () => {
      const state: SelectionState = createSelectionState();
      expect(state.pickStates.size).toBe(0);
      expect(state.ratchetCounts.size).toBe(0);
    });
  });
});
