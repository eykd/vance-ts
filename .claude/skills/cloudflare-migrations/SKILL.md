---
name: cloudflare-migrations
description: Create and manage D1 database migrations for Cloudflare Workers projects. Use when needing to (1) create D1 migration files with proper schema changes, (2) write up/down migration scripts for reversibility, (3) handle schema changes safely (add/alter/drop tables, columns, indexes), (4) seed development/testing data, (5) set up migration version control strategy, or (6) configure migrations for testing with vitest-pool-workers.
---

# Cloudflare D1 Migrations

## Migration Location & Naming

Place migrations in `migrations/` at project root:

```
migrations/
├── 0001_initial.sql
├── 0002_add_users.sql
└── 0003_add_indexes.sql
```

Naming: `{sequence}_{description}.sql` — sequence is zero-padded 4-digit number.

## Core Migration Structure

```sql
-- migrations/0001_initial.sql
-- UP: Create tables
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- DOWN (comment block for reference, executed manually if needed):
-- DROP INDEX IF EXISTS idx_users_email;
-- DROP TABLE IF EXISTS users;
```

D1 migrations are forward-only by default. Document rollback SQL in comments for manual execution when needed.

## Wrangler Commands

```bash
# Local development
wrangler d1 migrations apply my-app-db --local

# Production
wrangler d1 migrations apply my-app-db --remote

# Check status
wrangler d1 migrations list my-app-db --remote
```

## Package Scripts

```json
{
  "scripts": {
    "db:migrate": "wrangler d1 migrations apply my-app-db --remote",
    "db:migrate:local": "wrangler d1 migrations apply my-app-db --local"
  }
}
```

## Reference Guides

- **Schema changes & patterns**: See [references/migration-patterns.md](references/migration-patterns.md) for safe schema modifications, adding/altering/dropping tables and columns, foreign keys, and transaction handling.
- **Seed data**: See [references/seed-data.md](references/seed-data.md) for development/testing data setup and test fixture patterns.
- **Testing config**: See [references/testing-config.md](references/testing-config.md) for vitest-pool-workers migration setup.

## SQLite/D1 Type Reference

| Type    | Usage                                  |
| ------- | -------------------------------------- |
| TEXT    | Strings, UUIDs, ISO timestamps         |
| INTEGER | Booleans (0/1), counts, auto-increment |
| REAL    | Floating point                         |
| BLOB    | Binary data                            |

Use `TEXT` for IDs (UUIDs), timestamps (ISO 8601 strings), and JSON storage.
