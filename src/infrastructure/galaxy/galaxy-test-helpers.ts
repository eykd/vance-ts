/**
 * Shared test helpers for galaxy D1 repository integration tests.
 *
 * Provides schema migrations, row builders, and insert helpers used
 * across D1StarSystemRepository, D1RouteRepository, and D1TradePairRepository tests.
 *
 * @module infrastructure/galaxy/galaxy-test-helpers
 */

import type { Env } from '../../shared/env.js';

/**
 * Casts the untyped `cloudflare:test` env to the application's Env type.
 *
 * @param rawEnv - The untyped env from cloudflare:test
 * @returns Typed environment bindings
 */
export function typedEnv(rawEnv: unknown): Env {
  return rawEnv as Env;
}

/**
 * Galaxy schema migration for star_systems table only.
 *
 * SOURCE OF TRUTH: migrations/0002_galaxy_schema.sql
 */
const STAR_SYSTEMS_QUERIES = [
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
];

/** Routes table DDL statements. */
const ROUTES_QUERIES = [
  `CREATE TABLE routes (
  origin_id      TEXT NOT NULL,
  destination_id TEXT NOT NULL,
  cost           REAL NOT NULL,
  PRIMARY KEY (origin_id, destination_id)
)`,
  'CREATE INDEX idx_routes_destination ON routes (destination_id)',
];

/** Trade pairs table DDL statements. */
const TRADE_PAIRS_QUERIES = [
  `CREATE TABLE trade_pairs (
  system_a_id TEXT    NOT NULL,
  system_b_id TEXT    NOT NULL,
  btn         REAL    NOT NULL,
  hops        INTEGER NOT NULL,
  PRIMARY KEY (system_a_id, system_b_id)
)`,
  'CREATE INDEX idx_trade_pairs_system_b ON trade_pairs (system_b_id)',
];

/**
 * Galaxy schema migration containing only the star_systems table.
 *
 * SOURCE OF TRUTH: migrations/0002_galaxy_schema.sql
 */
export const STAR_SYSTEMS_MIGRATION = [
  { name: '0002_galaxy_schema.sql', queries: STAR_SYSTEMS_QUERIES },
];

/**
 * Galaxy schema migration containing star_systems and routes tables.
 *
 * SOURCE OF TRUTH: migrations/0002_galaxy_schema.sql
 */
export const STAR_SYSTEMS_AND_ROUTES_MIGRATION = [
  {
    name: '0002_galaxy_schema.sql',
    queries: [...STAR_SYSTEMS_QUERIES, ...ROUTES_QUERIES],
  },
];

/**
 * Full galaxy schema migration containing star_systems, routes, and trade_pairs tables.
 *
 * SOURCE OF TRUTH: migrations/0002_galaxy_schema.sql
 */
export const FULL_GALAXY_MIGRATION = [
  {
    name: '0002_galaxy_schema.sql',
    queries: [...STAR_SYSTEMS_QUERIES, ...ROUTES_QUERIES, ...TRADE_PAIRS_QUERIES],
  },
];

/** Shape of a star_systems row for insertion. */
export interface StarSystemInsertRow {
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

/** Auto-incrementing counter for unique coordinates across tests. */
let coordCounter = 0;

/**
 * Create a star system row with unique coordinates.
 *
 * @param overrides - Fields to override from the default row template
 * @returns A complete star_systems row with unique coordinates
 */
export function makeSystemRow(
  overrides: Partial<{
    readonly id: string;
    readonly name: string;
    readonly x: number;
    readonly y: number;
    readonly is_oikumene: number;
    readonly classification: string;
  }> = {}
): StarSystemInsertRow {
  const n = coordCounter++;
  return {
    id: `sys-${n}`,
    name: `System ${n}`,
    x: n * 100,
    y: n * 100,
    is_oikumene: 1,
    classification: 'oikumene',
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
export async function insertStarSystem(db: D1Database, fields: StarSystemInsertRow): Promise<void> {
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

/**
 * Insert a route into the D1 database.
 *
 * @param db - The D1 database instance
 * @param originId - Origin star system ID
 * @param destinationId - Destination star system ID
 * @param cost - Route traversal cost
 */
export async function insertRoute(
  db: D1Database,
  originId: string,
  destinationId: string,
  cost: number
): Promise<void> {
  await db
    .prepare('INSERT INTO routes (origin_id, destination_id, cost) VALUES (?, ?, ?)')
    .bind(originId, destinationId, cost)
    .run();
}

/**
 * Insert a trade pair into the D1 database.
 *
 * @param db - The D1 database instance
 * @param systemAId - First star system ID
 * @param systemBId - Second star system ID
 * @param btn - Bilateral Trade Number
 * @param hops - Number of route hops between systems
 */
export async function insertTradePair(
  db: D1Database,
  systemAId: string,
  systemBId: string,
  btn: number,
  hops: number
): Promise<void> {
  await db
    .prepare('INSERT INTO trade_pairs (system_a_id, system_b_id, btn, hops) VALUES (?, ?, ?, ?)')
    .bind(systemAId, systemBId, btn, hops)
    .run();
}
