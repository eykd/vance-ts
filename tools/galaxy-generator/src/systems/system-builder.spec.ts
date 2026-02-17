import { Mulberry32 } from '../../../../src/domain/galaxy/prng';
import type { Coordinate, DensityData } from '../../../../src/domain/galaxy/types';
import { Classification } from '../../../../src/domain/galaxy/types';

import type { ClassificationResult } from './classification';
import { buildSystems, type SystemBuildInput } from './system-builder';

/**
 * Creates a default SystemBuildInput for testing.
 *
 * @param overrides - partial input to merge
 * @returns complete SystemBuildInput
 */
function makeInput(overrides: Partial<SystemBuildInput> = {}): SystemBuildInput {
  const coordinates: Coordinate[] = [
    { x: 10, y: 20 },
    { x: 30, y: 40 },
    { x: 50, y: 60 },
  ];

  const classifications: ClassificationResult[] = [
    { index: 0, classification: Classification.OIKUMENE, isOikumene: true },
    { index: 1, classification: Classification.UNINHABITED, isOikumene: false },
    { index: 2, classification: Classification.LOST_COLONY, isOikumene: false },
  ];

  const densities: DensityData[] = [
    { neighborCount: 8, environmentPenalty: -2 },
    { neighborCount: 0, environmentPenalty: 0 },
    { neighborCount: 2, environmentPenalty: 0 },
  ];

  return {
    coordinates,
    classifications,
    densities,
    ...overrides,
  };
}

describe('buildSystems', () => {
  it('produces one StarSystem per coordinate', () => {
    const rng = new Mulberry32(42);
    const input = makeInput();

    const result = buildSystems(input, rng);

    expect(result).toHaveLength(3);
  });

  it('is deterministic with the same seed', () => {
    const input = makeInput();

    const result1 = buildSystems(input, new Mulberry32(42));
    const result2 = buildSystems(input, new Mulberry32(42));

    expect(result1).toEqual(result2);
  });

  it('produces different results with different seeds', () => {
    const input = makeInput();

    const result1 = buildSystems(input, new Mulberry32(42));
    const result2 = buildSystems(input, new Mulberry32(9999));

    expect(result1).not.toEqual(result2);
  });

  it('assigns correct coordinates to each system', () => {
    const rng = new Mulberry32(42);
    const input = makeInput();

    const result = buildSystems(input, rng);

    expect(result[0]?.x).toBe(10);
    expect(result[0]?.y).toBe(20);
    expect(result[1]?.x).toBe(30);
    expect(result[1]?.y).toBe(40);
    expect(result[2]?.x).toBe(50);
    expect(result[2]?.y).toBe(60);
  });

  it('assigns correct classification and isOikumene flags', () => {
    const rng = new Mulberry32(42);
    const input = makeInput();

    const result = buildSystems(input, rng);

    expect(result[0]?.classification).toBe(Classification.OIKUMENE);
    expect(result[0]?.isOikumene).toBe(true);
    expect(result[1]?.classification).toBe(Classification.UNINHABITED);
    expect(result[1]?.isOikumene).toBe(false);
    expect(result[2]?.classification).toBe(Classification.LOST_COLONY);
    expect(result[2]?.isOikumene).toBe(false);
  });

  it('assigns correct density data to each system', () => {
    const rng = new Mulberry32(42);
    const input = makeInput();

    const result = buildSystems(input, rng);

    expect(result[0]?.density).toEqual({ neighborCount: 8, environmentPenalty: -2 });
    expect(result[1]?.density).toEqual({ neighborCount: 0, environmentPenalty: 0 });
    expect(result[2]?.density).toEqual({ neighborCount: 2, environmentPenalty: 0 });
  });

  it('generates unique IDs for every system', () => {
    const rng = new Mulberry32(42);
    const input = makeInput();

    const result = buildSystems(input, rng);

    const ids = result.map((s) => s.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(result.length);
  });

  it('generates IDs in UUID v4 format', () => {
    const rng = new Mulberry32(42);
    const input = makeInput();

    const result = buildSystems(input, rng);

    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
    for (const system of result) {
      expect(system.id).toMatch(uuidPattern);
    }
  });

  it('generates unique names for every system', () => {
    const rng = new Mulberry32(42);
    const input = makeInput();

    const result = buildSystems(input, rng);

    const names = result.map((s) => s.name);
    const uniqueNames = new Set(names);
    expect(uniqueNames.size).toBe(result.length);
  });

  it('generates non-empty names', () => {
    const rng = new Mulberry32(42);
    const input = makeInput();

    const result = buildSystems(input, rng);

    for (const system of result) {
      expect(system.name.length).toBeGreaterThan(0);
    }
  });

  it('enforces Oikumene constraints: tech >= +1, pop >= 6', () => {
    const coordinates: Coordinate[] = Array.from({ length: 20 }, (_, i) => ({
      x: i * 10,
      y: i * 10,
    }));
    const classifications: ClassificationResult[] = coordinates.map((_, i) => ({
      index: i,
      classification: Classification.OIKUMENE,
      isOikumene: true,
    }));
    const densities: DensityData[] = coordinates.map(() => ({
      neighborCount: 0,
      environmentPenalty: 0,
    }));

    for (let seed = 0; seed < 10; seed++) {
      const rng = new Mulberry32(seed);
      const result = buildSystems({ coordinates, classifications, densities }, rng);

      for (const system of result) {
        expect(system.attributes.technology).toBeGreaterThanOrEqual(1);
        expect(system.civilization.population).toBeGreaterThanOrEqual(6);
      }
    }
  });

  it('enforces Uninhabited constraints: pop = 0, all civilization fields = 0', () => {
    const coordinates: Coordinate[] = [{ x: 0, y: 0 }];
    const classifications: ClassificationResult[] = [
      { index: 0, classification: Classification.UNINHABITED, isOikumene: false },
    ];
    const densities: DensityData[] = [{ neighborCount: 0, environmentPenalty: 0 }];

    for (let seed = 0; seed < 20; seed++) {
      const rng = new Mulberry32(seed);
      const result = buildSystems({ coordinates, classifications, densities }, rng);

      expect(result[0]?.civilization.population).toBe(0);
      expect(result[0]?.civilization.starport).toBe(0);
      expect(result[0]?.civilization.government).toBe(0);
      expect(result[0]?.civilization.factions).toBe(0);
      expect(result[0]?.civilization.lawLevel).toBe(0);
    }
  });

  it('enforces Lost Colony constraints: tech <= -2', () => {
    const coordinates: Coordinate[] = [{ x: 0, y: 0 }];
    const classifications: ClassificationResult[] = [
      { index: 0, classification: Classification.LOST_COLONY, isOikumene: false },
    ];
    const densities: DensityData[] = [{ neighborCount: 0, environmentPenalty: 0 }];

    for (let seed = 0; seed < 20; seed++) {
      const rng = new Mulberry32(seed);
      const result = buildSystems({ coordinates, classifications, densities }, rng);

      expect(result[0]?.attributes.technology).toBeLessThanOrEqual(-2);
    }
  });

  it('enforces Hidden Enclave constraints: tech >= +2, pop <= 4', () => {
    const coordinates: Coordinate[] = [{ x: 0, y: 0 }];
    const classifications: ClassificationResult[] = [
      { index: 0, classification: Classification.HIDDEN_ENCLAVE, isOikumene: false },
    ];
    const densities: DensityData[] = [{ neighborCount: 0, environmentPenalty: 0 }];

    for (let seed = 0; seed < 20; seed++) {
      const rng = new Mulberry32(seed);
      const result = buildSystems({ coordinates, classifications, densities }, rng);

      expect(result[0]?.attributes.technology).toBeGreaterThanOrEqual(2);
      expect(result[0]?.civilization.population).toBeLessThanOrEqual(4);
    }
  });

  it('applies density penalty to environment', () => {
    const coordinates: Coordinate[] = [
      { x: 0, y: 0 },
      { x: 10, y: 10 },
    ];
    const classifications: ClassificationResult[] = [
      { index: 0, classification: Classification.OIKUMENE, isOikumene: true },
      { index: 1, classification: Classification.OIKUMENE, isOikumene: true },
    ];

    const denseResult = buildSystems(
      {
        coordinates,
        classifications,
        densities: [
          { neighborCount: 16, environmentPenalty: -4 },
          { neighborCount: 16, environmentPenalty: -4 },
        ],
      },
      new Mulberry32(42)
    );

    const sparseResult = buildSystems(
      {
        coordinates,
        classifications,
        densities: [
          { neighborCount: 0, environmentPenalty: 0 },
          { neighborCount: 0, environmentPenalty: 0 },
        ],
      },
      new Mulberry32(42)
    );

    // First system (same seed, same PRNG path for names/UUIDs) should differ in environment
    expect(denseResult[0]?.attributes.environment).toBe(
      (sparseResult[0]?.attributes.environment ?? 0) - 4
    );
  });

  it('derives trade codes from generated attributes', () => {
    const rng = new Mulberry32(42);
    const input = makeInput();

    const result = buildSystems(input, rng);

    for (const system of result) {
      expect(Array.isArray(system.tradeCodes)).toBe(true);
      // Trade codes should be sorted strings
      const sorted = [...system.tradeCodes].sort();
      expect(system.tradeCodes).toEqual(sorted);
    }
  });

  it('derives economics from generated attributes', () => {
    const rng = new Mulberry32(42);
    const input = makeInput();

    const result = buildSystems(input, rng);

    for (const system of result) {
      expect(typeof system.economics.gurpsTechLevel).toBe('number');
      expect(typeof system.economics.perCapitaIncome).toBe('number');
      expect(typeof system.economics.grossWorldProduct).toBe('number');
      expect(typeof system.economics.resourceMultiplier).toBe('number');
      expect(typeof system.economics.worldTradeNumber).toBe('number');
    }
  });

  it('returns zero economics for uninhabited systems', () => {
    const coordinates: Coordinate[] = [{ x: 0, y: 0 }];
    const classifications: ClassificationResult[] = [
      { index: 0, classification: Classification.UNINHABITED, isOikumene: false },
    ];
    const densities: DensityData[] = [{ neighborCount: 0, environmentPenalty: 0 }];

    const rng = new Mulberry32(42);
    const result = buildSystems({ coordinates, classifications, densities }, rng);

    expect(result[0]?.economics.gurpsTechLevel).toBe(0);
    expect(result[0]?.economics.perCapitaIncome).toBe(0);
    expect(result[0]?.economics.grossWorldProduct).toBe(0);
    expect(result[0]?.economics.resourceMultiplier).toBe(0);
    expect(result[0]?.economics.worldTradeNumber).toBe(0);
  });

  it('produces valid StarSystem shape for all systems', () => {
    const rng = new Mulberry32(42);
    const input = makeInput();

    const result = buildSystems(input, rng);

    const expectedKeys = [
      'attributes',
      'civilization',
      'classification',
      'density',
      'economics',
      'id',
      'isOikumene',
      'name',
      'planetary',
      'tradeCodes',
      'x',
      'y',
    ];

    for (const system of result) {
      expect(Object.keys(system).sort()).toEqual(expectedKeys);
    }
  });

  it('handles empty input', () => {
    const rng = new Mulberry32(42);
    const result = buildSystems({ coordinates: [], classifications: [], densities: [] }, rng);

    expect(result).toEqual([]);
  });

  it('handles single system input', () => {
    const rng = new Mulberry32(42);
    const result = buildSystems(
      {
        coordinates: [{ x: 5, y: 10 }],
        classifications: [{ index: 0, classification: Classification.OIKUMENE, isOikumene: true }],
        densities: [{ neighborCount: 0, environmentPenalty: 0 }],
      },
      rng
    );

    expect(result).toHaveLength(1);
    expect(result[0]?.x).toBe(5);
    expect(result[0]?.y).toBe(10);
  });

  it('includes Barren trade code for uninhabited systems', () => {
    const coordinates: Coordinate[] = [{ x: 0, y: 0 }];
    const classifications: ClassificationResult[] = [
      { index: 0, classification: Classification.UNINHABITED, isOikumene: false },
    ];
    const densities: DensityData[] = [{ neighborCount: 0, environmentPenalty: 0 }];

    const rng = new Mulberry32(42);
    const result = buildSystems({ coordinates, classifications, densities }, rng);

    // Uninhabited systems with pop=0, gov=0, law=0 should have Barren trade code
    expect(result[0]?.tradeCodes).toContain('Ba');
  });

  it('scales to many systems with unique names and IDs', () => {
    const count = 500;
    const coordinates: Coordinate[] = Array.from({ length: count }, (_, i) => ({
      x: i % 100,
      y: Math.floor(i / 100),
    }));
    const classifications: ClassificationResult[] = coordinates.map((_, i) => ({
      index: i,
      classification: i < 50 ? Classification.OIKUMENE : Classification.UNINHABITED,
      isOikumene: i < 50,
    }));
    const densities: DensityData[] = coordinates.map(() => ({
      neighborCount: 0,
      environmentPenalty: 0,
    }));

    const rng = new Mulberry32(42);
    const result = buildSystems({ coordinates, classifications, densities }, rng);

    expect(result).toHaveLength(count);

    const ids = new Set(result.map((s) => s.id));
    expect(ids.size).toBe(count);

    const names = new Set(result.map((s) => s.name));
    expect(names.size).toBe(count);
  });

  it('processes systems in classification index order', () => {
    const coordinates: Coordinate[] = [
      { x: 100, y: 200 },
      { x: 300, y: 400 },
    ];
    // Classifications with indices matching coordinate positions
    const classifications: ClassificationResult[] = [
      { index: 0, classification: Classification.OIKUMENE, isOikumene: true },
      { index: 1, classification: Classification.HIDDEN_ENCLAVE, isOikumene: false },
    ];
    const densities: DensityData[] = [
      { neighborCount: 0, environmentPenalty: 0 },
      { neighborCount: 0, environmentPenalty: 0 },
    ];

    const rng = new Mulberry32(42);
    const result = buildSystems({ coordinates, classifications, densities }, rng);

    expect(result[0]?.x).toBe(100);
    expect(result[0]?.classification).toBe(Classification.OIKUMENE);
    expect(result[1]?.x).toBe(300);
    expect(result[1]?.classification).toBe(Classification.HIDDEN_ENCLAVE);
  });
});
