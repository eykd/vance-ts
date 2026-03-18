/**
 * Flaky test detection for CI.
 *
 * Parses Vitest JSON reporter output and identifies tests that passed
 * only after being retried (i.e., flaky tests). Outputs a structured
 * JSON report to stdout.
 *
 * Usage: npx tsx scripts/detect-flaky-tests.ts <test-results.json>
 *
 * Exit codes:
 * 0 - Success (regardless of whether flaky tests were found)
 * 1 - Script error (malformed input, missing file, etc.)
 */

import { readFileSync } from 'node:fs';
import process from 'node:process';

// --- Types ---

/** Subset of Vitest JSON reporter output needed for flaky detection. */
export interface VitestJsonResult {
  /** Array of test file results. */
  testResults: VitestTestFile[];
}

/** A test file's results in Vitest JSON output. */
export interface VitestTestFile {
  /** Absolute path to the test file. */
  name: string;
  /** Individual test assertion results within this file. */
  assertionResults: VitestAssertionResult[];
}

/** A single test assertion result in Vitest JSON output. */
export interface VitestAssertionResult {
  /** Full name including describe block ancestry. */
  fullName: string;
  /** Final test status after all retry attempts. */
  status: string;
  /** Error messages from failed retry attempts before the final result. */
  retryReasons?: string[];
}

/** A test identified as flaky (passed only after retry). */
export interface FlakyTest {
  /** Full test name including describe ancestry. */
  testName: string;
  /** Path to the test file. */
  filePath: string;
  /** Which retry attempt the test passed on (1 = first retry, 2 = second, etc.). */
  passedOnRetry: number;
}

/** Report of flaky test detection results. */
export interface FlakyTestReport {
  /** List of tests identified as flaky. */
  flakyTests: FlakyTest[];
  /** Total number of tests examined. */
  totalTests: number;
  /** Number of flaky tests found. */
  totalFlaky: number;
}

// --- Pure functions ---

/**
 * Parse raw JSON string into a validated VitestJsonResult.
 *
 * @param input - raw JSON string from Vitest JSON reporter
 * @returns parsed and validated result
 * @throws {Error} if input is not valid JSON or missing required fields
 */
export function parseJsonInput(input: string): VitestJsonResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(input) as unknown;
  } catch {
    throw new Error('Invalid JSON input');
  }

  if (typeof parsed !== 'object' || parsed === null || !('testResults' in parsed)) {
    throw new Error('Invalid Vitest JSON output: missing testResults field');
  }

  return parsed as VitestJsonResult;
}

/**
 * Detect flaky tests from Vitest JSON results.
 *
 * A test is considered flaky if it ultimately passed (status "passed")
 * but required one or more retries (retryReasons has entries).
 *
 * @param results - parsed Vitest JSON reporter output
 * @returns report containing identified flaky tests
 */
export function detectFlakyTests(results: VitestJsonResult): FlakyTestReport {
  const flakyTests: FlakyTest[] = [];
  let totalTests = 0;

  for (const file of results.testResults) {
    for (const test of file.assertionResults) {
      totalTests++;
      const retryCount = test.retryReasons?.length ?? 0;
      if (test.status === 'passed' && retryCount > 0) {
        flakyTests.push({
          testName: test.fullName,
          filePath: file.name,
          passedOnRetry: retryCount,
        });
      }
    }
  }

  return {
    flakyTests,
    totalTests,
    totalFlaky: flakyTests.length,
  };
}

/**
 * Format a flaky test report as human-readable text.
 *
 * @param report - flaky test detection report
 * @returns formatted text report
 */
export function formatReport(report: FlakyTestReport): string {
  if (report.totalFlaky === 0) {
    return `No flaky tests detected (${report.totalTests} tests checked).`;
  }

  const lines = [
    'Flaky Test Report',
    '=================',
    '',
    `Found ${report.totalFlaky} flaky test(s) out of ${report.totalTests}:`,
    '',
  ];

  for (const [index, test] of report.flakyTests.entries()) {
    lines.push(`  ${index + 1}. ${test.testName}`);
    lines.push(`     File: ${test.filePath}`);
    lines.push(`     Passed on retry: ${test.passedOnRetry}`);
    lines.push('');
  }

  return lines.join('\n');
}

// --- CLI entry point ---

/**
 * CLI main function. Reads Vitest JSON from a file argument,
 * detects flaky tests, and outputs the report as JSON to stdout.
 */
function main(): void {
  const filePath = process.argv[2];
  if (filePath === undefined || filePath === '') {
    process.stderr.write('Usage: npx tsx scripts/detect-flaky-tests.ts <test-results.json>\n');
    process.exit(1);
  }

  const input = readFileSync(filePath, 'utf-8');
  const results = parseJsonInput(input);
  const report = detectFlakyTests(results);

  // Human-readable to stderr (visible in CI logs)
  process.stderr.write(formatReport(report) + '\n');

  // Machine-readable JSON to stdout (for CI parsing)
  process.stdout.write(JSON.stringify(report, null, 2) + '\n');
}

// Only run CLI when executed directly (not when imported by tests)
const isDirectExecution = process.argv[1]?.includes('detect-flaky-tests');
if (isDirectExecution === true) {
  try {
    main();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`Error: ${message}\n`);
    process.exit(1);
  }
}
