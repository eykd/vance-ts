/**
 * Galaxy generator (Level 1).
 *
 * Converts galaxy configuration into star system coordinates by computing
 * spiral parameters and iterating over each arm. Delegates to the spiral arm
 * generator (Level 2) for individual arm placement.
 *
 * @module galaxy/galaxy-generator
 */

import type { Prng } from '../../../../src/domain/galaxy/prng';
import type { Coordinate } from '../../../../src/domain/galaxy/types';

import { generateSpiralArmCoords } from './spiral-arm-generator';

/** Top-level configuration for the galaxy generator (Level 1). */
export interface GalaxyGeneratorConfig {
  /** Galaxy center position [x, y]. Default: [0, 0]. */
  readonly center: readonly [number, number];
  /** Input size (converted internally to radians). Default: [4000, 4000]. */
  readonly size: readonly [number, number];
  /** Base rotation angle (radians). Default: 0. */
  readonly turn: number;
  /** Spiral extent in degrees. Default: 5. */
  readonly deg: number;
  /** Distance scaling factor. Default: 1. */
  readonly dynSizeFactor: number;
  /** Stars-per-cloud divisor. Higher = fewer stars per cloud. Default: 8. */
  readonly spcFactor: number;
  /** Number of spiral arms. Default: 4. */
  readonly arms: number;
  /** Output coordinate scaling factor. Default: 1. */
  readonly multiplier: number;
  /** Maximum total star count, or null for unlimited. Default: null. */
  readonly limit: number | null;
  /** Shared PRNG instance. */
  readonly rng: Prng;
}

/**
 * Generates raw star coordinates for a spiral galaxy.
 *
 * Converts size to radians, computes cloud parameters, iterates over each arm,
 * and yields coordinates from the spiral arm generator. If a limit is specified,
 * stops yielding when the limit is reached (tracked per-coordinate).
 *
 * @param config - Galaxy generation configuration
 * @yields {Coordinate} Star coordinate pairs
 */
export function* generateSpiralGalaxyCoords(config: GalaxyGeneratorConfig): Generator<Coordinate> {
  const { center, size, turn, deg, dynSizeFactor, spcFactor, arms, multiplier, limit, rng } =
    config;

  const sx = (2.0 * size[0] * Math.PI) / 360.0;
  const sy = (2.0 * size[1] * Math.PI) / 360.0;

  const xp1 = Math.round((deg / Math.PI) * (sx / 1.7)) * dynSizeFactor;
  const yp1 = Math.round((deg / Math.PI) * (sy / 1.7)) * dynSizeFactor;
  const mulStarAmount = (xp1 + yp1) / spcFactor;

  let count = 0;

  for (let arm = 0; arm < arms; arm++) {
    const shift = (arm / arms) * 2 * Math.PI;

    for (const coord of generateSpiralArmCoords({
      center,
      sx,
      sy,
      shift,
      turn,
      deg,
      xp1,
      yp1,
      mulStarAmount,
      dynSizeFactor,
      multiplier,
      rng,
    })) {
      yield coord;
      count++;
      if (limit !== null && count >= limit) {
        return;
      }
    }
  }
}

/**
 * Generates a deduplicated array of star coordinates for a spiral galaxy.
 *
 * Calls the generator, collects all coordinates, and deduplicates using a
 * Set keyed by "x,y" string representation of integer coordinates.
 *
 * @param config - Galaxy generation configuration
 * @returns Array of unique star coordinates
 */
export function generateGalaxy(config: GalaxyGeneratorConfig): Coordinate[] {
  const seen = new Set<string>();
  const result: Coordinate[] = [];

  for (const coord of generateSpiralGalaxyCoords(config)) {
    const key = `${coord.x},${coord.y}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push(coord);
    }
  }

  return result;
}
