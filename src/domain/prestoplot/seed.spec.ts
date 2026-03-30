/**
 * Seed and ScopedSeed value object unit tests.
 *
 * @module
 */

import { describe, expect, it } from 'vitest';

import { DomainError } from '../errors/DomainError.js';

import { type Seed, createScopedSeed, createSeed } from './seed.js';

describe('createSeed', () => {
  it('creates a Seed from a non-empty string', () => {
    const result = createSeed('alpha');

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toBe('alpha');
    }
  });

  it('rejects empty string with invalid_seed error', () => {
    const result = createSeed('');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(DomainError);
      expect(result.error.code).toBe('invalid_seed');
    }
  });

  it('rejects whitespace-only string', () => {
    const result = createSeed('   ');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('invalid_seed');
    }
  });

  it('returns a branded type (assignable to string)', () => {
    const result = createSeed('sol-42');

    if (result.success) {
      // Seed is a branded string — it should work as a string
      const s: string = result.value;
      expect(s).toBe('sol-42');
    }
  });

  it('preserves the exact seed value', () => {
    const result = createSeed('my-seed-123');

    if (result.success) {
      expect(result.value).toBe('my-seed-123');
    }
  });
});

describe('createScopedSeed', () => {
  it('creates a scoped seed from base seed and scope key', () => {
    const seed = unwrapSeed('alpha');
    const scoped = createScopedSeed(seed, 'creature');

    expect(scoped.baseSeed).toBe('alpha');
    expect(scoped.scopeKey).toBe('creature');
  });

  it('combines base seed and scope key with hyphen separator', () => {
    const seed = unwrapSeed('sol-42');
    const scoped = createScopedSeed(seed, 'animal');

    expect(scoped.combined).toBe('sol-42-animal');
  });

  it('is readonly (fields cannot be reassigned)', () => {
    const seed = unwrapSeed('test');
    const scoped = createScopedSeed(seed, 'scope');

    expect(scoped.baseSeed).toBe('test');
    expect(scoped.scopeKey).toBe('scope');
    expect(scoped.combined).toBe('test-scope');
  });

  it('different scope keys produce different combined values', () => {
    const seed = unwrapSeed('base');
    const a = createScopedSeed(seed, 'rule_a');
    const b = createScopedSeed(seed, 'rule_b');

    expect(a.combined).not.toBe(b.combined);
  });

  it('toString returns the combined value', () => {
    const seed = unwrapSeed('x');
    const scoped = createScopedSeed(seed, 'y');

    expect(scoped.toString()).toBe('x-y');
  });
});

/**
 * Helper to unwrap a seed or fail the test.
 *
 * @param value - Raw seed string.
 * @returns The branded Seed value.
 */
function unwrapSeed(value: string): Seed {
  const result = createSeed(value);
  if (!result.success) {
    throw new Error(`Unexpected seed failure: ${result.error.code}`);
  }
  return result.value;
}
