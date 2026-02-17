import { Mulberry32 } from '../../../../src/domain/galaxy/prng';

import { generateCaGrid, type CellularAutomataConfig } from './cellular-automata';
import { composeCostMap, type CostComposerConfig } from './cost-composer';
import { generateNoiseGrid, type PerlinLayerConfig } from './perlin-layer';

/**
 * Creates a default CostComposerConfig for testing.
 *
 * @param overrides - partial config to merge
 * @returns complete CostComposerConfig
 */
function makeConfig(overrides: Partial<CostComposerConfig> = {}): CostComposerConfig {
  return {
    width: 10,
    height: 10,
    baseOpenCost: 1,
    openNoiseWeight: 2,
    baseWallCost: 10,
    wallNoiseWeight: 20,
    gridOriginX: 0,
    gridOriginY: 0,
    ...overrides,
  };
}

/**
 * Creates test inputs (noise grids and CA grid) for the cost composer.
 *
 * @param width - grid width
 * @param height - grid height
 * @param seed - PRNG seed
 * @returns baseNoise, wallNoise, and caGrid arrays
 */
function makeInputs(
  width: number,
  height: number,
  seed: number = 42
): { baseNoise: Float64Array; wallNoise: Float64Array; caGrid: Uint8Array } {
  const perlinConfig: PerlinLayerConfig = {
    width,
    height,
    frequency: 0.05,
    octaves: 4,
    rng: new Mulberry32(seed),
  };
  const baseNoise = generateNoiseGrid(perlinConfig);

  const wallPerlinConfig: PerlinLayerConfig = {
    width,
    height,
    frequency: 0.1,
    octaves: 3,
    rng: new Mulberry32(seed + 1),
  };
  const wallNoise = generateNoiseGrid(wallPerlinConfig);

  const caConfig: CellularAutomataConfig = {
    width,
    height,
    fillProbability: 0.45,
    iterations: 4,
    rng: new Mulberry32(seed + 2),
  };
  const caGrid = generateCaGrid(caConfig);

  return { baseNoise, wallNoise, caGrid };
}

describe('composeCostMap', () => {
  it('returns a CostMap with Uint8Array data of correct length', () => {
    const config = makeConfig();
    const { baseNoise, wallNoise, caGrid } = makeInputs(10, 10);

    const result = composeCostMap(config, baseNoise, caGrid, wallNoise);

    expect(result.data).toBeInstanceOf(Uint8Array);
    expect(result.data).toHaveLength(100);
  });

  it('stores correct grid dimensions in result', () => {
    const config = makeConfig({ width: 15, height: 8 });
    const { baseNoise, wallNoise, caGrid } = makeInputs(15, 8);

    const result = composeCostMap(config, baseNoise, caGrid, wallNoise);

    expect(result.width).toBe(15);
    expect(result.height).toBe(8);
  });

  it('stores quantization parameters', () => {
    const config = makeConfig({ gridOriginX: -50, gridOriginY: -30 });
    const { baseNoise, wallNoise, caGrid } = makeInputs(10, 10);

    const result = composeCostMap(config, baseNoise, caGrid, wallNoise);

    expect(result.quantization.gridOriginX).toBe(-50);
    expect(result.quantization.gridOriginY).toBe(-30);
    expect(result.quantization.gridWidth).toBe(10);
    expect(result.quantization.gridHeight).toBe(10);
    expect(typeof result.quantization.minCost).toBe('number');
    expect(typeof result.quantization.maxCost).toBe('number');
  });

  it('assigns open cells costs in range 1-3', () => {
    const width = 20;
    const height = 20;
    const config = makeConfig({
      width,
      height,
      baseOpenCost: 1,
      openNoiseWeight: 2,
    });
    const { baseNoise, wallNoise, caGrid } = makeInputs(width, height);

    const result = composeCostMap(config, baseNoise, caGrid, wallNoise);

    // Check open cells (CA grid value 0)
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        if (caGrid[idx] === 0) {
          // Decode uint8 back to actual cost
          const actualCost = decodeCost(result.data[idx]!, result.quantization);
          expect(actualCost).toBeGreaterThanOrEqual(1 - 0.01);
          expect(actualCost).toBeLessThanOrEqual(3 + 0.01);
        }
      }
    }
  });

  it('assigns wall cells costs in range 10-30', () => {
    const width = 20;
    const height = 20;
    const config = makeConfig({
      width,
      height,
      baseWallCost: 10,
      wallNoiseWeight: 20,
    });
    const { baseNoise, wallNoise, caGrid } = makeInputs(width, height);

    const result = composeCostMap(config, baseNoise, caGrid, wallNoise);

    // Check wall cells (CA grid value 1)
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        if (caGrid[idx] === 1) {
          const actualCost = decodeCost(result.data[idx]!, result.quantization);
          expect(actualCost).toBeGreaterThanOrEqual(10 - 0.15);
          expect(actualCost).toBeLessThanOrEqual(30 + 0.15);
        }
      }
    }
  });

  it('forces boundary cells to wall cost', () => {
    const width = 10;
    const height = 10;
    const config = makeConfig({ width, height });
    // Create all-open CA grid to isolate boundary forcing
    const caGrid = new Uint8Array(width * height); // all zeros = open
    const baseNoise = new Float64Array(width * height).fill(0.5);
    const wallNoise = new Float64Array(width * height).fill(0.5);

    const result = composeCostMap(config, baseNoise, caGrid, wallNoise);

    // All boundary cells should get wall cost (even though CA says open)
    for (let x = 0; x < width; x++) {
      const topCost = decodeCost(result.data[0 * width + x]!, result.quantization);
      const bottomCost = decodeCost(result.data[(height - 1) * width + x]!, result.quantization);
      expect(topCost).toBeGreaterThanOrEqual(10 - 0.15);
      expect(bottomCost).toBeGreaterThanOrEqual(10 - 0.15);
    }
    for (let y = 0; y < height; y++) {
      const leftCost = decodeCost(result.data[y * width + 0]!, result.quantization);
      const rightCost = decodeCost(result.data[y * width + (width - 1)]!, result.quantization);
      expect(leftCost).toBeGreaterThanOrEqual(10 - 0.15);
      expect(rightCost).toBeGreaterThanOrEqual(10 - 0.15);
    }
  });

  it('quantization minCost and maxCost bracket all actual costs', () => {
    const config = makeConfig({ width: 20, height: 20 });
    const { baseNoise, wallNoise, caGrid } = makeInputs(20, 20);

    const result = composeCostMap(config, baseNoise, caGrid, wallNoise);

    expect(result.quantization.minCost).toBeGreaterThanOrEqual(1);
    expect(result.quantization.maxCost).toBeLessThanOrEqual(30);
    expect(result.quantization.minCost).toBeLessThan(result.quantization.maxCost);
  });

  it('is deterministic with same inputs', () => {
    const config = makeConfig({ width: 15, height: 15 });
    const inputs1 = makeInputs(15, 15, 42);
    const inputs2 = makeInputs(15, 15, 42);

    const result1 = composeCostMap(config, inputs1.baseNoise, inputs1.caGrid, inputs1.wallNoise);
    const result2 = composeCostMap(config, inputs2.baseNoise, inputs2.caGrid, inputs2.wallNoise);

    expect(result1.data).toEqual(result2.data);
    expect(result1.quantization).toEqual(result2.quantization);
  });

  it('produces different results with different noise inputs', () => {
    const config = makeConfig({ width: 15, height: 15 });
    const inputs1 = makeInputs(15, 15, 42);
    const inputs2 = makeInputs(15, 15, 999);

    const result1 = composeCostMap(config, inputs1.baseNoise, inputs1.caGrid, inputs1.wallNoise);
    const result2 = composeCostMap(config, inputs2.baseNoise, inputs2.caGrid, inputs2.wallNoise);

    let hasDifference = false;
    for (let i = 0; i < result1.data.length; i++) {
      if (result1.data[i] !== result2.data[i]) {
        hasDifference = true;
        break;
      }
    }
    expect(hasDifference).toBe(true);
  });

  it('handles minimum grid size (3x3)', () => {
    const config = makeConfig({ width: 3, height: 3 });
    const caGrid = new Uint8Array(9).fill(1); // all walls for 3x3
    const baseNoise = new Float64Array(9).fill(0.5);
    const wallNoise = new Float64Array(9).fill(0.5);

    const result = composeCostMap(config, baseNoise, caGrid, wallNoise);

    expect(result.data).toHaveLength(9);
    expect(result.width).toBe(3);
    expect(result.height).toBe(3);
  });

  it('uint8 values span 0-255 range for precision', () => {
    const width = 30;
    const height = 30;
    const config = makeConfig({ width, height });
    const { baseNoise, wallNoise, caGrid } = makeInputs(width, height);

    const result = composeCostMap(config, baseNoise, caGrid, wallNoise);

    let minVal = 255;
    let maxVal = 0;
    for (let i = 0; i < result.data.length; i++) {
      const v = result.data[i]!;
      if (v < minVal) minVal = v;
      if (v > maxVal) maxVal = v;
    }
    // Should use a reasonable range of uint8 values
    expect(maxVal).toBeGreaterThan(minVal);
  });

  it('open cost formula: baseOpenCost + openNoiseWeight * noise', () => {
    const width = 5;
    const height = 5;
    const config = makeConfig({
      width,
      height,
      baseOpenCost: 1,
      openNoiseWeight: 2,
      baseWallCost: 10,
      wallNoiseWeight: 20,
    });
    // All open CA grid (interior only, boundaries forced to wall)
    const caGrid = new Uint8Array(width * height); // all zeros
    // Fixed noise = 0.5 → open cost = 1 + 2 * 0.5 = 2.0
    const baseNoise = new Float64Array(width * height).fill(0.5);
    const wallNoise = new Float64Array(width * height).fill(0.5);

    const result = composeCostMap(config, baseNoise, caGrid, wallNoise);

    // Check interior cell (2,2) which should be open
    const idx = 2 * width + 2;
    const actualCost = decodeCost(result.data[idx]!, result.quantization);
    expect(actualCost).toBeCloseTo(2.0, 0);
  });

  it('wall cost formula: baseWallCost + wallNoiseWeight * noise', () => {
    const width = 5;
    const height = 5;
    const config = makeConfig({
      width,
      height,
      baseOpenCost: 1,
      openNoiseWeight: 2,
      baseWallCost: 10,
      wallNoiseWeight: 20,
    });
    // All wall CA grid
    const caGrid = new Uint8Array(width * height).fill(1);
    // Fixed noise = 0.5 → wall cost = 10 + 20 * 0.5 = 20.0
    const baseNoise = new Float64Array(width * height).fill(0.5);
    const wallNoise = new Float64Array(width * height).fill(0.5);

    const result = composeCostMap(config, baseNoise, caGrid, wallNoise);

    // Check center cell (2,2) which should be wall
    const idx = 2 * width + 2;
    const actualCost = decodeCost(result.data[idx]!, result.quantization);
    expect(actualCost).toBeCloseTo(20.0, 0);
  });

  it('handles non-square grids', () => {
    const config = makeConfig({ width: 12, height: 7 });
    const { baseNoise, wallNoise, caGrid } = makeInputs(12, 7);

    const result = composeCostMap(config, baseNoise, caGrid, wallNoise);

    expect(result.data).toHaveLength(84);
    expect(result.width).toBe(12);
    expect(result.height).toBe(7);
  });

  it('open cost with noise=0 equals baseOpenCost', () => {
    const width = 5;
    const height = 5;
    const config = makeConfig({
      width,
      height,
      baseOpenCost: 1,
      openNoiseWeight: 2,
    });
    const caGrid = new Uint8Array(width * height); // all open
    const baseNoise = new Float64Array(width * height).fill(0.0);
    const wallNoise = new Float64Array(width * height).fill(0.0);

    const result = composeCostMap(config, baseNoise, caGrid, wallNoise);

    // Interior cell should have cost = baseOpenCost = 1
    const idx = 2 * width + 2;
    const actualCost = decodeCost(result.data[idx]!, result.quantization);
    expect(actualCost).toBeCloseTo(1.0, 0);
  });

  it('open cost with noise=1 equals baseOpenCost + openNoiseWeight', () => {
    const width = 5;
    const height = 5;
    const config = makeConfig({
      width,
      height,
      baseOpenCost: 1,
      openNoiseWeight: 2,
    });
    const caGrid = new Uint8Array(width * height); // all open
    const baseNoise = new Float64Array(width * height).fill(1.0);
    const wallNoise = new Float64Array(width * height).fill(1.0);

    const result = composeCostMap(config, baseNoise, caGrid, wallNoise);

    // Interior cell should have cost = 1 + 2 * 1 = 3
    const idx = 2 * width + 2;
    const actualCost = decodeCost(result.data[idx]!, result.quantization);
    expect(actualCost).toBeCloseTo(3.0, 0);
  });

  it('wall cost with noise=0 equals baseWallCost', () => {
    const width = 5;
    const height = 5;
    const config = makeConfig({
      width,
      height,
      baseWallCost: 10,
      wallNoiseWeight: 20,
    });
    const caGrid = new Uint8Array(width * height).fill(1); // all walls
    const baseNoise = new Float64Array(width * height).fill(0.0);
    const wallNoise = new Float64Array(width * height).fill(0.0);

    const result = composeCostMap(config, baseNoise, caGrid, wallNoise);

    const idx = 2 * width + 2;
    const actualCost = decodeCost(result.data[idx]!, result.quantization);
    expect(actualCost).toBeCloseTo(10.0, 0);
  });

  it('wall cost with noise=1 equals baseWallCost + wallNoiseWeight', () => {
    const width = 5;
    const height = 5;
    const config = makeConfig({
      width,
      height,
      baseWallCost: 10,
      wallNoiseWeight: 20,
    });
    const caGrid = new Uint8Array(width * height).fill(1); // all walls
    const baseNoise = new Float64Array(width * height).fill(1.0);
    const wallNoise = new Float64Array(width * height).fill(1.0);

    const result = composeCostMap(config, baseNoise, caGrid, wallNoise);

    const idx = 2 * width + 2;
    const actualCost = decodeCost(result.data[idx]!, result.quantization);
    expect(actualCost).toBeCloseTo(30.0, 0);
  });
});

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
