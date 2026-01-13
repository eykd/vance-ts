# Testing Patterns Reference

## Table of Contents

- [Vitest Pool Workers Setup](#vitest-pool-workers-setup)
- [Test Setup & Migrations](#test-setup--migrations)
- [Integration Test Patterns](#integration-test-patterns)
- [Acceptance Test Patterns](#acceptance-test-patterns)
- [Test Builders](#test-builders)

---

## Vitest Pool Workers Setup

### Installation

```bash
npm install -D vitest @cloudflare/vitest-pool-workers
```

### Configuration

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
              DB: {}, // Matches wrangler.jsonc binding
            },
            kvNamespaces: ['SESSIONS'],
            bindings: {
              MIGRATIONS: migrations,
            },
          },
          isolatedStorage: true, // Critical: each test gets fresh DB
        },
      },

      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        exclude: ['node_modules/', '**/*.spec.ts', '**/*.test.ts'],
      },
    },
  };
});
```

### Package Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:unit": "vitest run --testPathPattern='\\.spec\\.ts$'",
    "test:integration": "vitest run --testPathPattern='\\.integration\\.test\\.ts$'",
    "test:acceptance": "vitest run --testPathPattern='\\.acceptance\\.test\\.ts$'"
  }
}
```

---

## Test Setup & Migrations

### Setup File

```typescript
// tests/setup.ts
import { env } from 'cloudflare:test';
import { applyD1Migrations } from '@cloudflare/vitest-pool-workers/config';
import { beforeAll, afterEach, vi } from 'vitest';

beforeAll(async () => {
  // Apply migrations before tests run
  const migrations = env.MIGRATIONS as any[];
  await applyD1Migrations(env.DB, migrations);
});

afterEach(() => {
  vi.clearAllMocks();
});
```

### Accessing Environment

```typescript
import { env, SELF } from 'cloudflare:test';

// env.DB - D1 database binding
// env.SESSIONS - KV namespace binding
// SELF - fetch worker directly
```

---

## Integration Test Patterns

### Repository Integration Tests

```typescript
// src/infrastructure/repositories/D1TaskRepository.integration.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { env } from 'cloudflare:test';
import { D1TaskRepository } from './D1TaskRepository';
import { Task } from '@domain/entities/Task';

describe('D1TaskRepository', () => {
  let repository: D1TaskRepository;

  beforeEach(() => {
    // Fresh repository for each test (isolatedStorage ensures clean DB)
    repository = new D1TaskRepository(env.DB);
  });

  describe('save and findById', () => {
    it('should persist and retrieve a task', async () => {
      const task = Task.create({ userId: 'user-1', title: 'Test task' });

      await repository.save(task);
      const found = await repository.findById(task.id);

      expect(found).not.toBeNull();
      expect(found!.id).toBe(task.id);
      expect(found!.title).toBe('Test task');
      expect(found!.isCompleted).toBe(false);
    });

    it('should return null for non-existent task', async () => {
      const found = await repository.findById('non-existent-id');
      expect(found).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all tasks ordered by creation date descending', async () => {
      const task1 = Task.create({ userId: 'user-1', title: 'First' });
      const task2 = Task.create({ userId: 'user-1', title: 'Second' });

      await repository.save(task1);
      await repository.save(task2);

      const tasks = await repository.findAll();

      expect(tasks).toHaveLength(2);
      expect(tasks[0].title).toBe('Second'); // Most recent first
    });

    it('should return empty array when no tasks exist', async () => {
      const tasks = await repository.findAll();
      expect(tasks).toEqual([]);
    });
  });

  describe('findByUserId', () => {
    it('should return only tasks for specified user', async () => {
      const task1 = Task.create({ userId: 'user-1', title: 'User 1 task' });
      const task2 = Task.create({ userId: 'user-2', title: 'User 2 task' });

      await repository.save(task1);
      await repository.save(task2);

      const user1Tasks = await repository.findByUserId('user-1');

      expect(user1Tasks).toHaveLength(1);
      expect(user1Tasks[0].userId).toBe('user-1');
    });
  });

  describe('update via save', () => {
    it('should update an existing task', async () => {
      const task = Task.create({ userId: 'user-1', title: 'Original' });
      await repository.save(task);

      task.rename('Updated');
      task.complete();
      await repository.save(task);

      const found = await repository.findById(task.id);
      expect(found!.title).toBe('Updated');
      expect(found!.isCompleted).toBe(true);
    });
  });

  describe('delete', () => {
    it('should remove a task', async () => {
      const task = Task.create({ userId: 'user-1', title: 'To delete' });
      await repository.save(task);

      await repository.delete(task.id);

      const found = await repository.findById(task.id);
      expect(found).toBeNull();
    });

    it('should not throw when deleting non-existent task', async () => {
      await expect(repository.delete('non-existent')).resolves.not.toThrow();
    });
  });
});
```

### Testing Error Scenarios

```typescript
describe('error handling', () => {
  it('should handle unique constraint violations', async () => {
    const task1 = Task.create({ userId: 'user-1', title: 'Task' });
    await repository.save(task1);

    // Manually insert duplicate (bypassing domain logic)
    await expect(
      env.DB.prepare('INSERT INTO tasks (id, user_id, title) VALUES (?, ?, ?)')
        .bind(task1.id, 'user-2', 'Duplicate')
        .run()
    ).rejects.toThrow(/UNIQUE constraint failed/);
  });
});
```

---

## Acceptance Test Patterns

### HTTP Endpoint Tests

```typescript
// src/presentation/handlers/TaskHandlers.acceptance.test.ts
import { describe, it, expect } from 'vitest';
import { SELF } from 'cloudflare:test';

describe('Task Management', () => {
  describe('POST /api/tasks', () => {
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

    it('should reject invalid title with 400', async () => {
      const formData = new FormData();
      formData.append('title', 'ab');

      const response = await SELF.fetch('http://localhost/api/tasks', {
        method: 'POST',
        body: formData,
      });

      expect(response.status).toBe(400);
      expect(await response.text()).toContain('error');
    });
  });

  describe('GET /api/tasks', () => {
    it('should list all tasks', async () => {
      // Create a task first
      const formData = new FormData();
      formData.append('title', 'Test task');
      await SELF.fetch('http://localhost/api/tasks', {
        method: 'POST',
        body: formData,
      });

      const response = await SELF.fetch('http://localhost/api/tasks');

      expect(response.status).toBe(200);
      expect(await response.text()).toContain('Test task');
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should remove a task', async () => {
      // Create task
      const formData = new FormData();
      formData.append('title', 'To delete');
      const createResponse = await SELF.fetch('http://localhost/api/tasks', {
        method: 'POST',
        body: formData,
      });

      // Extract ID from response
      const html = await createResponse.text();
      const idMatch = html.match(/hx-delete="\/api\/tasks\/([^"]+)"/);
      const taskId = idMatch![1];

      // Delete
      const deleteResponse = await SELF.fetch(`http://localhost/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      expect(deleteResponse.status).toBe(200);

      // Verify deleted
      const listResponse = await SELF.fetch('http://localhost/api/tasks');
      expect(await listResponse.text()).not.toContain('To delete');
    });
  });
});
```

---

## Test Builders

### Task Builder Pattern

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

  withId(id: string): TaskBuilder {
    this.props.id = id;
    return this;
  }

  withUserId(userId: string): TaskBuilder {
    this.props.userId = userId;
    return this;
  }

  withTitle(title: string): TaskBuilder {
    this.props.title = title;
    return this;
  }

  completed(): TaskBuilder {
    this.props.completed = true;
    return this;
  }

  createdAt(date: Date): TaskBuilder {
    this.props.createdAt = date;
    return this;
  }

  build(): Task {
    return Task.reconstitute(this.props);
  }
}

// Usage
const task = TaskBuilder.aTask()
  .withTitle('Important task')
  .withUserId('user-123')
  .completed()
  .build();
```

### Repository Test Helper

```typescript
// tests/helpers/repositoryHelper.ts
import { Task } from '@domain/entities/Task';
import { D1TaskRepository } from '@infrastructure/repositories/D1TaskRepository';

export async function seedTasks(
  repository: D1TaskRepository,
  count: number,
  overrides: Partial<{ userId: string; completed: boolean }> = {}
): Promise<Task[]> {
  const tasks: Task[] = [];

  for (let i = 0; i < count; i++) {
    const task = Task.create({
      userId: overrides.userId ?? `user-${i}`,
      title: `Task ${i + 1}`,
    });

    if (overrides.completed) {
      task.complete();
    }

    await repository.save(task);
    tasks.push(task);
  }

  return tasks;
}
```

### Test File Naming Convention

```
src/domain/entities/
├── Task.ts
└── Task.spec.ts              # Unit tests (no infrastructure)

src/infrastructure/repositories/
├── D1TaskRepository.ts
└── D1TaskRepository.integration.test.ts  # Uses real D1

src/presentation/handlers/
├── TaskHandlers.ts
└── TaskHandlers.acceptance.test.ts       # Full HTTP flow
```
