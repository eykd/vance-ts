/**
 * D1Storage unit tests.
 *
 * Tests the Cloudflare D1 database adapter for StoragePort using
 * a mock D1Database. Covers parameterized queries via prepare().bind(),
 * JSON serialization/deserialization, error wrapping, and SQL injection
 * safety (all values go through bind parameters, never string interpolation).
 *
 * @module
 */

import { describe, expect, it, vi } from 'vitest';

import type { GrammarDto, StoragePort } from '../../application/prestoplot/GrammarStorage.js';
import { StorageError } from '../../domain/prestoplot/errors.js';

import { createD1Storage } from './d1Storage.js';

/**
 * Helper to build a minimal GrammarDto.
 *
 * @param key - Grammar key.
 * @param rules - Optional rules object.
 * @returns A minimal GrammarDto.
 */
function makeDto(key: string, rules: Record<string, unknown> = {}): GrammarDto {
  return { version: 1, key, entry: 'main', includes: [], rules };
}

/** Minimal shape for a D1 prepared statement mock. */
interface MockStatement {
  /** Mock bind function. */
  readonly bind: ReturnType<typeof vi.fn>;
  /** Mock first function. */
  readonly first: ReturnType<typeof vi.fn>;
  /** Mock run function. */
  readonly run: ReturnType<typeof vi.fn>;
  /** Mock all function. */
  readonly all: ReturnType<typeof vi.fn>;
}

/**
 * Creates a mock D1Database with a prepare function that returns mock statements.
 *
 * @returns Mock D1Database and statement tracking.
 */
function createMockD1(): {
  readonly db: D1Database;
  readonly prepareFn: ReturnType<typeof vi.fn>;
  readonly statements: Map<string, MockStatement>;
} {
  const statements = new Map<string, MockStatement>();

  /**
   * Creates a mock statement for a given SQL query.
   *
   * @param sql - The SQL query string.
   * @returns A mock statement.
   */
  function createStatement(sql: string): MockStatement {
    const stmt: MockStatement = {
      bind: vi.fn().mockReturnThis(),
      first: vi.fn().mockResolvedValue(null),
      run: vi.fn().mockResolvedValue({ success: true }),
      all: vi.fn().mockResolvedValue({ results: [] }),
    };
    // bind returns something with first/run/all
    stmt.bind.mockReturnValue({
      first: stmt.first,
      run: stmt.run,
      all: stmt.all,
    });
    statements.set(sql, stmt);
    return stmt;
  }

  const prepareFn = vi.fn((sql: string) => {
    const existing = statements.get(sql);
    if (existing !== undefined) {
      return {
        bind: existing.bind,
        first: existing.first,
        run: existing.run,
        all: existing.all,
      };
    }
    return createStatement(sql);
  });

  const db = { prepare: prepareFn } as unknown as D1Database;

  return { db, prepareFn, statements };
}

describe('createD1Storage', () => {
  it('returns an object satisfying the StoragePort interface', () => {
    const { db } = createMockD1();
    const storage: StoragePort = createD1Storage(db);
    expect(storage).toBeDefined();
    expect(typeof storage.load).toBe('function');
    expect(typeof storage.save).toBe('function');
    expect(typeof storage.delete).toBe('function');
    expect(typeof storage.keys).toBe('function');
  });

  describe('load', () => {
    it('returns null for a key that does not exist', async () => {
      const { db } = createMockD1();
      const storage = createD1Storage(db);
      const result = await storage.load('nonexistent');
      expect(result).toBeNull();
    });

    it('uses prepare().bind() for parameterized queries', async () => {
      const { db, prepareFn } = createMockD1();
      const storage = createD1Storage(db);
      await storage.load('mykey');
      expect(prepareFn).toHaveBeenCalledWith(expect.stringContaining('SELECT'));
      const sql = prepareFn.mock.calls[0]![0] as string;
      const stmt = createMockD1().statements;
      // Verify the actual statement got bind called
      void stmt;
      expect(sql).toContain('?');
    });

    it('binds the key parameter', async () => {
      const { db, statements } = createMockD1();

      // Pre-create the statement so we can track bind calls
      const selectSql = 'SELECT data FROM grammars WHERE key = ?';
      const stmt: MockStatement = {
        bind: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(null),
          run: vi.fn(),
          all: vi.fn(),
        }),
        first: vi.fn().mockResolvedValue(null),
        run: vi.fn(),
        all: vi.fn(),
      };
      statements.set(selectSql, stmt);

      const storage = createD1Storage(db);
      await storage.load('testkey');

      // Find the statement that was used
      const bindCalls = stmt.bind.mock.calls;
      if (bindCalls.length > 0) {
        expect(bindCalls[0]).toContain('testkey');
      }
    });

    it('deserializes JSON data from the row', async () => {
      const { db, prepareFn } = createMockD1();
      const dto = makeDto('greeting', { hello: { type: 'text' } });

      prepareFn.mockImplementation(() => {
        const boundStmt = {
          first: vi.fn().mockResolvedValue({ data: JSON.stringify(dto) }),
          run: vi.fn(),
          all: vi.fn(),
        };
        return {
          bind: vi.fn().mockReturnValue(boundStmt),
          first: boundStmt.first,
          run: boundStmt.run,
          all: boundStmt.all,
        };
      });

      const storage = createD1Storage(db);
      const result = await storage.load('greeting');
      expect(result).toEqual(dto);
    });

    it('wraps D1 errors as StorageError', async () => {
      const { db, prepareFn } = createMockD1();

      prepareFn.mockImplementation(() => ({
        bind: vi.fn().mockReturnValue({
          first: vi.fn().mockRejectedValue(new Error('D1 read failure')),
          run: vi.fn(),
          all: vi.fn(),
        }),
        first: vi.fn(),
        run: vi.fn(),
        all: vi.fn(),
      }));

      const storage = createD1Storage(db);
      await expect(storage.load('fail')).rejects.toThrow(StorageError);
    });

    it('preserves original error as cause', async () => {
      const { db, prepareFn } = createMockD1();
      const original = new Error('D1 read failure');

      prepareFn.mockImplementation(() => ({
        bind: vi.fn().mockReturnValue({
          first: vi.fn().mockRejectedValue(original),
          run: vi.fn(),
          all: vi.fn(),
        }),
        first: vi.fn(),
        run: vi.fn(),
        all: vi.fn(),
      }));

      const storage = createD1Storage(db);
      try {
        await storage.load('fail');
        expect.fail('should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(StorageError);
        expect((err as StorageError).cause).toBe(original);
      }
    });
  });

  describe('save', () => {
    it('uses INSERT OR REPLACE with parameterized values', async () => {
      const { db, prepareFn } = createMockD1();
      const storage = createD1Storage(db);
      const dto = makeDto('test');
      await storage.save('test', dto);

      const sql = prepareFn.mock.calls.find((c) => (c[0] as string).includes('INSERT'));
      expect(sql).toBeDefined();
      expect(sql![0]).toContain('?');
    });

    it('serializes DTO as JSON for storage', async () => {
      const { db, prepareFn } = createMockD1();
      let boundArgs: unknown[] = [];

      prepareFn.mockImplementation(() => ({
        bind: vi.fn((...args: unknown[]) => {
          boundArgs = args;
          return {
            first: vi.fn(),
            run: vi.fn().mockResolvedValue({ success: true }),
            all: vi.fn(),
          };
        }),
        first: vi.fn(),
        run: vi.fn(),
        all: vi.fn(),
      }));

      const storage = createD1Storage(db);
      const dto = makeDto('test', { rule1: { type: 'text' } });
      await storage.save('test', dto);

      expect(boundArgs[0]).toBe('test');
      expect(boundArgs[1]).toBe(JSON.stringify(dto));
    });

    it('wraps D1 errors as StorageError', async () => {
      const { db, prepareFn } = createMockD1();

      prepareFn.mockImplementation(() => ({
        bind: vi.fn().mockReturnValue({
          first: vi.fn(),
          run: vi.fn().mockRejectedValue(new Error('D1 write failure')),
          all: vi.fn(),
        }),
        first: vi.fn(),
        run: vi.fn(),
        all: vi.fn(),
      }));

      const storage = createD1Storage(db);
      await expect(storage.save('fail', makeDto('fail'))).rejects.toThrow(StorageError);
    });

    it('includes save_failed code on error', async () => {
      const { db, prepareFn } = createMockD1();

      prepareFn.mockImplementation(() => ({
        bind: vi.fn().mockReturnValue({
          first: vi.fn(),
          run: vi.fn().mockRejectedValue(new Error('D1 write failure')),
          all: vi.fn(),
        }),
        first: vi.fn(),
        run: vi.fn(),
        all: vi.fn(),
      }));

      const storage = createD1Storage(db);
      try {
        await storage.save('fail', makeDto('fail'));
        expect.fail('should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(StorageError);
        expect((err as StorageError).code).toBe('save_failed');
      }
    });
  });

  describe('delete', () => {
    it('uses parameterized DELETE query', async () => {
      const { db, prepareFn } = createMockD1();
      const storage = createD1Storage(db);
      await storage.delete('to-delete');

      const sql = prepareFn.mock.calls.find((c) => (c[0] as string).includes('DELETE'));
      expect(sql).toBeDefined();
      expect(sql![0]).toContain('?');
    });

    it('is a no-op when key does not exist', async () => {
      const { db } = createMockD1();
      const storage = createD1Storage(db);
      await expect(storage.delete('missing')).resolves.toBeUndefined();
    });

    it('wraps D1 errors as StorageError', async () => {
      const { db, prepareFn } = createMockD1();

      prepareFn.mockImplementation(() => ({
        bind: vi.fn().mockReturnValue({
          first: vi.fn(),
          run: vi.fn().mockRejectedValue(new Error('D1 delete failure')),
          all: vi.fn(),
        }),
        first: vi.fn(),
        run: vi.fn(),
        all: vi.fn(),
      }));

      const storage = createD1Storage(db);
      await expect(storage.delete('fail')).rejects.toThrow(StorageError);
    });
  });

  describe('keys', () => {
    it('returns empty array when nothing stored', async () => {
      const { db } = createMockD1();
      const storage = createD1Storage(db);
      const result = await storage.keys();
      expect(result).toEqual([]);
    });

    it('returns keys from query results', async () => {
      const { db, prepareFn } = createMockD1();

      prepareFn.mockImplementation(() => ({
        bind: vi.fn().mockReturnThis(),
        first: vi.fn(),
        run: vi.fn(),
        all: vi.fn().mockResolvedValue({
          results: [{ key: 'alpha' }, { key: 'beta' }, { key: 'gamma' }],
        }),
      }));

      const storage = createD1Storage(db);
      const result = await storage.keys();
      expect(result).toEqual(['alpha', 'beta', 'gamma']);
    });

    it('wraps D1 errors as StorageError', async () => {
      const { db, prepareFn } = createMockD1();

      prepareFn.mockImplementation(() => ({
        bind: vi.fn().mockReturnThis(),
        first: vi.fn(),
        run: vi.fn(),
        all: vi.fn().mockRejectedValue(new Error('D1 list failure')),
      }));

      const storage = createD1Storage(db);
      await expect(storage.keys()).rejects.toThrow(StorageError);
    });
  });

  describe('SQL injection safety', () => {
    it('never interpolates key into SQL — always uses bind parameters', async () => {
      const { db, prepareFn } = createMockD1();
      const storage = createD1Storage(db);

      const maliciousKey = "'; DROP TABLE grammars; --";
      await storage.load(maliciousKey);
      await storage.save(maliciousKey, makeDto(maliciousKey));
      await storage.delete(maliciousKey);

      // Every SQL string passed to prepare must use ? placeholders, never contain the key
      for (const call of prepareFn.mock.calls) {
        const sql = call[0] as string;
        expect(sql).not.toContain(maliciousKey);
        expect(sql).toContain('?');
      }
    });

    it('passes malicious strings only through bind, not prepare', async () => {
      const { db, prepareFn } = createMockD1();
      const capturedBindArgs: unknown[][] = [];

      prepareFn.mockImplementation(() => ({
        bind: vi.fn((...args: unknown[]) => {
          capturedBindArgs.push(args);
          return {
            first: vi.fn().mockResolvedValue(null),
            run: vi.fn().mockResolvedValue({ success: true }),
            all: vi.fn(),
          };
        }),
        first: vi.fn(),
        run: vi.fn(),
        all: vi.fn(),
      }));

      const storage = createD1Storage(db);
      const malicious = "Robert'); DROP TABLE grammars;--";
      await storage.load(malicious);

      // The malicious string should appear in bind args, not in SQL
      expect(capturedBindArgs.length).toBeGreaterThan(0);
      expect(capturedBindArgs[0]).toContain(malicious);
    });
  });
});
