/**
 * Economic value derivation from system attributes.
 *
 * Calculates GURPS Tech Level, Per-Capita Income, Gross World Product,
 * Resource Multiplier, and World Trade Number from TER and civilization
 * attributes following Star Cluster Guide formulas.
 *
 * @module systems/economics
 */

import type {
  CivilizationData,
  EconomicsData,
  TerRating,
} from '../../../../src/domain/galaxy/types';

/** Input data required for economic derivation. */
export interface EconomicsInput {
  /** Technology, Environment, Resources scores. */
  readonly attributes: TerRating;
  /** Population and governance data. */
  readonly civilization: CivilizationData;
}

/** Base GURPS Tech Level corresponding to TER technology score 0. */
const BASE_GURPS_TL = 8;

/** Base per-capita income at GURPS TL 8 (in credits). */
const BASE_PCI = 600;

/** Per-capita income growth factor per tech level above TL 8. */
const PCI_GROWTH_FACTOR = 2.5;

/** Population exponent offset for GWP calculation. */
const GWP_POP_OFFSET = 3;

/** Denominator for linear resource multiplier mapping. */
const RESOURCE_DIVISOR = 5;

/** Offset added to resources for linear multiplier mapping. */
const RESOURCE_OFFSET = 4;

/** Divisor for World Trade Number calculation. */
const WTN_DIVISOR = 2;

/**
 * Derives GURPS Tech Level from the TER technology score.
 *
 * Maps TER technology (4dF range, typically -4 to +4) to GURPS TL
 * by adding a base of 8. Technology 0 yields TL 8 (modern day).
 *
 * @param technology - TER technology score
 * @returns GURPS Tech Level
 */
export function deriveTechLevel(technology: number): number {
  return BASE_GURPS_TL + technology;
}

/**
 * Derives per-capita income from GURPS Tech Level.
 *
 * Uses exponential growth: PCI = 600 * 2.5^(TL - 8).
 * Higher tech levels produce exponentially wealthier populations.
 *
 * @param techLevel - GURPS Tech Level
 * @returns per-capita income in credits, rounded to nearest integer
 */
export function derivePerCapitaIncome(techLevel: number): number {
  return Math.round(BASE_PCI * Math.pow(PCI_GROWTH_FACTOR, techLevel - BASE_GURPS_TL));
}

/**
 * Derives Gross World Product from per-capita income and population.
 *
 * GWP = PCI * 10^(population - 3). Returns 0 when population or PCI is 0.
 *
 * @param perCapitaIncome - per-capita income in credits
 * @param population - population digit (0-10)
 * @returns gross world product, rounded to nearest integer
 */
export function deriveGrossWorldProduct(perCapitaIncome: number, population: number): number {
  if (population === 0 || perCapitaIncome === 0) {
    return 0;
  }
  return Math.round(perCapitaIncome * Math.pow(10, population - GWP_POP_OFFSET));
}

/**
 * Derives resource multiplier from the TER resources score.
 *
 * Linear mapping: RM = (resources + 4) / 5.
 * Resources -4 yields 0.0, resources 0 yields 0.8, resources +1 yields 1.0.
 *
 * @param resources - TER resources score
 * @returns resource multiplier (0.0 to 1.6 for standard range)
 */
export function deriveResourceMultiplier(resources: number): number {
  return (resources + RESOURCE_OFFSET) / RESOURCE_DIVISOR;
}

/**
 * Derives World Trade Number from population and starport quality.
 *
 * WTN = floor((population + starport) / 2).
 * Represents the system's trade capacity on a logarithmic scale.
 *
 * @param population - population digit (0-10)
 * @param starport - starport quality level (0-6)
 * @returns world trade number
 */
export function deriveWorldTradeNumber(population: number, starport: number): number {
  return Math.floor((population + starport) / WTN_DIVISOR);
}

/**
 * Derives all economic values from system attributes.
 *
 * For uninhabited systems (population 0), returns all zeros.
 * For inhabited systems, calculates Tech Level, Per-Capita Income,
 * Gross World Product, Resource Multiplier, and World Trade Number.
 *
 * @param input - system attributes and civilization data
 * @returns complete economic data
 */
export function deriveEconomics(input: EconomicsInput): EconomicsData {
  const { attributes, civilization } = input;

  if (civilization.population === 0) {
    return {
      gurpsTechLevel: 0,
      perCapitaIncome: 0,
      grossWorldProduct: 0,
      resourceMultiplier: 0,
      worldTradeNumber: 0,
    };
  }

  const gurpsTechLevel = deriveTechLevel(attributes.technology);
  const perCapitaIncome = derivePerCapitaIncome(gurpsTechLevel);
  const grossWorldProduct = deriveGrossWorldProduct(perCapitaIncome, civilization.population);
  const resourceMultiplier = deriveResourceMultiplier(attributes.resources);
  const worldTradeNumber = deriveWorldTradeNumber(civilization.population, civilization.starport);

  return {
    gurpsTechLevel,
    perCapitaIncome,
    grossWorldProduct,
    resourceMultiplier,
    worldTradeNumber,
  };
}
