/**
 * CLI runner for the galaxy generation pipeline.
 *
 * Usage: npx tsx tools/galaxy-generator/run.ts --seed <seed> [options]
 *
 * @module run
 */

import { main } from './src/index';

void main(process.argv.slice(2)).then((exitCode) => {
  process.exitCode = exitCode;
});
