/**
 * Perlin noise layer generator for cost map terrain.
 *
 * Wraps the simplex-noise library to produce multi-octave fractal Brownian
 * motion (FBM) grids. Accepts a seedable PRNG for deterministic generation.
 *
 * @module costmap/perlin-layer
 */

import { createNoise2D } from 'simplex-noise';

import type { Prng } from '../../../../src/domain/galaxy/prng';

/** Configuration for Perlin noise layer generation. */
export interface PerlinLayerConfig {
  /** Grid width in cells. */
  readonly width: number;
  /** Grid height in cells. */
  readonly height: number;
  /** Base frequency for the first octave. */
  readonly frequency: number;
  /** Number of FBM octaves. Higher values add finer detail. */
  readonly octaves: number;
  /** Seedable PRNG instance for deterministic noise generation. */
  readonly rng: Prng;
}

/**
 * Creates a 2D fractal Brownian motion sampler from the given config.
 *
 * The returned function accepts (x, y) coordinates and returns a noise
 * value normalized to the [0, 1] range. Multiple octaves are summed with
 * standard FBM parameters (lacunarity = 2, persistence = 0.5).
 *
 * @param config - Perlin layer configuration
 * @returns A function that samples FBM noise at (x, y), returning [0, 1]
 */
export function sampleFbm(config: PerlinLayerConfig): (x: number, y: number) => number {
  const noise2D = createNoise2D(config.rng.random.bind(config.rng));
  const { frequency, octaves } = config;
  const lacunarity = 2.0;
  const persistence = 0.5;

  // Pre-compute the max possible amplitude sum for normalization
  let maxAmplitude = 0;
  let amp = 1.0;
  for (let i = 0; i < octaves; i++) {
    maxAmplitude += amp;
    amp *= persistence;
  }

  return (x: number, y: number): number => {
    let sum = 0;
    let amplitude = 1.0;
    let freq = frequency;

    for (let i = 0; i < octaves; i++) {
      sum += amplitude * noise2D(x * freq, y * freq);
      freq *= lacunarity;
      amplitude *= persistence;
    }

    // noise2D returns [-1, 1]; FBM sum ranges [-maxAmplitude, maxAmplitude]
    // Normalize to [0, 1]
    return (sum / maxAmplitude + 1) / 2;
  };
}

/**
 * Generates a 2D noise grid as a row-major Float64Array.
 *
 * Each cell at (x, y) is stored at index `y * width + x`. Values are
 * normalized to [0, 1].
 *
 * @param config - Perlin layer configuration including grid dimensions
 * @returns Row-major Float64Array of noise values in [0, 1]
 */
export function generateNoiseGrid(config: PerlinLayerConfig): Float64Array {
  const { width, height } = config;
  const grid = new Float64Array(width * height);
  const noise = sampleFbm(config);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      grid[y * width + x] = noise(x, y);
    }
  }

  return grid;
}
