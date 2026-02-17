/**
 * Tests for the CLI entry point.
 *
 * @module index.spec
 */

import type { PipelineConfig } from './config';
import { loadConfigFile, resolveConfig, validateConfig } from './config';
import type { PipelineResult } from './pipeline';
import { runPipeline } from './pipeline';

import { createConsoleLogger, formatSummary, main, parseArgs, type ParseArgsResult } from './index';

// ─── Mocks ──────────────────────────────────────────────────────────────────

jest.mock('./config', () => ({
  loadConfigFile: jest.fn(),
  resolveConfig: jest.fn(),
  validateConfig: jest.fn(),
}));

jest.mock('./pipeline', () => ({
  runPipeline: jest.fn(),
}));

const mockLoadConfigFile = loadConfigFile as jest.MockedFunction<typeof loadConfigFile>;
const mockResolveConfig = resolveConfig as jest.MockedFunction<typeof resolveConfig>;
const mockValidateConfig = validateConfig as jest.MockedFunction<typeof validateConfig>;
const mockRunPipeline = runPipeline as jest.MockedFunction<typeof runPipeline>;

// ─── Fixtures ───────────────────────────────────────────────────────────────

/**
 * Creates a minimal PipelineConfig for testing.
 *
 * @param overrides - partial fields to override
 * @returns complete PipelineConfig
 */
function makeConfig(overrides: Partial<PipelineConfig> = {}): PipelineConfig {
  return {
    seed: 'test-seed',
    output: './galaxy-output/',
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
 * Creates a minimal PipelineResult for testing.
 *
 * @param overrides - partial fields to override
 * @returns complete PipelineResult
 */
function makeResult(overrides: Partial<PipelineResult> = {}): PipelineResult {
  return {
    systems: [],
    routes: [],
    stats: {
      totalSystems: 12043,
      oikumeneSystems: 247,
      beyondSystems: 11796,
      beyondUninhabited: 10026,
      beyondLostColonies: 885,
      beyondHiddenEnclaves: 885,
      oikumeneRoutes: 1843,
      averageRouteCost: 27.4,
    },
    stageTimings: [
      { name: 'Generating star positions', durationMs: 1200 },
      { name: 'Computing cost map', durationMs: 3400 },
      { name: 'Calculating stellar density', durationMs: 500 },
      { name: 'Selecting Oikumene', durationMs: 200 },
      { name: 'Generating system attributes', durationMs: 2100 },
      { name: 'Pre-computing routes', durationMs: 8500 },
      { name: 'Writing output files', durationMs: 2400 },
    ],
    totalElapsedMs: 18300,
    ...overrides,
  };
}

// ─── Tests: parseArgs ────────────────────────────────────────────────────────

describe('parseArgs', () => {
  it('parses --seed as required argument', () => {
    const result = parseArgs(['--seed', 'my-seed']);

    expect(result.ok).toBe(true);
    expect((result as ParseArgsResult & { ok: true }).args.seed).toBe('my-seed');
  });

  it('returns error when --seed is missing', () => {
    const result = parseArgs(['--output', './out/']);

    expect(result.ok).toBe(false);
    expect((result as ParseArgsResult & { ok: false }).error).toContain('--seed');
  });

  it('returns error when --seed has no value', () => {
    const result = parseArgs(['--seed']);

    expect(result.ok).toBe(false);
    expect((result as ParseArgsResult & { ok: false }).error).toContain('--seed');
  });

  it('parses --output', () => {
    const result = parseArgs(['--seed', 'x', '--output', '/custom/dir/']);

    expect(result.ok).toBe(true);
    expect((result as ParseArgsResult & { ok: true }).args.output).toBe('/custom/dir/');
  });

  it('parses --config', () => {
    const result = parseArgs(['--seed', 'x', '--config', '/path/to/config.json']);

    expect(result.ok).toBe(true);
    expect((result as ParseArgsResult & { ok: true }).configPath).toBe('/path/to/config.json');
  });

  it('parses --arms as a number', () => {
    const result = parseArgs(['--seed', 'x', '--arms', '6']);

    expect(result.ok).toBe(true);
    expect((result as ParseArgsResult & { ok: true }).args.arms).toBe(6);
  });

  it('returns error when --arms is not a valid integer', () => {
    const result = parseArgs(['--seed', 'x', '--arms', 'abc']);

    expect(result.ok).toBe(false);
    expect((result as ParseArgsResult & { ok: false }).error).toContain('--arms');
  });

  it('parses --oikumene-count as a number', () => {
    const result = parseArgs(['--seed', 'x', '--oikumene-count', '300']);

    expect(result.ok).toBe(true);
    expect((result as ParseArgsResult & { ok: true }).args.oikumeneCount).toBe(300);
  });

  it('returns error when --oikumene-count is not a valid integer', () => {
    const result = parseArgs(['--seed', 'x', '--oikumene-count', '3.5']);

    expect(result.ok).toBe(false);
    expect((result as ParseArgsResult & { ok: false }).error).toContain('--oikumene-count');
  });

  it('parses --max-route-range as a number', () => {
    const result = parseArgs(['--seed', 'x', '--max-route-range', '50']);

    expect(result.ok).toBe(true);
    expect((result as ParseArgsResult & { ok: true }).args.maxRouteRange).toBe(50);
  });

  it('returns error when --max-route-range is not a valid number', () => {
    const result = parseArgs(['--seed', 'x', '--max-route-range', 'nope']);

    expect(result.ok).toBe(false);
    expect((result as ParseArgsResult & { ok: false }).error).toContain('--max-route-range');
  });

  it('parses --verbose flag', () => {
    const result = parseArgs(['--seed', 'x', '--verbose']);

    expect(result.ok).toBe(true);
    expect((result as ParseArgsResult & { ok: true }).verbose).toBe(true);
  });

  it('defaults verbose to false', () => {
    const result = parseArgs(['--seed', 'x']);

    expect(result.ok).toBe(true);
    expect((result as ParseArgsResult & { ok: true }).verbose).toBe(false);
  });

  it('defaults configPath to undefined', () => {
    const result = parseArgs(['--seed', 'x']);

    expect(result.ok).toBe(true);
    expect((result as ParseArgsResult & { ok: true }).configPath).toBeUndefined();
  });

  it('returns error for unknown arguments', () => {
    const result = parseArgs(['--seed', 'x', '--unknown-flag', 'val']);

    expect(result.ok).toBe(false);
    expect((result as ParseArgsResult & { ok: false }).error).toContain('--unknown-flag');
  });

  it('returns error when --output has no value', () => {
    const result = parseArgs(['--seed', 'x', '--output']);

    expect(result.ok).toBe(false);
    expect((result as ParseArgsResult & { ok: false }).error).toContain('--output');
  });

  it('returns error when --config has no value', () => {
    const result = parseArgs(['--seed', 'x', '--config']);

    expect(result.ok).toBe(false);
    expect((result as ParseArgsResult & { ok: false }).error).toContain('--config');
  });

  it('parses all arguments together', () => {
    const result = parseArgs([
      '--seed',
      'alpha',
      '--output',
      '/out/',
      '--config',
      '/cfg.json',
      '--arms',
      '6',
      '--oikumene-count',
      '200',
      '--max-route-range',
      '35',
      '--verbose',
    ]);

    expect(result.ok).toBe(true);
    const success = result as ParseArgsResult & { ok: true };
    expect(success.args.seed).toBe('alpha');
    expect(success.args.output).toBe('/out/');
    expect(success.args.arms).toBe(6);
    expect(success.args.oikumeneCount).toBe(200);
    expect(success.args.maxRouteRange).toBe(35);
    expect(success.configPath).toBe('/cfg.json');
    expect(success.verbose).toBe(true);
  });

  it('returns error when --arms has no value', () => {
    const result = parseArgs(['--seed', 'x', '--arms']);

    expect(result.ok).toBe(false);
    expect((result as ParseArgsResult & { ok: false }).error).toContain('--arms');
  });

  it('returns error when --oikumene-count has no value', () => {
    const result = parseArgs(['--seed', 'x', '--oikumene-count']);

    expect(result.ok).toBe(false);
    expect((result as ParseArgsResult & { ok: false }).error).toContain('--oikumene-count');
  });

  it('returns error when --max-route-range has no value', () => {
    const result = parseArgs(['--seed', 'x', '--max-route-range']);

    expect(result.ok).toBe(false);
    expect((result as ParseArgsResult & { ok: false }).error).toContain('--max-route-range');
  });
});

// ─── Tests: formatSummary ───────────────────────────────────────────────────

describe('formatSummary', () => {
  it('includes the seed value', () => {
    const output = formatSummary(makeResult(), makeConfig({ seed: 'test-alpha' }));

    expect(output).toContain('test-alpha');
  });

  it('includes total system count', () => {
    const output = formatSummary(makeResult(), makeConfig());

    expect(output).toContain('12,043');
  });

  it('includes Oikumene count and Beyond count', () => {
    const output = formatSummary(makeResult(), makeConfig());

    expect(output).toContain('247 Oikumene');
    expect(output).toContain('11,796 Beyond');
  });

  it('includes route count and average cost', () => {
    const output = formatSummary(makeResult(), makeConfig());

    expect(output).toContain('1,843');
    expect(output).toContain('27.4');
  });

  it('includes the output path', () => {
    const output = formatSummary(makeResult(), makeConfig({ output: '/my/output/' }));

    expect(output).toContain('/my/output/');
  });

  it('includes the total elapsed time in seconds', () => {
    const output = formatSummary(makeResult({ totalElapsedMs: 18300 }), makeConfig());

    expect(output).toContain('18.3s');
  });

  it('includes "Galaxy generation complete" header', () => {
    const output = formatSummary(makeResult(), makeConfig());

    expect(output).toContain('Galaxy generation complete');
  });
});

// ─── Tests: createConsoleLogger ──────────────────────────────────────────────

describe('createConsoleLogger', () => {
  let stdoutSpy: jest.SpiedFunction<typeof process.stdout.write>;

  beforeEach(() => {
    stdoutSpy = jest.spyOn(process.stdout, 'write').mockReturnValue(true);
  });

  afterEach(() => {
    stdoutSpy.mockRestore();
  });

  it('returns a PipelineLogger', () => {
    const logger = createConsoleLogger(false);

    expect(typeof logger.stageStart).toBe('function');
    expect(typeof logger.stageEnd).toBe('function');
    expect(typeof logger.summary).toBe('function');
  });

  describe('non-verbose mode', () => {
    it('stageEnd writes stage progress line with detail', () => {
      const logger = createConsoleLogger(false);

      logger.stageEnd(1, 'Generating star positions', 1200, '12,043 stars generated');

      expect(stdoutSpy).toHaveBeenCalled();
      const output = stdoutSpy.mock.calls.map((c) => String(c[0])).join('');
      expect(output).toContain('[1/7]');
      expect(output).toContain('Generating star positions');
      expect(output).toContain('12,043 stars generated');
    });

    it('stageStart does not write output in non-verbose mode', () => {
      const logger = createConsoleLogger(false);

      logger.stageStart(1, 'Generating star positions');

      expect(stdoutSpy).not.toHaveBeenCalled();
    });
  });

  describe('verbose mode', () => {
    it('stageStart writes output in verbose mode', () => {
      const logger = createConsoleLogger(true);

      logger.stageStart(1, 'Generating star positions');

      expect(stdoutSpy).toHaveBeenCalled();
      const output = stdoutSpy.mock.calls.map((c) => String(c[0])).join('');
      expect(output).toContain('Generating star positions');
    });

    it('stageEnd includes timing in verbose mode', () => {
      const logger = createConsoleLogger(true);

      logger.stageEnd(1, 'Generating star positions', 1200, '12,043 stars generated');

      expect(stdoutSpy).toHaveBeenCalled();
      const output = stdoutSpy.mock.calls.map((c) => String(c[0])).join('');
      expect(output).toContain('[1/7]');
      expect(output).toContain('12,043 stars generated');
    });
  });

  it('summary is a no-op (summary is handled by main)', () => {
    const logger = createConsoleLogger(false);

    // Should not throw
    logger.summary(makeResult());

    // summary in the logger is a no-op because main handles formatting
  });
});

// ─── Tests: main ─────────────────────────────────────────────────────────────

describe('main', () => {
  let stdoutSpy: jest.SpiedFunction<typeof process.stdout.write>;
  let stderrSpy: jest.SpiedFunction<typeof process.stderr.write>;

  beforeEach(() => {
    jest.clearAllMocks();
    stdoutSpy = jest.spyOn(process.stdout, 'write').mockReturnValue(true);
    stderrSpy = jest.spyOn(process.stderr, 'write').mockReturnValue(true);
  });

  afterEach(() => {
    stdoutSpy.mockRestore();
    stderrSpy.mockRestore();
  });

  /**
   * Sets up mocks for a successful pipeline run.
   */
  function setupSuccessMocks(): void {
    const config = makeConfig();
    const result = makeResult();
    mockLoadConfigFile.mockResolvedValue({});
    mockResolveConfig.mockReturnValue(config);
    mockValidateConfig.mockReturnValue(undefined);
    mockRunPipeline.mockResolvedValue(result);
  }

  it('returns exit code 0 on successful pipeline run', async () => {
    setupSuccessMocks();

    const exitCode = await main(['--seed', 'my-seed']);

    expect(exitCode).toBe(0);
  });

  it('returns exit code 1 when --seed is missing', async () => {
    const exitCode = await main(['--output', '/out/']);

    expect(exitCode).toBe(1);
  });

  it('writes error to stderr on invalid arguments', async () => {
    await main(['--output', '/out/']);

    expect(stderrSpy).toHaveBeenCalled();
    const output = stderrSpy.mock.calls.map((c) => String(c[0])).join('');
    expect(output).toContain('--seed');
  });

  it('returns exit code 1 when config file fails to load', async () => {
    mockLoadConfigFile.mockRejectedValue(new Error('file not found'));

    const exitCode = await main(['--seed', 'x', '--config', '/bad.json']);

    expect(exitCode).toBe(1);
  });

  it('writes config file error to stderr', async () => {
    mockLoadConfigFile.mockRejectedValue(new Error('file not found'));

    await main(['--seed', 'x', '--config', '/bad.json']);

    const output = stderrSpy.mock.calls.map((c) => String(c[0])).join('');
    expect(output).toContain('file not found');
  });

  it('returns exit code 1 when validation fails', async () => {
    mockLoadConfigFile.mockResolvedValue({});
    mockResolveConfig.mockReturnValue(makeConfig());
    mockValidateConfig.mockImplementation(() => {
      throw new Error('arms must be positive');
    });

    const exitCode = await main(['--seed', 'x']);

    expect(exitCode).toBe(1);
  });

  it('calls loadConfigFile with config path', async () => {
    setupSuccessMocks();

    await main(['--seed', 'x', '--config', '/my/config.json']);

    expect(mockLoadConfigFile).toHaveBeenCalledWith('/my/config.json');
  });

  it('calls loadConfigFile with undefined when no --config', async () => {
    setupSuccessMocks();

    await main(['--seed', 'x']);

    expect(mockLoadConfigFile).toHaveBeenCalledWith(undefined);
  });

  it('calls resolveConfig with parsed CLI args and file overrides', async () => {
    mockLoadConfigFile.mockResolvedValue({ galaxy: { arms: 6 } });
    mockResolveConfig.mockReturnValue(makeConfig());
    mockValidateConfig.mockReturnValue(undefined);
    mockRunPipeline.mockResolvedValue(makeResult());

    await main(['--seed', 'alpha', '--arms', '8']);

    expect(mockResolveConfig).toHaveBeenCalledWith(
      expect.objectContaining({ seed: 'alpha', arms: 8 }),
      expect.objectContaining({ galaxy: { arms: 6 } })
    );
  });

  it('calls validateConfig with the resolved config', async () => {
    const config = makeConfig({ seed: 'validated-seed' });
    mockLoadConfigFile.mockResolvedValue({});
    mockResolveConfig.mockReturnValue(config);
    mockValidateConfig.mockReturnValue(undefined);
    mockRunPipeline.mockResolvedValue(makeResult());

    await main(['--seed', 'validated-seed']);

    expect(mockValidateConfig).toHaveBeenCalledWith(config);
  });

  it('calls runPipeline with the resolved config', async () => {
    const config = makeConfig();
    mockLoadConfigFile.mockResolvedValue({});
    mockResolveConfig.mockReturnValue(config);
    mockValidateConfig.mockReturnValue(undefined);
    mockRunPipeline.mockResolvedValue(makeResult());

    await main(['--seed', 'x']);

    expect(mockRunPipeline).toHaveBeenCalledWith(config, expect.any(Object));
  });

  it('returns exit code 2 when pipeline throws an error', async () => {
    mockLoadConfigFile.mockResolvedValue({});
    mockResolveConfig.mockReturnValue(makeConfig());
    mockValidateConfig.mockReturnValue(undefined);
    mockRunPipeline.mockRejectedValue(new Error('Stage 3 failed'));

    const exitCode = await main(['--seed', 'x']);

    expect(exitCode).toBe(2);
  });

  it('writes pipeline error to stderr', async () => {
    mockLoadConfigFile.mockResolvedValue({});
    mockResolveConfig.mockReturnValue(makeConfig());
    mockValidateConfig.mockReturnValue(undefined);
    mockRunPipeline.mockRejectedValue(new Error('Stage 3 failed'));

    await main(['--seed', 'x']);

    const output = stderrSpy.mock.calls.map((c) => String(c[0])).join('');
    expect(output).toContain('Stage 3 failed');
  });

  it('returns exit code 3 when pipeline throws a validation error', async () => {
    mockLoadConfigFile.mockResolvedValue({});
    mockResolveConfig.mockReturnValue(makeConfig());
    mockValidateConfig.mockReturnValue(undefined);
    const validationError = new Error('Validation failed: disconnected Oikumene network');
    validationError.name = 'ValidationError';
    mockRunPipeline.mockRejectedValue(validationError);

    const exitCode = await main(['--seed', 'x']);

    expect(exitCode).toBe(3);
  });

  it('prints completion summary to stdout on success', async () => {
    setupSuccessMocks();

    await main(['--seed', 'test-seed']);

    const output = stdoutSpy.mock.calls.map((c) => String(c[0])).join('');
    expect(output).toContain('Galaxy generation complete');
  });

  it('passes verbose logger to pipeline when --verbose', async () => {
    setupSuccessMocks();

    await main(['--seed', 'x', '--verbose']);

    expect(mockRunPipeline).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        stageStart: expect.any(Function),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        stageEnd: expect.any(Function),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        summary: expect.any(Function),
      })
    );
  });

  it('handles non-Error pipeline failures', async () => {
    mockLoadConfigFile.mockResolvedValue({});
    mockResolveConfig.mockReturnValue(makeConfig());
    mockValidateConfig.mockReturnValue(undefined);
    mockRunPipeline.mockRejectedValue('string error');

    const exitCode = await main(['--seed', 'x']);

    expect(exitCode).toBe(2);
    const output = stderrSpy.mock.calls.map((c) => String(c[0])).join('');
    expect(output).toContain('string error');
  });

  it('handles non-Error config load failures', async () => {
    mockLoadConfigFile.mockRejectedValue('raw config error');

    const exitCode = await main(['--seed', 'x', '--config', '/bad.json']);

    expect(exitCode).toBe(1);
    const output = stderrSpy.mock.calls.map((c) => String(c[0])).join('');
    expect(output).toContain('raw config error');
  });

  it('handles non-Error validation failures', async () => {
    mockLoadConfigFile.mockResolvedValue({});
    mockResolveConfig.mockReturnValue(makeConfig());
    mockValidateConfig.mockImplementation(() => {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw 'raw validation error';
    });

    const exitCode = await main(['--seed', 'x']);

    expect(exitCode).toBe(1);
    const output = stderrSpy.mock.calls.map((c) => String(c[0])).join('');
    expect(output).toContain('raw validation error');
  });
});
