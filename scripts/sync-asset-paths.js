#!/usr/bin/env node

/**
 * Extracts fingerprinted CSS path from Hugo build output and writes it
 * to a TypeScript module so Worker templates can reference the same
 * stylesheet that Hugo produces.
 *
 * Intended to run after `npx hugo --minify` (see justfile hugo-build).
 * No-ops when the path has not changed (avoids spurious git diffs).
 *
 * NOTE: This is a Node.js build-time script, NOT Cloudflare Workers runtime code.
 */

const fs = require('fs');
const path = require('path');

const PUBLIC_CSS_DIR = path.join(__dirname, '..', 'hugo', 'public', 'css');
const OUTPUT_FILE = path.join(
  __dirname,
  '..',
  'src',
  'presentation',
  'generated',
  'assetPaths.ts',
);

/**
 * Finds the fingerprinted styles CSS file in Hugo's build output directory.
 * @returns {string} The public URL path to the styles CSS file (e.g. `/css/styles.abc123.css`).
 */
function findStylesCss() {
  if (!fs.existsSync(PUBLIC_CSS_DIR)) {
    console.error(`ERROR: ${PUBLIC_CSS_DIR} does not exist. Run Hugo build first.`);
    process.exit(1);
  }

  const files = fs.readdirSync(PUBLIC_CSS_DIR).filter((f) => /^styles\..+\.css$/.test(f));

  if (files.length === 0) {
    console.error('ERROR: No styles.*.css found in Hugo build output.');
    process.exit(1);
  }

  if (files.length > 1) {
    console.error(`ERROR: Multiple styles CSS files found: ${files.join(', ')}`);
    process.exit(1);
  }

  return `/css/${files[0]}`;
}

/**
 * Writes the generated assetPaths.ts file only if the CSS path has changed.
 * @param {string} cssPath - The public URL path to the fingerprinted CSS file.
 */
function writeIfChanged(cssPath) {
  const content =
    `/** AUTO-GENERATED — run \`just hugo-build\` to update. */\n` +
    `export const STYLES_CSS_PATH =\n` +
    `  '${cssPath}';\n`;

  if (fs.existsSync(OUTPUT_FILE)) {
    const existing = fs.readFileSync(OUTPUT_FILE, 'utf-8');
    if (existing === content) {
      console.log('assetPaths.ts is up to date.');
      return;
    }
  }

  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, content, 'utf-8');
  console.log(`Updated assetPaths.ts → ${cssPath}`);
}

const cssPath = findStylesCss();
writeIfChanged(cssPath);
