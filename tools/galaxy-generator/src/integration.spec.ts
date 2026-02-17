/**
 * Integration test for the full galaxy generation pipeline.
 *
 * Runs the complete pipeline (without mocks) with a small star limit to verify
 * end-to-end correctness: determinism, output file structure, and data integrity.
 *
 * @module integration.spec
 */

import * as fs from 'fs/promises';
import * as path from 'path';

import type { PipelineConfig } from './config';
import type { PipelineResult } from './pipeline';
import { runPipeline } from './pipeline';

// ─── Fixtures ───────────────────────────────────────────────────────────────

const TEST_OUTPUT_DIR = path.join(__dirname, '..', '.test-output-integration');

/**
 * Creates a small pipeline config suitable for integration testing.
 *
 * Uses a star limit of 50 and small oikumene count to keep execution fast.
 *
 * @param seed - deterministic seed value
 * @returns complete pipeline config
 */
function makeSmallConfig(seed: string): PipelineConfig {
  return {
    seed,
    output: TEST_OUTPUT_DIR,
    galaxy: {
      center: [0, 0] as readonly [number, number],
      size: [4000, 4000] as readonly [number, number],
      turn: 0,
      deg: 5,
      dynSizeFactor: 1,
      spcFactor: 8,
      arms: 4,
      multiplier: 1,
      limit: 50,
    },
    costMap: {
      padding: 5,
      baseOpenCost: 1,
      openNoiseWeight: 2,
      baseWallCost: 15,
      wallNoiseWeight: 15,
      baseNoiseFrequency: 0.03,
      baseNoiseOctaves: 4,
      wallNoiseFrequency: 0.05,
      wallNoiseOctaves: 3,
      caFillProbability: 0.45,
      caIterations: 5,
    },
    oikumene: {
      coreExclusionRadius: 10,
      clusterRadius: 50,
      targetCount: 5,
    },
    route: { maxRange: 80 },
    densityRadius: 25,
  };
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Reads and parses a JSON file from the output directory.
 *
 * @param filename - file name relative to output directory
 * @returns parsed JSON content
 */
async function readOutputJson(filename: string): Promise<unknown> {
  const content = await fs.readFile(path.join(TEST_OUTPUT_DIR, filename), 'utf-8');
  return JSON.parse(content);
}

/**
 * Checks if a file exists in the output directory.
 *
 * @param filename - file name relative to output directory
 * @returns true if the file exists
 */
async function outputFileExists(filename: string): Promise<boolean> {
  try {
    await fs.access(path.join(TEST_OUTPUT_DIR, filename));
    return true;
  } catch {
    return false;
  }
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('Galaxy Generation Integration', () => {
  let result: PipelineResult;

  beforeAll(async () => {
    result = await runPipeline(makeSmallConfig('integration-test-seed'));
  }, 60000);

  afterAll(async () => {
    await fs.rm(TEST_OUTPUT_DIR, { recursive: true, force: true });
  });

  describe('output file structure', () => {
    it('creates metadata.json', async () => {
      expect(await outputFileExists('metadata.json')).toBe(true);
    });

    it('creates costmap.png', async () => {
      expect(await outputFileExists('costmap.png')).toBe(true);
    });

    it('creates costmap.bin', async () => {
      expect(await outputFileExists('costmap.bin')).toBe(true);
    });

    it('creates routes.json', async () => {
      expect(await outputFileExists('routes.json')).toBe(true);
    });

    it('creates systems/ directory with per-system JSON files', async () => {
      const systemsDir = path.join(TEST_OUTPUT_DIR, 'systems');
      const files = await fs.readdir(systemsDir);
      expect(files.length).toBeGreaterThan(0);
      for (const file of files) {
        expect(file).toMatch(/\.json$/);
      }
    });

    it('creates one JSON file per system', async () => {
      const systemsDir = path.join(TEST_OUTPUT_DIR, 'systems');
      const files = await fs.readdir(systemsDir);
      expect(files.length).toBe(result.systems.length);
    });
  });

  describe('metadata.json content', () => {
    it('contains the seed value', async () => {
      const metadata = (await readOutputJson('metadata.json')) as Record<string, unknown>;
      expect(metadata['seed']).toBe('integration-test-seed');
    });

    it('contains generatedAt timestamp', async () => {
      const metadata = (await readOutputJson('metadata.json')) as Record<string, unknown>;
      expect(typeof metadata['generatedAt']).toBe('string');
      expect(metadata['generatedAt']).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it('contains galaxy config parameters', async () => {
      const metadata = (await readOutputJson('metadata.json')) as Record<string, unknown>;
      const galaxyConfig = metadata['galaxyConfig'] as Record<string, unknown>;
      expect(galaxyConfig).toBeDefined();
      expect(galaxyConfig['arms']).toBe(4);
      expect(galaxyConfig['limit']).toBe(50);
    });

    it('contains cost map config with quantization and tunable parameters', async () => {
      const metadata = (await readOutputJson('metadata.json')) as Record<string, unknown>;
      const costMapConfig = metadata['costMapConfig'] as Record<string, unknown>;
      expect(costMapConfig).toBeDefined();
      expect(costMapConfig['quantization']).toBe('uint8_linear');
      expect(typeof costMapConfig['gridWidth']).toBe('number');
      expect(typeof costMapConfig['gridHeight']).toBe('number');
      expect(costMapConfig['padding']).toBe(5);
      expect(costMapConfig['baseOpenCost']).toBe(1);
      expect(costMapConfig['openNoiseWeight']).toBe(2);
      expect(costMapConfig['baseWallCost']).toBe(15);
      expect(costMapConfig['wallNoiseWeight']).toBe(15);
    });

    it('contains perlin config', async () => {
      const metadata = (await readOutputJson('metadata.json')) as Record<string, unknown>;
      const perlinConfig = metadata['perlinConfig'] as Record<string, unknown>;
      expect(perlinConfig).toBeDefined();
      const baseLayer = perlinConfig['baseLayer'] as Record<string, unknown>;
      expect(baseLayer['frequency']).toBe(0.03);
      expect(baseLayer['octaves']).toBe(4);
    });

    it('contains cellular automata config', async () => {
      const metadata = (await readOutputJson('metadata.json')) as Record<string, unknown>;
      const caConfig = metadata['caConfig'] as Record<string, unknown>;
      expect(caConfig).toBeDefined();
      expect(caConfig['fillProbability']).toBe(0.45);
      expect(caConfig['iterations']).toBe(5);
    });

    it('contains oikumene config', async () => {
      const metadata = (await readOutputJson('metadata.json')) as Record<string, unknown>;
      const oikumeneConfig = metadata['oikumeneConfig'] as Record<string, unknown>;
      expect(oikumeneConfig).toBeDefined();
      expect(oikumeneConfig['coreExclusionRadius']).toBe(10);
      expect(oikumeneConfig['clusterRadius']).toBe(50);
      expect(oikumeneConfig['targetCount']).toBe(5);
    });

    it('contains route config', async () => {
      const metadata = (await readOutputJson('metadata.json')) as Record<string, unknown>;
      const routeConfig = metadata['routeConfig'] as Record<string, unknown>;
      expect(routeConfig).toBeDefined();
      expect(routeConfig['maxRange']).toBe(80);
    });

    it('contains density radius', async () => {
      const metadata = (await readOutputJson('metadata.json')) as Record<string, unknown>;
      expect(metadata['densityRadius']).toBe(25);
    });

    it('contains generation statistics', async () => {
      const metadata = (await readOutputJson('metadata.json')) as Record<string, unknown>;
      const stats = metadata['stats'] as Record<string, unknown>;
      expect(stats).toBeDefined();
      expect(typeof stats['totalSystems']).toBe('number');
      expect(typeof stats['oikumeneSystems']).toBe('number');
      expect(typeof stats['beyondSystems']).toBe('number');
      expect(typeof stats['oikumeneRoutes']).toBe('number');
    });
  });

  describe('system generation', () => {
    it('generates unique star systems at integer coordinates', () => {
      const seen = new Set<string>();
      for (const system of result.systems) {
        expect(Number.isInteger(system.x)).toBe(true);
        expect(Number.isInteger(system.y)).toBe(true);
        const key = `${String(system.x)},${String(system.y)}`;
        expect(seen.has(key)).toBe(false);
        seen.add(key);
      }
    });

    it('generates systems with unique IDs', () => {
      const ids = new Set(result.systems.map((s) => s.id));
      expect(ids.size).toBe(result.systems.length);
    });

    it('generates systems with unique names', () => {
      const names = new Set(result.systems.map((s) => s.name));
      expect(names.size).toBe(result.systems.length);
    });

    it('each system has complete attribute structure', () => {
      for (const system of result.systems) {
        expect(system.id).toBeDefined();
        expect(system.name).toBeDefined();
        expect(typeof system.isOikumene).toBe('boolean');
        expect(system.classification).toBeDefined();
        expect(system.density).toBeDefined();
        expect(system.attributes).toBeDefined();
        expect(system.planetary).toBeDefined();
        expect(system.civilization).toBeDefined();
        expect(Array.isArray(system.tradeCodes)).toBe(true);
        expect(system.economics).toBeDefined();
      }
    });

    it('system JSON files match in-memory systems', async () => {
      const firstSystem = result.systems[0]!;
      const fileContent = await readOutputJson(`systems/${firstSystem.id}.json`);
      const fileSystem = fileContent as Record<string, unknown>;
      expect(fileSystem['id']).toBe(firstSystem.id);
      expect(fileSystem['name']).toBe(firstSystem.name);
      expect(fileSystem['x']).toBe(firstSystem.x);
      expect(fileSystem['y']).toBe(firstSystem.y);
    });
  });

  describe('cost map output', () => {
    it('costmap.png starts with PNG magic bytes', async () => {
      const buffer = await fs.readFile(path.join(TEST_OUTPUT_DIR, 'costmap.png'));
      // PNG files start with the 8-byte signature: 137 80 78 71 13 10 26 10
      expect(buffer[0]).toBe(137);
      expect(buffer[1]).toBe(80); // P
      expect(buffer[2]).toBe(78); // N
      expect(buffer[3]).toBe(71); // G
    });

    it('costmap.bin has correct size matching grid dimensions', async () => {
      const metadata = (await readOutputJson('metadata.json')) as Record<string, unknown>;
      const costMapConfig = metadata['costMapConfig'] as Record<string, unknown>;
      const expectedSize =
        (costMapConfig['gridWidth'] as number) * (costMapConfig['gridHeight'] as number);
      const buffer = await fs.readFile(path.join(TEST_OUTPUT_DIR, 'costmap.bin'));
      expect(buffer.length).toBe(expectedSize);
    });
  });

  describe('routes output', () => {
    it('routes.json contains a routes array', async () => {
      const routesFile = (await readOutputJson('routes.json')) as Record<string, unknown>;
      expect(Array.isArray(routesFile['routes'])).toBe(true);
    });

    it('each route has originId, destinationId, cost, and path', async () => {
      const routesFile = (await readOutputJson('routes.json')) as Record<string, unknown>;
      const routes = routesFile['routes'] as Array<Record<string, unknown>>;
      for (const route of routes) {
        expect(typeof route['originId']).toBe('string');
        expect(typeof route['destinationId']).toBe('string');
        expect(typeof route['cost']).toBe('number');
        expect(Array.isArray(route['path'])).toBe(true);
      }
    });

    it('route paths contain [x, y] coordinate tuples', async () => {
      const routesFile = (await readOutputJson('routes.json')) as Record<string, unknown>;
      const routes = routesFile['routes'] as Array<Record<string, unknown>>;
      if (routes.length > 0) {
        const firstRoute = routes[0]!;
        const routePath = firstRoute['path'] as number[][];
        expect(routePath.length).toBeGreaterThan(0);
        for (const point of routePath) {
          expect(point).toHaveLength(2);
          expect(typeof point[0]).toBe('number');
          expect(typeof point[1]).toBe('number');
        }
      }
    });
  });

  describe('determinism', () => {
    it('same seed produces identical results', async () => {
      const secondOutputDir = path.join(__dirname, '..', '.test-output-determinism');
      const config2 = { ...makeSmallConfig('integration-test-seed'), output: secondOutputDir };

      try {
        const result2 = await runPipeline(config2);

        // Same number of systems
        expect(result2.systems.length).toBe(result.systems.length);

        // Same system IDs in same order
        const ids1 = result.systems.map((s) => s.id);
        const ids2 = result2.systems.map((s) => s.id);
        expect(ids2).toEqual(ids1);

        // Same system names in same order
        const names1 = result.systems.map((s) => s.name);
        const names2 = result2.systems.map((s) => s.name);
        expect(names2).toEqual(names1);

        // Same coordinates
        const coords1 = result.systems.map((s) => [s.x, s.y]);
        const coords2 = result2.systems.map((s) => [s.x, s.y]);
        expect(coords2).toEqual(coords1);

        // Same route count
        expect(result2.routes.length).toBe(result.routes.length);

        // Same stats
        expect(result2.stats).toEqual(result.stats);

        // Binary-identical costmap
        const bin1 = await fs.readFile(path.join(TEST_OUTPUT_DIR, 'costmap.bin'));
        const bin2 = await fs.readFile(path.join(secondOutputDir, 'costmap.bin'));
        expect(Buffer.compare(bin1, bin2)).toBe(0);
      } finally {
        await fs.rm(secondOutputDir, { recursive: true, force: true });
      }
    }, 60000);

    it('different seed produces different results', async () => {
      const secondOutputDir = path.join(__dirname, '..', '.test-output-different');
      const config2 = { ...makeSmallConfig('different-seed-value'), output: secondOutputDir };

      try {
        const result2 = await runPipeline(config2);

        // Should have different system IDs (UUIDs derived from different PRNG state)
        const ids1 = result.systems.map((s) => s.id);
        const ids2 = result2.systems.map((s) => s.id);
        expect(ids2).not.toEqual(ids1);
      } finally {
        await fs.rm(secondOutputDir, { recursive: true, force: true });
      }
    }, 60000);
  });

  describe('pipeline result', () => {
    it('returns stage timings for all 7 stages', () => {
      expect(result.stageTimings).toHaveLength(7);
      for (const timing of result.stageTimings) {
        expect(timing.name.length).toBeGreaterThan(0);
        expect(timing.durationMs).toBeGreaterThanOrEqual(0);
      }
    });

    it('returns consistent stats', () => {
      const { stats } = result;
      expect(stats.totalSystems).toBe(result.systems.length);
      expect(stats.oikumeneSystems + stats.beyondSystems).toBe(stats.totalSystems);
      expect(stats.beyondUninhabited + stats.beyondLostColonies + stats.beyondHiddenEnclaves).toBe(
        stats.beyondSystems
      );
      expect(stats.oikumeneRoutes).toBe(result.routes.length);
    });
  });
});
