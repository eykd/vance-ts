/**
 * Integration tests for D1TradePairRepository.
 *
 * Uses `@cloudflare/vitest-pool-workers` with isolatedStorage for test isolation.
 */

import { applyD1Migrations, env } from 'cloudflare:test';
import { beforeAll, describe, expect, it } from 'vitest';

import type { Env } from '../../shared/env.js';

import { D1TradePairRepository } from './D1TradePairRepository.js';

/** Typed environment bindings from cloudflare:test. */
const typedEnv = env as unknown as Env;

/**
 * Galaxy schema migration, inlined for Workers runtime compatibility.
 *
 * SOURCE OF TRUTH: migrations/0002_galaxy_schema.sql
 */
const GALAXY_MIGRATIONS = [
  {
    name: '0002_galaxy_schema.sql',
    queries: [
      `CREATE TABLE star_systems (
  id             TEXT    NOT NULL PRIMARY KEY,
  name           TEXT    NOT NULL UNIQUE,
  x              INTEGER NOT NULL,
  y              INTEGER NOT NULL,
  is_oikumene    INTEGER NOT NULL,
  classification TEXT    NOT NULL,
  density        TEXT    NOT NULL,
  attributes     TEXT    NOT NULL,
  planetary      TEXT    NOT NULL,
  civilization   TEXT    NOT NULL,
  trade_codes    TEXT    NOT NULL,
  economics      TEXT    NOT NULL
)`,
      'CREATE UNIQUE INDEX idx_star_systems_coords ON star_systems (x, y)',
      'CREATE INDEX idx_star_systems_name ON star_systems (name)',
      'CREATE INDEX idx_star_systems_classification ON star_systems (classification)',
      `CREATE TABLE routes (
  origin_id      TEXT NOT NULL,
  destination_id TEXT NOT NULL,
  cost           REAL NOT NULL,
  PRIMARY KEY (origin_id, destination_id)
)`,
      'CREATE INDEX idx_routes_destination ON routes (destination_id)',
      `CREATE TABLE trade_pairs (
  system_a_id TEXT    NOT NULL,
  system_b_id TEXT    NOT NULL,
  btn         REAL    NOT NULL,
  hops        INTEGER NOT NULL,
  PRIMARY KEY (system_a_id, system_b_id)
)`,
      'CREATE INDEX idx_trade_pairs_system_b ON trade_pairs (system_b_id)',
    ],
  },
];

/** Auto-incrementing counter for unique coordinates across tests. */
let coordCounter = 0;

/**
 * Create a star system row with unique coordinates.
 *
 * @param overrides - Fields to override from the default row template
 * @returns A complete star_systems row with unique coordinates
 */
function makeSystemRow(
  overrides: Partial<{
    readonly id: string;
    readonly name: string;
    readonly x: number;
    readonly y: number;
    readonly is_oikumene: number;
    readonly classification: string;
  }> = {}
): {
  readonly id: string;
  readonly name: string;
  readonly x: number;
  readonly y: number;
  readonly is_oikumene: number;
  readonly classification: string;
  readonly density: string;
  readonly attributes: string;
  readonly planetary: string;
  readonly civilization: string;
  readonly trade_codes: string;
  readonly economics: string;
} {
  const n = coordCounter++;
  return {
    id: `sys-${n}`,
    name: `System ${n}`,
    x: n * 100,
    y: n * 100,
    is_oikumene: 1,
    classification: 'OIKUMENE',
    density: JSON.stringify({ neighborCount: 5, environmentPenalty: 0 }),
    attributes: JSON.stringify({ technology: 10, environment: 8, resources: 7 }),
    planetary: JSON.stringify({ size: 8, atmosphere: 6, temperature: 7, hydrography: 7 }),
    civilization: JSON.stringify({
      population: 10,
      starport: 5,
      government: 3,
      factions: 4,
      lawLevel: 5,
    }),
    trade_codes: JSON.stringify(['Hi', 'In']),
    economics: JSON.stringify({
      gurpsTechLevel: 10,
      perCapitaIncome: 50000,
      grossWorldProduct: 1e12,
      resourceMultiplier: 1.0,
      worldTradeNumber: 5.5,
    }),
    ...overrides,
  };
}

/**
 * Insert a star system row into the D1 database.
 *
 * @param db - The D1 database instance
 * @param fields - Column values for the star_systems row
 */
async function insertStarSystem(
  db: D1Database,
  fields: ReturnType<typeof makeSystemRow>
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO star_systems (id, name, x, y, is_oikumene, classification, density, attributes, planetary, civilization, trade_codes, economics)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      fields.id,
      fields.name,
      fields.x,
      fields.y,
      fields.is_oikumene,
      fields.classification,
      fields.density,
      fields.attributes,
      fields.planetary,
      fields.civilization,
      fields.trade_codes,
      fields.economics
    )
    .run();
}

describe('D1TradePairRepository', () => {
  beforeAll(async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call -- cloudflare:test types unresolvable in ESLint tsconfig
    await applyD1Migrations(typedEnv.DB, GALAXY_MIGRATIONS);
  });

  describe('findTradePartners', () => {
    it('returns an empty array when no trade pairs exist for the system', async () => {
      const isolated = makeSystemRow({ id: 'isolated-tp', name: 'Isolated Trade System' });
      await insertStarSystem(typedEnv.DB, isolated);

      const repo = new D1TradePairRepository(typedEnv.DB);
      const results = await repo.findTradePartners('isolated-tp');

      expect(results).toHaveLength(0);
    });
  });
});
