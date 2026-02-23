/**
 * Oikumene selection and Beyond classification.
 *
 * Selects approximately 250 Oikumene systems from outside the galactic core,
 * clustered along a single spiral arm, within connected open corridors of the
 * cost map. Classifies remaining systems as Uninhabited, Lost Colony, or Hidden
 * Enclave; systems near the Oikumene arm have higher proportions of Lost Colonies
 * and Hidden Enclaves than systems in distant regions.
 *
 * @module systems/classification
 */

import type { Prng } from '../../../../src/domain/galaxy/prng';
import type { Coordinate, OikumeneConfig } from '../../../../src/domain/galaxy/types';
import { Classification } from '../../../../src/domain/galaxy/types';
import type { CostMap } from '../costmap/cost-composer';
import type { GalaxyGeneratorConfig } from '../galaxy/galaxy-generator';

/** Combined configuration for the classification stage. */
export interface ClassificationConfig {
  /** Oikumene selection parameters. */
  readonly oikumene: OikumeneConfig;
  /** Galaxy geometry for spiral arm detection. */
  readonly galaxy: GalaxyGeneratorConfig;
  /** Cost map for open corridor verification. */
  readonly costMap: CostMap;
}

/** Classification result for a single star system. */
export interface ClassificationResult {
  /** Index in the original coordinates array. */
  readonly index: number;
  /** Assigned classification. */
  readonly classification: Classification;
  /** True if and only if classification is OIKUMENE. */
  readonly isOikumene: boolean;
}

/**
 * Threshold fraction of cost range below which a cell is considered open.
 *
 * Open corridors have costs 1-3 and walls 10-30. With a range of 29 (30-1),
 * a threshold of 0.25 means costs below 1 + 0.25*29 = 8.25 are open.
 */
const OPEN_CORRIDOR_THRESHOLD_FRACTION = 0.25;

/**
 * Computes Euclidean distance from a point to a center.
 *
 * @param x - point X coordinate
 * @param y - point Y coordinate
 * @param cx - center X coordinate
 * @param cy - center Y coordinate
 * @returns Euclidean distance
 */
export function distanceFromCenter(x: number, y: number, cx: number, cy: number): number {
  const dx = x - cx;
  const dy = y - cy;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Checks whether a world coordinate falls within an open corridor of the cost map.
 *
 * Converts world coordinates to grid indices using the cost map's origin, then
 * decodes the quantized byte value back to an actual cost. A cell is considered
 * open if its cost is below a threshold derived from the cost range.
 *
 * @param x - world X coordinate
 * @param y - world Y coordinate
 * @param costMap - the generated cost map
 * @returns true if the cell is an open corridor
 */
export function isInOpenCorridor(x: number, y: number, costMap: CostMap): boolean {
  const { quantization, data, width, height } = costMap;
  const gx = x - quantization.gridOriginX;
  const gy = y - quantization.gridOriginY;

  if (gx < 0 || gx >= width || gy < 0 || gy >= height) {
    return false;
  }

  const idx = gy * width + gx;
  const byteValue = data[idx] as number;
  const costRange = quantization.maxCost - quantization.minCost;
  const actualCost = quantization.minCost + (byteValue / 255) * costRange;
  const threshold = quantization.minCost + OPEN_CORRIDOR_THRESHOLD_FRACTION * costRange;

  return actualCost < threshold;
}

/**
 * Computes a spiral arm proximity score for a point relative to one specific arm.
 *
 * Measures how closely the point's polar angle matches the expected angle of
 * the named arm at that radius. Returns 1 when the point lies exactly on the
 * arm and 0 when it is PI/arms or more away.
 *
 * @param x - point X coordinate
 * @param y - point Y coordinate
 * @param cx - galaxy center X
 * @param cy - galaxy center Y
 * @param armIndex - zero-based index of the arm to score against
 * @param arms - total number of spiral arms
 * @param deg - spiral extent in degrees
 * @returns Score in [0, 1] where 1 is directly on the specified arm
 */
export function computeSpecificArmScore(
  x: number,
  y: number,
  cx: number,
  cy: number,
  armIndex: number,
  arms: number,
  deg: number
): number {
  const dx = x - cx;
  const dy = y - cy;
  const radius = Math.sqrt(dx * dx + dy * dy);

  if (radius === 0) {
    return 0;
  }

  const pointAngle = Math.atan2(dy, dx);
  const spiralWinding = (deg * radius) / 1000;
  const armBaseAngle = (armIndex / arms) * 2 * Math.PI;
  const armAngle = armBaseAngle + spiralWinding;
  let diff = pointAngle - armAngle;
  // Normalize to [-PI, PI]
  diff = diff - Math.round(diff / (2 * Math.PI)) * 2 * Math.PI;
  const maxDist = Math.PI / arms;
  return Math.max(0, 1 - Math.abs(diff) / maxDist);
}

/**
 * Computes a spiral arm proximity score for a point.
 *
 * Uses the angular difference between the point's polar angle and the nearest
 * spiral arm's expected angle at that radius. The spiral arm equation is:
 * armAngle = baseArmAngle + radius * deg / maxRadius, where deg controls
 * how tightly the arms wind.
 *
 * @param x - point X coordinate
 * @param y - point Y coordinate
 * @param cx - galaxy center X
 * @param cy - galaxy center Y
 * @param arms - number of spiral arms
 * @param deg - spiral extent in degrees
 * @returns Score in [0, 1] where 1 is directly on an arm
 */
export function computeSpiralArmScore(
  x: number,
  y: number,
  cx: number,
  cy: number,
  arms: number,
  deg: number
): number {
  const dx = x - cx;
  const dy = y - cy;
  const radius = Math.sqrt(dx * dx + dy * dy);

  if (radius === 0) {
    return 0;
  }

  let maxScore = 0;

  for (let arm = 0; arm < arms; arm++) {
    const score = computeSpecificArmScore(x, y, cx, cy, arm, arms, deg);
    if (score > maxScore) {
      maxScore = score;
    }
  }

  return maxScore;
}

/** Candidate system with its Oikumene suitability score. */
interface ScoredCandidate {
  /** Index in the original coordinates array. */
  readonly index: number;
  /** Combined score (higher = better Oikumene candidate). */
  readonly score: number;
}

/**
 * Classifies all star systems as Oikumene or Beyond subtypes.
 *
 * Algorithm:
 * 1. Select a home arm via RNG for Oikumene concentration
 * 2. Filter candidates: outside core exclusion zone, in open corridor
 * 3. Score candidates by proximity to the home arm only
 * 4. Select top-scoring candidates up to targetCount as Oikumene
 * 5. Classify remaining systems: core zone → always Uninhabited; near Oikumene →
 * boosted Lost Colony / Hidden Enclave; far → ~85% uninhabited, ~7% lost, ~8% enclave
 *
 * @param coordinates - array of star system positions
 * @param config - classification configuration
 * @param rng - seeded PRNG instance
 * @returns array of classification results, one per input coordinate
 */
export function classifySystems(
  coordinates: readonly Coordinate[],
  config: ClassificationConfig,
  rng: Prng
): ClassificationResult[] {
  if (coordinates.length === 0) {
    return [];
  }

  const { oikumene, galaxy, costMap } = config;
  const [cx, cy] = galaxy.center;

  // Consume one RNG call to pick the home arm for Oikumene concentration
  const homeArm = Math.floor(rng.random() * galaxy.arms);

  // Step 1: Identify Oikumene candidates
  const candidates: ScoredCandidate[] = [];

  for (let i = 0; i < coordinates.length; i++) {
    const coord = coordinates[i] as Coordinate;
    const dist = distanceFromCenter(coord.x, coord.y, cx, cy);

    // Must be outside core exclusion zone
    if (dist < oikumene.coreExclusionRadius) {
      continue;
    }

    // Must be in an open corridor
    if (!isInOpenCorridor(coord.x, coord.y, costMap)) {
      continue;
    }

    // Score by home arm proximity only (concentrates Oikumene on one arm)
    const armScore = computeSpecificArmScore(
      coord.x,
      coord.y,
      cx,
      cy,
      homeArm,
      galaxy.arms,
      galaxy.deg
    );

    candidates.push({ index: i, score: armScore });
  }

  // Step 2: Sort candidates by score (descending) and select top targetCount
  candidates.sort((a, b) => b.score - a.score);

  const oikumeneCount = Math.min(candidates.length, oikumene.targetCount);
  const oikumeneSet = new Set<number>();

  for (let i = 0; i < oikumeneCount; i++) {
    oikumeneSet.add((candidates[i] as ScoredCandidate).index);
  }

  // Collect Oikumene coordinates for distance-biased Beyond classification
  const oikumeneCoords: Coordinate[] = [];
  for (let i = 0; i < oikumeneCount; i++) {
    oikumeneCoords.push(coordinates[(candidates[i] as ScoredCandidate).index] as Coordinate);
  }

  // Step 3: Build results for all systems
  const results: ClassificationResult[] = [];

  for (let i = 0; i < coordinates.length; i++) {
    const coord = coordinates[i] as Coordinate;

    if (oikumeneSet.has(i)) {
      results.push({
        index: i,
        classification: Classification.OIKUMENE,
        isOikumene: true,
      });
      continue;
    }

    const dist = distanceFromCenter(coord.x, coord.y, cx, cy);

    // Systems inside the core exclusion zone are always Uninhabited
    if (dist < oikumene.coreExclusionRadius) {
      results.push({
        index: i,
        classification: Classification.UNINHABITED,
        isOikumene: false,
      });
      continue;
    }

    // Distance to nearest Oikumene for proximity-biased Beyond classification
    let distToNearestOikumene = Infinity;
    for (const oCoord of oikumeneCoords) {
      const d = distanceFromCenter(coord.x, coord.y, oCoord.x, oCoord.y);
      if (d < distToNearestOikumene) {
        distToNearestOikumene = d;
      }
    }

    const classification = classifyBeyondSystem(rng, distToNearestOikumene, oikumene.radiateRadius);
    results.push({
      index: i,
      classification,
      isOikumene: false,
    });
  }

  return results;
}

/**
 * Rolls a Beyond system classification using the PRNG with distance-biased probabilities.
 *
 * Far from Oikumene (nearFraction ≈ 0): ~85% uninhabited, ~7% lost colony, ~8% hidden enclave.
 * Near Oikumene (nearFraction ≈ 1): ~50% uninhabited, ~30% lost colony, ~20% hidden enclave.
 *
 * @param rng - seeded PRNG instance
 * @param distToOikumene - distance to the nearest Oikumene system
 * @param radiateRadius - decay radius; systems within this distance get maximum boost
 * @returns Beyond classification type
 */
function classifyBeyondSystem(
  rng: Prng,
  distToOikumene: number,
  radiateRadius: number
): Classification {
  const rawFraction = 1 - distToOikumene / radiateRadius;
  const nearFraction = rawFraction > 1 ? 1 : rawFraction < 0 ? 0 : rawFraction;

  // Linear interpolation: lerp(far, near, nearFraction)
  const uninhabitedProb = 0.85 + nearFraction * (0.5 - 0.85);
  const lostColonyAddition = 0.07 + nearFraction * (0.3 - 0.07);
  const lostColonyBound = uninhabitedProb + lostColonyAddition;

  const roll = rng.random();

  if (roll < uninhabitedProb) {
    return Classification.UNINHABITED;
  }

  if (roll < lostColonyBound) {
    return Classification.LOST_COLONY;
  }

  return Classification.HIDDEN_ENCLAVE;
}
