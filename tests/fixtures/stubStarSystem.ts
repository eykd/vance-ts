import { Classification } from '../../src/domain/galaxy/types';
import type { StarSystem } from '../../src/domain/galaxy/types';

/**
 * Creates a minimal StarSystem stub for contract and unit testing.
 *
 * @param overrides - Optional partial overrides for specific fields.
 * @returns A valid StarSystem object with sensible defaults.
 */
export function stubStarSystem(overrides: Partial<StarSystem> = {}): StarSystem {
  return {
    id: 'sol-001',
    name: 'Sol',
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
    ...overrides,
  };
}
