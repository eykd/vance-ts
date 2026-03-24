/**
 * Tests for the galaxy seeder file reader.
 *
 * @module reader.spec
 */

import { vi, describe, it, expect, beforeEach } from 'vitest';

import { readMetadata } from './reader.js';

vi.mock('node:fs/promises');

describe('readMetadata', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should read and parse metadata.json from the given directory', async () => {
    const { readFile } = await import('node:fs/promises');
    const fakeMetadata = {
      seed: 'test-seed',
      generatedAt: '2026-01-01T00:00:00Z',
      stats: { totalSystems: 42 },
    };
    vi.mocked(readFile).mockResolvedValueOnce(JSON.stringify(fakeMetadata));

    const result = await readMetadata('/some/output');

    expect(readFile).toHaveBeenCalledWith('/some/output/metadata.json', 'utf-8');
    expect(result).toEqual(fakeMetadata);
  });
});
