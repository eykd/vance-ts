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

/** Auto-incrementing counter for unique coordinates across tests. */
let coordCounter = 0;

/**
 * Create a star system row with unique coordinates.
 *
 * @param overrides - Fields to override from the default row template
 * @returns A complete star_systems row with unique coordinates
 */
function makeRow(
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

describe('D1StarSystemRepository', () => {
  beforeAll(async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call -- cloudflare:test types unresolvable in ESLint tsconfig
    await applyD1Migrations(typedEnv.DB, GALAXY_MIGRATIONS);
  });

  describe('findById', () => {
    it('returns the star system when found', async () => {
      const row = makeRow({ id: 'find-by-id-hit', name: 'Sol' });
      await insertStarSystem(typedEnv.DB, row);

      const repo = new D1StarSystemRepository(typedEnv.DB);
      const result = await repo.findById('find-by-id-hit');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('find-by-id-hit');
      expect(result?.name).toBe('Sol');
    });

    it('returns null when the ID does not exist', async () => {
      const repo = new D1StarSystemRepository(typedEnv.DB);
      const result = await repo.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findByName', () => {
    it('returns the star system when the name matches exactly', async () => {
      const row = makeRow({ id: 'find-by-name-hit', name: 'Vega' });
      await insertStarSystem(typedEnv.DB, row);

      const repo = new D1StarSystemRepository(typedEnv.DB);
      const result = await repo.findByName('Vega');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('find-by-name-hit');
      expect(result?.name).toBe('Vega');
    });

    it('returns null when the name does not exist', async () => {
      const repo = new D1StarSystemRepository(typedEnv.DB);
      const result = await repo.findByName('Nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('searchByNamePrefix', () => {
    it('returns matching systems for a valid prefix', async () => {
      const row1 = makeRow({ id: 'prefix-a1', name: 'Proxima Alpha' });
      const row2 = makeRow({ id: 'prefix-a2', name: 'Proxima Beta' });
      const row3 = makeRow({ id: 'prefix-a3', name: 'Deneb' });
      await insertStarSystem(typedEnv.DB, row1);
      await insertStarSystem(typedEnv.DB, row2);
      await insertStarSystem(typedEnv.DB, row3);

      const repo = new D1StarSystemRepository(typedEnv.DB);
      const results = await repo.searchByNamePrefix('Proxima');

      expect(results).toHaveLength(2);
      expect(results.map((s) => s.name)).toEqual(['Proxima Alpha', 'Proxima Beta']);
    });

    it('returns empty array when prefix is shorter than 2 characters', async () => {
      const row = makeRow({ id: 'prefix-short', name: 'Sirius' });
      await insertStarSystem(typedEnv.DB, row);

      const repo = new D1StarSystemRepository(typedEnv.DB);
      const results = await repo.searchByNamePrefix('S');

      expect(results).toEqual([]);
    });

    it('respects the limit parameter', async () => {
      const row1 = makeRow({ id: 'limit-1', name: 'Betelgeuse Alpha' });
      const row2 = makeRow({ id: 'limit-2', name: 'Betelgeuse Beta' });
      await insertStarSystem(typedEnv.DB, row1);
      await insertStarSystem(typedEnv.DB, row2);

      const repo = new D1StarSystemRepository(typedEnv.DB);
      const results = await repo.searchByNamePrefix('Betelgeuse', 1);

      expect(results).toHaveLength(1);
    });

    it('escapes LIKE metacharacters in the prefix', async () => {
      const row1 = makeRow({ id: 'escape-1', name: '100% Pure' });
      const row2 = makeRow({ id: 'escape-2', name: '10X Growth' });
      await insertStarSystem(typedEnv.DB, row1);
      await insertStarSystem(typedEnv.DB, row2);

      const repo = new D1StarSystemRepository(typedEnv.DB);
      const results = await repo.searchByNamePrefix('100%');

      expect(results).toHaveLength(1);
      expect(results[0]?.name).toBe('100% Pure');
    });

    it('returns empty array when no systems match', async () => {
      const repo = new D1StarSystemRepository(typedEnv.DB);
      const results = await repo.searchByNamePrefix('Zz');

      expect(results).toEqual([]);
    });
  });
});
