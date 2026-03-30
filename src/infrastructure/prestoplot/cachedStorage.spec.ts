import { type MockInstance, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { GrammarDto, StoragePort } from '../../application/prestoplot/GrammarStorage.js';

import { createCachedStorage, MAX_DTO_CACHE_SIZE } from './cachedStorage.js';

/**
 * Helper to build a minimal GrammarDto.
 *
 * @param key - Grammar key.
 * @returns A minimal GrammarDto.
 */
function makeDto(key: string): GrammarDto {
  return { version: 1, key, entry: 'main', includes: [], rules: {} };
}

/** Fake storage with individually-accessible spy references. */
interface FakeStorage {
  /** The StoragePort instance. */
  readonly port: StoragePort;
  /** Spy for load method. */
  readonly loadSpy: MockInstance<(key: string) => Promise<GrammarDto | null>>;
  /** Spy for saveSpy method. */
  readonly saveSpy: MockInstance<(key: string, grammar: GrammarDto) => Promise<void>>;
  /** Spy for deleteSpy method. */
  readonly deleteSpy: MockInstance<(key: string) => Promise<void>>;
  /** Spy for keysSpy method. */
  readonly keysSpy: MockInstance<() => Promise<readonly string[]>>;
}

/**
 * Creates a fake StoragePort backed by a Map with spy references.
 *
 * @returns A FakeStorage with port and individual spies.
 */
function createFakeStorage(): FakeStorage {
  const store = new Map<string, GrammarDto>();

  const loadSpy = vi.fn((key: string): Promise<GrammarDto | null> => {
    return Promise.resolve(store.get(key) ?? null);
  });
  const saveSpy = vi.fn((key: string, grammar: GrammarDto): Promise<void> => {
    store.set(key, grammar);
    return Promise.resolve();
  });
  const deleteSpy = vi.fn((key: string): Promise<void> => {
    store.delete(key);
    return Promise.resolve();
  });
  const keysSpy = vi.fn((): Promise<readonly string[]> => {
    return Promise.resolve([...store.keys()]);
  });

  return {
    port: { load: loadSpy, save: saveSpy, delete: deleteSpy, keys: keysSpy },
    loadSpy,
    saveSpy,
    deleteSpy,
    keysSpy,
  };
}

describe('createCachedStorage', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('exports MAX_DTO_CACHE_SIZE as 100', () => {
    expect(MAX_DTO_CACHE_SIZE).toBe(100);
  });

  it('returns an object satisfying the StoragePort interface', () => {
    const { port } = createFakeStorage();
    const cached: StoragePort = createCachedStorage(port);
    expect(cached).toBeDefined();
    expect(typeof cached.load).toBe('function');
    expect(typeof cached.save).toBe('function');
    expect(typeof cached.delete).toBe('function');
    expect(typeof cached.keys).toBe('function');
  });

  describe('load', () => {
    it('delegates to inner storage on cache miss', async () => {
      const { port, loadSpy, saveSpy } = createFakeStorage();
      const cached = createCachedStorage(port);
      await saveSpy('a', makeDto('a'));
      loadSpy.mockClear();

      const result = await cached.load('a');
      expect(result).toEqual(makeDto('a'));
      expect(loadSpy).toHaveBeenCalledWith('a');
    });

    it('returns cached value on second load without hitting inner', async () => {
      const { port, loadSpy, saveSpy } = createFakeStorage();
      const cached = createCachedStorage(port);
      await saveSpy('a', makeDto('a'));
      loadSpy.mockClear();

      await cached.load('a');
      loadSpy.mockClear();

      const result = await cached.load('a');
      expect(result).toEqual(makeDto('a'));
      expect(loadSpy).not.toHaveBeenCalled();
    });

    it('returns null and does not cache misses', async () => {
      const { port, loadSpy } = createFakeStorage();
      const cached = createCachedStorage(port);

      const result1 = await cached.load('missing');
      expect(result1).toBeNull();

      const result2 = await cached.load('missing');
      expect(result2).toBeNull();
      expect(loadSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('save', () => {
    it('delegates to inner storage', async () => {
      const { port, saveSpy } = createFakeStorage();
      const cached = createCachedStorage(port);
      const dto = makeDto('a');

      await cached.save('a', dto);
      expect(saveSpy).toHaveBeenCalledWith('a', dto);
    });

    it('populates cache so subsequent load skips inner', async () => {
      const { port, loadSpy } = createFakeStorage();
      const cached = createCachedStorage(port);
      const dto = makeDto('a');

      await cached.save('a', dto);
      loadSpy.mockClear();

      const result = await cached.load('a');
      expect(result).toEqual(dto);
      expect(loadSpy).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('delegates to inner storage', async () => {
      const { port, deleteSpy } = createFakeStorage();
      const cached = createCachedStorage(port);

      await cached.delete('a');
      expect(deleteSpy).toHaveBeenCalledWith('a');
    });

    it('evicts key from cache', async () => {
      const { port, loadSpy } = createFakeStorage();
      const cached = createCachedStorage(port);
      await cached.save('a', makeDto('a'));
      await cached.delete('a');

      loadSpy.mockClear();
      const result = await cached.load('a');
      expect(result).toBeNull();
      expect(loadSpy).toHaveBeenCalledWith('a');
    });
  });

  describe('keys', () => {
    it('delegates to inner storage (not cached)', async () => {
      const { port, saveSpy, keysSpy } = createFakeStorage();
      const cached = createCachedStorage(port);
      await saveSpy('x', makeDto('x'));

      const result = await cached.keys();
      expect(result).toEqual(['x']);
      expect(keysSpy).toHaveBeenCalled();
    });
  });

  describe('TTL expiration', () => {
    it('serves from cache before TTL expires', async () => {
      const { port, loadSpy } = createFakeStorage();
      const cached = createCachedStorage(port, { ttlMs: 5000 });
      await cached.save('a', makeDto('a'));
      loadSpy.mockClear();

      vi.advanceTimersByTime(4999);
      const result = await cached.load('a');
      expect(result).toEqual(makeDto('a'));
      expect(loadSpy).not.toHaveBeenCalled();
    });

    it('re-fetches from inner after TTL expires', async () => {
      const { port, loadSpy } = createFakeStorage();
      const cached = createCachedStorage(port, { ttlMs: 5000 });
      await cached.save('a', makeDto('a'));
      loadSpy.mockClear();

      vi.advanceTimersByTime(5000);
      const result = await cached.load('a');
      expect(result).toEqual(makeDto('a'));
      expect(loadSpy).toHaveBeenCalledWith('a');
    });

    it('uses default TTL of 60000ms when not specified', async () => {
      const { port, loadSpy } = createFakeStorage();
      const cached = createCachedStorage(port);
      await cached.save('a', makeDto('a'));
      loadSpy.mockClear();

      vi.advanceTimersByTime(59_999);
      await cached.load('a');
      expect(loadSpy).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      await cached.load('a');
      expect(loadSpy).toHaveBeenCalledWith('a');
    });
  });

  describe('FIFO eviction', () => {
    it('evicts the oldest entry when cache exceeds MAX_DTO_CACHE_SIZE', async () => {
      const { port, loadSpy } = createFakeStorage();
      const cached = createCachedStorage(port);

      // Fill cache to capacity
      for (let i = 0; i < MAX_DTO_CACHE_SIZE; i++) {
        await cached.save(`key-${String(i)}`, makeDto(`key-${String(i)}`));
      }

      // Verify key-0 is cached
      loadSpy.mockClear();
      await cached.load('key-0');
      expect(loadSpy).not.toHaveBeenCalled();

      // Add the 101st key - should evict key-0 (oldest)
      await cached.save('key-100', makeDto('key-100'));

      // key-0 should now require inner load
      loadSpy.mockClear();
      await cached.load('key-0');
      expect(loadSpy).toHaveBeenCalledWith('key-0');
    });

    it('does not evict newer entries', async () => {
      const { port, loadSpy } = createFakeStorage();
      const cached = createCachedStorage(port);

      // Fill cache to capacity + 1
      for (let i = 0; i <= MAX_DTO_CACHE_SIZE; i++) {
        await cached.save(`key-${String(i)}`, makeDto(`key-${String(i)}`));
      }

      // key-1 (second oldest) should still be cached
      loadSpy.mockClear();
      await cached.load('key-1');
      expect(loadSpy).not.toHaveBeenCalled();

      // key-100 (newest) should be cached
      loadSpy.mockClear();
      await cached.load('key-100');
      expect(loadSpy).not.toHaveBeenCalled();
    });

    it('evicts multiple oldest entries when needed', async () => {
      const { port, loadSpy } = createFakeStorage();
      const cached = createCachedStorage(port);

      // Fill to capacity
      for (let i = 0; i < MAX_DTO_CACHE_SIZE; i++) {
        await cached.save(`key-${String(i)}`, makeDto(`key-${String(i)}`));
      }

      // Add 3 more entries - should evict key-0, key-1, key-2
      await cached.save('extra-0', makeDto('extra-0'));
      await cached.save('extra-1', makeDto('extra-1'));
      await cached.save('extra-2', makeDto('extra-2'));

      // key-0, key-1, key-2 were evicted - must hit inner
      loadSpy.mockClear();
      await cached.load('key-0');
      expect(loadSpy).toHaveBeenCalledWith('key-0');

      loadSpy.mockClear();
      await cached.load('key-1');
      expect(loadSpy).toHaveBeenCalledWith('key-1');

      loadSpy.mockClear();
      await cached.load('key-2');
      expect(loadSpy).toHaveBeenCalledWith('key-2');
    });
  });

  describe('save overwrites refresh cache entry', () => {
    it('re-saving an existing key does not count as a new entry', async () => {
      const { port, loadSpy } = createFakeStorage();
      const cached = createCachedStorage(port);

      // Fill cache to capacity
      for (let i = 0; i < MAX_DTO_CACHE_SIZE; i++) {
        await cached.save(`key-${String(i)}`, makeDto(`key-${String(i)}`));
      }

      // Re-save key-0 (should update, not add new entry)
      await cached.save('key-0', makeDto('key-0'));

      // key-1 should still be cached (it wasn't evicted)
      loadSpy.mockClear();
      await cached.load('key-1');
      expect(loadSpy).not.toHaveBeenCalled();
    });
  });
});
