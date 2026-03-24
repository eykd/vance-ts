/**
 * File reader for galaxy generator output.
 *
 * @module reader
 */

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

/**
 * Read and parse metadata.json from the generator output directory.
 *
 * @param outputDir - Path to the generator output directory.
 * @returns Parsed metadata object.
 */
export async function readMetadata(outputDir: string): Promise<unknown> {
  const content = await readFile(join(outputDir, 'metadata.json'), 'utf-8');
  return JSON.parse(content);
}
