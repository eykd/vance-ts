/**
 * Cost map generation orchestrator.
 *
 * Ties together Perlin noise layers, cellular automata, and cost composition
 * into a single pipeline that transforms star coordinates into a complete
 * traversal cost map. Computes grid bounds from coordinate extents, generates
 * three independent layers with separate PRNG streams, and composes them
 * into a quantized uint8 cost map.
 *
 * @module costmap/costmap-generator
 */

import type { Prng } from '../../../../src/domain/galaxy/prng';
import { Mulberry32 } from '../../../../src/domain/galaxy/prng';
import type { Coordinate } from '../../../../src/domain/galaxy/types';

import { generateCaGrid } from './cellular-automata';
import { composeCostMap, type CostMap } from './cost-composer';
import { generateNoiseGrid } from './perlin-layer';

/** Configuration for cost map generation. */
export interface CostMapGeneratorConfig {
  /** Padding cells around the star bounding box. */
  readonly padding: number;
  /** Base cost for open corridor cells. */
  readonly baseOpenCost: number;
  /** Noise weight added to open cells (scaled by noise in [0,1]). */
  readonly openNoiseWeight: number;
  /** Base cost for wall cells. */
  readonly baseWallCost: number;
  /** Noise weight added to wall cells (scaled by noise in [0,1]). */
  readonly wallNoiseWeight: number;
  /** Base Perlin noise frequency. */
  readonly baseNoiseFrequency: number;
  /** Base Perlin noise octave count. */
  readonly baseNoiseOctaves: number;
  /** Wall Perlin noise frequency. */
  readonly wallNoiseFrequency: number;
  /** Wall Perlin noise octave count. */
  readonly wallNoiseOctaves: number;
  /** Cellular automata initial fill probability (0-1). */
  readonly caFillProbability: number;
  /** Cellular automata iteration count. */
  readonly caIterations: number;
}

/** Computed grid bounds from star coordinates. */
export interface GridBounds {
  /** Grid origin X in world coordinates. */
  readonly gridOriginX: number;
  /** Grid origin Y in world coordinates. */
  readonly gridOriginY: number;
  /** Grid width in cells. */
  readonly gridWidth: number;
  /** Grid height in cells. */
  readonly gridHeight: number;
}

/**
 * Computes grid bounds from star coordinates with padding.
 *
 * Finds the bounding box of all coordinates, adds padding on all sides,
 * and returns the origin and dimensions for the cost map grid. Width and
 * height include +1 for the inclusive coordinate range.
 *
 * @param coordinates - array of star system positions
 * @param padding - number of cells to add on each side
 * @returns grid bounds with origin and dimensions
 */
export function computeGridBounds(coordinates: readonly Coordinate[], padding: number): GridBounds {
  let minX = (coordinates[0] as Coordinate).x;
  let maxX = minX;
  let minY = (coordinates[0] as Coordinate).y;
  let maxY = minY;

  for (let i = 1; i < coordinates.length; i++) {
    const coord = coordinates[i] as Coordinate;
    if (coord.x < minX) minX = coord.x;
    if (coord.x > maxX) maxX = coord.x;
    if (coord.y < minY) minY = coord.y;
    if (coord.y > maxY) maxY = coord.y;
  }

  return {
    gridOriginX: minX - padding,
    gridOriginY: minY - padding,
    gridWidth: maxX - minX + 1 + 2 * padding,
    gridHeight: maxY - minY + 1 + 2 * padding,
  };
}

/**
 * Generates a complete cost map from star coordinates.
 *
 * Pipeline:
 * 1. Compute grid bounds from coordinate extents with padding
 * 2. Generate base Perlin noise layer (open cell variation)
 * 3. Generate cellular automata corridor grid (open/wall binary)
 * 4. Generate wall Perlin noise layer (wall cell variation)
 * 5. Compose layers into quantized uint8 cost map
 *
 * Each layer receives an independent PRNG stream derived from the input RNG
 * to ensure deterministic, non-interfering generation.
 *
 * @param coordinates - array of star system positions
 * @param config - cost map generation configuration
 * @param rng - seeded PRNG instance (consumed for deriving layer seeds)
 * @returns complete CostMap with uint8 data and quantization metadata
 */
export function generateCostMap(
  coordinates: readonly Coordinate[],
  config: CostMapGeneratorConfig,
  rng: Prng
): CostMap {
  const bounds = computeGridBounds(coordinates, config.padding);
  const { gridWidth, gridHeight } = bounds;

  // Derive independent seeds for each layer from the input RNG
  const baseNoiseSeed = Math.floor(rng.random() * 0xffffffff);
  const caSeed = Math.floor(rng.random() * 0xffffffff);
  const wallNoiseSeed = Math.floor(rng.random() * 0xffffffff);

  // Layer 1: Base Perlin noise for open cell variation
  const baseNoise = generateNoiseGrid({
    width: gridWidth,
    height: gridHeight,
    frequency: config.baseNoiseFrequency,
    octaves: config.baseNoiseOctaves,
    rng: new Mulberry32(baseNoiseSeed),
  });

  // Layer 2: Cellular automata corridors
  const caGrid = generateCaGrid({
    width: gridWidth,
    height: gridHeight,
    fillProbability: config.caFillProbability,
    iterations: config.caIterations,
    rng: new Mulberry32(caSeed),
  });

  // Layer 3: Wall Perlin noise for wall cell variation
  const wallNoise = generateNoiseGrid({
    width: gridWidth,
    height: gridHeight,
    frequency: config.wallNoiseFrequency,
    octaves: config.wallNoiseOctaves,
    rng: new Mulberry32(wallNoiseSeed),
  });

  // Compose all layers into the final cost map
  return composeCostMap(
    {
      width: gridWidth,
      height: gridHeight,
      baseOpenCost: config.baseOpenCost,
      openNoiseWeight: config.openNoiseWeight,
      baseWallCost: config.baseWallCost,
      wallNoiseWeight: config.wallNoiseWeight,
      gridOriginX: bounds.gridOriginX,
      gridOriginY: bounds.gridOriginY,
    },
    baseNoise,
    caGrid,
    wallNoise
  );
}
