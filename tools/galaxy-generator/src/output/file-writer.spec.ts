import * as fs from 'fs/promises';
import * as path from 'path';

import type { Route, StarSystem, Classification } from '../../../../src/domain/galaxy/types';

import {
  writeGalaxyOutput,
  buildMetadata,
  encodeCostmapPng,
  serializeRoutes,
  type GalaxyOutputInput,
} from './file-writer';

/** Mock encode function for fast-png. */
const mockEncode = jest.fn((): Uint8Array => new Uint8Array([137, 80, 78, 71]));
jest.mock('fs/promises');
jest.mock('fast-png', () => ({
  encode: (...args: unknown[]): Uint8Array => mockEncode(...args),
}));

const mockFs = fs as jest.Mocked<typeof fs>;

/**
 * Creates a minimal star system for testing.
 *
 * @param overrides - partial fields to override defaults
 * @returns complete StarSystem
 */
function makeSystem(overrides: Partial<StarSystem> = {}): StarSystem {
  return {
    id: 'sys-001',
    name: 'TestStar',
    x: 10,
    y: 20,
    isOikumene: true,
    classification: 'oikumene' as Classification,
    density: { neighborCount: 5, environmentPenalty: 0.2 },
    attributes: { technology: 8, environment: 6, resources: 7 },
    planetary: { size: 5, atmosphere: 6, temperature: 7, hydrography: 4 },
    civilization: { population: 7, starport: 4, government: 3, factions: 2, lawLevel: 5 },
    tradeCodes: ['Ag', 'Ri'],
    economics: {
      gurpsTechLevel: 10,
      perCapitaIncome: 25000,
      grossWorldProduct: 1e12,
      resourceMultiplier: 1.2,
      worldTradeNumber: 4.5,
    },
    ...overrides,
  };
}

/**
 * Creates a minimal route for testing.
 *
 * @param overrides - partial fields to override defaults
 * @returns complete Route
 */
function makeRoute(overrides: Partial<Route> = {}): Route {
  return {
    originId: 'sys-001',
    destinationId: 'sys-002',
    cost: 42.5,
    path: [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
    ],
    ...overrides,
  };
}

/**
 * Creates a complete GalaxyOutputInput for testing.
 *
 * @param overrides - partial fields to override defaults
 * @returns complete GalaxyOutputInput
 */
function makeInput(overrides: Partial<GalaxyOutputInput> = {}): GalaxyOutputInput {
  return {
    outputDir: '/tmp/galaxy-output',
    systems: [makeSystem()],
    routes: [makeRoute()],
    costmapData: new Uint8Array([0, 128, 255, 64]),
    costmapWidth: 2,
    costmapHeight: 2,
    galaxyConfig: {
      center: [0, 0] as readonly [number, number],
      size: [4000, 4000] as readonly [number, number],
      turn: 0,
      deg: 5,
      dynSizeFactor: 1,
      spcFactor: 8,
      arms: 4,
      multiplier: 1,
      limit: null,
      seed: 'test-seed',
    },
    costMapConfig: {
      gridOriginX: -410,
      gridOriginY: -410,
      gridWidth: 820,
      gridHeight: 820,
      padding: 10,
      minCost: 1,
      maxCost: 100,
      baseOpenCost: 5,
      openNoiseWeight: 0.3,
      baseWallCost: 80,
      wallNoiseWeight: 0.2,
    },
    perlinConfig: {
      baseLayer: { frequency: 0.01, octaves: 4 },
      wallLayer: { frequency: 0.02, octaves: 3 },
    },
    caConfig: {
      fillProbability: 0.45,
      iterations: 5,
      rule: 'B5678/S45678',
    },
    oikumeneConfig: {
      coreExclusionRadius: 50,
      clusterRadius: 30,
      targetCount: 100,
    },
    routeConfig: {
      maxRange: 200,
    },
    stats: {
      totalSystems: 1,
      oikumeneSystems: 1,
      beyondSystems: 0,
      beyondUninhabited: 0,
      beyondLostColonies: 0,
      beyondHiddenEnclaves: 0,
      oikumeneRoutes: 1,
      averageRouteCost: 42.5,
    },
    generatedAt: '2026-01-15T12:00:00.000Z',
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockFs.mkdir.mockResolvedValue(undefined);
  mockFs.rm.mockResolvedValue(undefined);
  mockFs.writeFile.mockResolvedValue(undefined);
});

describe('buildMetadata', () => {
  it('includes seed from galaxy config', () => {
    const input = makeInput();

    const metadata = buildMetadata(input);

    expect(metadata.seed).toBe('test-seed');
  });

  it('includes generatedAt timestamp', () => {
    const input = makeInput({ generatedAt: '2026-02-01T00:00:00.000Z' });

    const metadata = buildMetadata(input);

    expect(metadata.generatedAt).toBe('2026-02-01T00:00:00.000Z');
  });

  it('includes galaxy config without seed', () => {
    const input = makeInput();

    const metadata = buildMetadata(input);

    expect(metadata.galaxyConfig).toEqual({
      center: [0, 0],
      size: [4000, 4000],
      turn: 0,
      deg: 5,
      dynSizeFactor: 1,
      spcFactor: 8,
      arms: 4,
      multiplier: 1,
      limit: null,
    });
  });

  it('includes cost map config with quantization type', () => {
    const input = makeInput();

    const metadata = buildMetadata(input);

    expect(metadata.costMapConfig).toEqual({
      gridOriginX: -410,
      gridOriginY: -410,
      gridWidth: 820,
      gridHeight: 820,
      minCost: 1,
      maxCost: 100,
      quantization: 'uint8_linear',
    });
  });

  it('includes perlin config', () => {
    const input = makeInput();

    const metadata = buildMetadata(input);

    expect(metadata.perlinConfig).toEqual({
      baseLayer: { frequency: 0.01, octaves: 4 },
      wallLayer: { frequency: 0.02, octaves: 3 },
    });
  });

  it('includes cellular automata config', () => {
    const input = makeInput();

    const metadata = buildMetadata(input);

    expect(metadata.caConfig).toEqual({
      fillProbability: 0.45,
      iterations: 5,
      rule: 'B5678/S45678',
    });
  });

  it('includes oikumene config', () => {
    const input = makeInput();

    const metadata = buildMetadata(input);

    expect(metadata.oikumeneConfig).toEqual({
      coreExclusionRadius: 50,
      clusterRadius: 30,
      targetCount: 100,
    });
  });

  it('includes route config', () => {
    const input = makeInput();

    const metadata = buildMetadata(input);

    expect(metadata.routeConfig).toEqual({
      maxRange: 200,
    });
  });

  it('includes generation stats', () => {
    const input = makeInput();

    const metadata = buildMetadata(input);

    expect(metadata.stats).toEqual({
      totalSystems: 1,
      oikumeneSystems: 1,
      beyondSystems: 0,
      beyondUninhabited: 0,
      beyondLostColonies: 0,
      beyondHiddenEnclaves: 0,
      oikumeneRoutes: 1,
      averageRouteCost: 42.5,
    });
  });
});

describe('encodeCostmapPng', () => {
  it('calls encode with correct width and height', () => {
    const data = new Uint8Array([0, 128, 255, 64]);

    encodeCostmapPng(data, 2, 2);

    expect(mockEncode).toHaveBeenCalledWith({
      width: 2,
      height: 2,
      data,
      depth: 8,
      channels: 1,
    });
  });

  it('returns the encoded buffer', () => {
    const expected = new Uint8Array([1, 2, 3]);
    mockEncode.mockReturnValueOnce(expected);

    const result = encodeCostmapPng(new Uint8Array([0]), 1, 1);

    expect(result).toBe(expected);
  });
});

describe('serializeRoutes', () => {
  it('converts Coordinate objects to [x, y] tuples', () => {
    const routes = [
      makeRoute({
        path: [
          { x: 5, y: 10 },
          { x: 15, y: 20 },
        ],
      }),
    ];

    const result = serializeRoutes(routes);

    expect(result.routes[0]?.path).toEqual([
      [5, 10],
      [15, 20],
    ]);
  });

  it('preserves originId and destinationId', () => {
    const routes = [makeRoute({ originId: 'a', destinationId: 'b' })];

    const result = serializeRoutes(routes);

    expect(result.routes[0]?.originId).toBe('a');
    expect(result.routes[0]?.destinationId).toBe('b');
  });

  it('preserves cost', () => {
    const routes = [makeRoute({ cost: 99.9 })];

    const result = serializeRoutes(routes);

    expect(result.routes[0]?.cost).toBe(99.9);
  });

  it('handles empty routes array', () => {
    const result = serializeRoutes([]);

    expect(result.routes).toEqual([]);
  });

  it('handles multiple routes', () => {
    const routes = [
      makeRoute({ originId: 'a', destinationId: 'b' }),
      makeRoute({ originId: 'c', destinationId: 'd' }),
    ];

    const result = serializeRoutes(routes);

    expect(result.routes).toHaveLength(2);
  });
});

describe('writeGalaxyOutput', () => {
  describe('directory management', () => {
    it('cleans output directory before writing', async () => {
      const input = makeInput();

      await writeGalaxyOutput(input);

      expect(mockFs.rm).toHaveBeenCalledWith('/tmp/galaxy-output', {
        recursive: true,
        force: true,
      });
    });

    it('creates output directory with recursive option', async () => {
      const input = makeInput();

      await writeGalaxyOutput(input);

      expect(mockFs.mkdir).toHaveBeenCalledWith('/tmp/galaxy-output', { recursive: true });
    });

    it('creates systems subdirectory with recursive option', async () => {
      const input = makeInput();

      await writeGalaxyOutput(input);

      expect(mockFs.mkdir).toHaveBeenCalledWith(path.join('/tmp/galaxy-output', 'systems'), {
        recursive: true,
      });
    });

    it('cleans before creating directories', async () => {
      const callOrder: string[] = [];
      mockFs.rm.mockImplementation(() => {
        callOrder.push('rm');
        return Promise.resolve();
      });
      mockFs.mkdir.mockImplementation(() => {
        callOrder.push('mkdir');
        return Promise.resolve(undefined);
      });
      const input = makeInput();

      await writeGalaxyOutput(input);

      expect(callOrder[0]).toBe('rm');
      expect(callOrder[1]).toBe('mkdir');
    });
  });

  describe('metadata.json', () => {
    it('writes metadata.json to output directory', async () => {
      const input = makeInput();

      await writeGalaxyOutput(input);

      const metadataCall = mockFs.writeFile.mock.calls.find(
        (call) => call[0] === path.join('/tmp/galaxy-output', 'metadata.json')
      );
      expect(metadataCall).toBeDefined();
    });

    it('writes valid JSON content', async () => {
      const input = makeInput();

      await writeGalaxyOutput(input);

      const metadataCall = mockFs.writeFile.mock.calls.find(
        (call) => call[0] === path.join('/tmp/galaxy-output', 'metadata.json')
      );
      const content = metadataCall?.[1] as string;
      const parsed = JSON.parse(content) as Record<string, unknown>;
      expect(parsed['seed']).toBe('test-seed');
    });

    it('writes indented JSON for readability', async () => {
      const input = makeInput();

      await writeGalaxyOutput(input);

      const metadataCall = mockFs.writeFile.mock.calls.find(
        (call) => call[0] === path.join('/tmp/galaxy-output', 'metadata.json')
      );
      const content = metadataCall?.[1] as string;
      expect(content).toContain('\n');
    });
  });

  describe('costmap.png', () => {
    it('writes costmap.png to output directory', async () => {
      const input = makeInput();

      await writeGalaxyOutput(input);

      const pngCall = mockFs.writeFile.mock.calls.find(
        (call) => call[0] === path.join('/tmp/galaxy-output', 'costmap.png')
      );
      expect(pngCall).toBeDefined();
    });

    it('writes encoded PNG buffer', async () => {
      const pngBuffer = new Uint8Array([137, 80, 78, 71, 13, 10]);
      mockEncode.mockReturnValueOnce(pngBuffer);
      const input = makeInput();

      await writeGalaxyOutput(input);

      const pngCall = mockFs.writeFile.mock.calls.find(
        (call) => call[0] === path.join('/tmp/galaxy-output', 'costmap.png')
      );
      expect(pngCall?.[1]).toBe(pngBuffer);
    });

    it('encodes with correct dimensions and data', async () => {
      const costmapData = new Uint8Array([10, 20, 30, 40, 50, 60]);
      const input = makeInput({ costmapData, costmapWidth: 3, costmapHeight: 2 });

      await writeGalaxyOutput(input);

      expect(mockEncode).toHaveBeenCalledWith({
        width: 3,
        height: 2,
        data: costmapData,
        depth: 8,
        channels: 1,
      });
    });
  });

  describe('costmap.bin', () => {
    it('writes costmap.bin to output directory', async () => {
      const input = makeInput();

      await writeGalaxyOutput(input);

      const binCall = mockFs.writeFile.mock.calls.find(
        (call) => call[0] === path.join('/tmp/galaxy-output', 'costmap.bin')
      );
      expect(binCall).toBeDefined();
    });

    it('writes raw uint8 array data', async () => {
      const costmapData = new Uint8Array([0, 128, 255]);
      const input = makeInput({ costmapData, costmapWidth: 3, costmapHeight: 1 });

      await writeGalaxyOutput(input);

      const binCall = mockFs.writeFile.mock.calls.find(
        (call) => call[0] === path.join('/tmp/galaxy-output', 'costmap.bin')
      );
      expect(binCall?.[1]).toBe(costmapData);
    });
  });

  describe('routes.json', () => {
    it('writes routes.json to output directory', async () => {
      const input = makeInput();

      await writeGalaxyOutput(input);

      const routesCall = mockFs.writeFile.mock.calls.find(
        (call) => call[0] === path.join('/tmp/galaxy-output', 'routes.json')
      );
      expect(routesCall).toBeDefined();
    });

    it('writes routes with path as [x,y] tuples', async () => {
      const input = makeInput({
        routes: [
          makeRoute({
            path: [
              { x: 3, y: 4 },
              { x: 5, y: 6 },
            ],
          }),
        ],
      });

      await writeGalaxyOutput(input);

      const routesCall = mockFs.writeFile.mock.calls.find(
        (call) => call[0] === path.join('/tmp/galaxy-output', 'routes.json')
      );
      const content = routesCall?.[1] as string;
      const parsed = JSON.parse(content) as { routes: Array<{ path: number[][] }> };
      expect(parsed.routes[0]?.path).toEqual([
        [3, 4],
        [5, 6],
      ]);
    });

    it('writes indented JSON', async () => {
      const input = makeInput();

      await writeGalaxyOutput(input);

      const routesCall = mockFs.writeFile.mock.calls.find(
        (call) => call[0] === path.join('/tmp/galaxy-output', 'routes.json')
      );
      const content = routesCall?.[1] as string;
      expect(content).toContain('\n');
    });
  });

  describe('individual system files', () => {
    it('writes each system to systems/<id>.json', async () => {
      const input = makeInput({
        systems: [makeSystem({ id: 'alpha' }), makeSystem({ id: 'beta' })],
      });

      await writeGalaxyOutput(input);

      const alphaCall = mockFs.writeFile.mock.calls.find(
        (call) => call[0] === path.join('/tmp/galaxy-output', 'systems', 'alpha.json')
      );
      const betaCall = mockFs.writeFile.mock.calls.find(
        (call) => call[0] === path.join('/tmp/galaxy-output', 'systems', 'beta.json')
      );
      expect(alphaCall).toBeDefined();
      expect(betaCall).toBeDefined();
    });

    it('writes valid JSON for each system', async () => {
      const system = makeSystem({ id: 'test-sys', name: 'Sol' });
      const input = makeInput({ systems: [system] });

      await writeGalaxyOutput(input);

      const sysCall = mockFs.writeFile.mock.calls.find(
        (call) => call[0] === path.join('/tmp/galaxy-output', 'systems', 'test-sys.json')
      );
      const content = sysCall?.[1] as string;
      const parsed = JSON.parse(content) as Record<string, unknown>;
      expect(parsed['id']).toBe('test-sys');
      expect(parsed['name']).toBe('Sol');
    });

    it('writes indented JSON for system files', async () => {
      const input = makeInput({ systems: [makeSystem()] });

      await writeGalaxyOutput(input);

      const sysCall = mockFs.writeFile.mock.calls.find(
        (call) =>
          typeof call[0] === 'string' && call[0].includes('systems') && call[0].endsWith('.json')
      );
      const content = sysCall?.[1] as string;
      expect(content).toContain('\n');
    });

    it('handles empty systems array', async () => {
      const input = makeInput({ systems: [] });

      await writeGalaxyOutput(input);

      const sysCalls = mockFs.writeFile.mock.calls.filter(
        (call) => typeof call[0] === 'string' && call[0].includes('systems')
      );
      expect(sysCalls).toHaveLength(0);
    });
  });

  describe('concurrency limiter', () => {
    it('limits concurrent writes for many systems', async () => {
      let activeConcurrency = 0;
      let maxConcurrency = 0;

      mockFs.writeFile.mockImplementation(async () => {
        activeConcurrency++;
        if (activeConcurrency > maxConcurrency) {
          maxConcurrency = activeConcurrency;
        }
        // Simulate async work
        await new Promise((resolve) => {
          setTimeout(resolve, 1);
        });
        activeConcurrency--;
      });

      const systems = Array.from({ length: 200 }, (_, i) =>
        makeSystem({ id: `sys-${String(i).padStart(4, '0')}` })
      );
      const input = makeInput({ systems });

      await writeGalaxyOutput(input);

      // The concurrency limiter caps at 100 concurrent writes.
      // Total writes = 200 systems + 4 other files = 204
      // We check that max concurrency never exceeded the limit.
      expect(maxConcurrency).toBeLessThanOrEqual(100);
      expect(maxConcurrency).toBeGreaterThan(1);
    });

    it('writes all system files despite concurrency limit', async () => {
      const systems = Array.from({ length: 150 }, (_, i) =>
        makeSystem({ id: `sys-${String(i).padStart(4, '0')}` })
      );
      const input = makeInput({ systems });

      await writeGalaxyOutput(input);

      const sysCalls = mockFs.writeFile.mock.calls.filter(
        (call) => typeof call[0] === 'string' && call[0].includes('systems')
      );
      expect(sysCalls).toHaveLength(150);
    });
  });

  describe('error handling', () => {
    it('propagates write errors', async () => {
      mockFs.writeFile.mockRejectedValueOnce(new Error('ENOSPC: no space left'));
      const input = makeInput();

      await expect(writeGalaxyOutput(input)).rejects.toThrow('ENOSPC: no space left');
    });

    it('propagates mkdir errors', async () => {
      mockFs.mkdir.mockRejectedValueOnce(new Error('EACCES: permission denied'));
      const input = makeInput();

      await expect(writeGalaxyOutput(input)).rejects.toThrow('EACCES: permission denied');
    });
  });

  describe('uses async fs operations', () => {
    it('uses fs.promises.writeFile for all writes', async () => {
      const input = makeInput({ systems: [makeSystem(), makeSystem({ id: 'sys-002' })] });

      await writeGalaxyOutput(input);

      // metadata.json + costmap.png + costmap.bin + routes.json + 2 systems = 6 writes
      expect(mockFs.writeFile).toHaveBeenCalledTimes(6);
    });
  });
});
