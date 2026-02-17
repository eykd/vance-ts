import { Mulberry32, type Prng } from './prng';

describe('Prng interface', () => {
  it('is implemented by Mulberry32', () => {
    const rng: Prng = new Mulberry32(12345);

    expect(rng).toBeDefined();
  });
});

describe('Mulberry32', () => {
  describe('determinism', () => {
    it('produces the same sequence for the same seed', () => {
      const rng1 = new Mulberry32(42);
      const rng2 = new Mulberry32(42);
      const seq1 = Array.from({ length: 10 }, () => rng1.random());
      const seq2 = Array.from({ length: 10 }, () => rng2.random());

      expect(seq1).toEqual(seq2);
    });

    it('produces different sequences for different seeds', () => {
      const rng1 = new Mulberry32(1);
      const rng2 = new Mulberry32(2);
      const val1 = rng1.random();
      const val2 = rng2.random();

      expect(val1).not.toBe(val2);
    });
  });

  describe('random()', () => {
    it('returns floats in [0, 1)', () => {
      const rng = new Mulberry32(99);

      for (let i = 0; i < 1000; i++) {
        const value = rng.random();

        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(1);
      }
    });

    it('returns a number', () => {
      const rng = new Mulberry32(7);
      const value = rng.random();

      expect(typeof value).toBe('number');
    });
  });

  describe('randint()', () => {
    it('returns integers in [min, max] inclusive', () => {
      const rng = new Mulberry32(123);
      const results = new Set<number>();

      for (let i = 0; i < 1000; i++) {
        const value = rng.randint(1, 6);

        expect(Number.isInteger(value)).toBe(true);
        expect(value).toBeGreaterThanOrEqual(1);
        expect(value).toBeLessThanOrEqual(6);
        results.add(value);
      }

      // With 1000 rolls, we should see all values 1-6
      expect(results.size).toBe(6);
    });

    it('returns min when min equals max', () => {
      const rng = new Mulberry32(555);
      const value = rng.randint(5, 5);

      expect(value).toBe(5);
    });

    it('handles negative ranges', () => {
      const rng = new Mulberry32(777);

      for (let i = 0; i < 100; i++) {
        const value = rng.randint(-3, -1);

        expect(value).toBeGreaterThanOrEqual(-3);
        expect(value).toBeLessThanOrEqual(-1);
        expect(Number.isInteger(value)).toBe(true);
      }
    });

    it('handles zero-crossing ranges', () => {
      const rng = new Mulberry32(888);

      for (let i = 0; i < 100; i++) {
        const value = rng.randint(-2, 2);

        expect(value).toBeGreaterThanOrEqual(-2);
        expect(value).toBeLessThanOrEqual(2);
        expect(Number.isInteger(value)).toBe(true);
      }
    });

    it('handles large ranges', () => {
      const rng = new Mulberry32(999);

      for (let i = 0; i < 100; i++) {
        const value = rng.randint(0, 1000000);

        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(1000000);
        expect(Number.isInteger(value)).toBe(true);
      }
    });
  });

  describe('seed handling', () => {
    it('accepts seed of 0', () => {
      const rng = new Mulberry32(0);
      const value = rng.random();

      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    });

    it('accepts large 32-bit seed values', () => {
      const rng = new Mulberry32(0xffffffff);
      const value = rng.random();

      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    });

    it('advances state on each call', () => {
      const rng = new Mulberry32(42);
      const values = Array.from({ length: 5 }, () => rng.random());
      const uniqueValues = new Set(values);

      // All 5 values should be distinct
      expect(uniqueValues.size).toBe(5);
    });
  });
});
