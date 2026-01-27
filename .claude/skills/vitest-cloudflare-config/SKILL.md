---
name: vitest-cloudflare-config
description: Configure @cloudflare/vitest-pool-workers for runtime-accurate testing of Cloudflare Workers. Use when (1) setting up vitest for Workers projects, (2) configuring D1 database or KV namespace test bindings, (3) creating test helpers for Workers, (4) setting up migrations for tests, (5) configuring coverage or watch mode for Workers tests, (6) questions about isolatedStorage, Miniflare options, or SELF/env imports.
---

# Vitest Cloudflare Workers Configuration

Configure `@cloudflare/vitest-pool-workers` for testing Workers with D1, KV, and other bindings in the actual Workers runtime.

## Runtime Constraints

**CRITICAL**: Cloudflare Workers use Web Standard APIs, NOT Node.js.

**Forbidden:**

- Node.js imports: `fs`, `path`, `process`, `crypto`, `http`, `https`, `net`, `dns`, `stream`, `buffer`
- Globals: `process.env`, `__dirname`, `__filename`, `require()`, `Buffer`
- Types: `@types/node` (use `@cloudflare/workers-types` instead)

**Required:**

- Environment: `env` parameter in `fetch(request: Request, env: Env, ctx: ExecutionContext)`
- Storage: D1 (SQL), KV (key-value), R2 (objects), Durable Objects (stateful)
- APIs: Web Standards only - `fetch`, `Request`, `Response`, `Headers`, `URL`, `crypto.subtle`, Web Streams
- Types: `@cloudflare/workers-types` with `lib: ["ES2022", "WebWorker"]`

## Installation

```bash
npm install -D vitest @cloudflare/vitest-pool-workers
```

## Basic Configuration

```typescript
// vitest.config.ts
import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';

export default defineWorkersConfig({
  test: {
    globals: true,
    include: ['src/**/*.{spec,test}.ts', 'tests/**/*.test.ts'],
    poolOptions: {
      workers: {
        wrangler: { configPath: './wrangler.jsonc' },
        miniflare: {
          compatibilityDate: '2025-01-01',
          compatibilityFlags: ['nodejs_compat'],
        },
      },
    },
  },
});
```

## D1 and KV Bindings

For D1 with migrations and KV namespaces, see [BINDINGS.md](references/BINDINGS.md).

Key points:

- Use `readD1Migrations()` to load SQL migrations
- Pass migrations via `bindings.MIGRATIONS`
- Apply migrations in `tests/setup.ts` with `applyD1Migrations()`
- Set `isolatedStorage: true` for test isolation

## Test Imports

```typescript
import { env, SELF } from 'cloudflare:test';
// env: Access bindings (env.DB, env.SESSIONS)
// SELF: Make HTTP requests to your worker
```

## Package Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:unit": "vitest run --testPathPattern='\\.spec\\.ts$'",
    "test:integration": "vitest run --testPathPattern='\\.integration\\.test\\.ts$'"
  }
}
```

## Coverage Configuration

```typescript
coverage: {
  provider: "v8",
  reporter: ["text", "json", "html"],
  exclude: ["node_modules/", "**/*.spec.ts", "**/*.test.ts"],
  thresholds: { lines: 80, functions: 80, branches: 80, statements: 80 }
}
```

## Test Patterns

For test helpers, builders, and acceptance test patterns, see [BINDINGS.md](references/BINDINGS.md).
