/**
 * SQL writer module for generating batched INSERT statements.
 *
 * @module sql-writer
 */

import type { Route, StarSystem } from '../../../src/domain/galaxy/types.js';

/** A trade pair row ready for SQL insertion. */
export interface TradePairRow {
  /** Lexicographically smaller system ID. */
  readonly systemAId: string;
  /** Lexicographically larger system ID. */
  readonly systemBId: string;
  /** Bilateral Trade Number. */
  readonly btn: number;
  /** Shortest path hop count. */
  readonly hops: number;
}

/** Batch size for star_systems INSERT statements. */
const STAR_SYSTEMS_BATCH_SIZE = 500;

/** Batch size for routes INSERT statements. */
const ROUTES_BATCH_SIZE = 500;

/** Batch size for trade_pairs INSERT statements. */
const TRADE_PAIRS_BATCH_SIZE = 1000;

/**
 * Escapes a string for safe inclusion in SQL by removing NUL bytes
 * and doubling single quotes.
 *
 * @param value - The string to escape
 * @returns The escaped string safe for SQL literals
 */
export function escapeSQL(value: string): string {
  return value.replace(/\0/g, '').replace(/'/g, "''");
}

/**
 * Wraps a string value in SQL single quotes after escaping.
 *
 * @param value - The string to quote
 * @returns SQL-safe quoted string literal
 */
function sqlString(value: string): string {
  return `'${escapeSQL(value)}'`;
}

/**
 * Serializes a value as a JSON string column, normalizing via JSON.stringify
 * then SQL-escaping.
 *
 * @param value - The value to serialize as JSON
 * @returns SQL-safe quoted JSON string literal
 */
function sqlJson(value: unknown): string {
  return sqlString(JSON.stringify(value));
}

/**
 * Formats a single star system as a SQL VALUES tuple.
 *
 * @param sys - The star system to format
 * @returns A parenthesized SQL VALUES row
 */
function formatStarSystemRow(sys: StarSystem): string {
  const isOikumene = sys.isOikumene ? 1 : 0;
  return [
    '(',
    [
      sqlString(sys.id),
      sqlString(sys.name),
      String(sys.x),
      String(sys.y),
      String(isOikumene),
      sqlString(sys.classification),
      sqlJson(sys.density),
      sqlJson(sys.attributes),
      sqlJson(sys.planetary),
      sqlJson(sys.civilization),
      sqlJson(sys.tradeCodes),
      sqlJson(sys.economics),
    ].join(', '),
    ')',
  ].join('');
}

/**
 * Formats a single route as a SQL VALUES tuple.
 *
 * @param route - The route to format
 * @returns A parenthesized SQL VALUES row
 */
function formatRouteRow(route: Route): string {
  return `(${sqlString(route.originId)}, ${sqlString(route.destinationId)}, ${String(route.cost)})`;
}

/**
 * Formats a single trade pair as a SQL VALUES tuple.
 *
 * @param pair - The trade pair to format
 * @returns A parenthesized SQL VALUES row
 */
function formatTradePairRow(pair: TradePairRow): string {
  return `(${sqlString(pair.systemAId)}, ${sqlString(pair.systemBId)}, ${String(pair.btn)}, ${String(pair.hops)})`;
}

/**
 * Generates batched INSERT statements for a table.
 *
 * @param tableName - SQL table name
 * @param columns - Column list string
 * @param rows - Pre-formatted row strings
 * @param batchSize - Maximum rows per INSERT statement
 * @returns Array of SQL statements with batch comments
 */
function generateBatchedInserts(
  tableName: string,
  columns: string,
  rows: readonly string[],
  batchSize: number
): string[] {
  if (rows.length === 0) {
    return [];
  }

  const totalBatches = Math.ceil(rows.length / batchSize);
  const statements: string[] = [];

  for (let i = 0; i < totalBatches; i++) {
    const start = i * batchSize;
    const batchRows = rows.slice(start, start + batchSize);
    const comment = `-- ${tableName} (batch ${String(i + 1)} of ${String(totalBatches)})`;
    const insert = `INSERT INTO ${tableName} ${columns} VALUES\n${batchRows.join(',\n')};`;
    statements.push(comment);
    statements.push(insert);
  }

  return statements;
}

/**
 * Generates batched INSERT SQL wrapped in a BEGIN/COMMIT transaction.
 *
 * Batch sizes: star_systems 500, routes 500, trade_pairs 1000.
 * All string values are escaped via {@link escapeSQL}. JSON columns
 * are normalized via JSON.stringify then SQL-escaped.
 *
 * @param systems - Star systems to insert
 * @param routes - Routes to insert
 * @param tradePairs - Trade pairs to insert
 * @returns Complete SQL string with transaction wrapper
 */
export function generateSQL(
  systems: readonly StarSystem[],
  routes: readonly Route[],
  tradePairs: readonly TradePairRow[]
): string {
  const lines: string[] = ['BEGIN TRANSACTION;'];

  const systemRows = systems.map(formatStarSystemRow);
  lines.push(
    ...generateBatchedInserts(
      'star_systems',
      '(id, name, x, y, is_oikumene, classification, density, attributes, planetary, civilization, trade_codes, economics)',
      systemRows,
      STAR_SYSTEMS_BATCH_SIZE
    )
  );

  const routeRows = routes.map(formatRouteRow);
  lines.push(
    ...generateBatchedInserts(
      'routes',
      '(origin_id, destination_id, cost)',
      routeRows,
      ROUTES_BATCH_SIZE
    )
  );

  const tradePairRows = tradePairs.map(formatTradePairRow);
  lines.push(
    ...generateBatchedInserts(
      'trade_pairs',
      '(system_a_id, system_b_id, btn, hops)',
      tradePairRows,
      TRADE_PAIRS_BATCH_SIZE
    )
  );

  lines.push('COMMIT;');
  return lines.join('\n') + '\n';
}
