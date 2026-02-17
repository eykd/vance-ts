/**
 * Cellular automata grid generation for cost map corridors.
 *
 * Generates a 2D binary grid using the 4-5 rule: cells become walls if their
 * 3x3 neighborhood contains 5 or more wall cells. The grid is initialized with
 * random fill and refined through multiple iterations to produce organic
 * cave-like corridors.
 *
 * @module costmap/cellular-automata
 */

import type { Prng } from '../../../../src/domain/galaxy/prng';

/** Configuration for cellular automata grid generation. */
export interface CellularAutomataConfig {
  /** Grid width in cells. */
  readonly width: number;
  /** Grid height in cells. */
  readonly height: number;
  /** Probability (0-1) that an interior cell starts as a wall. */
  readonly fillProbability: number;
  /** Number of CA iterations to apply. */
  readonly iterations: number;
  /** Seedable PRNG instance for deterministic random fill. */
  readonly rng: Prng;
}

/**
 * Initializes a cellular automata grid with random fill.
 *
 * Interior cells are randomly set to wall (1) or open (0) based on the
 * fillProbability. All boundary cells are forced to walls.
 *
 * @param config - Cellular automata configuration
 * @returns Row-major Uint8Array where 0=open, 1=wall
 */
export function initializeGrid(config: CellularAutomataConfig): Uint8Array {
  const { width, height, fillProbability, rng } = config;
  const grid = new Uint8Array(width * height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const isBoundary = x === 0 || x === width - 1 || y === 0 || y === height - 1;
      if (isBoundary) {
        grid[y * width + x] = 1;
      } else {
        grid[y * width + x] = rng.random() < fillProbability ? 1 : 0;
      }
    }
  }

  return grid;
}

/**
 * Counts wall cells in the 3x3 neighborhood around (cx, cy), including self.
 *
 * Only called for interior cells (1..width-2, 1..height-2), so all neighbors
 * are guaranteed to be within grid bounds.
 *
 * @param grid - Current grid state
 * @param width - Grid width
 * @param cx - Center x coordinate
 * @param cy - Center y coordinate
 * @returns Number of wall cells in the 3x3 neighborhood (0-9)
 */
function countNeighborWalls(grid: Uint8Array, width: number, cx: number, cy: number): number {
  let count = 0;

  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (grid[(cy + dy) * width + (cx + dx)] === 1) {
        count++;
      }
    }
  }

  return count;
}

/**
 * Applies one CA iteration using the 4-5 rule.
 *
 * For each interior cell, counts walls in the 3x3 neighborhood (including
 * self). If the count is >= 5, the cell becomes a wall; otherwise open.
 * Boundary cells are always forced to walls.
 *
 * @param grid - Current grid state (not mutated)
 * @param width - Grid width
 * @param height - Grid height
 * @returns New Uint8Array with the next generation
 */
export function stepGrid(grid: Uint8Array, width: number, height: number): Uint8Array {
  const next = new Uint8Array(width * height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const isBoundary = x === 0 || x === width - 1 || y === 0 || y === height - 1;
      if (isBoundary) {
        next[y * width + x] = 1;
      } else {
        const wallCount = countNeighborWalls(grid, width, x, y);
        next[y * width + x] = wallCount >= 5 ? 1 : 0;
      }
    }
  }

  return next;
}

/**
 * Generates a cellular automata grid with the 4-5 rule.
 *
 * Initializes a grid with random fill, then applies the specified number of
 * CA iterations. The result is a binary grid suitable for cost map corridor
 * generation.
 *
 * @param config - Cellular automata configuration
 * @returns Row-major Uint8Array where 0=open corridor, 1=wall
 */
export function generateCaGrid(config: CellularAutomataConfig): Uint8Array {
  let grid = initializeGrid(config);

  for (let i = 0; i < config.iterations; i++) {
    grid = stepGrid(grid, config.width, config.height);
  }

  return grid;
}
