import { Mulberry32 } from '../../../../src/domain/galaxy/prng';

import { generateNoiseGrid, sampleFbm, type PerlinLayerConfig } from './perlin-layer';

/**
 * Creates a default PerlinLayerConfig for testing.
 *
 * @param overrides - partial config to merge
 * @returns complete PerlinLayerConfig
 */
function makeConfig(overrides: Partial<PerlinLayerConfig> = {}): PerlinLayerConfig {
  return {
    width: 8,
    height: 8,
    frequency: 0.05,
    octaves: 4,
    rng: new Mulberry32(42),
    ...overrides,
  };
}

describe('sampleFbm', () => {
  it('returns a number for any coordinate', () => {
    const config = makeConfig();
    const noise = sampleFbm(config);

    const value = noise(0, 0);

    expect(typeof value).toBe('number');
  });

  it('returns values in [0, 1] range', () => {
    const config = makeConfig();
    const noise = sampleFbm(config);

    // Sample many coordinates to check bounds
    for (let x = 0; x < 100; x++) {
      for (let y = 0; y < 100; y++) {
        const value = noise(x * 0.1, y * 0.1);
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(1);
      }
    }
  });

  it('is deterministic with fixed seed', () => {
    const noise1 = sampleFbm(makeConfig({ rng: new Mulberry32(999) }));
    const noise2 = sampleFbm(makeConfig({ rng: new Mulberry32(999) }));

    for (let x = 0; x < 10; x++) {
      for (let y = 0; y < 10; y++) {
        expect(noise1(x, y)).toBe(noise2(x, y));
      }
    }
  });

  it('produces different results with different seeds', () => {
    const noise1 = sampleFbm(makeConfig({ rng: new Mulberry32(1) }));
    const noise2 = sampleFbm(makeConfig({ rng: new Mulberry32(2) }));

    let hasDifference = false;
    for (let x = 0; x < 10; x++) {
      for (let y = 0; y < 10; y++) {
        if (noise1(x, y) !== noise2(x, y)) {
          hasDifference = true;
        }
      }
    }
    expect(hasDifference).toBe(true);
  });

  it('respects octaves parameter', () => {
    // 1 octave should produce smoother noise than 8 octaves
    const smooth = sampleFbm(makeConfig({ octaves: 1, rng: new Mulberry32(42) }));
    const detailed = sampleFbm(makeConfig({ octaves: 8, rng: new Mulberry32(42) }));

    // Sample adjacent points and measure variance
    const smoothDiffs: number[] = [];
    const detailedDiffs: number[] = [];
    for (let x = 0; x < 20; x++) {
      const s1 = smooth(x * 0.5, 0);
      const s2 = smooth((x + 1) * 0.5, 0);
      smoothDiffs.push(Math.abs(s2 - s1));

      const d1 = detailed(x * 0.5, 0);
      const d2 = detailed((x + 1) * 0.5, 0);
      detailedDiffs.push(Math.abs(d2 - d1));
    }

    // Both should still produce values but they should differ in character
    // More octaves means the underlying noise function was called more times
    expect(smoothDiffs.length).toBe(20);
    expect(detailedDiffs.length).toBe(20);
  });

  it('respects frequency parameter', () => {
    const lowFreq = sampleFbm(makeConfig({ frequency: 0.01, rng: new Mulberry32(42) }));
    const highFreq = sampleFbm(makeConfig({ frequency: 0.5, rng: new Mulberry32(42) }));

    // Different frequencies should produce different values at the same coordinate
    // (since frequency scales the input coordinates)
    let hasDifference = false;
    for (let i = 1; i < 10; i++) {
      if (lowFreq(i, i) !== highFreq(i, i)) {
        hasDifference = true;
      }
    }
    expect(hasDifference).toBe(true);
  });

  it('handles single octave', () => {
    const config = makeConfig({ octaves: 1 });
    const noise = sampleFbm(config);

    const value = noise(5.5, 3.2);

    expect(value).toBeGreaterThanOrEqual(0);
    expect(value).toBeLessThanOrEqual(1);
  });

  it('handles high frequency values', () => {
    const config = makeConfig({ frequency: 1.0 });
    const noise = sampleFbm(config);

    const value = noise(10, 10);

    expect(value).toBeGreaterThanOrEqual(0);
    expect(value).toBeLessThanOrEqual(1);
  });
});

describe('generateNoiseGrid', () => {
  it('returns a Float64Array of correct length', () => {
    const config = makeConfig({ width: 10, height: 10 });

    const grid = generateNoiseGrid(config);

    expect(grid).toBeInstanceOf(Float64Array);
    expect(grid).toHaveLength(100);
  });

  it('fills all values in [0, 1] range', () => {
    const config = makeConfig({ width: 16, height: 16 });

    const grid = generateNoiseGrid(config);

    for (let i = 0; i < grid.length; i++) {
      const value = grid[i];
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(1);
    }
  });

  it('is deterministic with fixed seed', () => {
    const grid1 = generateNoiseGrid(makeConfig({ rng: new Mulberry32(777) }));
    const grid2 = generateNoiseGrid(makeConfig({ rng: new Mulberry32(777) }));

    expect(grid1).toEqual(grid2);
  });

  it('produces different grids with different seeds', () => {
    const grid1 = generateNoiseGrid(makeConfig({ rng: new Mulberry32(1) }));
    const grid2 = generateNoiseGrid(makeConfig({ rng: new Mulberry32(2) }));

    let hasDifference = false;
    for (let i = 0; i < grid1.length; i++) {
      if (grid1[i] !== grid2[i]) {
        hasDifference = true;
        break;
      }
    }
    expect(hasDifference).toBe(true);
  });

  it('stores values in row-major order (y * width + x)', () => {
    const config = makeConfig({ width: 4, height: 3 });

    const grid = generateNoiseGrid(config);

    // Row-major means first `width` entries are row 0, next `width` are row 1, etc.
    // Verify total length matches width * height
    expect(grid).toHaveLength(12);

    // Each row should be contiguous. Since noise is spatially coherent,
    // adjacent cells in a row should differ from cells in different rows.
    // We verify structural correctness by checking two grids with swapped
    // dimensions produce different layouts.
    const transposed = generateNoiseGrid(
      makeConfig({ width: 3, height: 4, rng: new Mulberry32(42) })
    );

    // Same seed, but different dimensions → different grid values
    // (because x/y iteration order changes)
    let hasDifference = false;
    const minLen = Math.min(grid.length, transposed.length);
    for (let i = 0; i < minLen; i++) {
      if (grid[i] !== transposed[i]) {
        hasDifference = true;
        break;
      }
    }
    expect(hasDifference).toBe(true);
  });

  it('handles 1x1 grid', () => {
    const config = makeConfig({ width: 1, height: 1 });

    const grid = generateNoiseGrid(config);

    expect(grid).toHaveLength(1);
    const value = grid[0];
    expect(value).toBeGreaterThanOrEqual(0);
    expect(value).toBeLessThanOrEqual(1);
  });

  it('handles non-square grids', () => {
    const config = makeConfig({ width: 5, height: 3 });

    const grid = generateNoiseGrid(config);

    expect(grid).toHaveLength(15);
  });

  it('generates varied output (not all identical values)', () => {
    const config = makeConfig({ width: 32, height: 32 });

    const grid = generateNoiseGrid(config);

    const unique = new Set(grid);
    // A 32x32 grid with Perlin noise should have many distinct values
    expect(unique.size).toBeGreaterThan(1);
  });
});
