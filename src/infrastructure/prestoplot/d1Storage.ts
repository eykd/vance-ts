/**
 * Cloudflare D1 database adapter for StoragePort.
 *
 * Stores grammar DTOs in a `grammars` table with JSON-serialized data.
 * All queries use `prepare()`.bind() exclusively
 * to prevent SQL injection — values are never interpolated into SQL strings.
 *
 * @module infrastructure/prestoplot/d1Storage
 */

import type { GrammarDto, StoragePort } from '../../application/prestoplot/GrammarStorage.js';
import { StorageError } from '../../domain/prestoplot/errors.js';

/** Row shape returned by SELECT queries on the grammars table. */
interface GrammarRow {
  /** JSON-serialized GrammarDto. */
  readonly data: string;
}

/** Row shape returned by key listing queries. */
interface KeyRow {
  /** Grammar key. */
  readonly key: string;
}

/**
 * Wraps an unknown error as a StorageError.
 *
 * @param code - Machine-readable error code.
 * @param message - Human-readable message.
 * @param cause - The underlying error.
 * @returns A StorageError wrapping the cause.
 */
function wrapError(code: string, message: string, cause: unknown): StorageError {
  const err = cause instanceof Error ? cause : new Error(String(cause));
  return new StorageError(code, message, err);
}

/**
 * Creates a {@link StoragePort} backed by a Cloudflare D1 database.
 *
 * Requires a `grammars` table with columns: key (TEXT PK), data (TEXT),
 * updated_at (TEXT). See migration 0009_prestoplot_grammars.sql.
 *
 * @param db - The D1 database binding.
 * @returns A StoragePort that persists grammars in D1.
 */
export function createD1Storage(db: D1Database): StoragePort {
  return {
    async load(key: string): Promise<GrammarDto | null> {
      try {
        const row = await db
          .prepare('SELECT data FROM grammars WHERE key = ?')
          .bind(key)
          .first<GrammarRow>();

        if (row === null) {
          return null;
        }

        return JSON.parse(row.data) as GrammarDto;
      } catch (err) {
        throw wrapError('load_failed', `Failed to load grammar "${key}"`, err);
      }
    },

    async save(key: string, grammar: GrammarDto): Promise<void> {
      try {
        await db
          .prepare(
            "INSERT OR REPLACE INTO grammars (key, data, updated_at) VALUES (?, ?, datetime('now'))"
          )
          .bind(key, JSON.stringify(grammar))
          .run();
      } catch (err) {
        throw wrapError('save_failed', `Failed to save grammar "${key}"`, err);
      }
    },

    async delete(key: string): Promise<void> {
      try {
        await db.prepare('DELETE FROM grammars WHERE key = ?').bind(key).run();
      } catch (err) {
        throw wrapError('delete_failed', `Failed to delete grammar "${key}"`, err);
      }
    },

    async keys(): Promise<readonly string[]> {
      try {
        const result = await db.prepare('SELECT key FROM grammars ORDER BY key').all<KeyRow>();

        return result.results.map((row) => row.key);
      } catch (err) {
        throw wrapError('list_failed', 'Failed to list grammar keys', err);
      }
    },
  };
}
