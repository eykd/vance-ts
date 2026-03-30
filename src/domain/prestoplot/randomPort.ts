/**
 * Random source port interface.
 *
 * Defines the contract for creating seeded random number generators.
 * Separates async seed hashing (SHA-256) from synchronous PRNG
 * construction to keep the rendering hot path synchronous.
 *
 * @module domain/prestoplot/randomPort
 */

import type { Rng } from './selectionModes.js';

/**
 * Port for creating seeded random number generators.
 *
 * Implementations provide deterministic randomness by hashing seed
 * strings to integers and constructing stateful PRNGs from those integers.
 */
export interface RandomPort {
  /**
   * Convert a seed string to a 32-bit unsigned integer.
   *
   * Uses SHA-256 hashing, taking the first 4 bytes as big-endian uint32.
   * Async because crypto.subtle.digest is async in Workers.
   *
   * @param seed - The seed string to hash.
   * @returns A 32-bit unsigned integer derived from the seed.
   */
  seedToInt(seed: string): Promise<number>;

  /**
   * Create a new Rng instance from a numeric seed.
   *
   * The returned Rng is deterministic — same seed always produces
   * the same sequence of values.
   *
   * @param seed - A 32-bit unsigned integer seed.
   * @returns A stateful Rng that advances on each next() call.
   */
  createRng(seed: number): Rng;
}
