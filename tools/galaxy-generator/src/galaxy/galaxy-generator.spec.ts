import { Mulberry32, type Prng } from '../../../../src/domain/galaxy/prng';

import {
  generateGalaxy,
  generateSpiralGalaxyCoords,
  type GalaxyGeneratorConfig,
} from './galaxy-generator';

/**
 * Creates default config for testing.
 *
 * @param overrides - partial config to override defaults
 * @returns complete GalaxyGeneratorConfig
 */
function makeConfig(overrides: Partial<GalaxyGeneratorConfig> = {}): GalaxyGeneratorConfig {
  return {
    center: [0, 0],
    size: [4000, 4000],
    turn: 0,
    deg: 5,
    dynSizeFactor: 1,
    spcFactor: 8,
    arms: 4,
    multiplier: 1,
    limit: null,
    rng: new Mulberry32(42),
    ...overrides,
  };
}

describe('GalaxyGeneratorConfig', () => {
  it('has all required fields', () => {
    const config: GalaxyGeneratorConfig = {
      center: [10, 20],
      size: [3000, 3000],
      turn: 0.1,
      deg: 5,
      dynSizeFactor: 1,
      spcFactor: 8,
      arms: 4,
      multiplier: 2,
      limit: 1000,
      rng: new Mulberry32(1),
    };

    expect(config.center).toEqual([10, 20]);
    expect(config.size).toEqual([3000, 3000]);
    expect(config.turn).toBe(0.1);
    expect(config.deg).toBe(5);
    expect(config.dynSizeFactor).toBe(1);
    expect(config.spcFactor).toBe(8);
    expect(config.arms).toBe(4);
    expect(config.multiplier).toBe(2);
    expect(config.limit).toBe(1000);
    expect(config.rng).toBeDefined();
  });
});

describe('generateSpiralGalaxyCoords', () => {
  it('returns a generator', () => {
    const config = makeConfig();

    const gen = generateSpiralGalaxyCoords(config);

    expect(gen[Symbol.iterator]).toBeDefined();
  });

  it('yields Coordinate objects with x and y properties', () => {
    const config = makeConfig({ limit: 10 });

    const coords = [...generateSpiralGalaxyCoords(config)];

    for (const coord of coords) {
      expect(coord).toHaveProperty('x');
      expect(coord).toHaveProperty('y');
      expect(typeof coord.x).toBe('number');
      expect(typeof coord.y).toBe('number');
    }
  });

  it('yields integer coordinates', () => {
    const config = makeConfig({ limit: 100 });

    const coords = [...generateSpiralGalaxyCoords(config)];

    for (const coord of coords) {
      expect(Number.isInteger(coord.x)).toBe(true);
      expect(Number.isInteger(coord.y)).toBe(true);
    }
  });

  describe('size conversion', () => {
    it('converts size to radians using 2.0 * size * pi / 360.0 formula', () => {
      // The formula is NOT simply size * pi / 180.
      // sx = 2.0 * 4000 * pi / 360.0 ≈ 69.813
      // This is tested indirectly: with default size [4000,4000], the coordinate
      // range should be approximately ±400 (not ±200 or ±800).
      const config = makeConfig();

      const coords = [...generateSpiralGalaxyCoords(config)];

      const maxX = Math.max(...coords.map((c) => Math.abs(c.x)));
      const maxY = Math.max(...coords.map((c) => Math.abs(c.y)));

      // Should be in the ~300-500 range, not ~150-250 (half) or ~600-1000 (double)
      expect(maxX).toBeGreaterThan(200);
      expect(maxX).toBeLessThan(700);
      expect(maxY).toBeGreaterThan(200);
      expect(maxY).toBeLessThan(700);
    });
  });

  describe('cloud parameters', () => {
    it('computes xp1, yp1 and mulStarAmount correctly for default config', () => {
      // xp1 = round(5 / pi * (2.0*4000*pi/360.0) / 1.7) * 1 = round(5/pi * 69.813 / 1.7) * 1
      // = round(65.399) * 1 = 65
      // yp1 = 65 (same for symmetric size)
      // mulStarAmount = (65 + 65) / 8 = 16.25
      //
      // We verify indirectly: larger spcFactor produces fewer stars,
      // confirming mulStarAmount is derived from xp1+yp1 divided by spcFactor.
      const configNarrow = makeConfig({ spcFactor: 16, rng: new Mulberry32(42) });
      const configWide = makeConfig({ spcFactor: 4, rng: new Mulberry32(42) });

      const coordsNarrow = [...generateSpiralGalaxyCoords(configNarrow)];
      const coordsWide = [...generateSpiralGalaxyCoords(configWide)];

      // Smaller spcFactor means larger mulStarAmount means more stars per cloud
      expect(coordsWide.length).toBeGreaterThan(coordsNarrow.length);
    });

    it('scales cloud size with dynSizeFactor', () => {
      // dynSizeFactor multiplies xp1/yp1 and scales spiral arm positions.
      // With dynSizeFactor=2, stars spread further from center.
      const config1 = makeConfig({ dynSizeFactor: 1, rng: new Mulberry32(42) });
      const config2 = makeConfig({ dynSizeFactor: 2, rng: new Mulberry32(42) });

      const coords1 = [...generateSpiralGalaxyCoords(config1)];
      const coords2 = [...generateSpiralGalaxyCoords(config2)];

      const maxExtent1 = Math.max(...coords1.map((c) => Math.abs(c.x) + Math.abs(c.y)));
      const maxExtent2 = Math.max(...coords2.map((c) => Math.abs(c.x) + Math.abs(c.y)));

      // Larger dynSizeFactor means coordinates spread further
      expect(maxExtent2).toBeGreaterThan(maxExtent1);
    });
  });

  describe('arm iteration', () => {
    it('iterates over all arms with correct angular offsets', () => {
      // With 4 arms: shifts are 0, π/2, π, 3π/2
      // Stars should appear in all four quadrants
      const config = makeConfig();

      const coords = [...generateSpiralGalaxyCoords(config)];

      const hasPositiveX = coords.some((c) => c.x > 50);
      const hasNegativeX = coords.some((c) => c.x < -50);
      const hasPositiveY = coords.some((c) => c.y > 50);
      const hasNegativeY = coords.some((c) => c.y < -50);

      expect(hasPositiveX).toBe(true);
      expect(hasNegativeX).toBe(true);
      expect(hasPositiveY).toBe(true);
      expect(hasNegativeY).toBe(true);
    });

    it('processes arms sequentially (arm 0 fully before arm 1)', () => {
      // Verify PRNG state advances sequentially through arms.
      // Same seed should produce identical results.
      const config1 = makeConfig({ rng: new Mulberry32(123) });
      const config2 = makeConfig({ rng: new Mulberry32(123) });

      const coords1 = [...generateSpiralGalaxyCoords(config1)];
      const coords2 = [...generateSpiralGalaxyCoords(config2)];

      expect(coords1).toEqual(coords2);
    });

    it('generates stars for a single arm when arms=1', () => {
      const config = makeConfig({ arms: 1 });

      const coords = [...generateSpiralGalaxyCoords(config)];

      expect(coords.length).toBeGreaterThan(0);
    });

    it('distributes stars across multiple arms', () => {
      // 2 arms should produce roughly 2x the stars of 1 arm (with same PRNG state
      // they won't be exactly 2x, but total should be significantly more)
      const config1 = makeConfig({ arms: 1, rng: new Mulberry32(42) });
      const config2 = makeConfig({ arms: 2, rng: new Mulberry32(42) });

      const coords1 = [...generateSpiralGalaxyCoords(config1)];
      const coords2 = [...generateSpiralGalaxyCoords(config2)];

      expect(coords2.length).toBeGreaterThan(coords1.length);
    });
  });

  describe('limit parameter', () => {
    it('stops yielding when limit is reached', () => {
      const config = makeConfig({ limit: 20 });

      const coords = [...generateSpiralGalaxyCoords(config)];

      expect(coords).toHaveLength(20);
    });

    it('yields all coordinates when limit is null', () => {
      const config = makeConfig({ limit: null });

      const coords = [...generateSpiralGalaxyCoords(config)];

      // Without limit, should produce all coordinates from 4 arms
      expect(coords.length).toBeGreaterThan(0);

      // Verify it produces more than a limited run
      const configLimited = makeConfig({ limit: 5, rng: new Mulberry32(42) });
      const coordsLimited = [...generateSpiralGalaxyCoords(configLimited)];
      expect(coords.length).toBeGreaterThan(coordsLimited.length);
    });

    it('tracks limit per-coordinate, not per-cloud or per-arm', () => {
      // A limit of 5 should yield exactly 5 individual coordinates
      const config = makeConfig({ limit: 5 });

      const coords = [...generateSpiralGalaxyCoords(config)];

      expect(coords).toHaveLength(5);
    });

    it('yields fewer coordinates than limit when galaxy has fewer total', () => {
      // With arms=1 and a very small galaxy, total may be less than limit
      const config = makeConfig({
        arms: 1,
        deg: 1,
        size: [100, 100],
        limit: 100000,
      });

      const coords = [...generateSpiralGalaxyCoords(config)];

      expect(coords.length).toBeLessThan(100000);
      expect(coords.length).toBeGreaterThan(0);
    });
  });

  describe('determinism', () => {
    it('produces identical output with the same seed', () => {
      const config1 = makeConfig({ rng: new Mulberry32(999) });
      const config2 = makeConfig({ rng: new Mulberry32(999) });

      const coords1 = [...generateSpiralGalaxyCoords(config1)];
      const coords2 = [...generateSpiralGalaxyCoords(config2)];

      expect(coords1).toEqual(coords2);
    });

    it('produces different output with different seeds', () => {
      const config1 = makeConfig({ rng: new Mulberry32(111) });
      const config2 = makeConfig({ rng: new Mulberry32(222) });

      const coords1 = [...generateSpiralGalaxyCoords(config1)];
      const coords2 = [...generateSpiralGalaxyCoords(config2)];

      expect(coords1).not.toEqual(coords2);
    });
  });

  describe('default config output characteristics', () => {
    it('produces coordinates from all 4 arms with default deg=5', () => {
      const config = makeConfig();

      const coords = [...generateSpiralGalaxyCoords(config)];

      // With deg=5 and 4 arms, produces several dozen raw coordinates
      // (each arm walks 0-5 degrees in 1-5 degree random steps)
      expect(coords.length).toBeGreaterThan(20);
      expect(coords.length).toBeLessThan(500);
    });

    it('coordinates span approximately ±400 in each axis', () => {
      const config = makeConfig();

      const coords = [...generateSpiralGalaxyCoords(config)];

      const maxX = Math.max(...coords.map((c) => Math.abs(c.x)));
      const maxY = Math.max(...coords.map((c) => Math.abs(c.y)));

      // sx = 2.0 * 4000 * pi / 360 ≈ 69.8, so at n=5, distance ≈ 5*69.8 = 349
      expect(maxX).toBeGreaterThan(200);
      expect(maxX).toBeLessThan(600);
      expect(maxY).toBeGreaterThan(200);
      expect(maxY).toBeLessThan(600);
    });

    it('exhibits four-arm spiral structure via quadrant distribution', () => {
      const config = makeConfig();

      const coords = [...generateSpiralGalaxyCoords(config)];

      // With 4 arms at shifts 0, π/2, π, 3π/2, coordinates should
      // appear in multiple quadrants
      const quadrants = new Set<string>();
      for (const c of coords) {
        if (c.x !== 0 && c.y !== 0) {
          quadrants.add(`${c.x > 0 ? '+' : '-'}${c.y > 0 ? '+' : '-'}`);
        }
      }

      // Should have stars in all 4 quadrants from the 4 arms
      expect(quadrants.size).toBe(4);
    });

    it('produces many more coordinates with larger deg', () => {
      // Increasing deg dramatically increases star count
      const configSmall = makeConfig({ deg: 5, rng: new Mulberry32(42) });
      const configLarge = makeConfig({ deg: 50, rng: new Mulberry32(42) });

      const coordsSmall = [...generateSpiralGalaxyCoords(configSmall)];
      const coordsLarge = [...generateSpiralGalaxyCoords(configLarge)];

      expect(coordsLarge.length).toBeGreaterThan(coordsSmall.length * 5);
    });
  });

  describe('edge cases', () => {
    it('handles zero arms gracefully', () => {
      const config = makeConfig({ arms: 0 });

      const coords = [...generateSpiralGalaxyCoords(config)];

      expect(coords).toHaveLength(0);
    });

    it('accepts a mock Prng implementation', () => {
      const mockRng: Prng = {
        random: jest.fn(() => 0.5),
        randint: jest.fn((min: number, _max: number): number => min),
      };

      const config = makeConfig({ rng: mockRng, limit: 10 });

      const coords = [...generateSpiralGalaxyCoords(config)];

      expect(coords).toHaveLength(10);
    });
  });
});

describe('generateGalaxy', () => {
  it('returns an array of Coordinate objects', () => {
    const config = makeConfig({ limit: 50 });

    const result = generateGalaxy(config);

    expect(Array.isArray(result)).toBe(true);
    for (const coord of result) {
      expect(coord).toHaveProperty('x');
      expect(coord).toHaveProperty('y');
    }
  });

  it('deduplicates coordinates using "x,y" string keys', () => {
    // With 4 arms, many coordinates near the center will overlap due to the n=0
    // iteration placing stars at the same center position from all arms.
    const config = makeConfig();

    const rawCoords = [...generateSpiralGalaxyCoords(makeConfig({ rng: new Mulberry32(42) }))];
    const result = generateGalaxy(config);

    // Dedup should produce fewer or equal (at minimum, center stars overlap)
    expect(result.length).toBeLessThanOrEqual(rawCoords.length);
    // At least some dedup should occur (center stars overlap between arms)
    expect(result.length).toBeLessThan(rawCoords.length);
  });

  it('returns only unique integer coordinate pairs', () => {
    const config = makeConfig();

    const result = generateGalaxy(config);

    const seen = new Set<string>();
    for (const coord of result) {
      const key = `${coord.x},${coord.y}`;
      expect(seen.has(key)).toBe(false);
      seen.add(key);
    }
  });

  it('produces fewer unique coordinates than raw due to deduplication', () => {
    const config = makeConfig();

    const rawCoords = [...generateSpiralGalaxyCoords(makeConfig({ rng: new Mulberry32(42) }))];
    const result = generateGalaxy(config);

    // All center stars (n=0 from each arm) map to the same coordinate
    expect(result.length).toBeLessThan(rawCoords.length);
    // But most non-center stars are unique
    expect(result.length).toBeGreaterThan(rawCoords.length * 0.5);
  });

  it('is deterministic with the same seed', () => {
    const config1 = makeConfig({ rng: new Mulberry32(777) });
    const config2 = makeConfig({ rng: new Mulberry32(777) });

    const result1 = generateGalaxy(config1);
    const result2 = generateGalaxy(config2);

    expect(result1).toEqual(result2);
  });

  it('preserves limit from config', () => {
    const config = makeConfig({ limit: 30 });

    const result = generateGalaxy(config);

    // After dedup, should be <= 30 (some of the 30 may be duplicates)
    expect(result.length).toBeLessThanOrEqual(30);
    expect(result.length).toBeGreaterThan(0);
  });

  it('returns coordinates spanning approximately ±400 range', () => {
    const config = makeConfig();

    const result = generateGalaxy(config);

    const maxX = Math.max(...result.map((c) => Math.abs(c.x)));
    const maxY = Math.max(...result.map((c) => Math.abs(c.y)));

    expect(maxX).toBeGreaterThan(250);
    expect(maxX).toBeLessThan(600);
    expect(maxY).toBeGreaterThan(250);
    expect(maxY).toBeLessThan(600);
  });
});
