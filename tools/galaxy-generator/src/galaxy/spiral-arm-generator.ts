/**
 * Spiral arm generator (Level 2).
 *
 * Walks along a spiral curve placing elliptic starfield clouds at each step.
 * The spiral is parameterized by angular offset (shift), base rotation (turn),
 * and size factors (sx, sy). At each step n radians along the spiral, the
 * generator computes a rotated position and delegates star placement to the
 * elliptic starfield generator (Level 3).
 *
 * @module galaxy/spiral-arm-generator
 */

import type { Prng } from '../../../../src/domain/galaxy/prng';
import type { Coordinate } from '../../../../src/domain/galaxy/types';

import { generateEllipticStarfieldCoords } from './elliptic-starfield';

/** Parameters for the spiral arm generator (Level 2). Pre-computed at galaxy level. */
export interface SpiralArmParams {
  /** Galaxy center position [x, y]. */
  readonly center: readonly [number, number];
  /** Size converted to radians: 2.0 * size[0] * pi / 360.0. */
  readonly sx: number;
  /** Size converted to radians: 2.0 * size[1] * pi / 360.0. */
  readonly sy: number;
  /** Angular offset for this arm: (arm / arms) * 2 * pi. */
  readonly shift: number;
  /** Base rotation angle (radians). */
  readonly turn: number;
  /** Spiral extent in radians. Walk continues while n <= deg. */
  readonly deg: number;
  /** Cloud x-radius: round(deg / pi * sx / 1.7) * dynSizeFactor. */
  readonly xp1: number;
  /** Cloud y-radius: round(deg / pi * sy / 1.7) * dynSizeFactor. */
  readonly yp1: number;
  /** Stars-per-cloud factor: (xp1 + yp1) / spcFactor. */
  readonly mulStarAmount: number;
  /** Distance scaling factor. */
  readonly dynSizeFactor: number;
  /** Output coordinate scaling factor. */
  readonly multiplier: number;
  /** Shared PRNG instance. */
  readonly rng: Prng;
}

/**
 * Generates star coordinates along a spiral arm.
 *
 * Walks from n=0.0 to n=deg radians in random steps of 1–5 degrees (converted
 * to radians). At each step, computes a spiral position using n directly as
 * radians, rotates it clockwise by (shift + turn), calculates cloud size, and
 * delegates to the elliptic starfield generator for individual star placement.
 *
 * @param params - Spiral arm generation parameters
 * @yields {Coordinate} Coordinate pairs for each generated star
 */
export function* generateSpiralArmCoords(params: SpiralArmParams): Generator<Coordinate> {
  const { center, sx, sy, shift, turn, deg, mulStarAmount, dynSizeFactor, multiplier, rng } =
    params;

  // n is in radians throughout — no degree conversion needed
  let n = 0.0;

  while (n <= deg) {
    // n used directly in both trig and scale (Python reference uses radians)
    const rawX = Math.cos(n) * (n * sx) * dynSizeFactor;
    const rawY = Math.sin(n) * (n * sy) * dynSizeFactor;

    const armAngle = shift + turn;
    const cosA = Math.cos(armAngle);
    const sinA = Math.sin(armAngle);

    // Python clockwise rotation (no rounding — keep as float for cloud center)
    const armX = cosA * rawX + sinA * rawY;
    const armY = -sinA * rawX + cosA * rawY;

    const dist = Math.sqrt(armX * armX + armY * armY);

    const distDivisor = dist / 200;
    const sizeTemp = 2 + (mulStarAmount * n) / (distDivisor !== 0 ? distDivisor : 1);
    const starCount = Math.floor(sizeTemp / (n !== 0 ? n : 2));

    yield* generateEllipticStarfieldCoords({
      amount: starCount,
      center: [center[0] + armX, center[1] + armY],
      radius: [sizeTemp, sizeTemp],
      turn: armAngle,
      multiplier,
      rng,
    });

    // Increment by 1–5 degrees converted to radians (matches Python reference)
    const angle = rng.randint(0, 4) + 1;
    n += (2.0 * angle * Math.PI) / 360.0;
  }
}
