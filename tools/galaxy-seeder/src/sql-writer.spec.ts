/**
 * Tests for SQL writer module.
 *
 * @module sql-writer.spec
 */

import { describe, expect, it } from 'vitest';

import { Classification } from '../../../src/domain/galaxy/types.js';
import type { StarSystem, Route } from '../../../src/domain/galaxy/types.js';

import type { TradePairRow } from './sql-writer.js';
import { escapeSQL, generateSQL } from './sql-writer.js';

describe('escapeSQL', () => {
  it('doubles single quotes', () => {
    expect(escapeSQL("O'Brien's Star")).toBe("O''Brien''s Star");
  });

  it('strips NUL bytes', () => {
    expect(escapeSQL('hello\0world')).toBe('helloworld');
  });

  it('handles NUL bytes and single quotes together', () => {
    expect(escapeSQL("O'Brien\0")).toBe("O''Brien");
  });

  it('returns empty string unchanged', () => {
    expect(escapeSQL('')).toBe('');
  });

  it('returns string without special characters unchanged', () => {
    expect(escapeSQL('Sol')).toBe('Sol');
  });
});

/**
 * Creates a minimal star system for testing.
 *
 * @param overrides - Partial fields to override defaults
 * @returns A complete StarSystem with defaults filled in
 */
function makeSystem(overrides: Partial<StarSystem> = {}): StarSystem {
  return {
    id: 'sys-001',
    name: 'Sol',
    x: 0,
    y: 0,
    isOikumene: true,
    classification: Classification.OIKUMENE,
    density: { neighborCount: 5, environmentPenalty: 0 },
    attributes: { technology: 10, environment: 7, resources: 8 },
    planetary: { size: 8, atmosphere: 6, temperature: 5, hydrography: 7 },
    civilization: { population: 9, starport: 11, government: 7, factions: 3, lawLevel: 6 },
    tradeCodes: ['Hi', 'In'],
    economics: {
      gurpsTechLevel: 10,
      perCapitaIncome: 25000,
      grossWorldProduct: 1e14,
      resourceMultiplier: 1.2,
      worldTradeNumber: 5.5,
    },
    ...overrides,
  };
}

/**
 * Creates a route for testing.
 *
 * @param overrides - Partial fields to override defaults
 * @returns A complete Route with defaults filled in
 */
function makeRoute(overrides: Partial<Route> = {}): Route {
  return {
    originId: 'aaa',
    destinationId: 'bbb',
    cost: 3.5,
    path: [],
    ...overrides,
  };
}

/**
 * Creates a trade pair row for testing.
 *
 * @param overrides - Partial fields to override defaults
 * @returns A complete TradePairRow with defaults filled in
 */
function makeTradePair(overrides: Partial<TradePairRow> = {}): TradePairRow {
  return {
    systemAId: 'aaa',
    systemBId: 'bbb',
    btn: 4.5,
    hops: 2,
    ...overrides,
  };
}

describe('generateSQL', () => {
  it('wraps output in BEGIN TRANSACTION and COMMIT', () => {
    const sql = generateSQL([], [], []);
    expect(sql).toMatch(/^BEGIN TRANSACTION;\n/);
    expect(sql).toMatch(/\nCOMMIT;\n$/);
  });

  it('generates INSERT for a single star system with all columns', () => {
    const sys = makeSystem();
    const sql = generateSQL([sys], [], []);

    expect(sql).toContain('INSERT INTO star_systems');
    expect(sql).toContain(
      '(id, name, x, y, is_oikumene, classification, density, attributes, planetary, civilization, trade_codes, economics)'
    );
    expect(sql).toContain("'sys-001'");
    expect(sql).toContain("'Sol'");
    expect(sql).toContain(', 0, 0, 1, ');
    expect(sql).toContain("'oikumene'");
  });

  it('serializes JSON columns via JSON.stringify and escapes them', () => {
    const sys = makeSystem({
      density: { neighborCount: 3, environmentPenalty: 1 },
    });
    const sql = generateSQL([sys], [], []);

    // JSON.stringify output, SQL-escaped
    expect(sql).toContain('{"neighborCount":3,"environmentPenalty":1}');
  });

  it('escapes adversarial system names in SQL output', () => {
    const sys = makeSystem({ name: "O'Brien's Star" });
    const sql = generateSQL([sys], [], []);

    expect(sql).toContain("'O''Brien''s Star'");
    // Must not contain unescaped single quotes that would break SQL
    expect(sql).not.toContain("O'Brien's Star");
  });

  it('handles JSON columns containing quotes', () => {
    // The JSON itself won't have single quotes (JSON uses double quotes),
    // but after stringify the doubles are fine in SQL single-quoted strings
    const sys = makeSystem();
    const sql = generateSQL([sys], [], []);

    // Verify JSON is wrapped in single quotes
    expect(sql).toMatch(/'{"neighborCount":\d+,"environmentPenalty":\d+}'/);
  });

  it('generates INSERT for routes', () => {
    const route = makeRoute({ originId: 'aaa', destinationId: 'bbb', cost: 3.5 });
    const sql = generateSQL([], [route], []);

    expect(sql).toContain('INSERT INTO routes (origin_id, destination_id, cost)');
    expect(sql).toContain("('aaa', 'bbb', 3.5)");
  });

  it('generates INSERT for trade pairs', () => {
    const pair = makeTradePair({ systemAId: 'aaa', systemBId: 'bbb', btn: 4.5, hops: 2 });
    const sql = generateSQL([], [], [pair]);

    expect(sql).toContain('INSERT INTO trade_pairs (system_a_id, system_b_id, btn, hops)');
    expect(sql).toContain("('aaa', 'bbb', 4.5, 2)");
  });

  it('converts isOikumene boolean to 0 or 1', () => {
    const sysTrue = makeSystem({ id: 'a', isOikumene: true });
    const sysFalse = makeSystem({ id: 'b', isOikumene: false });
    const sql = generateSQL([sysTrue, sysFalse], [], []);

    // Match the is_oikumene column value (5th value after x, y)
    const lines = sql.split('\n');
    const valuesLines = lines.filter((l) => l.startsWith('('));
    expect(valuesLines.length).toBe(2);
    expect(valuesLines[0]).toContain(', 1, ');
    expect(valuesLines[1]).toContain(', 0, ');
  });

  it('serializes tradeCodes as JSON array', () => {
    const sys = makeSystem({ tradeCodes: ['Ag', 'Ri'] });
    const sql = generateSQL([sys], [], []);

    expect(sql).toContain('["Ag","Ri"]');
  });

  it('batches star systems at 500 rows per INSERT', () => {
    const systems = Array.from({ length: 501 }, (_, i) =>
      makeSystem({ id: `sys-${String(i).padStart(4, '0')}`, x: i, y: i })
    );
    const sql = generateSQL(systems, [], []);

    const insertCount = (sql.match(/INSERT INTO star_systems/g) ?? []).length;
    expect(insertCount).toBe(2);
  });

  it('batches routes at 500 rows per INSERT', () => {
    const routes = Array.from({ length: 501 }, (_, i) =>
      makeRoute({
        originId: `a-${String(i).padStart(4, '0')}`,
        destinationId: `b-${String(i).padStart(4, '0')}`,
      })
    );
    const sql = generateSQL([], routes, []);

    const insertCount = (sql.match(/INSERT INTO routes/g) ?? []).length;
    expect(insertCount).toBe(2);
  });

  it('batches trade pairs at 1000 rows per INSERT', () => {
    const pairs = Array.from({ length: 1001 }, (_, i) =>
      makeTradePair({
        systemAId: `a-${String(i).padStart(4, '0')}`,
        systemBId: `b-${String(i).padStart(4, '0')}`,
      })
    );
    const sql = generateSQL([], [], pairs);

    const insertCount = (sql.match(/INSERT INTO trade_pairs/g) ?? []).length;
    expect(insertCount).toBe(2);
  });

  it('includes batch comments', () => {
    const systems = Array.from({ length: 501 }, (_, i) =>
      makeSystem({ id: `sys-${String(i).padStart(4, '0')}`, x: i, y: i })
    );
    const sql = generateSQL(systems, [], []);

    expect(sql).toContain('-- star_systems (batch 1 of 2)');
    expect(sql).toContain('-- star_systems (batch 2 of 2)');
  });

  it('produces no INSERT statements for empty inputs', () => {
    const sql = generateSQL([], [], []);

    expect(sql).not.toContain('INSERT');
    expect(sql).toBe('BEGIN TRANSACTION;\nCOMMIT;\n');
  });

  it('does not include RAISE guard', () => {
    const sys = makeSystem();
    const sql = generateSQL([sys], [], []);

    expect(sql).not.toContain('RAISE');
  });

  it('escapes IDs containing single quotes in routes', () => {
    const route = makeRoute({ originId: "x'1", destinationId: "y'2" });
    const sql = generateSQL([], [route], []);

    expect(sql).toContain("'x''1'");
    expect(sql).toContain("'y''2'");
  });
});
