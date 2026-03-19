import { cloudflareTest } from '@cloudflare/vitest-pool-workers';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      {
        plugins: [
          cloudflareTest({
            wrangler: { configPath: './wrangler.toml' },
            isolatedStorage: true, // Explicit; prevents regression if default changes
          }),
        ],
        test: {
          name: 'workers',
          globals: true,
          include: ['src/**/*.spec.ts'],
        },
      },
      {
        test: {
          name: 'node',
          globals: true,
          include: ['acceptance/**/*.spec.ts', 'scripts/**/*.spec.ts', '.claude/**/*.spec.ts'],
          exclude: ['.claude/worktrees/**'],
          environment: 'node',
        },
      },
      {
        plugins: [
          cloudflareTest({
            wrangler: { configPath: './wrangler.toml' },
            isolatedStorage: true, // Per-test D1+DO storage rollback (explicit; default is true)
            miniflare: {
              bindings: {
                BETTER_AUTH_SECRET: 'test-acceptance-suite-secret-minimum-32-chars',
                BETTER_AUTH_URL: 'https://example.com',
                // eslint-disable-next-line no-restricted-globals -- vitest config runs in Node, not Workers
                DETECT_STATE_LEAKS: process.env['DETECT_STATE_LEAKS'] ?? '',
              },
            },
          }),
        ],
        test: {
          name: 'acceptance',
          globals: true,
          testTimeout: 30_000,
          include: ['generated-acceptance-tests/**/*.spec.ts'],
          setupFiles: ['./generated-acceptance-tests/setup.ts'],
        },
      },
    ],
    coverage: {
      provider: 'v8',
      // Coverage is collected only for Node.js-based code (acceptance pipeline).
      // The src/ workers code runs in the Workers runtime which does not support
      // node:inspector (required by v8 coverage). Workers tests are validated
      // by the workers project but cannot contribute to v8 coverage reports.
      include: ['acceptance/**/*.ts'],
      exclude: [
        '**/*.spec.ts',
        'acceptance/pipeline.ts',
        'acceptance/types.ts',
        'generated-acceptance-tests/**',
      ],
      thresholds: {
        branches: 100,
        functions: 100,
        lines: 100,
        statements: 100,
      },
    },
  },
});
