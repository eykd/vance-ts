# Seeder CLI Contract

**Branch**: `015-galaxy-seed-d1` | **Date**: 2026-03-24

## Command

```bash
npx tsx tools/galaxy-seeder/src/index.ts \
  --input <galaxy-output-dir> \
  --output <output-sql-file> \
  [--verbose]
```

## Arguments

| Argument    | Required | Description                                    |
| ----------- | -------- | ---------------------------------------------- |
| `--input`   | Yes      | Path to galaxy generator output directory      |
| `--output`  | Yes      | Path to write the SQL file                     |
| `--verbose` | No       | Print progress and statistics during execution |

## Input Directory Structure

The seeder expects this structure (matching the galaxy generator output contract):

```
<input>/
  metadata.json          # Pipeline config + stats (read for validation)
  routes.json            # Pre-computed routes array
  systems/
    <systemId>.json      # One per star system (~12,000 files)
```

## Output

A single SQL file containing:

1. `INSERT INTO star_systems` statements (batched)
2. `INSERT INTO routes` statements (batched)
3. `INSERT INTO trade_pairs` statements (batched, computed from routes + economics)

SQL is wrapped in a transaction for atomicity.

## Execution

```bash
# Generate SQL
npx tsx tools/galaxy-seeder/src/index.ts \
  --input ./galaxy-output \
  --output ./migrations/0002_seed_galaxy.sql

# Apply to local D1
npx wrangler d1 execute vance --local --file=./migrations/0002_seed_galaxy.sql

# Apply to remote D1
npx wrangler d1 execute vance --file=./migrations/0002_seed_galaxy.sql
```

## Validation (Pre-insertion)

The seeder validates before producing SQL:

1. `metadata.json` exists and is valid JSON
2. `routes.json` exists and is valid JSON with `routes` array
3. `systems/` directory contains at least one `.json` file
4. All route origin/destination IDs reference existing system files
5. All system files contain required fields (id, name, x, y, classification, economics)
6. No duplicate system IDs or coordinates

## Error Codes

| Code | Meaning                 |
| ---- | ----------------------- |
| 0    | Success                 |
| 1    | Invalid arguments       |
| 2    | Input validation failed |
| 3    | SQL generation failed   |

## Statistics (verbose mode)

```
Galaxy Seeder v1.0.0
Reading systems... 12,000 systems loaded
Reading routes... 1,042 routes loaded
Building route graph... done
Computing trade pairs (5-hop BFS)... 28,450 pairs found
Generating SQL...
  star_systems: 12,000 rows
  routes: 1,042 rows
  trade_pairs: 28,450 rows
Written to: ./migrations/0002_seed_galaxy.sql (4.2 MB)
```
