/**
 * CLI entry point for the galaxy generation pipeline.
 *
 * Parses command-line arguments, loads configuration, and invokes the pipeline
 * orchestrator. Exit codes follow the pipeline-cli.md contract:
 * - 0: Success
 * - 1: Invalid arguments or configuration
 * - 2: Pipeline failed during generation
 * - 3: Validation failed
 *
 * @module index
 */

import type { CliArgs, PipelineConfig } from './config';
import { loadConfigFile, resolveConfig, validateConfig } from './config';
import type { PipelineLogger, PipelineResult } from './pipeline';
import { extractErrorMessage, runPipeline } from './pipeline';

/** Exit code for successful pipeline completion. */
const EXIT_SUCCESS = 0;

/** Exit code for invalid arguments or configuration. */
const EXIT_INVALID_ARGS = 1;

/** Exit code for pipeline failure during generation. */
const EXIT_PIPELINE_FAILURE = 2;

/** Exit code for validation failure. */
const EXIT_VALIDATION_FAILURE = 3;

/** Total number of pipeline stages. */
const TOTAL_STAGES = 7;

/** Successful parse result containing CLI arguments. */
interface ParseArgsSuccess {
  /** Indicates a successful parse. */
  readonly ok: true;
  /** Parsed CLI arguments for config resolution. */
  readonly args: CliArgs;
  /** Path to an optional JSON config file. */
  readonly configPath: string | undefined;
  /** Whether verbose output is enabled. */
  readonly verbose: boolean;
}

/** Failed parse result containing an error message. */
interface ParseArgsFailure {
  /** Indicates a failed parse. */
  readonly ok: false;
  /** Human-readable error message. */
  readonly error: string;
}

/** Result of argument parsing, either success or failure. */
export type ParseArgsResult = ParseArgsSuccess | ParseArgsFailure;

/** All known CLI flags that accept a value argument. */
const VALUE_FLAGS = new Set([
  '--seed',
  '--output',
  '--config',
  '--arms',
  '--oikumene-count',
  '--max-route-range',
]);

/**
 * Parses a numeric argument value, requiring an integer.
 *
 * @param flag - the flag name for error messages
 * @param value - the raw string value
 * @returns the parsed integer, or an error string
 */
function parseIntegerArg(flag: string, value: string): number | string {
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) {
    return `${flag} requires an integer value, got "${value}"`;
  }
  return parsed;
}

/**
 * Parses a numeric argument value, allowing decimals.
 *
 * @param flag - the flag name for error messages
 * @param value - the raw string value
 * @returns the parsed number, or an error string
 */
function parseNumberArg(flag: string, value: string): number | string {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    return `${flag} requires a numeric value, got "${value}"`;
  }
  return parsed;
}

/**
 * Processes a single flag-value pair and updates the mutable state object.
 *
 * @param flag - the flag name
 * @param value - the raw string value
 * @param state - mutable state accumulator
 * @param state.seed - current seed value
 * @param state.output - current output value
 * @param state.configPath - current config path value
 * @param state.arms - current arms value
 * @param state.oikumeneCount - current oikumene count value
 * @param state.maxRouteRange - current max route range value
 * @returns error string if parsing fails, undefined on success
 */
function processFlag(
  flag: string,
  value: string,
  state: {
    seed: string | undefined;
    output: string | undefined;
    configPath: string | undefined;
    arms: number | undefined;
    oikumeneCount: number | undefined;
    maxRouteRange: number | undefined;
  }
): string | undefined {
  switch (flag) {
    case '--seed':
      state.seed = value;
      return undefined;
    case '--output':
      state.output = value;
      return undefined;
    case '--config':
      state.configPath = value;
      return undefined;
    case '--arms': {
      const result = parseIntegerArg(flag, value);
      if (typeof result === 'string') {
        return result;
      }
      state.arms = result;
      return undefined;
    }
    case '--oikumene-count': {
      const result = parseIntegerArg(flag, value);
      if (typeof result === 'string') {
        return result;
      }
      state.oikumeneCount = result;
      return undefined;
    }
    default: {
      // --max-route-range is the only remaining value flag
      const result = parseNumberArg(flag, value);
      if (typeof result === 'string') {
        return result;
      }
      state.maxRouteRange = result;
      return undefined;
    }
  }
}

/**
 * Parses command-line arguments into structured data.
 *
 * Validates that --seed is present and that numeric arguments are valid.
 * Returns a discriminated union indicating success or failure.
 *
 * @param argv - raw command-line arguments (without node and script path)
 * @returns parsed arguments or error
 */
export function parseArgs(argv: readonly string[]): ParseArgsResult {
  const state = {
    seed: undefined as string | undefined,
    output: undefined as string | undefined,
    configPath: undefined as string | undefined,
    arms: undefined as number | undefined,
    oikumeneCount: undefined as number | undefined,
    maxRouteRange: undefined as number | undefined,
  };
  let verbose = false;

  let i = 0;
  while (i < argv.length) {
    const flag = argv[i]!;

    if (flag === '--verbose') {
      verbose = true;
      i++;
      continue;
    }

    if (VALUE_FLAGS.has(flag)) {
      const value = argv[i + 1];
      if (value === undefined || value.startsWith('--')) {
        return { ok: false, error: `${flag} requires a value` };
      }

      const error = processFlag(flag, value, state);
      if (error !== undefined) {
        return { ok: false, error };
      }

      i += 2;
      continue;
    }

    return { ok: false, error: `Unknown argument: ${flag}` };
  }

  if (state.seed === undefined) {
    return { ok: false, error: '--seed is required' };
  }

  const args: CliArgs = {
    seed: state.seed,
    ...(state.output !== undefined ? { output: state.output } : {}),
    ...(state.arms !== undefined ? { arms: state.arms } : {}),
    ...(state.oikumeneCount !== undefined ? { oikumeneCount: state.oikumeneCount } : {}),
    ...(state.maxRouteRange !== undefined ? { maxRouteRange: state.maxRouteRange } : {}),
  };

  return { ok: true, args, configPath: state.configPath, verbose };
}

/**
 * Formats a number with comma separators for display.
 *
 * @param n - the number to format
 * @returns formatted string with comma separators
 */
function formatNumber(n: number): string {
  return n.toLocaleString('en-US');
}

/**
 * Formats the pipeline completion summary for console output.
 *
 * Matches the output format specified in the pipeline-cli.md contract.
 *
 * @param result - the pipeline execution result
 * @param config - the resolved pipeline configuration
 * @returns formatted summary string
 */
export function formatSummary(result: PipelineResult, config: PipelineConfig): string {
  const { stats, totalElapsedMs } = result;
  const timeSeconds = (totalElapsedMs / 1000).toFixed(1);

  const lines = [
    '',
    'Galaxy generation complete.',
    `  Seed: ${config.seed}`,
    `  Systems: ${formatNumber(stats.totalSystems)} (${formatNumber(stats.oikumeneSystems)} Oikumene, ${formatNumber(stats.beyondSystems)} Beyond)`,
    `  Routes: ${formatNumber(stats.oikumeneRoutes)} (avg cost: ${stats.averageRouteCost.toFixed(1)})`,
    `  Output: ${config.output}`,
    `  Time: ${timeSeconds}s`,
    '',
  ];

  return lines.join('\n');
}

/**
 * Creates a console logger for pipeline progress reporting.
 *
 * In non-verbose mode, only prints stage completion lines.
 * In verbose mode, also prints stage start messages with timing.
 *
 * @param verbose - whether to enable verbose output
 * @returns a PipelineLogger that writes to stdout
 */
export function createConsoleLogger(verbose: boolean): PipelineLogger {
  return {
    stageStart(stageNumber: number, stageName: string): void {
      if (verbose) {
        process.stdout.write(
          `  Starting [${String(stageNumber)}/${String(TOTAL_STAGES)}] ${stageName}...\n`
        );
      }
    },

    stageEnd(stageNumber: number, stageName: string, _durationMs: number, detail: string): void {
      const paddedName = stageName.padEnd(35);
      process.stdout.write(
        `[${String(stageNumber)}/${String(TOTAL_STAGES)}] ${paddedName} ${detail}\n`
      );
    },

    summary(): void {
      // Summary is handled by main() via formatSummary
    },
  };
}

/**
 * Determines if an error is a validation error (exit code 3).
 *
 * @param error - the caught error value
 * @returns true if the error is a validation error
 */
function isValidationError(error: unknown): boolean {
  return error instanceof Error && error.name === 'ValidationError';
}

/**
 * Main CLI entry point that orchestrates argument parsing, config loading,
 * validation, and pipeline execution.
 *
 * @param argv - raw command-line arguments (without node and script path)
 * @returns exit code per the pipeline-cli.md contract
 */
export async function main(argv: readonly string[]): Promise<number> {
  const parsed = parseArgs(argv);
  if (!parsed.ok) {
    process.stderr.write(`Error: ${parsed.error}\n`);
    return EXIT_INVALID_ARGS;
  }

  let fileOverrides;
  try {
    fileOverrides = await loadConfigFile(parsed.configPath);
  } catch (error: unknown) {
    process.stderr.write(`Error: ${extractErrorMessage(error)}\n`);
    return EXIT_INVALID_ARGS;
  }

  const config = resolveConfig(parsed.args, fileOverrides);

  try {
    validateConfig(config);
  } catch (error: unknown) {
    process.stderr.write(`Error: ${extractErrorMessage(error)}\n`);
    return EXIT_INVALID_ARGS;
  }

  const logger = createConsoleLogger(parsed.verbose);

  try {
    const result = await runPipeline(config, logger);
    process.stdout.write(formatSummary(result, config));
    return EXIT_SUCCESS;
  } catch (error: unknown) {
    process.stderr.write(`Error: ${extractErrorMessage(error)}\n`);
    if (isValidationError(error)) {
      return EXIT_VALIDATION_FAILURE;
    }
    return EXIT_PIPELINE_FAILURE;
  }
}
