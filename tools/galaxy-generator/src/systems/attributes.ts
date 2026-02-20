/**
 * System attribute generation for TER, planetary, and civilization data.
 *
 * Generates Technology, Environment, Resources (TER) attributes using 4dF rolls
 * with classification biases. Derives planetary data (Size, Atmosphere, Temperature,
 * Hydrography) and civilization data (Population, Starport, Government, Factions,
 * Law Level) following Star Cluster Guide formulas.
 *
 * @module systems/attributes
 */

import { roll4dF, rollNdS } from '../../../../src/domain/galaxy/dice';
import type { Prng } from '../../../../src/domain/galaxy/prng';
import type {
  CivilizationData,
  DensityData,
  PlanetaryData,
  TerRating,
} from '../../../../src/domain/galaxy/types';
import { Classification } from '../../../../src/domain/galaxy/types';

/** Input data required for attribute generation of a single system. */
export interface AttributeInput {
  /** Political/narrative classification of the system. */
  readonly classification: Classification;
  /** Local stellar density metrics. */
  readonly density: DensityData;
}

/** Complete attribute generation result for a single system. */
export interface AttributeResult {
  /** Technology, Environment, Resources scores. */
  readonly attributes: TerRating;
  /** Physical world characteristics. */
  readonly planetary: PlanetaryData;
  /** Population and governance data. */
  readonly civilization: CivilizationData;
}

/**
 * Clamps a numeric value to the inclusive range [min, max].
 *
 * @param value - value to clamp
 * @param min - minimum allowed value
 * @param max - maximum allowed value
 * @returns clamped value
 */
export function clampRange(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Applies classification-specific bias to the technology roll.
 *
 * @param rawTech - raw 4dF roll result
 * @param classification - system classification
 * @returns biased technology value
 */
function applyTechBias(rawTech: number, classification: Classification): number {
  switch (classification) {
    case Classification.OIKUMENE:
      return Math.max(rawTech, 1);
    case Classification.LOST_COLONY:
      return Math.min(rawTech, -2);
    case Classification.HIDDEN_ENCLAVE:
      return Math.max(rawTech, 2);
    case Classification.UNINHABITED:
      return rawTech;
  }
}

/**
 * Generates Technology, Environment, and Resources scores.
 *
 * Technology is rolled on 4dF with classification-specific bias clamping.
 * Environment is rolled on 4dF plus the density-derived environment penalty.
 * Resources is rolled on 4dF with no bias for any classification.
 *
 * @param input - system classification and density data
 * @param rng - seeded PRNG instance
 * @returns TER rating
 */
export function generateTer(input: AttributeInput, rng: Prng): TerRating {
  const rawTech = roll4dF(rng);
  const technology = applyTechBias(rawTech, input.classification);

  const rawEnv = roll4dF(rng);
  const environment = rawEnv + input.density.environmentPenalty;

  const resources = roll4dF(rng);

  return { technology, environment, resources };
}

/**
 * Generates planetary characteristics from TER scores.
 *
 * Size: 2d6-2 (range 0-10).
 * Atmosphere: 2d6 + (Size-7), clamped to minimum 0.
 * Temperature: 2d6 + atmosphere modifier, clamped to minimum 0.
 * The atmosphere modifier is derived from the environment score.
 * Hydrography: 2d6 + environment modifier, clamped to 0-10.
 *
 * @param ter - Technology, Environment, Resources scores
 * @param rng - seeded PRNG instance
 * @returns planetary data
 */
export function generatePlanetary(ter: TerRating, rng: Prng): PlanetaryData {
  const size = rollNdS(rng, 2, 6) - 2;

  const rawAtmosphere = rollNdS(rng, 2, 6) + (size - 7);
  const atmosphere = Math.max(0, rawAtmosphere);

  const atmosphereModifier = ter.environment;
  const rawTemperature = rollNdS(rng, 2, 6) + atmosphereModifier;
  const temperature = Math.max(0, rawTemperature);

  const rawHydrography = rollNdS(rng, 2, 6) + ter.environment;
  const hydrography = clampRange(rawHydrography, 0, 10);

  return { size, atmosphere, temperature, hydrography };
}

/**
 * Applies classification-specific bias to the population roll.
 *
 * @param rawPop - raw population roll result
 * @param classification - system classification
 * @returns biased population value
 */
function applyPopBias(rawPop: number, classification: Classification): number {
  switch (classification) {
    case Classification.OIKUMENE:
      return Math.max(rawPop, 6);
    case Classification.UNINHABITED:
      return 0;
    case Classification.HIDDEN_ENCLAVE:
      return Math.min(rawPop, 4);
    case Classification.LOST_COLONY:
      return rawPop;
  }
}

/**
 * Computes starport quality from population and technology.
 *
 * Higher population and technology produce better starports.
 * Uses a threshold check on the combined score.
 *
 * @param population - population level
 * @param technology - technology score
 * @param rng - seeded PRNG instance
 * @returns starport quality level (0-6)
 */
function computeStarport(population: number, technology: number, rng: Prng): number {
  const roll = rollNdS(rng, 2, 6);
  const raw = roll + population + technology - 7;
  return Math.max(0, Math.floor(raw / 3));
}

/**
 * Generates civilization data for a star system.
 *
 * Population: 2d6-2, biased by classification.
 * Starport: threshold check on population + technology.
 * Government: 2d6 + (population-7), clamped to minimum 0.
 * Factions: 1d3 + modifier, minimum 1 (or 0 for uninhabited).
 * Law Level: 2d6 + (government-7), clamped to minimum 0.
 *
 * For uninhabited systems (population 0), all civilization fields are 0.
 *
 * @param input - system classification and density data
 * @param ter - Technology, Environment, Resources scores
 * @param rng - seeded PRNG instance
 * @returns civilization data
 */
export function generateCivilization(
  input: AttributeInput,
  ter: TerRating,
  rng: Prng
): CivilizationData {
  const rawPop = rollNdS(rng, 2, 6) - 2;
  const population = Math.max(0, applyPopBias(rawPop, input.classification));

  if (population === 0) {
    return {
      population: 0,
      starport: 0,
      government: 0,
      factions: 0,
      lawLevel: 0,
    };
  }

  const starport = computeStarport(population, ter.technology, rng);

  const rawGovernment = rollNdS(rng, 2, 6) + (population - 7);
  const government = Math.max(0, rawGovernment);

  const factionModifier = population >= 8 ? 1 : 0;
  const rawFactions = rollNdS(rng, 1, 3) + factionModifier;
  const factions = Math.max(1, rawFactions);

  const rawLawLevel = rollNdS(rng, 2, 6) + (government - 7);
  const lawLevel = Math.max(0, rawLawLevel);

  return { population, starport, government, factions, lawLevel };
}

/**
 * Generates complete system attributes: TER, planetary, and civilization data.
 *
 * Follows the Star Cluster Guide generation sequence:
 * 1. Generate TER (Technology, Environment, Resources) with classification biases
 * 2. Generate planetary data (Size, Atmosphere, Temperature, Hydrography) from TER
 * 3. Generate civilization data (Population, Starport, Government, Factions, Law Level)
 *
 * @param input - system classification and density data
 * @param rng - seeded PRNG instance
 * @returns complete attribute result
 */
export function generateSystemAttributes(input: AttributeInput, rng: Prng): AttributeResult {
  const attributes = generateTer(input, rng);
  const planetary = generatePlanetary(attributes, rng);
  const civilization = generateCivilization(input, attributes, rng);

  return { attributes, planetary, civilization };
}
