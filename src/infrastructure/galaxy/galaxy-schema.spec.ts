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
  classification TEXT    NOT NULL CHECK (classification IN ('oikumene','uninhabited','lost_colony','hidden_enclave')),
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
  origin_id      TEXT NOT NULL REFERENCES star_systems(id),
  destination_id TEXT NOT NULL REFERENCES star_systems(id),
  cost           REAL NOT NULL,
  PRIMARY KEY (origin_id, destination_id)
)`,
      'CREATE INDEX idx_routes_destination ON routes (destination_id)',
      `CREATE TABLE trade_pairs (
  system_a_id TEXT    NOT NULL REFERENCES star_systems(id),
  system_b_id TEXT    NOT NULL REFERENCES star_systems(id),
  btn         REAL    NOT NULL,
  hops        INTEGER NOT NULL,
  PRIMARY KEY (system_a_id, system_b_id)
)`,
      'CREATE INDEX idx_trade_pairs_system_b ON trade_pairs (system_b_id)',
    ],
  },
];

/** Projected columns from pragma_table_info used in schema assertions. */
interface ColumnProjection {
  readonly name: string;
  readonly type: string;
  readonly notnull: number;
  readonly pk: number;
}

describe('galaxy schema migration', () => {
  beforeAll(async () => {
    await applyD1Migrations(typedEnv.DB, GALAXY_MIGRATIONS);
  });

  it('creates the star_systems table with all required columns', async () => {
    const { results: columns } = await typedEnv.DB.prepare(
      'SELECT name, type, "notnull", pk FROM pragma_table_info(\'star_systems\') ORDER BY cid'
    ).all<ColumnProjection>();

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

  it('creates the routes table with composite primary key', async () => {
    const { results: columns } = await typedEnv.DB.prepare(
      'SELECT name, type, "notnull", pk FROM pragma_table_info(\'routes\') ORDER BY cid'
    ).all<ColumnProjection>();

    expect(columns).toEqual([
      { name: 'origin_id', type: 'TEXT', notnull: 1, pk: 1 },
      { name: 'destination_id', type: 'TEXT', notnull: 1, pk: 2 },
      { name: 'cost', type: 'REAL', notnull: 1, pk: 0 },
    ]);
  });

  it('creates the trade_pairs table with composite primary key', async () => {
    const { results: columns } = await typedEnv.DB.prepare(
      'SELECT name, type, "notnull", pk FROM pragma_table_info(\'trade_pairs\') ORDER BY cid'
    ).all<ColumnProjection>();

    expect(columns).toEqual([
      { name: 'system_a_id', type: 'TEXT', notnull: 1, pk: 1 },
      { name: 'system_b_id', type: 'TEXT', notnull: 1, pk: 2 },
      { name: 'btn', type: 'REAL', notnull: 1, pk: 0 },
      { name: 'hops', type: 'INTEGER', notnull: 1, pk: 0 },
    ]);
  });

  it('creates all required indexes', async () => {
    const { results: indexes } = await typedEnv.DB.prepare(
      `SELECT name, tbl_name FROM sqlite_master
       WHERE type = 'index' AND name LIKE 'idx_%'
       ORDER BY name`
    ).all<{ readonly name: string; readonly tbl_name: string }>();

    expect(indexes).toEqual([
      { name: 'idx_routes_destination', tbl_name: 'routes' },
      { name: 'idx_star_systems_classification', tbl_name: 'star_systems' },
      { name: 'idx_star_systems_coords', tbl_name: 'star_systems' },
      { name: 'idx_star_systems_name', tbl_name: 'star_systems' },
      { name: 'idx_trade_pairs_system_b', tbl_name: 'trade_pairs' },
    ]);
  });

  it('enforces UNIQUE constraint on star_systems name', async () => {
    await typedEnv.DB.prepare(
      `INSERT INTO star_systems (id, name, x, y, is_oikumene, classification, density, attributes, planetary, civilization, trade_codes, economics)
       VALUES ('s1', 'Sol', 0, 0, 1, 'oikumene', 'medium', '[]', '[]', '[]', '[]', '{}')`
    ).run();

    await expect(
      typedEnv.DB.prepare(
        `INSERT INTO star_systems (id, name, x, y, is_oikumene, classification, density, attributes, planetary, civilization, trade_codes, economics)
         VALUES ('s2', 'Sol', 1, 1, 0, 'uninhabited', 'low', '[]', '[]', '[]', '[]', '{}')`
      ).run()
    ).rejects.toThrow(/UNIQUE/);
  });

  it('enforces CHECK constraint on star_systems classification', async () => {
    await expect(
      typedEnv.DB.prepare(
        `INSERT INTO star_systems (id, name, x, y, is_oikumene, classification, density, attributes, planetary, civilization, trade_codes, economics)
         VALUES ('s-chk', 'CheckTest', 99, 99, 0, 'invalid_class', 'low', '[]', '[]', '[]', '[]', '{}')`
      ).run()
    ).rejects.toThrow(/CHECK/);
  });

  it('accepts valid classification values', async () => {
    const validValues = ['oikumene', 'uninhabited', 'lost_colony', 'hidden_enclave'] as const;
    for (let i = 0; i < validValues.length; i++) {
      const cls = validValues[i]!;
      await typedEnv.DB.prepare(
        `INSERT INTO star_systems (id, name, x, y, is_oikumene, classification, density, attributes, planetary, civilization, trade_codes, economics)
         VALUES (?, ?, ?, ?, 0, ?, 'low', '[]', '[]', '[]', '[]', '{}')`
      )
        .bind(`valid-${String(i)}`, `ValidSys${String(i)}`, 200 + i, 200 + i, cls)
        .run();
    }

    const { results } = await typedEnv.DB.prepare(
      `SELECT DISTINCT classification FROM star_systems WHERE id LIKE 'valid-%' ORDER BY classification`
    ).all<{ readonly classification: string }>();

    expect(results.map((r) => r.classification)).toEqual([
      'hidden_enclave',
      'lost_colony',
      'oikumene',
      'uninhabited',
    ]);
  });

  it('enforces UNIQUE constraint on star_systems coordinates', async () => {
    await typedEnv.DB.prepare(
      `INSERT INTO star_systems (id, name, x, y, is_oikumene, classification, density, attributes, planetary, civilization, trade_codes, economics)
       VALUES ('s3', 'Alpha', 5, 5, 0, 'oikumene', 'high', '[]', '[]', '[]', '[]', '{}')`
    ).run();

    await expect(
      typedEnv.DB.prepare(
        `INSERT INTO star_systems (id, name, x, y, is_oikumene, classification, density, attributes, planetary, civilization, trade_codes, economics)
         VALUES ('s4', 'Beta', 5, 5, 1, 'uninhabited', 'low', '[]', '[]', '[]', '[]', '{}')`
      ).run()
    ).rejects.toThrow(/UNIQUE/);
  });
});
