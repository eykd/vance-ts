/**
 * Caching decorator for {@link StoragePort} with TTL and FIFO eviction.
 *
 * Wraps any StoragePort implementation with an in-memory cache.
 * Entries expire after a configurable TTL. When the cache exceeds
 * {@link MAX_DTO_CACHE_SIZE}, the oldest entry is evicted (FIFO).
 *
 * @module infrastructure/prestoplot/cachedStorage
 */

import type { GrammarDto, StoragePort } from '../../application/prestoplot/GrammarStorage.js';

/** Maximum number of entries in the DTO cache before FIFO eviction. */
export const MAX_DTO_CACHE_SIZE = 100;

/** Default cache TTL in milliseconds (60 seconds). */
const DEFAULT_TTL_MS = 60_000;

/** A cached entry with its storage timestamp. */
interface CacheEntry {
  readonly dto: GrammarDto;
  readonly storedAt: number;
}

/** Options for configuring the cached storage decorator. */
export interface CachedStorageOptions {
  /** Time-to-live for cache entries in milliseconds. */
  readonly ttlMs?: number;
}

/**
 * Creates a caching decorator around a {@link StoragePort}.
 *
 * @param inner - The underlying storage to delegate to.
 * @param options - Optional configuration for TTL.
 * @returns A StoragePort that caches load/save results in memory.
 */
export function createCachedStorage(
  inner: StoragePort,
  options?: CachedStorageOptions
): StoragePort {
  const ttlMs = options?.ttlMs ?? DEFAULT_TTL_MS;
  const cache = new Map<string, CacheEntry>();
  const insertionOrder: string[] = [];

  /**
   * Evicts the oldest cache entry if the cache exceeds the size limit.
   */
  function evictIfNeeded(): void {
    while (insertionOrder.length > MAX_DTO_CACHE_SIZE) {
      const oldest = insertionOrder.shift();
      if (oldest !== undefined) {
        cache.delete(oldest);
      }
    }
  }

  /**
   * Adds or updates an entry in the cache, maintaining insertion order.
   *
   * @param key - The cache key.
   * @param dto - The grammar DTO to cache.
   */
  function cacheSet(key: string, dto: GrammarDto): void {
    if (cache.has(key)) {
      // Remove from insertion order so we don't double-count
      const idx = insertionOrder.indexOf(key);
      if (idx !== -1) {
        insertionOrder.splice(idx, 1);
      }
    }
    cache.set(key, { dto, storedAt: Date.now() });
    insertionOrder.push(key);
    evictIfNeeded();
  }

  return {
    async load(key: string): Promise<GrammarDto | null> {
      const entry = cache.get(key);
      if (entry !== undefined) {
        const age = Date.now() - entry.storedAt;
        if (age < ttlMs) {
          return entry.dto;
        }
        // Expired - remove from cache
        cache.delete(key);
        const idx = insertionOrder.indexOf(key);
        if (idx !== -1) {
          insertionOrder.splice(idx, 1);
        }
      }

      const result = await inner.load(key);
      if (result !== null) {
        cacheSet(key, result);
      }
      return result;
    },

    async save(key: string, grammar: GrammarDto): Promise<void> {
      await inner.save(key, grammar);
      cacheSet(key, grammar);
    },

    async delete(key: string): Promise<void> {
      await inner.delete(key);
      cache.delete(key);
      const idx = insertionOrder.indexOf(key);
      if (idx !== -1) {
        insertionOrder.splice(idx, 1);
      }
    },

    async keys(): Promise<readonly string[]> {
      return inner.keys();
    },
  };
}
