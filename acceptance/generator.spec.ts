import { describe, expect, it } from 'vitest';

import {
  UnboundSentinel,
  extractBoundFunctions,
  extractCustomImports,
  generateTests,
  sanitizeFuncName,
} from './generator.js';
import type { Feature } from './types.js';

describe('sanitizeFuncName', () => {
  it('converts spaces and punctuation to underscores', () => {
    expect(sanitizeFuncName('Author creates the node.')).toBe('author_creates_the_node');
  });

  it('removes leading and trailing underscores', () => {
    expect(sanitizeFuncName('...hello...')).toBe('hello');
  });

  it('lowercases the result', () => {
    expect(sanitizeFuncName('UPPER CASE')).toBe('upper_case');
  });

  it('collapses multiple non-alphanumeric sequences to single underscore', () => {
    expect(sanitizeFuncName('a -- b')).toBe('a_b');
  });

  it('handles empty string', () => {
    expect(sanitizeFuncName('')).toBe('');
  });

  it('handles alphanumeric only', () => {
    expect(sanitizeFuncName('hello123')).toBe('hello123');
  });
});

describe('extractBoundFunctions', () => {
  it('returns empty map for empty source', () => {
    const result = extractBoundFunctions('');
    expect(result.size).toBe(0);
  });

  it('does not preserve a stub containing the unbound sentinel', () => {
    const source = `it("my test", async () => {\n  ${UnboundSentinel};\n});`;
    const result = extractBoundFunctions(source);
    expect(result.has('my test')).toBe(false);
  });

  it('preserves a bound implementation that does not contain the sentinel', () => {
    const source = `it("my test", async () => {\n  expect(1).toBe(1);\n});`;
    const result = extractBoundFunctions(source);
    expect(result.has('my test')).toBe(true);
    expect(result.get('my test')).toBe(source);
  });

  it('extracts the correct description from the it() call', () => {
    const source = `it("User registers successfully.", async () => {\n  expect(true).toBe(true);\n});`;
    const result = extractBoundFunctions(source);
    expect(result.has('User registers successfully.')).toBe(true);
  });

  it('preserves multiple bound functions from one source', () => {
    const source = [
      `it("first test.", async () => {`,
      `  expect(1).toBe(1);`,
      `});`,
      ``,
      `it("second test.", async () => {`,
      `  expect(2).toBe(2);`,
      `});`,
    ].join('\n');
    const result = extractBoundFunctions(source);
    expect(result.size).toBe(2);
    expect(result.has('first test.')).toBe(true);
    expect(result.has('second test.')).toBe(true);
  });

  it('handles nested braces in the body', () => {
    const source = [
      `it("nested braces.", async () => {`,
      `  const obj = { key: 'value' };`,
      `  expect(obj.key).toBe('value');`,
      `});`,
    ].join('\n');
    const result = extractBoundFunctions(source);
    expect(result.has('nested braces.')).toBe(true);
  });

  it('ignores it() calls that are indented (inside other blocks)', () => {
    const source = `describe("outer", () => {\n  it("inner test.", async () => {\n    expect(1).toBe(1);\n  });\n});`;
    const result = extractBoundFunctions(source);
    // "inner test." is indented, not at line start
    expect(result.has('inner test.')).toBe(false);
  });

  it('handles escaped characters inside string literals without miscounting braces', () => {
    // The string "it\"s ok" contains a backslash-escaped quote — the parser
    // must skip the escaped char so it does not close the string early.
    const source = [
      `it("escaped char test.", async () => {`,
      `  const s = "it\\"s ok";`,
      `  expect(s).toBeTruthy();`,
      `});`,
    ].join('\n');
    const result = extractBoundFunctions(source);
    expect(result.has('escaped char test.')).toBe(true);
  });

  it('stops scanning a line at a // comment when counting braces', () => {
    // Ensure the // comment break path is exercised.
    const source = [
      `it("comment break test.", async () => {`,
      `  const x = 1; // { this brace should be ignored`,
      `  expect(x).toBe(1);`,
      `});`,
    ].join('\n');
    const result = extractBoundFunctions(source);
    expect(result.has('comment break test.')).toBe(true);
  });

  it('preserves a bound implementation with single-quoted description', () => {
    const source = `it('my test', async () => {\n  expect(1).toBe(1);\n});`;
    const result = extractBoundFunctions(source);
    expect(result.has('my test')).toBe(true);
    expect(result.get('my test')).toBe(source);
  });

  it('recognizes it() with a vitest options object before the callback', () => {
    const source = [
      `it("Rate-limited user.", { timeout: 30_000 }, async () => {`,
      `  expect(1).toBe(1);`,
      `});`,
    ].join('\n');
    const result = extractBoundFunctions(source);
    expect(result.has('Rate-limited user.')).toBe(true);
    expect(result.get('Rate-limited user.')).toBe(source);
  });

  it('preserves a bound implementation with apostrophe in double-quoted description', () => {
    const source = `it("User's profile.", async () => {\n  expect(1).toBe(1);\n});`;
    const result = extractBoundFunctions(source);
    expect(result.has("User's profile.")).toBe(true);
    expect(result.get("User's profile.")).toBe(source);
  });

  it('preserves a bound function whose description contains escaped double quotes', () => {
    // generateTests escapes " to \" in it() descriptions.
    // extractBoundFunctions must match and unescape so the map key
    // matches the unescaped Feature IR description.
    const source = `it("User enters \\"hello\\".", async () => {\n  expect(1).toBe(1);\n});`;
    const result = extractBoundFunctions(source);
    expect(result.has('User enters "hello".')).toBe(true);
    expect(result.get('User enters "hello".')).toBe(source);
  });
});

describe('extractCustomImports', () => {
  it('returns empty array for empty source', () => {
    expect(extractCustomImports('')).toEqual([]);
  });

  it('excludes standard cloudflare:test import', () => {
    const source = 'import { SELF } from "cloudflare:test";';
    expect(extractCustomImports(source)).toEqual([]);
  });

  it('excludes standard vitest import', () => {
    const source = 'import { describe, it, expect } from "vitest";';
    expect(extractCustomImports(source)).toEqual([]);
  });

  it('excludes standard helpers import', () => {
    const source =
      'import { extractSessionCookie, get, getAuthForm, post, signInAs, submitAuthForm } from "./helpers";';
    expect(extractCustomImports(source)).toEqual([]);
  });

  it('preserves custom import lines', () => {
    const source = [
      'import { SELF } from "cloudflare:test";',
      'import { describe, it, expect } from "vitest";',
      'import { myHelper } from "./custom-helpers";',
    ].join('\n');
    expect(extractCustomImports(source)).toEqual([
      'import { myHelper } from "./custom-helpers";',
    ]);
  });

  it('preserves side-effect imports without a from clause', () => {
    const source = 'import "./setup";';
    expect(extractCustomImports(source)).toEqual(['import "./setup";']);
  });

  it('handles single-quoted standard imports', () => {
    const source = "import { SELF } from 'cloudflare:test';";
    expect(extractCustomImports(source)).toEqual([]);
  });
});

describe('generateTests', () => {
  const emptyFeature: Feature = {
    sourceFile: 'specs/acceptance-specs/US01-my-feature.txt',
    scenarios: [],
  };

  it('generates the standard file header', () => {
    const output = generateTests(emptyFeature, '');
    expect(output).toContain(
      '// Code generated by acceptance-pipeline. Stubs are regenerated; bound implementations are preserved.'
    );
    expect(output).toContain('// Source: specs/acceptance-specs/US01-my-feature.txt');
  });

  it('generates correct imports', () => {
    const output = generateTests(emptyFeature, '');
    expect(output).toContain('import { SELF } from "cloudflare:test";');
    expect(output).toContain('import { describe, it, expect } from "vitest";');
  });

  it('derives the describe name from the sourceFile basename without extension', () => {
    const output = generateTests(emptyFeature, '');
    expect(output).toContain('describe("US01-my-feature", () => {');
    expect(output).toContain('}); // end describe');
  });

  it('generates a stub for an unbound scenario', () => {
    const feature: Feature = {
      sourceFile: 'specs/acceptance-specs/US01.txt',
      scenarios: [
        {
          description: 'Author creates the node.',
          line: 2,
          steps: [
            { keyword: 'GIVEN', text: 'an empty outline.', line: 3 },
            { keyword: 'WHEN', text: 'a node is added.', line: 4 },
            { keyword: 'THEN', text: 'one node exists.', line: 5 },
          ],
        },
      ],
    };
    const output = generateTests(feature, '');
    expect(output).toContain('// Author creates the node.');
    expect(output).toContain('// Source: specs/acceptance-specs/US01.txt:2');
    expect(output).toContain('it("Author creates the node.", async () => {');
    expect(output).toContain('  // GIVEN an empty outline.');
    expect(output).toContain('  // WHEN a node is added.');
    expect(output).toContain('  // THEN one node exists.');
    expect(output).toContain(UnboundSentinel);
  });

  it('preserves a bound implementation for a matching scenario', () => {
    const feature: Feature = {
      sourceFile: 'specs/acceptance-specs/US01.txt',
      scenarios: [
        {
          description: 'Author creates the node.',
          line: 2,
          steps: [],
        },
      ],
    };
    const boundImpl = `it("Author creates the node.", async () => {\n  expect(1).toBe(1);\n});`;
    const existingSource = `// some header\n${boundImpl}`;
    const output = generateTests(feature, existingSource);
    expect(output).toContain(boundImpl);
    expect(output).not.toContain(UnboundSentinel);
  });

  it('round-trips a bound implementation whose description contains escaped double quotes', () => {
    const feature: Feature = {
      sourceFile: 'specs/US01.txt',
      scenarios: [{ description: 'User enters "hello".', line: 2, steps: [] }],
    };
    const boundImpl = `it("User enters \\"hello\\".", async () => {\n  expect(1).toBe(1);\n});`;
    const existingSource = `// header\n${boundImpl}`;
    const output = generateTests(feature, existingSource);
    expect(output).toContain(boundImpl);
    expect(output).not.toContain('throw new Error');
  });

  it('emits orphaned bound functions with a warning comment', () => {
    const feature: Feature = {
      sourceFile: 'specs/acceptance-specs/US01.txt',
      scenarios: [{ description: 'Current scenario.', line: 2, steps: [] }],
    };
    const orphanedImpl = `it("Old removed scenario.", async () => {\n  expect(1).toBe(1);\n});`;
    const existingSource = orphanedImpl;
    const output = generateTests(feature, existingSource);
    expect(output).toContain('// WARNING: orphaned bound function');
    expect(output).toContain(orphanedImpl);
  });

  it('generates source location comment before each it() block', () => {
    const feature: Feature = {
      sourceFile: 'specs/acceptance-specs/US05-example.txt',
      scenarios: [{ description: 'Something happens.', line: 7, steps: [] }],
    };
    const output = generateTests(feature, '');
    expect(output).toContain('// Source: specs/acceptance-specs/US05-example.txt:7');
  });

  it('escapes double-quotes in description to prevent string breakout', () => {
    const feature: Feature = {
      sourceFile: 'specs/US01.txt',
      scenarios: [
        {
          description: 'User enters "hello".',
          line: 2,
          steps: [],
        },
      ],
    };
    const output = generateTests(feature, '');
    expect(output).toContain('it("User enters \\"hello\\".", async () => {');
  });

  it('strips newlines from sourceFile in file header comment', () => {
    const feature: Feature = {
      sourceFile: 'specs/US01.txt\nevil code',
      scenarios: [],
    };
    const output = generateTests(feature, '');
    expect(output).not.toContain('\nevil code');
  });

  it('escapes double-quotes in sourceFile basename in describe block', () => {
    const feature: Feature = {
      sourceFile: 'specs/US01-foo"bar.txt',
      scenarios: [],
    };
    const output = generateTests(feature, '');
    expect(output).toContain('describe("US01-foo\\"bar", () => {');
  });

  it('strips newlines from step keyword and text in step comments', () => {
    const feature: Feature = {
      sourceFile: 'specs/US01.txt',
      scenarios: [
        {
          description: 'Something.',
          line: 2,
          steps: [{ keyword: 'GIVEN\nevil', text: 'step\nevil', line: 3 }],
        },
      ],
    };
    const output = generateTests(feature, '');
    expect(output).not.toContain('GIVEN\nevil');
    expect(output).not.toContain('step\nevil');
  });

  it('output ends with a trailing newline', () => {
    const output = generateTests(emptyFeature, '');
    expect(output.endsWith('\n')).toBe(true);
  });

  it('includes helper imports in generated output', () => {
    const feature: Feature = {
      sourceFile: 'specs/US03.txt',
      scenarios: [
        {
          description: 'User registers.',
          line: 2,
          steps: [],
        },
      ],
    };
    const output = generateTests(feature, '');
    expect(output).toContain(
      'import { extractSessionCookie, get, getAuthForm, post, signInAs, submitAuthForm } from "./helpers";'
    );
  });

  it('preserves custom import lines from existing source', () => {
    const feature: Feature = {
      sourceFile: 'specs/US03.txt',
      scenarios: [
        {
          description: 'User registers.',
          line: 2,
          steps: [],
        },
      ],
    };
    const existingSource = [
      '// Code generated by acceptance-pipeline. Stubs are regenerated; bound implementations are preserved.',
      '// Source: specs/US03.txt',
      '',
      'import { SELF } from "cloudflare:test";',
      'import { describe, it, expect } from "vitest";',
      '',
      'import { extractSessionCookie, get, getAuthForm, post, signInAs, submitAuthForm } from "./helpers";',
      'import { myCustomHelper } from "./custom-helpers";',
      '',
      'describe("US03", () => {',
      '',
      'it("User registers.", async () => {',
      `  ${UnboundSentinel};`,
      '});',
      '',
      '}); // end describe',
    ].join('\n');
    const output = generateTests(feature, existingSource);
    expect(output).toContain('import { myCustomHelper } from "./custom-helpers";');
  });
});
