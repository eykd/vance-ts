# Miniflare Integration Tests

**Purpose**: Integration testing patterns for logging with Cloudflare Workers runtime using Miniflare and vitest-pool-workers.

## When to Use

Use this reference when writing integration tests for logging code that depends on Workers runtime features like AsyncLocalStorage, console.log capture, or environment bindings. Essential for validating structured JSON log emission in Workers context.

## Pattern

```typescript
// src/infrastructure/logging/integration.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Miniflare } from 'miniflare';

describe('Logging Integration', () => {
  let mf: Miniflare;
  let capturedLogs: string[] = [];

  beforeAll(async () => {
    // Capture console.log output
    const originalLog = console.log;
    console.log = (...args) => {
      capturedLogs.push(args.join(' '));
      originalLog(...args);
    };

    mf = new Miniflare({
      modules: true,
      script: `
        export default {
          async fetch(request, env) {
            console.log(JSON.stringify({
              event: "test.request",
              request_id: "test-123"
            }));
            return new Response("OK");
          }
        }
      `,
    });
  });

  afterAll(async () => {
    await mf.dispose();
  });

  it('emits structured JSON logs', async () => {
    capturedLogs = [];
    await mf.dispatchFetch('http://localhost/test');

    expect(capturedLogs.length).toBeGreaterThan(0);

    const logEntry = JSON.parse(capturedLogs[0]);
    expect(logEntry.event).toBe('test.request');
    expect(logEntry.request_id).toBe('test-123');
  });
});
```

## Testing with vitest-pool-workers

```typescript
// vitest.config.ts
import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';

export default defineWorkersConfig({
  test: {
    poolOptions: {
      workers: {
        isolatedStorage: true,
        wrangler: { configPath: './wrangler.toml' },
      },
    },
  },
});
```

```typescript
// src/infrastructure/logging/worker.test.ts
import { describe, it, expect, env } from 'vitest';

describe('Logger in Workers context', () => {
  it('accesses environment bindings', () => {
    // env is automatically available in vitest-pool-workers
    expect(env.ENVIRONMENT).toBeDefined();
  });
});
```

## Testing AsyncLocalStorage Context

```typescript
import { AsyncLocalStorage } from 'node:async_hooks';

const storage = new AsyncLocalStorage<{ requestId: string }>();

describe('AsyncLocalStorage in Workers', () => {
  it('maintains request context', async () => {
    let capturedId: string | undefined;

    await storage.run({ requestId: 'req-456' }, async () => {
      // Simulate async operation
      await new Promise((resolve) => setTimeout(resolve, 10));

      const ctx = storage.getStore();
      capturedId = ctx?.requestId;
    });

    expect(capturedId).toBe('req-456');
  });
});
```

## Edge Cases

### Console.log Spy Restoration

**Scenario**: Console spy not restored between tests
**Solution**: Use beforeEach/afterEach for spy lifecycle

```typescript
let consoleSpy: typeof console.log;

beforeEach(() => {
  consoleSpy = console.log;
  capturedLogs = [];
});

afterEach(() => {
  console.log = consoleSpy;
});
```

### Miniflare Disposal

**Scenario**: Memory leaks from undisposed Miniflare instances
**Solution**: Always call dispose() in afterAll

```typescript
afterAll(async () => {
  await mf.dispose(); // Critical: prevents memory leaks
});
```

## Common Mistakes

### ❌ Mistake: Testing logger in Node.js environment

Testing logging code without Workers runtime misses bindings and AsyncLocalStorage behavior.

```typescript
// Bad: Standard Node.js test (misses Workers context)
describe('Logger', () => {
  it('logs', () => {
    logger.info('test'); // Runs in Node, not Workers
  });
});
```

### ✅ Correct: Use vitest-pool-workers

```typescript
// Good: Tests run in Workers runtime
import { env } from 'vitest';

describe('Logger', () => {
  it('logs with Workers context', () => {
    const logger = createLogger(env.SERVICE_NAME);
    logger.info('test'); // Runs in Workers runtime
  });
});
```

## Testing Strategy

**Integration test scope**:

- Structured JSON log emission
- AsyncLocalStorage context propagation
- Environment binding access
- Console.log capture and parsing
- Request/response flow with logging

**Miniflare vs vitest-pool-workers**:

- **Miniflare**: Full Workers simulation, more setup
- **vitest-pool-workers**: Lightweight, automatic env bindings

Use vitest-pool-workers for most integration tests. Use Miniflare when testing Worker scripts as strings or complex bindings.

## Related References

- [logger-unit-tests.md](./logger-unit-tests.md) - Unit tests for logger behavior
- [vitest-cloudflare-config: BINDINGS](../../vitest-cloudflare-config/references/BINDINGS.md) - Environment binding configuration
- [vitest-integration-testing: patterns](../../vitest-integration-testing/references/patterns.md) - General integration testing patterns
