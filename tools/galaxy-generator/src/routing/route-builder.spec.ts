import type { Coordinate, Route, RouteConfig } from '../../../../src/domain/galaxy/types';
import type { CostMap } from '../costmap/cost-composer';

import { buildRoutes, type RouteBuilderConfig } from './route-builder';

/**
 * Creates a minimal RouteConfig for testing.
 *
 * @param overrides - partial config to merge
 * @returns complete RouteConfig
 */
function makeRouteConfig(overrides: Partial<RouteConfig> = {}): RouteConfig {
  return {
    maxRange: 100,
    ...overrides,
  };
}

/**
 * Creates an open cost map where all cells have low cost.
 *
 * @param width - grid width
 * @param height - grid height
 * @param originX - grid origin X
 * @param originY - grid origin Y
 * @returns CostMap with all cells at minimum cost
 */
function makeOpenCostMap(width: number, height: number, originX: number, originY: number): CostMap {
  const size = width * height;
  const data = new Uint8Array(size);
  data.fill(0);
  return {
    data,
    width,
    height,
    quantization: {
      minCost: 1,
      maxCost: 30,
      gridOriginX: originX,
      gridOriginY: originY,
      gridWidth: width,
      gridHeight: height,
    },
  };
}

/** Oikumene system representation for testing. */
interface OikumeneSystem {
  readonly id: string;
  readonly x: number;
  readonly y: number;
}

/**
 * Creates a RouteBuilderConfig for testing.
 *
 * @param systems - Oikumene systems to route between
 * @param costMap - traversal cost map
 * @param routeConfig - route parameters
 * @returns complete RouteBuilderConfig
 */
function makeBuilderConfig(
  systems: readonly OikumeneSystem[],
  costMap: CostMap,
  routeConfig: RouteConfig
): RouteBuilderConfig {
  return {
    oikumeneSystems: systems,
    costMap,
    routeConfig,
  };
}

describe('buildRoutes', () => {
  it('returns empty array for empty systems', () => {
    const costMap = makeOpenCostMap(20, 20, 0, 0);
    const config = makeBuilderConfig([], costMap, makeRouteConfig());
    const result = buildRoutes(config);
    expect(result).toEqual([]);
  });

  it('returns empty array for a single system', () => {
    const costMap = makeOpenCostMap(20, 20, 0, 0);
    const systems: OikumeneSystem[] = [{ id: 'a', x: 10, y: 10 }];
    const config = makeBuilderConfig(systems, costMap, makeRouteConfig());
    const result = buildRoutes(config);
    expect(result).toEqual([]);
  });

  it('computes a route between two systems within range', () => {
    const costMap = makeOpenCostMap(50, 50, 0, 0);
    const systems: OikumeneSystem[] = [
      { id: 'alpha', x: 5, y: 5 },
      { id: 'beta', x: 10, y: 10 },
    ];
    const config = makeBuilderConfig(systems, costMap, makeRouteConfig({ maxRange: 100 }));
    const result = buildRoutes(config);
    expect(result).toHaveLength(1);
    expect(result[0]?.cost).toBeGreaterThan(0);
    expect(result[0]?.path.length).toBeGreaterThan(0);
  });

  it('stores routes with originId < destinationId lexicographically', () => {
    const costMap = makeOpenCostMap(50, 50, 0, 0);
    const systems: OikumeneSystem[] = [
      { id: 'zulu', x: 5, y: 5 },
      { id: 'alpha', x: 10, y: 10 },
    ];
    const config = makeBuilderConfig(systems, costMap, makeRouteConfig({ maxRange: 100 }));
    const result = buildRoutes(config);
    expect(result).toHaveLength(1);
    expect(result[0]?.originId).toBe('alpha');
    expect(result[0]?.destinationId).toBe('zulu');
  });

  it('path starts at origin and ends at destination coordinates', () => {
    const costMap = makeOpenCostMap(50, 50, 0, 0);
    const systems: OikumeneSystem[] = [
      { id: 'a', x: 5, y: 5 },
      { id: 'b', x: 15, y: 15 },
    ];
    const config = makeBuilderConfig(systems, costMap, makeRouteConfig({ maxRange: 100 }));
    const result = buildRoutes(config);
    expect(result).toHaveLength(1);

    const route = result[0] as Route;
    const first = route.path[0] as Coordinate;
    const last = route.path[route.path.length - 1] as Coordinate;

    // Origin is 'a' (lexicographically first), destination is 'b'
    expect(first.x).toBe(5);
    expect(first.y).toBe(5);
    expect(last.x).toBe(15);
    expect(last.y).toBe(15);
  });

  it('reverses path when lexicographic order differs from pathfinding direction', () => {
    const costMap = makeOpenCostMap(50, 50, 0, 0);
    // 'zulu' at (5,5) has id > 'alpha' at (15,15)
    // So origin='alpha' (15,15), dest='zulu' (5,5)
    // Path should go from (15,15) to (5,5) — but was computed from zulu->alpha
    // Route builder should reverse the path
    const systems: OikumeneSystem[] = [
      { id: 'zulu', x: 5, y: 5 },
      { id: 'alpha', x: 15, y: 15 },
    ];
    const config = makeBuilderConfig(systems, costMap, makeRouteConfig({ maxRange: 100 }));
    const result = buildRoutes(config);
    expect(result).toHaveLength(1);

    const route = result[0] as Route;
    const first = route.path[0] as Coordinate;
    const last = route.path[route.path.length - 1] as Coordinate;

    // origin='alpha' at (15,15), dest='zulu' at (5,5)
    expect(route.originId).toBe('alpha');
    expect(first.x).toBe(15);
    expect(first.y).toBe(15);
    expect(last.x).toBe(5);
    expect(last.y).toBe(5);
  });

  it('does not create direct routes for pairs beyond maxRange', () => {
    const costMap = makeOpenCostMap(200, 200, 0, 0);
    // Three systems in a chain: a close to b, b close to c, a far from c
    const systems: OikumeneSystem[] = [
      { id: 'a', x: 10, y: 10 },
      { id: 'b', x: 20, y: 10 },
      { id: 'c', x: 30, y: 10 },
    ];
    // maxRange=15: a-b (dist 10) in range, b-c (dist 10) in range, a-c (dist 20) out of range
    const config = makeBuilderConfig(systems, costMap, makeRouteConfig({ maxRange: 15 }));
    const result = buildRoutes(config);

    // a-b and b-c are direct routes; a-c is out of range but connected via b (no bridge needed)
    expect(result).toHaveLength(2);
    const pairKeys = result.map((r) => `${r.originId}-${r.destinationId}`);
    expect(pairKeys).toContain('a-b');
    expect(pairKeys).toContain('b-c');
    // a-c should NOT have a direct route
    expect(pairKeys).not.toContain('a-c');
  });

  it('pre-filters pairs by Euclidean distance before A*', () => {
    const costMap = makeOpenCostMap(200, 200, 0, 0);
    // Cluster of 3 close together + 1 far away
    const systems: OikumeneSystem[] = [
      { id: 'a', x: 10, y: 10 },
      { id: 'b', x: 15, y: 10 },
      { id: 'c', x: 10, y: 15 },
      { id: 'd', x: 180, y: 180 },
    ];
    // maxRange=30: a,b,c all within range of each other; d is far
    const config = makeBuilderConfig(systems, costMap, makeRouteConfig({ maxRange: 30 }));
    const result = buildRoutes(config);

    // 3 direct routes within cluster (a-b, a-c, b-c) + 1 bridge to d
    const directRoutes = result.filter((r) => {
      const ids = [r.originId, r.destinationId];
      return !ids.includes('d');
    });
    expect(directRoutes).toHaveLength(3);
  });

  it('handles multiple pairs within range', () => {
    const costMap = makeOpenCostMap(50, 50, 0, 0);
    const systems: OikumeneSystem[] = [
      { id: 'a', x: 10, y: 10 },
      { id: 'b', x: 15, y: 10 },
      { id: 'c', x: 10, y: 15 },
    ];
    const config = makeBuilderConfig(systems, costMap, makeRouteConfig({ maxRange: 100 }));
    const result = buildRoutes(config);
    // 3 pairs: a-b, a-c, b-c
    expect(result).toHaveLength(3);
  });

  it('does not produce duplicate routes', () => {
    const costMap = makeOpenCostMap(50, 50, 0, 0);
    const systems: OikumeneSystem[] = [
      { id: 'a', x: 10, y: 10 },
      { id: 'b', x: 15, y: 10 },
    ];
    const config = makeBuilderConfig(systems, costMap, makeRouteConfig({ maxRange: 100 }));
    const result = buildRoutes(config);
    expect(result).toHaveLength(1);

    // Check no duplicate pair keys
    const keys = result.map((r) => `${r.originId}-${r.destinationId}`);
    const uniqueKeys = new Set(keys);
    expect(uniqueKeys.size).toBe(keys.length);
  });

  it('skips pairs where A* returns null (system outside grid)', () => {
    // Small grid: 20x20 at origin (0,0)
    const costMap = makeOpenCostMap(20, 20, 0, 0);
    const systems: OikumeneSystem[] = [
      { id: 'a', x: 10, y: 10 },
      // 'b' is inside grid but 'c' is outside grid bounds
      { id: 'c', x: -5, y: -5 },
    ];
    // Both within Euclidean maxRange, but c is outside grid so A* returns null
    const config = makeBuilderConfig(systems, costMap, makeRouteConfig({ maxRange: 100 }));
    const result = buildRoutes(config);

    // A* returns null for the pair a-c because c is outside grid.
    // Bridge will also fail (same pathfinder, same out-of-bounds).
    // But bridge IS attempted since components are disconnected.
    // The bridge also returns null, so no routes at all.
    expect(result).toHaveLength(0);
  });

  describe('connectivity validation', () => {
    it('detects fully connected network', () => {
      const costMap = makeOpenCostMap(100, 100, 0, 0);
      const systems: OikumeneSystem[] = [
        { id: 'a', x: 10, y: 10 },
        { id: 'b', x: 20, y: 10 },
        { id: 'c', x: 15, y: 20 },
      ];
      const config = makeBuilderConfig(systems, costMap, makeRouteConfig({ maxRange: 100 }));
      const result = buildRoutes(config);
      // All pairs connected: a-b, a-c, b-c
      expect(result).toHaveLength(3);
    });

    it('adds bridge routes for disconnected components', () => {
      const costMap = makeOpenCostMap(500, 500, 0, 0);
      // Two clusters far apart, each cluster within maxRange internally
      const systems: OikumeneSystem[] = [
        { id: 'a', x: 10, y: 10 },
        { id: 'b', x: 15, y: 10 },
        { id: 'c', x: 400, y: 400 },
        { id: 'd', x: 405, y: 400 },
      ];
      // maxRange=50: a-b connected, c-d connected, but clusters are disconnected
      const config = makeBuilderConfig(systems, costMap, makeRouteConfig({ maxRange: 50 }));
      const result = buildRoutes(config);

      // Should have: a-b route, c-d route, plus at least 1 bridge route
      expect(result.length).toBeGreaterThanOrEqual(3);

      // All 4 systems should be reachable
      const connectedIds = new Set<string>();
      const adjacency = new Map<string, Set<string>>();
      for (const route of result) {
        if (!adjacency.has(route.originId)) adjacency.set(route.originId, new Set());
        if (!adjacency.has(route.destinationId)) adjacency.set(route.destinationId, new Set());
        adjacency.get(route.originId)?.add(route.destinationId);
        adjacency.get(route.destinationId)?.add(route.originId);
      }

      // BFS from 'a'
      const queue = ['a'];
      connectedIds.add('a');
      while (queue.length > 0) {
        const current = queue.shift() as string;
        for (const neighbor of adjacency.get(current) ?? []) {
          if (!connectedIds.has(neighbor)) {
            connectedIds.add(neighbor);
            queue.push(neighbor);
          }
        }
      }
      expect(connectedIds.size).toBe(4);
    });

    it('bridges connect closest nodes between components', () => {
      const costMap = makeOpenCostMap(500, 500, 0, 0);
      const systems: OikumeneSystem[] = [
        { id: 'a', x: 10, y: 10 },
        { id: 'b', x: 200, y: 200 },
      ];
      // maxRange=20: too small for a-b connection
      const config = makeBuilderConfig(systems, costMap, makeRouteConfig({ maxRange: 20 }));
      const result = buildRoutes(config);

      // Bridge should be added
      expect(result).toHaveLength(1);
      expect(result[0]?.originId).toBe('a');
      expect(result[0]?.destinationId).toBe('b');
    });

    it('handles three disconnected components', () => {
      const costMap = makeOpenCostMap(500, 500, 0, 0);
      const systems: OikumeneSystem[] = [
        { id: 'a', x: 10, y: 10 },
        { id: 'b', x: 200, y: 200 },
        { id: 'c', x: 400, y: 400 },
      ];
      // maxRange=20: no pairs within range
      const config = makeBuilderConfig(systems, costMap, makeRouteConfig({ maxRange: 20 }));
      const result = buildRoutes(config);

      // Should add bridges to connect all 3
      // Minimum spanning tree: 2 edges for 3 nodes
      expect(result.length).toBeGreaterThanOrEqual(2);

      // Verify full connectivity
      const adjacency = new Map<string, Set<string>>();
      for (const route of result) {
        if (!adjacency.has(route.originId)) adjacency.set(route.originId, new Set());
        if (!adjacency.has(route.destinationId)) adjacency.set(route.destinationId, new Set());
        adjacency.get(route.originId)?.add(route.destinationId);
        adjacency.get(route.destinationId)?.add(route.originId);
      }

      const visited = new Set<string>();
      const queue = ['a'];
      visited.add('a');
      while (queue.length > 0) {
        const current = queue.shift() as string;
        for (const neighbor of adjacency.get(current) ?? []) {
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            queue.push(neighbor);
          }
        }
      }
      expect(visited.size).toBe(3);
    });
  });

  describe('route properties', () => {
    it('all routes have positive cost', () => {
      const costMap = makeOpenCostMap(100, 100, 0, 0);
      const systems: OikumeneSystem[] = [
        { id: 'a', x: 10, y: 10 },
        { id: 'b', x: 20, y: 20 },
        { id: 'c', x: 30, y: 10 },
      ];
      const config = makeBuilderConfig(systems, costMap, makeRouteConfig({ maxRange: 100 }));
      const result = buildRoutes(config);

      for (const route of result) {
        expect(route.cost).toBeGreaterThan(0);
      }
    });

    it('all routes have non-empty paths', () => {
      const costMap = makeOpenCostMap(100, 100, 0, 0);
      const systems: OikumeneSystem[] = [
        { id: 'a', x: 10, y: 10 },
        { id: 'b', x: 20, y: 20 },
      ];
      const config = makeBuilderConfig(systems, costMap, makeRouteConfig({ maxRange: 100 }));
      const result = buildRoutes(config);

      for (const route of result) {
        expect(route.path.length).toBeGreaterThan(0);
      }
    });

    it('all routes satisfy originId < destinationId', () => {
      const costMap = makeOpenCostMap(100, 100, 0, 0);
      const systems: OikumeneSystem[] = [
        { id: 'delta', x: 10, y: 10 },
        { id: 'alpha', x: 20, y: 20 },
        { id: 'charlie', x: 30, y: 10 },
        { id: 'bravo', x: 20, y: 30 },
      ];
      const config = makeBuilderConfig(systems, costMap, makeRouteConfig({ maxRange: 100 }));
      const result = buildRoutes(config);

      for (const route of result) {
        expect(route.originId < route.destinationId).toBe(true);
      }
    });

    it('conforms to Route interface shape', () => {
      const costMap = makeOpenCostMap(50, 50, 0, 0);
      const systems: OikumeneSystem[] = [
        { id: 'a', x: 5, y: 5 },
        { id: 'b', x: 10, y: 10 },
      ];
      const config = makeBuilderConfig(systems, costMap, makeRouteConfig({ maxRange: 100 }));
      const result = buildRoutes(config);

      const route = result[0] as Route;
      expect(typeof route.originId).toBe('string');
      expect(typeof route.destinationId).toBe('string');
      expect(typeof route.cost).toBe('number');
      expect(Array.isArray(route.path)).toBe(true);

      const coord = route.path[0] as Coordinate;
      expect(typeof coord.x).toBe('number');
      expect(typeof coord.y).toBe('number');
    });
  });

  describe('cost map with grid origin offset', () => {
    it('handles negative grid origin correctly', () => {
      const costMap = makeOpenCostMap(100, 100, -50, -50);
      const systems: OikumeneSystem[] = [
        { id: 'a', x: -40, y: -40 },
        { id: 'b', x: -30, y: -30 },
      ];
      const config = makeBuilderConfig(systems, costMap, makeRouteConfig({ maxRange: 100 }));
      const result = buildRoutes(config);
      expect(result).toHaveLength(1);
      expect(result[0]?.cost).toBeGreaterThan(0);
    });
  });

  describe('systems at same position', () => {
    it('handles two systems at same coordinates', () => {
      const costMap = makeOpenCostMap(50, 50, 0, 0);
      const systems: OikumeneSystem[] = [
        { id: 'a', x: 10, y: 10 },
        { id: 'b', x: 10, y: 10 },
      ];
      const config = makeBuilderConfig(systems, costMap, makeRouteConfig({ maxRange: 100 }));
      const result = buildRoutes(config);
      // Same position means zero-distance path
      expect(result).toHaveLength(1);
      expect(result[0]?.cost).toBe(0);
    });
  });
});
