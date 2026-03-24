# Quickstart: Galaxy Seed to D1

**Branch**: `015-galaxy-seed-d1`

## Prerequisites

- Galaxy generator output directory (run `tools/galaxy-generator` first)
- Node.js 22+ with tsx
- Wrangler CLI (for D1 access)

## Steps

### 1. Create D1 Migration

The galaxy schema migration is at `migrations/0002_galaxy_schema.sql`. Apply it:

```bash
# Local development
npx wrangler d1 execute vance --local --file=migrations/0002_galaxy_schema.sql

# Remote (production)
npx wrangler d1 execute vance --file=migrations/0002_galaxy_schema.sql
```

### 2. Generate Seed SQL

```bash
npx tsx tools/galaxy-seeder/src/index.ts \
  --input ./galaxy-output \
  --output ./galaxy-seed.sql \
  --verbose
```

### 3. Apply Seed Data

```bash
# Local
npx wrangler d1 execute vance --local --file=./galaxy-seed.sql

# Remote
npx wrangler d1 execute vance --file=./galaxy-seed.sql
```

### 4. Verify

Query a system in the Workers runtime or via wrangler:

```bash
npx wrangler d1 execute vance --local \
  --command "SELECT name, classification FROM star_systems LIMIT 5"
```

## Development

### Running Tests

```bash
# Unit tests (repositories)
npx vitest run src/infrastructure/galaxy/

# All tests
npx vitest run
```

### Key Files

| File                                            | Purpose                       |
| ----------------------------------------------- | ----------------------------- |
| `migrations/0002_galaxy_schema.sql`             | D1 schema (tables + indexes)  |
| `tools/galaxy-seeder/src/index.ts`              | Seeder CLI entry point        |
| `src/application/ports/StarSystemRepository.ts` | Repository port               |
| `src/application/ports/RouteRepository.ts`      | Repository port               |
| `src/application/ports/TradePairRepository.ts`  | Repository port               |
| `src/infrastructure/galaxy/`                    | D1 repository implementations |
