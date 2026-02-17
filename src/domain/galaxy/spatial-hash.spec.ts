import { SpatialHash } from './spatial-hash';

describe('SpatialHash', () => {
  describe('constructor', () => {
    it('creates an instance with the given cell size and grid width', () => {
      const hash = new SpatialHash(10, 100);

      expect(hash).toBeDefined();
    });
  });

  describe('insert()', () => {
    it('stores a system index at the given coordinates', () => {
      const hash = new SpatialHash(10, 100);

      hash.insert(0, 5, 5);

      const results = hash.queryRadius(5, 5, 1);
      expect(results).toContain(0);
    });

    it('stores multiple systems in the same cell', () => {
      const hash = new SpatialHash(10, 100);

      hash.insert(0, 1, 1);
      hash.insert(1, 2, 2);

      const results = hash.queryRadius(1, 1, 5);
      expect(results).toContain(0);
      expect(results).toContain(1);
    });

    it('stores systems in different cells', () => {
      const hash = new SpatialHash(10, 100);

      hash.insert(0, 5, 5);
      hash.insert(1, 95, 95);

      const nearFirst = hash.queryRadius(5, 5, 1);
      expect(nearFirst).toContain(0);
      expect(nearFirst).not.toContain(1);
    });
  });

  describe('queryRadius()', () => {
    it('returns empty array when no systems are inserted', () => {
      const hash = new SpatialHash(10, 100);

      const results = hash.queryRadius(50, 50, 20);

      expect(results).toEqual([]);
    });

    it('returns systems within the given radius', () => {
      const hash = new SpatialHash(10, 100);

      hash.insert(0, 50, 50);
      hash.insert(1, 55, 50);
      hash.insert(2, 100, 100);

      const results = hash.queryRadius(50, 50, 10);

      expect(results).toContain(0);
      expect(results).toContain(1);
      expect(results).not.toContain(2);
    });

    it('excludes systems outside the radius even if in neighboring cells', () => {
      const hash = new SpatialHash(10, 100);

      // Place a system at cell boundary but far from query point
      hash.insert(0, 0, 0);
      hash.insert(1, 19, 0);

      // Query near index 0 with a small radius
      const results = hash.queryRadius(0, 0, 5);

      expect(results).toContain(0);
      expect(results).not.toContain(1);
    });

    it('checks 9 neighboring cells for border-crossing queries', () => {
      const hash = new SpatialHash(10, 100);

      // Place systems in different cells around a cell corner
      hash.insert(0, 9, 9); // cell (0,0)
      hash.insert(1, 11, 9); // cell (1,0)
      hash.insert(2, 9, 11); // cell (0,1)
      hash.insert(3, 11, 11); // cell (1,1)

      // Query at the corner between cells
      const results = hash.queryRadius(10, 10, 5);

      expect(results).toHaveLength(4);
      expect(results).toContain(0);
      expect(results).toContain(1);
      expect(results).toContain(2);
      expect(results).toContain(3);
    });

    it('uses Euclidean distance for radius check', () => {
      const hash = new SpatialHash(10, 100);

      // Place a system at distance sqrt(2) * 7 ≈ 9.9 from (50, 50)
      hash.insert(0, 57, 57);

      // Radius 10 should include it
      const included = hash.queryRadius(50, 50, 10);
      expect(included).toContain(0);

      // Radius 9 should exclude it (distance ≈ 9.9)
      const excluded = hash.queryRadius(50, 50, 9);
      expect(excluded).not.toContain(0);
    });

    it('handles negative coordinates', () => {
      const hash = new SpatialHash(10, 100);

      hash.insert(0, -5, -5);
      hash.insert(1, -3, -3);

      const results = hash.queryRadius(-5, -5, 5);

      expect(results).toContain(0);
      expect(results).toContain(1);
    });

    it('returns each system at most once', () => {
      const hash = new SpatialHash(10, 100);

      hash.insert(0, 50, 50);

      const results = hash.queryRadius(50, 50, 20);

      expect(results).toEqual([0]);
    });

    it('handles zero radius returning only exact matches', () => {
      const hash = new SpatialHash(10, 100);

      hash.insert(0, 50, 50);
      hash.insert(1, 50, 51);

      const results = hash.queryRadius(50, 50, 0);

      expect(results).toContain(0);
      expect(results).not.toContain(1);
    });

    it('handles large radius covering many cells', () => {
      const hash = new SpatialHash(10, 100);

      hash.insert(0, 10, 10);
      hash.insert(1, 50, 50);
      hash.insert(2, 90, 90);

      const results = hash.queryRadius(50, 50, 200);

      expect(results).toHaveLength(3);
    });
  });

  describe('performance characteristics', () => {
    it('handles dense populations efficiently', () => {
      const hash = new SpatialHash(20, 800);

      // Insert 12000 systems (realistic galaxy size)
      const coords: Array<{ x: number; y: number }> = [];
      for (let i = 0; i < 12000; i++) {
        const x = (i * 17) % 800;
        const y = (i * 31) % 800;
        coords.push({ x, y });
        hash.insert(i, x, y);
      }

      // Query should work correctly
      const results = hash.queryRadius(400, 400, 25);
      const firstCoord = coords[0];
      if (firstCoord === undefined) {
        throw new Error('Coords array is unexpectedly empty');
      }

      // Verify results are actually within radius
      for (const idx of results) {
        const coord = coords[idx];
        if (coord === undefined) {
          throw new Error(`Coord at index ${String(idx)} is undefined`);
        }
        const dx = coord.x - 400;
        const dy = coord.y - 400;
        expect(Math.sqrt(dx * dx + dy * dy)).toBeLessThanOrEqual(25);
      }
    });
  });

  describe('edge cases', () => {
    it('handles cell size of 1', () => {
      const hash = new SpatialHash(1, 10);

      hash.insert(0, 5, 5);
      hash.insert(1, 6, 5);

      const results = hash.queryRadius(5, 5, 1.5);

      expect(results).toContain(0);
      expect(results).toContain(1);
    });

    it('handles fractional coordinates', () => {
      const hash = new SpatialHash(10, 100);

      hash.insert(0, 5.5, 5.5);
      hash.insert(1, 5.7, 5.7);

      const results = hash.queryRadius(5.5, 5.5, 1);

      expect(results).toContain(0);
      expect(results).toContain(1);
    });

    it('handles coordinates at cell boundaries exactly', () => {
      const hash = new SpatialHash(10, 100);

      hash.insert(0, 10, 10); // exactly on cell boundary
      hash.insert(1, 20, 20); // exactly on next boundary

      const results = hash.queryRadius(10, 10, 1);

      expect(results).toContain(0);
      expect(results).not.toContain(1);
    });
  });
});
