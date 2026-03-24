/**
 * Tests for the galaxy seeder CLI entry point.
 *
 * @module index.spec
 */

import { main, parseArgs } from './index.js';

// ─── Tests: parseArgs ────────────────────────────────────────────────────────

describe('parseArgs', () => {
  it('parses --input as required argument', () => {
    const result = parseArgs(['--input', '/path/to/galaxy-output']);

    expect(result.ok).toBe(true);
    expect((result as { ok: true; args: { input: string } }).args.input).toBe(
      '/path/to/galaxy-output'
    );
  });
});

// ─── Tests: main ─────────────────────────────────────────────────────────────

describe('main', () => {
  it('should export a main function that returns a promise resolving to a number', async () => {
    const result = await main([]);
    expect(typeof result).toBe('number');
  });
});
