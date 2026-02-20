/**
 * Elliptic starfield generator (Level 3).
 *
 * Places individual stars within an elliptical region using a center-biased
 * radial distribution. Each star's position is determined by a random angle,
 * a quadratically-biased radial distance, optional rotation, and a final
 * scaling multiplier.
 *
 * @module galaxy/elliptic-starfield
 */

import type { Prng } from '../../../../src/domain/galaxy/prng';
import type { Coordinate } from '../../../../src/domain/galaxy/types';

/** Parameters for the elliptic starfield generator (Level 3). */
export interface EllipticStarfieldParams {
  /** Number of stars to place in this cloud. */
  readonly amount: number;
  /** Center position of the elliptical cloud [x, y]. */
  readonly center: readonly [number, number];
  /** Ellipse radii [rx, ry]. */
  readonly radius: readonly [number, number];
  /** Rotation angle for the starfield (radians). 0 = no rotation. */
  readonly turn: number;
  /** Output coordinate scaling factor. 1 = no scaling. */
  readonly multiplier: number;
  /** Shared PRNG instance. State advances with each star placed. */
  readonly rng: Prng;
}

/**
 * Generates star coordinates within an elliptical region.
 *
 * Uses a center-biased radial distribution (quadratic falloff) to cluster
 * most stars near the cloud center. The sin/cos assignment is intentionally
 * swapped: sin controls x, cos controls y.
 *
 * @param params - Elliptic starfield generation parameters
 * @yields {Coordinate} Coordinate pairs for each generated star
 */
export function* generateEllipticStarfieldCoords(
  params: EllipticStarfieldParams
): Generator<Coordinate> {
  const { amount, center, radius, turn, multiplier, rng } = params;
  const [cx, cy] = center;
  const [rx, ry] = radius;

  for (let i = 0; i < amount; i++) {
    const degree = rng.randint(0, 360);
    const insideFactor = (rng.randint(0, 10000) / 10000) ** 2;

    const rad = (degree * Math.PI) / 180;

    // NOTE: sin for x, cos for y — intentionally swapped
    let posX = Math.sin(rad) * Math.round(insideFactor * rx);
    let posY = Math.cos(rad) * Math.round(insideFactor * ry);

    if (turn !== 0) {
      const cosT = Math.cos(turn);
      const sinT = Math.sin(turn);
      const rotX = posX * cosT - posY * sinT;
      const rotY = posX * sinT + posY * cosT;
      posX = rotX;
      posY = rotY;
    }

    const x = Math.round((cx + posX) * multiplier);
    const y = Math.round((cy + posY) * multiplier);

    yield { x, y };
  }
}
