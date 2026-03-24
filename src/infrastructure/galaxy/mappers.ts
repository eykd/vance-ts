/**
 * D1 row-to-domain mappers for galaxy entities.
 *
 * @module infrastructure/galaxy/mappers
 */

import {
  Classification,
  type CivilizationData,
  type DensityData,
  type EconomicsData,
  type PlanetaryData,
  type StarSystem,
  type TerRating,
} from '../../domain/galaxy/types.js';
import type { ConnectedSystem } from '../../domain/interfaces/RouteRepository.js';
import type { TradePairPartner } from '../../domain/interfaces/TradePairRepository.js';

/** D1 row shape for the star_systems table columns. */
export interface StarSystemRow {
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
 * Check that a value is a non-null object (not an array).
 *
 * @param v - The value to check
 * @returns True if v is a plain object
 */
function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/**
 * Check that every listed key on an object is a finite number.
 *
 * @param obj - The object to check
 * @param keys - The keys that must be present and numeric
 * @returns True if all keys exist and are finite numbers
 */
function hasNumericKeys(obj: Record<string, unknown>, keys: readonly string[]): boolean {
  return keys.every((k) => typeof obj[k] === 'number' && Number.isFinite(obj[k]));
}

/**
 * Type guard for DensityData.
 *
 * @param v - The value to validate
 * @returns True if v conforms to DensityData
 */
function isDensityData(v: unknown): v is DensityData {
  return isObject(v) && hasNumericKeys(v, ['neighborCount', 'environmentPenalty']);
}

/**
 * Type guard for TerRating.
 *
 * @param v - The value to validate
 * @returns True if v conforms to TerRating
 */
function isTerRating(v: unknown): v is TerRating {
  return isObject(v) && hasNumericKeys(v, ['technology', 'environment', 'resources']);
}

/**
 * Type guard for PlanetaryData.
 *
 * @param v - The value to validate
 * @returns True if v conforms to PlanetaryData
 */
function isPlanetaryData(v: unknown): v is PlanetaryData {
  return isObject(v) && hasNumericKeys(v, ['size', 'atmosphere', 'temperature', 'hydrography']);
}

/**
 * Type guard for CivilizationData.
 *
 * @param v - The value to validate
 * @returns True if v conforms to CivilizationData
 */
function isCivilizationData(v: unknown): v is CivilizationData {
  return (
    isObject(v) &&
    hasNumericKeys(v, ['population', 'starport', 'government', 'factions', 'lawLevel'])
  );
}

/**
 * Type guard for EconomicsData.
 *
 * @param v - The value to validate
 * @returns True if v conforms to EconomicsData
 */
function isEconomicsData(v: unknown): v is EconomicsData {
  return (
    isObject(v) &&
    hasNumericKeys(v, [
      'gurpsTechLevel',
      'perCapitaIncome',
      'grossWorldProduct',
      'resourceMultiplier',
      'worldTradeNumber',
    ])
  );
}

/** Columns that must be strings in a star_systems row. */
const STRING_COLUMNS: readonly (keyof StarSystemRow)[] = [
  'id',
  'name',
  'classification',
  'density',
  'attributes',
  'planetary',
  'civilization',
  'trade_codes',
  'economics',
];

/** Columns that must be numbers in a star_systems row. */
const NUMERIC_COLUMNS: readonly (keyof StarSystemRow)[] = ['x', 'y', 'is_oikumene'];

/**
 * Validate that a raw D1 result row contains all required star_systems columns
 * with the correct primitive types before casting.
 *
 * @param row - The raw D1 query result (Record&lt;string, unknown&gt;)
 * @returns The validated row typed as StarSystemRow
 * @throws {Error} If the row is not an object or any required column is missing/wrong type
 */
export function assertStarSystemRow(row: unknown): StarSystemRow {
  if (typeof row !== 'object' || row === null || Array.isArray(row)) {
    throw new Error('Expected a non-null object for star_systems row');
  }

  const record = row as Record<string, unknown>;

  for (const col of STRING_COLUMNS) {
    if (typeof record[col] !== 'string') {
      throw new Error(`Missing or invalid column '${col}' in star_systems row`);
    }
  }

  for (const col of NUMERIC_COLUMNS) {
    if (typeof record[col] !== 'number') {
      throw new Error(`Missing or invalid column '${col}' in star_systems row`);
    }
  }

  return row as StarSystemRow;
}

/** Set of valid Classification enum values for O(1) membership checks. */
const VALID_CLASSIFICATIONS = new Set<string>(Object.values(Classification));

/**
 * Validate that a raw string is a valid Classification enum member.
 *
 * @param value - The raw database string
 * @param systemId - The star system ID for error context
 * @returns The validated Classification value
 */
function validateClassification(value: string, systemId: string): Classification {
  if (!VALID_CLASSIFICATIONS.has(value)) {
    throw new Error(`Invalid classification '${value}' for system '${systemId}'`);
  }
  return value as Classification;
}

/**
 * Type guard for a readonly string array.
 *
 * @param v - The value to validate
 * @returns True if v is an array of strings
 */
function isStringArray(v: unknown): v is readonly string[] {
  return Array.isArray(v) && v.every((item) => typeof item === 'string');
}

/**
 * Parse a JSON column from a D1 row, validating its shape at runtime.
 *
 * @param value - The raw JSON string from the database
 * @param systemId - The star system ID for error context
 * @param columnName - The column name for error context
 * @param guard - Type guard that validates the parsed value matches T
 * @returns The parsed and validated JSON value
 */
function parseJsonColumn<T>(
  value: string,
  systemId: string,
  columnName: string,
  guard: (v: unknown) => v is T
): T {
  let parsed: unknown;
  try {
    parsed = JSON.parse(value) as unknown;
  } catch {
    throw new Error(`Failed to parse JSON in column '${columnName}' for system '${systemId}'`);
  }
  if (!guard(parsed)) {
    throw new Error(`Invalid JSON shape in column '${columnName}' for system '${systemId}'`);
  }
  return parsed;
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
    classification: validateClassification(row.classification, row.id),
    density: parseJsonColumn(row.density, row.id, 'density', isDensityData),
    attributes: parseJsonColumn(row.attributes, row.id, 'attributes', isTerRating),
    planetary: parseJsonColumn(row.planetary, row.id, 'planetary', isPlanetaryData),
    civilization: parseJsonColumn(row.civilization, row.id, 'civilization', isCivilizationData),
    tradeCodes: parseJsonColumn(row.trade_codes, row.id, 'trade_codes', isStringArray),
    economics: parseJsonColumn(row.economics, row.id, 'economics', isEconomicsData),
  };
}

/** D1 row shape for a joined routes + star_systems query. */
export type ConnectedSystemRow = StarSystemRow & {
  readonly cost: number;
};

/**
 * Validate that a raw D1 result row contains all required connected_system columns
 * (star_systems columns plus cost) with the correct primitive types before casting.
 *
 * @param row - The raw D1 query result (Record&lt;string, unknown&gt;)
 * @returns The validated row typed as ConnectedSystemRow
 * @throws {Error} If the row fails star_systems validation or cost is missing/wrong type
 */
export function assertConnectedSystemRow(row: unknown): ConnectedSystemRow {
  const base = assertStarSystemRow(row);
  const record = row as Record<string, unknown>;

  if (typeof record['cost'] !== 'number' || !Number.isFinite(record['cost'])) {
    throw new Error("Missing or invalid column 'cost' in connected_system row");
  }

  return { ...base, cost: record['cost'] };
}

/**
 * Convert a joined routes + star_systems row to a ConnectedSystem DTO.
 *
 * @param row - The raw D1 row from a routes JOIN star_systems query
 * @returns A ConnectedSystem with the mapped star system and route cost
 */
export function mapRowToConnectedSystem(row: ConnectedSystemRow): ConnectedSystem {
  return {
    system: mapRowToStarSystem(row),
    cost: row.cost,
  };
}

/** D1 row shape for a joined trade_pairs + star_systems query. */
export type TradePairPartnerRow = StarSystemRow & {
  readonly btn: number;
  readonly hops: number;
};

/**
 * Validate that a raw D1 result row contains all required trade_pair_partner columns
 * (star_systems columns plus btn and hops) with the correct primitive types before casting.
 *
 * @param row - The raw D1 query result (Record&lt;string, unknown&gt;)
 * @returns The validated row typed as TradePairPartnerRow
 * @throws {Error} If the row fails star_systems validation or btn/hops are missing/wrong type
 */
export function assertTradePairPartnerRow(row: unknown): TradePairPartnerRow {
  const base = assertStarSystemRow(row);
  const record = row as Record<string, unknown>;

  if (typeof record['btn'] !== 'number') {
    throw new Error("Missing or invalid column 'btn' in trade_pair_partner row");
  }

  if (typeof record['hops'] !== 'number') {
    throw new Error("Missing or invalid column 'hops' in trade_pair_partner row");
  }

  return { ...base, btn: record['btn'], hops: record['hops'] };
}

/**
 * Convert a joined trade_pairs + star_systems row to a TradePairPartner DTO.
 *
 * @param row - The raw D1 row from a trade_pairs JOIN star_systems query
 * @returns A TradePairPartner with the mapped star system, BTN, and hop count
 */
export function mapRowToTradePairPartner(row: TradePairPartnerRow): TradePairPartner {
  return {
    system: mapRowToStarSystem(row),
    btn: row.btn,
    hops: row.hops,
  };
}
