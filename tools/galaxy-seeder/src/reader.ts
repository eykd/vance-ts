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
import { join, resolve } from 'node:path';

/** Maximum number of concurrent file reads for system files. */
const MAX_CONCURRENCY = 100;

/**
 * Resolve an output directory path to an absolute, normalized form.
 *
 * Collapses `.` and `..` segments so that all downstream file operations
 * use a canonical path. This prevents path traversal via crafted `--input`
 * values when the tool is invoked from automated pipelines.
 *
 * @param outputDir - Raw output directory path from CLI arguments.
 * @returns Resolved absolute path.
 */
export function guardOutputDir(outputDir: string): string {
  return resolve(outputDir);
}

/**
 * Run async tasks with a concurrency limit and collect results.
 *
 * @param tasks - array of zero-argument async functions
 * @param limit - maximum number of concurrent executions
 * @returns array of results in the same order as the input tasks
 */
async function mapWithConcurrency<T>(
  tasks: readonly (() => Promise<T>)[],
  limit: number
): Promise<T[]> {
  const results: T[] = new Array<T>(tasks.length);
  const executing = new Set<Promise<void>>();

  for (let i = 0; i < tasks.length; i++) {
    const idx = i;
    const promise = tasks[idx]!().then((result) => {
      results[idx] = result;
      executing.delete(promise);
    });
    executing.add(promise);

    if (executing.size >= limit) {
      await Promise.race(executing);
    }
  }

  await Promise.all(executing);
  return results;
}

/**
 * Read and parse metadata.json from the generator output directory.
 *
 * @param outputDir - Path to the generator output directory.
 * @returns Parsed metadata object.
 */
export async function readMetadata(outputDir: string): Promise<unknown> {
  const safeDir = guardOutputDir(outputDir);
  const content = await readFile(join(safeDir, 'metadata.json'), 'utf-8');
  return JSON.parse(content) as unknown;
}

/**
 * Read and parse routes.json from the generator output directory.
 *
 * @param outputDir - Path to the generator output directory.
 * @returns Parsed routes object.
 */
export async function readRoutes(outputDir: string): Promise<unknown> {
  const safeDir = guardOutputDir(outputDir);
  const content = await readFile(join(safeDir, 'routes.json'), 'utf-8');
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
  const safeDir = guardOutputDir(outputDir);
  const systemsDir = join(safeDir, 'systems');
  const files = await readdir(systemsDir);
  const jsonFiles = files.filter((f) => f.endsWith('.json'));

  const tasks = jsonFiles.map((file) => async (): Promise<unknown> => {
    const content = await readFile(join(systemsDir, file), 'utf-8');
    return JSON.parse(content) as unknown;
  });

  return mapWithConcurrency(tasks, MAX_CONCURRENCY);
}
