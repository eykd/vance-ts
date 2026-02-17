import { roll4dF, rollNdS } from './dice';
import { Mulberry32, type Prng } from './prng';

describe('roll4dF', () => {
  it('returns a number', () => {
    const rng: Prng = new Mulberry32(42);

    const result = roll4dF(rng);

    expect(typeof result).toBe('number');
  });

  it('returns an integer', () => {
    const rng: Prng = new Mulberry32(42);

    const result = roll4dF(rng);

    expect(Number.isInteger(result)).toBe(true);
  });

  it('returns values in [-4, +4] range', () => {
    const rng: Prng = new Mulberry32(99);

    for (let i = 0; i < 1000; i++) {
      const result = roll4dF(rng);

      expect(result).toBeGreaterThanOrEqual(-4);
      expect(result).toBeLessThanOrEqual(4);
    }
  });

  it('produces all possible values from -4 to +4', () => {
    const rng: Prng = new Mulberry32(123);
    const results = new Set<number>();

    for (let i = 0; i < 10000; i++) {
      results.add(roll4dF(rng));
    }

    for (let v = -4; v <= 4; v++) {
      expect(results.has(v)).toBe(true);
    }
  });

  it('is deterministic with the same seed', () => {
    const rng1: Prng = new Mulberry32(777);
    const rng2: Prng = new Mulberry32(777);
    const seq1 = Array.from({ length: 20 }, () => roll4dF(rng1));
    const seq2 = Array.from({ length: 20 }, () => roll4dF(rng2));

    expect(seq1).toEqual(seq2);
  });

  it('accepts any Prng implementation', () => {
    const mockPrng: Prng = {
      random: jest.fn(() => 0.5),
      randint: jest.fn(() => 0),
    };

    const result = roll4dF(mockPrng);

    expect(typeof result).toBe('number');
  });
});

describe('rollNdS', () => {
  it('returns a number', () => {
    const rng: Prng = new Mulberry32(42);

    const result = rollNdS(rng, 2, 6);

    expect(typeof result).toBe('number');
  });

  it('returns an integer', () => {
    const rng: Prng = new Mulberry32(42);

    const result = rollNdS(rng, 2, 6);

    expect(Number.isInteger(result)).toBe(true);
  });

  it('returns values in [count, count*sides] for 2d6', () => {
    const rng: Prng = new Mulberry32(99);

    for (let i = 0; i < 1000; i++) {
      const result = rollNdS(rng, 2, 6);

      expect(result).toBeGreaterThanOrEqual(2);
      expect(result).toBeLessThanOrEqual(12);
    }
  });

  it('returns values in [count, count*sides] for 1d20', () => {
    const rng: Prng = new Mulberry32(55);

    for (let i = 0; i < 1000; i++) {
      const result = rollNdS(rng, 1, 20);

      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(20);
    }
  });

  it('returns values in [count, count*sides] for 3d8', () => {
    const rng: Prng = new Mulberry32(200);

    for (let i = 0; i < 1000; i++) {
      const result = rollNdS(rng, 3, 8);

      expect(result).toBeGreaterThanOrEqual(3);
      expect(result).toBeLessThanOrEqual(24);
    }
  });

  it('produces all possible values for 2d6', () => {
    const rng: Prng = new Mulberry32(123);
    const results = new Set<number>();

    for (let i = 0; i < 10000; i++) {
      results.add(rollNdS(rng, 2, 6));
    }

    for (let v = 2; v <= 12; v++) {
      expect(results.has(v)).toBe(true);
    }
  });

  it('is deterministic with the same seed', () => {
    const rng1: Prng = new Mulberry32(777);
    const rng2: Prng = new Mulberry32(777);
    const seq1 = Array.from({ length: 20 }, () => rollNdS(rng1, 2, 6));
    const seq2 = Array.from({ length: 20 }, () => rollNdS(rng2, 2, 6));

    expect(seq1).toEqual(seq2);
  });

  it('accepts any Prng implementation', () => {
    const mockPrng: Prng = {
      random: jest.fn(() => 0.5),
      randint: jest.fn((min: number, _max: number) => min),
    };

    const result = rollNdS(mockPrng, 2, 6);

    expect(typeof result).toBe('number');
  });

  it('handles single die (1d6)', () => {
    const rng: Prng = new Mulberry32(42);

    for (let i = 0; i < 100; i++) {
      const result = rollNdS(rng, 1, 6);

      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(6);
    }
  });
});
