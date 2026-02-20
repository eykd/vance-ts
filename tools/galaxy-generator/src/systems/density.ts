/**
 * Stellar density calculator.
 *
 * Computes local stellar density for each system by counting neighbors within
 * a configurable radius using a spatial hash for efficient lookups. Derives
 * an environment penalty from the neighbor count.
 *
 * @module systems/density
 */

import { SpatialHash } from '../../../../src/domain/galaxy/spatial-hash';
import type { Coordinate, DensityData } from '../../../../src/domain/galaxy/types';

/** Configuration for stellar density calculation. */
export interface DensityConfig {
  /** Radius in coordinate units for neighbor counting. */
  readonly radius: number;
  /** Logical width of the coordinate space (for spatial hash computation). */
  readonly gridWidth: number;
}

/**
 * Computes the environment penalty from a neighbor count.
 *
 * Formula: -floor(min(neighborCount, 16) / 4)
 * Produces values in range [0, -4]:
 * - 0-3 neighbors: 0
 * - 4-7 neighbors: -1
 * - 8-11 neighbors: -2
 * - 12-15 neighbors: -3
 * - 16+ neighbors: -4
 *
 * @param neighborCount - Number of neighboring systems within the density radius
 * @returns Environment penalty in range [0, -4]
 */
export function computeEnvironmentPenalty(neighborCount: number): number {
  const clamped = Math.min(neighborCount, 16);
  const steps = Math.floor(clamped / 4);
  return steps === 0 ? 0 : -steps;
}

/**
 * Calculates local stellar density for each system coordinate.
 *
 * Inserts all systems into a spatial hash, then queries for neighbors within
 * the configured radius. Each system's neighbor count excludes itself.
 * Derives the environment penalty from the neighbor count.
 *
 * @param coordinates - Array of star system positions
 * @param config - Density calculation configuration
 * @returns Array of DensityData, one per input coordinate (same order)
 */
export function calculateDensity(
  coordinates: readonly Coordinate[],
  config: DensityConfig
): DensityData[] {
  if (coordinates.length === 0) {
    return [];
  }

  const hash = new SpatialHash(config.radius, config.gridWidth);

  for (let i = 0; i < coordinates.length; i++) {
    const coord = coordinates[i] as Coordinate;
    hash.insert(i, coord.x, coord.y);
  }

  const results: DensityData[] = [];

  for (let i = 0; i < coordinates.length; i++) {
    const coord = coordinates[i] as Coordinate;
    const neighbors = hash.queryRadius(coord.x, coord.y, config.radius);

    // Exclude the system itself from the count
    const neighborCount = neighbors.filter((idx) => idx !== i).length;
    const environmentPenalty = computeEnvironmentPenalty(neighborCount);

    results.push({ neighborCount, environmentPenalty });
  }

  return results;
}
