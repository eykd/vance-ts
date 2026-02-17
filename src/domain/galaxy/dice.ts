/**
 * Dice rolling utilities for galaxy generation.
 *
 * Provides deterministic dice rolls using the Prng interface for
 * Fate dice (4dF) and standard polyhedral dice (NdS).
 *
 * @module domain/galaxy/dice
 */

import type { Prng } from './prng';

/**
 * Rolls 4 Fate dice (4dF), producing a value from -4 to +4.
 *
 * Each Fate die has three faces: -1, 0, +1. The result is the sum
 * of four such dice.
 *
 * @param rng - Pseudorandom number generator
 * @returns Integer in [-4, +4]
 */
export function roll4dF(rng: Prng): number {
  let total = 0;
  for (let i = 0; i < 4; i++) {
    total += rng.randint(-1, 1);
  }
  return total;
}

/**
 * Rolls N dice with S sides (NdS), producing a value from N to N*S.
 *
 * Each die produces a value in [1, sides]. The result is the sum
 * of all dice.
 *
 * @param rng - Pseudorandom number generator
 * @param count - Number of dice to roll
 * @param sides - Number of sides per die
 * @returns Integer in [count, count * sides]
 */
export function rollNdS(rng: Prng, count: number, sides: number): number {
  let total = 0;
  for (let i = 0; i < count; i++) {
    total += rng.randint(1, sides);
  }
  return total;
}
