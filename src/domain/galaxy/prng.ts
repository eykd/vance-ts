/**
 * Seedable pseudorandom number generator.
 *
 * Provides deterministic, portable random number generation using the
 * Mulberry32 algorithm. The PRNG is seedable from a 32-bit numeric seed
 * and produces identical sequences across Node.js and Cloudflare Workers.
 *
 * @module domain/galaxy/prng
 */

/** Seedable pseudorandom number generator interface. */
export interface Prng {
  /** Returns a uniform random integer in [min, max] inclusive. */
  randint(min: number, max: number): number;

  /** Returns a uniform random float in [0, 1). */
  random(): number;
}

/**
 * Mulberry32 pseudorandom number generator.
 *
 * Ultra-compact (~20 lines), zero-dependency, deterministic PRNG suitable
 * for galaxy generation. Uses 32-bit internal state.
 */
export class Mulberry32 implements Prng {
  /** Internal 32-bit state. */
  private state: number;

  /**
   * Creates a new Mulberry32 PRNG from a numeric seed.
   *
   * @param seed - 32-bit numeric seed value
   */
  constructor(seed: number) {
    this.state = seed | 0;
  }

  /**
   * Returns a uniform random float in [0, 1).
   *
   * @returns Pseudorandom float in the half-open interval [0, 1)
   */
  random(): number {
    this.state = (this.state + 0x6d2b79f5) | 0;
    let t = Math.imul(this.state ^ (this.state >>> 15), 1 | this.state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 0x100000000;
  }

  /**
   * Returns a uniform random integer in [min, max] inclusive.
   *
   * @param min - Lower bound (inclusive)
   * @param max - Upper bound (inclusive)
   * @returns Pseudorandom integer in [min, max]
   */
  randint(min: number, max: number): number {
    return min + Math.floor(this.random() * (max - min + 1));
  }
}
