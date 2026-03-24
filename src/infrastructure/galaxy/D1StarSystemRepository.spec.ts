/**
 * Integration tests for D1StarSystemRepository.
 *
 * Uses `@cloudflare/vitest-pool-workers` with isolatedStorage for test isolation.
 */

import { applyD1Migrations, env } from 'cloudflare:test';
import { beforeAll, describe, expect, it } from 'vitest';

import type { Env } from '../../shared/env.js';

import { D1StarSystemRepository } from './D1StarSystemRepository.js';

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
    ],
  },
];

/**
 * Insert a star system row into the D1 database.
 *
 * @param db - The D1 database instance
 * @param fields - Column values for the star_systems row
 * @param fields.id - Unique identifier
 * @param fields.name - System name
 * @param fields.x - X coordinate
 * @param fields.y - Y coordinate
 * @param fields.is_oikumene - Whether part of the oikumene (0 or 1)
 * @param fields.classification - Star classification
 * @param fields.density - System density
 * @param fields.attributes - JSON-encoded attributes
 * @param fields.planetary - JSON-encoded planetary data
 * @param fields.civilization - JSON-encoded civilization data
 * @param fields.trade_codes - JSON-encoded trade codes
 * @param fields.economics - JSON-encoded economics data
 */
async function insertStarSystem(
  db: D1Database,
  fields: {
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
  }
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

/** Default row values matching the stubStarSystem fixture. */
const SOL_ROW = {
  id: 'sol-001',
  name: 'Sol',
  x: 0,
  y: 0,
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
} as const;

describe('D1StarSystemRepository', () => {
  beforeAll(async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call -- cloudflare:test types unresolvable in ESLint tsconfig
    await applyD1Migrations(typedEnv.DB, GALAXY_MIGRATIONS);
  });

  describe('findById', () => {
    it('returns the star system when found', async () => {
      await insertStarSystem(typedEnv.DB, SOL_ROW);

      const repo = new D1StarSystemRepository(typedEnv.DB);
      const result = await repo.findById('sol-001');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('sol-001');
      expect(result?.name).toBe('Sol');
    });

    it('returns null when the ID does not exist', async () => {
      const repo = new D1StarSystemRepository(typedEnv.DB);
      const result = await repo.findById('nonexistent');

      expect(result).toBeNull();
    });
  });
});
