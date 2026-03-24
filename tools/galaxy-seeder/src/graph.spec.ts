/**
 * Tests for the route graph builder and BFS pair discovery.
 *
 * @module graph.spec
 */

import { describe, it, expect } from 'vitest';

import { buildAdjacencyList } from './graph.js';

describe('buildAdjacencyList', () => {
  it('returns an empty map when given no routes', () => {
    const adj = buildAdjacencyList([]);

    expect(adj.size).toBe(0);
  });
});
