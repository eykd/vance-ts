/**
 * Grid-based spatial indexing for efficient neighbor lookups.
 *
 * Provides O(1) insertion and O(k) radius queries where k is the number
 * of systems in the queried neighborhood, reducing full-galaxy neighbor
 * counting from O(n²) to O(n). Portable between Node.js and Cloudflare
 * Workers — no platform-specific APIs required.
 *
 * @module domain/galaxy/spatial-hash
 */

/**
 * Grid-based spatial hash for efficient radius-based neighbor lookups.
 *
 * Divides 2D space into cells of configurable size. Systems are stored
 * in the cell corresponding to their coordinates. Radius queries check
 * only the relevant neighboring cells rather than all systems.
 */
export class SpatialHash {
  /** Width of each grid cell. */
  private readonly cellSize: number;

  /** Number of columns in the grid (used for hash computation). */
  private readonly gridWidth: number;

  /** Map from cell key to list of system indices in that cell. */
  private readonly cells: Map<number, number[]>;

  /** Stored coordinates for distance checks during queries. */
  private readonly positions: Map<number, { readonly x: number; readonly y: number }>;

  /**
   * Creates a new spatial hash with the given cell size and grid width.
   *
   * @param cellSize - Width/height of each grid cell (should match query radius)
   * @param gridWidth - Logical width of the coordinate space (for hash computation)
   */
  constructor(cellSize: number, gridWidth: number) {
    this.cellSize = cellSize;
    this.gridWidth = gridWidth;
    this.cells = new Map();
    this.positions = new Map();
  }

  /**
   * Computes the cell key for a coordinate pair.
   *
   * @param x - X coordinate
   * @param y - Y coordinate
   * @returns Integer cell key
   */
  private key(x: number, y: number): number {
    const cx = Math.floor(x / this.cellSize);
    const cy = Math.floor(y / this.cellSize);
    return cx + cy * this.gridWidth;
  }

  /**
   * Inserts a system index at the given coordinates.
   *
   * @param systemIndex - Index of the system to store
   * @param x - X coordinate of the system
   * @param y - Y coordinate of the system
   */
  insert(systemIndex: number, x: number, y: number): void {
    const k = this.key(x, y);
    const bucket = this.cells.get(k);
    if (bucket !== undefined) {
      bucket.push(systemIndex);
    } else {
      this.cells.set(k, [systemIndex]);
    }
    this.positions.set(systemIndex, { x, y });
  }

  /**
   * Returns all system indices within the given radius of a point.
   *
   * Checks 9 neighboring cells (the cell containing the query point
   * plus all 8 adjacent cells) and filters by Euclidean distance.
   *
   * @param x - X coordinate of the query center
   * @param y - Y coordinate of the query center
   * @param radius - Maximum distance from the query center
   * @returns Array of system indices within the radius
   */
  queryRadius(x: number, y: number, radius: number): number[] {
    const cx = Math.floor(x / this.cellSize);
    const cy = Math.floor(y / this.cellSize);
    const radiusSq = radius * radius;
    const cellSpan = Math.ceil(radius / this.cellSize);
    const results: number[] = [];

    for (let dy = -cellSpan; dy <= cellSpan; dy++) {
      for (let dx = -cellSpan; dx <= cellSpan; dx++) {
        const k = cx + dx + (cy + dy) * this.gridWidth;
        const bucket = this.cells.get(k);
        if (bucket === undefined) {
          continue;
        }
        for (const idx of bucket) {
          const pos = this.positions.get(idx);
          /* istanbul ignore if -- positions always set alongside cells */
          if (pos === undefined) {
            continue;
          }
          const distX = pos.x - x;
          const distY = pos.y - y;
          if (distX * distX + distY * distY <= radiusSq) {
            results.push(idx);
          }
        }
      }
    }

    return results;
  }
}
