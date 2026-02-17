/**
 * A* pathfinding with binary heap priority queue.
 *
 * 8-directional movement, diagonal cost = cellCost × sqrt(2),
 * octile distance heuristic. Uses typed arrays for cache-friendly
 * performance. Portable — no Node.js or Workers API dependencies.
 *
 * @module domain/galaxy/pathfinding
 */

import type { Coordinate, CostMapQuantization } from './types';

/** Result of an A* pathfinding computation. */
export interface PathfindingResult {
  readonly path: readonly Coordinate[];
  readonly totalCost: number;
}

/** Optional configuration for the A* pathfinder. */
export interface PathfindingConfig {
  /** Maximum accumulated cost before early termination. Defaults to Infinity. */
  readonly maxCost?: number;
}

/** A* pathfinder that operates on a cost map. */
export interface Pathfinder {
  /**
   * Finds the lowest-cost path between two coordinates on the cost map.
   *
   * @param start - Starting coordinate
   * @param end - Destination coordinate
   * @returns Path and total cost, or null if no path exists
   */
  findPath(start: Coordinate, end: Coordinate): PathfindingResult | null;
}

/**
 * Min-heap priority queue backed by parallel arrays.
 *
 * Stores node indices with associated priorities. Provides O(log n)
 * insertion and extraction of the minimum element.
 */
export class BinaryHeap {
  /** Node indices. */
  private readonly nodes: number[] = [];

  /** Corresponding priorities. */
  private readonly priorities: number[] = [];

  /**
   * Number of elements in the heap.
   *
   * @returns Current heap size
   */
  get size(): number {
    return this.nodes.length;
  }

  /**
   * Inserts a node with the given priority.
   *
   * @param node - Node index to insert
   * @param priority - Priority value (lower = higher priority)
   */
  push(node: number, priority: number): void {
    this.nodes.push(node);
    this.priorities.push(priority);
    this.bubbleUp(this.nodes.length - 1);
  }

  /**
   * Extracts and returns the node with the lowest priority.
   *
   * @returns Node index with lowest priority, or -1 if empty
   */
  pop(): number {
    if (this.nodes.length === 0) {
      return -1;
    }
    const result = this.nodes[0] as number;
    const lastNode = this.nodes.pop() as number;
    const lastPriority = this.priorities.pop() as number;
    if (this.nodes.length > 0) {
      this.nodes[0] = lastNode;
      this.priorities[0] = lastPriority;
      this.sinkDown(0);
    }
    return result;
  }

  /**
   * Restores heap property by moving an element up.
   *
   * @param index - Index of the element to bubble up
   */
  private bubbleUp(index: number): void {
    let i = index;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if ((this.priorities[i] as number) >= (this.priorities[parent] as number)) {
        break;
      }
      // Swap
      const tmpNode = this.nodes[i] as number;
      this.nodes[i] = this.nodes[parent] as number;
      this.nodes[parent] = tmpNode;

      const tmpPri = this.priorities[i] as number;
      this.priorities[i] = this.priorities[parent] as number;
      this.priorities[parent] = tmpPri;

      i = parent;
    }
  }

  /**
   * Restores heap property by moving an element down.
   *
   * @param index - Index of the element to sink down
   */
  private sinkDown(index: number): void {
    const len = this.nodes.length;
    let i = index;

    while (true) {
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      let smallest = i;

      if (left < len && (this.priorities[left] as number) < (this.priorities[smallest] as number)) {
        smallest = left;
      }
      if (
        right < len &&
        (this.priorities[right] as number) < (this.priorities[smallest] as number)
      ) {
        smallest = right;
      }

      if (smallest === i) {
        break;
      }

      const tmpNode = this.nodes[i] as number;
      this.nodes[i] = this.nodes[smallest] as number;
      this.nodes[smallest] = tmpNode;

      const tmpPri = this.priorities[i] as number;
      this.priorities[i] = this.priorities[smallest] as number;
      this.priorities[smallest] = tmpPri;

      i = smallest;
    }
  }
}

/** Cardinal and diagonal neighbor offsets. */
const DIRECTIONS: readonly (readonly [number, number])[] = [
  [0, -1], // N
  [1, -1], // NE
  [1, 0], // E
  [1, 1], // SE
  [0, 1], // S
  [-1, 1], // SW
  [-1, 0], // W
  [-1, -1], // NW
];

/** Cost multiplier for diagonal moves. */
const SQRT2 = Math.SQRT2;

/**
 * Computes the octile distance heuristic between two grid positions.
 *
 * @param ax - X coordinate of first position
 * @param ay - Y coordinate of first position
 * @param bx - X coordinate of second position
 * @param by - Y coordinate of second position
 * @param minCellCost - Minimum possible cell cost (for admissibility)
 * @returns Heuristic cost estimate
 */
function octileDistance(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  minCellCost: number
): number {
  const dx = Math.abs(ax - bx);
  const dy = Math.abs(ay - by);
  return minCellCost * (dx + dy + (SQRT2 - 2) * Math.min(dx, dy));
}

/**
 * Creates an A* pathfinder for the given cost map.
 *
 * @param costData - Flat Uint8Array of cost map byte values (row-major)
 * @param width - Width of the cost map grid
 * @param height - Height of the cost map grid
 * @param quantization - Cost map quantization parameters
 * @param config - Optional pathfinding configuration
 * @returns Pathfinder instance
 */
export function createPathfinder(
  costData: Uint8Array,
  width: number,
  height: number,
  quantization: CostMapQuantization,
  config?: PathfindingConfig
): Pathfinder {
  const maxCost = config?.maxCost ?? Infinity;
  const { minCost, maxCost: qMaxCost, gridOriginX, gridOriginY } = quantization;
  const costRange = qMaxCost - minCost;

  /**
   * Converts a byte value to actual cost.
   *
   * @param byteValue - Raw byte value from cost map (0–255)
   * @returns Quantized cost
   */
  function quantize(byteValue: number): number {
    return minCost + (byteValue / 255) * costRange;
  }

  return {
    findPath(start: Coordinate, end: Coordinate): PathfindingResult | null {
      // Convert world coordinates to local grid coordinates
      const sx = start.x - gridOriginX;
      const sy = start.y - gridOriginY;
      const ex = end.x - gridOriginX;
      const ey = end.y - gridOriginY;

      // Bounds check
      if (sx < 0 || sx >= width || sy < 0 || sy >= height) {
        return null;
      }
      if (ex < 0 || ex >= width || ey < 0 || ey >= height) {
        return null;
      }

      // Trivial case: start == end
      if (sx === ex && sy === ey) {
        return { path: [{ x: start.x, y: start.y }], totalCost: 0 };
      }

      const totalCells = width * height;
      const gScores = new Float64Array(totalCells);
      gScores.fill(Infinity);
      const closed = new Uint8Array(totalCells);
      const cameFrom = new Int32Array(totalCells);
      cameFrom.fill(-1);

      const startIdx = sy * width + sx;
      const endIdx = ey * width + ex;

      gScores[startIdx] = 0;

      const heap = new BinaryHeap();
      heap.push(startIdx, octileDistance(sx, sy, ex, ey, minCost));

      while (heap.size > 0) {
        const currentIdx = heap.pop();
        if (currentIdx === endIdx) {
          // Reconstruct path
          return reconstructPath(
            cameFrom,
            currentIdx,
            startIdx,
            width,
            gridOriginX,
            gridOriginY,
            gScores[currentIdx] as number
          );
        }

        if (closed[currentIdx] === 1) {
          continue;
        }
        closed[currentIdx] = 1;

        const currentG = gScores[currentIdx] as number;

        // Early termination if cost exceeds maximum
        if (currentG > maxCost) {
          return null;
        }

        const cx = currentIdx % width;
        const cy = (currentIdx - cx) / width;

        for (const dir of DIRECTIONS) {
          const nx = cx + dir[0];
          const ny = cy + dir[1];

          if (nx < 0 || nx >= width || ny < 0 || ny >= height) {
            continue;
          }

          const neighborIdx = ny * width + nx;
          if (closed[neighborIdx] === 1) {
            continue;
          }

          const byteVal = costData[neighborIdx] as number;
          const cellCost = quantize(byteVal);
          const isDiagonal = dir[0] !== 0 && dir[1] !== 0;
          const moveCost = isDiagonal ? cellCost * SQRT2 : cellCost;
          const tentativeG = currentG + moveCost;

          if (tentativeG < (gScores[neighborIdx] as number)) {
            gScores[neighborIdx] = tentativeG;
            cameFrom[neighborIdx] = currentIdx;
            const h = octileDistance(nx, ny, ex, ey, minCost);
            heap.push(neighborIdx, tentativeG + h);
          }
        }
      }

      /* istanbul ignore next -- unreachable on connected 8-directional grid; maxCost terminates first */
      return null;
    },
  };
}

/**
 * Reconstructs the path from the cameFrom array.
 *
 * @param cameFrom - Array mapping each node to its predecessor
 * @param endIdx - Index of the end node
 * @param startIdx - Index of the start node
 * @param width - Grid width
 * @param originX - Grid origin X offset
 * @param originY - Grid origin Y offset
 * @param totalCost - Total accumulated cost
 * @returns PathfindingResult with reconstructed path
 */
function reconstructPath(
  cameFrom: Int32Array,
  endIdx: number,
  startIdx: number,
  width: number,
  originX: number,
  originY: number,
  totalCost: number
): PathfindingResult {
  const indices: number[] = [];
  let current = endIdx;
  while (current !== startIdx) {
    indices.push(current);
    current = cameFrom[current] as number;
  }
  indices.push(startIdx);
  indices.reverse();

  const path: Coordinate[] = indices.map((idx) => ({
    x: (idx % width) + originX,
    y: Math.floor(idx / width) + originY,
  }));

  return { path, totalCost };
}
