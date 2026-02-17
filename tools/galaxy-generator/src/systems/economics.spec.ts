import type { CivilizationData, TerRating } from '../../../../src/domain/galaxy/types';

import {
  deriveEconomics,
  deriveTechLevel,
  derivePerCapitaIncome,
  deriveGrossWorldProduct,
  deriveResourceMultiplier,
  deriveWorldTradeNumber,
  type EconomicsInput,
} from './economics';

/**
 * Creates a default EconomicsInput for testing.
 *
 * @param overrides - partial input to merge
 * @returns complete EconomicsInput
 */
function makeInput(overrides: Partial<EconomicsInput> = {}): EconomicsInput {
  const defaults: EconomicsInput = {
    attributes: { technology: 0, environment: 0, resources: 0 },
    civilization: {
      population: 5,
      starport: 3,
      government: 4,
      factions: 2,
      lawLevel: 3,
    },
  };

  return {
    attributes: { ...defaults.attributes, ...overrides.attributes },
    civilization: { ...defaults.civilization, ...overrides.civilization },
  };
}

/**
 * Creates input with specific attribute overrides.
 *
 * @param attrs - partial TerRating overrides
 * @param civ - partial CivilizationData overrides
 * @returns complete EconomicsInput
 */
function makeEconInput(
  attrs: Partial<TerRating> = {},
  civ: Partial<CivilizationData> = {}
): EconomicsInput {
  return makeInput({
    attributes: attrs as TerRating,
    civilization: civ as CivilizationData,
  });
}

describe('deriveTechLevel', () => {
  it('maps technology 0 to GURPS TL 8', () => {
    expect(deriveTechLevel(0)).toBe(8);
  });

  it('maps technology +3 to GURPS TL 11', () => {
    expect(deriveTechLevel(3)).toBe(11);
  });

  it('maps technology -4 to GURPS TL 4', () => {
    expect(deriveTechLevel(-4)).toBe(4);
  });

  it('maps technology +4 to GURPS TL 12', () => {
    expect(deriveTechLevel(4)).toBe(12);
  });

  it('maps technology +1 to GURPS TL 9', () => {
    expect(deriveTechLevel(1)).toBe(9);
  });

  it('maps technology -2 to GURPS TL 6', () => {
    expect(deriveTechLevel(-2)).toBe(6);
  });
});

describe('derivePerCapitaIncome', () => {
  it('returns 600 at TL 8 (base level)', () => {
    expect(derivePerCapitaIncome(8)).toBe(600);
  });

  it('returns 9375 at TL 11', () => {
    // 600 * 2.5^(11-8) = 600 * 15.625 = 9375
    expect(derivePerCapitaIncome(11)).toBe(9375);
  });

  it('returns 1500 at TL 9', () => {
    // 600 * 2.5^(9-8) = 600 * 2.5 = 1500
    expect(derivePerCapitaIncome(9)).toBe(1500);
  });

  it('returns 3750 at TL 10', () => {
    // 600 * 2.5^(10-8) = 600 * 6.25 = 3750
    expect(derivePerCapitaIncome(10)).toBe(3750);
  });

  it('returns 240 at TL 7', () => {
    // 600 * 2.5^(7-8) = 600 * 0.4 = 240
    expect(derivePerCapitaIncome(7)).toBe(240);
  });

  it('returns 96 at TL 6', () => {
    // 600 * 2.5^(6-8) = 600 * 0.16 = 96
    expect(derivePerCapitaIncome(6)).toBe(96);
  });

  it('returns a positive value for very low TL', () => {
    expect(derivePerCapitaIncome(4)).toBeGreaterThan(0);
  });

  it('rounds to nearest integer', () => {
    const result = derivePerCapitaIncome(4);
    expect(result).toBe(Math.round(result));
  });
});

describe('deriveGrossWorldProduct', () => {
  it('matches the spec example: PCI 9375 with population 8', () => {
    // GWP = PCI * 10^(pop-3) = 9375 * 10^5 = 937,500,000
    expect(deriveGrossWorldProduct(9375, 8)).toBe(937_500_000);
  });

  it('returns PCI * 10 for population 4', () => {
    // GWP = 1000 * 10^(4-3) = 1000 * 10 = 10,000
    expect(deriveGrossWorldProduct(1000, 4)).toBe(10_000);
  });

  it('returns PCI for population 3', () => {
    // GWP = 1000 * 10^(3-3) = 1000 * 1 = 1000
    expect(deriveGrossWorldProduct(1000, 3)).toBe(1000);
  });

  it('returns PCI / 10 for population 2', () => {
    // GWP = 1000 * 10^(2-3) = 1000 * 0.1 = 100
    expect(deriveGrossWorldProduct(1000, 2)).toBe(100);
  });

  it('returns 0 for population 0', () => {
    expect(deriveGrossWorldProduct(9375, 0)).toBe(0);
  });

  it('returns 0 for PCI 0', () => {
    expect(deriveGrossWorldProduct(0, 8)).toBe(0);
  });

  it('handles large populations', () => {
    // GWP = 600 * 10^(10-3) = 600 * 10^7 = 6,000,000,000
    expect(deriveGrossWorldProduct(600, 10)).toBe(6_000_000_000);
  });

  it('rounds to nearest integer', () => {
    const result = deriveGrossWorldProduct(240, 2);
    expect(result).toBe(Math.round(result));
  });
});

describe('deriveResourceMultiplier', () => {
  it('returns 1.0 for resources +1', () => {
    expect(deriveResourceMultiplier(1)).toBe(1.0);
  });

  it('returns 0.8 for resources 0', () => {
    expect(deriveResourceMultiplier(0)).toBeCloseTo(0.8);
  });

  it('returns 0.0 for resources -4', () => {
    expect(deriveResourceMultiplier(-4)).toBe(0.0);
  });

  it('returns 1.6 for resources +4', () => {
    expect(deriveResourceMultiplier(4)).toBeCloseTo(1.6);
  });

  it('returns 0.6 for resources -1', () => {
    expect(deriveResourceMultiplier(-1)).toBeCloseTo(0.6);
  });

  it('returns 1.2 for resources +2', () => {
    expect(deriveResourceMultiplier(2)).toBeCloseTo(1.2);
  });

  it('returns 0.4 for resources -2', () => {
    expect(deriveResourceMultiplier(-2)).toBeCloseTo(0.4);
  });

  it('returns 0.2 for resources -3', () => {
    expect(deriveResourceMultiplier(-3)).toBeCloseTo(0.2);
  });

  it('returns 1.4 for resources +3', () => {
    expect(deriveResourceMultiplier(3)).toBeCloseTo(1.4);
  });
});

describe('deriveWorldTradeNumber', () => {
  it('returns 6.0 for population 8, starport 5 (spec example)', () => {
    expect(deriveWorldTradeNumber(8, 5)).toBe(6.0);
  });

  it('returns 0.0 for population 0, starport 0', () => {
    expect(deriveWorldTradeNumber(0, 0)).toBe(0.0);
  });

  it('returns half the sum of population and starport, floored', () => {
    // floor((7 + 3) / 2) = floor(5.0) = 5
    expect(deriveWorldTradeNumber(7, 3)).toBe(5);
  });

  it('floors odd sums', () => {
    // floor((7 + 4) / 2) = floor(5.5) = 5
    expect(deriveWorldTradeNumber(7, 4)).toBe(5);
  });

  it('handles high values', () => {
    // (10 + 6) / 2 = 8.0
    expect(deriveWorldTradeNumber(10, 6)).toBe(8.0);
  });

  it('handles low values', () => {
    // floor((1 + 0) / 2) = floor(0.5) = 0
    expect(deriveWorldTradeNumber(1, 0)).toBe(0);
  });
});

describe('deriveEconomics', () => {
  it('matches the spec example output', () => {
    const input = makeEconInput(
      { technology: 3, environment: -1, resources: 1 },
      { population: 8, starport: 5, government: 4, factions: 2, lawLevel: 3 }
    );

    const result = deriveEconomics(input);

    expect(result.gurpsTechLevel).toBe(11);
    expect(result.perCapitaIncome).toBe(9375);
    expect(result.grossWorldProduct).toBe(937_500_000);
    expect(result.resourceMultiplier).toBe(1.0);
    expect(result.worldTradeNumber).toBe(6.0);
  });

  it('returns all zeros for uninhabited systems (population 0)', () => {
    const input = makeEconInput(
      { technology: 2, environment: 0, resources: 3 },
      { population: 0, starport: 0, government: 0, factions: 0, lawLevel: 0 }
    );

    const result = deriveEconomics(input);

    expect(result.gurpsTechLevel).toBe(0);
    expect(result.perCapitaIncome).toBe(0);
    expect(result.grossWorldProduct).toBe(0);
    expect(result.resourceMultiplier).toBe(0);
    expect(result.worldTradeNumber).toBe(0);
  });

  it('is deterministic with the same input', () => {
    const input = makeEconInput(
      { technology: 1, environment: 0, resources: 2 },
      { population: 6, starport: 4, government: 3, factions: 1, lawLevel: 2 }
    );

    const result1 = deriveEconomics(input);
    const result2 = deriveEconomics(input);

    expect(result1).toEqual(result2);
  });

  it('returns correct values for low-tech systems', () => {
    const input = makeEconInput(
      { technology: -4, environment: -2, resources: -3 },
      { population: 3, starport: 1, government: 2, factions: 1, lawLevel: 1 }
    );

    const result = deriveEconomics(input);

    expect(result.gurpsTechLevel).toBe(4);
    expect(result.perCapitaIncome).toBeGreaterThan(0);
    expect(result.grossWorldProduct).toBeGreaterThan(0);
    expect(result.resourceMultiplier).toBeCloseTo(0.2);
    // floor((3 + 1) / 2) = 2
    expect(result.worldTradeNumber).toBe(2);
  });

  it('returns correct values for high-tech, high-pop systems', () => {
    const input = makeEconInput(
      { technology: 4, environment: 2, resources: 4 },
      { population: 10, starport: 6, government: 5, factions: 3, lawLevel: 4 }
    );

    const result = deriveEconomics(input);

    expect(result.gurpsTechLevel).toBe(12);
    expect(result.resourceMultiplier).toBeCloseTo(1.6);
    expect(result.worldTradeNumber).toBe(8.0);
    expect(result.grossWorldProduct).toBeGreaterThan(0);
  });

  it('handles population 1 (minimal inhabited)', () => {
    const input = makeEconInput(
      { technology: 0, environment: 0, resources: 0 },
      { population: 1, starport: 0, government: 1, factions: 1, lawLevel: 0 }
    );

    const result = deriveEconomics(input);

    expect(result.gurpsTechLevel).toBe(8);
    expect(result.perCapitaIncome).toBe(600);
    // GWP = 600 * 10^(1-3) = 600 * 0.01 = 6
    expect(result.grossWorldProduct).toBe(6);
    expect(result.resourceMultiplier).toBeCloseTo(0.8);
    // floor((1 + 0) / 2) = 0
    expect(result.worldTradeNumber).toBe(0);
  });

  it('returns readonly EconomicsData interface', () => {
    const input = makeInput();
    const result = deriveEconomics(input);

    expect(typeof result.gurpsTechLevel).toBe('number');
    expect(typeof result.perCapitaIncome).toBe('number');
    expect(typeof result.grossWorldProduct).toBe('number');
    expect(typeof result.resourceMultiplier).toBe('number');
    expect(typeof result.worldTradeNumber).toBe('number');
  });
});
