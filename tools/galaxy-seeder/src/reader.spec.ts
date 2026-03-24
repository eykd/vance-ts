/**
 * Tests for the galaxy seeder file reader.
 *
 * @module reader.spec
 */

import { vi, describe, it, expect, beforeEach } from 'vitest';

import { guardOutputDir, readMetadata, readRoutes, readSystems } from './reader.js';

vi.mock('node:fs/promises');

describe('guardOutputDir', () => {
  it('should resolve a relative path to absolute', () => {
    const result = guardOutputDir('relative/path');
    expect(result).toMatch(/^\//);
    expect(result).toContain('relative/path');
  });

  it('should normalize dot-dot segments within a valid path', () => {
    const result = guardOutputDir('/safe/nested/../output');
    expect(result).toBe('/safe/output');
  });

  it('should return the resolved absolute path for a clean input', () => {
    const result = guardOutputDir('/clean/galaxy/output');
    expect(result).toBe('/clean/galaxy/output');
  });
});

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

describe('readRoutes', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should read and parse routes.json from the given directory', async () => {
    const { readFile } = await import('node:fs/promises');
    const fakeRoutes = {
      routes: [
        {
          originId: 'aaa',
          destinationId: 'bbb',
          cost: 3.5,
          path: [
            [10, 20],
            [11, 21],
          ],
        },
      ],
    };
    vi.mocked(readFile).mockResolvedValueOnce(JSON.stringify(fakeRoutes));

    const result = await readRoutes('/galaxy/out');

    expect(readFile).toHaveBeenCalledWith('/galaxy/out/routes.json', 'utf-8');
    expect(result).toEqual(fakeRoutes);
  });
});

describe('readSystems', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should read all .json files from the systems/ subdirectory', async () => {
    const { readFile, readdir } = await import('node:fs/promises');
    const systemA = { id: 'aaa', name: 'Alpha' };
    const systemB = { id: 'bbb', name: 'Beta' };

    vi.mocked(readdir).mockResolvedValueOnce(['aaa.json', 'bbb.json'] as never);
    vi.mocked(readFile)
      .mockResolvedValueOnce(JSON.stringify(systemA))
      .mockResolvedValueOnce(JSON.stringify(systemB));

    const result = await readSystems('/galaxy/out');

    expect(readdir).toHaveBeenCalledWith('/galaxy/out/systems');
    expect(readFile).toHaveBeenCalledWith('/galaxy/out/systems/aaa.json', 'utf-8');
    expect(readFile).toHaveBeenCalledWith('/galaxy/out/systems/bbb.json', 'utf-8');
    expect(result).toEqual(expect.arrayContaining([systemA, systemB]));
    expect(result).toHaveLength(2);
  });

  it('should filter out non-json files', async () => {
    const { readFile, readdir } = await import('node:fs/promises');
    const system = { id: 'ccc', name: 'Gamma' };

    vi.mocked(readdir).mockResolvedValueOnce(['ccc.json', '.DS_Store', 'readme.txt'] as never);
    vi.mocked(readFile).mockResolvedValueOnce(JSON.stringify(system));

    const result = await readSystems('/galaxy/out');

    expect(readFile).toHaveBeenCalledTimes(1);
    expect(readFile).toHaveBeenCalledWith('/galaxy/out/systems/ccc.json', 'utf-8');
    expect(result).toEqual([system]);
  });

  it('should respect concurrency limit', async () => {
    const { readFile, readdir } = await import('node:fs/promises');

    // Create 150 files to exceed MAX_CONCURRENCY of 100
    const fileNames = Array.from(
      { length: 150 },
      (_, i) => `sys-${String(i).padStart(3, '0')}.json`
    );
    const systems = fileNames.map((_, i) => ({ id: `id-${i}`, name: `System ${i}` }));

    vi.mocked(readdir).mockResolvedValueOnce(fileNames as never);

    let concurrentReads = 0;
    let maxConcurrentReads = 0;

    vi.mocked(readFile).mockImplementation(async (filePath) => {
      concurrentReads++;
      if (concurrentReads > maxConcurrentReads) {
        maxConcurrentReads = concurrentReads;
      }
      // Simulate async I/O delay
      await new Promise((resolve) => {
        setTimeout(resolve, 1);
      });
      concurrentReads--;

      const idx = fileNames.findIndex((f) => (filePath as string).endsWith(f));
      return JSON.stringify(systems[idx]);
    });

    const result = await readSystems('/galaxy/out');

    expect(result).toHaveLength(150);
    expect(maxConcurrentReads).toBeLessThanOrEqual(100);
    expect(maxConcurrentReads).toBeGreaterThan(1);
  });

  it('should return an empty array when no json files exist', async () => {
    const { readdir } = await import('node:fs/promises');
    vi.mocked(readdir).mockResolvedValueOnce([] as never);

    const result = await readSystems('/galaxy/out');

    expect(result).toEqual([]);
  });
});
