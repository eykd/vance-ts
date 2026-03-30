import { describe, expect, it } from 'vitest';

import type { GrammarDto, StoragePort } from './storagePort.js';

describe('StoragePort', () => {
  /**
   * Inline stub implementing StoragePort, proving the interface
   * is structurally sound and can be implemented.
   *
   * @returns A StoragePort backed by an in-memory Map.
   */
  function createStub(): StoragePort {
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

  it('should be implementable with all four methods', () => {
    const port: StoragePort = createStub();
    expect(port).toBeDefined();
  });

  it('load returns null for missing keys', async () => {
    const port = createStub();
    const result = await port.load('nonexistent');
    expect(result).toBeNull();
  });

  it('save and load round-trip a GrammarDto', async () => {
    const port = createStub();
    const dto: GrammarDto = {
      version: 1,
      key: 'test-grammar',
      entry: 'main',
      includes: [],
      rules: {},
    };
    await port.save('test-grammar', dto);
    const loaded = await port.load('test-grammar');
    expect(loaded).toEqual(dto);
  });

  it('delete removes a stored grammar', async () => {
    const port = createStub();
    const dto: GrammarDto = {
      version: 1,
      key: 'to-delete',
      entry: 'main',
      includes: [],
      rules: {},
    };
    await port.save('to-delete', dto);
    await port.delete('to-delete');
    const result = await port.load('to-delete');
    expect(result).toBeNull();
  });

  it('keys returns all stored grammar keys', async () => {
    const port = createStub();
    const dto: GrammarDto = { version: 1, key: 'a', entry: 'main', includes: [], rules: {} };
    await port.save('a', dto);
    await port.save('b', { ...dto, key: 'b' });
    const result = await port.keys();
    expect(result).toEqual(['a', 'b']);
  });
});
