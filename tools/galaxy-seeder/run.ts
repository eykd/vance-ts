/**
 * CLI runner for the galaxy seeder.
 *
 * Usage: npx tsx tools/galaxy-seeder/run.ts [options]
 *
 * @module run
 */

import { main } from './src/index.js';

void main(process.argv.slice(2)).then((exitCode) => {
  process.exitCode = exitCode;
});
