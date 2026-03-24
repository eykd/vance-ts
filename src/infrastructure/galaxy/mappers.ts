/**
 * D1 row-to-domain mappers for galaxy entities.
 *
 * @module infrastructure/galaxy/mappers
 */

import type { StarSystem, Classification } from '../../domain/galaxy/types.js';

/** D1 row shape for the star_systems table. */
interface StarSystemRow {
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

/**
 * Parse a JSON column from a D1 row, providing a descriptive error on failure.
 *
 * @param value - The raw JSON string from the database
 * @param systemId - The star system ID for error context
 * @param columnName - The column name for error context
 * @returns The parsed JSON value
 */
function parseJsonColumn<T>(value: string, systemId: string, columnName: string): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    throw new Error(`Failed to parse JSON in column '${columnName}' for system '${systemId}'`);
  }
}

/**
 * Convert a D1 star_systems row to a StarSystem domain object.
 *
 * @param row - The raw D1 row
 * @returns A fully typed StarSystem domain object
 */
export function mapRowToStarSystem(row: StarSystemRow): StarSystem {
  return {
    id: row.id,
    name: row.name,
    x: row.x,
    y: row.y,
    isOikumene: row.is_oikumene === 1,
    classification: row.classification as Classification,
    density: parseJsonColumn(row.density, row.id, 'density'),
    attributes: parseJsonColumn(row.attributes, row.id, 'attributes'),
    planetary: parseJsonColumn(row.planetary, row.id, 'planetary'),
    civilization: parseJsonColumn(row.civilization, row.id, 'civilization'),
    tradeCodes: parseJsonColumn(row.trade_codes, row.id, 'trade_codes'),
    economics: parseJsonColumn(row.economics, row.id, 'economics'),
  };
}
