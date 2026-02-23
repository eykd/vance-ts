/**
 * CLI runner for regenerating the galaxy map PNG from an existing output directory.
 *
 * Usage:
 * npx tsx tools/galaxy-generator/generate-galaxy-map.ts
 * npx tsx tools/galaxy-generator/generate-galaxy-map.ts --output path/to/galaxy-output
 *
 * @module generate-galaxy-map
 */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as url from 'node:url';

import type { StarSystem } from '../../src/domain/galaxy/types';

import type { GalaxyMetadata } from './src/output/file-writer';
import { encodeRgbaPng, renderSystemsMap } from './src/output/system-map-renderer';

/** Default output directory relative to cwd. */
const DEFAULT_OUTPUT_DIR = 'galaxy-output';

/** Maximum number of concurrent system file reads. */
const MAX_CONCURRENCY = 100;

/**
 * Runs async tasks with a concurrency limit.
 *
 * @param tasks - array of zero-argument async functions
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
 * Reads all star system JSON files from the systems/ subdirectory.
 *
 * Uses a concurrency limiter (max 100) to avoid EMFILE errors.
 *
 * @param outputDir - path to the galaxy output directory
 * @returns array of all star systems
 */
export async function readAllSystems(outputDir: string): Promise<StarSystem[]> {
  const systemsDir = path.join(outputDir, 'systems');
  const files = await fs.readdir(systemsDir);
  const jsonFiles = files.filter((f) => f.endsWith('.json'));

  const systems: StarSystem[] = [];
  const tasks = jsonFiles.map((file) => async (): Promise<void> => {
    const content = await fs.readFile(path.join(systemsDir, file), 'utf-8');
    systems.push(JSON.parse(content) as StarSystem);
  });

  await runWithConcurrency(tasks, MAX_CONCURRENCY);
  return systems;
}

/**
 * Parses the --output argument from an args array.
 *
 * @param args - command-line arguments (process.argv.slice(2))
 * @returns output directory path
 */
function parseOutputDir(args: readonly string[]): string {
  const idx = args.indexOf('--output');
  if (idx !== -1) {
    const next = args[idx + 1];
    if (next !== undefined) {
      return next;
    }
  }
  return DEFAULT_OUTPUT_DIR;
}

/**
 * Main entry point: regenerates galaxy-map.png from an existing output directory.
 *
 * @param args - command-line arguments (defaults to process.argv.slice(2))
 */
export async function main(args: readonly string[] = process.argv.slice(2)): Promise<void> {
  const outputDir = parseOutputDir(args);

  const metadataContent = await fs.readFile(path.join(outputDir, 'metadata.json'), 'utf-8');
  const metadata = JSON.parse(metadataContent) as GalaxyMetadata;

  const { gridOriginX, gridOriginY, gridWidth, gridHeight } = metadata.costMapConfig;

  const systems = await readAllSystems(outputDir);

  const systemsMapData = renderSystemsMap(systems, gridWidth, gridHeight, gridOriginX, gridOriginY);
  const galaxyMapPng = encodeRgbaPng(systemsMapData, gridWidth, gridHeight);

  await fs.writeFile(path.join(outputDir, 'galaxy-map.png'), galaxyMapPng);
}

// istanbul ignore next
if (process.argv[1] === url.fileURLToPath(import.meta.url)) {
  void main();
}
