/**
 * Cost map composer combining three layers into a final traversal cost grid.
 *
 * Composes base Perlin noise, cellular automata corridors, and wall Perlin
 * noise into a unified cost map. Open corridor cells get low costs (1-3
 * range), wall cells get high costs (10-30 range). Output is quantized to
 * uint8 for efficient PNG encoding with metadata for decoding.
 *
 * @module costmap/cost-composer
 */

import type { CostMapQuantization } from '../../../../src/domain/galaxy/types';

/** Configuration for cost map composition. */
export interface CostComposerConfig {
  /** Grid width in cells. */
  readonly width: number;
  /** Grid height in cells. */
  readonly height: number;
  /** Base cost for open corridor cells. */
  readonly baseOpenCost: number;
  /** Noise weight added to open cells (scaled by noise in [0,1]). */
  readonly openNoiseWeight: number;
  /** Base cost for wall cells. */
  readonly baseWallCost: number;
  /** Noise weight added to wall cells (scaled by noise in [0,1]). */
  readonly wallNoiseWeight: number;
  /** Grid origin X in world coordinates. */
  readonly gridOriginX: number;
  /** Grid origin Y in world coordinates. */
  readonly gridOriginY: number;
}

/** Composed cost map with quantized uint8 data and decode metadata. */
export interface CostMap {
  /** Quantized cost data in row-major order (y * width + x). */
  readonly data: Uint8Array;
  /** Grid width in cells. */
  readonly width: number;
  /** Grid height in cells. */
  readonly height: number;
  /** Quantization parameters for decoding uint8 back to actual costs. */
  readonly quantization: CostMapQuantization;
}

/**
 * Composes three layers into a final cost map with uint8 quantization.
 *
 * For each cell, the cost is determined by the CA grid:
 * - Open cells (CA=0): baseOpenCost + openNoiseWeight * baseNoise[i]
 * - Wall cells (CA=1): baseWallCost + wallNoiseWeight * wallNoise[i]
 *
 * Boundary cells are always treated as walls regardless of CA value.
 * The resulting float costs are linearly quantized to uint8 (0-255).
 *
 * @param config - Composition configuration with cost weights
 * @param baseNoise - Row-major Float64Array of base Perlin noise values in [0,1]
 * @param caGrid - Row-major Uint8Array of CA grid (0=open, 1=wall)
 * @param wallNoise - Row-major Float64Array of wall Perlin noise values in [0,1]
 * @returns CostMap with uint8 data and quantization parameters
 */
export function composeCostMap(
  config: CostComposerConfig,
  baseNoise: Float64Array,
  caGrid: Uint8Array,
  wallNoise: Float64Array
): CostMap {
  const { width, height, baseOpenCost, openNoiseWeight, baseWallCost, wallNoiseWeight } = config;
  const size = width * height;
  const floatCosts = new Float64Array(size);

  // First pass: compute float costs per cell
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const isBoundary = x === 0 || x === width - 1 || y === 0 || y === height - 1;
      const isWall = isBoundary || caGrid[idx] === 1;

      if (isWall) {
        floatCosts[idx] = baseWallCost + wallNoiseWeight * wallNoise[idx]!;
      } else {
        floatCosts[idx] = baseOpenCost + openNoiseWeight * baseNoise[idx]!;
      }
    }
  }

  // Find min/max for quantization
  let minCost = floatCosts[0]!;
  let maxCost = floatCosts[0]!;
  for (let i = 1; i < size; i++) {
    const c = floatCosts[i]!;
    if (c < minCost) minCost = c;
    if (c > maxCost) maxCost = c;
  }

  // Second pass: quantize to uint8
  const data = new Uint8Array(size);
  const costRange = maxCost - minCost;

  if (costRange === 0) {
    // All cells have the same cost; map to mid-range
    data.fill(128);
  } else {
    for (let i = 0; i < size; i++) {
      data[i] = Math.round(((floatCosts[i]! - minCost) / costRange) * 255);
    }
  }

  return {
    data,
    width,
    height,
    quantization: {
      minCost,
      maxCost,
      gridOriginX: config.gridOriginX,
      gridOriginY: config.gridOriginY,
      gridWidth: width,
      gridHeight: height,
    },
  };
}
