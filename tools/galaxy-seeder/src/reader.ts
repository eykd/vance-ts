/**
 * File reader for galaxy generator output.
 *
 * Reads metadata.json, systems/*.json, and routes.json from the generator
 * output directory. System files are read with a concurrency limit to avoid
 * EMFILE errors on large galaxies (~12,000 system files).
 *
 * @module reader
 */

import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

/** Maximum number of concurrent file reads for system files. */
const MAX_CONCURRENCY = 100;

/**
 * Run async tasks with a concurrency limit.
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
 * Read and parse metadata.json from the generator output directory.
 *
 * @param outputDir - Path to the generator output directory.
 * @returns Parsed metadata object.
 */
export async function readMetadata(outputDir: string): Promise<unknown> {
  const content = await readFile(join(outputDir, 'metadata.json'), 'utf-8');
  return JSON.parse(content) as unknown;
}

/**
 * Read and parse routes.json from the generator output directory.
 *
 * @param outputDir - Path to the generator output directory.
 * @returns Parsed routes object.
 */
export async function readRoutes(outputDir: string): Promise<unknown> {
  const content = await readFile(join(outputDir, 'routes.json'), 'utf-8');
  return JSON.parse(content) as unknown;
}

/**
 * Read all star system JSON files from the systems/ subdirectory.
 *
 * Uses a concurrency limiter (max 100) to avoid EMFILE errors when reading
 * thousands of system files.
 *
 * @param outputDir - Path to the generator output directory.
 * @returns Array of parsed star system objects.
 */
export async function readSystems(outputDir: string): Promise<unknown[]> {
  const systemsDir = join(outputDir, 'systems');
  const files = await readdir(systemsDir);
  const jsonFiles = files.filter((f) => f.endsWith('.json'));

  const systems: unknown[] = [];
  const tasks = jsonFiles.map((file) => async (): Promise<void> => {
    const content = await readFile(join(systemsDir, file), 'utf-8');
    systems.push(JSON.parse(content) as unknown);
  });

  await runWithConcurrency(tasks, MAX_CONCURRENCY);
  return systems;
}
