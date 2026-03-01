import { defineWorkersProject } from '@cloudflare/vitest-pool-workers/config';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      defineWorkersProject({
        test: {
          name: 'workers',
          globals: true,
          include: ['src/**/*.spec.ts'],
          poolOptions: {
            workers: {
              wrangler: { configPath: './wrangler.toml' },
            },
          },
        },
      }),
      {
        test: {
          name: 'node',
          globals: true,
          include: [
            'acceptance/**/*.spec.ts',
            'scripts/**/*.spec.ts',
            '.claude/**/*.spec.ts',
            'tools/**/*.spec.ts',
          ],
          exclude: ['.claude/worktrees/**'],
          environment: 'node',
        },
      },
      defineWorkersProject({
        test: {
          name: 'acceptance',
          globals: true,
          include: ['generated-acceptance-tests/**/*.spec.ts'],
          setupFiles: ['./generated-acceptance-tests/setup.ts'],
          poolOptions: {
            workers: {
              wrangler: { configPath: './wrangler.toml' },
              miniflare: {
                bindings: {
                  BETTER_AUTH_SECRET: 'test-acceptance-suite-secret-minimum-32-chars',
                  BETTER_AUTH_URL: 'https://example.com',
                },
              },
            },
          },
        },
      }),
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
