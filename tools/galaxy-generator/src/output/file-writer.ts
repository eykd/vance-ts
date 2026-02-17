/**
 * Galaxy output file writer.
 *
 * Writes all pipeline output files to disk: metadata.json, costmap.png,
 * costmap.bin, routes.json, and individual system JSON files. Uses a
 * concurrency limiter (max 100) for system file writes to avoid EMFILE errors.
 *
 * @module output/file-writer
 */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';

import { encode } from 'fast-png';

import type {
  CaConfig,
  CostMapConfig,
  GalaxyConfig,
  GenerationStats,
  OikumeneConfig,
  PerlinConfig,
  Route,
  RouteConfig,
  StarSystem,
} from '../../../../src/domain/galaxy/types';

/** Maximum number of concurrent file writes to avoid EMFILE errors. */
const MAX_CONCURRENCY = 100;

/** All inputs required to write galaxy output files. */
export interface GalaxyOutputInput {
  readonly outputDir: string;
  readonly systems: readonly StarSystem[];
  readonly routes: readonly Route[];
  readonly costmapData: Uint8Array;
  readonly costmapWidth: number;
  readonly costmapHeight: number;
  readonly galaxyConfig: GalaxyConfig;
  readonly costMapConfig: CostMapConfig;
  readonly perlinConfig: PerlinConfig;
  readonly caConfig: CaConfig;
  readonly oikumeneConfig: OikumeneConfig;
  readonly routeConfig: RouteConfig;
  readonly densityRadius: number;
  readonly stats: GenerationStats;
  readonly generatedAt: string;
}

/** Metadata JSON structure matching the output format contract. */
export interface GalaxyMetadata {
  readonly seed: string;
  readonly generatedAt: string;
  readonly galaxyConfig: {
    readonly center: readonly [number, number];
    readonly size: readonly [number, number];
    readonly turn: number;
    readonly deg: number;
    readonly dynSizeFactor: number;
    readonly spcFactor: number;
    readonly arms: number;
    readonly multiplier: number;
    readonly limit: number | null;
  };
  readonly costMapConfig: {
    readonly gridOriginX: number;
    readonly gridOriginY: number;
    readonly gridWidth: number;
    readonly gridHeight: number;
    readonly padding: number;
    readonly minCost: number;
    readonly maxCost: number;
    readonly baseOpenCost: number;
    readonly openNoiseWeight: number;
    readonly baseWallCost: number;
    readonly wallNoiseWeight: number;
    readonly quantization: 'uint8_linear';
  };
  readonly perlinConfig: PerlinConfig;
  readonly caConfig: CaConfig;
  readonly oikumeneConfig: OikumeneConfig;
  readonly routeConfig: RouteConfig;
  readonly densityRadius: number;
  readonly stats: GenerationStats;
}

/** Serialized route with path as [x, y] tuples per the output contract. */
interface SerializedRoute {
  readonly originId: string;
  readonly destinationId: string;
  readonly cost: number;
  readonly path: readonly [number, number][];
}

/** Routes output envelope. */
interface RoutesOutput {
  readonly routes: readonly SerializedRoute[];
}

/**
 * Builds the metadata.json content from pipeline input.
 *
 * @param input - complete galaxy output input
 * @returns metadata object matching the output format contract
 */
export function buildMetadata(input: GalaxyOutputInput): GalaxyMetadata {
  const { galaxyConfig, costMapConfig } = input;
  return {
    seed: galaxyConfig.seed,
    generatedAt: input.generatedAt,
    galaxyConfig: {
      center: galaxyConfig.center,
      size: galaxyConfig.size,
      turn: galaxyConfig.turn,
      deg: galaxyConfig.deg,
      dynSizeFactor: galaxyConfig.dynSizeFactor,
      spcFactor: galaxyConfig.spcFactor,
      arms: galaxyConfig.arms,
      multiplier: galaxyConfig.multiplier,
      limit: galaxyConfig.limit,
    },
    costMapConfig: {
      gridOriginX: costMapConfig.gridOriginX,
      gridOriginY: costMapConfig.gridOriginY,
      gridWidth: costMapConfig.gridWidth,
      gridHeight: costMapConfig.gridHeight,
      padding: costMapConfig.padding,
      minCost: costMapConfig.minCost,
      maxCost: costMapConfig.maxCost,
      baseOpenCost: costMapConfig.baseOpenCost,
      openNoiseWeight: costMapConfig.openNoiseWeight,
      baseWallCost: costMapConfig.baseWallCost,
      wallNoiseWeight: costMapConfig.wallNoiseWeight,
      quantization: 'uint8_linear',
    },
    perlinConfig: input.perlinConfig,
    caConfig: input.caConfig,
    oikumeneConfig: input.oikumeneConfig,
    routeConfig: input.routeConfig,
    densityRadius: input.densityRadius,
    stats: input.stats,
  };
}

/**
 * Encodes costmap data as an 8-bit grayscale PNG.
 *
 * @param data - raw uint8 costmap pixel data
 * @param width - image width in pixels
 * @param height - image height in pixels
 * @returns PNG-encoded buffer
 */
export function encodeCostmapPng(data: Uint8Array, width: number, height: number): Uint8Array {
  return encode({
    width,
    height,
    data,
    depth: 8,
    channels: 1,
  });
}

/**
 * Serializes routes to the output contract format with [x, y] tuple paths.
 *
 * @param routes - array of Route objects with Coordinate paths
 * @returns routes output object with serialized paths
 */
export function serializeRoutes(routes: readonly Route[]): RoutesOutput {
  return {
    routes: routes.map((route) => ({
      originId: route.originId,
      destinationId: route.destinationId,
      cost: route.cost,
      path: route.path.map((coord): [number, number] => [coord.x, coord.y]),
    })),
  };
}

/**
 * Runs async tasks with a concurrency limit.
 *
 * @param tasks - array of functions returning promises
 * @param limit - maximum number of concurrent executions
 */
async function runWithConcurrency(
  tasks: readonly (() => Promise<void>)[],
  limit: number
): Promise<void> {
  const executing = new Set<Promise<void>>();

  for (const task of tasks) {
    const promise = task().then(() => {
      executing.delete(promise);
    });
    executing.add(promise);

    if (executing.size >= limit) {
      await Promise.race(executing);
    }
  }

  await Promise.all(executing);
}

/**
 * Writes all galaxy pipeline output files to disk.
 *
 * Cleans the output directory, creates required subdirectories, then writes
 * metadata.json, costmap.png, costmap.bin, routes.json, and individual
 * system JSON files. System files are written with a concurrency limiter
 * (max 100) to avoid EMFILE errors.
 *
 * @param input - complete galaxy output input
 */
export async function writeGalaxyOutput(input: GalaxyOutputInput): Promise<void> {
  const { outputDir, systems, routes, costmapData, costmapWidth, costmapHeight } = input;

  // Clean and recreate output directory
  await fs.rm(outputDir, { recursive: true, force: true });
  await fs.mkdir(outputDir, { recursive: true });
  await fs.mkdir(path.join(outputDir, 'systems'), { recursive: true });

  // Pre-serialize all JSON strings before starting I/O
  const metadataJson = JSON.stringify(buildMetadata(input), null, 2);
  const routesJson = JSON.stringify(serializeRoutes(routes), null, 2);
  const pngBuffer = encodeCostmapPng(costmapData, costmapWidth, costmapHeight);
  const systemEntries = systems.map((system) => ({
    filePath: path.join(outputDir, 'systems', `${system.id}.json`),
    content: JSON.stringify(system, null, 2),
  }));

  // Write fixed files
  await Promise.all([
    fs.writeFile(path.join(outputDir, 'metadata.json'), metadataJson),
    fs.writeFile(path.join(outputDir, 'costmap.png'), pngBuffer),
    fs.writeFile(path.join(outputDir, 'costmap.bin'), costmapData),
    fs.writeFile(path.join(outputDir, 'routes.json'), routesJson),
  ]);

  // Write system files with concurrency limiter
  const systemTasks = systemEntries.map(
    (entry) => (): Promise<void> => fs.writeFile(entry.filePath, entry.content)
  );

  await runWithConcurrency(systemTasks, MAX_CONCURRENCY);
}
