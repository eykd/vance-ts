import { Mulberry32, type Prng } from '../../../../src/domain/galaxy/prng';

import {
  generateEllipticStarfieldCoords,
  type EllipticStarfieldParams,
} from './elliptic-starfield';

/**
 * Creates default params for testing.
 *
 * @param overrides - partial params to override defaults
 * @returns complete EllipticStarfieldParams
 */
function makeParams(overrides: Partial<EllipticStarfieldParams> = {}): EllipticStarfieldParams {
  return {
    amount: 10,
    center: [0, 0],
    radius: [100, 50],
    turn: 0,
    multiplier: 1,
    rng: new Mulberry32(42),
    ...overrides,
  };
}

describe('EllipticStarfieldParams', () => {
  it('has all required fields', () => {
    const params: EllipticStarfieldParams = {
      amount: 5,
      center: [10, 20],
      radius: [100, 50],
      turn: 0.5,
      multiplier: 2,
      rng: new Mulberry32(1),
    };

    expect(params.amount).toBe(5);
    expect(params.center).toEqual([10, 20]);
    expect(params.radius).toEqual([100, 50]);
    expect(params.turn).toBe(0.5);
    expect(params.multiplier).toBe(2);
    expect(params.rng).toBeDefined();
  });
});

describe('generateEllipticStarfieldCoords', () => {
  it('returns a generator', () => {
    const params = makeParams();

    const gen = generateEllipticStarfieldCoords(params);

    expect(gen[Symbol.iterator]).toBeDefined();
  });

  it('yields the correct number of coordinates', () => {
    const params = makeParams({ amount: 25 });

    const coords = [...generateEllipticStarfieldCoords(params)];

    expect(coords).toHaveLength(25);
  });

  it('yields zero coordinates when amount is 0', () => {
    const params = makeParams({ amount: 0 });

    const coords = [...generateEllipticStarfieldCoords(params)];

    expect(coords).toHaveLength(0);
  });

  it('yields Coordinate objects with x and y properties', () => {
    const params = makeParams({ amount: 5 });

    const coords = [...generateEllipticStarfieldCoords(params)];

    for (const coord of coords) {
      expect(coord).toHaveProperty('x');
      expect(coord).toHaveProperty('y');
      expect(typeof coord.x).toBe('number');
      expect(typeof coord.y).toBe('number');
    }
  });

  it('yields integer coordinates', () => {
    const params = makeParams({ amount: 100 });

    const coords = [...generateEllipticStarfieldCoords(params)];

    for (const coord of coords) {
      expect(Number.isInteger(coord.x)).toBe(true);
      expect(Number.isInteger(coord.y)).toBe(true);
    }
  });

  describe('determinism', () => {
    it('produces identical output with the same seed', () => {
      const params1 = makeParams({ amount: 50, rng: new Mulberry32(999) });
      const params2 = makeParams({ amount: 50, rng: new Mulberry32(999) });

      const coords1 = [...generateEllipticStarfieldCoords(params1)];
      const coords2 = [...generateEllipticStarfieldCoords(params2)];

      expect(coords1).toEqual(coords2);
    });

    it('produces different output with different seeds', () => {
      const params1 = makeParams({ amount: 50, rng: new Mulberry32(111) });
      const params2 = makeParams({ amount: 50, rng: new Mulberry32(222) });

      const coords1 = [...generateEllipticStarfieldCoords(params1)];
      const coords2 = [...generateEllipticStarfieldCoords(params2)];

      expect(coords1).not.toEqual(coords2);
    });
  });

  describe('center-biased distribution', () => {
    it('clusters majority of stars within inner 50% of radius', () => {
      const rx = 200;
      const ry = 200;
      const params = makeParams({
        amount: 1000,
        center: [0, 0],
        radius: [rx, ry],
        multiplier: 1,
        rng: new Mulberry32(42),
      });

      const coords = [...generateEllipticStarfieldCoords(params)];

      // Count stars within inner 50% of the max radius
      const maxRadius = Math.max(rx, ry);
      const innerRadius = maxRadius * 0.5;
      let innerCount = 0;

      for (const coord of coords) {
        const dist = Math.sqrt(coord.x * coord.x + coord.y * coord.y);
        if (dist <= innerRadius) {
          innerCount++;
        }
      }

      // With quadratic bias (r^2), ~75% of stars should fall within inner 50%.
      // For a quadratic distribution P(r <= R) = (R/Rmax)^2 at each fractional distance,
      // but the actual clustering is stronger. We use a conservative threshold.
      const innerFraction = innerCount / coords.length;
      expect(innerFraction).toBeGreaterThan(0.5);
    });
  });

  describe('sin/cos swap', () => {
    it('uses sin for x-coordinate and cos for y-coordinate', () => {
      // Use a mock PRNG that returns predictable values to verify the sin/cos swap.
      // We control degree=90 and insideFactor such that round(insideFactor * r) = r.
      // At degree=90: sin(90°)=1, cos(90°)=0
      // So posX = sin(90°) * rx = rx, posY = cos(90°) * ry = 0
      let callCount = 0;
      const mockRng: Prng = {
        random: jest.fn(() => 0.5),
        randint: jest.fn((min: number, max: number): number => {
          callCount++;
          if (callCount === 1) {
            // degree = 90
            return 90;
          }
          if (callCount === 2) {
            // insideFactor raw = 10000 → insideFactor = (10000/10000)^2 = 1
            return 10000;
          }
          return min + Math.floor((max - min + 1) / 2);
        }),
      };

      const params: EllipticStarfieldParams = {
        amount: 1,
        center: [0, 0],
        radius: [100, 50],
        turn: 0,
        multiplier: 1,
        rng: mockRng,
      };

      const coords = [...generateEllipticStarfieldCoords(params)];

      // sin(90°)=1 → posX = 1 * 100 = 100, cos(90°)≈0 → posY ≈ 0
      expect(coords[0]?.x).toBe(100);
      expect(coords[0]?.y).toBe(0);
    });

    it('confirms swap with degree=0: sin(0)=0 for x, cos(0)=1 for y', () => {
      let callCount = 0;
      const mockRng: Prng = {
        random: jest.fn(() => 0.5),
        randint: jest.fn((_min: number, _max: number): number => {
          callCount++;
          if (callCount === 1) {
            // degree = 0
            return 0;
          }
          if (callCount === 2) {
            // insideFactor raw = 10000 → insideFactor = 1
            return 10000;
          }
          return 0;
        }),
      };

      const params: EllipticStarfieldParams = {
        amount: 1,
        center: [0, 0],
        radius: [100, 50],
        turn: 0,
        multiplier: 1,
        rng: mockRng,
      };

      const coords = [...generateEllipticStarfieldCoords(params)];

      // sin(0°)=0 → posX = 0, cos(0°)=1 → posY = 1 * 50 = 50
      expect(coords[0]?.x).toBe(0);
      expect(coords[0]?.y).toBe(50);
    });
  });

  describe('rounding before trig', () => {
    it('rounds insideFactor * radius before sin/cos multiplication', () => {
      // Use insideFactor that produces non-integer when multiplied by radius,
      // then verify the rounding happens before trig.
      // insideFactor = (5000/10000)^2 = 0.25
      // round(0.25 * 100) = round(25) = 25 (integer, but let's use a case where rounding matters)
      // insideFactor = (7071/10000)^2 ≈ 0.4999
      // round(0.4999 * 100) = round(49.99) = 50
      let callCount = 0;
      const mockRng: Prng = {
        random: jest.fn(() => 0.5),
        randint: jest.fn((_min: number, _max: number): number => {
          callCount++;
          if (callCount === 1) {
            return 90; // degree = 90, sin=1, cos=0
          }
          if (callCount === 2) {
            return 7071; // insideFactor = (7071/10000)^2 ≈ 0.4999
          }
          return 0;
        }),
      };

      const params: EllipticStarfieldParams = {
        amount: 1,
        center: [0, 0],
        radius: [100, 50],
        turn: 0,
        multiplier: 1,
        rng: mockRng,
      };

      const coords = [...generateEllipticStarfieldCoords(params)];

      // insideFactor = (7071/10000)^2 = 0.49998041
      // round(0.49998041 * 100) = round(49.998...) = 50
      // posX = sin(90°) * 50 = 50
      expect(coords[0]?.x).toBe(50);
    });
  });

  describe('turn rotation', () => {
    it('does not rotate when turn is 0', () => {
      let callCount = 0;
      const mockRng: Prng = {
        random: jest.fn(() => 0.5),
        randint: jest.fn((_min: number, _max: number): number => {
          callCount++;
          if (callCount === 1) {
            return 90;
          }
          if (callCount === 2) {
            return 10000;
          }
          return 0;
        }),
      };

      const params: EllipticStarfieldParams = {
        amount: 1,
        center: [0, 0],
        radius: [100, 50],
        turn: 0,
        multiplier: 1,
        rng: mockRng,
      };

      const coords = [...generateEllipticStarfieldCoords(params)];

      // sin(90°)=1 → posX=100, cos(90°)=0 → posY=0, no rotation
      expect(coords[0]?.x).toBe(100);
      expect(coords[0]?.y).toBe(0);
    });

    it('applies 2D rotation when turn is non-zero', () => {
      // With turn = π/2 (90 degrees), rotation matrix:
      // rotX = posX * cos(π/2) - posY * sin(π/2) = posX*0 - posY*1 = -posY
      // rotY = posX * sin(π/2) + posY * cos(π/2) = posX*1 + posY*0 = posX
      // So if posX=100, posY=0: rotX=0, rotY=100
      let callCount = 0;
      const mockRng: Prng = {
        random: jest.fn(() => 0.5),
        randint: jest.fn((_min: number, _max: number): number => {
          callCount++;
          if (callCount === 1) {
            return 90; // degree=90
          }
          if (callCount === 2) {
            return 10000; // insideFactor=1
          }
          return 0;
        }),
      };

      const params: EllipticStarfieldParams = {
        amount: 1,
        center: [0, 0],
        radius: [100, 50],
        turn: Math.PI / 2,
        multiplier: 1,
        rng: mockRng,
      };

      const coords = [...generateEllipticStarfieldCoords(params)];

      // posX=100, posY=0. After π/2 rotation: rotX=0, rotY=100
      expect(coords[0]?.x).toBe(0);
      expect(coords[0]?.y).toBe(100);
    });

    it('applies rotation correctly for arbitrary angle', () => {
      // With turn = π (180 degrees), rotation matrix:
      // rotX = posX * cos(π) - posY * sin(π) = -posX
      // rotY = posX * sin(π) + posY * cos(π) = -posY
      let callCount = 0;
      const mockRng: Prng = {
        random: jest.fn(() => 0.5),
        randint: jest.fn((_min: number, _max: number): number => {
          callCount++;
          if (callCount === 1) {
            return 90;
          }
          if (callCount === 2) {
            return 10000;
          }
          return 0;
        }),
      };

      const params: EllipticStarfieldParams = {
        amount: 1,
        center: [0, 0],
        radius: [100, 50],
        turn: Math.PI,
        multiplier: 1,
        rng: mockRng,
      };

      const coords = [...generateEllipticStarfieldCoords(params)];

      // posX=100, posY=0. After π rotation: rotX=-100, rotY≈0
      expect(coords[0]?.x).toBe(-100);
      expect(coords[0]?.y).toBe(0);
    });
  });

  describe('center offset', () => {
    it('offsets coordinates by the center position', () => {
      let callCount = 0;
      const mockRng: Prng = {
        random: jest.fn(() => 0.5),
        randint: jest.fn((_min: number, _max: number): number => {
          callCount++;
          if (callCount === 1) {
            return 0; // degree=0 → sin=0, cos=1
          }
          if (callCount === 2) {
            return 0; // insideFactor=0 → pos = 0
          }
          return 0;
        }),
      };

      const params: EllipticStarfieldParams = {
        amount: 1,
        center: [50, 30],
        radius: [100, 50],
        turn: 0,
        multiplier: 1,
        rng: mockRng,
      };

      const coords = [...generateEllipticStarfieldCoords(params)];

      // insideFactor = 0, so posX=0, posY=0
      // x = round((50 + 0) * 1) = 50
      // y = round((30 + 0) * 1) = 30
      expect(coords[0]?.x).toBe(50);
      expect(coords[0]?.y).toBe(30);
    });
  });

  describe('multiplier scaling', () => {
    it('scales output coordinates by the multiplier', () => {
      let callCount = 0;
      const mockRng: Prng = {
        random: jest.fn(() => 0.5),
        randint: jest.fn((_min: number, _max: number): number => {
          callCount++;
          if (callCount === 1) {
            return 90; // degree=90
          }
          if (callCount === 2) {
            return 10000; // insideFactor=1
          }
          return 0;
        }),
      };

      const params: EllipticStarfieldParams = {
        amount: 1,
        center: [0, 0],
        radius: [100, 50],
        turn: 0,
        multiplier: 3,
        rng: mockRng,
      };

      const coords = [...generateEllipticStarfieldCoords(params)];

      // posX = sin(90°)*100 = 100, posY = cos(90°)*50 ≈ 0
      // x = round((0 + 100) * 3) = 300
      // y = round((0 + 0) * 3) = 0
      expect(coords[0]?.x).toBe(300);
      expect(coords[0]?.y).toBe(0);
    });
  });

  describe('PRNG state advancement', () => {
    it('advances PRNG state by 2 calls per star (degree + insideFactor)', () => {
      const randintSpy = jest.fn(() => 0);
      const rng: Prng = {
        random: jest.fn(() => 0.5),
        randint: randintSpy,
      };
      const params = makeParams({ amount: 5, rng });

      const _coords = [...generateEllipticStarfieldCoords(params)];

      // Each star calls randint twice: once for degree, once for insideFactor
      expect(randintSpy).toHaveBeenCalledTimes(10);
    });

    it('calls randint with correct arguments for degree', () => {
      const randintSpy = jest.fn(() => 0);
      const rng: Prng = {
        random: jest.fn(() => 0.5),
        randint: randintSpy,
      };
      const params = makeParams({ amount: 1, rng });

      const _coords = [...generateEllipticStarfieldCoords(params)];

      // First call: degree = rng.randint(0, 360)
      expect(randintSpy).toHaveBeenNthCalledWith(1, 0, 360);
    });

    it('calls randint with correct arguments for insideFactor', () => {
      const randintSpy = jest.fn(() => 0);
      const rng: Prng = {
        random: jest.fn(() => 0.5),
        randint: randintSpy,
      };
      const params = makeParams({ amount: 1, rng });

      const _coords = [...generateEllipticStarfieldCoords(params)];

      // Second call: insideFactor = rng.randint(0, 10000)
      expect(randintSpy).toHaveBeenNthCalledWith(2, 0, 10000);
    });
  });

  describe('accepts any Prng implementation', () => {
    it('works with a mock Prng', () => {
      const mockRng: Prng = {
        random: jest.fn(() => 0.5),
        randint: jest.fn(() => 5000),
      };

      const params: EllipticStarfieldParams = {
        amount: 3,
        center: [0, 0],
        radius: [100, 50],
        turn: 0,
        multiplier: 1,
        rng: mockRng,
      };

      const coords = [...generateEllipticStarfieldCoords(params)];

      expect(coords).toHaveLength(3);
    });
  });

  describe('degree to radian conversion', () => {
    it('converts degrees to radians for trig functions', () => {
      // At degree=45: sin(45°)≈0.7071, cos(45°)≈0.7071
      // With insideFactor=1 and rx=ry=100:
      // posX = sin(45°) * 100 ≈ 70.71
      // posY = cos(45°) * 100 ≈ 70.71
      // x = round(70.71) = 71, y = round(70.71) = 71
      let callCount = 0;
      const mockRng: Prng = {
        random: jest.fn(() => 0.5),
        randint: jest.fn((_min: number, _max: number): number => {
          callCount++;
          if (callCount === 1) {
            return 45;
          }
          if (callCount === 2) {
            return 10000;
          }
          return 0;
        }),
      };

      const params: EllipticStarfieldParams = {
        amount: 1,
        center: [0, 0],
        radius: [100, 100],
        turn: 0,
        multiplier: 1,
        rng: mockRng,
      };

      const coords = [...generateEllipticStarfieldCoords(params)];

      // sin(45°) * 100 ≈ 70.71 → round = 71
      // cos(45°) * 100 ≈ 70.71 → round = 71
      expect(coords[0]?.x).toBe(71);
      expect(coords[0]?.y).toBe(71);
    });
  });

  describe('edge cases', () => {
    it('handles amount of 1', () => {
      const params = makeParams({ amount: 1 });

      const coords = [...generateEllipticStarfieldCoords(params)];

      expect(coords).toHaveLength(1);
    });

    it('handles zero radius', () => {
      const params = makeParams({
        amount: 5,
        center: [10, 20],
        radius: [0, 0],
        multiplier: 1,
      });

      const coords = [...generateEllipticStarfieldCoords(params)];

      // All stars should be at center (round(0) = 0 for pos, then offset by center)
      for (const coord of coords) {
        expect(coord.x).toBe(10);
        expect(coord.y).toBe(20);
      }
    });

    it('handles asymmetric radii', () => {
      const params = makeParams({
        amount: 100,
        center: [0, 0],
        radius: [200, 50],
        multiplier: 1,
        rng: new Mulberry32(42),
      });

      const coords = [...generateEllipticStarfieldCoords(params)];

      // Find max extent in each axis — x should reach further than y
      let maxX = 0;
      let maxY = 0;
      for (const coord of coords) {
        maxX = Math.max(maxX, Math.abs(coord.x));
        maxY = Math.max(maxY, Math.abs(coord.y));
      }

      expect(maxX).toBeGreaterThan(maxY);
    });
  });
});
