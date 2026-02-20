import { Mulberry32 } from '../../../../src/domain/galaxy/prng';
import { Classification } from '../../../../src/domain/galaxy/types';
import type { DensityData, TerRating } from '../../../../src/domain/galaxy/types';

import {
  generateSystemAttributes,
  generateTer,
  generatePlanetary,
  generateCivilization,
  clampRange,
  type AttributeInput,
} from './attributes';

/**
 * Creates a default AttributeInput for testing.
 *
 * @param overrides - partial input to merge
 * @returns complete AttributeInput
 */
function makeInput(overrides: Partial<AttributeInput> = {}): AttributeInput {
  return {
    classification: Classification.OIKUMENE,
    density: { neighborCount: 0, environmentPenalty: 0 },
    ...overrides,
  };
}

describe('clampRange', () => {
  it('clamps a value below the minimum to the minimum', () => {
    expect(clampRange(-5, 0, 10)).toBe(0);
  });

  it('clamps a value above the maximum to the maximum', () => {
    expect(clampRange(15, 0, 10)).toBe(10);
  });

  it('returns the value when within range', () => {
    expect(clampRange(5, 0, 10)).toBe(5);
  });

  it('returns the minimum when value equals minimum', () => {
    expect(clampRange(0, 0, 10)).toBe(0);
  });

  it('returns the maximum when value equals maximum', () => {
    expect(clampRange(10, 0, 10)).toBe(10);
  });

  it('handles negative ranges', () => {
    expect(clampRange(-3, -4, 4)).toBe(-3);
    expect(clampRange(-10, -4, 4)).toBe(-4);
    expect(clampRange(10, -4, 4)).toBe(4);
  });
});

describe('generateTer', () => {
  it('produces TER with technology, environment, and resources', () => {
    const rng = new Mulberry32(42);
    const input = makeInput();

    const result = generateTer(input, rng);

    expect(typeof result.technology).toBe('number');
    expect(typeof result.environment).toBe('number');
    expect(typeof result.resources).toBe('number');
  });

  it('is deterministic with the same seed', () => {
    const input = makeInput();

    const result1 = generateTer(input, new Mulberry32(42));
    const result2 = generateTer(input, new Mulberry32(42));

    expect(result1).toEqual(result2);
  });

  it('produces different results with different seeds', () => {
    const input = makeInput();

    const result1 = generateTer(input, new Mulberry32(42));
    const result2 = generateTer(input, new Mulberry32(9999));

    const same =
      result1.technology === result2.technology &&
      result1.environment === result2.environment &&
      result1.resources === result2.resources;
    expect(same).toBe(false);
  });

  it('applies density penalty to environment', () => {
    const rng1 = new Mulberry32(42);
    const noPenalty = generateTer(
      makeInput({ density: { neighborCount: 0, environmentPenalty: 0 } }),
      rng1
    );

    const rng2 = new Mulberry32(42);
    const withPenalty = generateTer(
      makeInput({ density: { neighborCount: 16, environmentPenalty: -4 } }),
      rng2
    );

    expect(withPenalty.environment).toBe(noPenalty.environment - 4);
  });

  describe('Oikumene classification bias', () => {
    it('clamps technology to minimum +1', () => {
      // Run many seeds to ensure tech never drops below +1
      for (let seed = 0; seed < 100; seed++) {
        const rng = new Mulberry32(seed);
        const result = generateTer(makeInput({ classification: Classification.OIKUMENE }), rng);
        expect(result.technology).toBeGreaterThanOrEqual(1);
      }
    });

    it('does not bias resources', () => {
      // Resources should follow normal 4dF range (may be negative)
      let hasNegative = false;
      for (let seed = 0; seed < 200; seed++) {
        const rng = new Mulberry32(seed);
        const result = generateTer(makeInput({ classification: Classification.OIKUMENE }), rng);
        if (result.resources < 0) {
          hasNegative = true;
          break;
        }
      }
      expect(hasNegative).toBe(true);
    });
  });

  describe('Uninhabited classification', () => {
    it('rolls technology normally without bias', () => {
      let hasNegative = false;
      for (let seed = 0; seed < 200; seed++) {
        const rng = new Mulberry32(seed);
        const result = generateTer(makeInput({ classification: Classification.UNINHABITED }), rng);
        if (result.technology < 0) {
          hasNegative = true;
          break;
        }
      }
      expect(hasNegative).toBe(true);
    });
  });

  describe('Lost Colony classification bias', () => {
    it('clamps technology to maximum -2', () => {
      for (let seed = 0; seed < 100; seed++) {
        const rng = new Mulberry32(seed);
        const result = generateTer(makeInput({ classification: Classification.LOST_COLONY }), rng);
        expect(result.technology).toBeLessThanOrEqual(-2);
      }
    });
  });

  describe('Hidden Enclave classification bias', () => {
    it('clamps technology to minimum +2', () => {
      for (let seed = 0; seed < 100; seed++) {
        const rng = new Mulberry32(seed);
        const result = generateTer(
          makeInput({ classification: Classification.HIDDEN_ENCLAVE }),
          rng
        );
        expect(result.technology).toBeGreaterThanOrEqual(2);
      }
    });
  });
});

describe('generatePlanetary', () => {
  it('produces size, atmosphere, temperature, and hydrography', () => {
    const rng = new Mulberry32(42);
    const ter: TerRating = { technology: 0, environment: 0, resources: 0 };

    const result = generatePlanetary(ter, rng);

    expect(typeof result.size).toBe('number');
    expect(typeof result.atmosphere).toBe('number');
    expect(typeof result.temperature).toBe('number');
    expect(typeof result.hydrography).toBe('number');
  });

  it('generates size in range 0-10', () => {
    for (let seed = 0; seed < 100; seed++) {
      const rng = new Mulberry32(seed);
      const ter: TerRating = { technology: 0, environment: 0, resources: 0 };
      const result = generatePlanetary(ter, rng);
      expect(result.size).toBeGreaterThanOrEqual(0);
      expect(result.size).toBeLessThanOrEqual(10);
    }
  });

  it('clamps atmosphere to minimum 0', () => {
    for (let seed = 0; seed < 100; seed++) {
      const rng = new Mulberry32(seed);
      const ter: TerRating = { technology: 0, environment: 0, resources: 0 };
      const result = generatePlanetary(ter, rng);
      expect(result.atmosphere).toBeGreaterThanOrEqual(0);
    }
  });

  it('clamps temperature to minimum 0', () => {
    for (let seed = 0; seed < 100; seed++) {
      const rng = new Mulberry32(seed);
      const ter: TerRating = { technology: 0, environment: 0, resources: 0 };
      const result = generatePlanetary(ter, rng);
      expect(result.temperature).toBeGreaterThanOrEqual(0);
    }
  });

  it('clamps hydrography to range 0-10', () => {
    for (let seed = 0; seed < 100; seed++) {
      const rng = new Mulberry32(seed);
      const ter: TerRating = { technology: 0, environment: 0, resources: 0 };
      const result = generatePlanetary(ter, rng);
      expect(result.hydrography).toBeGreaterThanOrEqual(0);
      expect(result.hydrography).toBeLessThanOrEqual(10);
    }
  });

  it('is deterministic with the same seed', () => {
    const ter: TerRating = { technology: 1, environment: -1, resources: 0 };

    const result1 = generatePlanetary(ter, new Mulberry32(42));
    const result2 = generatePlanetary(ter, new Mulberry32(42));

    expect(result1).toEqual(result2);
  });

  it('produces different results with different seeds', () => {
    const ter: TerRating = { technology: 1, environment: -1, resources: 0 };

    const result1 = generatePlanetary(ter, new Mulberry32(42));
    const result2 = generatePlanetary(ter, new Mulberry32(9999));

    const same =
      result1.size === result2.size &&
      result1.atmosphere === result2.atmosphere &&
      result1.temperature === result2.temperature &&
      result1.hydrography === result2.hydrography;
    expect(same).toBe(false);
  });

  it('negative environment makes hydrography tend lower', () => {
    // With very negative environment, hydrography should be lower on average
    let totalHostile = 0;
    let totalNormal = 0;
    const runs = 200;

    for (let seed = 0; seed < runs; seed++) {
      const hostileResult = generatePlanetary(
        { technology: 0, environment: -4, resources: 0 },
        new Mulberry32(seed)
      );
      totalHostile += hostileResult.hydrography;

      const normalResult = generatePlanetary(
        { technology: 0, environment: 2, resources: 0 },
        new Mulberry32(seed)
      );
      totalNormal += normalResult.hydrography;
    }

    // On average, hostile environment should produce lower hydrography
    expect(totalHostile / runs).toBeLessThan(totalNormal / runs);
  });
});

describe('generateCivilization', () => {
  it('produces population, starport, government, factions, and lawLevel', () => {
    const rng = new Mulberry32(42);
    const input = makeInput();
    const ter: TerRating = { technology: 1, environment: 0, resources: 0 };

    const result = generateCivilization(input, ter, rng);

    expect(typeof result.population).toBe('number');
    expect(typeof result.starport).toBe('number');
    expect(typeof result.government).toBe('number');
    expect(typeof result.factions).toBe('number');
    expect(typeof result.lawLevel).toBe('number');
  });

  it('is deterministic with the same seed', () => {
    const input = makeInput();
    const ter: TerRating = { technology: 1, environment: 0, resources: 0 };

    const result1 = generateCivilization(input, ter, new Mulberry32(42));
    const result2 = generateCivilization(input, ter, new Mulberry32(42));

    expect(result1).toEqual(result2);
  });

  it('clamps population to minimum 0', () => {
    for (let seed = 0; seed < 100; seed++) {
      const rng = new Mulberry32(seed);
      const input = makeInput({ classification: Classification.LOST_COLONY });
      const ter: TerRating = { technology: -3, environment: -4, resources: -2 };
      const result = generateCivilization(input, ter, rng);
      expect(result.population).toBeGreaterThanOrEqual(0);
    }
  });

  it('clamps government to minimum 0', () => {
    for (let seed = 0; seed < 100; seed++) {
      const rng = new Mulberry32(seed);
      const input = makeInput({ classification: Classification.LOST_COLONY });
      const ter: TerRating = { technology: -3, environment: 0, resources: 0 };
      const result = generateCivilization(input, ter, rng);
      expect(result.government).toBeGreaterThanOrEqual(0);
    }
  });

  it('clamps law level to minimum 0', () => {
    for (let seed = 0; seed < 100; seed++) {
      const rng = new Mulberry32(seed);
      const input = makeInput({ classification: Classification.LOST_COLONY });
      const ter: TerRating = { technology: -3, environment: 0, resources: 0 };
      const result = generateCivilization(input, ter, rng);
      expect(result.lawLevel).toBeGreaterThanOrEqual(0);
    }
  });

  it('produces factions >= 1', () => {
    for (let seed = 0; seed < 100; seed++) {
      const rng = new Mulberry32(seed);
      const input = makeInput();
      const ter: TerRating = { technology: 1, environment: 0, resources: 0 };
      const result = generateCivilization(input, ter, rng);
      expect(result.factions).toBeGreaterThanOrEqual(1);
    }
  });

  describe('Oikumene classification bias', () => {
    it('clamps population to minimum 6', () => {
      for (let seed = 0; seed < 100; seed++) {
        const rng = new Mulberry32(seed);
        const input = makeInput({ classification: Classification.OIKUMENE });
        const ter: TerRating = { technology: 2, environment: 0, resources: 0 };
        const result = generateCivilization(input, ter, rng);
        expect(result.population).toBeGreaterThanOrEqual(6);
      }
    });
  });

  describe('Uninhabited classification', () => {
    it('sets population to 0', () => {
      for (let seed = 0; seed < 50; seed++) {
        const rng = new Mulberry32(seed);
        const input = makeInput({ classification: Classification.UNINHABITED });
        const ter: TerRating = { technology: 0, environment: 0, resources: 0 };
        const result = generateCivilization(input, ter, rng);
        expect(result.population).toBe(0);
      }
    });

    it('sets starport to 0 when population is 0', () => {
      const rng = new Mulberry32(42);
      const input = makeInput({ classification: Classification.UNINHABITED });
      const ter: TerRating = { technology: 0, environment: 0, resources: 0 };
      const result = generateCivilization(input, ter, rng);
      expect(result.starport).toBe(0);
    });

    it('sets government to 0 when population is 0', () => {
      const rng = new Mulberry32(42);
      const input = makeInput({ classification: Classification.UNINHABITED });
      const ter: TerRating = { technology: 0, environment: 0, resources: 0 };
      const result = generateCivilization(input, ter, rng);
      expect(result.government).toBe(0);
    });

    it('sets factions to 0 when population is 0', () => {
      const rng = new Mulberry32(42);
      const input = makeInput({ classification: Classification.UNINHABITED });
      const ter: TerRating = { technology: 0, environment: 0, resources: 0 };
      const result = generateCivilization(input, ter, rng);
      expect(result.factions).toBe(0);
    });

    it('sets lawLevel to 0 when population is 0', () => {
      const rng = new Mulberry32(42);
      const input = makeInput({ classification: Classification.UNINHABITED });
      const ter: TerRating = { technology: 0, environment: 0, resources: 0 };
      const result = generateCivilization(input, ter, rng);
      expect(result.lawLevel).toBe(0);
    });
  });

  describe('Hidden Enclave classification bias', () => {
    it('clamps population to maximum 4', () => {
      for (let seed = 0; seed < 100; seed++) {
        const rng = new Mulberry32(seed);
        const input = makeInput({ classification: Classification.HIDDEN_ENCLAVE });
        const ter: TerRating = { technology: 3, environment: 0, resources: 0 };
        const result = generateCivilization(input, ter, rng);
        expect(result.population).toBeLessThanOrEqual(4);
      }
    });
  });

  describe('Lost Colony classification', () => {
    it('allows full population range', () => {
      let hasHigh = false;
      let hasLow = false;
      for (let seed = 0; seed < 200; seed++) {
        const rng = new Mulberry32(seed);
        const input = makeInput({ classification: Classification.LOST_COLONY });
        const ter: TerRating = { technology: -3, environment: 0, resources: 0 };
        const result = generateCivilization(input, ter, rng);
        if (result.population >= 6) {
          hasHigh = true;
        }
        if (result.population <= 3) {
          hasLow = true;
        }
      }
      expect(hasHigh).toBe(true);
      expect(hasLow).toBe(true);
    });
  });

  describe('starport computation', () => {
    it('produces higher starport for higher population + technology', () => {
      let totalHigh = 0;
      let totalLow = 0;
      const runs = 200;

      for (let seed = 0; seed < runs; seed++) {
        const highResult = generateCivilization(
          makeInput({ classification: Classification.OIKUMENE }),
          { technology: 4, environment: 0, resources: 0 },
          new Mulberry32(seed)
        );
        totalHigh += highResult.starport;

        const lowResult = generateCivilization(
          makeInput({ classification: Classification.LOST_COLONY }),
          { technology: -4, environment: 0, resources: 0 },
          new Mulberry32(seed)
        );
        totalLow += lowResult.starport;
      }

      expect(totalHigh / runs).toBeGreaterThan(totalLow / runs);
    });
  });
});

describe('generateSystemAttributes', () => {
  it('produces complete attribute result with TER, planetary, and civilization', () => {
    const rng = new Mulberry32(42);
    const input = makeInput();

    const result = generateSystemAttributes(input, rng);

    expect(result.attributes).toBeDefined();
    expect(result.planetary).toBeDefined();
    expect(result.civilization).toBeDefined();
  });

  it('is deterministic with the same seed', () => {
    const input = makeInput();

    const result1 = generateSystemAttributes(input, new Mulberry32(42));
    const result2 = generateSystemAttributes(input, new Mulberry32(42));

    expect(result1).toEqual(result2);
  });

  it('produces different results with different seeds', () => {
    const input = makeInput();

    const result1 = generateSystemAttributes(input, new Mulberry32(42));
    const result2 = generateSystemAttributes(input, new Mulberry32(9999));

    // Deep equality should differ
    expect(result1).not.toEqual(result2);
  });

  it('enforces Oikumene constraints: tech >= +1, pop >= 6', () => {
    for (let seed = 0; seed < 100; seed++) {
      const rng = new Mulberry32(seed);
      const input = makeInput({ classification: Classification.OIKUMENE });
      const result = generateSystemAttributes(input, rng);
      expect(result.attributes.technology).toBeGreaterThanOrEqual(1);
      expect(result.civilization.population).toBeGreaterThanOrEqual(6);
    }
  });

  it('enforces Uninhabited constraints: pop = 0', () => {
    for (let seed = 0; seed < 50; seed++) {
      const rng = new Mulberry32(seed);
      const input = makeInput({ classification: Classification.UNINHABITED });
      const result = generateSystemAttributes(input, rng);
      expect(result.civilization.population).toBe(0);
    }
  });

  it('enforces Lost Colony constraints: tech <= -2', () => {
    for (let seed = 0; seed < 100; seed++) {
      const rng = new Mulberry32(seed);
      const input = makeInput({ classification: Classification.LOST_COLONY });
      const result = generateSystemAttributes(input, rng);
      expect(result.attributes.technology).toBeLessThanOrEqual(-2);
    }
  });

  it('enforces Hidden Enclave constraints: tech >= +2, pop <= 4', () => {
    for (let seed = 0; seed < 100; seed++) {
      const rng = new Mulberry32(seed);
      const input = makeInput({ classification: Classification.HIDDEN_ENCLAVE });
      const result = generateSystemAttributes(input, rng);
      expect(result.attributes.technology).toBeGreaterThanOrEqual(2);
      expect(result.civilization.population).toBeLessThanOrEqual(4);
    }
  });

  it('applies density penalty to environment', () => {
    const densePenalty: DensityData = { neighborCount: 16, environmentPenalty: -4 };
    const noPenalty: DensityData = { neighborCount: 0, environmentPenalty: 0 };

    const denseResult = generateSystemAttributes(
      makeInput({ density: densePenalty }),
      new Mulberry32(42)
    );
    const sparseResult = generateSystemAttributes(
      makeInput({ density: noPenalty }),
      new Mulberry32(42)
    );

    expect(denseResult.attributes.environment).toBe(sparseResult.attributes.environment - 4);
  });

  it('produces valid attribute ranges for all fields', () => {
    for (let seed = 0; seed < 100; seed++) {
      const rng = new Mulberry32(seed);
      const input = makeInput({
        classification: Classification.OIKUMENE,
        density: { neighborCount: 5, environmentPenalty: -1 },
      });
      const result = generateSystemAttributes(input, rng);

      // Planetary ranges
      expect(result.planetary.size).toBeGreaterThanOrEqual(0);
      expect(result.planetary.size).toBeLessThanOrEqual(10);
      expect(result.planetary.atmosphere).toBeGreaterThanOrEqual(0);
      expect(result.planetary.temperature).toBeGreaterThanOrEqual(0);
      expect(result.planetary.hydrography).toBeGreaterThanOrEqual(0);
      expect(result.planetary.hydrography).toBeLessThanOrEqual(10);

      // Civilization ranges
      expect(result.civilization.population).toBeGreaterThanOrEqual(0);
      expect(result.civilization.starport).toBeGreaterThanOrEqual(0);
      expect(result.civilization.government).toBeGreaterThanOrEqual(0);
      expect(result.civilization.factions).toBeGreaterThanOrEqual(0);
      expect(result.civilization.lawLevel).toBeGreaterThanOrEqual(0);
    }
  });

  it('returns readonly-compatible interfaces', () => {
    const rng = new Mulberry32(42);
    const result = generateSystemAttributes(makeInput(), rng);

    // Verify the shape matches expected interfaces
    const { attributes, planetary, civilization } = result;

    expect(Object.keys(attributes).sort()).toEqual(['environment', 'resources', 'technology']);
    expect(Object.keys(planetary).sort()).toEqual([
      'atmosphere',
      'hydrography',
      'size',
      'temperature',
    ]);
    expect(Object.keys(civilization).sort()).toEqual([
      'factions',
      'government',
      'lawLevel',
      'population',
      'starport',
    ]);
  });
});
