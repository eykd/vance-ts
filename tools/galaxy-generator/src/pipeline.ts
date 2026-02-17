/**
 * Pipeline orchestrator for the galaxy generation pipeline.
 *
 * Runs all 7 pipeline stages in sequence with a single shared PRNG instance.
 * Times each stage with performance.now(), logs progress, and delegates to the
 * file writer for output. Wraps stage errors with stage context.
 *
 * @module pipeline
 */

import { Mulberry32 } from '../../../src/domain/galaxy/prng';
import type {
  CaConfig,
  CostMapConfig,
  GenerationStats,
  PerlinConfig,
  Route,
  StarSystem,
} from '../../../src/domain/galaxy/types';
import { Classification } from '../../../src/domain/galaxy/types';

import type { PipelineConfig } from './config';
import type { CostMap } from './costmap/cost-composer';
import { generateCostMap } from './costmap/costmap-generator';
import { generateGalaxy } from './galaxy/galaxy-generator';
import { writeGalaxyOutput } from './output/file-writer';
import { buildRoutes } from './routing/route-builder';
import { classifySystems } from './systems/classification';
import { calculateDensity } from './systems/density';
import { buildSystems } from './systems/system-builder';

/** Timing information for a single pipeline stage. */
export interface StageTiming {
  /** Human-readable stage name. */
  readonly name: string;
  /** Duration in milliseconds. */
  readonly durationMs: number;
}

/** Complete pipeline execution result. */
export interface PipelineResult {
  /** All generated star systems. */
  readonly systems: readonly StarSystem[];
  /** All computed routes. */
  readonly routes: readonly Route[];
  /** Generation statistics. */
  readonly stats: GenerationStats;
  /** Per-stage timing information. */
  readonly stageTimings: readonly StageTiming[];
  /** Total pipeline execution time in milliseconds. */
  readonly totalElapsedMs: number;
}

/** Logger interface for pipeline progress reporting. */
export interface PipelineLogger {
  /** Called when a stage begins. */
  stageStart(stageNumber: number, stageName: string): void;
  /** Called when a stage completes. */
  stageEnd(stageNumber: number, stageName: string, durationMs: number, detail: string): void;
  /** Called when the entire pipeline completes. */
  summary(result: PipelineResult): void;
}

/** Stage name constants matching the CLI contract. */
const STAGE_NAMES = [
  'Generating star positions',
  'Computing cost map',
  'Calculating stellar density',
  'Selecting Oikumene',
  'Generating system attributes',
  'Pre-computing routes',
  'Writing output files',
] as const;

/**
 * Extracts an error message from an unknown thrown value.
 *
 * @param error - the caught error value
 * @returns error message string
 */
export function extractErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * Hashes a string seed into a 32-bit integer for PRNG initialization.
 *
 * Uses a simple FNV-1a-like hash to convert arbitrary string seeds into
 * deterministic numeric values suitable for Mulberry32.
 *
 * @param seed - string seed value
 * @returns 32-bit integer hash
 */
export function hashSeed(seed: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash | 0;
}

/**
 * Computes generation statistics from pipeline outputs.
 *
 * @param routes - all computed routes
 * @param classifications - classification results for counting beyond subtypes
 * @returns generation statistics
 */
function computeStats(
  routes: readonly Route[],
  classifications: readonly {
    readonly classification: Classification;
    readonly isOikumene: boolean;
  }[]
): GenerationStats {
  let oikumeneSystems = 0;
  let beyondUninhabited = 0;
  let beyondLostColonies = 0;
  let beyondHiddenEnclaves = 0;

  for (const c of classifications) {
    if (c.isOikumene) {
      oikumeneSystems++;
    } else if (c.classification === Classification.UNINHABITED) {
      beyondUninhabited++;
    } else if (c.classification === Classification.LOST_COLONY) {
      beyondLostColonies++;
    } else {
      beyondHiddenEnclaves++;
    }
  }

  const totalSystems = classifications.length;
  const beyondSystems = totalSystems - oikumeneSystems;
  const oikumeneRoutes = routes.length;
  const averageRouteCost =
    routes.length > 0 ? routes.reduce((sum, r) => sum + r.cost, 0) / routes.length : 0;

  return {
    totalSystems,
    oikumeneSystems,
    beyondSystems,
    beyondUninhabited,
    beyondLostColonies,
    beyondHiddenEnclaves,
    oikumeneRoutes,
    averageRouteCost,
  };
}

/**
 * Runs the complete galaxy generation pipeline.
 *
 * Executes all 7 stages sequentially with a single shared PRNG instance:
 * 1. Generate star positions
 * 2. Compute cost map
 * 3. Calculate stellar density
 * 4. Select Oikumene systems
 * 5. Generate system attributes
 * 6. Pre-compute routes
 * 7. Write output files
 *
 * @param config - fully resolved pipeline configuration
 * @param logger - optional logger for progress reporting
 * @returns pipeline execution result
 * @throws {Error} wraps stage errors with stage context
 */
export async function runPipeline(
  config: PipelineConfig,
  logger?: PipelineLogger
): Promise<PipelineResult> {
  const pipelineStart = performance.now();
  const rng = new Mulberry32(hashSeed(config.seed));
  const stageTimings: StageTiming[] = [];

  // Stage 1: Generate star positions
  const stage1Name = STAGE_NAMES[0];
  logger?.stageStart(1, stage1Name);
  const stage1Start = performance.now();
  let coordinates;
  try {
    coordinates = generateGalaxy({
      ...config.galaxy,
      rng,
    });
  } catch (error: unknown) {
    const message = extractErrorMessage(error);
    throw new Error(`Stage 1 (${stage1Name}) failed: ${message}`);
  }
  const stage1Duration = performance.now() - stage1Start;
  const stage1Detail = `${String(coordinates.length)} stars generated`;
  logger?.stageEnd(1, stage1Name, stage1Duration, stage1Detail);
  stageTimings.push({ name: stage1Name, durationMs: stage1Duration });

  // Stage 2: Compute cost map
  const stage2Name = STAGE_NAMES[1];
  logger?.stageStart(2, stage2Name);
  const stage2Start = performance.now();
  let costMap: CostMap;
  try {
    costMap = generateCostMap(coordinates, config.costMap, rng);
  } catch (error: unknown) {
    const message = extractErrorMessage(error);
    throw new Error(`Stage 2 (${stage2Name}) failed: ${message}`);
  }
  const stage2Duration = performance.now() - stage2Start;
  const stage2Detail = `${String(costMap.width)}x${String(costMap.height)} grid`;
  logger?.stageEnd(2, stage2Name, stage2Duration, stage2Detail);
  stageTimings.push({ name: stage2Name, durationMs: stage2Duration });

  // Stage 3: Calculate stellar density
  const stage3Name = STAGE_NAMES[2];
  logger?.stageStart(3, stage3Name);
  const stage3Start = performance.now();
  let densities;
  try {
    densities = calculateDensity(coordinates, {
      radius: config.densityRadius,
      gridWidth: costMap.width,
    });
  } catch (error: unknown) {
    const message = extractErrorMessage(error);
    throw new Error(`Stage 3 (${stage3Name}) failed: ${message}`);
  }
  const stage3Duration = performance.now() - stage3Start;
  logger?.stageEnd(3, stage3Name, stage3Duration, 'done');
  stageTimings.push({ name: stage3Name, durationMs: stage3Duration });

  // Stage 4: Select Oikumene
  const stage4Name = STAGE_NAMES[3];
  logger?.stageStart(4, stage4Name);
  const stage4Start = performance.now();
  let classifications;
  try {
    classifications = classifySystems(
      coordinates,
      {
        oikumene: config.oikumene,
        galaxy: { ...config.galaxy, rng },
        costMap,
      },
      rng
    );
  } catch (error: unknown) {
    const message = extractErrorMessage(error);
    throw new Error(`Stage 4 (${stage4Name}) failed: ${message}`);
  }
  const stage4Duration = performance.now() - stage4Start;
  const oikumeneCount = classifications.filter((c) => c.isOikumene).length;
  const stage4Detail = `${String(oikumeneCount)} systems selected`;
  logger?.stageEnd(4, stage4Name, stage4Duration, stage4Detail);
  stageTimings.push({ name: stage4Name, durationMs: stage4Duration });

  // Stage 5: Generate system attributes
  const stage5Name = STAGE_NAMES[4];
  logger?.stageStart(5, stage5Name);
  const stage5Start = performance.now();
  let systems: StarSystem[];
  try {
    systems = buildSystems({ coordinates, classifications, densities }, rng);
  } catch (error: unknown) {
    const message = extractErrorMessage(error);
    throw new Error(`Stage 5 (${stage5Name}) failed: ${message}`);
  }
  const stage5Duration = performance.now() - stage5Start;
  const stage5Detail = `${String(systems.length)} systems attributed`;
  logger?.stageEnd(5, stage5Name, stage5Duration, stage5Detail);
  stageTimings.push({ name: stage5Name, durationMs: stage5Duration });

  // Stage 6: Pre-compute routes
  const stage6Name = STAGE_NAMES[5];
  logger?.stageStart(6, stage6Name);
  const stage6Start = performance.now();
  const oikumeneSystems = systems
    .filter((s) => s.isOikumene)
    .map((s) => ({ id: s.id, x: s.x, y: s.y }));
  let routes: Route[];
  try {
    routes = buildRoutes({
      oikumeneSystems,
      costMap,
      routeConfig: config.route,
    });
  } catch (error: unknown) {
    const message = extractErrorMessage(error);
    throw new Error(`Stage 6 (${stage6Name}) failed: ${message}`);
  }
  const stage6Duration = performance.now() - stage6Start;
  const stage6Detail = `${String(routes.length)} routes computed`;
  logger?.stageEnd(6, stage6Name, stage6Duration, stage6Detail);
  stageTimings.push({ name: stage6Name, durationMs: stage6Duration });

  // Compute stats
  const stats = computeStats(routes, classifications);

  // Build cost map config for file writer
  const costMapWriterConfig: CostMapConfig = {
    gridOriginX: costMap.quantization.gridOriginX,
    gridOriginY: costMap.quantization.gridOriginY,
    gridWidth: costMap.quantization.gridWidth,
    gridHeight: costMap.quantization.gridHeight,
    padding: config.costMap.padding,
    minCost: costMap.quantization.minCost,
    maxCost: costMap.quantization.maxCost,
    baseOpenCost: config.costMap.baseOpenCost,
    openNoiseWeight: config.costMap.openNoiseWeight,
    baseWallCost: config.costMap.baseWallCost,
    wallNoiseWeight: config.costMap.wallNoiseWeight,
  };

  // Build perlin config for file writer
  const perlinConfig: PerlinConfig = {
    baseLayer: {
      frequency: config.costMap.baseNoiseFrequency,
      octaves: config.costMap.baseNoiseOctaves,
    },
    wallLayer: {
      frequency: config.costMap.wallNoiseFrequency,
      octaves: config.costMap.wallNoiseOctaves,
    },
  };

  // Build CA config for file writer
  const caConfig: CaConfig = {
    fillProbability: config.costMap.caFillProbability,
    iterations: config.costMap.caIterations,
    rule: 'B5678/S45678',
  };

  // Stage 7: Write output files
  const stage7Name = STAGE_NAMES[6];
  logger?.stageStart(7, stage7Name);
  const stage7Start = performance.now();
  try {
    await writeGalaxyOutput({
      outputDir: config.output,
      systems,
      routes,
      costmapData: costMap.data,
      costmapWidth: costMap.width,
      costmapHeight: costMap.height,
      galaxyConfig: { ...config.galaxy, seed: config.seed },
      costMapConfig: costMapWriterConfig,
      perlinConfig,
      caConfig,
      oikumeneConfig: config.oikumene,
      routeConfig: config.route,
      stats,
      generatedAt: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const message = extractErrorMessage(error);
    throw new Error(`Stage 7 (${stage7Name}) failed: ${message}`);
  }
  const stage7Duration = performance.now() - stage7Start;
  logger?.stageEnd(7, stage7Name, stage7Duration, 'done');
  stageTimings.push({ name: stage7Name, durationMs: stage7Duration });

  const totalElapsedMs = performance.now() - pipelineStart;

  const result: PipelineResult = {
    systems,
    routes,
    stats,
    stageTimings,
    totalElapsedMs,
  };

  logger?.summary(result);

  return result;
}
