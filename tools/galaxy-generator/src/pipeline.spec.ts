/**
 * Tests for the pipeline orchestrator.
 *
 * @module pipeline.spec
 */

import type { Prng } from '../../../src/domain/galaxy/prng';
import type {
  Classification,
  Coordinate,
  Route,
  StarSystem,
} from '../../../src/domain/galaxy/types';

import type { PipelineConfig } from './config';
import type { CostMap } from './costmap/cost-composer';
import { generateCostMap } from './costmap/costmap-generator';
import { generateGalaxy } from './galaxy/galaxy-generator';
import type { GalaxyOutputInput } from './output/file-writer';
import { writeGalaxyOutput } from './output/file-writer';
import { extractErrorMessage, hashSeed, runPipeline, type PipelineLogger } from './pipeline';
import { buildRoutes } from './routing/route-builder';
import type { ClassificationResult } from './systems/classification';
import { classifySystems } from './systems/classification';
import { calculateDensity } from './systems/density';
import { buildSystems } from './systems/system-builder';

// ─── Mocks ──────────────────────────────────────────────────────────────────

jest.mock('./galaxy/galaxy-generator', () => ({
  generateGalaxy: jest.fn(),
}));

jest.mock('./costmap/costmap-generator', () => ({
  generateCostMap: jest.fn(),
}));

jest.mock('./systems/density', () => ({
  calculateDensity: jest.fn(),
}));

jest.mock('./systems/classification', () => ({
  classifySystems: jest.fn(),
}));

jest.mock('./systems/system-builder', () => ({
  buildSystems: jest.fn(),
}));

jest.mock('./routing/route-builder', () => ({
  buildRoutes: jest.fn(),
}));

jest.mock('./output/file-writer', () => ({
  writeGalaxyOutput: jest.fn(),
}));

const mockGenerateGalaxy = generateGalaxy as jest.MockedFunction<typeof generateGalaxy>;
const mockGenerateCostMap = generateCostMap as jest.MockedFunction<typeof generateCostMap>;
const mockCalculateDensity = calculateDensity as jest.MockedFunction<typeof calculateDensity>;
const mockClassifySystems = classifySystems as jest.MockedFunction<typeof classifySystems>;
const mockBuildSystems = buildSystems as jest.MockedFunction<typeof buildSystems>;
const mockBuildRoutes = buildRoutes as jest.MockedFunction<typeof buildRoutes>;
const mockWriteGalaxyOutput = writeGalaxyOutput as jest.MockedFunction<typeof writeGalaxyOutput>;

// ─── Fixtures ───────────────────────────────────────────────────────────────

const COORDS: Coordinate[] = [
  { x: 10, y: 20 },
  { x: 30, y: 40 },
  { x: 50, y: 60 },
];

const COST_MAP: CostMap = {
  data: new Uint8Array([0, 1, 2, 3]),
  width: 2,
  height: 2,
  quantization: {
    minCost: 1,
    maxCost: 30,
    gridOriginX: 0,
    gridOriginY: 0,
    gridWidth: 2,
    gridHeight: 2,
  },
};

const CLASSIFICATIONS: ClassificationResult[] = [
  { index: 0, classification: 'oikumene' as Classification, isOikumene: true },
  { index: 1, classification: 'uninhabited' as Classification, isOikumene: false },
  { index: 2, classification: 'oikumene' as Classification, isOikumene: true },
];

const DENSITIES = [
  { neighborCount: 5, environmentPenalty: -1 },
  { neighborCount: 0, environmentPenalty: 0 },
  { neighborCount: 12, environmentPenalty: -3 },
];

const SYSTEMS: StarSystem[] = [
  {
    id: 'sys-1',
    name: 'Alpha',
    x: 10,
    y: 20,
    isOikumene: true,
    classification: 'oikumene' as Classification,
    density: { neighborCount: 5, environmentPenalty: -1 },
    attributes: { technology: 2, environment: 1, resources: 0 },
    planetary: { size: 6, atmosphere: 5, temperature: 7, hydrography: 4 },
    civilization: { population: 8, starport: 3, government: 4, factions: 2, lawLevel: 5 },
    tradeCodes: ['Ag', 'Ri'],
    economics: {
      gurpsTechLevel: 10,
      perCapitaIncome: 25000,
      grossWorldProduct: 1e12,
      resourceMultiplier: 1.2,
      worldTradeNumber: 4.5,
    },
  },
  {
    id: 'sys-2',
    name: 'Beta',
    x: 30,
    y: 40,
    isOikumene: false,
    classification: 'uninhabited' as Classification,
    density: { neighborCount: 0, environmentPenalty: 0 },
    attributes: { technology: -3, environment: -1, resources: 2 },
    planetary: { size: 3, atmosphere: 0, temperature: 2, hydrography: 0 },
    civilization: { population: 0, starport: 0, government: 0, factions: 0, lawLevel: 0 },
    tradeCodes: ['Ba'],
    economics: {
      gurpsTechLevel: 5,
      perCapitaIncome: 0,
      grossWorldProduct: 0,
      resourceMultiplier: 0.5,
      worldTradeNumber: 0,
    },
  },
  {
    id: 'sys-3',
    name: 'Gamma',
    x: 50,
    y: 60,
    isOikumene: true,
    classification: 'oikumene' as Classification,
    density: { neighborCount: 12, environmentPenalty: -3 },
    attributes: { technology: 1, environment: 0, resources: -1 },
    planetary: { size: 8, atmosphere: 6, temperature: 5, hydrography: 7 },
    civilization: { population: 7, starport: 4, government: 5, factions: 3, lawLevel: 6 },
    tradeCodes: ['In'],
    economics: {
      gurpsTechLevel: 9,
      perCapitaIncome: 20000,
      grossWorldProduct: 5e11,
      resourceMultiplier: 0.8,
      worldTradeNumber: 4.0,
    },
  },
];

const ROUTES: Route[] = [
  {
    originId: 'sys-1',
    destinationId: 'sys-3',
    cost: 15,
    path: [
      { x: 10, y: 20 },
      { x: 30, y: 40 },
      { x: 50, y: 60 },
    ],
  },
];

/**
 * Creates a test pipeline configuration with optional overrides.
 *
 * @param overrides - partial config fields to override defaults
 * @returns complete PipelineConfig for testing
 */
function makeConfig(overrides: Partial<PipelineConfig> = {}): PipelineConfig {
  return {
    seed: 'test-seed',
    output: './test-output/',
    galaxy: {
      center: [0, 0] as readonly [number, number],
      size: [4000, 4000] as readonly [number, number],
      turn: 0,
      deg: 5,
      dynSizeFactor: 1,
      spcFactor: 8,
      arms: 4,
      multiplier: 1,
      limit: null,
    },
    costMap: {
      padding: 10,
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
      coreExclusionRadius: 100,
      clusterRadius: 50,
      targetCount: 250,
    },
    route: { maxRange: 40 },
    densityRadius: 25,
    ...overrides,
  };
}

/**
 * Configures all mock functions with default return values.
 */
function setupDefaultMocks(): void {
  mockGenerateGalaxy.mockReturnValue(COORDS);
  mockGenerateCostMap.mockReturnValue(COST_MAP);
  mockCalculateDensity.mockReturnValue(DENSITIES);
  mockClassifySystems.mockReturnValue(CLASSIFICATIONS);
  mockBuildSystems.mockReturnValue(SYSTEMS);
  mockBuildRoutes.mockReturnValue(ROUTES);
  mockWriteGalaxyOutput.mockResolvedValue(undefined);
}

/**
 * Creates a mock PipelineLogger with jest.fn() methods.
 *
 * @returns logger with mock functions
 */
function makeLogger(): PipelineLogger {
  return {
    stageStart: jest.fn(),
    stageEnd: jest.fn(),
    summary: jest.fn(),
  };
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('extractErrorMessage', () => {
  it('extracts message from an Error instance', () => {
    expect(extractErrorMessage(new Error('boom'))).toBe('boom');
  });

  it('converts non-Error values to string', () => {
    expect(extractErrorMessage('string error')).toBe('string error');
  });

  it('converts number to string', () => {
    expect(extractErrorMessage(42)).toBe('42');
  });

  it('converts null to string', () => {
    expect(extractErrorMessage(null)).toBe('null');
  });
});

describe('hashSeed', () => {
  it('returns a 32-bit integer for a non-empty string', () => {
    const result = hashSeed('test-seed');
    expect(Number.isInteger(result)).toBe(true);
  });

  it('produces deterministic output', () => {
    expect(hashSeed('hello')).toBe(hashSeed('hello'));
  });

  it('produces different values for different strings', () => {
    expect(hashSeed('alpha')).not.toBe(hashSeed('beta'));
  });

  it('handles single-character strings', () => {
    const result = hashSeed('a');
    expect(Number.isInteger(result)).toBe(true);
  });

  it('handles long strings', () => {
    const long = 'a'.repeat(1000);
    const result = hashSeed(long);
    expect(Number.isInteger(result)).toBe(true);
  });
});

describe('runPipeline', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupDefaultMocks();
  });

  describe('successful execution', () => {
    it('runs all 7 stages and returns a result', async () => {
      const result = await runPipeline(makeConfig());

      expect(mockGenerateGalaxy).toHaveBeenCalledTimes(1);
      expect(mockGenerateCostMap).toHaveBeenCalledTimes(1);
      expect(mockCalculateDensity).toHaveBeenCalledTimes(1);
      expect(mockClassifySystems).toHaveBeenCalledTimes(1);
      expect(mockBuildSystems).toHaveBeenCalledTimes(1);
      expect(mockBuildRoutes).toHaveBeenCalledTimes(1);
      expect(mockWriteGalaxyOutput).toHaveBeenCalledTimes(1);
      expect(result).toBeDefined();
    });

    it('returns pipeline results with systems, routes, and stats', async () => {
      const result = await runPipeline(makeConfig());

      expect(result.systems).toBe(SYSTEMS);
      expect(result.routes).toBe(ROUTES);
      expect(result.stats.totalSystems).toBe(3);
      expect(result.stats.oikumeneSystems).toBe(2);
      expect(result.stats.beyondSystems).toBe(1);
      expect(result.stats.oikumeneRoutes).toBe(1);
    });

    it('returns stage timings for all 7 stages', async () => {
      const result = await runPipeline(makeConfig());

      expect(result.stageTimings).toHaveLength(7);
      for (const timing of result.stageTimings) {
        expect(timing.name).toBeDefined();
        expect(typeof timing.durationMs).toBe('number');
        expect(timing.durationMs).toBeGreaterThanOrEqual(0);
      }
    });

    it('returns total elapsed time', async () => {
      const result = await runPipeline(makeConfig());

      expect(typeof result.totalElapsedMs).toBe('number');
      expect(result.totalElapsedMs).toBeGreaterThanOrEqual(0);
    });
  });

  describe('stage argument passing', () => {
    it('passes a PRNG derived from the seed to galaxy generator', async () => {
      await runPipeline(makeConfig());

      const galaxyConfig = mockGenerateGalaxy.mock.calls[0]![0];
      expect(galaxyConfig.rng).toBeDefined();
      expect(typeof galaxyConfig.rng.random).toBe('function');
      expect(typeof galaxyConfig.rng.randint).toBe('function');
    });

    it('passes galaxy config to galaxy generator', async () => {
      const config = makeConfig({ galaxy: { ...makeConfig().galaxy, arms: 6 } });
      await runPipeline(config);

      const galaxyConfig = mockGenerateGalaxy.mock.calls[0]![0];
      expect(galaxyConfig.arms).toBe(6);
      expect(galaxyConfig.center).toEqual([0, 0]);
    });

    it('passes coordinates and costMap config to cost map generator', async () => {
      await runPipeline(makeConfig());

      expect(mockGenerateCostMap).toHaveBeenCalledWith(
        COORDS,
        expect.objectContaining({ padding: 10, baseOpenCost: 1 }),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        expect.objectContaining({ random: expect.any(Function) })
      );
    });

    it('passes coordinates and density config to density calculator', async () => {
      const config = makeConfig({ densityRadius: 30 });
      await runPipeline(config);

      expect(mockCalculateDensity).toHaveBeenCalledWith(
        COORDS,
        expect.objectContaining({ radius: 30 })
      );
    });

    it('passes coordinates, galaxy config, oikumene config, and costMap to classification', async () => {
      await runPipeline(makeConfig());

      expect(mockClassifySystems).toHaveBeenCalledWith(
        COORDS,
        expect.objectContaining({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          oikumene: expect.objectContaining({ targetCount: 250 }),
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          galaxy: expect.objectContaining({ arms: 4 }),
          costMap: COST_MAP,
        }),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        expect.objectContaining({ random: expect.any(Function) })
      );
    });

    it('passes system build input to system builder', async () => {
      await runPipeline(makeConfig());

      expect(mockBuildSystems).toHaveBeenCalledWith(
        expect.objectContaining({
          coordinates: COORDS,
          classifications: CLASSIFICATIONS,
          densities: DENSITIES,
        }),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        expect.objectContaining({ random: expect.any(Function) })
      );
    });

    it('passes oikumene systems, costMap, and route config to route builder', async () => {
      await runPipeline(makeConfig());

      expect(mockBuildRoutes).toHaveBeenCalledWith(
        expect.objectContaining({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          oikumeneSystems: expect.arrayContaining([
            expect.objectContaining({ id: 'sys-1', x: 10, y: 20 }),
            expect.objectContaining({ id: 'sys-3', x: 50, y: 60 }),
          ]),
          costMap: COST_MAP,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          routeConfig: expect.objectContaining({ maxRange: 40 }),
        })
      );
    });

    it('passes correct data to file writer', async () => {
      await runPipeline(makeConfig());

      expect(mockWriteGalaxyOutput).toHaveBeenCalledWith(
        expect.objectContaining({
          outputDir: './test-output/',
          systems: SYSTEMS,
          routes: ROUTES,
          costmapData: COST_MAP.data,
          costmapWidth: COST_MAP.width,
          costmapHeight: COST_MAP.height,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          stats: expect.objectContaining({ totalSystems: 3 }),
        })
      );
    });
  });

  describe('single PRNG instance', () => {
    it('uses the same PRNG instance across all stages that need it', async () => {
      let galaxyRng: Prng | undefined;
      let costMapRng: Prng | undefined;
      let classificationRng: Prng | undefined;
      let buildSystemsRng: Prng | undefined;

      mockGenerateGalaxy.mockImplementation((config) => {
        galaxyRng = config.rng;
        return COORDS;
      });

      mockGenerateCostMap.mockImplementation((_coords, _config, rng) => {
        costMapRng = rng;
        return COST_MAP;
      });

      mockClassifySystems.mockImplementation((_coords, _config, rng) => {
        classificationRng = rng;
        return CLASSIFICATIONS;
      });

      mockBuildSystems.mockImplementation((_input, rng) => {
        buildSystemsRng = rng;
        return SYSTEMS;
      });

      await runPipeline(makeConfig());

      expect(galaxyRng).toBeDefined();
      expect(galaxyRng).toBe(costMapRng);
      expect(galaxyRng).toBe(classificationRng);
      expect(galaxyRng).toBe(buildSystemsRng);
    });
  });

  describe('determinism', () => {
    it('same seed produces identical PRNG sequence', async () => {
      const rngValues1: number[] = [];
      const rngValues2: number[] = [];

      mockGenerateGalaxy.mockImplementation((config) => {
        rngValues1.push(config.rng.random());
        return COORDS;
      });

      await runPipeline(makeConfig({ seed: 'determinism-test' }));

      mockGenerateGalaxy.mockImplementation((config) => {
        rngValues2.push(config.rng.random());
        return COORDS;
      });

      mockGenerateCostMap.mockReturnValue(COST_MAP);
      mockCalculateDensity.mockReturnValue(DENSITIES);
      mockClassifySystems.mockReturnValue(CLASSIFICATIONS);
      mockBuildSystems.mockReturnValue(SYSTEMS);
      mockBuildRoutes.mockReturnValue(ROUTES);
      mockWriteGalaxyOutput.mockResolvedValue(undefined);

      await runPipeline(makeConfig({ seed: 'determinism-test' }));

      expect(rngValues1).toEqual(rngValues2);
      expect(rngValues1.length).toBeGreaterThan(0);
    });
  });

  describe('generation stats', () => {
    it('computes correct beyond breakdown', async () => {
      const classifications: ClassificationResult[] = [
        { index: 0, classification: 'oikumene' as Classification, isOikumene: true },
        { index: 1, classification: 'uninhabited' as Classification, isOikumene: false },
        { index: 2, classification: 'lost_colony' as Classification, isOikumene: false },
        { index: 3, classification: 'hidden_enclave' as Classification, isOikumene: false },
        { index: 4, classification: 'uninhabited' as Classification, isOikumene: false },
      ];

      const coords: Coordinate[] = [
        { x: 1, y: 1 },
        { x: 2, y: 2 },
        { x: 3, y: 3 },
        { x: 4, y: 4 },
        { x: 5, y: 5 },
      ];

      const systems: StarSystem[] = coords.map((c, i) => ({
        ...SYSTEMS[0]!,
        id: `s-${String(i)}`,
        x: c.x,
        y: c.y,
        isOikumene: classifications[i]!.isOikumene,
        classification: classifications[i]!.classification,
      }));

      const densities = coords.map(() => ({ neighborCount: 0, environmentPenalty: 0 }));
      const emptyRoutes: Route[] = [];

      mockGenerateGalaxy.mockReturnValue(coords);
      mockCalculateDensity.mockReturnValue(densities);
      mockClassifySystems.mockReturnValue(classifications);
      mockBuildSystems.mockReturnValue(systems);
      mockBuildRoutes.mockReturnValue(emptyRoutes);

      const result = await runPipeline(makeConfig());

      expect(result.stats.totalSystems).toBe(5);
      expect(result.stats.oikumeneSystems).toBe(1);
      expect(result.stats.beyondSystems).toBe(4);
      expect(result.stats.beyondUninhabited).toBe(2);
      expect(result.stats.beyondLostColonies).toBe(1);
      expect(result.stats.beyondHiddenEnclaves).toBe(1);
      expect(result.stats.oikumeneRoutes).toBe(0);
      expect(result.stats.averageRouteCost).toBe(0);
    });

    it('computes average route cost correctly', async () => {
      const multiRoutes: Route[] = [
        { originId: 'a', destinationId: 'b', cost: 10, path: [] },
        { originId: 'c', destinationId: 'd', cost: 20, path: [] },
        { originId: 'e', destinationId: 'f', cost: 30, path: [] },
      ];
      mockBuildRoutes.mockReturnValue(multiRoutes);

      const result = await runPipeline(makeConfig());

      expect(result.stats.averageRouteCost).toBe(20);
    });

    it('returns zero average route cost when no routes', async () => {
      mockBuildRoutes.mockReturnValue([]);

      const result = await runPipeline(makeConfig());

      expect(result.stats.averageRouteCost).toBe(0);
    });
  });

  describe('logging', () => {
    it('calls logger for each stage when provided', async () => {
      const logger = makeLogger();

      await runPipeline(makeConfig(), logger);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(logger.stageStart).toHaveBeenCalledTimes(7);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(logger.stageEnd).toHaveBeenCalledTimes(7);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(logger.summary).toHaveBeenCalledTimes(1);
    });

    it('passes stage number and name to stageStart', async () => {
      const logger = makeLogger();

      await runPipeline(makeConfig(), logger);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(logger.stageStart).toHaveBeenNthCalledWith(1, 1, 'Generating star positions');
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(logger.stageStart).toHaveBeenNthCalledWith(2, 2, 'Computing cost map');
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(logger.stageStart).toHaveBeenNthCalledWith(3, 3, 'Calculating stellar density');
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(logger.stageStart).toHaveBeenNthCalledWith(4, 4, 'Selecting Oikumene');
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(logger.stageStart).toHaveBeenNthCalledWith(5, 5, 'Generating system attributes');
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(logger.stageStart).toHaveBeenNthCalledWith(6, 6, 'Pre-computing routes');
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(logger.stageStart).toHaveBeenNthCalledWith(7, 7, 'Writing output files');
    });

    it('passes stage number, name, duration, and detail to stageEnd', async () => {
      const logger = makeLogger();

      await runPipeline(makeConfig(), logger);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(logger.stageEnd).toHaveBeenNthCalledWith(
        1,
        1,
        'Generating star positions',
        expect.any(Number),
        expect.stringContaining('3')
      );

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(logger.stageEnd).toHaveBeenNthCalledWith(
        2,
        2,
        'Computing cost map',
        expect.any(Number),
        expect.stringContaining('2x2')
      );
    });

    it('passes pipeline result to summary callback', async () => {
      const logger = makeLogger();

      await runPipeline(makeConfig(), logger);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(logger.summary).toHaveBeenCalledWith(
        expect.objectContaining({
          systems: SYSTEMS,
          routes: ROUTES,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          stats: expect.objectContaining({ totalSystems: 3 }),
        })
      );
    });

    it('runs without errors when no logger is provided', async () => {
      const result = await runPipeline(makeConfig());

      expect(result).toBeDefined();
    });
  });

  describe('error handling', () => {
    it('throws when galaxy generation fails', async () => {
      mockGenerateGalaxy.mockImplementation(() => {
        throw new Error('Galaxy generation failed');
      });

      await expect(runPipeline(makeConfig())).rejects.toThrow('Galaxy generation failed');
    });

    it('throws when cost map generation fails', async () => {
      mockGenerateCostMap.mockImplementation(() => {
        throw new Error('Cost map failed');
      });

      await expect(runPipeline(makeConfig())).rejects.toThrow('Cost map failed');
    });

    it('throws when classification fails', async () => {
      mockClassifySystems.mockImplementation(() => {
        throw new Error('classification boom');
      });

      await expect(runPipeline(makeConfig())).rejects.toThrow(/Stage 4.*classification boom/);
    });

    it('throws when system builder fails', async () => {
      mockBuildSystems.mockImplementation(() => {
        throw new Error('system build boom');
      });

      await expect(runPipeline(makeConfig())).rejects.toThrow(/Stage 5.*system build boom/);
    });

    it('throws when route builder fails', async () => {
      mockBuildRoutes.mockImplementation(() => {
        throw new Error('routing boom');
      });

      await expect(runPipeline(makeConfig())).rejects.toThrow(/Stage 6.*routing boom/);
    });

    it('throws when file writer fails', async () => {
      mockWriteGalaxyOutput.mockRejectedValue(new Error('Write failed'));

      await expect(runPipeline(makeConfig())).rejects.toThrow(/Stage 7.*Write failed/);
    });

    it('handles non-Error thrown values', async () => {
      mockGenerateGalaxy.mockImplementation(() => {
        // eslint-disable-next-line @typescript-eslint/only-throw-error
        throw 'string error';
      });

      await expect(runPipeline(makeConfig())).rejects.toThrow(/Stage 1.*string error/);
    });

    it('does not call later stages when an earlier stage fails', async () => {
      mockGenerateGalaxy.mockImplementation(() => {
        throw new Error('Early failure');
      });

      await expect(runPipeline(makeConfig())).rejects.toThrow('Early failure');

      expect(mockGenerateCostMap).not.toHaveBeenCalled();
      expect(mockCalculateDensity).not.toHaveBeenCalled();
      expect(mockClassifySystems).not.toHaveBeenCalled();
      expect(mockBuildSystems).not.toHaveBeenCalled();
      expect(mockBuildRoutes).not.toHaveBeenCalled();
      expect(mockWriteGalaxyOutput).not.toHaveBeenCalled();
    });

    it('wraps stage errors with stage context', async () => {
      mockCalculateDensity.mockImplementation(() => {
        throw new Error('density calc boom');
      });

      await expect(runPipeline(makeConfig())).rejects.toThrow(/Stage 3.*density calc boom/);
    });

    it('calls logger stageStart but not stageEnd when stage fails', async () => {
      const logger = makeLogger();

      mockGenerateCostMap.mockImplementation(() => {
        throw new Error('boom');
      });

      await expect(runPipeline(makeConfig(), logger)).rejects.toThrow();

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(logger.stageStart).toHaveBeenCalledWith(1, 'Generating star positions');
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(logger.stageEnd).toHaveBeenCalledWith(
        1,
        'Generating star positions',
        expect.any(Number),
        expect.any(String)
      );
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(logger.stageStart).toHaveBeenCalledWith(2, 'Computing cost map');
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(logger.stageEnd).toHaveBeenCalledTimes(1);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(logger.summary).not.toHaveBeenCalled();
    });
  });

  describe('file writer input', () => {
    it('passes generatedAt as an ISO 8601 UTC string', async () => {
      await runPipeline(makeConfig());

      const writerInput: GalaxyOutputInput = mockWriteGalaxyOutput.mock.calls[0]![0];
      expect(writerInput.generatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('passes galaxy config with seed to file writer', async () => {
      await runPipeline(makeConfig({ seed: 'my-seed' }));

      const writerInput: GalaxyOutputInput = mockWriteGalaxyOutput.mock.calls[0]![0];
      expect(writerInput.galaxyConfig.seed).toBe('my-seed');
      expect(writerInput.galaxyConfig.arms).toBe(4);
    });

    it('passes costMap config from the generated cost map quantization', async () => {
      await runPipeline(makeConfig());

      const writerInput: GalaxyOutputInput = mockWriteGalaxyOutput.mock.calls[0]![0];
      expect(writerInput.costMapConfig.gridOriginX).toBe(COST_MAP.quantization.gridOriginX);
      expect(writerInput.costMapConfig.gridWidth).toBe(COST_MAP.quantization.gridWidth);
      expect(writerInput.costMapConfig.minCost).toBe(COST_MAP.quantization.minCost);
      expect(writerInput.costMapConfig.maxCost).toBe(COST_MAP.quantization.maxCost);
    });

    it('passes perlin config from pipeline config', async () => {
      await runPipeline(makeConfig());

      const writerInput: GalaxyOutputInput = mockWriteGalaxyOutput.mock.calls[0]![0];
      expect(writerInput.perlinConfig.baseLayer.frequency).toBe(0.03);
      expect(writerInput.perlinConfig.baseLayer.octaves).toBe(4);
      expect(writerInput.perlinConfig.wallLayer.frequency).toBe(0.05);
      expect(writerInput.perlinConfig.wallLayer.octaves).toBe(3);
    });

    it('passes CA config from pipeline config', async () => {
      await runPipeline(makeConfig());

      const writerInput: GalaxyOutputInput = mockWriteGalaxyOutput.mock.calls[0]![0];
      expect(writerInput.caConfig.fillProbability).toBe(0.45);
      expect(writerInput.caConfig.iterations).toBe(5);
      expect(writerInput.caConfig.rule).toBe('B5678/S45678');
    });

    it('passes oikumene config to file writer', async () => {
      await runPipeline(makeConfig());

      const writerInput: GalaxyOutputInput = mockWriteGalaxyOutput.mock.calls[0]![0];
      expect(writerInput.oikumeneConfig.targetCount).toBe(250);
    });

    it('passes route config to file writer', async () => {
      await runPipeline(makeConfig());

      const writerInput: GalaxyOutputInput = mockWriteGalaxyOutput.mock.calls[0]![0];
      expect(writerInput.routeConfig.maxRange).toBe(40);
    });
  });

  describe('oikumene system extraction for routes', () => {
    it('only passes oikumene systems to route builder', async () => {
      await runPipeline(makeConfig());

      const routeConfig = mockBuildRoutes.mock.calls[0]![0];
      const oikumeneIds = routeConfig.oikumeneSystems.map((s: { id: string }): string => s.id);
      expect(oikumeneIds).toEqual(['sys-1', 'sys-3']);
      expect(oikumeneIds).not.toContain('sys-2');
    });
  });
});
