/**
 * Tests for the route graph builder and BFS pair discovery.
 *
 * @module graph.spec
 */

import { describe, it, expect } from 'vitest';

import type { Route } from '../../../src/domain/galaxy/types.js';

import { buildAdjacencyList, discoverPairs } from './graph.js';
import type { SystemPair } from './graph.js';

/* ---------- helpers ---------- */

/**
 * Creates a minimal Route between two system IDs.
 *
 * @param originId - The origin system ID.
 * @param destinationId - The destination system ID.
 * @returns A Route with cost 1 and empty path.
 */
function route(originId: string, destinationId: string): Route {
  return { originId, destinationId, cost: 1, path: [] };
}

/* ========== buildAdjacencyList ========== */

describe('buildAdjacencyList', () => {
  it('returns an empty map when given no routes', () => {
    const adj = buildAdjacencyList([]);

    expect(adj.size).toBe(0);
  });

  it('creates bidirectional edges for a single route', () => {
    const adj = buildAdjacencyList([route('A', 'B')]);

    expect(adj.get('A')).toEqual(new Set(['B']));
    expect(adj.get('B')).toEqual(new Set(['A']));
  });

  it('merges neighbors for a chain A-B-C', () => {
    const adj = buildAdjacencyList([route('A', 'B'), route('B', 'C')]);

    expect(adj.get('A')).toEqual(new Set(['B']));
    expect(adj.get('B')).toEqual(new Set(['A', 'C']));
    expect(adj.get('C')).toEqual(new Set(['B']));
  });

  it('handles a hub with multiple spokes', () => {
    const adj = buildAdjacencyList([route('H', 'A'), route('H', 'B'), route('H', 'C')]);

    expect(adj.get('H')).toEqual(new Set(['A', 'B', 'C']));
    expect(adj.get('A')).toEqual(new Set(['H']));
  });

  it('does not create duplicate edges for repeated routes', () => {
    const adj = buildAdjacencyList([route('A', 'B'), route('A', 'B')]);

    expect(adj.get('A')).toEqual(new Set(['B']));
    expect(adj.get('B')).toEqual(new Set(['A']));
  });
});

/* ========== discoverPairs ========== */

describe('discoverPairs', () => {
  it('returns empty array when adjacency list is empty', () => {
    const pairs = discoverPairs(new Map());

    expect(pairs).toEqual([]);
  });

  it('returns a single pair for a direct connection (1 hop)', () => {
    const adj = buildAdjacencyList([route('A', 'B')]);
    const pairs = discoverPairs(adj);

    expect(pairs).toEqual<SystemPair[]>([{ systemA: 'A', systemB: 'B', hops: 1 }]);
  });

  it('discovers a 2-hop pair through an intermediate system', () => {
    const adj = buildAdjacencyList([route('A', 'B'), route('B', 'C')]);
    const pairs = discoverPairs(adj);

    expect(pairs).toContainEqual({ systemA: 'A', systemB: 'B', hops: 1 });
    expect(pairs).toContainEqual({ systemA: 'B', systemB: 'C', hops: 1 });
    expect(pairs).toContainEqual({ systemA: 'A', systemB: 'C', hops: 2 });
    expect(pairs).toHaveLength(3);
  });

  it('orders pair IDs lexicographically (systemA < systemB)', () => {
    const adj = buildAdjacencyList([route('Z', 'A')]);
    const pairs = discoverPairs(adj);

    expect(pairs).toEqual<SystemPair[]>([{ systemA: 'A', systemB: 'Z', hops: 1 }]);
  });

  it('keeps minimum hop count when a pair is reachable via multiple paths', () => {
    // Triangle: A-B (1 hop), B-C (1 hop), A-C (1 hop)
    // A-B via direct = 1, or via C = 2 → keep 1
    const adj = buildAdjacencyList([route('A', 'B'), route('B', 'C'), route('A', 'C')]);
    const pairs = discoverPairs(adj);

    const ab = pairs.find((p) => p.systemA === 'A' && p.systemB === 'B');
    const ac = pairs.find((p) => p.systemA === 'A' && p.systemB === 'C');
    const bc = pairs.find((p) => p.systemA === 'B' && p.systemB === 'C');

    expect(ab?.hops).toBe(1);
    expect(ac?.hops).toBe(1);
    expect(bc?.hops).toBe(1);
    expect(pairs).toHaveLength(3);
  });

  it('discovers pairs up to exactly 5 hops', () => {
    // Linear chain: A-B-C-D-E-F (5 hops from A to F)
    const adj = buildAdjacencyList([
      route('A', 'B'),
      route('B', 'C'),
      route('C', 'D'),
      route('D', 'E'),
      route('E', 'F'),
    ]);
    const pairs = discoverPairs(adj);

    // A-F is exactly 5 hops — should be included
    expect(pairs).toContainEqual({ systemA: 'A', systemB: 'F', hops: 5 });
  });

  it('excludes pairs beyond 5 hops', () => {
    // Linear chain: A-B-C-D-E-F-G (6 hops from A to G)
    const adj = buildAdjacencyList([
      route('A', 'B'),
      route('B', 'C'),
      route('C', 'D'),
      route('D', 'E'),
      route('E', 'F'),
      route('F', 'G'),
    ]);
    const pairs = discoverPairs(adj);

    // A-G is 6 hops — should NOT be included
    const ag = pairs.find((p) => p.systemA === 'A' && p.systemB === 'G');
    expect(ag).toBeUndefined();

    // But A-F (5 hops) should be present
    expect(pairs).toContainEqual({ systemA: 'A', systemB: 'F', hops: 5 });
    // And B-G (5 hops) should be present
    expect(pairs).toContainEqual({ systemA: 'B', systemB: 'G', hops: 5 });
  });

  it('returns zero pairs for an isolated system with no neighbors', () => {
    // A system in the map but with no neighbors
    const adj = new Map<string, Set<string>>();
    adj.set('lonely', new Set());

    const pairs = discoverPairs(adj);

    expect(pairs).toEqual([]);
  });

  it('handles a hub-and-spoke graph correctly', () => {
    // Hub H connected to A, B, C — A-B, A-C, B-C are all 2 hops
    const adj = buildAdjacencyList([route('H', 'A'), route('H', 'B'), route('H', 'C')]);
    const pairs = discoverPairs(adj);

    expect(pairs).toContainEqual({ systemA: 'A', systemB: 'H', hops: 1 });
    expect(pairs).toContainEqual({ systemA: 'B', systemB: 'H', hops: 1 });
    expect(pairs).toContainEqual({ systemA: 'C', systemB: 'H', hops: 1 });
    expect(pairs).toContainEqual({ systemA: 'A', systemB: 'B', hops: 2 });
    expect(pairs).toContainEqual({ systemA: 'A', systemB: 'C', hops: 2 });
    expect(pairs).toContainEqual({ systemA: 'B', systemB: 'C', hops: 2 });
    expect(pairs).toHaveLength(6);
  });

  it('produces deterministic output sorted by systemA then systemB', () => {
    const adj = buildAdjacencyList([route('B', 'A'), route('C', 'A')]);
    const pairs = discoverPairs(adj);

    for (let i = 1; i < pairs.length; i++) {
      const prev = pairs[i - 1]!;
      const curr = pairs[i]!;
      const cmp =
        prev.systemA < curr.systemA ||
        (prev.systemA === curr.systemA && prev.systemB < curr.systemB);
      expect(cmp).toBe(true);
    }
  });
});
