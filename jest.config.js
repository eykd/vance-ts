/** Shared settings for all Jest projects. */
const baseConfig = {
  preset: 'ts-jest',
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  transformIgnorePatterns: ['node_modules/(?!(better-sqlite3)/)'],
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
  ],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.test.ts',
    '!src/**/index.ts',
    '!src/types/**/*.ts',
    '!src/presentation/generated/**/*.ts',
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
