/**
 * Tests for the galaxy seeder CLI entry point.
 *
 * @module index.spec
 */

import type { MockedFunction, MockInstance } from 'vitest';

import type { Route, StarSystem } from '../../../src/domain/galaxy/types.js';
import { Classification } from '../../../src/domain/galaxy/types.js';

import { computeBtn } from './btn.js';
import { buildAdjacencyList, discoverPairs } from './graph.js';
import { readMetadata, readRoutes, readSystems } from './reader.js';
import { generateSQL } from './sql-writer.js';
import { validateInput } from './validator.js';

import { main, parseArgs } from './index.js';

// ─── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('node:fs/promises');

vi.mock('./reader.js', () => ({
  readMetadata: vi.fn(),
  readRoutes: vi.fn(),
  readSystems: vi.fn(),
}));

vi.mock('./validator.js', () => ({
  validateInput: vi.fn(),
}));

vi.mock('./graph.js', () => ({
  buildAdjacencyList: vi.fn(),
  discoverPairs: vi.fn(),
}));

vi.mock('./btn.js', () => ({
  computeBtn: vi.fn(),
}));

vi.mock('./sql-writer.js', () => ({
  generateSQL: vi.fn(),
}));

const mockReadMetadata = readMetadata as MockedFunction<typeof readMetadata>;
const mockReadRoutes = readRoutes as MockedFunction<typeof readRoutes>;
const mockReadSystems = readSystems as MockedFunction<typeof readSystems>;
const mockValidateInput = validateInput as MockedFunction<typeof validateInput>;
const mockBuildAdjacencyList = buildAdjacencyList as MockedFunction<typeof buildAdjacencyList>;
const mockDiscoverPairs = discoverPairs as MockedFunction<typeof discoverPairs>;
const mockComputeBtn = computeBtn as MockedFunction<typeof computeBtn>;
const mockGenerateSQL = generateSQL as MockedFunction<typeof generateSQL>;

// ─── Fixtures ───────────────────────────────────────────────────────────────

/**
 * Creates a minimal StarSystem for testing.
 *
 * @param id - system identifier
 * @param wtn - world trade number
 * @returns a complete StarSystem fixture
 */
function makeSystem(id: string, wtn: number): StarSystem {
  return {
    id,
    name: `System ${id}`,
    x: 100,
    y: 200,
    isOikumene: true,
    classification: Classification.OIKUMENE,
    density: { neighborCount: 5, environmentPenalty: 0 },
    attributes: { technology: 10, environment: 5, resources: 7 },
    planetary: { size: 8, atmosphere: 6, temperature: 5, hydrography: 7 },
    civilization: { population: 9, starport: 4, government: 3, factions: 2, lawLevel: 5 },
    tradeCodes: ['Ag', 'Ri'],
    economics: {
      gurpsTechLevel: 10,
      perCapitaIncome: 50000,
      grossWorldProduct: 1e12,
      resourceMultiplier: 1.2,
      worldTradeNumber: wtn,
    },
  };
}

/**
 * Creates a minimal Route for testing.
 *
 * @param originId - origin system identifier
 * @param destinationId - destination system identifier
 * @returns a complete Route fixture
 */
function makeRoute(originId: string, destinationId: string): Route {
  return { originId, destinationId, cost: 10, path: [{ x: 0, y: 0 }] };
}

// ─── Tests: parseArgs ────────────────────────────────────────────────────────

describe('parseArgs', () => {
  it('parses --input as required argument', () => {
    const result = parseArgs(['--input', '/path/to/galaxy-output']);

    expect(result.ok).toBe(true);
    expect((result as { ok: true; args: { input: string } }).args.input).toBe(
      '/path/to/galaxy-output'
    );
  });

  it('returns error when --input is missing', () => {
    const result = parseArgs([]);

    expect(result.ok).toBe(false);
    expect((result as { ok: false; error: string }).error).toContain('--input');
  });

  it('returns error when --input has no value', () => {
    const result = parseArgs(['--input']);

    expect(result.ok).toBe(false);
    expect((result as { ok: false; error: string }).error).toContain('--input');
  });

  it('parses --output as optional argument', () => {
    const result = parseArgs(['--input', '/in', '--output', '/out/seed.sql']);

    expect(result.ok).toBe(true);
    const success = result as { ok: true; args: { input: string; output?: string } };
    expect(success.args.output).toBe('/out/seed.sql');
  });

  it('defaults output to undefined when not provided', () => {
    const result = parseArgs(['--input', '/in']);

    expect(result.ok).toBe(true);
    const success = result as { ok: true; args: { input: string; output?: string } };
    expect(success.args.output).toBeUndefined();
  });

  it('returns error when --output has no value', () => {
    const result = parseArgs(['--input', '/in', '--output']);

    expect(result.ok).toBe(false);
    expect((result as { ok: false; error: string }).error).toContain('--output');
  });

  it('parses --verbose flag', () => {
    const result = parseArgs(['--input', '/in', '--verbose']);

    expect(result.ok).toBe(true);
    expect((result as { ok: true; verbose: boolean }).verbose).toBe(true);
  });

  it('defaults verbose to false', () => {
    const result = parseArgs(['--input', '/in']);

    expect(result.ok).toBe(true);
    expect((result as { ok: true; verbose: boolean }).verbose).toBe(false);
  });

  it('parses all arguments together', () => {
    const result = parseArgs(['--input', '/in', '--output', '/out.sql', '--verbose']);

    expect(result.ok).toBe(true);
    const success = result as {
      ok: true;
      args: { input: string; output: string };
      verbose: boolean;
    };
    expect(success.args.input).toBe('/in');
    expect(success.args.output).toBe('/out.sql');
    expect(success.verbose).toBe(true);
  });

  it('returns error for unknown arguments', () => {
    const result = parseArgs(['--input', '/in', '--unknown']);

    expect(result.ok).toBe(false);
    expect((result as { ok: false; error: string }).error).toContain('--unknown');
  });
});

// ─── Tests: main ─────────────────────────────────────────────────────────────

describe('main', () => {
  let stderrSpy: MockInstance<typeof process.stderr.write>;
  let stdoutSpy: MockInstance<typeof process.stdout.write>;

  beforeEach(() => {
    vi.clearAllMocks();
    stderrSpy = vi.spyOn(process.stderr, 'write').mockReturnValue(true);
    stdoutSpy = vi.spyOn(process.stdout, 'write').mockReturnValue(true);
  });

  afterEach(() => {
    stderrSpy.mockRestore();
    stdoutSpy.mockRestore();
  });

  /**
   * Sets up mocks for a successful pipeline run with two systems and one route.
   */
  function setupSuccessMocks(): void {
    const sysA = makeSystem('aaa', 4.5);
    const sysB = makeSystem('bbb', 3.0);
    const route = makeRoute('aaa', 'bbb');
    const routesData = { routes: [route] };

    mockReadMetadata.mockResolvedValue({ seed: 'test' });
    mockReadSystems.mockResolvedValue([sysA, sysB]);
    mockReadRoutes.mockResolvedValue(routesData);
    mockValidateInput.mockReturnValue({ ok: true });
    mockBuildAdjacencyList.mockReturnValue(new Map([['aaa', new Set(['bbb'])]]));
    mockDiscoverPairs.mockReturnValue([{ systemA: 'aaa', systemB: 'bbb', hops: 1 }]);
    mockComputeBtn.mockReturnValue(7.5);
    mockGenerateSQL.mockReturnValue('BEGIN TRANSACTION;\nCOMMIT;\n');
  }

  it('returns exit code 0 on success', async () => {
    setupSuccessMocks();

    const exitCode = await main(['--input', '/galaxy', '--output', '/out.sql']);

    expect(exitCode).toBe(0);
  });

  it('returns exit code 1 when --input is missing', async () => {
    const exitCode = await main([]);

    expect(exitCode).toBe(1);
  });

  it('writes error to stderr on invalid arguments', async () => {
    await main([]);

    expect(stderrSpy).toHaveBeenCalled();
    const output = stderrSpy.mock.calls.map((c) => String(c[0])).join('');
    expect(output).toContain('--input');
  });

  it('returns exit code 1 when file reading fails', async () => {
    mockReadMetadata.mockRejectedValue(new Error('ENOENT: no such file'));

    const exitCode = await main(['--input', '/bad/dir']);

    expect(exitCode).toBe(1);
  });

  it('writes read error to stderr', async () => {
    mockReadMetadata.mockRejectedValue(new Error('ENOENT: no such file'));

    await main(['--input', '/bad/dir']);

    const output = stderrSpy.mock.calls.map((c) => String(c[0])).join('');
    expect(output).toContain('ENOENT');
  });

  it('returns exit code 1 when validation fails', async () => {
    mockReadMetadata.mockResolvedValue({});
    mockReadSystems.mockResolvedValue([]);
    mockReadRoutes.mockResolvedValue({ routes: [] });
    mockValidateInput.mockReturnValue({ ok: false, errors: ['systems array is empty'] });

    const exitCode = await main(['--input', '/galaxy']);

    expect(exitCode).toBe(1);
  });

  it('writes validation errors to stderr', async () => {
    mockReadMetadata.mockResolvedValue({});
    mockReadSystems.mockResolvedValue([]);
    mockReadRoutes.mockResolvedValue({ routes: [] });
    mockValidateInput.mockReturnValue({ ok: false, errors: ['systems array is empty'] });

    await main(['--input', '/galaxy']);

    const output = stderrSpy.mock.calls.map((c) => String(c[0])).join('');
    expect(output).toContain('systems array is empty');
  });

  it('calls reader functions with the input directory', async () => {
    setupSuccessMocks();

    await main(['--input', '/my/galaxy', '--output', '/out.sql']);

    expect(mockReadMetadata).toHaveBeenCalledWith('/my/galaxy');
    expect(mockReadSystems).toHaveBeenCalledWith('/my/galaxy');
    expect(mockReadRoutes).toHaveBeenCalledWith('/my/galaxy');
  });

  it('calls validateInput with read data', async () => {
    const meta = { seed: 'test' };
    const systems = [makeSystem('aaa', 4.5)];
    const routesData = { routes: [makeRoute('aaa', 'bbb')] };
    mockReadMetadata.mockResolvedValue(meta);
    mockReadSystems.mockResolvedValue(systems);
    mockReadRoutes.mockResolvedValue(routesData);
    mockValidateInput.mockReturnValue({ ok: true });
    mockBuildAdjacencyList.mockReturnValue(new Map());
    mockDiscoverPairs.mockReturnValue([]);
    mockGenerateSQL.mockReturnValue('');

    await main(['--input', '/galaxy', '--output', '/out.sql']);

    expect(mockValidateInput).toHaveBeenCalledWith({
      metadata: meta,
      systems,
      routes: routesData,
    });
  });

  it('calls buildAdjacencyList with validated routes', async () => {
    setupSuccessMocks();

    await main(['--input', '/galaxy', '--output', '/out.sql']);

    expect(mockBuildAdjacencyList).toHaveBeenCalled();
  });

  it('calls discoverPairs with the adjacency list', async () => {
    const adj = new Map([['aaa', new Set(['bbb'])]]);
    setupSuccessMocks();
    mockBuildAdjacencyList.mockReturnValue(adj);

    await main(['--input', '/galaxy', '--output', '/out.sql']);

    expect(mockDiscoverPairs).toHaveBeenCalledWith(adj);
  });

  it('calls computeBtn for each discovered pair', async () => {
    setupSuccessMocks();

    await main(['--input', '/galaxy', '--output', '/out.sql']);

    expect(mockComputeBtn).toHaveBeenCalledWith(4.5, 3.0, 1);
  });

  it('calls generateSQL with systems, routes, and trade pairs', async () => {
    setupSuccessMocks();

    await main(['--input', '/galaxy', '--output', '/out.sql']);

    expect(mockGenerateSQL).toHaveBeenCalledWith(expect.any(Array), expect.any(Array), [
      { systemAId: 'aaa', systemBId: 'bbb', btn: 7.5, hops: 1 },
    ]);
  });

  it('writes SQL to the output file', async () => {
    setupSuccessMocks();
    const { writeFile } = await import('node:fs/promises');

    await main(['--input', '/galaxy', '--output', '/out.sql']);

    expect(writeFile).toHaveBeenCalledWith('/out.sql', 'BEGIN TRANSACTION;\nCOMMIT;\n', 'utf-8');
  });

  it('writes SQL to stdout when no --output is provided', async () => {
    setupSuccessMocks();

    await main(['--input', '/galaxy']);

    expect(stdoutSpy).toHaveBeenCalled();
    const output = stdoutSpy.mock.calls.map((c) => String(c[0])).join('');
    expect(output).toContain('BEGIN TRANSACTION;');
  });

  it('prints verbose progress to stderr when --verbose', async () => {
    setupSuccessMocks();

    await main(['--input', '/galaxy', '--output', '/out.sql', '--verbose']);

    const output = stderrSpy.mock.calls.map((c) => String(c[0])).join('');
    expect(output).toContain('Reading');
  });

  it('handles non-Error read failures', async () => {
    mockReadMetadata.mockRejectedValue('raw string error');

    const exitCode = await main(['--input', '/bad']);

    expect(exitCode).toBe(1);
    const output = stderrSpy.mock.calls.map((c) => String(c[0])).join('');
    expect(output).toContain('raw string error');
  });

  it('handles write failure gracefully', async () => {
    setupSuccessMocks();
    const { writeFile } = await import('node:fs/promises');
    vi.mocked(writeFile).mockRejectedValue(new Error('EACCES: permission denied'));

    const exitCode = await main(['--input', '/galaxy', '--output', '/readonly/out.sql']);

    expect(exitCode).toBe(1);
    const output = stderrSpy.mock.calls.map((c) => String(c[0])).join('');
    expect(output).toContain('EACCES');
  });
});
