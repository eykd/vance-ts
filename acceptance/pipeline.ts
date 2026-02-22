/**
 * Acceptance test pipeline CLI.
 *
 * Usage: npx tsx acceptance/pipeline.ts --action=<parse|generate|run>
 *
 * Actions: parse - Parse specs → IR JSON; generate - IR → Vitest stubs; run - all three steps.
 *
 * This file is the I/O boundary for the acceptance pipeline and is exempt from
 * coverage requirements.
 */

import { spawn } from 'child_process';
import { mkdir, readdir, readFile, writeFile } from 'fs/promises';
import { basename, extname, join } from 'path';

import { generateTests } from './generator.js';
import { deserializeIR, serializeIR } from './ir.js';
import { parseSpec } from './parser.js';

const SPECS_DIR = 'specs/acceptance-specs';
const IR_DIR = 'acceptance-pipeline/ir';
const TESTS_DIR = 'generated-acceptance-tests';

/**
 * Parses all GWT spec files from SPECS_DIR and writes IR JSON to IR_DIR.
 */
async function actionParse(): Promise<void> {
  await mkdir(IR_DIR, { recursive: true });
  const entries = await readdir(SPECS_DIR);
  const txtFiles = entries.filter((f) => f.endsWith('.txt'));

  for (const file of txtFiles) {
    const specPath = join(SPECS_DIR, file);
    const content = await readFile(specPath, 'utf-8');
    const feature = parseSpec(content, specPath);
    const json = serializeIR(feature);
    const irPath = join(IR_DIR, `${basename(file, '.txt')}.json`);
    await writeFile(irPath, json, 'utf-8');
    console.log(`Parsed: ${specPath} → ${irPath}`);
  }

  if (txtFiles.length === 0) {
    console.log(`No spec files found in ${SPECS_DIR}`);
  }
}

/**
 * Generates Vitest test files from IR JSON files in IR_DIR, writing to TESTS_DIR.
 * Preserves bound implementations from existing test files.
 */
async function actionGenerate(): Promise<void> {
  await mkdir(TESTS_DIR, { recursive: true });
  const entries = await readdir(IR_DIR);
  const jsonFiles = entries.filter((f) => f.endsWith('.json'));

  for (const file of jsonFiles) {
    if (file.includes('/') || file.includes('\\') || file.includes('..')) {
      console.error(`Skipping IR file with unsafe name: ${file}`);
      continue;
    }
    const irPath = join(IR_DIR, file);
    const json = await readFile(irPath, 'utf-8');
    const feature = deserializeIR(json);
    const specName = basename(file, extname(file));
    const testPath = join(TESTS_DIR, `${specName}.spec.ts`);

    let existingSource = '';
    try {
      existingSource = await readFile(testPath, 'utf-8');
    } catch {
      // File does not yet exist — start with empty source
    }

    const content = generateTests(feature, existingSource);
    await writeFile(testPath, content, 'utf-8');
    console.log(`Generated: ${irPath} → ${testPath}`);
  }

  if (jsonFiles.length === 0) {
    console.log(`No IR files found in ${IR_DIR}`);
  }
}

/**
 * Runs the full pipeline: parse specs, generate tests, then execute vitest.
 * Exits with the vitest process exit code.
 */
async function actionRun(): Promise<void> {
  await actionParse();
  await actionGenerate();

  await new Promise<void>((resolve, reject) => {
    const child = spawn('npx', ['vitest', 'run', TESTS_DIR], {
      stdio: 'inherit',
      shell: false,
    });
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        process.exitCode = code ?? 1;
        resolve();
      }
    });
    child.on('error', reject);
  });
}

/**
 * CLI entry point. Reads --action= from argv and dispatches to the
 * appropriate pipeline action.
 */
async function main(): Promise<void> {
  const actionArg = process.argv.find((a) => a.startsWith('--action='));
  const action = actionArg?.split('=')[1];

  switch (action) {
    case 'parse':
      await actionParse();
      break;
    case 'generate':
      await actionGenerate();
      break;
    case 'run':
      await actionRun();
      break;
    case undefined:
    default:
      console.error(`Unknown action: ${action ?? '(none)'}`);
      console.error('Usage: npx tsx acceptance/pipeline.ts --action=<parse|generate|run>');
      process.exit(1);
  }
}

main().catch((err: unknown) => {
  console.error('Pipeline error:', err);
  process.exit(1);
});
