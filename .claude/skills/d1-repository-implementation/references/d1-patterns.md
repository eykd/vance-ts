# D1 Patterns Reference

## Table of Contents

- [Type Mapping](#type-mapping)
- [Query Patterns](#query-patterns)
- [Migration Patterns](#migration-patterns)
- [Error Handling](#error-handling)
- [Connection & Performance](#connection--performance)

---

## Type Mapping

### TypeScript ↔ SQLite

| TypeScript     | SQLite              | Notes                                  |
| -------------- | ------------------- | -------------------------------------- |
| `string`       | `TEXT`              | UUIDs, dates as ISO strings            |
| `number`       | `INTEGER` or `REAL` | Use INTEGER for IDs, REAL for decimals |
| `boolean`      | `INTEGER`           | 0 = false, 1 = true                    |
| `Date`         | `TEXT`              | Store as ISO 8601 string               |
| `object/array` | `TEXT`              | JSON.stringify for storage             |

### Row Type Definition

```typescript
interface TaskRow {
  id: string;
  user_id: string; // snake_case for SQL columns
  title: string;
  completed: number; // 0 or 1
  metadata: string | null; // JSON string
  created_at: string; // ISO timestamp
}
```

### Domain Mapping

```typescript
private toDomain(row: TaskRow): Task {
  return Task.reconstitute({
    id: row.id,
    userId: row.user_id,                    // snake → camel
    title: row.title,
    completed: row.completed === 1,         // number → boolean
    metadata: row.metadata ? JSON.parse(row.metadata) : null,
    createdAt: new Date(row.created_at)     // string → Date
  });
}

private toRow(entity: Task): Partial<TaskRow> {
  return {
    id: entity.id,
    user_id: entity.userId,
    title: entity.title,
    completed: entity.isCompleted ? 1 : 0,
    metadata: entity.metadata ? JSON.stringify(entity.metadata) : null
  };
}
```

---

## Query Patterns

### Single Row

```typescript
async findById(id: string): Promise<Task | null> {
  const row = await this.db
    .prepare("SELECT * FROM tasks WHERE id = ?")
    .bind(id)
    .first<TaskRow>();
  return row ? this.toDomain(row) : null;
}
```

### Multiple Rows

```typescript
async findAll(): Promise<Task[]> {
  const { results } = await this.db
    .prepare("SELECT * FROM tasks ORDER BY created_at DESC")
    .all<TaskRow>();
  return results.map(row => this.toDomain(row));
}

async findByUserId(userId: string): Promise<Task[]> {
  const { results } = await this.db
    .prepare("SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC")
    .bind(userId)
    .all<TaskRow>();
  return results.map(row => this.toDomain(row));
}
```

### Pagination

```typescript
async findPaginated(limit: number, offset: number): Promise<{ tasks: Task[]; total: number }> {
  const countResult = await this.db
    .prepare("SELECT COUNT(*) as total FROM tasks")
    .first<{ total: number }>();

  const { results } = await this.db
    .prepare("SELECT * FROM tasks ORDER BY created_at DESC LIMIT ? OFFSET ?")
    .bind(limit, offset)
    .all<TaskRow>();

  return {
    tasks: results.map(row => this.toDomain(row)),
    total: countResult?.total ?? 0
  };
}
```

### Upsert (Insert or Update)

```typescript
async save(task: Task): Promise<void> {
  const now = new Date().toISOString();
  await this.db
    .prepare(`
      INSERT INTO tasks (id, user_id, title, completed, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        completed = excluded.completed,
        updated_at = excluded.updated_at
    `)
    .bind(
      task.id,
      task.userId,
      task.title,
      task.isCompleted ? 1 : 0,
      task.createdAt.toISOString(),
      now
    )
    .run();
}
```

### Batch Operations

```typescript
async saveAll(tasks: Task[]): Promise<void> {
  const statements = tasks.map(task =>
    this.db
      .prepare(`
        INSERT INTO tasks (id, user_id, title, completed, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          title = excluded.title,
          completed = excluded.completed,
          updated_at = excluded.updated_at
      `)
      .bind(
        task.id,
        task.userId,
        task.title,
        task.isCompleted ? 1 : 0,
        task.createdAt.toISOString(),
        new Date().toISOString()
      )
  );

  await this.db.batch(statements);
}
```

### Transactions

```typescript
async transferOwnership(taskId: string, fromUser: string, toUser: string): Promise<void> {
  const statements = [
    this.db
      .prepare("UPDATE tasks SET user_id = ?, updated_at = ? WHERE id = ? AND user_id = ?")
      .bind(toUser, new Date().toISOString(), taskId, fromUser),
    this.db
      .prepare("INSERT INTO task_history (task_id, action, from_user, to_user) VALUES (?, ?, ?, ?)")
      .bind(taskId, "transfer", fromUser, toUser)
  ];

  await this.db.batch(statements);  // Atomic execution
}
```

---

## Migration Patterns

### Naming Convention

```
migrations/
├── 0001_initial.sql
├── 0002_add_tasks.sql
├── 0003_add_task_indexes.sql
└── 0004_add_user_preferences.sql
```

### Common Schema Patterns

```sql
-- Primary key with UUID
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  -- ...
);

-- Foreign key with cascade delete
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for common queries
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_completed ON tasks(completed);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);

-- Composite index for compound queries
CREATE INDEX idx_tasks_user_completed ON tasks(user_id, completed);

-- Unique constraint
CREATE UNIQUE INDEX idx_users_email ON users(email);
```

### Safe Migrations

```sql
-- Always use IF NOT EXISTS
CREATE TABLE IF NOT EXISTS new_table (...);
CREATE INDEX IF NOT EXISTS idx_name ON table(column);

-- For column additions (SQLite limitations)
ALTER TABLE tasks ADD COLUMN priority INTEGER DEFAULT 0;

-- Note: SQLite doesn't support DROP COLUMN directly
-- Use table recreation pattern for complex changes
```

### Apply Migrations

```bash
# Local development
wrangler d1 migrations apply my-app-db --local

# Production
wrangler d1 migrations apply my-app-db

# Create new migration
wrangler d1 migrations create my-app-db add_priority_column
```

---

## Error Handling

### D1 Error Types

```typescript
import { D1Error } from "@cloudflare/workers-types";

async save(task: Task): Promise<void> {
  try {
    await this.db.prepare(/*...*/).run();
  } catch (error) {
    if (error instanceof Error) {
      // Unique constraint violation
      if (error.message.includes("UNIQUE constraint failed")) {
        throw new DuplicateEntityError(`Task with id ${task.id} already exists`);
      }
      // Foreign key violation
      if (error.message.includes("FOREIGN KEY constraint failed")) {
        throw new ReferenceError(`Referenced entity does not exist`);
      }
      // General database error
      throw new DatabaseError(`Database operation failed: ${error.message}`);
    }
    throw error;
  }
}
```

### Custom Error Classes

```typescript
// src/domain/errors/index.ts
export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class EntityNotFoundError extends DomainError {}
export class DuplicateEntityError extends DomainError {}
export class DatabaseError extends DomainError {}
```

### Repository with Error Handling

```typescript
async findByIdOrThrow(id: string): Promise<Task> {
  const task = await this.findById(id);
  if (!task) {
    throw new EntityNotFoundError(`Task with id ${id} not found`);
  }
  return task;
}

async delete(id: string): Promise<void> {
  const result = await this.db
    .prepare("DELETE FROM tasks WHERE id = ?")
    .bind(id)
    .run();

  if (result.meta.changes === 0) {
    throw new EntityNotFoundError(`Task with id ${id} not found`);
  }
}
```

---

## Connection & Performance

### D1 Characteristics

- **No connection pooling needed**: D1 manages connections automatically
- **Edge-local**: Database runs close to the Worker
- **SQLite-based**: Standard SQLite query patterns apply
- **Automatic retries**: D1 handles transient failures

### Performance Best Practices

```typescript
// Use batch for multiple operations
await this.db.batch([stmt1, stmt2, stmt3]);

// Use indexes for WHERE/ORDER BY columns
// SELECT with specific columns instead of *
const { results } = await this.db
  .prepare('SELECT id, title, completed FROM tasks WHERE user_id = ?')
  .bind(userId)
  .all<Pick<TaskRow, 'id' | 'title' | 'completed'>>();

// Limit results for large tables
const { results } = await this.db.prepare('SELECT * FROM tasks LIMIT 100').all<TaskRow>();
```

### Wrangler Configuration

```jsonc
// wrangler.jsonc
{
  "d1_databases": [
    {
      "binding": "DB", // Access via env.DB
      "database_name": "my-app-db",
      "database_id": "your-database-id",
    },
  ],
}
```

### Type Generation

```bash
# Generate types including D1Database binding
wrangler types

# Creates worker-configuration.d.ts with:
# interface Env { DB: D1Database; ... }
```

---

## Anti-Patterns

### ❌ Anti-Pattern: Database Schemas in Domain

**WRONG**: Domain entities knowing about database structure.

```typescript
// ❌ Domain entity with database methods
export class Task {
  constructor(
    private id: string,
    private title: string,
    private completed: boolean
  ) {}

  // ❌ Domain knows about database row structure
  toRow(): TaskRow {
    return {
      id: this.id,
      title: this.title,
      completed: this.completed ? 1 : 0, // ❌ DB encoding in domain
      user_id: this.userId, // ❌ snake_case leaks into domain
    };
  }

  // ❌ Static factory that knows about database rows
  static fromRow(row: TaskRow): Task {
    return new Task(row.id, row.title, row.completed === 1);
  }
}
```

**Problems**:

1. **Breaks Clean Architecture**: Domain depends on infrastructure details
2. **Tight coupling**: Database changes require domain changes
3. **Type pollution**: snake_case database conventions leak into domain
4. **Encoding knowledge**: Domain must know how booleans map to integers
5. **Not testable**: Domain tests depend on database row structure

**CORRECT**: Domain entities are pure, repository handles mapping.

```typescript
// ✅ Pure domain entity
export class Task {
  private constructor(
    private readonly id: TaskId,
    private title: string,
    private completed: boolean
  ) {}

  // ✅ Factory from domain types only
  static create(props: { title: string }): Task {
    return new Task(TaskId.generate(), props.title, false);
  }

  // ✅ Reconstitute from domain types (for repository)
  static reconstitute(props: { id: TaskId; title: string; completed: boolean }): Task {
    return new Task(props.id, props.title, props.completed);
  }

  // ✅ Domain methods only
  complete(): void {
    if (this.completed) {
      throw new DomainError('Task already completed');
    }
    this.completed = true;
  }

  // ✅ Getters for domain state
  getId(): TaskId {
    return this.id;
  }

  getTitle(): string {
    return this.title;
  }

  isCompleted(): boolean {
    return this.completed;
  }
}
```

**Repository handles all mapping**:

```typescript
// ✅ Repository in infrastructure layer handles mapping
export class D1TaskRepository implements TaskRepository {
  constructor(private readonly db: D1Database) {}

  async save(task: Task): Promise<void> {
    const query = `
      INSERT INTO tasks (id, title, completed)
      VALUES (?, ?, ?)
    `;

    // ✅ Mapping happens in infrastructure
    await this.db
      .prepare(query)
      .bind(
        task.getId().toString(), // ✅ Extract via getters
        task.getTitle(),
        task.isCompleted() ? 1 : 0 // ✅ Boolean → integer conversion here
      )
      .run();
  }

  async findById(id: TaskId): Promise<Task | null> {
    const row = await this.db
      .prepare('SELECT * FROM tasks WHERE id = ?')
      .bind(id.toString())
      .first<TaskRow>();

    if (!row) {
      return null;
    }

    // ✅ Mapping from row to domain happens here
    return this.toDomain(row);
  }

  private toDomain(row: TaskRow): Task {
    return Task.reconstitute({
      id: TaskId.fromString(row.id),
      title: row.title,
      completed: row.completed === 1, // ✅ Integer → boolean conversion here
    });
  }
}
```

**Repository interface in domain**:

```typescript
// ✅ Interface in domain/interfaces/TaskRepository.ts
export interface TaskRepository {
  save(task: Task): Promise<void>;
  findById(id: TaskId): Promise<Task | null>;
  findByTitle(title: string): Promise<Task[]>;
}
```

### ❌ Anti-Pattern: Anemic Domain Model

**WRONG**: Domain entities are just data bags.

```typescript
// ❌ Anemic domain model (just getters/setters)
export class Task {
  constructor(
    public id: string,
    public title: string,
    public completed: boolean
  ) {}

  // No business logic - just data
}

// ❌ Business logic in use case (service layer)
export class CompleteTaskUseCase {
  async execute(taskId: string): Promise<void> {
    const task = await this.repository.findById(taskId);

    // ❌ Business rule in use case, not domain
    if (task.completed) {
      throw new Error('Task already completed');
    }

    task.completed = true; // ❌ Direct field access
    await this.repository.save(task);
  }
}
```

**CORRECT**: Domain entities contain business logic.

```typescript
// ✅ Rich domain model with business logic
export class Task {
  private constructor(
    private readonly id: TaskId,
    private title: string,
    private completed: boolean
  ) {}

  // ✅ Business logic in domain
  complete(): void {
    if (this.completed) {
      throw new DomainError('Task already completed'); // ✅ Domain error
    }
    this.completed = true;
  }

  rename(newTitle: string): void {
    if (!newTitle || newTitle.trim().length === 0) {
      throw new ValidationError('Title cannot be empty');
    }
    this.title = newTitle.trim();
  }

  // ✅ Encapsulated state
  isCompleted(): boolean {
    return this.completed;
  }
}

// ✅ Use case orchestrates, doesn't contain business logic
export class CompleteTaskUseCase {
  async execute(taskId: TaskId): Promise<Result<Task, NotFoundError>> {
    const task = await this.repository.findById(taskId);

    if (!task) {
      return err(new NotFoundError('Task not found'));
    }

    // ✅ Business logic delegated to domain
    task.complete();

    await this.repository.save(task);
    return ok(task);
  }
}
```

### ❌ Anti-Pattern: Exposing Row Types

**WRONG**: Row types exposed outside repository.

```typescript
// ❌ Row type exposed in public API
export interface TaskRow {
  id: string;
  user_id: string; // ❌ snake_case leaks
  completed: number; // ❌ DB encoding leaks
}

export class D1TaskRepository {
  // ❌ Returns database row type
  async getRaw(id: string): Promise<TaskRow | null> {
    return this.db.prepare('SELECT * FROM tasks WHERE id = ?').bind(id).first<TaskRow>();
  }
}
```

**CORRECT**: Row types are private to repository.

```typescript
// ✅ Row type is private to repository implementation
interface TaskRow {
  id: string;
  user_id: string;
  completed: number;
}

export class D1TaskRepository implements TaskRepository {
  // ✅ Returns domain entity only
  async findById(id: TaskId): Promise<Task | null> {
    const row = await this.db
      .prepare('SELECT * FROM tasks WHERE id = ?')
      .bind(id.toString())
      .first<TaskRow>();

    if (!row) {
      return null;
    }

    return this.toDomain(row); // ✅ Maps to domain
  }

  // ✅ Private mapping method
  private toDomain(row: TaskRow): Task {
    return Task.reconstitute({
      id: TaskId.fromString(row.id),
      title: row.title,
      completed: row.completed === 1,
    });
  }
}
```

### Checklist: Clean Repository Pattern

- [ ] Domain entities have NO `toRow()` or `fromRow()` methods
- [ ] Domain entities have NO knowledge of database structure
- [ ] Repository interface defined in `domain/interfaces/`
- [ ] Repository implementation in `infrastructure/repositories/`
- [ ] Row types are private to repository implementation
- [ ] All mapping (snake_case, type conversions) happens in repository
- [ ] Domain entities use value objects (TaskId, UserId, Email)
- [ ] Business logic in domain entities, NOT in use cases
- [ ] Use cases orchestrate, domain entities encapsulate logic

## Related Skills

- **ddd-domain-modeling**: Entity design, value objects, domain services
- **clean-architecture-validator**: Layer boundaries, dependency rules
- **error-handling-patterns**: Result types, error hierarchies
- **quality-review**: Domain modeling standards
