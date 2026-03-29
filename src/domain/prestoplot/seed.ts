/**
 * Seed and ScopedSeed value objects for deterministic random generation.
 *
 * A Seed is a branded string type that guarantees non-empty input.
 * A ScopedSeed derives an independent PRNG stream by combining a
 * base seed with a scope key.
 *
 * @module domain/prestoplot/seed
 */

import type { Result } from '../shared/Result.js';

import { InvalidSeedError } from './errors.js';

/** Branded type for validated, non-empty seed strings. */
export type Seed = string & { readonly __brand: 'Seed' };

/**
 * Creates a validated Seed from a raw string.
 *
 * @param value - The raw seed string.
 * @returns Ok with a branded Seed, or Err with InvalidSeedError if empty/blank.
 */
export function createSeed(value: string): Result<Seed, InvalidSeedError> {
  if (value.trim().length === 0) {
    return {
      success: false,
      error: new InvalidSeedError('Seed cannot be empty'),
    };
  }
  return { success: true, value: value as Seed };
}

/**
 * Immutable scoped seed combining a base seed with a scope key.
 */
export interface ScopedSeed {
  /** The original seed value. */
  readonly baseSeed: string;

  /** The scope identifier (e.g. rule name). */
  readonly scopeKey: string;

  /** The combined value: "{baseSeed}-{scopeKey}". */
  readonly combined: string;

  /** Returns the combined value. */
  toString(): string;
}

/**
 * Creates a new immutable ScopedSeed from a base seed and scope key.
 *
 * @param baseSeed - The base Seed value.
 * @param scopeKey - The scope identifier.
 * @returns An immutable ScopedSeed value object.
 */
export function createScopedSeed(baseSeed: Seed, scopeKey: string): ScopedSeed {
  const combined = `${baseSeed}-${scopeKey}`;
  return Object.freeze({
    baseSeed,
    scopeKey,
    combined,
    toString(): string {
      return combined;
    },
  });
}
