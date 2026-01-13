# D1 Migration Patterns

## Table of Contents

1. [Creating Tables](#creating-tables)
2. [Adding Columns](#adding-columns)
3. [Indexes](#indexes)
4. [Foreign Keys](#foreign-keys)
5. [Safe Schema Changes](#safe-schema-changes)
6. [Rollback Patterns](#rollback-patterns)

---

## Creating Tables

```sql
-- migrations/0001_create_users.sql
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- DOWN:
-- DROP TABLE IF EXISTS users;
```

With foreign key relationship:

```sql
-- migrations/0002_create_tasks.sql
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  completed INTEGER DEFAULT 0,
  due_date TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- DOWN:
-- DROP TABLE IF EXISTS tasks;
```

## Adding Columns

SQLite/D1 supports `ALTER TABLE ADD COLUMN` only. Cannot modify or drop columns directly.

```sql
-- migrations/0003_add_user_avatar.sql
ALTER TABLE users ADD COLUMN avatar_url TEXT;

-- DOWN (requires table recreation):
-- See "Safe Schema Changes" for column removal pattern
```

Adding with default:

```sql
ALTER TABLE tasks ADD COLUMN priority INTEGER DEFAULT 0;
```

## Indexes

Create indexes for frequently queried columns:

```sql
-- migrations/0004_add_indexes.sql
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);

-- Composite index for common query patterns
CREATE INDEX IF NOT EXISTS idx_tasks_user_completed
  ON tasks(user_id, completed);

-- DOWN:
-- DROP INDEX IF EXISTS idx_tasks_user_completed;
-- DROP INDEX IF EXISTS idx_tasks_due_date;
-- DROP INDEX IF EXISTS idx_tasks_completed;
-- DROP INDEX IF EXISTS idx_tasks_user_id;
-- DROP INDEX IF EXISTS idx_users_email;
```

## Foreign Keys

Enable foreign keys (D1 has them enabled by default):

```sql
PRAGMA foreign_keys = ON;
```

Common patterns:

```sql
-- CASCADE: Delete child rows when parent deleted
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE

-- SET NULL: Set to NULL when parent deleted
FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL

-- RESTRICT: Prevent parent deletion if children exist
FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE RESTRICT
```

## Safe Schema Changes

### Renaming a Table

```sql
-- migrations/0005_rename_tasks_to_items.sql
ALTER TABLE tasks RENAME TO items;

-- DOWN:
-- ALTER TABLE items RENAME TO tasks;
```

### Removing/Modifying Columns (Table Recreation)

SQLite doesn't support `DROP COLUMN` or `ALTER COLUMN`. Use table recreation:

```sql
-- migrations/0006_remove_description_column.sql
-- Step 1: Create new table without the column
CREATE TABLE tasks_new (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  completed INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Step 2: Copy data
INSERT INTO tasks_new (id, user_id, title, completed, created_at)
SELECT id, user_id, title, completed, created_at FROM tasks;

-- Step 3: Drop old table
DROP TABLE tasks;

-- Step 4: Rename new table
ALTER TABLE tasks_new RENAME TO tasks;

-- Step 5: Recreate indexes
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_completed ON tasks(completed);
```

### Changing Column Type

Same pattern as removing—recreate table with new column type.

## Rollback Patterns

Since D1 migrations are forward-only, document rollback SQL in comments:

```sql
-- migrations/0007_add_tags_table.sql

-- UP
CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  color TEXT DEFAULT '#808080'
);

CREATE TABLE IF NOT EXISTS task_tags (
  task_id TEXT NOT NULL,
  tag_id TEXT NOT NULL,
  PRIMARY KEY (task_id, tag_id),
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- DOWN (execute manually if rollback needed):
-- DROP TABLE IF EXISTS task_tags;
-- DROP TABLE IF EXISTS tags;
```

### Manual Rollback Execution

```bash
# Connect to D1 and run rollback SQL manually
wrangler d1 execute my-app-db --command "DROP TABLE IF EXISTS task_tags;"
wrangler d1 execute my-app-db --command "DROP TABLE IF EXISTS tags;"
```

## Multi-Statement Migrations

D1 supports multiple statements in one migration file:

```sql
-- migrations/0008_audit_tables.sql
CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL,
  actor_id TEXT,
  changes TEXT,  -- JSON
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_actor ON audit_log(actor_id);
CREATE INDEX idx_audit_created ON audit_log(created_at);
```
