/**
 * Integration tests for D1RouteRepository.
 *
 * Uses `@cloudflare/vitest-pool-workers` with isolatedStorage for test isolation.
 */

import { applyD1Migrations, env } from 'cloudflare:test';
import { beforeAll, describe, expect, it } from 'vitest';

import { D1RouteRepository } from './D1RouteRepository.js';
import {
  STAR_SYSTEMS_AND_ROUTES_MIGRATION,
  insertRoute,
  insertStarSystem,
  makeSystemRow,
  typedEnv,
} from './galaxy-test-helpers.js';

/** Typed environment bindings from cloudflare:test. */
const tEnv = typedEnv(env);

describe('D1RouteRepository', () => {
  beforeAll(async () => {
    await applyD1Migrations(tEnv.DB, STAR_SYSTEMS_AND_ROUTES_MIGRATION);
  });

  describe('findConnectedSystems', () => {
    it('returns systems connected via origin_id (outbound routes)', async () => {
      const hub = makeSystemRow({ id: 'hub-out', name: 'Hub Outbound' });
      const neighbor = makeSystemRow({ id: 'neighbor-out', name: 'Neighbor Outbound' });
      await insertStarSystem(tEnv.DB, hub);
      await insertStarSystem(tEnv.DB, neighbor);
      await insertRoute(tEnv.DB, 'hub-out', 'neighbor-out', 2.5);

      const repo = new D1RouteRepository(tEnv.DB);
      const results = await repo.findConnectedSystems('hub-out');

      expect(results).toHaveLength(1);
      expect(results[0]?.system.id).toBe('neighbor-out');
      expect(results[0]?.system.name).toBe('Neighbor Outbound');
      expect(results[0]?.cost).toBe(2.5);
    });

    it('returns systems connected via destination_id (inbound routes)', async () => {
      const origin = makeSystemRow({ id: 'origin-in', name: 'Origin Inbound' });
      const target = makeSystemRow({ id: 'target-in', name: 'Target Inbound' });
      await insertStarSystem(tEnv.DB, origin);
      await insertStarSystem(tEnv.DB, target);
      await insertRoute(tEnv.DB, 'origin-in', 'target-in', 3.0);

      const repo = new D1RouteRepository(tEnv.DB);
      const results = await repo.findConnectedSystems('target-in');

      expect(results).toHaveLength(1);
      expect(results[0]?.system.id).toBe('origin-in');
      expect(results[0]?.system.name).toBe('Origin Inbound');
      expect(results[0]?.cost).toBe(3.0);
    });

    it('returns both inbound and outbound connections for a hub system', async () => {
      const hub = makeSystemRow({ id: 'hub-both', name: 'Hub Both' });
      const outNeighbor = makeSystemRow({ id: 'out-neighbor', name: 'Out Neighbor' });
      const inNeighbor = makeSystemRow({ id: 'in-neighbor', name: 'In Neighbor' });
      await insertStarSystem(tEnv.DB, hub);
      await insertStarSystem(tEnv.DB, outNeighbor);
      await insertStarSystem(tEnv.DB, inNeighbor);
      await insertRoute(tEnv.DB, 'hub-both', 'out-neighbor', 1.5);
      await insertRoute(tEnv.DB, 'in-neighbor', 'hub-both', 4.0);

      const repo = new D1RouteRepository(tEnv.DB);
      const results = await repo.findConnectedSystems('hub-both');

      expect(results).toHaveLength(2);
      const ids = results.map((r) => r.system.id);
      expect(ids).toContain('out-neighbor');
      expect(ids).toContain('in-neighbor');
    });

    it('returns an empty array when no routes exist for the system', async () => {
      const isolated = makeSystemRow({ id: 'isolated', name: 'Isolated System' });
      await insertStarSystem(tEnv.DB, isolated);

      const repo = new D1RouteRepository(tEnv.DB);
      const results = await repo.findConnectedSystems('isolated');

      expect(results).toHaveLength(0);
    });

    it('maps all star system fields correctly on connected systems', async () => {
      const sys1 = makeSystemRow({ id: 'fields-hub', name: 'Fields Hub' });
      const sys2 = makeSystemRow({
        id: 'fields-neighbor',
        name: 'Fields Neighbor',
        is_oikumene: 0,
        classification: 'uninhabited',
      });
      await insertStarSystem(tEnv.DB, sys1);
      await insertStarSystem(tEnv.DB, sys2);
      await insertRoute(tEnv.DB, 'fields-hub', 'fields-neighbor', 7.2);

      const repo = new D1RouteRepository(tEnv.DB);
      const results = await repo.findConnectedSystems('fields-hub');

      expect(results).toHaveLength(1);
      const connected = results[0];
      expect(connected?.system.id).toBe('fields-neighbor');
      expect(connected?.system.name).toBe('Fields Neighbor');
      expect(connected?.system.isOikumene).toBe(false);
      expect(connected?.system.classification).toBe('uninhabited');
      expect(connected?.system.tradeCodes).toEqual(['Hi', 'In']);
      expect(connected?.cost).toBe(7.2);
    });
  });
});
