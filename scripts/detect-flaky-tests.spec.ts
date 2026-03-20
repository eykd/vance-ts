import { describe, expect, it } from 'vitest';

import { detectFlakyTests, formatReport, parseJsonInput } from './detect-flaky-tests.js';
import type { VitestJsonResult } from './detect-flaky-tests.js';

// --- Fixtures ---

const cleanRun: VitestJsonResult = {
  testResults: [
    {
      name: '/app/src/math.spec.ts',
      assertionResults: [
        {
          fullName: 'math > adds numbers',
          status: 'passed',
          retryReasons: [],
        },
        {
          fullName: 'math > subtracts numbers',
          status: 'passed',
          retryReasons: [],
        },
      ],
    },
  ],
};

const flakyRun: VitestJsonResult = {
  testResults: [
    {
      name: '/app/src/api.spec.ts',
      assertionResults: [
        {
          fullName: 'api > fetches data',
          status: 'passed',
          retryReasons: ['Error: timeout'],
        },
        {
          fullName: 'api > handles errors',
          status: 'passed',
          retryReasons: [],
        },
      ],
    },
  ],
};

const multiRetryFlakyRun: VitestJsonResult = {
  testResults: [
    {
      name: '/app/src/db.spec.ts',
      assertionResults: [
        {
          fullName: 'db > connects',
          status: 'passed',
          retryReasons: ['Error: connection refused', 'Error: timeout'],
        },
      ],
    },
  ],
};

const brokenRun: VitestJsonResult = {
  testResults: [
    {
      name: '/app/src/broken.spec.ts',
      assertionResults: [
        {
          fullName: 'broken > always fails',
          status: 'failed',
          retryReasons: ['Error: attempt 1', 'Error: attempt 2'],
        },
      ],
    },
  ],
};

const mixedRun: VitestJsonResult = {
  testResults: [
    {
      name: '/app/src/stable.spec.ts',
      assertionResults: [
        {
          fullName: 'stable > works',
          status: 'passed',
          retryReasons: [],
        },
      ],
    },
    {
      name: '/app/src/flaky.spec.ts',
      assertionResults: [
        {
          fullName: 'flaky > sometimes fails',
          status: 'passed',
          retryReasons: ['Error: race condition'],
        },
      ],
    },
    {
      name: '/app/src/broken.spec.ts',
      assertionResults: [
        {
          fullName: 'broken > never works',
          status: 'failed',
          retryReasons: ['Error: bug', 'Error: still bug'],
        },
      ],
    },
  ],
};

const emptyRun: VitestJsonResult = {
  testResults: [],
};

const undefinedRetryReasons: VitestJsonResult = {
  testResults: [
    {
      name: '/app/src/old.spec.ts',
      assertionResults: [
        {
          fullName: 'old > works',
          status: 'passed',
        },
      ],
    },
  ],
};

// --- Tests ---

describe('detect-flaky-tests', () => {
  describe('parseJsonInput', () => {
    it('parses valid Vitest JSON output', () => {
      const input = JSON.stringify(cleanRun);
      const result = parseJsonInput(input);
      expect(result.testResults).toHaveLength(1);
    });

    it('throws on invalid JSON', () => {
      expect(() => parseJsonInput('not json')).toThrow(/invalid json/i);
    });

    it('throws when testResults field is missing', () => {
      expect(() => parseJsonInput('{"foo": "bar"}')).toThrow(/missing testResults/i);
    });

    it('throws on non-object JSON', () => {
      expect(() => parseJsonInput('"just a string"')).toThrow(/missing testResults/i);
    });

    it('throws on null JSON', () => {
      expect(() => parseJsonInput('null')).toThrow(/missing testResults/i);
    });
  });

  describe('detectFlakyTests', () => {
    it('returns empty report for clean run with no retries', () => {
      const report = detectFlakyTests(cleanRun);
      expect(report.flakyTests).toEqual([]);
      expect(report.totalTests).toBe(2);
      expect(report.totalFlaky).toBe(0);
    });

    it('identifies a test that passed on first retry', () => {
      const report = detectFlakyTests(flakyRun);
      expect(report.flakyTests).toEqual([
        {
          testName: 'api > fetches data',
          filePath: '/app/src/api.spec.ts',
          passedOnRetry: 1,
        },
      ]);
      expect(report.totalTests).toBe(2);
      expect(report.totalFlaky).toBe(1);
    });

    it('identifies a test that passed on second retry', () => {
      const report = detectFlakyTests(multiRetryFlakyRun);
      expect(report.flakyTests).toEqual([
        {
          testName: 'db > connects',
          filePath: '/app/src/db.spec.ts',
          passedOnRetry: 2,
        },
      ]);
    });

    it('does not report genuinely broken tests as flaky', () => {
      const report = detectFlakyTests(brokenRun);
      expect(report.flakyTests).toEqual([]);
      expect(report.totalTests).toBe(1);
      expect(report.totalFlaky).toBe(0);
    });

    it('handles mixed results: clean, flaky, and broken', () => {
      const report = detectFlakyTests(mixedRun);
      expect(report.flakyTests).toHaveLength(1);
      expect(report.flakyTests[0]?.testName).toBe('flaky > sometimes fails');
      expect(report.totalTests).toBe(3);
      expect(report.totalFlaky).toBe(1);
    });

    it('handles empty test results', () => {
      const report = detectFlakyTests(emptyRun);
      expect(report.flakyTests).toEqual([]);
      expect(report.totalTests).toBe(0);
      expect(report.totalFlaky).toBe(0);
    });

    it('treats undefined retryReasons as no retries', () => {
      const report = detectFlakyTests(undefinedRetryReasons);
      expect(report.flakyTests).toEqual([]);
      expect(report.totalTests).toBe(1);
    });
  });

  describe('formatReport', () => {
    it('formats clean report with no flaky tests', () => {
      const report = detectFlakyTests(cleanRun);
      const text = formatReport(report);
      expect(text).toContain('No flaky tests detected');
      expect(text).toContain('2 tests checked');
    });

    it('formats report with flaky tests', () => {
      const report = detectFlakyTests(flakyRun);
      const text = formatReport(report);
      expect(text).toContain('Flaky Test Report');
      expect(text).toContain('1 flaky test(s)');
      expect(text).toContain('api > fetches data');
      expect(text).toContain('/app/src/api.spec.ts');
      expect(text).toContain('Passed on retry: 1');
    });

    it('formats report with multiple flaky tests', () => {
      const multiFlaky: VitestJsonResult = {
        testResults: [
          {
            name: '/app/src/a.spec.ts',
            assertionResults: [{ fullName: 'a > test1', status: 'passed', retryReasons: ['err'] }],
          },
          {
            name: '/app/src/b.spec.ts',
            assertionResults: [
              { fullName: 'b > test2', status: 'passed', retryReasons: ['err1', 'err2'] },
            ],
          },
        ],
      };
      const report = detectFlakyTests(multiFlaky);
      const text = formatReport(report);
      expect(text).toContain('2 flaky test(s)');
      expect(text).toContain('a > test1');
      expect(text).toContain('b > test2');
      expect(text).toContain('Passed on retry: 1');
      expect(text).toContain('Passed on retry: 2');
    });

    it('formats empty run report', () => {
      const report = detectFlakyTests(emptyRun);
      const text = formatReport(report);
      expect(text).toContain('No flaky tests detected');
      expect(text).toContain('0 tests checked');
    });
  });
});
