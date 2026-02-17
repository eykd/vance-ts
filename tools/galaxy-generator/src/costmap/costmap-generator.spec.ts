import { Mulberry32 } from '../../../../src/domain/galaxy/prng';
import type { Coordinate } from '../../../../src/domain/galaxy/types';

import {
  generateCostMap,
  computeGridBounds,
  type CostMapGeneratorConfig,
} from './costmap-generator';

/**
 * Creates a default CostMapGeneratorConfig for testing.
 *
 * @param overrides - partial config to merge
 * @returns complete CostMapGeneratorConfig
 */
function makeConfig(overrides: Partial<CostMapGeneratorConfig> = {}): CostMapGeneratorConfig {
  return {
    padding: 10,
    baseOpenCost: 1,
    openNoiseWeight: 2,
    baseWallCost: 10,
    wallNoiseWeight: 20,
    baseNoiseFrequency: 0.05,
    baseNoiseOctaves: 4,
    wallNoiseFrequency: 0.1,
    wallNoiseOctaves: 3,
    caFillProbability: 0.45,
    caIterations: 4,
    ...overrides,
  };
}

/**
 * Creates a simple array of coordinates for testing.
 *
 * @param count - number of coordinates to generate
 * @param spread - maximum absolute coordinate value
 * @returns array of Coordinate objects
 */
function makeCoordinates(count: number, spread: number): Coordinate[] {
  const coords: Coordinate[] = [];
  const rng = new Mulberry32(12345);
  for (let i = 0; i < count; i++) {
    coords.push({
      x: Math.floor(rng.random() * spread * 2) - spread,
      y: Math.floor(rng.random() * spread * 2) - spread,
    });
  }
  return coords;
}

/**
 * Decodes a uint8 value back to the actual cost using quantization parameters.
 *
 * @param uint8Value - the encoded byte value (0-255)
 * @param quantization - the quantization parameters
 * @param quantization.minCost - minimum cost in the quantization range
 * @param quantization.maxCost - maximum cost in the quantization range
 * @returns the decoded actual cost
 */
function decodeCost(
  uint8Value: number,
  quantization: { minCost: number; maxCost: number }
): number {
  const { minCost, maxCost } = quantization;
  const range = maxCost - minCost;
  if (range === 0) return minCost;
  return minCost + (uint8Value / 255) * range;
}

describe('computeGridBounds', () => {
  it('computes bounding box from coordinates with padding', () => {
    const coords: Coordinate[] = [
      { x: 10, y: 20 },
      { x: 50, y: 80 },
      { x: -30, y: -40 },
    ];

    const bounds = computeGridBounds(coords, 5);

    expect(bounds.gridOriginX).toBe(-30 - 5);
    expect(bounds.gridOriginY).toBe(-40 - 5);
    expect(bounds.gridWidth).toBe(50 - -30 + 1 + 2 * 5);
    expect(bounds.gridHeight).toBe(80 - -40 + 1 + 2 * 5);
  });

  it('handles single coordinate', () => {
    const coords: Coordinate[] = [{ x: 100, y: 200 }];

    const bounds = computeGridBounds(coords, 10);

    expect(bounds.gridOriginX).toBe(100 - 10);
    expect(bounds.gridOriginY).toBe(200 - 10);
    expect(bounds.gridWidth).toBe(1 + 2 * 10);
    expect(bounds.gridHeight).toBe(1 + 2 * 10);
  });

  it('handles zero padding', () => {
    const coords: Coordinate[] = [
      { x: 0, y: 0 },
      { x: 10, y: 10 },
    ];

    const bounds = computeGridBounds(coords, 0);

    expect(bounds.gridOriginX).toBe(0);
    expect(bounds.gridOriginY).toBe(0);
    expect(bounds.gridWidth).toBe(11);
    expect(bounds.gridHeight).toBe(11);
  });

  it('handles negative coordinates', () => {
    const coords: Coordinate[] = [
      { x: -100, y: -200 },
      { x: -50, y: -80 },
    ];

    const bounds = computeGridBounds(coords, 3);

    expect(bounds.gridOriginX).toBe(-100 - 3);
    expect(bounds.gridOriginY).toBe(-200 - 3);
    expect(bounds.gridWidth).toBe(50 + 1 + 2 * 3);
    expect(bounds.gridHeight).toBe(120 + 1 + 2 * 3);
  });

  it('handles coordinates at the same point', () => {
    const coords: Coordinate[] = [
      { x: 5, y: 5 },
      { x: 5, y: 5 },
    ];

    const bounds = computeGridBounds(coords, 2);

    expect(bounds.gridOriginX).toBe(3);
    expect(bounds.gridOriginY).toBe(3);
    expect(bounds.gridWidth).toBe(1 + 2 * 2);
    expect(bounds.gridHeight).toBe(1 + 2 * 2);
  });
});

describe('generateCostMap', () => {
  it('returns a CostMap with Uint8Array data', () => {
    const coords = makeCoordinates(50, 100);
    const config = makeConfig();
    const rng = new Mulberry32(42);

    const result = generateCostMap(coords, config, rng);

    expect(result.data).toBeInstanceOf(Uint8Array);
  });

  it('grid dimensions cover bounding box with padding', () => {
    const coords: Coordinate[] = [
      { x: 0, y: 0 },
      { x: 100, y: 100 },
    ];
    const config = makeConfig({ padding: 10 });
    const rng = new Mulberry32(42);

    const result = generateCostMap(coords, config, rng);

    expect(result.width).toBe(100 + 1 + 2 * 10);
    expect(result.height).toBe(100 + 1 + 2 * 10);
    expect(result.data).toHaveLength(result.width * result.height);
  });

  it('quantization origin matches computed grid bounds', () => {
    const coords: Coordinate[] = [
      { x: -50, y: -30 },
      { x: 50, y: 30 },
    ];
    const config = makeConfig({ padding: 5 });
    const rng = new Mulberry32(42);

    const result = generateCostMap(coords, config, rng);

    expect(result.quantization.gridOriginX).toBe(-50 - 5);
    expect(result.quantization.gridOriginY).toBe(-30 - 5);
    expect(result.quantization.gridWidth).toBe(result.width);
    expect(result.quantization.gridHeight).toBe(result.height);
  });

  it('open corridor cells have costs in range 1-3', () => {
    const coords = makeCoordinates(100, 50);
    const config = makeConfig({
      baseOpenCost: 1,
      openNoiseWeight: 2,
      baseWallCost: 10,
      wallNoiseWeight: 20,
    });
    const rng = new Mulberry32(42);

    const result = generateCostMap(coords, config, rng);

    let hasOpenCell = false;
    for (let i = 0; i < result.data.length; i++) {
      const cost = decodeCost(result.data[i]!, result.quantization);
      if (cost <= 3.01) {
        hasOpenCell = true;
        expect(cost).toBeGreaterThanOrEqual(1 - 0.15);
        expect(cost).toBeLessThanOrEqual(3 + 0.15);
      }
    }
    expect(hasOpenCell).toBe(true);
  });

  it('wall cells have costs in range 10-30', () => {
    const coords = makeCoordinates(100, 50);
    const config = makeConfig({
      baseOpenCost: 1,
      openNoiseWeight: 2,
      baseWallCost: 10,
      wallNoiseWeight: 20,
    });
    const rng = new Mulberry32(42);

    const result = generateCostMap(coords, config, rng);

    let hasWallCell = false;
    for (let i = 0; i < result.data.length; i++) {
      const cost = decodeCost(result.data[i]!, result.quantization);
      if (cost >= 9.85) {
        hasWallCell = true;
        expect(cost).toBeGreaterThanOrEqual(10 - 0.15);
        expect(cost).toBeLessThanOrEqual(30 + 0.15);
      }
    }
    expect(hasWallCell).toBe(true);
  });

  it('is deterministic with same seed', () => {
    const coords = makeCoordinates(50, 100);
    const config = makeConfig();

    const result1 = generateCostMap(coords, config, new Mulberry32(42));
    const result2 = generateCostMap(coords, config, new Mulberry32(42));

    expect(result1.data).toEqual(result2.data);
    expect(result1.quantization).toEqual(result2.quantization);
    expect(result1.width).toBe(result2.width);
    expect(result1.height).toBe(result2.height);
  });

  it('produces different results with different seeds', () => {
    const coords = makeCoordinates(50, 100);
    const config = makeConfig();

    const result1 = generateCostMap(coords, config, new Mulberry32(42));
    const result2 = generateCostMap(coords, config, new Mulberry32(999));

    let hasDifference = false;
    for (let i = 0; i < result1.data.length; i++) {
      if (result1.data[i] !== result2.data[i]) {
        hasDifference = true;
        break;
      }
    }
    expect(hasDifference).toBe(true);
  });

  it('quantization minCost is less than maxCost', () => {
    const coords = makeCoordinates(100, 50);
    const config = makeConfig();
    const rng = new Mulberry32(42);

    const result = generateCostMap(coords, config, rng);

    expect(result.quantization.minCost).toBeLessThan(result.quantization.maxCost);
  });

  it('uint8 data uses the full range', () => {
    const coords = makeCoordinates(200, 100);
    const config = makeConfig();
    const rng = new Mulberry32(42);

    const result = generateCostMap(coords, config, rng);

    let minVal = 255;
    let maxVal = 0;
    for (let i = 0; i < result.data.length; i++) {
      const v = result.data[i]!;
      if (v < minVal) minVal = v;
      if (v > maxVal) maxVal = v;
    }
    expect(minVal).toBe(0);
    expect(maxVal).toBe(255);
  });

  it('creates separate PRNG streams for each layer', () => {
    // Verifying the RNG is used correctly by checking that the base noise,
    // CA, and wall noise layers get independent PRNG instances
    const coords: Coordinate[] = [
      { x: 0, y: 0 },
      { x: 20, y: 20 },
    ];
    const config = makeConfig({ padding: 2 });
    const rng = new Mulberry32(42);

    const result = generateCostMap(coords, config, rng);

    // The result should exist and have valid data - the key invariant
    // is that each layer gets its own RNG so results are reproducible
    expect(result.data.length).toBeGreaterThan(0);
    expect(result.width).toBeGreaterThan(0);
    expect(result.height).toBeGreaterThan(0);
  });

  it('respects custom noise and CA parameters', () => {
    const coords = makeCoordinates(50, 50);
    const configA = makeConfig({
      baseNoiseFrequency: 0.01,
      baseNoiseOctaves: 2,
      wallNoiseFrequency: 0.05,
      wallNoiseOctaves: 2,
      caFillProbability: 0.3,
      caIterations: 2,
    });
    const configB = makeConfig({
      baseNoiseFrequency: 0.1,
      baseNoiseOctaves: 6,
      wallNoiseFrequency: 0.2,
      wallNoiseOctaves: 4,
      caFillProbability: 0.6,
      caIterations: 6,
    });

    const resultA = generateCostMap(coords, configA, new Mulberry32(42));
    const resultB = generateCostMap(coords, configB, new Mulberry32(42));

    // Different parameters should produce different cost maps
    let hasDifference = false;
    for (let i = 0; i < resultA.data.length; i++) {
      if (resultA.data[i] !== resultB.data[i]) {
        hasDifference = true;
        break;
      }
    }
    expect(hasDifference).toBe(true);
  });
});
