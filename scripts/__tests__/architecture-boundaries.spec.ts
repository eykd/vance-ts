/**
 * Architecture boundary verification tests.
 *
 * Statically analyses TypeScript imports in src/ to verify that Clean
 * Architecture layer boundaries are respected. These tests mirror the rules
 * enforced by eslint-plugin-boundaries in eslint.config.mjs.
 *
 * Manual ESLint verification commands:
 * ```bash
 * # Verify ESLint catches a domain→infrastructure violation:
 * echo 'import { x } from "../infrastructure/BetterAuthService.js";' > src/domain/_test.ts
 * npx eslint src/domain/_test.ts   # should report boundaries/dependencies error
 * rm src/domain/_test.ts
 *
 * # Verify Node.js import bans still work for all layers:
 * echo 'import fs from "fs";' > src/infrastructure/_test.ts
 * npx eslint src/infrastructure/_test.ts   # should report no-restricted-imports
 * rm src/infrastructure/_test.ts
 * ```
 *
 * @module
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.resolve(__dirname, '..', '..', 'src');

/** Allowed import targets for each layer. */
const ALLOWED_IMPORTS: Record<string, Set<string>> = {
  shared: new Set(['shared']),
  domain: new Set(['domain', 'shared']),
  application: new Set(['domain', 'application', 'shared']),
  infrastructure: new Set(['domain', 'application', 'shared', 'infrastructure']),
  presentation: new Set(['domain', 'application', 'shared', 'presentation']),
  di: new Set(['domain', 'application', 'shared', 'infrastructure', 'presentation', 'di']),
};

const LAYERS = Object.keys(ALLOWED_IMPORTS);

/**
 * Determines the layer for a file path relative to src/.
 *
 * @param relativePath - path relative to src/ (e.g. "domain/entities/User.ts")
 * @returns the layer name or null if not in a known layer
 */
function getLayer(relativePath: string): string | null {
  const firstSegment = relativePath.split(path.sep)[0];
  if (firstSegment === undefined) {
    return null;
  }
  return LAYERS.includes(firstSegment) ? firstSegment : null;
}

/**
 * Extracts relative import paths from a TypeScript source file.
 * Only captures imports starting with "./" or "../" (local imports).
 *
 * @param content - file content to scan
 * @returns array of import specifiers
 */
function extractRelativeImports(content: string): string[] {
  const imports: string[] = [];
  // Match static imports: import ... from "..."  and  import "..."
  const importRegex =
    /(?:import\s+(?:type\s+)?(?:[\s\S]*?)\s+from\s+['"]|import\s+['"])(\.\.?\/[^'"]+)['"]/g;
  let match = importRegex.exec(content);
  while (match !== null) {
    const specifier = match[1];
    if (specifier !== undefined) {
      imports.push(specifier);
    }
    match = importRegex.exec(content);
  }
  // Match re-exports: export ... from "..."
  const exportRegex = /export\s+(?:type\s+)?(?:[\s\S]*?)\s+from\s+['"](\.\.?\/[^'"]+)['"]/g;
  match = exportRegex.exec(content);
  while (match !== null) {
    const specifier = match[1];
    if (specifier !== undefined) {
      imports.push(specifier);
    }
    match = exportRegex.exec(content);
  }
  return imports;
}

/**
 * Resolves an import specifier to a target layer.
 *
 * @param fromFile - absolute path of the importing file
 * @param specifier - the import specifier (e.g. "../infrastructure/Foo.js")
 * @returns the target layer or null if outside src/ layers
 */
function resolveTargetLayer(fromFile: string, specifier: string): string | null {
  const dir = path.dirname(fromFile);
  // Strip .js extension (TypeScript NodeNext uses .js for .ts files)
  const resolved = path.resolve(dir, specifier.replace(/\.js$/, ''));
  const relative = path.relative(srcDir, resolved);
  if (relative.startsWith('..')) {
    return null; // outside src/
  }
  return getLayer(relative);
}

/**
 * Recursively collects all .ts files in a directory, excluding test files.
 *
 * @param dir - directory to scan
 * @returns array of absolute file paths
 */
function collectTsFiles(dir: string): string[] {
  const results: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectTsFiles(fullPath));
    } else if (
      entry.isFile() &&
      entry.name.endsWith('.ts') &&
      !entry.name.endsWith('.spec.ts') &&
      !entry.name.endsWith('.test.ts')
    ) {
      results.push(fullPath);
    }
  }
  return results;
}

/**
 * Describes a boundary violation.
 */
interface Violation {
  /** Source file path relative to src/ */
  file: string;
  /** Source layer */
  from: string;
  /** Target layer */
  to: string;
  /** Import specifier */
  specifier: string;
}

/**
 * Scans all source files in a layer and returns any boundary violations.
 *
 * @param layer - the layer to scan
 * @returns array of violations found
 */
function findViolations(layer: string): Violation[] {
  const allowed = ALLOWED_IMPORTS[layer];
  if (allowed === undefined) {
    return [];
  }
  const layerDir = path.join(srcDir, layer);
  if (!fs.existsSync(layerDir)) {
    return [];
  }
  const files = collectTsFiles(layerDir);
  const violations: Violation[] = [];

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const imports = extractRelativeImports(content);
    for (const specifier of imports) {
      const targetLayer = resolveTargetLayer(file, specifier);
      if (targetLayer !== null && !allowed.has(targetLayer)) {
        violations.push({
          file: path.relative(srcDir, file),
          from: layer,
          to: targetLayer,
          specifier,
        });
      }
    }
  }
  return violations;
}

describe('architecture boundaries', () => {
  it('domain/ only imports from domain/ and shared/', () => {
    const violations = findViolations('domain');
    expect(violations, formatViolations(violations)).toEqual([]);
  });

  it('application/ only imports from domain/, application/, and shared/', () => {
    const violations = findViolations('application');
    expect(violations, formatViolations(violations)).toEqual([]);
  });

  it('shared/ only imports from shared/ (no upward dependencies)', () => {
    const violations = findViolations('shared');
    expect(violations, formatViolations(violations)).toEqual([]);
  });

  it('infrastructure/ does not import from presentation/ or di/', () => {
    const violations = findViolations('infrastructure');
    expect(violations, formatViolations(violations)).toEqual([]);
  });

  it('presentation/ does not import from infrastructure/ or di/', () => {
    const violations = findViolations('presentation');
    expect(violations, formatViolations(violations)).toEqual([]);
  });
});

/**
 * Formats violations into a readable error message.
 *
 * @param violations - array of violations to format
 * @returns formatted string
 */
function formatViolations(violations: Violation[]): string {
  if (violations.length === 0) {
    return '';
  }
  return (
    'Boundary violations found:\n' +
    violations.map((v) => `  ${v.file}: ${v.from} → ${v.to} (${v.specifier})`).join('\n')
  );
}
