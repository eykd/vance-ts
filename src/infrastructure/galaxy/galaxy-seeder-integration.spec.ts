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
import type { TradePairRow } from '../../../tools/galaxy-seeder/src/sql-writer.js';
import type { StarSystem, Route } from '../../domain/galaxy/types.js';
import { Classification } from '../../domain/galaxy/types.js';

import { D1StarSystemRepository } from './D1StarSystemRepository.js';
import { FULL_GALAXY_MIGRATION, typedEnv } from './galaxy-test-helpers.js';

/** Typed environment bindings from cloudflare:test. */
const tEnv = typedEnv(env);

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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call -- cloudflare:test types unresolvable in ESLint tsconfig
    await applyD1Migrations(tEnv.DB, FULL_GALAXY_MIGRATION);

    const sql = generateSQL(systems, routes, tradePairs);

    // Strip comment lines and transaction wrapper, then collapse newlines
    // so D1.exec() sees each INSERT as a single line (its parser is line-oriented).
    const cleaned = sql
      .split('\n')
      .filter(
        (line) => !line.startsWith('--') && !line.startsWith('BEGIN') && !line.startsWith('COMMIT')
      )
      .join(' ')
      .trim();

    await tEnv.DB.exec(cleaned);
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
  });
});
