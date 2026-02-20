import { Mulberry32 } from '../../../../src/domain/galaxy/prng';

import { generateSystemNames, generateUuid, type NamingResult } from './naming';

describe('generateUuid', () => {
  it('returns a string in UUID v4 format', () => {
    const rng = new Mulberry32(42);
    const uuid = generateUuid(rng);
    const pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
    expect(pattern.test(uuid)).toBe(true);
  });

  it('produces unique IDs across many calls', () => {
    const rng = new Mulberry32(42);
    const ids = new Set<string>();
    for (let i = 0; i < 1000; i++) {
      ids.add(generateUuid(rng));
    }
    expect(ids.size).toBe(1000);
  });

  it('is deterministic with the same seed', () => {
    const id1 = generateUuid(new Mulberry32(42));
    const id2 = generateUuid(new Mulberry32(42));
    expect(id1).toBe(id2);
  });

  it('produces different IDs with different seeds', () => {
    const id1 = generateUuid(new Mulberry32(42));
    const id2 = generateUuid(new Mulberry32(9999));
    expect(id1).not.toBe(id2);
  });

  it('always has version nibble set to 4', () => {
    const rng = new Mulberry32(123);
    for (let i = 0; i < 50; i++) {
      const uuid = generateUuid(rng);
      expect(uuid.charAt(14)).toBe('4');
    }
  });

  it('always has variant bits set to 8, 9, a, or b', () => {
    const rng = new Mulberry32(456);
    for (let i = 0; i < 50; i++) {
      const uuid = generateUuid(rng);
      expect(['8', '9', 'a', 'b']).toContain(uuid.charAt(19));
    }
  });
});

describe('generateSystemNames', () => {
  it('generates the requested number of names', () => {
    const rng = new Mulberry32(42);
    const result = generateSystemNames(100, rng);
    expect(result.names).toHaveLength(100);
  });

  it('generates zero names when count is zero', () => {
    const rng = new Mulberry32(42);
    const result = generateSystemNames(0, rng);
    expect(result.names).toHaveLength(0);
  });

  it('generates one name when count is one', () => {
    const rng = new Mulberry32(42);
    const result = generateSystemNames(1, rng);
    expect(result.names).toHaveLength(1);
  });

  it('generates all unique names', () => {
    const rng = new Mulberry32(42);
    const result = generateSystemNames(1000, rng);
    const unique = new Set(result.names);
    expect(unique.size).toBe(1000);
  });

  it('is deterministic with the same seed', () => {
    const result1 = generateSystemNames(100, new Mulberry32(42));
    const result2 = generateSystemNames(100, new Mulberry32(42));
    expect(result1.names).toEqual(result2.names);
  });

  it('produces different names with different seeds', () => {
    const result1 = generateSystemNames(100, new Mulberry32(42));
    const result2 = generateSystemNames(100, new Mulberry32(9999));
    expect(result1.names).not.toEqual(result2.names);
  });

  it('produces non-empty names with no leading or trailing whitespace', () => {
    const rng = new Mulberry32(42);
    const result = generateSystemNames(200, rng);
    for (const name of result.names) {
      expect(name.length).toBeGreaterThan(0);
      expect(name).toBe(name.trim());
    }
  });

  it('produces names that start with an uppercase letter', () => {
    const rng = new Mulberry32(42);
    const result = generateSystemNames(200, rng);
    for (const name of result.names) {
      expect(name.charAt(0)).toMatch(/[A-Z]/);
    }
  });

  describe('name distribution', () => {
    it('produces approximately 60% single-word names', () => {
      const rng = new Mulberry32(42);
      const result = generateSystemNames(2000, rng);
      const singleWord = result.names.filter((n) => n.split(' ').length === 1);
      const ratio = singleWord.length / 2000;
      expect(ratio).toBeGreaterThanOrEqual(0.5);
      expect(ratio).toBeLessThanOrEqual(0.7);
    });

    it('produces approximately 25% two-word names', () => {
      const rng = new Mulberry32(42);
      const result = generateSystemNames(2000, rng);
      const twoWord = result.names.filter((n) => n.split(' ').length === 2);
      const ratio = twoWord.length / 2000;
      expect(ratio).toBeGreaterThanOrEqual(0.15);
      expect(ratio).toBeLessThanOrEqual(0.35);
    });

    it('produces approximately 15% three-word names', () => {
      const rng = new Mulberry32(42);
      const result = generateSystemNames(2000, rng);
      const threeWord = result.names.filter((n) => n.split(' ').length === 3);
      const ratio = threeWord.length / 2000;
      expect(ratio).toBeGreaterThanOrEqual(0.05);
      expect(ratio).toBeLessThanOrEqual(0.25);
    });
  });

  describe('naming stats', () => {
    it('returns collision count of zero when no collisions occur', () => {
      const rng = new Mulberry32(42);
      const result = generateSystemNames(10, rng);
      expect(result.stats.collisions).toBeGreaterThanOrEqual(0);
    });

    it('returns total count matching requested count', () => {
      const rng = new Mulberry32(42);
      const result = generateSystemNames(500, rng);
      expect(result.stats.total).toBe(500);
    });

    it('returns collision rate as a number', () => {
      const rng = new Mulberry32(42);
      const result = generateSystemNames(100, rng);
      expect(typeof result.stats.collisionRate).toBe('number');
      expect(result.stats.collisionRate).toBeGreaterThanOrEqual(0);
      expect(result.stats.collisionRate).toBeLessThanOrEqual(1);
    });
  });

  describe('Vance-style phoneme quality', () => {
    it('produces names with only alphabetic characters and spaces', () => {
      const rng = new Mulberry32(42);
      const result = generateSystemNames(500, rng);
      for (const name of result.names) {
        expect(name).toMatch(/^[A-Za-z]+( [A-Za-z]+)*$/);
      }
    });

    it('produces single-word names with reasonable length', () => {
      const rng = new Mulberry32(42);
      const result = generateSystemNames(500, rng);
      const singleWord = result.names.filter((n) => n.split(' ').length === 1);
      for (const name of singleWord) {
        expect(name.length).toBeGreaterThanOrEqual(3);
        expect(name.length).toBeLessThanOrEqual(21);
      }
    });
  });

  describe('large scale uniqueness', () => {
    it('generates 12000 unique names without error', () => {
      const rng = new Mulberry32(42);
      const result = generateSystemNames(12000, rng);
      expect(result.names).toHaveLength(12000);
      const unique = new Set(result.names);
      expect(unique.size).toBe(12000);
    });

    it('keeps collision rate below 10% at 12000 names', () => {
      const rng = new Mulberry32(42);
      const result = generateSystemNames(12000, rng);
      expect(result.stats.collisionRate).toBeLessThan(0.1);
    });
  });

  describe('NamingResult interface', () => {
    it('returns the correct interface shape', () => {
      const rng = new Mulberry32(42);
      const result: NamingResult = generateSystemNames(10, rng);
      expect(Array.isArray(result.names)).toBe(true);
      expect(typeof result.stats).toBe('object');
      expect(typeof result.stats.total).toBe('number');
      expect(typeof result.stats.collisions).toBe('number');
      expect(typeof result.stats.collisionRate).toBe('number');
    });
  });
});
