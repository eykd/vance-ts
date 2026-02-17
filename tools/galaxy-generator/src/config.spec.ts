import * as fs from 'node:fs/promises';

import {
  DEFAULT_CA_CONFIG,
  DEFAULT_COST_MAP_GENERATOR_CONFIG,
  DEFAULT_DENSITY_RADIUS,
  DEFAULT_GALAXY_CONFIG,
  DEFAULT_OIKUMENE_CONFIG,
  DEFAULT_PERLIN_CONFIG,
  DEFAULT_ROUTE_CONFIG,
  loadConfigFile,
  resolveConfig,
  validateConfig,
  type CliArgs,
  type PipelineConfig,
} from './config';

jest.mock('node:fs/promises');

const mockedFs = jest.mocked(fs);

/**
 * Creates a default CliArgs for testing.
 *
 * @param overrides - partial args to merge
 * @returns complete CliArgs
 */
function makeCliArgs(overrides: Partial<CliArgs> = {}): CliArgs {
  return {
    seed: 'test-seed',
    ...overrides,
  };
}

describe('DEFAULT_GALAXY_CONFIG', () => {
  it('has center [0, 0]', () => {
    expect(DEFAULT_GALAXY_CONFIG.center).toEqual([0, 0]);
  });

  it('has size [4000, 4000]', () => {
    expect(DEFAULT_GALAXY_CONFIG.size).toEqual([4000, 4000]);
  });

  it('has turn 0', () => {
    expect(DEFAULT_GALAXY_CONFIG.turn).toBe(0);
  });

  it('has deg 5', () => {
    expect(DEFAULT_GALAXY_CONFIG.deg).toBe(5);
  });

  it('has dynSizeFactor 1', () => {
    expect(DEFAULT_GALAXY_CONFIG.dynSizeFactor).toBe(1);
  });

  it('has spcFactor 8', () => {
    expect(DEFAULT_GALAXY_CONFIG.spcFactor).toBe(8);
  });

  it('has 4 arms', () => {
    expect(DEFAULT_GALAXY_CONFIG.arms).toBe(4);
  });

  it('has multiplier 1', () => {
    expect(DEFAULT_GALAXY_CONFIG.multiplier).toBe(1);
  });

  it('has limit null', () => {
    expect(DEFAULT_GALAXY_CONFIG.limit).toBeNull();
  });
});

describe('DEFAULT_COST_MAP_GENERATOR_CONFIG', () => {
  it('has padding 10', () => {
    expect(DEFAULT_COST_MAP_GENERATOR_CONFIG.padding).toBe(10);
  });

  it('has baseOpenCost 1', () => {
    expect(DEFAULT_COST_MAP_GENERATOR_CONFIG.baseOpenCost).toBe(1);
  });

  it('has openNoiseWeight 2', () => {
    expect(DEFAULT_COST_MAP_GENERATOR_CONFIG.openNoiseWeight).toBe(2);
  });

  it('has baseWallCost 15', () => {
    expect(DEFAULT_COST_MAP_GENERATOR_CONFIG.baseWallCost).toBe(15);
  });

  it('has wallNoiseWeight 15', () => {
    expect(DEFAULT_COST_MAP_GENERATOR_CONFIG.wallNoiseWeight).toBe(15);
  });

  it('has baseNoiseFrequency 0.03', () => {
    expect(DEFAULT_COST_MAP_GENERATOR_CONFIG.baseNoiseFrequency).toBe(0.03);
  });

  it('has baseNoiseOctaves 4', () => {
    expect(DEFAULT_COST_MAP_GENERATOR_CONFIG.baseNoiseOctaves).toBe(4);
  });

  it('has wallNoiseFrequency 0.05', () => {
    expect(DEFAULT_COST_MAP_GENERATOR_CONFIG.wallNoiseFrequency).toBe(0.05);
  });

  it('has wallNoiseOctaves 3', () => {
    expect(DEFAULT_COST_MAP_GENERATOR_CONFIG.wallNoiseOctaves).toBe(3);
  });

  it('has caFillProbability 0.45', () => {
    expect(DEFAULT_COST_MAP_GENERATOR_CONFIG.caFillProbability).toBe(0.45);
  });

  it('has caIterations 5', () => {
    expect(DEFAULT_COST_MAP_GENERATOR_CONFIG.caIterations).toBe(5);
  });
});

describe('DEFAULT_PERLIN_CONFIG', () => {
  it('has base layer frequency 0.03', () => {
    expect(DEFAULT_PERLIN_CONFIG.baseLayer.frequency).toBe(0.03);
  });

  it('has base layer octaves 4', () => {
    expect(DEFAULT_PERLIN_CONFIG.baseLayer.octaves).toBe(4);
  });

  it('has wall layer frequency 0.05', () => {
    expect(DEFAULT_PERLIN_CONFIG.wallLayer.frequency).toBe(0.05);
  });

  it('has wall layer octaves 3', () => {
    expect(DEFAULT_PERLIN_CONFIG.wallLayer.octaves).toBe(3);
  });
});

describe('DEFAULT_CA_CONFIG', () => {
  it('has fillProbability 0.45', () => {
    expect(DEFAULT_CA_CONFIG.fillProbability).toBe(0.45);
  });

  it('has iterations 5', () => {
    expect(DEFAULT_CA_CONFIG.iterations).toBe(5);
  });

  it('has rule "B5678/S45678"', () => {
    expect(DEFAULT_CA_CONFIG.rule).toBe('B5678/S45678');
  });
});

describe('DEFAULT_OIKUMENE_CONFIG', () => {
  it('has coreExclusionRadius 100', () => {
    expect(DEFAULT_OIKUMENE_CONFIG.coreExclusionRadius).toBe(100);
  });

  it('has clusterRadius 50', () => {
    expect(DEFAULT_OIKUMENE_CONFIG.clusterRadius).toBe(50);
  });

  it('has targetCount 250', () => {
    expect(DEFAULT_OIKUMENE_CONFIG.targetCount).toBe(250);
  });
});

describe('DEFAULT_ROUTE_CONFIG', () => {
  it('has maxRange 40', () => {
    expect(DEFAULT_ROUTE_CONFIG.maxRange).toBe(40);
  });
});

describe('DEFAULT_DENSITY_RADIUS', () => {
  it('is 25', () => {
    expect(DEFAULT_DENSITY_RADIUS).toBe(25);
  });
});

describe('loadConfigFile', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('returns an empty object when path is undefined', async () => {
    const result = await loadConfigFile(undefined);

    expect(result).toEqual({});
  });

  it('reads and parses a valid JSON config file', async () => {
    const fileContent = JSON.stringify({ galaxy: { arms: 6 } });
    mockedFs.readFile.mockResolvedValue(fileContent);

    const result = await loadConfigFile('/path/to/config.json');

    expect(mockedFs.readFile).toHaveBeenCalledWith('/path/to/config.json', 'utf-8');
    expect(result).toEqual({ galaxy: { arms: 6 } });
  });

  it('throws a descriptive error when the file cannot be read', async () => {
    const error = new Error('ENOENT: no such file');
    mockedFs.readFile.mockRejectedValue(error);

    await expect(loadConfigFile('/missing/config.json')).rejects.toThrow(
      'Failed to read config file "/missing/config.json": ENOENT: no such file'
    );
  });

  it('handles non-Error read failures', async () => {
    mockedFs.readFile.mockRejectedValue('raw string error');

    await expect(loadConfigFile('/missing/config.json')).rejects.toThrow(
      'Failed to read config file "/missing/config.json": raw string error'
    );
  });

  it('throws a descriptive error when the file contains invalid JSON', async () => {
    mockedFs.readFile.mockResolvedValue('{ invalid json }');

    await expect(loadConfigFile('/bad/config.json')).rejects.toThrow(
      'Failed to parse config file "/bad/config.json": '
    );
  });

  it('handles non-Error parse failures', async () => {
    mockedFs.readFile.mockResolvedValue('valid-content');
    const originalParse = JSON.parse;
    (JSON as Record<string, unknown>).parse = (): never => {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw 'non-error parse failure';
    };

    try {
      await expect(loadConfigFile('/bad/config.json')).rejects.toThrow(
        'Failed to parse config file "/bad/config.json": non-error parse failure'
      );
    } finally {
      JSON.parse = originalParse;
    }
  });

  it('throws when the config file is not a JSON object', async () => {
    mockedFs.readFile.mockResolvedValue('"just a string"');

    await expect(loadConfigFile('/bad/config.json')).rejects.toThrow(
      'Config file "/bad/config.json" must contain a JSON object'
    );
  });

  it('throws when the config file is a JSON array', async () => {
    mockedFs.readFile.mockResolvedValue('[1, 2, 3]');

    await expect(loadConfigFile('/bad/config.json')).rejects.toThrow(
      'Config file "/bad/config.json" must contain a JSON object'
    );
  });

  it('throws when the config file is null', async () => {
    mockedFs.readFile.mockResolvedValue('null');

    await expect(loadConfigFile('/bad/config.json')).rejects.toThrow(
      'Config file "/bad/config.json" must contain a JSON object'
    );
  });
});

describe('validateConfig', () => {
  it('accepts a valid config with all defaults', () => {
    const config: PipelineConfig = resolveConfig(makeCliArgs(), {});

    expect(() => validateConfig(config)).not.toThrow();
  });

  it('rejects negative arms', () => {
    const config = resolveConfig(makeCliArgs(), { galaxy: { arms: -1 } });

    expect(() => validateConfig(config)).toThrow('galaxy.arms must be a positive integer, got -1');
  });

  it('rejects zero arms', () => {
    const config = resolveConfig(makeCliArgs(), { galaxy: { arms: 0 } });

    expect(() => validateConfig(config)).toThrow('galaxy.arms must be a positive integer, got 0');
  });

  it('rejects non-integer arms', () => {
    const config = resolveConfig(makeCliArgs(), { galaxy: { arms: 3.5 } });

    expect(() => validateConfig(config)).toThrow('galaxy.arms must be a positive integer, got 3.5');
  });

  it('rejects negative spcFactor', () => {
    const config = resolveConfig(makeCliArgs(), { galaxy: { spcFactor: -1 } });

    expect(() => validateConfig(config)).toThrow(
      'galaxy.spcFactor must be a positive number, got -1'
    );
  });

  it('rejects zero spcFactor', () => {
    const config = resolveConfig(makeCliArgs(), { galaxy: { spcFactor: 0 } });

    expect(() => validateConfig(config)).toThrow(
      'galaxy.spcFactor must be a positive number, got 0'
    );
  });

  it('rejects negative dynSizeFactor', () => {
    const config = resolveConfig(makeCliArgs(), { galaxy: { dynSizeFactor: -1 } });

    expect(() => validateConfig(config)).toThrow(
      'galaxy.dynSizeFactor must be a positive number, got -1'
    );
  });

  it('rejects zero dynSizeFactor', () => {
    const config = resolveConfig(makeCliArgs(), { galaxy: { dynSizeFactor: 0 } });

    expect(() => validateConfig(config)).toThrow(
      'galaxy.dynSizeFactor must be a positive number, got 0'
    );
  });

  it('rejects caFillProbability below 0', () => {
    const config = resolveConfig(makeCliArgs(), { costMap: { caFillProbability: -0.1 } });

    expect(() => validateConfig(config)).toThrow(
      'costMap.caFillProbability must be in range [0, 1], got -0.1'
    );
  });

  it('rejects caFillProbability above 1', () => {
    const config = resolveConfig(makeCliArgs(), { costMap: { caFillProbability: 1.5 } });

    expect(() => validateConfig(config)).toThrow(
      'costMap.caFillProbability must be in range [0, 1], got 1.5'
    );
  });

  it('accepts caFillProbability of exactly 0', () => {
    const config = resolveConfig(makeCliArgs(), { costMap: { caFillProbability: 0 } });

    expect(() => validateConfig(config)).not.toThrow();
  });

  it('accepts caFillProbability of exactly 1', () => {
    const config = resolveConfig(makeCliArgs(), { costMap: { caFillProbability: 1 } });

    expect(() => validateConfig(config)).not.toThrow();
  });

  it('rejects negative caIterations', () => {
    const config = resolveConfig(makeCliArgs(), { costMap: { caIterations: -1 } });

    expect(() => validateConfig(config)).toThrow(
      'costMap.caIterations must be a non-negative integer, got -1'
    );
  });

  it('rejects non-integer caIterations', () => {
    const config = resolveConfig(makeCliArgs(), { costMap: { caIterations: 2.5 } });

    expect(() => validateConfig(config)).toThrow(
      'costMap.caIterations must be a non-negative integer, got 2.5'
    );
  });

  it('accepts caIterations of 0', () => {
    const config = resolveConfig(makeCliArgs(), { costMap: { caIterations: 0 } });

    expect(() => validateConfig(config)).not.toThrow();
  });

  it('rejects negative baseOpenCost', () => {
    const config = resolveConfig(makeCliArgs(), { costMap: { baseOpenCost: -1 } });

    expect(() => validateConfig(config)).toThrow(
      'costMap.baseOpenCost must be a non-negative number, got -1'
    );
  });

  it('rejects negative baseWallCost', () => {
    const config = resolveConfig(makeCliArgs(), { costMap: { baseWallCost: -1 } });

    expect(() => validateConfig(config)).toThrow(
      'costMap.baseWallCost must be a non-negative number, got -1'
    );
  });

  it('rejects negative openNoiseWeight', () => {
    const config = resolveConfig(makeCliArgs(), { costMap: { openNoiseWeight: -1 } });

    expect(() => validateConfig(config)).toThrow(
      'costMap.openNoiseWeight must be a non-negative number, got -1'
    );
  });

  it('rejects negative wallNoiseWeight', () => {
    const config = resolveConfig(makeCliArgs(), { costMap: { wallNoiseWeight: -1 } });

    expect(() => validateConfig(config)).toThrow(
      'costMap.wallNoiseWeight must be a non-negative number, got -1'
    );
  });

  it('rejects negative baseNoiseFrequency', () => {
    const config = resolveConfig(makeCliArgs(), { costMap: { baseNoiseFrequency: -0.01 } });

    expect(() => validateConfig(config)).toThrow(
      'costMap.baseNoiseFrequency must be a positive number, got -0.01'
    );
  });

  it('rejects zero baseNoiseFrequency', () => {
    const config = resolveConfig(makeCliArgs(), { costMap: { baseNoiseFrequency: 0 } });

    expect(() => validateConfig(config)).toThrow(
      'costMap.baseNoiseFrequency must be a positive number, got 0'
    );
  });

  it('rejects negative wallNoiseFrequency', () => {
    const config = resolveConfig(makeCliArgs(), { costMap: { wallNoiseFrequency: -0.01 } });

    expect(() => validateConfig(config)).toThrow(
      'costMap.wallNoiseFrequency must be a positive number, got -0.01'
    );
  });

  it('rejects zero wallNoiseFrequency', () => {
    const config = resolveConfig(makeCliArgs(), { costMap: { wallNoiseFrequency: 0 } });

    expect(() => validateConfig(config)).toThrow(
      'costMap.wallNoiseFrequency must be a positive number, got 0'
    );
  });

  it('rejects non-positive baseNoiseOctaves', () => {
    const config = resolveConfig(makeCliArgs(), { costMap: { baseNoiseOctaves: 0 } });

    expect(() => validateConfig(config)).toThrow(
      'costMap.baseNoiseOctaves must be a positive integer, got 0'
    );
  });

  it('rejects non-integer baseNoiseOctaves', () => {
    const config = resolveConfig(makeCliArgs(), { costMap: { baseNoiseOctaves: 2.5 } });

    expect(() => validateConfig(config)).toThrow(
      'costMap.baseNoiseOctaves must be a positive integer, got 2.5'
    );
  });

  it('rejects non-positive wallNoiseOctaves', () => {
    const config = resolveConfig(makeCliArgs(), { costMap: { wallNoiseOctaves: 0 } });

    expect(() => validateConfig(config)).toThrow(
      'costMap.wallNoiseOctaves must be a positive integer, got 0'
    );
  });

  it('rejects non-integer wallNoiseOctaves', () => {
    const config = resolveConfig(makeCliArgs(), { costMap: { wallNoiseOctaves: 1.5 } });

    expect(() => validateConfig(config)).toThrow(
      'costMap.wallNoiseOctaves must be a positive integer, got 1.5'
    );
  });

  it('rejects negative padding', () => {
    const config = resolveConfig(makeCliArgs(), { costMap: { padding: -1 } });

    expect(() => validateConfig(config)).toThrow(
      'costMap.padding must be a non-negative integer, got -1'
    );
  });

  it('rejects non-integer padding', () => {
    const config = resolveConfig(makeCliArgs(), { costMap: { padding: 5.5 } });

    expect(() => validateConfig(config)).toThrow(
      'costMap.padding must be a non-negative integer, got 5.5'
    );
  });

  it('rejects negative oikumene.coreExclusionRadius', () => {
    const config = resolveConfig(makeCliArgs(), { oikumene: { coreExclusionRadius: -10 } });

    expect(() => validateConfig(config)).toThrow(
      'oikumene.coreExclusionRadius must be a non-negative number, got -10'
    );
  });

  it('rejects negative oikumene.clusterRadius', () => {
    const config = resolveConfig(makeCliArgs(), { oikumene: { clusterRadius: -5 } });

    expect(() => validateConfig(config)).toThrow(
      'oikumene.clusterRadius must be a non-negative number, got -5'
    );
  });

  it('rejects non-positive oikumene.targetCount', () => {
    const config = resolveConfig(makeCliArgs(), { oikumene: { targetCount: 0 } });

    expect(() => validateConfig(config)).toThrow(
      'oikumene.targetCount must be a positive integer, got 0'
    );
  });

  it('rejects non-integer oikumene.targetCount', () => {
    const config = resolveConfig(makeCliArgs(), { oikumene: { targetCount: 250.5 } });

    expect(() => validateConfig(config)).toThrow(
      'oikumene.targetCount must be a positive integer, got 250.5'
    );
  });

  it('rejects non-positive route.maxRange', () => {
    const config = resolveConfig(makeCliArgs(), { route: { maxRange: 0 } });

    expect(() => validateConfig(config)).toThrow('route.maxRange must be a positive number, got 0');
  });

  it('rejects negative route.maxRange', () => {
    const config = resolveConfig(makeCliArgs(), { route: { maxRange: -5 } });

    expect(() => validateConfig(config)).toThrow(
      'route.maxRange must be a positive number, got -5'
    );
  });

  it('rejects negative densityRadius', () => {
    const config = resolveConfig(makeCliArgs(), { densityRadius: -1 });

    expect(() => validateConfig(config)).toThrow('densityRadius must be a positive number, got -1');
  });

  it('rejects zero densityRadius', () => {
    const config = resolveConfig(makeCliArgs(), { densityRadius: 0 });

    expect(() => validateConfig(config)).toThrow('densityRadius must be a positive number, got 0');
  });

  it('rejects empty seed', () => {
    const config = resolveConfig(makeCliArgs({ seed: '' }), {});

    expect(() => validateConfig(config)).toThrow('seed must be a non-empty string');
  });

  it('rejects negative galaxy.limit', () => {
    const config = resolveConfig(makeCliArgs(), { galaxy: { limit: -1 } });

    expect(() => validateConfig(config)).toThrow(
      'galaxy.limit must be a positive integer or null, got -1'
    );
  });

  it('rejects zero galaxy.limit', () => {
    const config = resolveConfig(makeCliArgs(), { galaxy: { limit: 0 } });

    expect(() => validateConfig(config)).toThrow(
      'galaxy.limit must be a positive integer or null, got 0'
    );
  });

  it('rejects non-integer galaxy.limit', () => {
    const config = resolveConfig(makeCliArgs(), { galaxy: { limit: 5.5 } });

    expect(() => validateConfig(config)).toThrow(
      'galaxy.limit must be a positive integer or null, got 5.5'
    );
  });

  it('accepts null galaxy.limit', () => {
    const config = resolveConfig(makeCliArgs(), { galaxy: { limit: null } });

    expect(() => validateConfig(config)).not.toThrow();
  });

  it('accepts a positive integer galaxy.limit', () => {
    const config = resolveConfig(makeCliArgs(), { galaxy: { limit: 5000 } });

    expect(() => validateConfig(config)).not.toThrow();
  });
});

describe('resolveConfig', () => {
  it('returns all defaults when no overrides are provided', () => {
    const config = resolveConfig(makeCliArgs(), {});

    expect(config.seed).toBe('test-seed');
    expect(config.output).toBe('./galaxy-output/');
    expect(config.galaxy.arms).toBe(4);
    expect(config.costMap.padding).toBe(10);
    expect(config.oikumene.targetCount).toBe(250);
    expect(config.route.maxRange).toBe(40);
    expect(config.densityRadius).toBe(25);
  });

  it('applies config file overrides on top of defaults', () => {
    const fileOverrides = {
      galaxy: { arms: 6, deg: 7 },
      oikumene: { targetCount: 300 },
    };

    const config = resolveConfig(makeCliArgs(), fileOverrides);

    expect(config.galaxy.arms).toBe(6);
    expect(config.galaxy.deg).toBe(7);
    expect(config.galaxy.turn).toBe(0); // default preserved
    expect(config.oikumene.targetCount).toBe(300);
    expect(config.oikumene.coreExclusionRadius).toBe(100); // default preserved
  });

  it('applies CLI args over config file and defaults', () => {
    const fileOverrides = {
      galaxy: { arms: 6 },
      oikumene: { targetCount: 300 },
      route: { maxRange: 50 },
    };

    const config = resolveConfig(
      makeCliArgs({ arms: 8, oikumeneCount: 200, maxRouteRange: 35 }),
      fileOverrides
    );

    // CLI wins over file
    expect(config.galaxy.arms).toBe(8);
    expect(config.oikumene.targetCount).toBe(200);
    expect(config.route.maxRange).toBe(35);
  });

  it('uses seed from CLI args', () => {
    const config = resolveConfig(makeCliArgs({ seed: 'my-seed' }), {});

    expect(config.seed).toBe('my-seed');
  });

  it('uses output from CLI args', () => {
    const config = resolveConfig(makeCliArgs({ output: '/custom/output/' }), {});

    expect(config.output).toBe('/custom/output/');
  });

  it('uses output from config file when CLI does not specify', () => {
    const config = resolveConfig(makeCliArgs(), { output: '/file/output/' });

    expect(config.output).toBe('/file/output/');
  });

  it('CLI output overrides config file output', () => {
    const config = resolveConfig(makeCliArgs({ output: '/cli/output/' }), {
      output: '/file/output/',
    });

    expect(config.output).toBe('/cli/output/');
  });

  it('deep-merges galaxy config with proper precedence', () => {
    const config = resolveConfig(makeCliArgs({ arms: 5 }), {
      galaxy: { arms: 6, spcFactor: 10, multiplier: 2 },
    });

    expect(config.galaxy.arms).toBe(5); // CLI wins
    expect(config.galaxy.spcFactor).toBe(10); // file
    expect(config.galaxy.multiplier).toBe(2); // file
    expect(config.galaxy.center).toEqual([0, 0]); // default
  });

  it('deep-merges costMap config', () => {
    const config = resolveConfig(makeCliArgs(), {
      costMap: { padding: 20, baseOpenCost: 2 },
    });

    expect(config.costMap.padding).toBe(20);
    expect(config.costMap.baseOpenCost).toBe(2);
    expect(config.costMap.baseWallCost).toBe(15); // default preserved
  });

  it('deep-merges oikumene config', () => {
    const config = resolveConfig(makeCliArgs(), {
      oikumene: { coreExclusionRadius: 150 },
    });

    expect(config.oikumene.coreExclusionRadius).toBe(150);
    expect(config.oikumene.targetCount).toBe(250); // default preserved
  });

  it('deep-merges route config', () => {
    const config = resolveConfig(makeCliArgs(), {
      route: { maxRange: 60 },
    });

    expect(config.route.maxRange).toBe(60);
  });

  it('applies densityRadius from config file', () => {
    const config = resolveConfig(makeCliArgs(), { densityRadius: 30 });

    expect(config.densityRadius).toBe(30);
  });

  it('does not apply undefined CLI args', () => {
    const config = resolveConfig(makeCliArgs(), { galaxy: { arms: 6 } });

    // arms is undefined in CLI args, so file value is used
    expect(config.galaxy.arms).toBe(6);
  });

  it('returns a PipelineConfig with all required sections', () => {
    const config = resolveConfig(makeCliArgs(), {});

    expect(config).toHaveProperty('seed');
    expect(config).toHaveProperty('output');
    expect(config).toHaveProperty('galaxy');
    expect(config).toHaveProperty('costMap');
    expect(config).toHaveProperty('oikumene');
    expect(config).toHaveProperty('route');
    expect(config).toHaveProperty('densityRadius');
  });
});
