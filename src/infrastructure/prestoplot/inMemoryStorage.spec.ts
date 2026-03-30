import { describe, expect, it } from 'vitest';

import type { GrammarDto, StoragePort } from '../../application/prestoplot/GrammarStorage.js';

import { createInMemoryStorage } from './inMemoryStorage.js';

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

describe('createInMemoryStorage', () => {
  it('returns an object satisfying the StoragePort interface', () => {
    const storage: StoragePort = createInMemoryStorage();
    expect(storage).toBeDefined();
    expect(typeof storage.load).toBe('function');
    expect(typeof storage.save).toBe('function');
    expect(typeof storage.delete).toBe('function');
    expect(typeof storage.keys).toBe('function');
  });

  describe('load', () => {
    it('returns null for a key that was never stored', async () => {
      const storage = createInMemoryStorage();
      const result = await storage.load('nonexistent');
      expect(result).toBeNull();
    });

    it('returns the stored DTO after save', async () => {
      const storage = createInMemoryStorage();
      const dto = makeDto('greeting');
      await storage.save('greeting', dto);
      const loaded = await storage.load('greeting');
      expect(loaded).toEqual(dto);
    });
  });

  describe('save', () => {
    it('overwrites an existing key', async () => {
      const storage = createInMemoryStorage();
      const dto1 = makeDto('overwrite', { rule1: { type: 'text' } });
      const dto2 = makeDto('overwrite', { rule2: { type: 'list' } });
      await storage.save('overwrite', dto1);
      await storage.save('overwrite', dto2);
      const loaded = await storage.load('overwrite');
      expect(loaded).toEqual(dto2);
    });
  });

  describe('delete', () => {
    it('removes a stored grammar', async () => {
      const storage = createInMemoryStorage();
      await storage.save('to-delete', makeDto('to-delete'));
      await storage.delete('to-delete');
      const result = await storage.load('to-delete');
      expect(result).toBeNull();
    });

    it('is a no-op for a missing key', async () => {
      const storage = createInMemoryStorage();
      await expect(storage.delete('missing')).resolves.toBeUndefined();
    });
  });

  describe('keys', () => {
    it('returns empty array when nothing stored', async () => {
      const storage = createInMemoryStorage();
      const result = await storage.keys();
      expect(result).toEqual([]);
    });

    it('returns all stored keys', async () => {
      const storage = createInMemoryStorage();
      await storage.save('alpha', makeDto('alpha'));
      await storage.save('beta', makeDto('beta'));
      const result = await storage.keys();
      expect(result).toEqual(expect.arrayContaining(['alpha', 'beta']));
      expect(result).toHaveLength(2);
    });

    it('does not include deleted keys', async () => {
      const storage = createInMemoryStorage();
      await storage.save('keep', makeDto('keep'));
      await storage.save('remove', makeDto('remove'));
      await storage.delete('remove');
      const result = await storage.keys();
      expect(result).toEqual(['keep']);
    });
  });

  describe('isolation', () => {
    it('separate instances do not share state', async () => {
      const storage1 = createInMemoryStorage();
      const storage2 = createInMemoryStorage();
      await storage1.save('only-in-1', makeDto('only-in-1'));
      const result = await storage2.load('only-in-1');
      expect(result).toBeNull();
    });
  });
});
