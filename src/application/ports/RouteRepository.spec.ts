import { describe, expect, it, vi } from 'vitest';

import { Classification } from '../../domain/galaxy/types';
import type { StarSystem } from '../../domain/galaxy/types';

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
  it('module exists and can be imported at runtime', async () => {
    const mod = (await import('./RouteRepository')) as Record<string, unknown>;

    expect(mod).toBeDefined();
  });

  describe('interface contract', () => {
    it('findConnectedSystems returns connected systems with route costs', async () => {
      const connected: readonly ConnectedSystem[] = [
        { system: stubStarSystem('alpha-001', 'Alpha Centauri'), cost: 2.5 },
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

/**
 * Creates a minimal StarSystem stub for contract testing.
 *
 * @param id - System identifier.
 * @param name - System name.
 * @returns A valid StarSystem object with default values.
 */
function stubStarSystem(id = 'sol-001', name = 'Sol'): StarSystem {
  return {
    id,
    name,
    x: 0,
    y: 0,
    isOikumene: true,
    classification: Classification.OIKUMENE,
    density: { neighborCount: 5, environmentPenalty: 0 },
    attributes: { technology: 10, environment: 8, resources: 7 },
    planetary: { size: 8, atmosphere: 6, temperature: 7, hydrography: 7 },
    civilization: { population: 10, starport: 5, government: 3, factions: 4, lawLevel: 5 },
    tradeCodes: ['Hi', 'In'],
    economics: {
      gurpsTechLevel: 10,
      perCapitaIncome: 50000,
      grossWorldProduct: 1e12,
      resourceMultiplier: 1.0,
      worldTradeNumber: 5.5,
    },
  };
}
