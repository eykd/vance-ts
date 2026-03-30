// ============================================================================
// Stryker Mutator Configuration — Domain & Application Layers
//
// DO NOT disable, weaken, or skip mutation testing. This gate exists because
// line coverage alone cannot prove tests verify business logic. Every surviving
// mutant is a potential undetected bug in production. If the build breaks here,
// write a better test — do not raise the threshold or exclude the file.
// ============================================================================

/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
export default {
  mutate: [
    'src/domain/**/*.ts',
    'src/application/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.test.ts',
    '!src/**/*.d.ts',
    '!src/domain/value-objects/common-passwords.ts',
  ],
  testRunner: 'vitest',
  vitest: { configFile: 'vitest.config.stryker.ts' },
  checkers: ['typescript'],
  tsconfigFile: 'tsconfig.json',
  reporters: ['html', 'json', 'clear-text', 'progress'],
  htmlReporter: { fileName: 'reports/mutation/mutation.html' },
  jsonReporter: { fileName: 'reports/mutation/mutation.json' },
  ignorePatterns: ['.claude', 'hugo'],
  thresholds: { high: 80, low: 70, break: 65 },
  concurrency: 2,
  timeoutMS: 60_000,
  timeoutFactor: 3,
};
