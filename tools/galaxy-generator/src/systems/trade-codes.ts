/**
 * Trade code derivation from system attribute combinations.
 *
 * Derives trade classification codes from TER, planetary, and civilization
 * attributes following Star Cluster Guide formulas. Each trade code has
 * specific attribute requirements. Returns a sorted array of applicable codes.
 *
 * @module systems/trade-codes
 */

import type {
  CivilizationData,
  PlanetaryData,
  TerRating,
} from '../../../../src/domain/galaxy/types';

/** Input data required for trade code derivation. */
export interface TradeCodeInput {
  /** Technology, Environment, Resources scores. */
  readonly attributes: TerRating;
  /** Physical world characteristics. */
  readonly planetary: PlanetaryData;
  /** Population and governance data. */
  readonly civilization: CivilizationData;
}

/** Set of atmosphere values that qualify for Industrial classification. */
const INDUSTRIAL_ATMOSPHERES = new Set([0, 1, 2, 4, 7, 9]);

/**
 * Checks whether a value falls within an inclusive range.
 *
 * @param value - value to check
 * @param min - minimum of range (inclusive)
 * @param max - maximum of range (inclusive)
 * @returns true if value is within [min, max]
 */
function inRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * Derives trade codes from system attribute combinations.
 *
 * Each trade code has documented attribute requirements based on the
 * Star Cluster Guide formulas. The function evaluates all trade code
 * criteria against the provided attributes and returns a sorted array
 * of applicable codes.
 *
 * @param input - system attributes (TER, planetary, civilization)
 * @returns sorted array of applicable trade code strings
 */
export function deriveTradeCodes(input: TradeCodeInput): readonly string[] {
  const { attributes, planetary, civilization } = input;
  const codes: string[] = [];

  // Agricultural: atmosphere 4-9, hydrography 4-8, population 5-7
  if (
    inRange(planetary.atmosphere, 4, 9) &&
    inRange(planetary.hydrography, 4, 8) &&
    inRange(civilization.population, 5, 7)
  ) {
    codes.push('Ag');
  }

  // Asteroid: size 0, atmosphere 0, hydrography 0
  if (planetary.size === 0 && planetary.atmosphere === 0 && planetary.hydrography === 0) {
    codes.push('As');
  }

  // Barren: population 0, government 0, lawLevel 0
  if (
    civilization.population === 0 &&
    civilization.government === 0 &&
    civilization.lawLevel === 0
  ) {
    codes.push('Ba');
  }

  // Desert: atmosphere >= 2, hydrography 0
  if (planetary.atmosphere >= 2 && planetary.hydrography === 0) {
    codes.push('De');
  }

  // Fluid: atmosphere >= 10, hydrography >= 1
  if (planetary.atmosphere >= 10 && planetary.hydrography >= 1) {
    codes.push('Fl');
  }

  // Garden: size 6-8, atmosphere 5-8, hydrography 5-7
  if (
    inRange(planetary.size, 6, 8) &&
    inRange(planetary.atmosphere, 5, 8) &&
    inRange(planetary.hydrography, 5, 7)
  ) {
    codes.push('Ga');
  }

  // High Population: population >= 9
  if (civilization.population >= 9) {
    codes.push('Hi');
  }

  // High Tech: technology >= 3
  if (attributes.technology >= 3) {
    codes.push('Ht');
  }

  // Ice-Capped: atmosphere 0-1, hydrography >= 1
  if (inRange(planetary.atmosphere, 0, 1) && planetary.hydrography >= 1) {
    codes.push('Ic');
  }

  // Industrial: atmosphere in {0,1,2,4,7,9+}, population >= 9
  if (
    (INDUSTRIAL_ATMOSPHERES.has(planetary.atmosphere) || planetary.atmosphere >= 9) &&
    civilization.population >= 9
  ) {
    codes.push('In');
  }

  // Low Population: population 1-3
  if (inRange(civilization.population, 1, 3)) {
    codes.push('Lo');
  }

  // Low Tech: technology <= -3
  if (attributes.technology <= -3) {
    codes.push('Lt');
  }

  // Non-Agricultural: atmosphere 0-3, hydrography 0-3, population >= 6
  if (
    inRange(planetary.atmosphere, 0, 3) &&
    inRange(planetary.hydrography, 0, 3) &&
    civilization.population >= 6
  ) {
    codes.push('Na');
  }

  // Non-Industrial: population 4-6
  if (inRange(civilization.population, 4, 6)) {
    codes.push('Ni');
  }

  // Poor: atmosphere 2-5, hydrography 0-3
  if (inRange(planetary.atmosphere, 2, 5) && inRange(planetary.hydrography, 0, 3)) {
    codes.push('Po');
  }

  // Rich: atmosphere 6-8, population 6-8
  if (inRange(planetary.atmosphere, 6, 8) && inRange(civilization.population, 6, 8)) {
    codes.push('Ri');
  }

  // Vacuum: atmosphere 0
  if (planetary.atmosphere === 0) {
    codes.push('Va');
  }

  // Water World: hydrography >= 10
  if (planetary.hydrography >= 10) {
    codes.push('Wa');
  }

  return codes.sort();
}
