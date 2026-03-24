/**
 * Unit tests for D1 row-to-domain mappers for galaxy entities.
 *
 * @module infrastructure/galaxy/mappers.spec
 */

import { describe, expect, it } from 'vitest';

import { Classification } from '../../domain/galaxy/types.js';

import { mapRowToStarSystem } from './mappers.js';

describe('mapRowToStarSystem', () => {
  it('converts a valid D1 row to a StarSystem', () => {
    const row = {
      id: 'sys-001',
      name: 'Sol',
      x: 10,
      y: 20,
      is_oikumene: 1,
      classification: 'oikumene',
      density: JSON.stringify({ neighborCount: 5, environmentPenalty: 0 }),
      attributes: JSON.stringify({ technology: 8, environment: 6, resources: 7 }),
      planetary: JSON.stringify({ size: 8, atmosphere: 6, temperature: 5, hydrography: 7 }),
      civilization: JSON.stringify({
        population: 9,
        starport: 5,
        government: 7,
        factions: 3,
        lawLevel: 6,
      }),
      trade_codes: JSON.stringify(['Hi', 'In', 'Ri']),
      economics: JSON.stringify({
        gurpsTechLevel: 10,
        perCapitaIncome: 45000,
        grossWorldProduct: 1.2e12,
        resourceMultiplier: 1.5,
        worldTradeNumber: 8.5,
      }),
    };

    const result = mapRowToStarSystem(row);

    expect(result).toEqual({
      id: 'sys-001',
      name: 'Sol',
      x: 10,
      y: 20,
      isOikumene: true,
      classification: Classification.OIKUMENE,
      density: { neighborCount: 5, environmentPenalty: 0 },
      attributes: { technology: 8, environment: 6, resources: 7 },
      planetary: { size: 8, atmosphere: 6, temperature: 5, hydrography: 7 },
      civilization: { population: 9, starport: 5, government: 7, factions: 3, lawLevel: 6 },
      tradeCodes: ['Hi', 'In', 'Ri'],
      economics: {
        gurpsTechLevel: 10,
        perCapitaIncome: 45000,
        grossWorldProduct: 1.2e12,
        resourceMultiplier: 1.5,
        worldTradeNumber: 8.5,
      },
    });
  });
});
