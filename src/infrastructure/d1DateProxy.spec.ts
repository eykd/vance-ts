/**
 * Tests for the D1 date-serialisation proxy.
 *
 * D1 (Cloudflare's SQLite wrapper) rejects JavaScript `Date` objects — it only
 * accepts strings, numbers, and null. `better-auth` passes `Date` objects for
 * timestamp fields. `wrapD1ForDrizzle` intercepts `D1PreparedStatement.bind()` and
 * converts any `Date` argument to an ISO-8601 string before the call reaches D1.
 */

import { describe, expect, it, vi } from 'vitest';

import { wrapD1ForDrizzle } from './d1DateProxy';

/**
 * Builds a mock D1PreparedStatement that captures bind arguments.
 *
 * @returns Mock statement and a spy for the `bind` method.
 */
function makeMockStatement(): {
  stmt: D1PreparedStatement;
  bindSpy: ReturnType<typeof vi.fn>;
} {
  const bindSpy = vi.fn(function (this: D1PreparedStatement) {
    return this;
  });
  const stmt = {
    bind: bindSpy,
    run: vi.fn(),
    all: vi.fn(),
    raw: vi.fn(),
    first: vi.fn(),
  } as unknown as D1PreparedStatement;
  // Make bind return the same statement for chaining
  bindSpy.mockReturnValue(stmt);
  return { stmt, bindSpy };
}

/**
 * Spy function types returned by `makeMockDb` for direct assertion without
 * triggering the `@typescript-eslint/unbound-method` rule.
 */
interface MockDbSpies {
  /** `D1Database` instance typed as the interface for use with `wrapD1ForDrizzle`. */
  db: D1Database;
  /** Spy for `db.prepare()`. */
  prepareSpy: ReturnType<typeof vi.fn>;
  /** Spy for `db.exec()`. */
  execSpy: ReturnType<typeof vi.fn>;
  /** Spy for `db.batch()`. */
  batchSpy: ReturnType<typeof vi.fn>;
}

/**
 * Builds a mock D1Database whose `prepare()` returns the provided statement.
 *
 * Returns the mock DB together with named spies so test assertions can access
 * them as plain `vi.fn()` references, avoiding the `unbound-method` ESLint
 * rule that fires when accessing method spies from a typed `D1Database` object.
 *
 * @param stmt - The statement to return from `prepare`.
 * @returns Mock DB and individual spies.
 */
function makeMockDb(stmt: D1PreparedStatement): MockDbSpies {
  const prepareSpy = vi.fn(() => stmt);
  const execSpy = vi.fn();
  const batchSpy = vi.fn();
  const dumpSpy = vi.fn();
  const db = {
    prepare: prepareSpy,
    exec: execSpy,
    batch: batchSpy,
    dump: dumpSpy,
  } as unknown as D1Database;
  return { db, prepareSpy, execSpy, batchSpy };
}

describe('wrapD1ForDrizzle', () => {
  describe('bind() Date serialisation', () => {
    it('converts a single Date argument to an ISO-8601 string', () => {
      const { stmt, bindSpy } = makeMockStatement();
      const { db } = makeMockDb(stmt);
      const wrapped = wrapD1ForDrizzle(db);
      const date = new Date('2026-02-28T12:00:00.000Z');

      wrapped.prepare('SELECT 1').bind(date);

      expect(bindSpy).toHaveBeenCalledWith('2026-02-28T12:00:00.000Z');
    });

    it('converts multiple Date arguments, leaving other types unchanged', () => {
      const { stmt, bindSpy } = makeMockStatement();
      const { db } = makeMockDb(stmt);
      const wrapped = wrapD1ForDrizzle(db);
      const date1 = new Date('2026-01-01T00:00:00.000Z');
      const date2 = new Date('2026-12-31T23:59:59.999Z');

      wrapped.prepare('SELECT 1').bind(date1, 'text-value', 42, null, date2);

      expect(bindSpy).toHaveBeenCalledWith(
        '2026-01-01T00:00:00.000Z',
        'text-value',
        42,
        null,
        '2026-12-31T23:59:59.999Z'
      );
    });

    it('passes string arguments through unchanged', () => {
      const { stmt, bindSpy } = makeMockStatement();
      const { db } = makeMockDb(stmt);
      const wrapped = wrapD1ForDrizzle(db);

      wrapped.prepare('SELECT 1').bind('hello', 'world');

      expect(bindSpy).toHaveBeenCalledWith('hello', 'world');
    });

    it('passes number arguments through unchanged', () => {
      const { stmt, bindSpy } = makeMockStatement();
      const { db } = makeMockDb(stmt);
      const wrapped = wrapD1ForDrizzle(db);

      wrapped.prepare('SELECT 1').bind(0, 1, -42, 3.14);

      expect(bindSpy).toHaveBeenCalledWith(0, 1, -42, 3.14);
    });

    it('passes null through unchanged', () => {
      const { stmt, bindSpy } = makeMockStatement();
      const { db } = makeMockDb(stmt);
      const wrapped = wrapD1ForDrizzle(db);

      wrapped.prepare('SELECT 1').bind(null);

      expect(bindSpy).toHaveBeenCalledWith(null);
    });

    it('handles an empty bind() call (no params)', () => {
      const { stmt, bindSpy } = makeMockStatement();
      const { db } = makeMockDb(stmt);
      const wrapped = wrapD1ForDrizzle(db);

      wrapped.prepare('SELECT 1').bind();

      expect(bindSpy).toHaveBeenCalledWith();
    });
  });

  describe('prepare() delegation', () => {
    it('delegates prepare() to the underlying D1Database', () => {
      const { stmt } = makeMockStatement();
      const { db, prepareSpy } = makeMockDb(stmt);
      const wrapped = wrapD1ForDrizzle(db);

      wrapped.prepare('SELECT * FROM user');

      expect(prepareSpy).toHaveBeenCalledWith('SELECT * FROM user');
    });

    it('returns a statement whose bind() returns the bound statement (for chaining)', () => {
      const { stmt } = makeMockStatement();
      const { db } = makeMockDb(stmt);
      const wrapped = wrapD1ForDrizzle(db);
      const date = new Date('2026-02-28T00:00:00.000Z');

      const boundStmt = wrapped.prepare('SELECT 1').bind(date);

      // bind() on the original mock returns itself; we should get that back
      expect(boundStmt).toBe(stmt);
    });
  });

  describe('other D1Database methods', () => {
    it('delegates exec() to the underlying D1Database', async () => {
      const { stmt } = makeMockStatement();
      const { db, execSpy } = makeMockDb(stmt);
      execSpy.mockResolvedValue({ count: 1, duration: 0 });
      const wrapped = wrapD1ForDrizzle(db);

      await wrapped.exec('DELETE FROM session');

      expect(execSpy).toHaveBeenCalledWith('DELETE FROM session');
    });

    it('delegates batch() to the underlying D1Database', async () => {
      const { stmt } = makeMockStatement();
      const { db, batchSpy } = makeMockDb(stmt);
      batchSpy.mockResolvedValue([]);
      const wrapped = wrapD1ForDrizzle(db);

      await wrapped.batch([stmt]);

      expect(batchSpy).toHaveBeenCalledWith([stmt]);
    });
  });
});
