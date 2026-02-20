#!/usr/bin/env node

/**
 * Checks for route collisions between Hugo static output and Worker routes.
 *
 * Hugo content must NOT produce files under `api/` or `app/_/` paths because
 * those paths are reserved for the Worker (via `run_worker_first` in wrangler.toml).
 * If Hugo generates files there, the static asset would shadow the Worker route.
 *
 * Exits non-zero if collisions are found.
 *
 * NOTE: This is a Node.js build-time script, NOT Cloudflare Workers runtime code.
 */

const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, '..', 'hugo', 'public');
const RESERVED_PREFIXES = ['api', 'app/_'];

/**
 * Recursively collects all file paths under a directory.
 * @param {string} dir - Directory to scan.
 * @param {string[]} [files=[]] - Accumulator for found paths.
 * @returns {string[]} List of file paths relative to the starting directory.
 */
function listFiles(dir, files = []) {
  if (!fs.existsSync(dir)) {
    return files;
  }
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      listFiles(full, files);
    } else {
      files.push(path.relative(PUBLIC_DIR, full));
    }
  }
  return files;
}

let collisions = [];

for (const prefix of RESERVED_PREFIXES) {
  const dir = path.join(PUBLIC_DIR, prefix);
  const found = listFiles(dir);
  if (found.length > 0) {
    collisions = collisions.concat(found);
  }
}

if (collisions.length > 0) {
  console.log(`ERROR: Route collisions detected! Hugo output contains files under reserved Worker paths:\n`);
  for (const file of collisions) {
    console.log(`  ${file}`);
  }
  console.log(`\nReserved prefixes: ${RESERVED_PREFIXES.map((p) => p + '/').join(', ')}`);
  console.log('Move or rename these Hugo content files to avoid shadowing Worker routes.');
  process.exit(1);
} else {
  console.log('No route collisions detected.');
}
