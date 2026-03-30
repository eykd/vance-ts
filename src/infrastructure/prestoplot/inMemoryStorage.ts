/**
 * In-memory StoragePort implementation backed by a Map.
 *
 * Suitable for testing and development. Each call to
 * {@link createInMemoryStorage} returns an isolated instance.
 *
 * @module infrastructure/prestoplot/inMemoryStorage
 */

import type { GrammarDto, StoragePort } from '../../application/prestoplot/GrammarStorage.js';

/**
 * Creates an in-memory {@link StoragePort} backed by a plain Map.
 *
 * @returns A StoragePort whose state lives entirely in memory.
 */
export function createInMemoryStorage(): StoragePort {
  const store = new Map<string, GrammarDto>();

  return {
    load(key: string): Promise<GrammarDto | null> {
      return Promise.resolve(store.get(key) ?? null);
    },
    save(key: string, grammar: GrammarDto): Promise<void> {
      store.set(key, grammar);
      return Promise.resolve();
    },
    delete(key: string): Promise<void> {
      store.delete(key);
      return Promise.resolve();
    },
    keys(): Promise<readonly string[]> {
      return Promise.resolve([...store.keys()]);
    },
  };
}
