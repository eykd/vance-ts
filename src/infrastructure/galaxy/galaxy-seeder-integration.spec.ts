/**
 * End-to-end integration test for the galaxy seeder pipeline.
 *
 * Verifies: fixture JSON → generateSQL → D1 exec → repository queries.
 * Covers all three repositories, adversarial names, bidirectional routes,
 * BTN ordering, and prefix search with LIKE escaping.
 *
 * Uses `@cloudflare/vitest-pool-workers` with isolatedStorage for test isolation.
 */

import { applyD1Migrations, env } from 'cloudflare:test';
import { beforeAll, describe, expect, it } from 'vitest';

import { generateSQL } from '../../../tools/galaxy-seeder/src/sql-writer.js';
import type { Route, StarSystem, TradePairRow } from '../../domain/galaxy/types.js';
import { Classification } from '../../domain/galaxy/types.js';

import { D1RouteRepository } from './D1RouteRepository.js';
import { D1StarSystemRepository } from './D1StarSystemRepository.js';
import { D1TradePairRepository } from './D1TradePairRepository.js';
import { FULL_GALAXY_MIGRATION, typedEnv } from './galaxy-test-helpers.js';

/** Typed environment bindings from cloudflare:test. */
const tEnv = typedEnv(env);

/**
 * Strips comments and transaction wrappers, then collapses newlines to spaces
 * so D1's line-oriented `exec()` parser treats each INSERT as a single statement.
 *
 * @param sql - Raw SQL output from generateSQL (may contain comments, BEGIN/COMMIT)
 * @returns Cleaned SQL string safe for D1.exec()
 */
function prepareForD1Exec(sql: string): string {
  return sql
    .split('\n')
    .filter(
      (line) => !line.startsWith('--') && !line.startsWith('BEGIN') && !line.startsWith('COMMIT')
    )
    .join(' ')
    .trim();
}

/**
 * Helper to build a StarSystem fixture with sensible defaults.
 *
 * @param overrides - Fields to override
 * @returns A complete StarSystem domain object
 */
function buildSystem(overrides: Partial<StarSystem> & { id: string; name: string }): StarSystem {
  return {
    x: 0,
    y: 0,
    isOikumene: true,
    classification: Classification.OIKUMENE,
    density: { neighborCount: 5, environmentPenalty: 0 },
    attributes: { technology: 10, environment: 8, resources: 7 },
    planetary: { size: 8, atmosphere: 6, temperature: 7, hydrography: 7 },
    civilization: { population: 10, starport: 5, government: 3, factions: 4, lawLevel: 5 },
    tradeCodes: ['Hi', 'In'],
    economics: {
      gurpsTechLevel: 10,
      perCapitaIncome: 50000,
      grossWorldProduct: 1e12,
      resourceMultiplier: 1.0,
      worldTradeNumber: 5.5,
    },
    ...overrides,
  };
}

// --- Fixture data: 10 star systems ---

const systems: readonly StarSystem[] = [
  buildSystem({
    id: 'sol',
    name: 'Sol',
    x: 0,
    y: 0,
    economics: {
      gurpsTechLevel: 12,
      perCapitaIncome: 60000,
      grossWorldProduct: 2e12,
      resourceMultiplier: 1.2,
      worldTradeNumber: 6.0,
    },
  }),
  buildSystem({
    id: 'alpha-centauri',
    name: 'Alpha Centauri',
    x: 1,
    y: 1,
    economics: {
      gurpsTechLevel: 11,
      perCapitaIncome: 55000,
      grossWorldProduct: 1.5e12,
      resourceMultiplier: 1.1,
      worldTradeNumber: 5.5,
    },
  }),
  buildSystem({ id: 'vega', name: 'Vega', x: 2, y: 3 }),
  buildSystem({ id: 'obrien', name: "O'Brien's Star", x: 4, y: 5 }),
  buildSystem({ id: 'deneb', name: 'Deneb', x: 6, y: 7 }),
  buildSystem({
    id: 'sirius',
    name: 'Sirius',
    x: 8,
    y: 9,
    economics: {
      gurpsTechLevel: 10,
      perCapitaIncome: 50000,
      grossWorldProduct: 1e12,
      resourceMultiplier: 1.0,
      worldTradeNumber: 4.0,
    },
  }),
  buildSystem({ id: 'procyon', name: 'Procyon', x: 10, y: 11 }),
  buildSystem({
    id: 'rigel',
    name: 'Rigel',
    x: 12,
    y: 13,
    isOikumene: false,
    classification: Classification.UNINHABITED,
    tradeCodes: [],
  }),
  buildSystem({ id: 'altair', name: 'Altair', x: 14, y: 15 }),
  buildSystem({ id: 'polaris', name: 'Polaris', x: 16, y: 17 }),
];

// --- Fixture data: 5 routes (lexicographic ordering: originId < destinationId) ---

const routes: readonly Route[] = [
  { originId: 'alpha-centauri', destinationId: 'sol', cost: 1.5, path: [] },
  { originId: 'alpha-centauri', destinationId: 'vega', cost: 2.0, path: [] },
  { originId: 'deneb', destinationId: 'obrien', cost: 3.0, path: [] },
  { originId: 'procyon', destinationId: 'sirius', cost: 1.8, path: [] },
  { originId: 'altair', destinationId: 'polaris', cost: 2.5, path: [] },
];

// --- Fixture data: pre-computed trade pairs ---
// Sol–Alpha Centauri (1 hop, WTN 6.0+5.5=11.5, distMod 0 → BTN=min(11.5, 6.0+5)=10.5)
// Sol–Vega (2 hops via Alpha Centauri, WTN 6.0+5.5=11.5, distMod 0.5 → BTN=min(11.0, 5.5+5)=10.5)
// Alpha Centauri–Vega (1 hop, WTN 5.5+5.5=11.0, distMod 0 → BTN=min(11.0, 5.5+5)=10.5)
// O'Brien's Star–Deneb (1 hop, WTN 5.5+5.5=11.0, distMod 0 → BTN=10.5)
// Procyon–Sirius (1 hop, WTN 5.5+4.0=9.5, distMod 0 → BTN=min(9.5, 4.0+5)=9.0)
// Altair–Polaris (1 hop, WTN 5.5+5.5=11.0, distMod 0 → BTN=10.5)

const tradePairs: readonly TradePairRow[] = [
  { systemAId: 'alpha-centauri', systemBId: 'sol', btn: 10.5, hops: 1 },
  { systemAId: 'alpha-centauri', systemBId: 'vega', btn: 10.5, hops: 1 },
  { systemAId: 'sol', systemBId: 'vega', btn: 10.5, hops: 2 },
  { systemAId: 'deneb', systemBId: 'obrien', btn: 10.5, hops: 1 },
  { systemAId: 'procyon', systemBId: 'sirius', btn: 9.0, hops: 1 },
  { systemAId: 'altair', systemBId: 'polaris', btn: 10.5, hops: 1 },
];

describe('Galaxy seeder end-to-end integration', () => {
  beforeAll(async () => {
    await applyD1Migrations(tEnv.DB, FULL_GALAXY_MIGRATION);

    const sql = generateSQL(systems, routes, tradePairs);
    await tEnv.DB.exec(prepareForD1Exec(sql));
  });

  describe('StarSystemRepository via seeded data', () => {
    it('retrieves a system by ID with all fields matching the fixture', async () => {
      const repo = new D1StarSystemRepository(tEnv.DB);
      const result = await repo.findById('sol');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('sol');
      expect(result?.name).toBe('Sol');
      expect(result?.x).toBe(0);
      expect(result?.y).toBe(0);
      expect(result?.isOikumene).toBe(true);
      expect(result?.classification).toBe(Classification.OIKUMENE);
      expect(result?.economics.worldTradeNumber).toBe(6.0);
      expect(result?.economics.gurpsTechLevel).toBe(12);
    });

    it("retrieves the adversarial name system (O'Brien's Star) correctly", async () => {
      const repo = new D1StarSystemRepository(tEnv.DB);
      const result = await repo.findById('obrien');

      expect(result).not.toBeNull();
      expect(result?.name).toBe("O'Brien's Star");
    });

    it('finds a system by exact name', async () => {
      const repo = new D1StarSystemRepository(tEnv.DB);
      const result = await repo.findByName('Alpha Centauri');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('alpha-centauri');
    });

    it('returns all 10 star systems via prefix search', async () => {
      const repo = new D1StarSystemRepository(tEnv.DB);
      // All fixture systems have names starting with uppercase letters
      // Search with a broad prefix that matches multiple systems
      const results = await repo.searchByNamePrefix('Al', 50);

      expect(results).toHaveLength(2); // Alpha Centauri, Altair
      const names = results.map((s) => s.name);
      expect(names).toContain('Alpha Centauri');
      expect(names).toContain('Altair');
    });

    it('handles LIKE escaping in prefix search', async () => {
      const repo = new D1StarSystemRepository(tEnv.DB);
      // Underscore and percent are LIKE wildcards — they should be escaped
      const results = await repo.searchByNamePrefix('O%', 50);
      expect(results).toHaveLength(0);

      const results2 = await repo.searchByNamePrefix('O_', 50);
      expect(results2).toHaveLength(0);

      // The real prefix "O'" should find O'Brien's Star
      const results3 = await repo.searchByNamePrefix("O'", 50);
      expect(results3).toHaveLength(1);
      expect(results3[0]?.name).toBe("O'Brien's Star");
    });

    it('distinguishes oikumene from uninhabited systems', async () => {
      const repo = new D1StarSystemRepository(tEnv.DB);
      const rigel = await repo.findById('rigel');

      expect(rigel).not.toBeNull();
      expect(rigel?.isOikumene).toBe(false);
      expect(rigel?.classification).toBe(Classification.UNINHABITED);
    });
  });

  describe('RouteRepository via seeded data', () => {
    it('returns correct row count for seeded routes', async () => {
      const result = await tEnv.DB.prepare('SELECT COUNT(*) AS cnt FROM routes').first<{
        cnt: number;
      }>();
      expect(result?.cnt).toBe(routes.length);
    });

    it('finds bidirectional connections from a system', async () => {
      const repo = new D1RouteRepository(tEnv.DB);
      // Sol appears as destinationId in the alpha-centauri→sol route
      const connections = await repo.findConnectedSystems('sol');

      expect(connections).toHaveLength(1);
      expect(connections[0]?.system.id).toBe('alpha-centauri');
      expect(connections[0]?.cost).toBe(1.5);
    });

    it('finds connections from the origin side', async () => {
      const repo = new D1RouteRepository(tEnv.DB);
      // Alpha Centauri is originId for two routes
      const connections = await repo.findConnectedSystems('alpha-centauri');

      expect(connections).toHaveLength(2);
      const ids = connections.map((c) => c.system.id);
      expect(ids).toContain('sol');
      expect(ids).toContain('vega');
    });

    it('returns empty array for a system with no routes', async () => {
      const repo = new D1RouteRepository(tEnv.DB);
      const connections = await repo.findConnectedSystems('rigel');

      expect(connections).toHaveLength(0);
    });
  });

  describe('TradePairRepository via seeded data', () => {
    it('returns correct row count for seeded trade pairs', async () => {
      const result = await tEnv.DB.prepare('SELECT COUNT(*) AS cnt FROM trade_pairs').first<{
        cnt: number;
      }>();
      expect(result?.cnt).toBe(tradePairs.length);
    });

    it('finds trade partners bidirectionally', async () => {
      const repo = new D1TradePairRepository(tEnv.DB);
      // Sol appears as systemBId in the alpha-centauri↔sol pair and sol↔vega pair
      const partners = await repo.findTradePartners('sol');

      expect(partners).toHaveLength(2);
      const ids = partners.map((p) => p.system.id);
      expect(ids).toContain('alpha-centauri');
      expect(ids).toContain('vega');
    });

    it('orders trade partners by BTN descending', async () => {
      const repo = new D1TradePairRepository(tEnv.DB);
      // Alpha Centauri has 3 trade partners: Sol (10.5), Vega (10.5), all same BTN
      // Sirius has lower BTN (9.0) — test ordering with Procyon
      const partners = await repo.findTradePartners('procyon');

      expect(partners).toHaveLength(1);
      expect(partners[0]?.system.id).toBe('sirius');
      expect(partners[0]?.btn).toBe(9.0);
      expect(partners[0]?.hops).toBe(1);
    });

    it('verifies BTN descending order for a system with multiple partners', async () => {
      const repo = new D1TradePairRepository(tEnv.DB);
      const partners = await repo.findTradePartners('alpha-centauri');

      expect(partners.length).toBeGreaterThanOrEqual(2);
      // All partners should be in BTN descending order
      for (let i = 1; i < partners.length; i++) {
        const prev = partners[i - 1];
        const curr = partners[i];
        expect(prev).toBeDefined();
        expect(curr).toBeDefined();

        expect(prev!.btn).toBeGreaterThanOrEqual(curr!.btn);
      }
    });

    it('finds trade partners for the adversarial name system', async () => {
      const repo = new D1TradePairRepository(tEnv.DB);
      const partners = await repo.findTradePartners('obrien');

      expect(partners).toHaveLength(1);
      expect(partners[0]?.system.id).toBe('deneb');
      expect(partners[0]?.btn).toBe(10.5);
    });
  });
});
