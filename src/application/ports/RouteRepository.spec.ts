import { describe, expect, it, vi } from 'vitest';

import { stubStarSystem } from '../../../tests/fixtures/stubStarSystem';

import type { ConnectedSystem, RouteRepository } from './RouteRepository';

/**
 * Creates a typed stub of RouteRepository with vi.fn() defaults.
 *
 * @param overrides - Partial overrides for specific methods.
 * @returns A fully typed RouteRepository stub.
 */
function createStub(overrides: Partial<RouteRepository> = {}): RouteRepository {
  return {
    findConnectedSystems: vi.fn<RouteRepository['findConnectedSystems']>(),
    ...overrides,
  };
}

/**
 * Contract tests for the RouteRepository port.
 *
 * Verifies the interface shape can be satisfied by test doubles.
 * Adapter tests (D1RouteRepository) live in src/infrastructure/.
 */
describe('RouteRepository port', () => {
  describe('interface contract', () => {
    it('findConnectedSystems returns connected systems with route costs', async () => {
      const connected: readonly ConnectedSystem[] = [
        { system: stubStarSystem({ id: 'alpha-001', name: 'Alpha Centauri' }), cost: 2.5 },
      ];
      const findFn = vi.fn<RouteRepository['findConnectedSystems']>().mockResolvedValue(connected);
      const stub = createStub({ findConnectedSystems: findFn });

      const result = await stub.findConnectedSystems('sol-001');

      expect(result).toBe(connected);
      expect(findFn).toHaveBeenCalledWith('sol-001');
    });

    it('findConnectedSystems returns empty array when no connections exist', async () => {
      const stub = createStub({
        findConnectedSystems: vi
          .fn<RouteRepository['findConnectedSystems']>()
          .mockResolvedValue([]),
      });

      const result = await stub.findConnectedSystems('isolated-001');

      expect(result).toEqual([]);
    });
  });
});
