import { basename, extname } from 'path';

import type { Feature } from './types.js';

/**
 * Safe indexed access returning empty string for out-of-bounds positions.
 *
 * Consolidates the `arr[i] ?? ''` pattern required by `noUncheckedIndexedAccess`
 * into a single location instead of scattering `c8 ignore next` comments.
 *
 * @param source - The array to index into.
 * @param index - The position to access.
 * @returns The element at `index`, or `''` if out of bounds.
 */
export function at(source: readonly string[], index: number): string {
  return source[index] ?? ''; /* c8 ignore next */
}

/**
 * Sentinel string placed in generated stub it() blocks.
 * If a block contains this string, it has not yet been bound to a real
 * implementation and will be regenerated on the next pipeline run.
 */
export const UnboundSentinel = 'throw new Error("acceptance test not yet bound")';

/** Regex matching `^it("desc",\s+` with double-quoted description. */
const IT_PREFIX_DOUBLE = /^it\("((?:[^"\\]|\\.)+)",\s+/;
/** Regex matching `^it('desc',\s+` with single-quoted description. */
const IT_PREFIX_SINGLE = /^it\('((?:[^'\\]|\\.)+)',\s+/;
/** Pattern matching the callback opening — supports both sync and async. */
const CALLBACK_SUFFIX_RE = /^(async )?(\(\) => \{)/;

/**
 * Matches an `it()` line with an optional vitest options object.
 *
 * Uses balanced-brace counting so options objects with nested braces
 * (e.g. `{ onFailure: () => {} }`) are handled correctly.
 *
 * @param line - A single line of source code.
 * @returns The test description (unescaped) and total match length, or null.
 */
export function matchItLine(line: string): { description: string; matchLength: number } | null {
  const prefix = IT_PREFIX_DOUBLE.exec(line) ?? IT_PREFIX_SINGLE.exec(line);
  if (prefix === null) {
    return null;
  }
  const description = at(prefix, 1).replace(/\\(.)/g, '$1');
  let pos = prefix[0].length;

  // Optional vitest options object: { ... },\s*
  if (line[pos] === '{') {
    let depth = 1;
    pos++;
    while (pos < line.length && depth > 0) {
      const ch = line[pos];
      if (ch === '{') {
        depth++;
      } else if (ch === '}') {
        depth--;
      }
      pos++;
    }
    if (depth !== 0) {
      return null;
    }
    const commaAndSpace = /^,\s*/.exec(line.slice(pos));
    if (commaAndSpace === null) {
      return null;
    }
    pos += commaAndSpace[0].length;
  }

  // Must end with the callback opening (sync or async)
  const suffixMatch = CALLBACK_SUFFIX_RE.exec(line.slice(pos));
  if (suffixMatch === null) {
    return null;
  }

  return { description, matchLength: pos + suffixMatch[0].length };
}

/**
 * Scans the source text of a generated test file and extracts all it() blocks
 * that have been bound to real implementations (i.e. do NOT contain the
 * UnboundSentinel). Unbound stubs are skipped.
 *
 * Only top-level it() calls (no leading whitespace) are recognised.
 *
 * The brace counter handles basic string literal detection to avoid counting
 * braces inside strings. Template literals (backtick strings) are tracked as
 * opaque strings: braces inside `${}` expressions within a template literal
 * are not counted correctly if those expressions contain nested string literals
 * (e.g. `` `value: ${"a" + "b"}` ``). This is a known limitation. Generated
 * test files do not produce this pattern in practice.
 *
 * @param source - The full text of the existing generated test file.
 * @returns A Map from test description to the full it() block text.
 */
export function extractBoundFunctions(source: string): Map<string, string> {
  const result = new Map<string, string>();
  const lines = source.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = at(lines, i);
    const match = matchItLine(line);

    if (match !== null) {
      const { description } = match;
      const startLine = i;
      let depth = 1; // matchItLine matched through the opening `{` of the callback
      let endLine = -1;
      let inString: string | null = null;

      outer: for (let j = startLine; j < lines.length; j++) {
        const scanLine = at(lines, j);
        const startK = j === startLine ? match.matchLength : 0;
        for (let k = startK; k < scanLine.length; k++) {
          const ch = scanLine.charAt(k);
          const next = scanLine[k + 1];

          if (inString !== null) {
            if (ch === '\\') {
              k++; // skip escaped char
            } else if (ch === inString) {
              inString = null;
            }
          } else if (ch === '"' || ch === "'" || ch === '`') {
            inString = ch;
          } else if (ch === '/' && next === '/') {
            break; // rest of line is a comment
          } else if (ch === '{') {
            depth++;
          } else if (ch === '}') {
            depth--;
            if (depth === 0) {
              endLine = j;
              break outer;
            }
          }
        }
      }

      /* v8 ignore next -- endLine always >= 0 for well-formed generated test files */
      if (endLine >= 0) {
        const block = lines.slice(startLine, endLine + 1).join('\n');
        if (!block.includes(UnboundSentinel)) {
          result.set(description, block);
        }
        i = endLine + 1;
        continue;
      }
    }

    i++;
  }

  return result;
}

/** Standard import specifiers that are always emitted by the generator. */
const STANDARD_IMPORT_SOURCES = new Set(['"cloudflare:test"', '"vitest"', '"./helpers"']);

/**
 * Extracts non-standard import lines from an existing generated test file.
 *
 * Standard imports (cloudflare:test, vitest, ./helpers) are always emitted by
 * the generator and are therefore excluded. Any other `import` line is
 * considered custom and will be preserved across regeneration.
 *
 * @param source - The full text of the existing generated test file.
 * @returns An array of custom import lines.
 */
export function extractCustomImports(source: string): string[] {
  if (source === '') {
    return [];
  }
  const importLines = source.split('\n').filter((line) => /^import\s/.test(line));
  return importLines.filter((line) => {
    const fromMatch = /from\s+("[^"]+"|'[^']+')/.exec(line);
    if (fromMatch === null) {
      return true; // side-effect import — always custom
    }
    const specifier = at(fromMatch, 1).replace(/'/g, '"');
    return !STANDARD_IMPORT_SOURCES.has(specifier);
  });
}

/**
 * Converts a string to a safe JavaScript identifier by replacing
 * non-alphanumeric sequences with underscores and lowercasing.
 *
 * @param desc - The string to sanitize.
 * @returns A safe lowercase identifier string.
 */
export function sanitizeFuncName(desc: string): string {
  return desc
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase();
}

/**
 * Generates the content of a Vitest test file from a Feature IR.
 *
 * Bound implementations (it() blocks not containing the UnboundSentinel) are
 * preserved verbatim from the existing source. Unbound stubs are regenerated
 * from the current scenario list. Orphaned bound functions (those whose
 * description no longer matches any scenario) are appended with a warning
 * comment.
 *
 * @param feature - The parsed Feature IR.
 * @param existingSource - The current content of the test file (empty string if the file does not yet exist).
 * @returns The full content of the generated test file.
 */
export function generateTests(feature: Feature, existingSource: string): string {
  const boundFunctions = extractBoundFunctions(existingSource);
  const customImports = extractCustomImports(existingSource);
  const specName = basename(feature.sourceFile, extname(feature.sourceFile));

  const lines: string[] = [];

  // Header
  lines.push(
    '// Code generated by acceptance-pipeline. Stubs are regenerated; bound implementations are preserved.'
  );
  lines.push(`// Source: ${feature.sourceFile.replace(/[\r\n]/g, '')}`);
  lines.push('');

  // Imports
  lines.push('import { SELF } from "cloudflare:test";');
  lines.push('import { describe, it, expect } from "vitest";');
  lines.push('');
  lines.push(
    'import { extractSessionCookie, get, getAuthForm, post, signInAs, submitAuthForm } from "./helpers";'
  );
  for (const customImport of customImports) {
    lines.push(customImport);
  }
  lines.push('');

  // Describe block opening
  lines.push(`describe("${specName.replace(/"/g, '\\"')}", () => {`);
  lines.push('');

  const emittedDescriptions = new Set<string>();

  for (const scenario of feature.scenarios) {
    const { description, line, steps } = scenario;

    // Scenario comment header
    lines.push(`// ${description.replace(/[\r\n]/g, '')}`);
    lines.push(`// Source: ${feature.sourceFile.replace(/[\r\n]/g, '')}:${line}`);

    const boundBlock = boundFunctions.get(description);
    if (boundBlock !== undefined) {
      // Preserved bound implementation
      lines.push(boundBlock);
    } else {
      // Generate stub
      const stepComments = steps.map(
        (s) => `  // ${s.keyword.replace(/[\r\n]/g, '')} ${s.text.replace(/[\r\n]/g, '')}`
      );
      lines.push(`it("${description.replace(/"/g, '\\"')}", async () => {`);
      for (const comment of stepComments) {
        lines.push(comment);
      }
      lines.push('');
      lines.push(`  ${UnboundSentinel};`);
      lines.push('});');
    }

    lines.push('');
    emittedDescriptions.add(description);
  }

  // Emit orphaned bound functions
  for (const [desc, block] of boundFunctions) {
    if (!emittedDescriptions.has(desc)) {
      lines.push('// WARNING: orphaned bound function');
      lines.push(block);
      lines.push('');
    }
  }

  lines.push('}); // end describe');

  return lines.join('\n') + '\n';
}
