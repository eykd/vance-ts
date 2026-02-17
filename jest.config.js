/** Shared settings for all Jest projects. */
const baseConfig = {
  preset: 'ts-jest',
  transform: {
    '^.+\\.ts$': 'ts-jest',
    '^.+\\.js$': 'ts-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(better-sqlite3|@noble/hashes|simplex-noise|fast-png|iobuffer)/)',
  ],
  moduleFileExtensions: ['ts', 'js', 'json'],
  testTimeout: 10000,
};

module.exports = {
  /**
   * Workers project: src/ code targeting the Cloudflare Workers runtime.
   * Uses a custom environment that strips Node-specific globals (Buffer,
   * setImmediate, clearImmediate) to catch accidental Node.js usage.
   *
   * Node project: scripts/ and .claude/ tooling that runs in Node.js
   * at build time. Full Node.js globals available.
   */
  projects: [
    {
      ...baseConfig,
      displayName: 'workers',
      testEnvironment: '<rootDir>/jest.env.worker.js',
      roots: ['<rootDir>/src'],
      testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
    },
    {
      ...baseConfig,
      displayName: 'node',
      testEnvironment: 'node',
      roots: ['<rootDir>/scripts', '<rootDir>/.claude'],
      testMatch: ['**/?(*.)+(spec|test).{ts,js}'],
    },
    {
      ...baseConfig,
      displayName: 'tools',
      testEnvironment: 'node',
      roots: ['<rootDir>/tools'],
      testMatch: ['**/?(*.)+(spec|test).ts'],
    },
  ],
  collectCoverageFrom: [
    'src/**/*.ts',
    'tools/**/src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.test.ts',
    '!src/**/index.ts',
    '!src/types/**/*.ts',
    '!src/presentation/generated/**/*.ts',
    '!tools/**/*.d.ts',
    '!tools/**/*.spec.ts',
    '!tools/**/*.test.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
};
