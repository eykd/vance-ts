/**
 * System builder that assembles complete StarSystem objects.
 *
 * Orchestrates attribute generation, trade code derivation, economic
 * derivation, and name/UUID assignment to produce fully-populated
 * StarSystem records from coordinates, classifications, and density data.
 *
 * @module systems/system-builder
 */

import type { Prng } from '../../../../src/domain/galaxy/prng';
import type { Coordinate, DensityData, StarSystem } from '../../../../src/domain/galaxy/types';

import { generateSystemAttributes } from './attributes';
import type { ClassificationResult } from './classification';
import { deriveEconomics } from './economics';
import { generateSystemNames, generateUuid } from './naming';
import { deriveTradeCodes } from './trade-codes';

/** Input data required to build complete star systems. */
export interface SystemBuildInput {
  /** Star system positions. */
  readonly coordinates: readonly Coordinate[];
  /** Classification results (one per coordinate, same order). */
  readonly classifications: readonly ClassificationResult[];
  /** Density data (one per coordinate, same order). */
  readonly densities: readonly DensityData[];
}

/**
 * Builds complete StarSystem objects from pipeline stage outputs.
 *
 * For each coordinate, generates:
 * 1. A unique UUID and pronounceable name
 * 2. TER attributes, planetary data, and civilization data
 * 3. Trade codes derived from the generated attributes
 * 4. Economic values derived from TER and civilization
 *
 * @param input - coordinates, classifications, and density data
 * @param rng - seeded PRNG instance
 * @returns array of complete StarSystem objects
 */
export function buildSystems(input: SystemBuildInput, rng: Prng): StarSystem[] {
  const { coordinates, classifications, densities } = input;
  const count = coordinates.length;

  if (count === 0) {
    return [];
  }

  const naming = generateSystemNames(count, rng);
  const systems: StarSystem[] = [];

  for (let i = 0; i < count; i++) {
    const coord = coordinates[i] as Coordinate;
    const classResult = classifications[i] as ClassificationResult;
    const density = densities[i] as DensityData;
    const name = naming.names[i] as string;
    const id = generateUuid(rng);

    const { attributes, planetary, civilization } = generateSystemAttributes(
      { classification: classResult.classification, density },
      rng
    );

    const tradeCodes = deriveTradeCodes({ attributes, planetary, civilization });

    const economics = deriveEconomics({ attributes, civilization });

    systems.push({
      id,
      name,
      x: coord.x,
      y: coord.y,
      isOikumene: classResult.isOikumene,
      classification: classResult.classification,
      density,
      attributes,
      planetary,
      civilization,
      tradeCodes,
      economics,
    });
  }

  return systems;
}
