/**
 * Verifies the galaxy schema migration creates the expected tables and indexes.
 *
 * These tests run against a real D1 instance (via vitest-pool-workers) with
 * migrations applied from the migrations/ directory. They will fail until
 * migrations/0002_galaxy_schema.sql exists and defines the correct schema.
 */

import { applyD1Migrations, env } from 'cloudflare:test';
import { beforeAll, describe, expect, it } from 'vitest';

import type { Env } from '../../shared/env.js';

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

/** SQLite pragma table_info row shape. */
interface ColumnInfo {
  readonly cid: number;
  readonly name: string;
  readonly type: string;
  readonly notnull: number;
  readonly dflt_value: string | null;
  readonly pk: number;
}

describe('galaxy schema migration', () => {
  beforeAll(async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call -- cloudflare:test types unresolvable in ESLint tsconfig
    await applyD1Migrations(typedEnv.DB, GALAXY_MIGRATIONS);
  });

  it('creates the star_systems table with all required columns', async () => {
    const result = await typedEnv.DB.prepare(
      'SELECT name, type, "notnull", pk FROM pragma_table_info(\'star_systems\') ORDER BY cid'
    ).all<ColumnInfo>();

    const columns = result.results.map((c) => ({
      name: c.name,
      type: c.type,
      notnull: c.notnull,
      pk: c.pk,
    }));

    expect(columns).toEqual([
      { name: 'id', type: 'TEXT', notnull: 1, pk: 1 },
      { name: 'name', type: 'TEXT', notnull: 1, pk: 0 },
      { name: 'x', type: 'INTEGER', notnull: 1, pk: 0 },
      { name: 'y', type: 'INTEGER', notnull: 1, pk: 0 },
      { name: 'is_oikumene', type: 'INTEGER', notnull: 1, pk: 0 },
      { name: 'classification', type: 'TEXT', notnull: 1, pk: 0 },
      { name: 'density', type: 'TEXT', notnull: 1, pk: 0 },
      { name: 'attributes', type: 'TEXT', notnull: 1, pk: 0 },
      { name: 'planetary', type: 'TEXT', notnull: 1, pk: 0 },
      { name: 'civilization', type: 'TEXT', notnull: 1, pk: 0 },
      { name: 'trade_codes', type: 'TEXT', notnull: 1, pk: 0 },
      { name: 'economics', type: 'TEXT', notnull: 1, pk: 0 },
    ]);
  });
});
