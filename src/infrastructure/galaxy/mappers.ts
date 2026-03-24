/**
 * D1 row-to-domain mappers for galaxy entities.
 *
 * @module infrastructure/galaxy/mappers
 */

import type {
  CivilizationData,
  Classification,
  DensityData,
  EconomicsData,
  PlanetaryData,
  StarSystem,
  TerRating,
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
    classification: row.classification as Classification,
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
type TradePairPartnerRow = StarSystemRow & {
  readonly btn: number;
  readonly hops: number;
};

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
