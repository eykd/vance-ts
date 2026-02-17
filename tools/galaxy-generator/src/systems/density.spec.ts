import { calculateDensity, computeEnvironmentPenalty, type DensityConfig } from './density';

/**
 * Creates a default density config for testing.
 *
 * @param overrides - partial config to merge
 * @returns complete DensityConfig
 */
function makeConfig(overrides: Partial<DensityConfig> = {}): DensityConfig {
  return {
    radius: 25,
    gridWidth: 1000,
    ...overrides,
  };
}

describe('computeEnvironmentPenalty', () => {
  it('returns 0 for 0 neighbors', () => {
    expect(computeEnvironmentPenalty(0)).toBe(0);
  });

  it('returns 0 for 1-3 neighbors', () => {
    expect(computeEnvironmentPenalty(1)).toBe(0);
    expect(computeEnvironmentPenalty(2)).toBe(0);
    expect(computeEnvironmentPenalty(3)).toBe(0);
  });

  it('returns -1 for 4-7 neighbors', () => {
    expect(computeEnvironmentPenalty(4)).toBe(-1);
    expect(computeEnvironmentPenalty(5)).toBe(-1);
    expect(computeEnvironmentPenalty(6)).toBe(-1);
    expect(computeEnvironmentPenalty(7)).toBe(-1);
  });

  it('returns -2 for 8-11 neighbors', () => {
    expect(computeEnvironmentPenalty(8)).toBe(-2);
    expect(computeEnvironmentPenalty(9)).toBe(-2);
    expect(computeEnvironmentPenalty(10)).toBe(-2);
    expect(computeEnvironmentPenalty(11)).toBe(-2);
  });

  it('returns -3 for 12-15 neighbors', () => {
    expect(computeEnvironmentPenalty(12)).toBe(-3);
    expect(computeEnvironmentPenalty(13)).toBe(-3);
    expect(computeEnvironmentPenalty(14)).toBe(-3);
    expect(computeEnvironmentPenalty(15)).toBe(-3);
  });

  it('returns -4 for exactly 16 neighbors', () => {
    expect(computeEnvironmentPenalty(16)).toBe(-4);
  });

  it('clamps at -4 for more than 16 neighbors', () => {
    expect(computeEnvironmentPenalty(17)).toBe(-4);
    expect(computeEnvironmentPenalty(20)).toBe(-4);
    expect(computeEnvironmentPenalty(100)).toBe(-4);
  });
});

describe('calculateDensity', () => {
  it('returns an empty array for empty coordinates', () => {
    const result = calculateDensity([], makeConfig());

    expect(result).toEqual([]);
  });

  it('returns neighborCount 0 for a single isolated system', () => {
    const coords = [{ x: 100, y: 100 }];

    const result = calculateDensity(coords, makeConfig());

    expect(result).toHaveLength(1);
    expect(result[0]?.neighborCount).toBe(0);
    expect(result[0]?.environmentPenalty).toBe(0);
  });

  it('excludes the system itself from neighbor count', () => {
    const coords = [{ x: 0, y: 0 }];

    const result = calculateDensity(coords, makeConfig());

    expect(result[0]?.neighborCount).toBe(0);
  });

  it('counts neighbors within radius', () => {
    // Place 3 systems close together (within radius 25)
    const coords = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 0, y: 10 },
    ];

    const result = calculateDensity(coords, makeConfig({ radius: 25 }));

    // Each system should see the other 2 as neighbors
    expect(result[0]?.neighborCount).toBe(2);
    expect(result[1]?.neighborCount).toBe(2);
    expect(result[2]?.neighborCount).toBe(2);
  });

  it('does not count systems beyond radius', () => {
    const coords = [
      { x: 0, y: 0 },
      { x: 100, y: 0 }, // Far away (distance = 100, radius = 25)
    ];

    const result = calculateDensity(coords, makeConfig({ radius: 25 }));

    expect(result[0]?.neighborCount).toBe(0);
    expect(result[1]?.neighborCount).toBe(0);
  });

  it('derives correct environment penalty from neighbor count', () => {
    // Place 5 systems within radius of center system → 4 neighbors → penalty -1
    const coords = [
      { x: 0, y: 0 },
      { x: 5, y: 0 },
      { x: -5, y: 0 },
      { x: 0, y: 5 },
      { x: 0, y: -5 },
    ];

    const result = calculateDensity(coords, makeConfig({ radius: 25 }));

    // Center system has 4 neighbors → penalty -1
    expect(result[0]?.neighborCount).toBe(4);
    expect(result[0]?.environmentPenalty).toBe(-1);
  });

  it('returns DensityData with correct readonly shape', () => {
    const coords = [{ x: 50, y: 50 }];

    const result = calculateDensity(coords, makeConfig());

    expect(result[0]).toEqual({
      neighborCount: 0,
      environmentPenalty: 0,
    });
  });

  it('handles systems at the boundary of radius', () => {
    // Euclidean distance exactly equal to radius should be included
    // (queryRadius uses <= comparison)
    const coords = [
      { x: 0, y: 0 },
      { x: 25, y: 0 }, // distance exactly 25 = radius
    ];

    const result = calculateDensity(coords, makeConfig({ radius: 25 }));

    expect(result[0]?.neighborCount).toBe(1);
    expect(result[1]?.neighborCount).toBe(1);
  });

  it('handles dense cluster producing maximum penalty', () => {
    // Place 17 systems all within radius of each other
    const coords: Array<{ x: number; y: number }> = [];
    for (let i = 0; i < 17; i++) {
      coords.push({ x: i * 2, y: 0 }); // 2 units apart, all within radius 25
    }

    const result = calculateDensity(coords, makeConfig({ radius: 25 }));

    // The center-ish system should have 16 neighbors (all others)
    const centerResult = result[8]; // Middle of the line
    expect(centerResult).toBeDefined();
    expect(centerResult?.neighborCount).toBe(16);
    expect(centerResult?.environmentPenalty).toBe(-4);
  });

  it('uses spatial hash for efficiency (handles many systems)', () => {
    // Generate a grid of 400 systems across a wide area
    const coords: Array<{ x: number; y: number }> = [];
    for (let i = 0; i < 20; i++) {
      for (let j = 0; j < 20; j++) {
        coords.push({ x: i * 50, y: j * 50 }); // 50 apart, radius 25 → no neighbors
      }
    }

    const result = calculateDensity(coords, makeConfig({ radius: 25 }));

    expect(result).toHaveLength(400);
    // All systems are 50 apart with radius 25 → no neighbors
    for (const d of result) {
      expect(d.neighborCount).toBe(0);
      expect(d.environmentPenalty).toBe(0);
    }
  });

  it('sparse outer arms have 0 penalty', () => {
    // Systems widely spaced
    const coords = [
      { x: 0, y: 0 },
      { x: 200, y: 0 },
      { x: 400, y: 0 },
    ];

    const result = calculateDensity(coords, makeConfig({ radius: 25 }));

    for (const d of result) {
      expect(d.environmentPenalty).toBe(0);
    }
  });

  it('moderate density yields -1 to -2 penalty', () => {
    // Place 9 systems in a tight cluster (8 neighbors for center)
    const offsets = [
      [0, 0],
      [5, 0],
      [-5, 0],
      [0, 5],
      [0, -5],
      [5, 5],
      [-5, 5],
      [5, -5],
      [-5, -5],
    ] as const;
    const coords = offsets.map(([x, y]) => ({ x, y }));

    const result = calculateDensity(coords, makeConfig({ radius: 25 }));

    // Center system has 8 neighbors → penalty -2
    expect(result[0]?.neighborCount).toBe(8);
    expect(result[0]?.environmentPenalty).toBe(-2);
  });

  it('uses configurable radius parameter', () => {
    const coords = [
      { x: 0, y: 0 },
      { x: 15, y: 0 },
    ];

    // Radius 10 → distance 15 is outside
    const resultSmall = calculateDensity(coords, makeConfig({ radius: 10 }));
    expect(resultSmall[0]?.neighborCount).toBe(0);

    // Radius 20 → distance 15 is inside
    const resultLarge = calculateDensity(coords, makeConfig({ radius: 20 }));
    expect(resultLarge[0]?.neighborCount).toBe(1);
  });

  it('uses configurable gridWidth parameter', () => {
    const coords = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
    ];

    // Different gridWidths should produce same neighbor counts
    const result1 = calculateDensity(coords, makeConfig({ gridWidth: 500 }));
    const result2 = calculateDensity(coords, makeConfig({ gridWidth: 2000 }));

    expect(result1[0]?.neighborCount).toBe(result2[0]?.neighborCount);
  });

  it('produces results matching DensityData interface', () => {
    const coords = [
      { x: 0, y: 0 },
      { x: 5, y: 0 },
    ];

    const result = calculateDensity(coords, makeConfig());

    for (const d of result) {
      expect(typeof d.neighborCount).toBe('number');
      expect(typeof d.environmentPenalty).toBe('number');
      expect(d.environmentPenalty).toBeLessThanOrEqual(0);
      expect(d.environmentPenalty).toBeGreaterThanOrEqual(-4);
    }
  });

  it('creates internal SpatialHash with cellSize matching radius', () => {
    // This is implicitly tested: if cell size doesn't match radius,
    // the spatial hash may miss neighbors. We test by placing a system
    // just within radius and verifying it's found.
    const coords = [
      { x: 0, y: 0 },
      { x: 24, y: 0 }, // Just under radius of 25
    ];

    const result = calculateDensity(coords, makeConfig({ radius: 25 }));

    expect(result[0]?.neighborCount).toBe(1);
  });
});
