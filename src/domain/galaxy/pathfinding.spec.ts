import { BinaryHeap, createPathfinder } from './pathfinding';
import type { Coordinate, CostMapQuantization } from './types';

// ─── Helpers ───────────────────────────────────────────────────────────────

/**
 * Creates a flat cost map from a 2D array (row-major).
 *
 * @param grid - 2D array of cost byte values
 * @returns Cost map data, dimensions, and quantization params
 */
function makeCostMap(grid: number[][]): {
  data: Uint8Array;
  width: number;
  height: number;
  quantization: CostMapQuantization;
} {
  const height = grid.length;
  const width = grid[0]?.length ?? 0;
  const data = new Uint8Array(width * height);
  for (let y = 0; y < height; y++) {
    const row = grid[y];
    if (row === undefined) {
      continue;
    }
    for (let x = 0; x < width; x++) {
      const val = row[x];
      data[y * width + x] = val ?? 0;
    }
  }
  return {
    data,
    width,
    height,
    quantization: {
      minCost: 1,
      maxCost: 255,
      gridOriginX: 0,
      gridOriginY: 0,
      gridWidth: width,
      gridHeight: height,
    },
  };
}

// ─── BinaryHeap ────────────────────────────────────────────────────────────

describe('BinaryHeap', () => {
  describe('constructor', () => {
    it('creates an empty heap', () => {
      const heap = new BinaryHeap();

      expect(heap.size).toBe(0);
    });
  });

  describe('push()', () => {
    it('adds an element to the heap', () => {
      const heap = new BinaryHeap();

      heap.push(42, 1.0);

      expect(heap.size).toBe(1);
    });

    it('maintains min-heap property after multiple pushes', () => {
      const heap = new BinaryHeap();

      heap.push(3, 3.0);
      heap.push(1, 1.0);
      heap.push(2, 2.0);

      expect(heap.pop()).toBe(1);
      expect(heap.pop()).toBe(2);
      expect(heap.pop()).toBe(3);
    });
  });

  describe('pop()', () => {
    it('returns -1 when heap is empty', () => {
      const heap = new BinaryHeap();

      expect(heap.pop()).toBe(-1);
    });

    it('extracts the minimum priority element', () => {
      const heap = new BinaryHeap();
      heap.push(10, 5.0);
      heap.push(20, 1.0);
      heap.push(30, 3.0);

      expect(heap.pop()).toBe(20);
    });

    it('decrements size after pop', () => {
      const heap = new BinaryHeap();
      heap.push(1, 1.0);
      heap.push(2, 2.0);

      heap.pop();

      expect(heap.size).toBe(1);
    });

    it('returns elements in priority order', () => {
      const heap = new BinaryHeap();
      heap.push(5, 50.0);
      heap.push(4, 40.0);
      heap.push(3, 30.0);
      heap.push(2, 20.0);
      heap.push(1, 10.0);

      const order: number[] = [];
      while (heap.size > 0) {
        order.push(heap.pop());
      }

      expect(order).toEqual([1, 2, 3, 4, 5]);
    });

    it('handles duplicate priorities correctly', () => {
      const heap = new BinaryHeap();
      heap.push(1, 5.0);
      heap.push(2, 5.0);
      heap.push(3, 5.0);

      const results: number[] = [];
      while (heap.size > 0) {
        results.push(heap.pop());
      }

      expect(results).toHaveLength(3);
      expect(results.sort()).toEqual([1, 2, 3]);
    });
  });

  describe('size', () => {
    it('returns 0 for empty heap', () => {
      const heap = new BinaryHeap();

      expect(heap.size).toBe(0);
    });

    it('tracks insertions', () => {
      const heap = new BinaryHeap();

      heap.push(1, 1.0);
      heap.push(2, 2.0);
      heap.push(3, 3.0);

      expect(heap.size).toBe(3);
    });

    it('tracks removals', () => {
      const heap = new BinaryHeap();
      heap.push(1, 1.0);
      heap.push(2, 2.0);

      heap.pop();

      expect(heap.size).toBe(1);
    });
  });

  describe('stress test', () => {
    it('maintains heap property with many elements', () => {
      const heap = new BinaryHeap();
      const count = 1000;

      for (let i = count - 1; i >= 0; i--) {
        heap.push(i, i);
      }

      let prev = -Infinity;
      for (let i = 0; i < count; i++) {
        const val = heap.pop();
        expect(val).toBeGreaterThanOrEqual(prev);
        prev = val;
      }
    });
  });
});

// ─── createPathfinder ──────────────────────────────────────────────────────

describe('createPathfinder', () => {
  describe('findPath()', () => {
    it('returns a direct path between adjacent cells', () => {
      const { data, width, height, quantization } = makeCostMap([
        [10, 10],
        [10, 10],
      ]);
      const pathfinder = createPathfinder(data, width, height, quantization);
      const start: Coordinate = { x: 0, y: 0 };
      const end: Coordinate = { x: 1, y: 0 };

      const result = pathfinder.findPath(start, end);

      expect(result).not.toBeNull();
      expect(result?.path).toHaveLength(2);
      expect(result?.path[0]).toEqual({ x: 0, y: 0 });
      expect(result?.path[1]).toEqual({ x: 1, y: 0 });
    });

    it('returns null when start is out of bounds', () => {
      const { data, width, height, quantization } = makeCostMap([
        [10, 10],
        [10, 10],
      ]);
      const pathfinder = createPathfinder(data, width, height, quantization);

      const result = pathfinder.findPath({ x: -1, y: 0 }, { x: 1, y: 0 });

      expect(result).toBeNull();
    });

    it('returns null when end is out of bounds', () => {
      const { data, width, height, quantization } = makeCostMap([
        [10, 10],
        [10, 10],
      ]);
      const pathfinder = createPathfinder(data, width, height, quantization);

      const result = pathfinder.findPath({ x: 0, y: 0 }, { x: 5, y: 0 });

      expect(result).toBeNull();
    });

    it('returns zero-cost path when start equals end', () => {
      const { data, width, height, quantization } = makeCostMap([
        [10, 10],
        [10, 10],
      ]);
      const pathfinder = createPathfinder(data, width, height, quantization);

      const result = pathfinder.findPath({ x: 0, y: 0 }, { x: 0, y: 0 });

      expect(result).not.toBeNull();
      expect(result?.path).toEqual([{ x: 0, y: 0 }]);
      expect(result?.totalCost).toBe(0);
    });

    it('finds optimal path through uniform cost map', () => {
      // 5x5 uniform map — shortest path is diagonal
      const row = [10, 10, 10, 10, 10];
      const { data, width, height, quantization } = makeCostMap([row, row, row, row, row]);
      const pathfinder = createPathfinder(data, width, height, quantization);

      const result = pathfinder.findPath({ x: 0, y: 0 }, { x: 4, y: 4 });

      expect(result).not.toBeNull();
      // Path exists and connects start to end
      expect(result?.path[0]).toEqual({ x: 0, y: 0 });
      expect(result?.path[result.path.length - 1]).toEqual({ x: 4, y: 4 });
      // Path should be reasonably short (diagonal moves)
      expect(result?.path.length).toBeLessThanOrEqual(6);
    });

    it('routes around high-cost obstacles', () => {
      // Wall of 255 in column 2, except row 0 has gap
      const { data, width, height, quantization } = makeCostMap([
        [1, 1, 1, 1, 1],
        [1, 1, 255, 1, 1],
        [1, 1, 255, 1, 1],
        [1, 1, 255, 1, 1],
        [1, 1, 255, 1, 1],
      ]);
      const pathfinder = createPathfinder(data, width, height, quantization);

      const result = pathfinder.findPath({ x: 0, y: 2 }, { x: 4, y: 2 });

      expect(result).not.toBeNull();
      // Should avoid the wall by going through the gap at row 0
      const passesThrough255 = result?.path.some((c) => c.x === 2 && c.y >= 1);
      expect(passesThrough255).toBe(false);
    });

    it('uses diagonal movement with sqrt(2) cost factor', () => {
      const { data, width, height, quantization } = makeCostMap([
        [10, 10, 10],
        [10, 10, 10],
        [10, 10, 10],
      ]);
      const pathfinder = createPathfinder(data, width, height, quantization);

      // Cardinal move: (0,0) → (1,0) — cost should be based on destination cell
      const cardinalResult = pathfinder.findPath({ x: 0, y: 0 }, { x: 1, y: 0 });
      // Diagonal move: (0,0) → (1,1)
      const diagonalResult = pathfinder.findPath({ x: 0, y: 0 }, { x: 1, y: 1 });

      expect(cardinalResult).not.toBeNull();
      expect(diagonalResult).not.toBeNull();
      // Diagonal cost should be approximately sqrt(2) × cardinal cost
      if (cardinalResult !== null && diagonalResult !== null) {
        const ratio = diagonalResult.totalCost / cardinalResult.totalCost;
        expect(ratio).toBeCloseTo(Math.SQRT2, 1);
      }
    });

    it('returns null when no path exists (fully blocked)', () => {
      // Wall completely separating left from right
      const { data, width, height, quantization } = makeCostMap([
        [1, 255, 1],
        [1, 255, 1],
        [1, 255, 1],
      ]);
      // Use quantization where 255 maps to a very high cost
      const q: CostMapQuantization = {
        ...quantization,
        minCost: 1,
        maxCost: 255,
      };
      const pathfinder = createPathfinder(data, width, height, q, {
        maxCost: 10,
      });

      const result = pathfinder.findPath({ x: 0, y: 0 }, { x: 2, y: 0 });

      expect(result).toBeNull();
    });

    it('terminates early when cost exceeds maxCost', () => {
      // Long path with moderate costs
      const row = [10, 10, 10, 10, 10, 10, 10, 10, 10, 10];
      const { data, width, height, quantization } = makeCostMap([
        row,
        row,
        row,
        row,
        row,
        row,
        row,
        row,
        row,
        row,
      ]);
      // Set a very low maxCost so A* gives up
      const pathfinder = createPathfinder(data, width, height, quantization, {
        maxCost: 5,
      });

      const result = pathfinder.findPath({ x: 0, y: 0 }, { x: 9, y: 9 });

      expect(result).toBeNull();
    });

    it('reconstructs path in correct order from start to end', () => {
      const { data, width, height, quantization } = makeCostMap([
        [1, 1, 1, 1],
        [1, 255, 255, 1],
        [1, 1, 1, 1],
      ]);
      const pathfinder = createPathfinder(data, width, height, quantization);

      const result = pathfinder.findPath({ x: 0, y: 0 }, { x: 3, y: 0 });

      expect(result).not.toBeNull();
      if (result !== null) {
        // First element is start, last is end
        expect(result.path[0]).toEqual({ x: 0, y: 0 });
        expect(result.path[result.path.length - 1]).toEqual({ x: 3, y: 0 });
        // Each step is adjacent (cardinal or diagonal)
        for (let i = 1; i < result.path.length; i++) {
          const prev = result.path[i - 1];
          const curr = result.path[i];
          if (prev !== undefined && curr !== undefined) {
            const dx = Math.abs(curr.x - prev.x);
            const dy = Math.abs(curr.y - prev.y);
            expect(dx).toBeLessThanOrEqual(1);
            expect(dy).toBeLessThanOrEqual(1);
            expect(dx + dy).toBeGreaterThan(0);
          }
        }
      }
    });

    it('chooses cheaper cardinal path over expensive diagonal', () => {
      // Make the diagonal neighbor very expensive
      const { data, width, height, quantization } = makeCostMap([
        [1, 1],
        [1, 200],
      ]);
      const pathfinder = createPathfinder(data, width, height, quantization);

      // From (0,0) to (1,1): diagonal through 200 or cardinal through 1,1
      const result = pathfinder.findPath({ x: 0, y: 0 }, { x: 1, y: 1 });

      expect(result).not.toBeNull();
      if (result !== null) {
        // Should prefer the 2-cardinal-step path through low-cost cells
        // rather than 1 diagonal step through cost-200 cell
        expect(result.path.length).toBe(3);
      }
    });

    it('applies cost quantization from minCost to maxCost', () => {
      // Byte value 0 maps to minCost, 255 maps to maxCost
      const q: CostMapQuantization = {
        minCost: 10,
        maxCost: 100,
        gridOriginX: 0,
        gridOriginY: 0,
        gridWidth: 3,
        gridHeight: 1,
      };
      const data = new Uint8Array([0, 128, 255]);
      const pathfinder = createPathfinder(data, 3, 1, q);

      // (0,0) → (1,0): cost of cell(1,0) with byte 128
      const result = pathfinder.findPath({ x: 0, y: 0 }, { x: 2, y: 0 });

      expect(result).not.toBeNull();
      // Total cost = quantized(128) + quantized(255)
      // quantized(v) = minCost + (v / 255) * (maxCost - minCost)
      // quantized(128) ≈ 10 + (128/255) * 90 ≈ 55.18
      // quantized(255) = 100
      // Total ≈ 55.18 + 100 = 155.18
      expect(result?.totalCost).toBeCloseTo(10 + (128 / 255) * 90 + 100, 0);
    });

    it('handles 1x1 grid with start equals end', () => {
      const { data, width, height, quantization } = makeCostMap([[42]]);
      const pathfinder = createPathfinder(data, width, height, quantization);

      const result = pathfinder.findPath({ x: 0, y: 0 }, { x: 0, y: 0 });

      expect(result).not.toBeNull();
      expect(result?.path).toEqual([{ x: 0, y: 0 }]);
      expect(result?.totalCost).toBe(0);
    });

    it('finds path on large grid efficiently', () => {
      const size = 100;
      const row = new Array<number>(size).fill(10);
      const grid = new Array<number[]>(size).fill(row);
      const { data, width, height, quantization } = makeCostMap(grid);
      const pathfinder = createPathfinder(data, width, height, quantization);

      const t0 = Date.now();
      const result = pathfinder.findPath({ x: 0, y: 0 }, { x: size - 1, y: size - 1 });
      const elapsed = Date.now() - t0;

      expect(result).not.toBeNull();
      expect(elapsed).toBeLessThan(1000); // Should complete well under 1 second
    });

    it('finds 8-directional neighbors (all 8 directions work)', () => {
      // 3x3 grid, start in center, all neighbors reachable
      const { data, width, height, quantization } = makeCostMap([
        [1, 1, 1],
        [1, 1, 1],
        [1, 1, 1],
      ]);
      const pathfinder = createPathfinder(data, width, height, quantization);
      const center: Coordinate = { x: 1, y: 1 };

      // All 8 directions from center
      const directions: Coordinate[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 0, y: 1 },
        { x: 2, y: 1 },
        { x: 0, y: 2 },
        { x: 1, y: 2 },
        { x: 2, y: 2 },
      ];

      for (const dir of directions) {
        const result = pathfinder.findPath(center, dir);
        expect(result).not.toBeNull();
        expect(result?.path).toHaveLength(2);
      }
    });

    it('handles grid origin offset in quantization', () => {
      const q: CostMapQuantization = {
        minCost: 1,
        maxCost: 255,
        gridOriginX: 10,
        gridOriginY: 20,
        gridWidth: 3,
        gridHeight: 3,
      };
      const data = new Uint8Array(9).fill(10);
      const pathfinder = createPathfinder(data, 3, 3, q);

      // Coordinates should be relative to grid origin
      const result = pathfinder.findPath({ x: 10, y: 20 }, { x: 12, y: 22 });

      expect(result).not.toBeNull();
      expect(result?.path[0]).toEqual({ x: 10, y: 20 });
      expect(result?.path[result.path.length - 1]).toEqual({ x: 12, y: 22 });
    });

    it('returns null when start coordinate is outside grid origin bounds', () => {
      const q: CostMapQuantization = {
        minCost: 1,
        maxCost: 255,
        gridOriginX: 10,
        gridOriginY: 20,
        gridWidth: 3,
        gridHeight: 3,
      };
      const data = new Uint8Array(9).fill(10);
      const pathfinder = createPathfinder(data, 3, 3, q);

      const result = pathfinder.findPath({ x: 0, y: 0 }, { x: 11, y: 21 });

      expect(result).toBeNull();
    });

    it('returns null when end coordinate is outside grid origin bounds', () => {
      const q: CostMapQuantization = {
        minCost: 1,
        maxCost: 255,
        gridOriginX: 10,
        gridOriginY: 20,
        gridWidth: 3,
        gridHeight: 3,
      };
      const data = new Uint8Array(9).fill(10);
      const pathfinder = createPathfinder(data, 3, 3, q);

      const result = pathfinder.findPath({ x: 11, y: 21 }, { x: 50, y: 50 });

      expect(result).toBeNull();
    });

    it('uses default maxCost of Infinity when not configured', () => {
      // Long path that would be terminated if maxCost were low
      const row = [50, 50, 50, 50, 50, 50, 50, 50, 50, 50];
      const { data, width, height, quantization } = makeCostMap([
        row,
        row,
        row,
        row,
        row,
        row,
        row,
        row,
        row,
        row,
      ]);
      const pathfinder = createPathfinder(data, width, height, quantization);

      const result = pathfinder.findPath({ x: 0, y: 0 }, { x: 9, y: 9 });

      expect(result).not.toBeNull();
    });

    it('totalCost accumulates correctly over multiple steps', () => {
      // 1D grid: cost of each cell known exactly
      const q: CostMapQuantization = {
        minCost: 1,
        maxCost: 255,
        gridOriginX: 0,
        gridOriginY: 0,
        gridWidth: 4,
        gridHeight: 1,
      };
      // Byte values: [0, 0, 0, 0] all map to minCost = 1
      const data = new Uint8Array([0, 0, 0, 0]);
      const pathfinder = createPathfinder(data, 4, 1, q);

      const result = pathfinder.findPath({ x: 0, y: 0 }, { x: 3, y: 0 });

      expect(result).not.toBeNull();
      // Path: (0,0) → (1,0) → (2,0) → (3,0), each step costs minCost = 1
      expect(result?.path).toEqual([
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 3, y: 0 },
      ]);
      expect(result?.totalCost).toBe(3);
    });
  });
});
