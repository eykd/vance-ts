import { Mulberry32 } from '../../../../src/domain/galaxy/prng';

import {
  generateCaGrid,
  initializeGrid,
  stepGrid,
  type CellularAutomataConfig,
} from './cellular-automata';

/**
 * Creates a default CellularAutomataConfig for testing.
 *
 * @param overrides - partial config to merge
 * @returns complete CellularAutomataConfig
 */
function makeConfig(overrides: Partial<CellularAutomataConfig> = {}): CellularAutomataConfig {
  return {
    width: 10,
    height: 10,
    fillProbability: 0.45,
    iterations: 4,
    rng: new Mulberry32(42),
    ...overrides,
  };
}

describe('initializeGrid', () => {
  it('returns a Uint8Array of correct length', () => {
    const config = makeConfig();

    const grid = initializeGrid(config);

    expect(grid).toBeInstanceOf(Uint8Array);
    expect(grid).toHaveLength(100);
  });

  it('only contains 0 or 1 values', () => {
    const config = makeConfig({ width: 20, height: 20 });

    const grid = initializeGrid(config);

    for (let i = 0; i < grid.length; i++) {
      expect(grid[i] === 0 || grid[i] === 1).toBe(true);
    }
  });

  it('forces boundary cells to walls', () => {
    const config = makeConfig({ width: 10, height: 10 });

    const grid = initializeGrid(config);

    // Top and bottom rows
    for (let x = 0; x < 10; x++) {
      expect(grid[0 * 10 + x]).toBe(1); // top row
      expect(grid[9 * 10 + x]).toBe(1); // bottom row
    }
    // Left and right columns
    for (let y = 0; y < 10; y++) {
      expect(grid[y * 10 + 0]).toBe(1); // left column
      expect(grid[y * 10 + 9]).toBe(1); // right column
    }
  });

  it('is deterministic with fixed seed', () => {
    const grid1 = initializeGrid(makeConfig({ rng: new Mulberry32(999) }));
    const grid2 = initializeGrid(makeConfig({ rng: new Mulberry32(999) }));

    expect(grid1).toEqual(grid2);
  });

  it('produces different grids with different seeds', () => {
    const grid1 = initializeGrid(makeConfig({ rng: new Mulberry32(1) }));
    const grid2 = initializeGrid(makeConfig({ rng: new Mulberry32(2) }));

    let hasDifference = false;
    for (let i = 0; i < grid1.length; i++) {
      if (grid1[i] !== grid2[i]) {
        hasDifference = true;
        break;
      }
    }
    expect(hasDifference).toBe(true);
  });

  it('respects fillProbability of 0 (no interior walls)', () => {
    const config = makeConfig({ fillProbability: 0, width: 10, height: 10 });

    const grid = initializeGrid(config);

    // Interior cells should all be open
    for (let y = 1; y < 9; y++) {
      for (let x = 1; x < 9; x++) {
        expect(grid[y * 10 + x]).toBe(0);
      }
    }
    // Boundaries should still be walls
    expect(grid[0]).toBe(1);
  });

  it('respects fillProbability of 1 (all walls)', () => {
    const config = makeConfig({ fillProbability: 1, width: 10, height: 10 });

    const grid = initializeGrid(config);

    for (let i = 0; i < grid.length; i++) {
      expect(grid[i]).toBe(1);
    }
  });

  it('stores values in row-major order (y * width + x)', () => {
    const config = makeConfig({ width: 5, height: 3 });

    const grid = initializeGrid(config);

    expect(grid).toHaveLength(15);
  });
});

describe('stepGrid', () => {
  it('returns a new Uint8Array of same length', () => {
    const config = makeConfig();
    const grid = initializeGrid(config);

    const next = stepGrid(grid, config.width, config.height);

    expect(next).toBeInstanceOf(Uint8Array);
    expect(next).toHaveLength(grid.length);
    expect(next).not.toBe(grid); // new array, not mutation
  });

  it('forces boundary cells to walls', () => {
    // Start with all open
    const grid = new Uint8Array(100);

    const next = stepGrid(grid, 10, 10);

    // Top row
    for (let x = 0; x < 10; x++) {
      expect(next[0 * 10 + x]).toBe(1);
      expect(next[9 * 10 + x]).toBe(1);
    }
    // Left and right columns
    for (let y = 0; y < 10; y++) {
      expect(next[y * 10 + 0]).toBe(1);
      expect(next[y * 10 + 9]).toBe(1);
    }
  });

  it('applies the 4-5 rule: cell becomes wall if >= 5 neighbors are walls', () => {
    // Create a 5x5 grid where we can control the neighborhood manually
    const width = 5;
    const height = 5;
    const grid = new Uint8Array(25);

    // Set boundaries to walls (all edge cells)
    for (let x = 0; x < width; x++) {
      grid[0 * width + x] = 1;
      grid[(height - 1) * width + x] = 1;
    }
    for (let y = 0; y < height; y++) {
      grid[y * width + 0] = 1;
      grid[y * width + (width - 1)] = 1;
    }

    // Interior cell (2,2) has 8 neighbors. With boundaries as walls:
    // Neighbors of (2,2): (1,1)=1, (2,1)=1, (3,1)=1, (1,2)=1, (3,2)=1, (1,3)=1, (2,3)=1, (3,3)=1
    // Plus self (2,2)=0 → total in 3x3 = 8 walls (all boundaries)
    // Wait, (2,1), (1,2), (3,2), (2,3) are interior for a 5x5 grid:
    // Actually let me reconsider. In a 5x5 grid:
    // Row 0 (y=0): all walls (boundary)
    // Row 4 (y=4): all walls (boundary)
    // Col 0 (x=0): all walls
    // Col 4 (x=4): all walls
    // Interior cells are (1,1), (2,1), (3,1), (1,2), (2,2), (3,2), (1,3), (2,3), (3,3)
    // So the interior is a 3x3 block. All neighbors of (2,2) are at the edge of the interior.

    // Let's make cell (2,2) open with some neighbors as walls
    // Set (1,1), (2,1), (3,1) as walls (already boundary-adjacent)
    grid[1 * width + 1] = 1;
    grid[1 * width + 2] = 1;
    grid[1 * width + 3] = 1;
    // (1,2) = wall, (2,2) = open, (3,2) = open
    grid[2 * width + 1] = 1;
    grid[2 * width + 2] = 0;
    grid[2 * width + 3] = 0;
    // (1,3), (2,3), (3,3) = open
    grid[3 * width + 1] = 0;
    grid[3 * width + 2] = 0;
    grid[3 * width + 3] = 0;

    // Neighborhood of (2,2): (1,1)=1, (2,1)=1, (3,1)=1, (1,2)=1, (2,2)=0, (3,2)=0, (1,3)=0, (2,3)=0, (3,3)=0
    // Count = 4 walls in 3x3 neighborhood (including self)
    // 4 < 5, so (2,2) should become open (0)
    const next = stepGrid(grid, width, height);
    expect(next[2 * width + 2]).toBe(0);

    // Now make one more neighbor a wall: (3,2) = 1
    grid[2 * width + 3] = 1;
    // Neighborhood of (2,2): (1,1)=1, (2,1)=1, (3,1)=1, (1,2)=1, (2,2)=0, (3,2)=1, (1,3)=0, (2,3)=0, (3,3)=0
    // Count = 5 walls → becomes wall
    const next2 = stepGrid(grid, width, height);
    expect(next2[2 * width + 2]).toBe(1);
  });

  it('counts self in the 3x3 neighborhood', () => {
    // A cell that is already a wall counts itself
    const width = 5;
    const height = 5;
    const grid = new Uint8Array(25);

    // All boundary walls
    for (let x = 0; x < width; x++) {
      grid[0 * width + x] = 1;
      grid[(height - 1) * width + x] = 1;
    }
    for (let y = 0; y < height; y++) {
      grid[y * width + 0] = 1;
      grid[y * width + (width - 1)] = 1;
    }

    // All interior open except center
    grid[1 * width + 1] = 0;
    grid[1 * width + 2] = 0;
    grid[1 * width + 3] = 0;
    grid[2 * width + 1] = 0;
    grid[2 * width + 2] = 1; // self is wall
    grid[2 * width + 3] = 0;
    grid[3 * width + 1] = 0;
    grid[3 * width + 2] = 0;
    grid[3 * width + 3] = 0;

    // Neighborhood of (2,2): all 0 except (2,2)=1 → count = 1
    // 1 < 5, so becomes open
    const next = stepGrid(grid, width, height);
    expect(next[2 * width + 2]).toBe(0);
  });

  it('turns all-open interior to open after step (low wall count)', () => {
    const width = 7;
    const height = 7;
    const grid = new Uint8Array(49);

    // Only boundary walls, interior all open
    for (let x = 0; x < width; x++) {
      grid[0 * width + x] = 1;
      grid[(height - 1) * width + x] = 1;
    }
    for (let y = 0; y < height; y++) {
      grid[y * width + 0] = 1;
      grid[y * width + (width - 1)] = 1;
    }

    const next = stepGrid(grid, width, height);

    // Interior cell (3,3) is far from boundary: all 8 neighbors are open
    // Count = 0, so stays open
    expect(next[3 * width + 3]).toBe(0);
  });
});

describe('generateCaGrid', () => {
  it('returns a Uint8Array of correct length', () => {
    const config = makeConfig();

    const grid = generateCaGrid(config);

    expect(grid).toBeInstanceOf(Uint8Array);
    expect(grid).toHaveLength(100);
  });

  it('only contains 0 or 1 values', () => {
    const config = makeConfig({ width: 20, height: 20 });

    const grid = generateCaGrid(config);

    for (let i = 0; i < grid.length; i++) {
      expect(grid[i] === 0 || grid[i] === 1).toBe(true);
    }
  });

  it('forces boundary cells to walls in final output', () => {
    const config = makeConfig({ width: 10, height: 10 });

    const grid = generateCaGrid(config);

    for (let x = 0; x < 10; x++) {
      expect(grid[0 * 10 + x]).toBe(1);
      expect(grid[9 * 10 + x]).toBe(1);
    }
    for (let y = 0; y < 10; y++) {
      expect(grid[y * 10 + 0]).toBe(1);
      expect(grid[y * 10 + 9]).toBe(1);
    }
  });

  it('is deterministic with fixed seed', () => {
    const grid1 = generateCaGrid(makeConfig({ rng: new Mulberry32(999) }));
    const grid2 = generateCaGrid(makeConfig({ rng: new Mulberry32(999) }));

    expect(grid1).toEqual(grid2);
  });

  it('produces different grids with different seeds', () => {
    const grid1 = generateCaGrid(makeConfig({ rng: new Mulberry32(1), width: 30, height: 30 }));
    const grid2 = generateCaGrid(makeConfig({ rng: new Mulberry32(2), width: 30, height: 30 }));

    let hasDifference = false;
    for (let i = 0; i < grid1.length; i++) {
      if (grid1[i] !== grid2[i]) {
        hasDifference = true;
        break;
      }
    }
    expect(hasDifference).toBe(true);
  });

  it('applies iterations (more iterations smooth the grid)', () => {
    // With 0 iterations, the grid is just the initial random fill
    const noIter = generateCaGrid(
      makeConfig({
        iterations: 0,
        rng: new Mulberry32(42),
        width: 30,
        height: 30,
      })
    );

    // With 5 iterations, the grid should be smoother (different distribution)
    const manyIter = generateCaGrid(
      makeConfig({
        iterations: 5,
        rng: new Mulberry32(42),
        width: 30,
        height: 30,
      })
    );

    let differences = 0;
    for (let i = 0; i < noIter.length; i++) {
      if (noIter[i] !== manyIter[i]) {
        differences++;
      }
    }
    // Some cells should have changed between 0 and 5 iterations
    expect(differences).toBeGreaterThan(0);
  });

  it('handles 3x3 grid (minimal interior)', () => {
    const config = makeConfig({ width: 3, height: 3 });

    const grid = generateCaGrid(config);

    expect(grid).toHaveLength(9);
    // All boundary cells are walls, only (1,1) is interior
    expect(grid[0]).toBe(1);
    expect(grid[1]).toBe(1);
    expect(grid[2]).toBe(1);
    expect(grid[3]).toBe(1);
    // (1,1) surrounded by 8 wall neighbors → count = 8 (or 9 if self is wall)
    // Either way >= 5 → becomes wall after iteration
    expect(grid[4]).toBe(1);
    expect(grid[5]).toBe(1);
    expect(grid[6]).toBe(1);
    expect(grid[7]).toBe(1);
    expect(grid[8]).toBe(1);
  });

  it('handles non-square grids', () => {
    const config = makeConfig({ width: 15, height: 8 });

    const grid = generateCaGrid(config);

    expect(grid).toHaveLength(120);
  });

  it('respects configurable iterations count', () => {
    // One iteration vs many should potentially produce different results
    const one = generateCaGrid(
      makeConfig({
        iterations: 1,
        rng: new Mulberry32(42),
        width: 20,
        height: 20,
      })
    );
    const four = generateCaGrid(
      makeConfig({
        iterations: 4,
        rng: new Mulberry32(42),
        width: 20,
        height: 20,
      })
    );

    let differences = 0;
    for (let i = 0; i < one.length; i++) {
      if (one[i] !== four[i]) {
        differences++;
      }
    }
    expect(differences).toBeGreaterThan(0);
  });

  it('produces a mix of open and wall cells for typical parameters', () => {
    const config = makeConfig({
      width: 50,
      height: 50,
      fillProbability: 0.45,
      iterations: 4,
      rng: new Mulberry32(42),
    });

    const grid = generateCaGrid(config);

    let openCount = 0;
    let wallCount = 0;
    for (let i = 0; i < grid.length; i++) {
      if (grid[i] === 0) {
        openCount++;
      } else {
        wallCount++;
      }
    }
    // Should have both open and wall cells
    expect(openCount).toBeGreaterThan(0);
    expect(wallCount).toBeGreaterThan(0);
  });
});
