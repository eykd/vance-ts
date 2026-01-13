# Bindings and Test Patterns

## Table of Contents

- [D1 Database Configuration](#d1-database-configuration)
- [KV Namespace Configuration](#kv-namespace-configuration)
- [Test Setup File](#test-setup-file)
- [Acceptance Test Patterns](#acceptance-test-patterns)
- [Integration Test Patterns](#integration-test-patterns)
- [Test Data Builders](#test-data-builders)

## D1 Database Configuration

Full vitest config with D1 migrations:

```typescript
// vitest.config.ts
import { defineWorkersConfig, readD1Migrations } from '@cloudflare/vitest-pool-workers/config';
import path from 'node:path';

export default defineWorkersConfig(async () => {
  const migrationsPath = path.join(__dirname, 'migrations');
  const migrations = await readD1Migrations(migrationsPath);

  return {
    test: {
      globals: true,
      include: ['src/**/*.{spec,test}.ts', 'tests/**/*.test.ts'],
      setupFiles: ['./tests/setup.ts'],

      poolOptions: {
        workers: {
          wrangler: { configPath: './wrangler.jsonc' },
          miniflare: {
            d1Databases: { DB: {} },
            kvNamespaces: ['SESSIONS'],
            bindings: { MIGRATIONS: migrations },
          },
          isolatedStorage: true, // Critical: each test gets fresh D1/KV state
        },
      },

      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        thresholds: { lines: 80, functions: 80, branches: 80, statements: 80 },
      },
    },
  };
});
```

## KV Namespace Configuration

Add KV namespaces to miniflare options:

```typescript
miniflare: {
  kvNamespaces: ['SESSIONS', 'CACHE', 'FEATURE_FLAGS'];
}
```

Access in tests:

```typescript
import { env } from 'cloudflare:test';

await env.SESSIONS.put('session:123', JSON.stringify({ userId: 'user-1' }));
const session = await env.SESSIONS.get('session:123');
```

## Test Setup File

```typescript
// tests/setup.ts
import { env } from 'cloudflare:test';
import { applyD1Migrations } from '@cloudflare/vitest-pool-workers/config';
import { beforeAll, afterEach, vi } from 'vitest';

beforeAll(async () => {
  const migrations = env.MIGRATIONS as any[];
  await applyD1Migrations(env.DB, migrations);
});

afterEach(() => {
  vi.clearAllMocks();
});
```

## Acceptance Test Patterns

Test complete features through HTTP using `SELF`:

```typescript
// TaskHandlers.acceptance.test.ts
import { describe, it, expect } from 'vitest';
import { SELF } from 'cloudflare:test';

describe('Task Management', () => {
  it('should create a task and return HTML', async () => {
    const formData = new FormData();
    formData.append('title', 'Buy groceries');

    const response = await SELF.fetch('http://localhost/api/tasks', {
      method: 'POST',
      body: formData,
    });

    expect(response.status).toBe(201);
    expect(response.headers.get('Content-Type')).toContain('text/html');

    const html = await response.text();
    expect(html).toContain('Buy groceries');
  });
});
```

## Integration Test Patterns

Test adapters with real bindings:

```typescript
// D1TaskRepository.integration.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { env } from 'cloudflare:test';
import { D1TaskRepository } from './D1TaskRepository';

describe('D1TaskRepository', () => {
  let repository: D1TaskRepository;

  beforeEach(() => {
    repository = new D1TaskRepository(env.DB);
  });

  it('should persist and retrieve a task', async () => {
    const task = Task.create({ userId: 'user-1', title: 'Test' });

    await repository.save(task);
    const found = await repository.findById(task.id);

    expect(found).not.toBeNull();
    expect(found!.title).toBe('Test');
  });
});
```

## Test Data Builders

Create fluent builders for test data:

```typescript
// tests/fixtures/TaskBuilder.ts
import { Task, TaskProps } from '@domain/entities/Task';

export class TaskBuilder {
  private props: TaskProps = {
    id: crypto.randomUUID(),
    userId: 'test-user',
    title: 'Default task',
    completed: false,
    createdAt: new Date(),
  };

  static aTask(): TaskBuilder {
    return new TaskBuilder();
  }

  withTitle(title: string): TaskBuilder {
    this.props.title = title;
    return this;
  }

  withUserId(userId: string): TaskBuilder {
    this.props.userId = userId;
    return this;
  }

  completed(): TaskBuilder {
    this.props.completed = true;
    return this;
  }

  build(): Task {
    return Task.reconstitute(this.props);
  }
}

// Usage:
const task = TaskBuilder.aTask().withTitle('Important task').completed().build();
```

## File Naming Conventions

| Test Type   | Pattern                 | Description                               |
| ----------- | ----------------------- | ----------------------------------------- |
| Unit        | `*.spec.ts`             | Domain entities, value objects, use cases |
| Integration | `*.integration.test.ts` | Repository + D1, SessionStore + KV        |
| Acceptance  | `*.acceptance.test.ts`  | Full feature through HTTP                 |
