import { describe, expect, it, vi } from 'vitest';

import { stubStarSystem } from '../../../tests/fixtures/stubStarSystem';
import type { StarSystem } from '../galaxy/types';

import type { StarSystemRepository } from './StarSystemRepository';

/**
 * Creates a typed stub of StarSystemRepository with vi.fn() defaults.
 *
 * @param overrides - Partial overrides for specific methods.
 * @returns A fully typed StarSystemRepository stub.
 */
function createStub(overrides: Partial<StarSystemRepository> = {}): StarSystemRepository {
  return {
    findById: vi.fn<StarSystemRepository['findById']>(),
    findByName: vi.fn<StarSystemRepository['findByName']>(),
    searchByNamePrefix: vi.fn<StarSystemRepository['searchByNamePrefix']>(),
    ...overrides,
  };
}

/**
 * Contract tests for the StarSystemRepository port.
 *
 * Verifies the interface shape can be satisfied by test doubles.
 * Adapter tests (D1StarSystemRepository) live in src/infrastructure/.
 */
describe('StarSystemRepository port', () => {
  // The StarSystemRepository type import above serves as a compile-time
  // check that the module exports the interface correctly.

  describe('interface contract', () => {
    it('findById returns a StarSystem when found', async () => {
      const system: StarSystem = stubStarSystem();
      const findByIdFn = vi.fn<StarSystemRepository['findById']>().mockResolvedValue(system);
      const stub = createStub({ findById: findByIdFn });

      const result = await stub.findById('sol-001');

      expect(result).toBe(system);
      expect(findByIdFn).toHaveBeenCalledWith('sol-001');
    });

    it('findById returns null when not found', async () => {
      const stub = createStub({
        findById: vi.fn<StarSystemRepository['findById']>().mockResolvedValue(null),
      });

      const result = await stub.findById('nonexistent');

      expect(result).toBeNull();
    });

    it('findByName returns a StarSystem when found', async () => {
      const system: StarSystem = stubStarSystem();
      const findByNameFn = vi.fn<StarSystemRepository['findByName']>().mockResolvedValue(system);
      const stub = createStub({ findByName: findByNameFn });

      const result = await stub.findByName('Sol');

      expect(result).toBe(system);
      expect(findByNameFn).toHaveBeenCalledWith('Sol');
    });

    it('findByName returns null when not found', async () => {
      const stub = createStub({
        findByName: vi.fn<StarSystemRepository['findByName']>().mockResolvedValue(null),
      });

      const result = await stub.findByName('Unknown');

      expect(result).toBeNull();
    });

    it('searchByNamePrefix returns matching systems', async () => {
      const systems: readonly StarSystem[] = [stubStarSystem()];
      const searchFn = vi
        .fn<StarSystemRepository['searchByNamePrefix']>()
        .mockResolvedValue(systems);
      const stub = createStub({ searchByNamePrefix: searchFn });

      const result = await stub.searchByNamePrefix('Sol');

      expect(result).toBe(systems);
      expect(searchFn).toHaveBeenCalledWith('Sol');
    });

    it('searchByNamePrefix accepts an optional limit parameter', async () => {
      const searchFn = vi.fn<StarSystemRepository['searchByNamePrefix']>().mockResolvedValue([]);
      const stub = createStub({ searchByNamePrefix: searchFn });

      const result = await stub.searchByNamePrefix('Al', 5);

      expect(result).toEqual([]);
      expect(searchFn).toHaveBeenCalledWith('Al', 5);
    });
  });
});
