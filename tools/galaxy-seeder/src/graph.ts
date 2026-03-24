/**
 * Route graph builder and BFS pair discovery.
 *
 * @module graph
 */

import type { Route } from '../../../src/domain/galaxy/types.js';

/**
 * Builds an adjacency list from a list of routes.
 *
 * @param routes - The routes to process.
 * @returns A map from system ID to set of neighboring system IDs.
 */
export function buildAdjacencyList(routes: Route[]): Map<string, Set<string>> {
  const adj = new Map<string, Set<string>>();

  for (const r of routes) {
    if (!adj.has(r.originId)) {
      adj.set(r.originId, new Set());
    }
    adj.get(r.originId)!.add(r.destinationId);

    if (!adj.has(r.destinationId)) {
      adj.set(r.destinationId, new Set());
    }
    adj.get(r.destinationId)!.add(r.originId);
  }

  return adj;
}
