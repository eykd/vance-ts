/**
 * Route graph builder and BFS pair discovery.
 *
 * @module graph
 */

import type { Route } from '../../../src/domain/galaxy/types.js';

/** A discovered trade pair with minimum hop count. */
export interface SystemPair {
  /** Lexicographically smaller system ID. */
  readonly systemA: string;
  /** Lexicographically larger system ID. */
  readonly systemB: string;
  /** Shortest path hop count (1–5). */
  readonly hops: number;
}

/** Maximum BFS depth for pair discovery. */
const MAX_HOPS = 5;

/**
 * Builds an adjacency list from a list of routes.
 *
 * @param routes - The routes to process.
 * @returns A map from system ID to set of neighboring system IDs.
 */
export function buildAdjacencyList(routes: Route[]): Map<string, Set<string>> {
  const adj = new Map<string, Set<string>>();

  const neighbors = (id: string): Set<string> => {
    let set = adj.get(id);
    if (set === undefined) {
      set = new Set();
      adj.set(id, set);
    }
    return set;
  };

  for (const r of routes) {
    neighbors(r.originId).add(r.destinationId);
    neighbors(r.destinationId).add(r.originId);
  }

  return adj;
}

/**
 * Discovers all reachable system pairs within {@link MAX_HOPS} hops using BFS.
 *
 * For each system in the adjacency list, runs a breadth-first search up to
 * depth 5. Pairs are deduplicated with lexicographic ordering (systemA < systemB)
 * and only the minimum hop count is kept.
 *
 * @param adj - Adjacency list from {@link buildAdjacencyList}.
 * @returns Sorted array of discovered pairs with minimum hop counts.
 */
export function discoverPairs(adj: Map<string, Set<string>>): SystemPair[] {
  const pairMap = new Map<string, number>();

  for (const origin of adj.keys()) {
    bfs(adj, origin, pairMap);
  }

  const pairs: SystemPair[] = [];
  for (const [key, hops] of pairMap) {
    const sep = key.indexOf('|');
    pairs.push({
      systemA: key.slice(0, sep),
      systemB: key.slice(sep + 1),
      hops,
    });
  }

  pairs.sort((a, b) =>
    a.systemA < b.systemA
      ? -1
      : a.systemA > b.systemA
        ? 1
        : a.systemB < b.systemB
          ? -1
          : a.systemB > b.systemB
            ? 1
            : 0
  );

  return pairs;
}

/**
 * Runs BFS from a single origin, recording discovered pairs in the shared map.
 *
 * @param adj - Adjacency list.
 * @param origin - Starting system ID.
 * @param pairMap - Shared map of "systemA|systemB" → minimum hops.
 */
function bfs(adj: Map<string, Set<string>>, origin: string, pairMap: Map<string, number>): void {
  const visited = new Set<string>([origin]);
  let frontier: string[] = [origin];

  for (let depth = 1; depth <= MAX_HOPS; depth++) {
    const next: string[] = [];

    for (const current of frontier) {
      const neighbors = adj.get(current);
      if (neighbors === undefined) {
        continue;
      }
      for (const neighbor of neighbors) {
        if (visited.has(neighbor)) {
          continue;
        }
        visited.add(neighbor);
        next.push(neighbor);

        const [a, b] = origin < neighbor ? [origin, neighbor] : [neighbor, origin];
        const key = `${a}|${b}`;
        const existing = pairMap.get(key);
        if (existing === undefined || depth < existing) {
          pairMap.set(key, depth);
        }
      }
    }

    frontier = next;
  }
}
