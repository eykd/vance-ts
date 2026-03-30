/**
 * Integration tests for D1TradePairRepository.
 *
 * Uses `@cloudflare/vitest-pool-workers` with isolatedStorage for test isolation.
 */

import { applyD1Migrations, env } from 'cloudflare:test';
import { beforeAll, describe, expect, it } from 'vitest';

import { D1TradePairRepository } from './D1TradePairRepository.js';
import {
  FULL_GALAXY_MIGRATION,
  insertStarSystem,
  insertTradePair,
  makeSystemRow,
  typedEnv,
} from './galaxy-test-helpers.js';

/** Typed environment bindings from cloudflare:test. */
const tEnv = typedEnv(env);

describe('D1TradePairRepository', () => {
  beforeAll(async () => {
    await applyD1Migrations(tEnv.DB, FULL_GALAXY_MIGRATION);
  });

  describe('findTradePartners', () => {
    it('returns an empty array when no trade pairs exist for the system', async () => {
      const isolated = makeSystemRow({ id: 'isolated-tp', name: 'Isolated Trade System' });
      await insertStarSystem(tEnv.DB, isolated);

      const repo = new D1TradePairRepository(tEnv.DB);
      const results = await repo.findTradePartners('isolated-tp');

      expect(results).toHaveLength(0);
    });

    it('returns partners where the system is system_a', async () => {
      const origin = makeSystemRow({ id: 'tp-origin-a', name: 'Origin A' });
      const partner = makeSystemRow({ id: 'tp-partner-a', name: 'Partner A' });
      await insertStarSystem(tEnv.DB, origin);
      await insertStarSystem(tEnv.DB, partner);
      await insertTradePair(tEnv.DB, 'tp-origin-a', 'tp-partner-a', 8.5, 2);

      const repo = new D1TradePairRepository(tEnv.DB);
      const results = await repo.findTradePartners('tp-origin-a');

      expect(results).toHaveLength(1);
      expect(results[0]?.system.id).toBe('tp-partner-a');
      expect(results[0]?.system.name).toBe('Partner A');
      expect(results[0]?.btn).toBe(8.5);
      expect(results[0]?.hops).toBe(2);
    });

    it('returns partners where the system is system_b', async () => {
      const systemA = makeSystemRow({ id: 'tp-sys-a', name: 'System A Side' });
      const systemB = makeSystemRow({ id: 'tp-sys-b', name: 'System B Side' });
      await insertStarSystem(tEnv.DB, systemA);
      await insertStarSystem(tEnv.DB, systemB);
      await insertTradePair(tEnv.DB, 'tp-sys-a', 'tp-sys-b', 6.0, 3);

      const repo = new D1TradePairRepository(tEnv.DB);
      const results = await repo.findTradePartners('tp-sys-b');

      expect(results).toHaveLength(1);
      expect(results[0]?.system.id).toBe('tp-sys-a');
      expect(results[0]?.system.name).toBe('System A Side');
      expect(results[0]?.btn).toBe(6.0);
      expect(results[0]?.hops).toBe(3);
    });

    it('returns multiple partners ordered by BTN descending', async () => {
      const hub = makeSystemRow({ id: 'tp-hub', name: 'Trade Hub' });
      const low = makeSystemRow({ id: 'tp-low', name: 'Low BTN' });
      const mid = makeSystemRow({ id: 'tp-mid', name: 'Mid BTN' });
      const high = makeSystemRow({ id: 'tp-high', name: 'High BTN' });
      await insertStarSystem(tEnv.DB, hub);
      await insertStarSystem(tEnv.DB, low);
      await insertStarSystem(tEnv.DB, mid);
      await insertStarSystem(tEnv.DB, high);
      await insertTradePair(tEnv.DB, 'tp-hub', 'tp-low', 3.0, 5);
      await insertTradePair(tEnv.DB, 'tp-hub', 'tp-mid', 6.5, 3);
      await insertTradePair(tEnv.DB, 'tp-high', 'tp-hub', 9.0, 1);

      const repo = new D1TradePairRepository(tEnv.DB);
      const results = await repo.findTradePartners('tp-hub');

      expect(results).toHaveLength(3);
      expect(results[0]?.btn).toBe(9.0);
      expect(results[0]?.system.name).toBe('High BTN');
      expect(results[1]?.btn).toBe(6.5);
      expect(results[1]?.system.name).toBe('Mid BTN');
      expect(results[2]?.btn).toBe(3.0);
      expect(results[2]?.system.name).toBe('Low BTN');
    });

    it('combines both directions in a single result set', async () => {
      const center = makeSystemRow({ id: 'tp-center', name: 'Center' });
      const left = makeSystemRow({ id: 'tp-left', name: 'Left' });
      const right = makeSystemRow({ id: 'tp-right', name: 'Right' });
      await insertStarSystem(tEnv.DB, center);
      await insertStarSystem(tEnv.DB, left);
      await insertStarSystem(tEnv.DB, right);
      // center is system_a for left, system_b for right
      await insertTradePair(tEnv.DB, 'tp-center', 'tp-left', 5.0, 2);
      await insertTradePair(tEnv.DB, 'tp-right', 'tp-center', 7.0, 1);

      const repo = new D1TradePairRepository(tEnv.DB);
      const results = await repo.findTradePartners('tp-center');

      expect(results).toHaveLength(2);
      // Ordered by BTN descending
      expect(results[0]?.btn).toBe(7.0);
      expect(results[0]?.system.name).toBe('Right');
      expect(results[1]?.btn).toBe(5.0);
      expect(results[1]?.system.name).toBe('Left');
    });
  });
});
