/**
 * Route builder for pre-computing navigable paths between Oikumene systems.
 *
 * Pre-filters candidate pairs by Euclidean distance using a spatial hash,
 * computes A* routes on the cost map, validates full connectivity, and
 * adds bridge routes for disconnected components. Routes are stored
 * bidirectionally with originId < destinationId lexicographically.
 *
 * @module routing/route-builder
 */

import { createPathfinder } from '../../../../src/domain/galaxy/pathfinding';
import { SpatialHash } from '../../../../src/domain/galaxy/spatial-hash';
import type { Coordinate, Route, RouteConfig } from '../../../../src/domain/galaxy/types';
import type { CostMap } from '../costmap/cost-composer';

/** Oikumene system with position and identity. */
export interface OikumeneSystem {
  readonly id: string;
  readonly x: number;
  readonly y: number;
}

/** Configuration for the route builder. */
export interface RouteBuilderConfig {
  /** Oikumene systems to route between. */
  readonly oikumeneSystems: readonly OikumeneSystem[];
  /** Traversal cost map for A* pathfinding. */
  readonly costMap: CostMap;
  /** Route computation parameters. */
  readonly routeConfig: RouteConfig;
}

/**
 * Computes a unique pair key ensuring lexicographic ordering.
 *
 * @param idA - first system ID
 * @param idB - second system ID
 * @returns pair key with IDs in lexicographic order
 */
function pairKey(idA: string, idB: string): string {
  return idA < idB ? `${idA}|${idB}` : `${idB}|${idA}`;
}

/**
 * Finds connected components in a route graph using BFS.
 *
 * @param systemIds - all system IDs
 * @param routes - computed routes
 * @returns array of components, each a set of system IDs
 */
function findConnectedComponents(
  systemIds: readonly string[],
  routes: readonly Route[]
): Set<string>[] {
  const adjacency = new Map<string, Set<string>>();
  for (const id of systemIds) {
    adjacency.set(id, new Set());
  }
  for (const route of routes) {
    adjacency.get(route.originId)?.add(route.destinationId);
    adjacency.get(route.destinationId)?.add(route.originId);
  }

  const visited = new Set<string>();
  const components: Set<string>[] = [];

  for (const id of systemIds) {
    if (visited.has(id)) {
      continue;
    }
    const component = new Set<string>();
    const queue: string[] = [id];
    visited.add(id);

    while (queue.length > 0) {
      const current = queue.shift() as string;
      component.add(current);
      /* istanbul ignore next -- adjacency always initialized for all systemIds */
      for (const neighbor of adjacency.get(current) ?? []) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }

    components.push(component);
  }

  return components;
}

/**
 * Builds routes between Oikumene system pairs.
 *
 * Algorithm:
 * 1. Build spatial hash and pre-filter pairs by Euclidean distance
 * 2. Run A* pathfinding for each candidate pair
 * 3. Validate connectivity and add bridge routes for disconnected components
 *
 * @param config - route builder configuration
 * @returns array of computed routes
 */
export function buildRoutes(config: RouteBuilderConfig): Route[] {
  const { oikumeneSystems, costMap, routeConfig } = config;

  if (oikumeneSystems.length < 2) {
    return [];
  }

  const { maxRange } = routeConfig;
  const systemMap = new Map<string, OikumeneSystem>();
  for (const system of oikumeneSystems) {
    systemMap.set(system.id, system);
  }

  // Step 1: Build spatial hash for efficient neighbor queries
  const spatialHash = new SpatialHash(maxRange, Math.ceil(costMap.width / maxRange) + 1);
  const indexById = new Map<string, number>();
  for (let i = 0; i < oikumeneSystems.length; i++) {
    const system = oikumeneSystems[i] as OikumeneSystem;
    spatialHash.insert(i, system.x, system.y);
    indexById.set(system.id, i);
  }

  // Step 2: Find candidate pairs within maxRange using spatial hash
  const pathfinder = createPathfinder(
    costMap.data,
    costMap.width,
    costMap.height,
    costMap.quantization
  );

  const processedPairs = new Set<string>();
  const routes: Route[] = [];

  for (let i = 0; i < oikumeneSystems.length; i++) {
    const systemA = oikumeneSystems[i] as OikumeneSystem;
    const neighbors = spatialHash.queryRadius(systemA.x, systemA.y, maxRange);

    for (const neighborIdx of neighbors) {
      if (neighborIdx <= i) {
        continue;
      }
      const systemB = oikumeneSystems[neighborIdx] as OikumeneSystem;
      const key = pairKey(systemA.id, systemB.id);

      /* istanbul ignore if -- spatial hash returns unique indices; guard prevents theoretical duplicates */
      if (processedPairs.has(key)) {
        continue;
      }
      processedPairs.add(key);

      const result = pathfinder.findPath(
        { x: systemA.x, y: systemA.y },
        { x: systemB.x, y: systemB.y }
      );

      if (result === null) {
        continue;
      }

      const route = buildRoute(systemA, systemB, result.path, result.totalCost);
      routes.push(route);
    }
  }

  // Step 3: Validate connectivity and add bridge routes
  const systemIds = oikumeneSystems.map((s) => s.id);
  const components = findConnectedComponents(systemIds, routes);

  if (components.length > 1) {
    addBridgeRoutes(components, oikumeneSystems, costMap, routes, processedPairs);
  }

  return routes;
}

/**
 * Creates a Route with correct lexicographic ordering.
 *
 * @param systemA - first system
 * @param systemB - second system
 * @param path - computed path coordinates
 * @param cost - total traversal cost
 * @returns Route with originId < destinationId
 */
function buildRoute(
  systemA: OikumeneSystem,
  systemB: OikumeneSystem,
  path: readonly Coordinate[],
  cost: number
): Route {
  if (systemA.id < systemB.id) {
    return {
      originId: systemA.id,
      destinationId: systemB.id,
      cost,
      path,
    };
  }
  return {
    originId: systemB.id,
    destinationId: systemA.id,
    cost,
    path: [...path].reverse(),
  };
}

/**
 * Adds bridge routes to connect disconnected components.
 *
 * For each pair of disconnected components, finds the closest pair of
 * systems (by Euclidean distance) and runs A* without distance cap.
 *
 * @param components - disconnected component sets
 * @param systems - all Oikumene systems
 * @param costMap - traversal cost map
 * @param routes - existing routes (mutated to add bridges)
 * @param processedPairs - already processed pair keys (mutated)
 */
function addBridgeRoutes(
  components: Set<string>[],
  systems: readonly OikumeneSystem[],
  costMap: CostMap,
  routes: Route[],
  processedPairs: Set<string>
): void {
  const systemMap = new Map<string, OikumeneSystem>();
  for (const system of systems) {
    systemMap.set(system.id, system);
  }

  // Bridge pathfinder without maxCost restriction
  const bridgePathfinder = createPathfinder(
    costMap.data,
    costMap.width,
    costMap.height,
    costMap.quantization
  );

  // Connect components using closest-pair bridges
  // Use union-find approach: connect component 0 to each other component
  for (let ci = 1; ci < components.length; ci++) {
    const compA = components[0] as Set<string>;
    const compB = components[ci] as Set<string>;

    // Find closest pair between compA and compB
    let bestDist = Infinity;
    let bestA: OikumeneSystem | null = null;
    let bestB: OikumeneSystem | null = null;

    for (const idA of compA) {
      const sysA = systemMap.get(idA) as OikumeneSystem;
      for (const idB of compB) {
        const sysB = systemMap.get(idB) as OikumeneSystem;
        const dx = sysA.x - sysB.x;
        const dy = sysA.y - sysB.y;
        const dist = dx * dx + dy * dy;
        if (dist < bestDist) {
          bestDist = dist;
          bestA = sysA;
          bestB = sysB;
        }
      }
    }

    /* istanbul ignore if -- components always have at least one system */
    if (bestA === null || bestB === null) {
      continue;
    }

    const key = pairKey(bestA.id, bestB.id);
    /* istanbul ignore if -- disconnected components never share an existing route */
    if (processedPairs.has(key)) {
      for (const id of compB) {
        compA.add(id);
      }
      continue;
    }
    processedPairs.add(key);

    const result = bridgePathfinder.findPath(
      { x: bestA.x, y: bestA.y },
      { x: bestB.x, y: bestB.y }
    );

    /* istanbul ignore if -- bridge A* on uncapped cost map should find a path */
    if (result === null) {
      continue;
    }

    const route = buildRoute(bestA, bestB, result.path, result.totalCost);
    routes.push(route);

    // Merge compB into compA for future iterations
    for (const id of compB) {
      compA.add(id);
    }
  }
}
