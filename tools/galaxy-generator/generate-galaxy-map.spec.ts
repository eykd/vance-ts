/**
 * Tests for the generate-galaxy-map standalone CLI.
 */
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

import type { Mocked } from 'vitest';

import type { StarSystem } from '../../src/domain/galaxy/types';

import { main, readAllSystems } from './generate-galaxy-map';

/** Mock encode function for fast-png. */
vi.mock('fast-png', () => ({
  encode: (): Uint8Array => new Uint8Array([137, 80, 78, 71]),
}));
vi.mock('node:fs/promises');

const mockFs = fs as Mocked<typeof fs>;

/** Minimal GalaxyMetadata for testing (only the fields we use). */
const MOCK_METADATA = {
  costMapConfig: {
    gridOriginX: -10,
    gridOriginY: -20,
    gridWidth: 100,
    gridHeight: 80,
    // other fields not needed by generate-galaxy-map
  },
};

/**
 * Creates a minimal StarSystem for testing.
 *
 * @returns partial StarSystem with required fields for rendering
 */
function makeMockSystem(): Partial<StarSystem> {
  return {
    id: 'sys-001',
    name: 'TestStar',
    x: 5,
    y: 10,
    classification: 'oikumene' as StarSystem['classification'],
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockFs.writeFile.mockResolvedValue(undefined);

  // Default readFile: metadata.json returns MOCK_METADATA, system files return a system
  mockFs.readFile.mockImplementation((p): Promise<string> => {
    const filePath = p as string;
    if (filePath.endsWith('metadata.json')) {
      return Promise.resolve(JSON.stringify(MOCK_METADATA));
    }
    return Promise.resolve(JSON.stringify(makeMockSystem()));
  });

  // Default readdir: return 2 system files
  (mockFs.readdir as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([
    'sys-001.json',
    'sys-002.json',
  ]);
});

describe('readAllSystems', () => {
  it('reads all json files from the systems/ subdirectory', async () => {
    (mockFs.readdir as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([
      'sys-001.json',
      'sys-002.json',
      'sys-003.json',
    ]);

    const systems = await readAllSystems('/some/dir');

    expect(systems).toHaveLength(3);
    expect(mockFs.readFile).toHaveBeenCalledTimes(3);
  });

  it('skips files that do not end with .json', async () => {
    (mockFs.readdir as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([
      'sys-001.json',
      'README.md',
      '.gitkeep',
    ]);

    const systems = await readAllSystems('/some/dir');

    expect(systems).toHaveLength(1);
  });

  it('reads system files from the correct path', async () => {
    (mockFs.readdir as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(['alpha.json']);

    await readAllSystems('/my/output');

    expect(mockFs.readFile).toHaveBeenCalledWith(
      path.join('/my/output', 'systems', 'alpha.json'),
      'utf-8'
    );
  });

  it('returns an empty array when no json files exist', async () => {
    (mockFs.readdir as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    const systems = await readAllSystems('/empty/dir');

    expect(systems).toHaveLength(0);
  });
});

describe('main', () => {
  it('uses galaxy-output as the default output directory', async () => {
    await main([]);

    expect(mockFs.readFile).toHaveBeenCalledWith(
      path.join('galaxy-output', 'metadata.json'),
      'utf-8'
    );
  });

  it('uses the --output argument when provided', async () => {
    await main(['--output', '/custom/path']);

    expect(mockFs.readFile).toHaveBeenCalledWith(
      path.join('/custom/path', 'metadata.json'),
      'utf-8'
    );
  });

  it('writes galaxy-map.png to the output directory', async () => {
    await main(['--output', '/test/output']);

    const writeCall = mockFs.writeFile.mock.calls.find(
      (call) => typeof call[0] === 'string' && call[0].endsWith('galaxy-map.png')
    );
    expect(writeCall).toBeDefined();
    expect(writeCall?.[0]).toBe(path.join('/test/output', 'galaxy-map.png'));
  });

  it('writes PNG magic bytes to galaxy-map.png', async () => {
    await main([]);

    const writeCall = mockFs.writeFile.mock.calls.find(
      (call) => typeof call[0] === 'string' && call[0].endsWith('galaxy-map.png')
    );
    const content = writeCall?.[1] as Uint8Array;
    expect(content[0]).toBe(137);
    expect(content[1]).toBe(80);
    expect(content[2]).toBe(78);
    expect(content[3]).toBe(71);
  });

  it('reads all systems from the systems subdirectory', async () => {
    (mockFs.readdir as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(['a.json', 'b.json']);

    await main(['--output', '/out']);

    expect(mockFs.readdir).toHaveBeenCalledWith(path.join('/out', 'systems'));
  });
});
