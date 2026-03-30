/**
 * Cloudflare KV namespace adapter for StoragePort.
 *
 * Stores grammar DTOs in KV with a `grammar:` key prefix.
 * Enforces a value size limit of {@link MAX_KV_VALUE_BYTES} and
 * paginates key listing for namespaces with >1000 keys.
 *
 * @module infrastructure/prestoplot/kvStorage
 */

import { isGrammarDto } from '../../application/prestoplot/dto.js';
import type { GrammarDto, StoragePort } from '../../application/prestoplot/GrammarStorage.js';
import { StorageError } from '../../domain/prestoplot/errors.js';

/** Maximum KV value size in bytes. */
export const MAX_KV_VALUE_BYTES = 24_000_000;

/** Key prefix for all grammar entries in KV. */
const KEY_PREFIX = 'grammar:';

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
 * Creates a {@link StoragePort} backed by a Cloudflare KV namespace.
 *
 * @param kv - The KV namespace binding.
 * @returns A StoragePort that persists grammars in KV.
 */
export function createKVStorage(kv: KVNamespace): StoragePort {
  return {
    async load(key: string): Promise<GrammarDto | null> {
      try {
        const raw: unknown = await kv.get(`${KEY_PREFIX}${key}`, 'json');
        if (raw === null) {
          return null;
        }
        if (!isGrammarDto(raw)) {
          throw new StorageError('invalid_data', `Corrupted grammar data for key "${key}"`);
        }
        return raw;
      } catch (err) {
        if (err instanceof StorageError) {
          throw err;
        }
        throw wrapError('load_failed', `Failed to load grammar "${key}"`, err);
      }
    },

    async save(key: string, grammar: GrammarDto): Promise<void> {
      const serialized = JSON.stringify(grammar);
      const byteLength = new TextEncoder().encode(serialized).byteLength;
      if (byteLength > MAX_KV_VALUE_BYTES) {
        throw new StorageError(
          'value_too_large',
          `Grammar "${key}" serialized to ${String(byteLength)} bytes, exceeding limit of ${String(MAX_KV_VALUE_BYTES)}`
        );
      }
      try {
        await kv.put(`${KEY_PREFIX}${key}`, serialized);
      } catch (err) {
        throw wrapError('save_failed', `Failed to save grammar "${key}"`, err);
      }
    },

    async delete(key: string): Promise<void> {
      try {
        await kv.delete(`${KEY_PREFIX}${key}`);
      } catch (err) {
        throw wrapError('delete_failed', `Failed to delete grammar "${key}"`, err);
      }
    },

    async keys(): Promise<readonly string[]> {
      try {
        const allKeys: string[] = [];
        let cursor: string | undefined;
        let complete = false;

        while (!complete) {
          const opts: { prefix: string; cursor?: string } = { prefix: KEY_PREFIX };
          if (cursor !== undefined) {
            opts.cursor = cursor;
          }
          const result = await kv.list(opts);
          for (const entry of result.keys) {
            allKeys.push(entry.name.slice(KEY_PREFIX.length));
          }
          if (result.list_complete) {
            complete = true;
          } else {
            cursor = result.cursor;
          }
        }

        return allKeys;
      } catch (err) {
        throw wrapError('list_failed', 'Failed to list grammar keys', err);
      }
    },
  };
}
