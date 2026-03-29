/**
 * Mulberry32-based RandomPort adapter.
 *
 * Implements the {@link RandomPort} interface by combining SHA-256
 * seed hashing (via {@link seedToInt}) with the existing Mulberry32
 * PRNG from the galaxy domain. This keeps the rendering hot path
 * synchronous while the one-time seed hashing remains async.
 *
 * @module infrastructure/prestoplot/mulberry32Random
 */

import type { RandomPort, Rng } from '../../application/prestoplot/RandomSource.js';
import { Mulberry32 } from '../../domain/galaxy/prng.js';

import { seedToInt } from './seedHasher.js';

/**
 * Creates a {@link RandomPort} backed by Mulberry32 and SHA-256 seed hashing.
 *
 * @returns A RandomPort that hashes seeds via SHA-256 and creates Mulberry32 RNGs.
 */
export function createMulberry32Random(): RandomPort {
  return {
    seedToInt(seed: string): Promise<number> {
      return seedToInt(seed);
    },
    createRng(seed: number): Rng {
      const prng = new Mulberry32(seed);
      return {
        next(): number {
          return prng.random();
        },
      };
    },
  };
}
