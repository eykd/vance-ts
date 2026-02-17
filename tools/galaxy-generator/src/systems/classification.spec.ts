import { Mulberry32 } from '../../../../src/domain/galaxy/prng';
import { Classification } from '../../../../src/domain/galaxy/types';
import type { Coordinate, OikumeneConfig } from '../../../../src/domain/galaxy/types';
import type { CostMap } from '../costmap/cost-composer';
import type { GalaxyGeneratorConfig } from '../galaxy/galaxy-generator';

import {
  classifySystems,
  isInOpenCorridor,
  distanceFromCenter,
  computeSpiralArmScore,
  type ClassificationConfig,
  type ClassificationResult,
} from './classification';

/**
 * Creates a minimal GalaxyGeneratorConfig for testing.
 *
 * @param overrides - partial config to merge
 * @returns complete GalaxyGeneratorConfig
 */
function makeGalaxyConfig(overrides: Partial<GalaxyGeneratorConfig> = {}): GalaxyGeneratorConfig {
  return {
    center: [0, 0],
    size: [4000, 4000],
    turn: 0,
    deg: 5,
    dynSizeFactor: 1,
    spcFactor: 8,
    arms: 4,
    multiplier: 1,
    limit: null,
    rng: new Mulberry32(42),
    ...overrides,
  };
}

/**
 * Creates a minimal OikumeneConfig for testing.
 *
 * @param overrides - partial config to merge
 * @returns complete OikumeneConfig
 */
function makeOikumeneConfig(overrides: Partial<OikumeneConfig> = {}): OikumeneConfig {
  return {
    coreExclusionRadius: 50,
    clusterRadius: 30,
    targetCount: 250,
    ...overrides,
  };
}

/**
 * Creates a minimal ClassificationConfig for testing.
 *
 * @param overrides - partial config to merge
 * @returns complete ClassificationConfig
 */
function makeClassificationConfig(
  overrides: Partial<ClassificationConfig> = {}
): ClassificationConfig {
  return {
    oikumene: makeOikumeneConfig(overrides.oikumene),
    galaxy: makeGalaxyConfig(overrides.galaxy),
    costMap: overrides.costMap ?? makeOpenCostMap(200, 200, -100, -100),
  };
}

/**
 * Creates a cost map where all cells are open corridors (low cost).
 *
 * @param width - grid width
 * @param height - grid height
 * @param originX - grid origin X
 * @param originY - grid origin Y
 * @returns CostMap with all cells at minimum cost
 */
function makeOpenCostMap(width: number, height: number, originX: number, originY: number): CostMap {
  const size = width * height;
  const data = new Uint8Array(size);
  // Low byte value → low cost → open corridor
  data.fill(0);
  return {
    data,
    width,
    height,
    quantization: {
      minCost: 1,
      maxCost: 30,
      gridOriginX: originX,
      gridOriginY: originY,
      gridWidth: width,
      gridHeight: height,
    },
  };
}

/**
 * Creates a cost map where all cells are walls (high cost).
 *
 * @param width - grid width
 * @param height - grid height
 * @param originX - grid origin X
 * @param originY - grid origin Y
 * @returns CostMap with all cells at maximum cost
 */
function makeWallCostMap(width: number, height: number, originX: number, originY: number): CostMap {
  const size = width * height;
  const data = new Uint8Array(size);
  // High byte value → high cost → wall
  data.fill(255);
  return {
    data,
    width,
    height,
    quantization: {
      minCost: 1,
      maxCost: 30,
      gridOriginX: originX,
      gridOriginY: originY,
      gridWidth: width,
      gridHeight: height,
    },
  };
}

/**
 * Generates systems along spiral arms for testing.
 *
 * @param count - number of systems
 * @param centerX - galaxy center X
 * @param centerY - galaxy center Y
 * @param minRadius - minimum distance from center
 * @param arms - number of spiral arms
 * @returns array of coordinates
 */
function generateSpiralSystems(
  count: number,
  centerX: number,
  centerY: number,
  minRadius: number,
  arms: number
): Coordinate[] {
  const coords: Coordinate[] = [];
  for (let i = 0; i < count; i++) {
    const arm = i % arms;
    const armAngle = (arm / arms) * 2 * Math.PI;
    const t = (i / count) * 5; // spiral parameter
    const angle = armAngle + t * 0.5;
    const radius = minRadius + t * 20;
    coords.push({
      x: Math.round(centerX + radius * Math.cos(angle)),
      y: Math.round(centerY + radius * Math.sin(angle)),
    });
  }
  return coords;
}

describe('distanceFromCenter', () => {
  it('returns 0 for a point at the center', () => {
    expect(distanceFromCenter(0, 0, 0, 0)).toBe(0);
  });

  it('returns correct distance for axis-aligned point', () => {
    expect(distanceFromCenter(3, 0, 0, 0)).toBe(3);
    expect(distanceFromCenter(0, 4, 0, 0)).toBe(4);
  });

  it('returns correct distance for diagonal point', () => {
    expect(distanceFromCenter(3, 4, 0, 0)).toBe(5);
  });

  it('handles non-zero center', () => {
    expect(distanceFromCenter(13, 4, 10, 0)).toBe(5);
  });
});

describe('isInOpenCorridor', () => {
  it('returns true for a low-cost cell', () => {
    const costMap = makeOpenCostMap(10, 10, 0, 0);
    expect(isInOpenCorridor(5, 5, costMap)).toBe(true);
  });

  it('returns false for a high-cost cell', () => {
    const costMap = makeWallCostMap(10, 10, 0, 0);
    expect(isInOpenCorridor(5, 5, costMap)).toBe(false);
  });

  it('returns false for coordinates outside the grid', () => {
    const costMap = makeOpenCostMap(10, 10, 0, 0);
    expect(isInOpenCorridor(-1, 5, costMap)).toBe(false);
    expect(isInOpenCorridor(5, -1, costMap)).toBe(false);
    expect(isInOpenCorridor(10, 5, costMap)).toBe(false);
    expect(isInOpenCorridor(5, 10, costMap)).toBe(false);
  });

  it('uses grid origin for coordinate mapping', () => {
    const costMap = makeOpenCostMap(10, 10, -5, -5);
    // World coord (-3, -3) maps to grid (2, 2)
    expect(isInOpenCorridor(-3, -3, costMap)).toBe(true);
    // World coord (-6, 0) maps to grid (-1, 5) — outside grid
    expect(isInOpenCorridor(-6, 0, costMap)).toBe(false);
  });

  it('uses wall cost threshold to distinguish open vs wall', () => {
    const costMap = makeOpenCostMap(10, 10, 0, 0);
    // Set a cell to mid-range cost (open corridor has cost 1-3, walls 10-30)
    // With minCost=1, maxCost=30: threshold cost = 5 (configurable)
    // byteValue that decodes to cost 5: (5-1)/(30-1)*255 ≈ 35
    const idx = 3 * 10 + 3;
    costMap.data[idx] = 35;
    // Still should be considered open (cost ≈ 5 which is below wall threshold)
    expect(isInOpenCorridor(3, 3, costMap)).toBe(true);

    // Set to high cost (wall)
    costMap.data[idx] = 200;
    expect(isInOpenCorridor(3, 3, costMap)).toBe(false);
  });
});

describe('computeSpiralArmScore', () => {
  it('returns high score for point on a spiral arm', () => {
    // At radius=100, deg=5, spiralWinding = 0.5 rad. Arm 0 is at angle 0.5.
    const armAngle = 0.5;
    const x = 100 * Math.cos(armAngle);
    const y = 100 * Math.sin(armAngle);
    const score = computeSpiralArmScore(x, y, 0, 0, 4, 5);
    expect(score).toBeGreaterThan(0.9);
  });

  it('returns lower score for point between arms', () => {
    // At radius=100, deg=5, spiralWinding = 0.5 rad. Arm 0 is at angle 0.5.
    // Place one point on the arm and one midway between arms
    const armAngle = 0.5; // where arm 0 actually is at radius 100
    const onArmX = 100 * Math.cos(armAngle);
    const onArmY = 100 * Math.sin(armAngle);
    // Between arms: offset by PI/4 from the arm (half the inter-arm gap of PI/2)
    const betweenAngle = armAngle + Math.PI / 4;
    const betweenX = 100 * Math.cos(betweenAngle);
    const betweenY = 100 * Math.sin(betweenAngle);
    const scoreOnArm = computeSpiralArmScore(onArmX, onArmY, 0, 0, 4, 5);
    const scoreBetween = computeSpiralArmScore(betweenX, betweenY, 0, 0, 4, 5);
    expect(scoreOnArm).toBeGreaterThan(scoreBetween);
  });

  it('returns 0 for point at galaxy center', () => {
    expect(computeSpiralArmScore(0, 0, 0, 0, 4, 5)).toBe(0);
  });

  it('handles non-zero center', () => {
    const score1 = computeSpiralArmScore(100, 0, 0, 0, 4, 5);
    const score2 = computeSpiralArmScore(110, 10, 10, 10, 4, 5);
    expect(score1).toBeCloseTo(score2, 5);
  });
});

describe('classifySystems', () => {
  it('returns an empty array for empty coordinates', () => {
    const rng = new Mulberry32(42);
    const config = makeClassificationConfig();
    const result = classifySystems([], config, rng);
    expect(result).toEqual([]);
  });

  it('returns one result per input coordinate', () => {
    const coords: Coordinate[] = [
      { x: 100, y: 0 },
      { x: -100, y: 0 },
      { x: 0, y: 100 },
    ];
    const rng = new Mulberry32(42);
    const config = makeClassificationConfig();
    const result = classifySystems(coords, config, rng);
    expect(result).toHaveLength(3);
  });

  it('marks all core systems as non-Oikumene', () => {
    // Place systems inside core exclusion zone
    const coords: Coordinate[] = [
      { x: 10, y: 0 },
      { x: 0, y: 10 },
      { x: -10, y: 0 },
      { x: 200, y: 0 }, // This one is outside
    ];
    const rng = new Mulberry32(42);
    const config = makeClassificationConfig({
      oikumene: { coreExclusionRadius: 50, clusterRadius: 30, targetCount: 1 },
    });
    const result = classifySystems(coords, config, rng);

    // First 3 are inside core — cannot be Oikumene
    expect(result[0]?.isOikumene).toBe(false);
    expect(result[1]?.isOikumene).toBe(false);
    expect(result[2]?.isOikumene).toBe(false);
  });

  it('excludes systems in wall cells from Oikumene', () => {
    const coords: Coordinate[] = [
      { x: 80, y: 0 },
      { x: -80, y: 0 },
    ];
    const rng = new Mulberry32(42);
    const wallMap = makeWallCostMap(200, 200, -100, -100);
    const config = makeClassificationConfig({
      oikumene: { coreExclusionRadius: 50, clusterRadius: 30, targetCount: 2 },
      costMap: wallMap,
    });
    const result = classifySystems(coords, config, rng);

    // Both outside core but in wall cells — cannot be Oikumene
    for (const r of result) {
      expect(r.isOikumene).toBe(false);
    }
  });

  it('selects Oikumene systems outside core in open corridors', () => {
    const coords = generateSpiralSystems(500, 0, 0, 60, 4);
    const rng = new Mulberry32(42);
    const openMap = makeOpenCostMap(600, 600, -300, -300);
    const config = makeClassificationConfig({
      oikumene: { coreExclusionRadius: 50, clusterRadius: 30, targetCount: 250 },
      costMap: openMap,
    });
    const result = classifySystems(coords, config, rng);

    const oikumene = result.filter((r) => r.isOikumene);
    expect(oikumene.length).toBeGreaterThanOrEqual(230);
    expect(oikumene.length).toBeLessThanOrEqual(270);
  });

  it('all Oikumene are outside core exclusion zone', () => {
    const coords = generateSpiralSystems(500, 0, 0, 30, 4);
    const rng = new Mulberry32(42);
    const openMap = makeOpenCostMap(600, 600, -300, -300);
    const config = makeClassificationConfig({
      oikumene: { coreExclusionRadius: 50, clusterRadius: 30, targetCount: 100 },
      costMap: openMap,
    });
    const result = classifySystems(coords, config, rng);

    const oikumene = result.filter((r) => r.isOikumene);
    for (const r of oikumene) {
      const coord = coords[r.index] as Coordinate;
      const dist = Math.sqrt(coord.x * coord.x + coord.y * coord.y);
      expect(dist).toBeGreaterThanOrEqual(50);
    }
  });

  it('sets isOikumene true iff classification is OIKUMENE', () => {
    const coords = generateSpiralSystems(300, 0, 0, 60, 4);
    const rng = new Mulberry32(42);
    const config = makeClassificationConfig({
      oikumene: { coreExclusionRadius: 50, clusterRadius: 30, targetCount: 50 },
    });
    const result = classifySystems(coords, config, rng);

    for (const r of result) {
      if (r.isOikumene) {
        expect(r.classification).toBe(Classification.OIKUMENE);
      } else {
        expect(r.classification).not.toBe(Classification.OIKUMENE);
      }
    }
  });

  it('assigns valid classification enum to all systems', () => {
    const coords = generateSpiralSystems(100, 0, 0, 60, 4);
    const rng = new Mulberry32(42);
    const config = makeClassificationConfig({
      oikumene: { coreExclusionRadius: 50, clusterRadius: 30, targetCount: 20 },
    });
    const result = classifySystems(coords, config, rng);

    const validValues = new Set(Object.values(Classification));
    for (const r of result) {
      expect(validValues.has(r.classification)).toBe(true);
    }
  });

  it('classifies Beyond systems with correct proportions', () => {
    // Use a large sample for statistical significance
    const coords = generateSpiralSystems(2000, 0, 0, 60, 4);
    const rng = new Mulberry32(12345);
    const openMap = makeOpenCostMap(1000, 1000, -500, -500);
    const config = makeClassificationConfig({
      oikumene: { coreExclusionRadius: 50, clusterRadius: 30, targetCount: 100 },
      costMap: openMap,
    });
    const result = classifySystems(coords, config, rng);

    const beyond = result.filter((r) => !r.isOikumene);
    const uninhabited = beyond.filter((r) => r.classification === Classification.UNINHABITED);
    const lostColonies = beyond.filter((r) => r.classification === Classification.LOST_COLONY);
    const hiddenEnclaves = beyond.filter((r) => r.classification === Classification.HIDDEN_ENCLAVE);

    const total = beyond.length;
    expect(total).toBeGreaterThan(0);

    const uninhabitedPct = (uninhabited.length / total) * 100;
    const lostColonyPct = (lostColonies.length / total) * 100;
    const hiddenEnclavePct = (hiddenEnclaves.length / total) * 100;

    // ~85% uninhabited (allow 75-95% for statistical variation)
    expect(uninhabitedPct).toBeGreaterThanOrEqual(75);
    expect(uninhabitedPct).toBeLessThanOrEqual(95);

    // ~5-8% lost colonies (allow 2-15%)
    expect(lostColonyPct).toBeGreaterThanOrEqual(2);
    expect(lostColonyPct).toBeLessThanOrEqual(15);

    // ~5-8% hidden enclaves (allow 2-15%)
    expect(hiddenEnclavePct).toBeGreaterThanOrEqual(2);
    expect(hiddenEnclavePct).toBeLessThanOrEqual(15);
  });

  it('is deterministic with the same seed', () => {
    const coords = generateSpiralSystems(500, 0, 0, 60, 4);

    const rng1 = new Mulberry32(42);
    const config1 = makeClassificationConfig();
    const result1 = classifySystems(coords, config1, rng1);

    const rng2 = new Mulberry32(42);
    const config2 = makeClassificationConfig();
    const result2 = classifySystems(coords, config2, rng2);

    expect(result1).toEqual(result2);
  });

  it('produces different results with different seeds', () => {
    const coords = generateSpiralSystems(500, 0, 0, 60, 4);

    const rng1 = new Mulberry32(42);
    const config1 = makeClassificationConfig();
    const result1 = classifySystems(coords, config1, rng1);

    const rng2 = new Mulberry32(999);
    const config2 = makeClassificationConfig();
    const result2 = classifySystems(coords, config2, rng2);

    // At least some classifications should differ
    const differs = result1.some((r, i) => r.classification !== result2[i]?.classification);
    expect(differs).toBe(true);
  });

  it('returns results with correct index mapping', () => {
    const coords: Coordinate[] = [
      { x: 100, y: 0 },
      { x: 200, y: 0 },
      { x: 300, y: 0 },
    ];
    const rng = new Mulberry32(42);
    const config = makeClassificationConfig();
    const result = classifySystems(coords, config, rng);

    for (let i = 0; i < result.length; i++) {
      expect(result[i]?.index).toBe(i);
    }
  });

  it('handles case where all systems are inside core exclusion', () => {
    const coords: Coordinate[] = [
      { x: 5, y: 0 },
      { x: 0, y: 5 },
      { x: -5, y: -5 },
    ];
    const rng = new Mulberry32(42);
    const config = makeClassificationConfig({
      oikumene: { coreExclusionRadius: 100, clusterRadius: 30, targetCount: 250 },
    });
    const result = classifySystems(coords, config, rng);

    // No Oikumene possible
    const oikumene = result.filter((r) => r.isOikumene);
    expect(oikumene).toHaveLength(0);

    // All should be Beyond classifications
    for (const r of result) {
      expect(r.classification).not.toBe(Classification.OIKUMENE);
    }
  });

  it('selects fewer than targetCount when insufficient candidates', () => {
    // Only 10 systems, but target is 250
    const coords = generateSpiralSystems(10, 0, 0, 60, 4);
    const rng = new Mulberry32(42);
    const config = makeClassificationConfig({
      oikumene: { coreExclusionRadius: 50, clusterRadius: 30, targetCount: 250 },
    });
    const result = classifySystems(coords, config, rng);

    const oikumene = result.filter((r) => r.isOikumene);
    // Should select as many as available, not exceed total
    expect(oikumene.length).toBeLessThanOrEqual(10);
    expect(oikumene.length).toBeGreaterThan(0);
  });

  it('Oikumene systems are clustered (near each other)', () => {
    const coords = generateSpiralSystems(500, 0, 0, 60, 4);
    const rng = new Mulberry32(42);
    const openMap = makeOpenCostMap(600, 600, -300, -300);
    const config = makeClassificationConfig({
      oikumene: { coreExclusionRadius: 50, clusterRadius: 30, targetCount: 100 },
      costMap: openMap,
    });
    const result = classifySystems(coords, config, rng);

    const oikumeneCoords = result
      .filter((r) => r.isOikumene)
      .map((r) => coords[r.index] as Coordinate);

    // Check that Oikumene systems have at least 1 other Oikumene within cluster radius * 3
    // (clustered means they should generally be near each other, not randomly spread)
    let clusteredCount = 0;
    for (const c1 of oikumeneCoords) {
      for (const c2 of oikumeneCoords) {
        if (c1 === c2) continue;
        const d = Math.sqrt((c1.x - c2.x) ** 2 + (c1.y - c2.y) ** 2);
        if (d <= 90) {
          clusteredCount++;
          break;
        }
      }
    }
    // Most Oikumene systems should have a neighbor within 90 units
    expect(clusteredCount / oikumeneCoords.length).toBeGreaterThan(0.5);
  });

  it('ClassificationResult has correct shape', () => {
    const coords: Coordinate[] = [{ x: 200, y: 0 }];
    const rng = new Mulberry32(42);
    const config = makeClassificationConfig();
    const result = classifySystems(coords, config, rng);

    const r = result[0] as ClassificationResult;
    expect(typeof r.index).toBe('number');
    expect(typeof r.isOikumene).toBe('boolean');
    expect(typeof r.classification).toBe('string');
  });

  it('handles galaxy with non-zero center', () => {
    const coords: Coordinate[] = [
      { x: 510, y: 500 },
      { x: 500, y: 510 },
      { x: 700, y: 500 },
    ];
    const rng = new Mulberry32(42);
    // Grid must cover all coordinates: origin at 300,300, size 500x500
    const openMap = makeOpenCostMap(500, 500, 300, 300);
    const config = makeClassificationConfig({
      galaxy: makeGalaxyConfig({ center: [500, 500] }),
      oikumene: { coreExclusionRadius: 50, clusterRadius: 30, targetCount: 1 },
      costMap: openMap,
    });
    const result = classifySystems(coords, config, rng);

    // First two are inside core (dist ~10 from center 500,500)
    expect(result[0]?.isOikumene).toBe(false);
    expect(result[1]?.isOikumene).toBe(false);
    // Third is outside core (dist=200 from center)
    expect(result[2]?.isOikumene).toBe(true);
  });
});
