# D1 Testing Configuration

## Table of Contents

1. [Vitest Pool Workers Setup](#vitest-pool-workers-setup)
2. [Test Setup File](#test-setup-file)
3. [Isolated Storage](#isolated-storage)
4. [Integration Test Patterns](#integration-test-patterns)

---

## Vitest Pool Workers Setup

Configure vitest to load and apply D1 migrations automatically:

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
          wrangler: {
            configPath: './wrangler.jsonc',
          },
          miniflare: {
            d1Databases: {
              DB: {
                // Each test gets isolated storage
              },
            },
            kvNamespaces: ['SESSIONS'],
            bindings: {
              MIGRATIONS: migrations,
            },
          },
          isolatedStorage: true, // Critical: isolates D1/KV per test
        },
      },

      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        thresholds: {
          lines: 80,
          functions: 80,
          branches: 80,
          statements: 80,
        },
      },
    },
  };
});
```

## Test Setup File

Apply migrations before tests run:

```typescript
// tests/setup.ts
import { env } from 'cloudflare:test';
import { applyD1Migrations } from '@cloudflare/vitest-pool-workers/config';
import { beforeAll, afterEach, vi } from 'vitest';

beforeAll(async () => {
  // Apply migrations before any tests run
  const migrations = env.MIGRATIONS as any[];
  await applyD1Migrations(env.DB, migrations);
});

afterEach(() => {
  vi.clearAllMocks();
});
```

## Isolated Storage

With `isolatedStorage: true`, each test file gets its own D1/KV state. This ensures tests don't interfere with each other.

**Key behaviors:**

- Each test file starts with a fresh database
- Migrations are applied per test file
- Data inserted in one test doesn't affect others

```typescript
// test-a.spec.ts
it('creates a user', async () => {
  await db.exec("INSERT INTO users (id, email, name) VALUES ('u1', 'a@test.com', 'A')");
  // This user only exists in this test file's database
});

// test-b.spec.ts
it('has empty database', async () => {
  const { results } = await db.prepare('SELECT * FROM users').all();
  expect(results).toHaveLength(0); // Passes - isolated from test-a
});
```

## Integration Test Patterns

### Repository Integration Tests

```typescript
// src/infrastructure/repositories/D1TaskRepository.integration.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { env } from 'cloudflare:test';
import { D1TaskRepository } from './D1TaskRepository';
import { TaskBuilder } from '@tests/fixtures/TaskBuilder';
import { UserBuilder } from '@tests/fixtures/UserBuilder';

describe('D1TaskRepository', () => {
  let repository: D1TaskRepository;

  beforeEach(async () => {
    repository = new D1TaskRepository(env.DB);
    // Insert test user (required for foreign key)
    await UserBuilder.aUser().withId('test_user').insertInto(env.DB);
  });

  describe('save', () => {
    it('inserts a new task', async () => {
      const task = TaskBuilder.aTask()
        .withId('task_1')
        .withUserId('test_user')
        .withTitle('Test task')
        .build();

      await repository.save(task);

      const found = await repository.findById('task_1');
      expect(found).not.toBeNull();
      expect(found?.title).toBe('Test task');
    });

    it('updates an existing task', async () => {
      const task = await TaskBuilder.aTask().withUserId('test_user').insertInto(env.DB);

      task.complete();
      await repository.save(task);

      const found = await repository.findById(task.id);
      expect(found?.isCompleted).toBe(true);
    });
  });

  describe('findByUserId', () => {
    it('returns tasks for specific user', async () => {
      await UserBuilder.aUser().withId('other_user').insertInto(env.DB);

      await TaskBuilder.aTask().withUserId('test_user').insertInto(env.DB);
      await TaskBuilder.aTask().withUserId('test_user').insertInto(env.DB);
      await TaskBuilder.aTask().withUserId('other_user').insertInto(env.DB);

      const tasks = await repository.findByUserId('test_user');

      expect(tasks).toHaveLength(2);
    });
  });

  describe('delete', () => {
    it('removes the task', async () => {
      const task = await TaskBuilder.aTask().withUserId('test_user').insertInto(env.DB);

      await repository.delete(task.id);

      const found = await repository.findById(task.id);
      expect(found).toBeNull();
    });
  });
});
```

### Acceptance Tests with SELF

```typescript
// src/presentation/handlers/TaskHandlers.acceptance.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { env, SELF } from 'cloudflare:test';
import { UserBuilder } from '@tests/fixtures/UserBuilder';

describe('Task API', () => {
  beforeEach(async () => {
    await UserBuilder.aUser().withId('user_1').insertInto(env.DB);
  });

  describe('POST /api/tasks', () => {
    it('creates a task and returns HTML', async () => {
      const formData = new FormData();
      formData.append('title', 'New task');
      formData.append('user_id', 'user_1');

      const response = await SELF.fetch('http://localhost/api/tasks', {
        method: 'POST',
        body: formData,
      });

      expect(response.status).toBe(201);
      expect(response.headers.get('Content-Type')).toContain('text/html');

      const html = await response.text();
      expect(html).toContain('New task');
    });
  });

  describe('GET /api/tasks', () => {
    it('returns task list HTML', async () => {
      // Seed a task
      await env.DB.prepare('INSERT INTO tasks (id, user_id, title) VALUES (?, ?, ?)')
        .bind('task_1', 'user_1', 'Existing task')
        .run();

      const response = await SELF.fetch('http://localhost/api/tasks');

      expect(response.status).toBe(200);
      const html = await response.text();
      expect(html).toContain('Existing task');
    });
  });
});
```

### Direct D1 Access in Tests

```typescript
import { env } from 'cloudflare:test';

it('verifies database state directly', async () => {
  // Insert via repository
  await repository.save(task);

  // Verify directly via D1
  const row = await env.DB.prepare('SELECT * FROM tasks WHERE id = ?').bind(task.id).first();

  expect(row).toBeTruthy();
  expect(row.title).toBe(task.title);
});
```
