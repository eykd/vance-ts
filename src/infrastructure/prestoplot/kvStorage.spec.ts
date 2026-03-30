/**
 * KVStorage unit tests.
 *
 * Tests the Cloudflare KV namespace adapter for StoragePort using
 * a mock KVNamespace. Covers key prefixing, value size limit,
 * pagination for >1000 keys, and error wrapping as StorageError.
 *
 * Uses individual vi.fn() references for mock methods to avoid
 * triggering the unbound-method lint rule.
 *
 * @module
 */

import { describe, expect, it, vi } from 'vitest';

import type { GrammarDto, StoragePort } from '../../application/prestoplot/GrammarStorage.js';
import { StorageError } from '../../domain/prestoplot/errors.js';

import { createKVStorage, MAX_KV_VALUE_BYTES } from './kvStorage.js';

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

/** Shape returned by {@link createMockKV}. */
interface MockKV {
  /** The mock KVNamespace to pass to createKVStorage. */
  readonly namespace: KVNamespace;
  /** Individual mock fn for KV.get. */
  readonly getFn: ReturnType<typeof vi.fn>;
  /** Individual mock fn for KV.put. */
  readonly putFn: ReturnType<typeof vi.fn>;
  /** Individual mock fn for KV.delete. */
  readonly deleteFn: ReturnType<typeof vi.fn>;
  /** Individual mock fn for KV.list. */
  readonly listFn: ReturnType<typeof vi.fn>;
}

/**
 * Creates a mock KVNamespace with individual vi.fn() references.
 *
 * @returns Mock KV namespace and individual fn references.
 */
function createMockKV(): MockKV {
  const store = new Map<string, string>();

  const getFn = vi.fn((key: string) => Promise.resolve(store.get(key) ?? null));
  const putFn = vi.fn((key: string, value: string) => {
    store.set(key, value);
    return Promise.resolve();
  });
  const deleteFn = vi.fn((key: string) => {
    store.delete(key);
    return Promise.resolve();
  });
  const listFn = vi.fn((opts?: { prefix?: string; cursor?: string }) => {
    const prefix = opts?.prefix ?? '';
    const keys = [...store.keys()]
      .filter((k) => k.startsWith(prefix))
      .map((k) => ({ name: k, expiration: undefined, metadata: undefined }));
    return Promise.resolve({
      keys,
      list_complete: true,
      cursor: '',
      cacheStatus: null,
    });
  });

  const namespace = {
    get: getFn,
    put: putFn,
    delete: deleteFn,
    list: listFn,
    getWithMetadata: vi.fn(),
  } as unknown as KVNamespace;

  return { namespace, getFn, putFn, deleteFn, listFn };
}

describe('createKVStorage', () => {
  it('returns an object satisfying the StoragePort interface', () => {
    const { namespace } = createMockKV();
    const storage: StoragePort = createKVStorage(namespace);
    expect(storage).toBeDefined();
    expect(typeof storage.load).toBe('function');
    expect(typeof storage.save).toBe('function');
    expect(typeof storage.delete).toBe('function');
    expect(typeof storage.keys).toBe('function');
  });

  describe('load', () => {
    it('returns null for a key that does not exist', async () => {
      const { namespace, getFn } = createMockKV();
      const storage = createKVStorage(namespace);
      const result = await storage.load('nonexistent');
      expect(result).toBeNull();
      expect(getFn).toHaveBeenCalledWith('grammar:nonexistent', 'json');
    });

    it('returns the stored DTO after save', async () => {
      const { namespace, getFn } = createMockKV();
      const storage = createKVStorage(namespace);
      const dto = makeDto('greeting');
      await storage.save('greeting', dto);
      // Override get to return parsed JSON like real KV
      getFn.mockResolvedValueOnce(dto);
      const loaded = await storage.load('greeting');
      expect(loaded).toEqual(dto);
    });

    it('uses grammar: key prefix', async () => {
      const { namespace, getFn } = createMockKV();
      const storage = createKVStorage(namespace);
      await storage.load('mykey');
      expect(getFn).toHaveBeenCalledWith('grammar:mykey', 'json');
    });

    it('wraps KV errors as StorageError', async () => {
      const { namespace, getFn } = createMockKV();
      getFn.mockRejectedValueOnce(new Error('KV read failure'));
      const storage = createKVStorage(namespace);
      await expect(storage.load('fail')).rejects.toThrow(StorageError);
    });

    it('preserves original error as cause', async () => {
      const { namespace, getFn } = createMockKV();
      const original = new Error('KV read failure');
      getFn.mockRejectedValueOnce(original);
      const storage = createKVStorage(namespace);
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
    it('stores grammar with grammar: prefix', async () => {
      const { namespace, putFn } = createMockKV();
      const storage = createKVStorage(namespace);
      const dto = makeDto('test');
      await storage.save('test', dto);
      expect(putFn).toHaveBeenCalledWith('grammar:test', JSON.stringify(dto));
    });

    it('overwrites an existing key', async () => {
      const { namespace, putFn } = createMockKV();
      const storage = createKVStorage(namespace);
      const dto1 = makeDto('overwrite', { rule1: { type: 'text' } });
      const dto2 = makeDto('overwrite', { rule2: { type: 'list' } });
      await storage.save('overwrite', dto1);
      await storage.save('overwrite', dto2);
      expect(putFn).toHaveBeenCalledTimes(2);
      expect(putFn).toHaveBeenLastCalledWith('grammar:overwrite', JSON.stringify(dto2));
    });

    it('wraps KV errors as StorageError', async () => {
      const { namespace, putFn } = createMockKV();
      putFn.mockRejectedValueOnce(new Error('KV write failure'));
      const storage = createKVStorage(namespace);
      await expect(storage.save('fail', makeDto('fail'))).rejects.toThrow(StorageError);
    });

    it('throws StorageError when value exceeds MAX_KV_VALUE_BYTES', async () => {
      const { namespace, putFn } = createMockKV();
      const storage = createKVStorage(namespace);
      const largeRules: Record<string, unknown> = {};
      const bigString = 'x'.repeat(MAX_KV_VALUE_BYTES);
      largeRules['huge'] = { type: 'text', name: 'huge', data: bigString };
      const dto = makeDto('too-large', largeRules);
      await expect(storage.save('too-large', dto)).rejects.toThrow(StorageError);
      // KV put should NOT be called — we reject before writing
      expect(putFn).not.toHaveBeenCalled();
    });

    it('includes value_too_large code for oversized values', async () => {
      const { namespace } = createMockKV();
      const storage = createKVStorage(namespace);
      const largeRules: Record<string, unknown> = {};
      const bigString = 'x'.repeat(MAX_KV_VALUE_BYTES);
      largeRules['huge'] = { type: 'text', name: 'huge', data: bigString };
      const dto = makeDto('too-large', largeRules);
      try {
        await storage.save('too-large', dto);
        expect.fail('should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(StorageError);
        expect((err as StorageError).code).toBe('value_too_large');
      }
    });
  });

  describe('delete', () => {
    it('deletes with grammar: prefix', async () => {
      const { namespace, deleteFn } = createMockKV();
      const storage = createKVStorage(namespace);
      await storage.delete('to-delete');
      expect(deleteFn).toHaveBeenCalledWith('grammar:to-delete');
    });

    it('is a no-op when key does not exist (KV delete is idempotent)', async () => {
      const { namespace } = createMockKV();
      const storage = createKVStorage(namespace);
      await expect(storage.delete('missing')).resolves.toBeUndefined();
    });

    it('wraps KV errors as StorageError', async () => {
      const { namespace, deleteFn } = createMockKV();
      deleteFn.mockRejectedValueOnce(new Error('KV delete failure'));
      const storage = createKVStorage(namespace);
      await expect(storage.delete('fail')).rejects.toThrow(StorageError);
    });
  });

  describe('keys', () => {
    it('returns empty array when nothing stored', async () => {
      const { namespace, listFn } = createMockKV();
      const storage = createKVStorage(namespace);
      const result = await storage.keys();
      expect(result).toEqual([]);
      expect(listFn).toHaveBeenCalledWith({ prefix: 'grammar:' });
    });

    it('strips grammar: prefix from returned keys', async () => {
      const { namespace, listFn } = createMockKV();
      listFn.mockResolvedValueOnce({
        keys: [
          { name: 'grammar:alpha', expiration: undefined, metadata: undefined },
          { name: 'grammar:beta', expiration: undefined, metadata: undefined },
        ],
        list_complete: true,
        cursor: '',
        cacheStatus: null,
      });
      const storage = createKVStorage(namespace);
      const result = await storage.keys();
      expect(result).toEqual(['alpha', 'beta']);
    });

    it('paginates when list_complete is false', async () => {
      const { namespace, listFn } = createMockKV();
      listFn
        .mockResolvedValueOnce({
          keys: [{ name: 'grammar:page1', expiration: undefined, metadata: undefined }],
          list_complete: false,
          cursor: 'cursor1',
          cacheStatus: null,
        })
        .mockResolvedValueOnce({
          keys: [{ name: 'grammar:page2', expiration: undefined, metadata: undefined }],
          list_complete: true,
          cursor: '',
          cacheStatus: null,
        });
      const storage = createKVStorage(namespace);
      const result = await storage.keys();
      expect(result).toEqual(['page1', 'page2']);
      expect(listFn).toHaveBeenCalledTimes(2);
      expect(listFn).toHaveBeenNthCalledWith(1, { prefix: 'grammar:' });
      expect(listFn).toHaveBeenNthCalledWith(2, { prefix: 'grammar:', cursor: 'cursor1' });
    });

    it('wraps KV errors as StorageError', async () => {
      const { namespace, listFn } = createMockKV();
      listFn.mockRejectedValueOnce(new Error('KV list failure'));
      const storage = createKVStorage(namespace);
      await expect(storage.keys()).rejects.toThrow(StorageError);
    });
  });
});

describe('MAX_KV_VALUE_BYTES', () => {
  it('equals 24_000_000', () => {
    expect(MAX_KV_VALUE_BYTES).toBe(24_000_000);
  });
});
