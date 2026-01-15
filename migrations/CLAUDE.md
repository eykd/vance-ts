# Database Migrations

D1 SQL migration files for schema changes.

## Patterns

- Zero-padded sequence: `0001_description.sql`
- Atomic changes per file
- Seed data: `9999_development_seeds.sql`

## Skills

- `/cloudflare-migrations` - Migration patterns
- `/d1-repository-implementation` - Schema design

## Examples

- `0001_initial.sql` - Initial schema
- `0002_add_tasks.sql` - Add tasks table
