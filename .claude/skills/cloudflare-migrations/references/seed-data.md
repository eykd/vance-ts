# D1 Seed Data Patterns

## Table of Contents

1. [Development Seeds](#development-seeds)
2. [Migration-Based Seeding](#migration-based-seeding)
3. [Script-Based Seeding](#script-based-seeding)
4. [Test Fixtures](#test-fixtures)
5. [Environment-Specific Data](#environment-specific-data)

---

## Development Seeds

Create a dedicated seed migration for development data:

```sql
-- migrations/9999_development_seeds.sql
-- Only apply to local/development environments

-- Seed users
INSERT OR IGNORE INTO users (id, email, name, role) VALUES
  ('user_01', 'admin@example.com', 'Admin User', 'admin'),
  ('user_02', 'alice@example.com', 'Alice Smith', 'user'),
  ('user_03', 'bob@example.com', 'Bob Johnson', 'user');

-- Seed tasks
INSERT OR IGNORE INTO tasks (id, user_id, title, completed, due_date) VALUES
  ('task_01', 'user_02', 'Complete project proposal', 0, '2025-02-01'),
  ('task_02', 'user_02', 'Review documentation', 1, '2025-01-15'),
  ('task_03', 'user_03', 'Set up development environment', 1, NULL),
  ('task_04', 'user_03', 'Write unit tests', 0, '2025-01-20');
```

Apply only to local:

```bash
wrangler d1 migrations apply my-app-db --local
```

## Migration-Based Seeding

For reference/lookup data that should exist in all environments:

```sql
-- migrations/0010_seed_categories.sql
INSERT OR IGNORE INTO categories (id, name, slug) VALUES
  ('cat_work', 'Work', 'work'),
  ('cat_personal', 'Personal', 'personal'),
  ('cat_shopping', 'Shopping', 'shopping'),
  ('cat_health', 'Health', 'health');

INSERT OR IGNORE INTO priorities (id, name, level) VALUES
  ('pri_low', 'Low', 1),
  ('pri_medium', 'Medium', 2),
  ('pri_high', 'High', 3),
  ('pri_urgent', 'Urgent', 4);
```

## Script-Based Seeding

For complex or large seed data, use a TypeScript seeding script:

```typescript
// scripts/seed.ts
import { D1Database } from '@cloudflare/workers-types';

interface SeedContext {
  db: D1Database;
  environment: 'development' | 'preview' | 'production';
}

export async function seed({ db, environment }: SeedContext): Promise<void> {
  if (environment === 'production') {
    console.log('Skipping seeds in production');
    return;
  }

  // Clear existing data (development only)
  await db.exec(`
    DELETE FROM tasks;
    DELETE FROM users;
  `);

  // Seed users
  const users = [
    { id: 'user_01', email: 'admin@test.com', name: 'Admin' },
    { id: 'user_02', email: 'user@test.com', name: 'Test User' },
  ];

  for (const user of users) {
    await db
      .prepare('INSERT INTO users (id, email, name) VALUES (?, ?, ?)')
      .bind(user.id, user.email, user.name)
      .run();
  }

  // Seed tasks with realistic data
  const tasks = generateTasks(
    users.map((u) => u.id),
    20
  );
  for (const task of tasks) {
    await db
      .prepare(
        `
        INSERT INTO tasks (id, user_id, title, completed, created_at)
        VALUES (?, ?, ?, ?, ?)
      `
      )
      .bind(task.id, task.userId, task.title, task.completed ? 1 : 0, task.createdAt)
      .run();
  }

  console.log(`Seeded ${users.length} users and ${tasks.length} tasks`);
}

function generateTasks(userIds: string[], count: number) {
  const titles = [
    'Review pull request',
    'Update documentation',
    'Fix bug in login flow',
    'Implement new feature',
    'Write tests',
    'Deploy to staging',
    'Code review',
    'Team standup notes',
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: `task_${String(i + 1).padStart(3, '0')}`,
    userId: userIds[i % userIds.length],
    title: titles[i % titles.length],
    completed: Math.random() > 0.7,
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
  }));
}
```

Package script:

```json
{
  "scripts": {
    "db:seed": "wrangler d1 execute my-app-db --local --file=./scripts/seed.sql"
  }
}
```

## Test Fixtures

### Builder Pattern for Tests

```typescript
// tests/fixtures/TaskBuilder.ts
import { Task } from '@domain/entities/Task';

export class TaskBuilder {
  private props = {
    id: `task_${crypto.randomUUID().slice(0, 8)}`,
    userId: 'user_test',
    title: 'Test Task',
    completed: false,
    createdAt: new Date(),
  };

  static aTask(): TaskBuilder {
    return new TaskBuilder();
  }

  withId(id: string): this {
    this.props.id = id;
    return this;
  }

  withTitle(title: string): this {
    this.props.title = title;
    return this;
  }

  withUserId(userId: string): this {
    this.props.userId = userId;
    return this;
  }

  completed(): this {
    this.props.completed = true;
    return this;
  }

  pending(): this {
    this.props.completed = false;
    return this;
  }

  createdDaysAgo(days: number): this {
    this.props.createdAt = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return this;
  }

  build(): Task {
    return Task.reconstitute(this.props);
  }

  async insertInto(db: D1Database): Promise<Task> {
    const task = this.build();
    await db
      .prepare(
        `
        INSERT INTO tasks (id, user_id, title, completed, created_at)
        VALUES (?, ?, ?, ?, ?)
      `
      )
      .bind(
        task.id,
        task.userId,
        task.title,
        task.isCompleted ? 1 : 0,
        task.createdAt.toISOString()
      )
      .run();
    return task;
  }
}
```

Usage in tests:

```typescript
describe('TaskRepository', () => {
  it('finds completed tasks', async () => {
    // Given
    await TaskBuilder.aTask().withTitle('Done').completed().insertInto(env.DB);
    await TaskBuilder.aTask().withTitle('Pending').pending().insertInto(env.DB);

    // When
    const completed = await repository.findCompleted();

    // Then
    expect(completed).toHaveLength(1);
    expect(completed[0].title).toBe('Done');
  });
});
```

### User Builder

```typescript
// tests/fixtures/UserBuilder.ts
export class UserBuilder {
  private props = {
    id: `user_${crypto.randomUUID().slice(0, 8)}`,
    email: 'test@example.com',
    name: 'Test User',
    role: 'user',
  };

  static aUser(): UserBuilder {
    return new UserBuilder();
  }

  withId(id: string): this {
    this.props.id = id;
    return this;
  }

  withEmail(email: string): this {
    this.props.email = email;
    return this;
  }

  asAdmin(): this {
    this.props.role = 'admin';
    return this;
  }

  async insertInto(db: D1Database): Promise<typeof this.props> {
    await db
      .prepare('INSERT INTO users (id, email, name, role) VALUES (?, ?, ?, ?)')
      .bind(this.props.id, this.props.email, this.props.name, this.props.role)
      .run();
    return this.props;
  }
}
```

## Environment-Specific Data

### Conditional Seeding by Environment

```sql
-- Only seed if table is empty (safe for all environments)
INSERT INTO categories (id, name, slug)
SELECT 'cat_default', 'Default', 'default'
WHERE NOT EXISTS (SELECT 1 FROM categories LIMIT 1);
```

### Preview Environment Seeds

Create separate seed file for preview/staging:

```sql
-- migrations/9998_preview_seeds.sql
-- Apply to preview environment only

INSERT OR IGNORE INTO users (id, email, name, role) VALUES
  ('preview_admin', 'preview-admin@example.com', 'Preview Admin', 'admin');
```

Apply to specific environment:

```bash
wrangler d1 migrations apply my-app-db-preview --remote
```
