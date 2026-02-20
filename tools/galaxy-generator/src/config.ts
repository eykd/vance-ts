/**
 * Pipeline configuration with defaults, file loading, and merge precedence.
 *
 * Defines all tunable generation parameters with sensible defaults matching
 * the spec. Supports loading overrides from a JSON config file and CLI
 * arguments with merge precedence: CLI args > config file > defaults.
 *
 * @module config
 */

import * as fs from 'node:fs/promises';

import type {
  CaConfig,
  GalaxyConfig,
  OikumeneConfig,
  PerlinConfig,
  RouteConfig,
} from '../../../src/domain/galaxy/types';

import type { CostMapGeneratorConfig } from './costmap/costmap-generator';

/** CLI argument values parsed from the command line. */
export interface CliArgs {
  /** Master seed for deterministic generation. */
  readonly seed: string;
  /** Output directory path (undefined means use config file or default). */
  readonly output?: string;
  /** Number of spiral arms (overrides config file and defaults). */
  readonly arms?: number;
  /** Target Oikumene system count (overrides config file and defaults). */
  readonly oikumeneCount?: number;
  /** Maximum route range in coordinate units (overrides config file and defaults). */
  readonly maxRouteRange?: number;
}

/** Partial config file shape for JSON overrides. */
export interface ConfigFileOverrides {
  /** Galaxy generation parameters. */
  readonly galaxy?: Partial<Omit<GalaxyConfig, 'seed'>>;
  /** Cost map generation parameters. */
  readonly costMap?: Partial<CostMapGeneratorConfig>;
  /** Oikumene selection parameters. */
  readonly oikumene?: Partial<OikumeneConfig>;
  /** Route computation parameters. */
  readonly route?: Partial<RouteConfig>;
  /** Density radius for neighbor counting. */
  readonly densityRadius?: number;
  /** Output directory path. */
  readonly output?: string;
}

/** Complete resolved pipeline configuration. */
export interface PipelineConfig {
  /** Master seed for deterministic generation. */
  readonly seed: string;
  /** Output directory path. */
  readonly output: string;
  /** Galaxy generation parameters (excluding seed, which is top-level). */
  readonly galaxy: Omit<GalaxyConfig, 'seed'>;
  /** Cost map generation parameters. */
  readonly costMap: CostMapGeneratorConfig;
  /** Oikumene selection parameters. */
  readonly oikumene: OikumeneConfig;
  /** Route computation parameters. */
  readonly route: RouteConfig;
  /** Density radius for neighbor counting. */
  readonly densityRadius: number;
}

/** Default galaxy generation parameters matching spec §FR-002. */
export const DEFAULT_GALAXY_CONFIG: Omit<GalaxyConfig, 'seed'> = {
  center: [0, 0] as readonly [number, number],
  size: [4000, 4000] as readonly [number, number],
  turn: 0,
  deg: 5,
  dynSizeFactor: 1,
  spcFactor: 8,
  arms: 4,
  multiplier: 1,
  limit: null,
};

/** Default cost map generation parameters matching spec §FR-004. */
export const DEFAULT_COST_MAP_GENERATOR_CONFIG: CostMapGeneratorConfig = {
  padding: 10,
  baseOpenCost: 1,
  openNoiseWeight: 2,
  baseWallCost: 15,
  wallNoiseWeight: 15,
  baseNoiseFrequency: 0.03,
  baseNoiseOctaves: 4,
  wallNoiseFrequency: 0.05,
  wallNoiseOctaves: 3,
  caFillProbability: 0.45,
  caIterations: 5,
};

/** Default Perlin noise configuration derived from cost map defaults. */
export const DEFAULT_PERLIN_CONFIG: PerlinConfig = {
  baseLayer: {
    frequency: DEFAULT_COST_MAP_GENERATOR_CONFIG.baseNoiseFrequency,
    octaves: DEFAULT_COST_MAP_GENERATOR_CONFIG.baseNoiseOctaves,
  },
  wallLayer: {
    frequency: DEFAULT_COST_MAP_GENERATOR_CONFIG.wallNoiseFrequency,
    octaves: DEFAULT_COST_MAP_GENERATOR_CONFIG.wallNoiseOctaves,
  },
};

/** Default cellular automata configuration derived from cost map defaults. */
export const DEFAULT_CA_CONFIG: CaConfig = {
  fillProbability: DEFAULT_COST_MAP_GENERATOR_CONFIG.caFillProbability,
  iterations: DEFAULT_COST_MAP_GENERATOR_CONFIG.caIterations,
  rule: 'B5678/S45678',
};

/** Default Oikumene selection parameters matching spec §FR-006. */
export const DEFAULT_OIKUMENE_CONFIG: OikumeneConfig = {
  coreExclusionRadius: 100,
  clusterRadius: 50,
  targetCount: 250,
};

/** Default route computation parameters matching CLI contract. */
export const DEFAULT_ROUTE_CONFIG: RouteConfig = {
  maxRange: 40,
};

/** Default density radius for neighbor counting (coordinate units). */
export const DEFAULT_DENSITY_RADIUS = 25;

/**
 * Loads and parses a JSON config file.
 *
 * Returns an empty object when no path is provided. Throws descriptive
 * errors for file read failures, invalid JSON, or non-object content.
 *
 * @param filePath - path to the JSON config file, or undefined to skip
 * @returns parsed config file overrides
 * @throws {Error} when the file cannot be read, parsed, or is not a JSON object
 */
export async function loadConfigFile(filePath: string | undefined): Promise<ConfigFileOverrides> {
  if (filePath === undefined) {
    return {};
  }

  let content: string;
  try {
    content = await fs.readFile(filePath, 'utf-8');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to read config file "${filePath}": ${message}`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to parse config file "${filePath}": ${message}`);
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error(`Config file "${filePath}" must contain a JSON object`);
  }

  return parsed as ConfigFileOverrides;
}

/**
 * Resolves the final pipeline configuration from defaults, file overrides, and CLI args.
 *
 * Merge precedence: CLI args > config file > defaults. Only defined CLI args
 * override the corresponding values. Nested config sections are shallow-merged.
 *
 * @param cli - parsed CLI arguments
 * @param fileOverrides - overrides loaded from config file
 * @returns fully resolved pipeline configuration
 */
export function resolveConfig(cli: CliArgs, fileOverrides: ConfigFileOverrides): PipelineConfig {
  const galaxy: Omit<GalaxyConfig, 'seed'> = {
    ...DEFAULT_GALAXY_CONFIG,
    ...fileOverrides.galaxy,
    ...(cli.arms !== undefined ? { arms: cli.arms } : {}),
  };

  const costMap: CostMapGeneratorConfig = {
    ...DEFAULT_COST_MAP_GENERATOR_CONFIG,
    ...fileOverrides.costMap,
  };

  const oikumene: OikumeneConfig = {
    ...DEFAULT_OIKUMENE_CONFIG,
    ...fileOverrides.oikumene,
    ...(cli.oikumeneCount !== undefined ? { targetCount: cli.oikumeneCount } : {}),
  };

  const route: RouteConfig = {
    ...DEFAULT_ROUTE_CONFIG,
    ...fileOverrides.route,
    ...(cli.maxRouteRange !== undefined ? { maxRange: cli.maxRouteRange } : {}),
  };

  const densityRadius = fileOverrides.densityRadius ?? DEFAULT_DENSITY_RADIUS;

  const output = cli.output ?? fileOverrides.output ?? './galaxy-output/';

  return {
    seed: cli.seed,
    output,
    galaxy,
    costMap,
    oikumene,
    route,
    densityRadius,
  };
}

/**
 * Validates a resolved pipeline configuration.
 *
 * Checks all parameters are within acceptable ranges and throws
 * descriptive errors for any invalid values.
 *
 * @param config - fully resolved pipeline configuration
 * @throws {Error} when any configuration value is invalid
 */
export function validateConfig(config: PipelineConfig): void {
  // Seed
  if (config.seed.length === 0) {
    throw new Error('seed must be a non-empty string');
  }

  // Galaxy
  const { galaxy } = config;

  if (!Number.isInteger(galaxy.arms) || galaxy.arms <= 0) {
    throw new Error(`galaxy.arms must be a positive integer, got ${String(galaxy.arms)}`);
  }

  if (galaxy.spcFactor <= 0) {
    throw new Error(`galaxy.spcFactor must be a positive number, got ${String(galaxy.spcFactor)}`);
  }

  if (galaxy.dynSizeFactor <= 0) {
    throw new Error(
      `galaxy.dynSizeFactor must be a positive number, got ${String(galaxy.dynSizeFactor)}`
    );
  }

  if (galaxy.limit !== null && (!Number.isInteger(galaxy.limit) || galaxy.limit <= 0)) {
    throw new Error(`galaxy.limit must be a positive integer or null, got ${String(galaxy.limit)}`);
  }

  // Cost map
  const { costMap } = config;

  if (!Number.isInteger(costMap.padding) || costMap.padding < 0) {
    throw new Error(
      `costMap.padding must be a non-negative integer, got ${String(costMap.padding)}`
    );
  }

  if (costMap.baseOpenCost < 0) {
    throw new Error(
      `costMap.baseOpenCost must be a non-negative number, got ${String(costMap.baseOpenCost)}`
    );
  }

  if (costMap.openNoiseWeight < 0) {
    throw new Error(
      `costMap.openNoiseWeight must be a non-negative number, got ${String(costMap.openNoiseWeight)}`
    );
  }

  if (costMap.baseWallCost < 0) {
    throw new Error(
      `costMap.baseWallCost must be a non-negative number, got ${String(costMap.baseWallCost)}`
    );
  }

  if (costMap.wallNoiseWeight < 0) {
    throw new Error(
      `costMap.wallNoiseWeight must be a non-negative number, got ${String(costMap.wallNoiseWeight)}`
    );
  }

  if (costMap.baseNoiseFrequency <= 0) {
    throw new Error(
      `costMap.baseNoiseFrequency must be a positive number, got ${String(costMap.baseNoiseFrequency)}`
    );
  }

  if (costMap.wallNoiseFrequency <= 0) {
    throw new Error(
      `costMap.wallNoiseFrequency must be a positive number, got ${String(costMap.wallNoiseFrequency)}`
    );
  }

  if (!Number.isInteger(costMap.baseNoiseOctaves) || costMap.baseNoiseOctaves <= 0) {
    throw new Error(
      `costMap.baseNoiseOctaves must be a positive integer, got ${String(costMap.baseNoiseOctaves)}`
    );
  }

  if (!Number.isInteger(costMap.wallNoiseOctaves) || costMap.wallNoiseOctaves <= 0) {
    throw new Error(
      `costMap.wallNoiseOctaves must be a positive integer, got ${String(costMap.wallNoiseOctaves)}`
    );
  }

  if (costMap.caFillProbability < 0 || costMap.caFillProbability > 1) {
    throw new Error(
      `costMap.caFillProbability must be in range [0, 1], got ${String(costMap.caFillProbability)}`
    );
  }

  if (!Number.isInteger(costMap.caIterations) || costMap.caIterations < 0) {
    throw new Error(
      `costMap.caIterations must be a non-negative integer, got ${String(costMap.caIterations)}`
    );
  }

  // Oikumene
  const { oikumene } = config;

  if (oikumene.coreExclusionRadius < 0) {
    throw new Error(
      `oikumene.coreExclusionRadius must be a non-negative number, got ${String(oikumene.coreExclusionRadius)}`
    );
  }

  if (oikumene.clusterRadius < 0) {
    throw new Error(
      `oikumene.clusterRadius must be a non-negative number, got ${String(oikumene.clusterRadius)}`
    );
  }

  if (!Number.isInteger(oikumene.targetCount) || oikumene.targetCount <= 0) {
    throw new Error(
      `oikumene.targetCount must be a positive integer, got ${String(oikumene.targetCount)}`
    );
  }

  // Route
  if (config.route.maxRange <= 0) {
    throw new Error(
      `route.maxRange must be a positive number, got ${String(config.route.maxRange)}`
    );
  }

  // Density
  if (config.densityRadius <= 0) {
    throw new Error(`densityRadius must be a positive number, got ${String(config.densityRadius)}`);
  }
}
