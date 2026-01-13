---
name: d1-repository-implementation
description: Implement repository interfaces using Cloudflare D1 database. Use when creating D1 repositories for Clean Architecture, writing D1 migration files, setting up type-safe database queries, implementing integration tests with @cloudflare/vitest-pool-workers, or handling D1 connection pooling and errors. Triggers on D1 repository, D1 migration, Cloudflare database, SQLite edge database, vitest-pool-workers testing, or D1TaskRepository patterns.
---

# D1 Repository Implementation

Implement repository pattern with Cloudflare D1 (SQLite at the edge) following Clean Architecture principles.

## Quick Reference

```
src/
├── domain/interfaces/       # Repository interfaces (ports)
│   └── TaskRepository.ts
├── infrastructure/repositories/  # D1 implementations (adapters)
│   ├── D1TaskRepository.ts
│   └── D1TaskRepository.integration.test.ts
migrations/
└── 0001_initial.sql         # D1 migrations
```

## Workflow

### 1. Define Repository Interface (Domain Layer)

```typescript
// src/domain/interfaces/TaskRepository.ts
import type { Task } from '../entities/Task';

export interface TaskRepository {
  findById(id: string): Promise<Task | null>;
  findAll(): Promise<Task[]>;
  findByUserId(userId: string): Promise<Task[]>;
  save(task: Task): Promise<void>;
  delete(id: string): Promise<void>;
}
```

### 2. Create Migration

```sql
-- migrations/0001_create_tasks.sql
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  completed INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
```

Apply: `wrangler d1 migrations apply DB_NAME --local`

### 3. Implement Repository

```typescript
// src/infrastructure/repositories/D1TaskRepository.ts
import type { TaskRepository } from '@domain/interfaces/TaskRepository';
import { Task } from '@domain/entities/Task';

interface TaskRow {
  id: string;
  user_id: string;
  title: string;
  completed: number; // SQLite: 0/1 for boolean
  created_at: string;
  updated_at: string;
}

export class D1TaskRepository implements TaskRepository {
  constructor(private db: D1Database) {}

  async findById(id: string): Promise<Task | null> {
    const row = await this.db.prepare('SELECT * FROM tasks WHERE id = ?').bind(id).first<TaskRow>();
    return row ? this.toDomain(row) : null;
  }

  async save(task: Task): Promise<void> {
    await this.db
      .prepare(
        `
        INSERT INTO tasks (id, user_id, title, completed, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          title = excluded.title,
          completed = excluded.completed,
          updated_at = excluded.updated_at
      `
      )
      .bind(
        task.id,
        task.userId,
        task.title,
        task.isCompleted ? 1 : 0,
        task.createdAt.toISOString(),
        new Date().toISOString()
      )
      .run();
  }

  async delete(id: string): Promise<void> {
    await this.db.prepare('DELETE FROM tasks WHERE id = ?').bind(id).run();
  }

  private toDomain(row: TaskRow): Task {
    return Task.reconstitute({
      id: row.id,
      userId: row.user_id,
      title: row.title,
      completed: row.completed === 1,
      createdAt: new Date(row.created_at),
    });
  }
}
```

### 4. Write Integration Tests

See [testing-patterns.md](references/testing-patterns.md) for full setup.

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
    expect(found?.title).toBe('Test');
  });
});
```

## Key Patterns

| Pattern                       | Use                                   |
| ----------------------------- | ------------------------------------- |
| `prepare().bind().first<T>()` | Single row queries                    |
| `prepare().bind().all<T>()`   | Multiple rows (returns `{ results }`) |
| `prepare().bind().run()`      | INSERT/UPDATE/DELETE                  |
| `ON CONFLICT DO UPDATE`       | Upsert pattern                        |

## Detailed References

- **D1 SQL patterns, type mapping, error handling**: See [d1-patterns.md](references/d1-patterns.md)
- **Vitest pool-workers setup, integration testing**: See [testing-patterns.md](references/testing-patterns.md)
