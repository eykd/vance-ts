/**
 * Unit tests for D1 row-to-domain mappers for galaxy entities.
 *
 * @module infrastructure/galaxy/mappers.spec
 */

import { describe, expect, it } from 'vitest';

import { Classification } from '../../domain/galaxy/types.js';

import {
  assertConnectedSystemRow,
  assertStarSystemRow,
  assertTradePairPartnerRow,
  mapRowToConnectedSystem,
  mapRowToStarSystem,
  mapRowToTradePairPartner,
} from './mappers.js';

/**
 * Minimal valid star_systems row for reuse across tests.
 *
 * @returns A complete star_systems row with valid JSON columns
 */
function starSystemColumns(): {
  id: string;
  name: string;
  x: number;
  y: number;
  is_oikumene: number;
  classification: string;
  density: string;
  attributes: string;
  planetary: string;
  civilization: string;
  trade_codes: string;
  economics: string;
} {
  return {
    id: 'sys-001',
    name: 'Sol',
    x: 10,
    y: 20,
    is_oikumene: 1,
    classification: 'oikumene',
    density: JSON.stringify({ neighborCount: 5, environmentPenalty: 0 }),
    attributes: JSON.stringify({ technology: 8, environment: 6, resources: 7 }),
    planetary: JSON.stringify({ size: 8, atmosphere: 6, temperature: 5, hydrography: 7 }),
    civilization: JSON.stringify({
      population: 9,
      starport: 5,
      government: 7,
      factions: 3,
      lawLevel: 6,
    }),
    trade_codes: JSON.stringify(['Hi', 'In', 'Ri']),
    economics: JSON.stringify({
      gurpsTechLevel: 10,
      perCapitaIncome: 45000,
      grossWorldProduct: 1.2e12,
      resourceMultiplier: 1.5,
      worldTradeNumber: 8.5,
    }),
  };
}

describe('assertStarSystemRow', () => {
  it('returns the row when all columns are present with correct types', () => {
    const row: Record<string, unknown> = { ...starSystemColumns() };
    expect(assertStarSystemRow(row)).toEqual(starSystemColumns());
  });

  it('throws when a required string column is missing', () => {
    const row: Record<string, unknown> = { ...starSystemColumns() };
    delete row['name'];
    expect(() => assertStarSystemRow(row)).toThrow(
      "Missing or invalid column 'name' in star_systems row"
    );
  });

  it('throws when a required string column has wrong type', () => {
    const row: Record<string, unknown> = { ...starSystemColumns(), id: 123 };
    expect(() => assertStarSystemRow(row)).toThrow(
      "Missing or invalid column 'id' in star_systems row"
    );
  });

  it('throws when a required numeric column is missing', () => {
    const row: Record<string, unknown> = { ...starSystemColumns() };
    delete row['x'];
    expect(() => assertStarSystemRow(row)).toThrow(
      "Missing or invalid column 'x' in star_systems row"
    );
  });

  it('throws when a required numeric column has wrong type', () => {
    const row: Record<string, unknown> = { ...starSystemColumns(), y: 'not-a-number' };
    expect(() => assertStarSystemRow(row)).toThrow(
      "Missing or invalid column 'y' in star_systems row"
    );
  });

  it('throws when the input is null', () => {
    expect(() => assertStarSystemRow(null)).toThrow(
      'Expected a non-null object for star_systems row'
    );
  });

  it('throws when the input is not an object', () => {
    expect(() => assertStarSystemRow('string')).toThrow(
      'Expected a non-null object for star_systems row'
    );
  });
});

describe('mapRowToStarSystem — JSON validation', () => {
  it('throws on malformed density JSON (missing required field)', () => {
    const row = { ...starSystemColumns(), density: JSON.stringify({ neighborCount: 5 }) };
    expect(() => mapRowToStarSystem(row)).toThrow(
      "Invalid JSON shape in column 'density' for system 'sys-001'"
    );
  });

  it('throws on density with wrong field type', () => {
    const row = {
      ...starSystemColumns(),
      density: JSON.stringify({ neighborCount: 'five', environmentPenalty: 0 }),
    };
    expect(() => mapRowToStarSystem(row)).toThrow(
      "Invalid JSON shape in column 'density' for system 'sys-001'"
    );
  });

  it('throws on malformed attributes JSON', () => {
    const row = { ...starSystemColumns(), attributes: JSON.stringify({ technology: 8 }) };
    expect(() => mapRowToStarSystem(row)).toThrow(
      "Invalid JSON shape in column 'attributes' for system 'sys-001'"
    );
  });

  it('throws on malformed planetary JSON', () => {
    const row = { ...starSystemColumns(), planetary: JSON.stringify({}) };
    expect(() => mapRowToStarSystem(row)).toThrow(
      "Invalid JSON shape in column 'planetary' for system 'sys-001'"
    );
  });

  it('throws on malformed civilization JSON', () => {
    const row = { ...starSystemColumns(), civilization: JSON.stringify({ population: 9 }) };
    expect(() => mapRowToStarSystem(row)).toThrow(
      "Invalid JSON shape in column 'civilization' for system 'sys-001'"
    );
  });

  it('throws on malformed economics JSON', () => {
    const row = { ...starSystemColumns(), economics: JSON.stringify({ gurpsTechLevel: 10 }) };
    expect(() => mapRowToStarSystem(row)).toThrow(
      "Invalid JSON shape in column 'economics' for system 'sys-001'"
    );
  });

  it('throws on trade_codes that is not a string array', () => {
    const row = { ...starSystemColumns(), trade_codes: JSON.stringify('not-an-array') };
    expect(() => mapRowToStarSystem(row)).toThrow(
      "Invalid JSON shape in column 'trade_codes' for system 'sys-001'"
    );
  });

  it('throws on trade_codes array containing non-strings', () => {
    const row = { ...starSystemColumns(), trade_codes: JSON.stringify([1, 2, 3]) };
    expect(() => mapRowToStarSystem(row)).toThrow(
      "Invalid JSON shape in column 'trade_codes' for system 'sys-001'"
    );
  });

  it('throws on unparseable JSON string', () => {
    const row = { ...starSystemColumns(), density: '{not-valid-json' };
    expect(() => mapRowToStarSystem(row)).toThrow(
      "Failed to parse JSON in column 'density' for system 'sys-001'"
    );
  });

  it('throws on invalid classification value', () => {
    const row = { ...starSystemColumns(), classification: 'bogus_value' };
    expect(() => mapRowToStarSystem(row)).toThrow(
      "Invalid classification 'bogus_value' for system 'sys-001'"
    );
  });
});

describe('mapRowToStarSystem', () => {
  it('converts a valid D1 row to a StarSystem', () => {
    const row = starSystemColumns();

    const result = mapRowToStarSystem(row);

    expect(result).toEqual({
      id: 'sys-001',
      name: 'Sol',
      x: 10,
      y: 20,
      isOikumene: true,
      classification: Classification.OIKUMENE,
      density: { neighborCount: 5, environmentPenalty: 0 },
      attributes: { technology: 8, environment: 6, resources: 7 },
      planetary: { size: 8, atmosphere: 6, temperature: 5, hydrography: 7 },
      civilization: { population: 9, starport: 5, government: 7, factions: 3, lawLevel: 6 },
      tradeCodes: ['Hi', 'In', 'Ri'],
      economics: {
        gurpsTechLevel: 10,
        perCapitaIncome: 45000,
        grossWorldProduct: 1.2e12,
        resourceMultiplier: 1.5,
        worldTradeNumber: 8.5,
      },
    });
  });
});

describe('assertConnectedSystemRow', () => {
  it('returns the row when all star_systems columns plus cost are present', () => {
    const row: Record<string, unknown> = { ...starSystemColumns(), cost: 3.75 };
    expect(assertConnectedSystemRow(row)).toEqual({ ...starSystemColumns(), cost: 3.75 });
  });

  it('throws when cost column is missing', () => {
    const row: Record<string, unknown> = { ...starSystemColumns() };
    expect(() => assertConnectedSystemRow(row)).toThrow(
      "Missing or invalid column 'cost' in connected_system row"
    );
  });

  it('throws when cost column has wrong type', () => {
    const row: Record<string, unknown> = { ...starSystemColumns(), cost: 'not-a-number' };
    expect(() => assertConnectedSystemRow(row)).toThrow(
      "Missing or invalid column 'cost' in connected_system row"
    );
  });

  it('throws when cost is NaN', () => {
    const row: Record<string, unknown> = { ...starSystemColumns(), cost: NaN };
    expect(() => assertConnectedSystemRow(row)).toThrow(
      "Missing or invalid column 'cost' in connected_system row"
    );
  });

  it('throws when cost is Infinity', () => {
    const row: Record<string, unknown> = { ...starSystemColumns(), cost: Infinity };
    expect(() => assertConnectedSystemRow(row)).toThrow(
      "Missing or invalid column 'cost' in connected_system row"
    );
  });

  it('throws when cost is -Infinity', () => {
    const row: Record<string, unknown> = { ...starSystemColumns(), cost: -Infinity };
    expect(() => assertConnectedSystemRow(row)).toThrow(
      "Missing or invalid column 'cost' in connected_system row"
    );
  });

  it('throws when a base star_systems column is missing', () => {
    const row: Record<string, unknown> = { ...starSystemColumns(), cost: 2.0 };
    delete row['name'];
    expect(() => assertConnectedSystemRow(row)).toThrow(
      "Missing or invalid column 'name' in star_systems row"
    );
  });

  it('throws when the input is null', () => {
    expect(() => assertConnectedSystemRow(null)).toThrow(
      'Expected a non-null object for star_systems row'
    );
  });
});

describe('mapRowToConnectedSystem', () => {
  it('converts a joined route + star_systems row to a ConnectedSystem', () => {
    const row = {
      ...starSystemColumns(),
      cost: 3.75,
    };

    const result = mapRowToConnectedSystem(row);

    expect(result.cost).toBe(3.75);
    expect(result.system.id).toBe('sys-001');
    expect(result.system.name).toBe('Sol');
    expect(result.system.isOikumene).toBe(true);
    expect(result.system.classification).toBe(Classification.OIKUMENE);
  });
});

describe('assertTradePairPartnerRow', () => {
  it('returns the row when all star_systems columns plus btn and hops are present', () => {
    const row: Record<string, unknown> = { ...starSystemColumns(), btn: 7.2, hops: 3 };
    expect(assertTradePairPartnerRow(row)).toEqual({ ...starSystemColumns(), btn: 7.2, hops: 3 });
  });

  it('throws when btn column is missing', () => {
    const row: Record<string, unknown> = { ...starSystemColumns(), hops: 3 };
    expect(() => assertTradePairPartnerRow(row)).toThrow(
      "Missing or invalid column 'btn' in trade_pair_partner row"
    );
  });

  it('throws when btn column has wrong type', () => {
    const row: Record<string, unknown> = { ...starSystemColumns(), btn: 'not-a-number', hops: 3 };
    expect(() => assertTradePairPartnerRow(row)).toThrow(
      "Missing or invalid column 'btn' in trade_pair_partner row"
    );
  });

  it('throws when hops column is missing', () => {
    const row: Record<string, unknown> = { ...starSystemColumns(), btn: 7.2 };
    expect(() => assertTradePairPartnerRow(row)).toThrow(
      "Missing or invalid column 'hops' in trade_pair_partner row"
    );
  });

  it('throws when hops column has wrong type', () => {
    const row: Record<string, unknown> = { ...starSystemColumns(), btn: 7.2, hops: 'not-a-number' };
    expect(() => assertTradePairPartnerRow(row)).toThrow(
      "Missing or invalid column 'hops' in trade_pair_partner row"
    );
  });

  it('throws when btn is NaN', () => {
    const row: Record<string, unknown> = { ...starSystemColumns(), btn: NaN, hops: 3 };
    expect(() => assertTradePairPartnerRow(row)).toThrow(
      "Missing or invalid column 'btn' in trade_pair_partner row"
    );
  });

  it('throws when btn is Infinity', () => {
    const row: Record<string, unknown> = { ...starSystemColumns(), btn: Infinity, hops: 3 };
    expect(() => assertTradePairPartnerRow(row)).toThrow(
      "Missing or invalid column 'btn' in trade_pair_partner row"
    );
  });

  it('throws when hops is NaN', () => {
    const row: Record<string, unknown> = { ...starSystemColumns(), btn: 7.2, hops: NaN };
    expect(() => assertTradePairPartnerRow(row)).toThrow(
      "Missing or invalid column 'hops' in trade_pair_partner row"
    );
  });

  it('throws when hops is Infinity', () => {
    const row: Record<string, unknown> = { ...starSystemColumns(), btn: 7.2, hops: Infinity };
    expect(() => assertTradePairPartnerRow(row)).toThrow(
      "Missing or invalid column 'hops' in trade_pair_partner row"
    );
  });

  it('throws when hops is not an integer', () => {
    const row: Record<string, unknown> = { ...starSystemColumns(), btn: 7.2, hops: 3.5 };
    expect(() => assertTradePairPartnerRow(row)).toThrow(
      "Missing or invalid column 'hops' in trade_pair_partner row"
    );
  });

  it('throws when a base star_systems column is missing', () => {
    const row: Record<string, unknown> = { ...starSystemColumns(), btn: 7.2, hops: 3 };
    delete row['name'];
    expect(() => assertTradePairPartnerRow(row)).toThrow(
      "Missing or invalid column 'name' in star_systems row"
    );
  });

  it('throws when the input is null', () => {
    expect(() => assertTradePairPartnerRow(null)).toThrow(
      'Expected a non-null object for star_systems row'
    );
  });
});

describe('mapRowToTradePairPartner', () => {
  it('converts a joined trade_pairs + star_systems row to a TradePairPartner', () => {
    const row = {
      ...starSystemColumns(),
      btn: 7.2,
      hops: 3,
    };

    const result = mapRowToTradePairPartner(row);

    expect(result.btn).toBe(7.2);
    expect(result.hops).toBe(3);
    expect(result.system.id).toBe('sys-001');
    expect(result.system.name).toBe('Sol');
    expect(result.system.isOikumene).toBe(true);
    expect(result.system.classification).toBe(Classification.OIKUMENE);
  });
});
