# Implementation Plan: Galaxy Seed to D1

**Branch**: `015-galaxy-seed-d1` | **Date**: 2026-03-24 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/015-galaxy-seed-d1/spec.md`

## Summary

Make galaxy data (star systems, routes, trade pairs) queryable from the Cloudflare Workers runtime via D1. A Node.js CLI seeder tool reads the galaxy generator's JSON output, computes BTN trade pairs via BFS, and produces SQL for D1 insertion. Repository interfaces in the application layer provide type-safe query access.

## Technical Context

**Language/Version**: TypeScript ES2022 (Workers runtime + Node.js CLI tool)
**Primary Dependencies**: @cloudflare/workers-types, tsx (CLI runner)
**Storage**: D1 (SQLite-based, binding `env.DB`)
**Testing**: Vitest with @cloudflare/vitest-pool-workers (isolatedStorage)
**Target Platform**: Cloudflare Workers (repositories), Node.js (seeder CLI)
**Project Type**: Web application (existing Clean Architecture structure)
**Performance Goals**: Single-system lookup < 10ms, connected systems query < 20ms
**Constraints**: D1 row size limits, ~10 GB max database size
**Scale/Scope**: ~12,000 star systems, ~1,000 routes, ~20,000-40,000 trade pairs

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                 | Status | Notes                                                                                   |
| ------------------------- | ------ | --------------------------------------------------------------------------------------- |
| I. Test-First Development | PASS   | TDD for all repository implementations; seeder CLI tested with fixtures                 |
| II. Type Safety           | PASS   | Strict TypeScript, explicit return types, no `any`                                      |
| III. Code Quality         | PASS   | JSDoc on all public interfaces, conventional naming                                     |
| IV. Pre-commit Gates      | PASS   | All quality checks enforced by existing hooks                                           |
| V. Warning Policy         | PASS   | Zero warnings tolerance maintained                                                      |
| VI. Workers Environment   | PASS   | Repositories use only D1 API (Web Standard); seeder is Node.js CLI (separate tool)      |
| VII. Simplicity           | PASS   | Raw prepared statements (no ORM overhead), minimal schema, JSON columns for nested data |

**Post-Phase 1 Re-check**: All gates still pass. Raw SQL approach is simpler than Drizzle ORM for read-only data. JSON columns avoid schema explosion.

## Project Structure

### Documentation (this feature)

```text
specs/015-galaxy-seed-d1/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── repository-interfaces.md
│   └── seeder-cli.md
├── checklists/
│   └── requirements.md
└── spec.md
```

### Source Code (repository root)

```text
migrations/
├── 0001_better_auth_schema.sql      # Existing
├── 0001_create_users_table.sql      # Existing
└── 0002_galaxy_schema.sql           # NEW: star_systems, routes, trade_pairs tables

src/
├── application/
│   └── ports/
│       ├── StarSystemRepository.ts  # NEW: query port
│       ├── RouteRepository.ts       # NEW: query port
│       └── TradePairRepository.ts   # NEW: query port
├── infrastructure/
│   └── galaxy/
│       ├── D1StarSystemRepository.ts  # NEW: D1 implementation
│       ├── D1RouteRepository.ts       # NEW: D1 implementation
│       ├── D1TradePairRepository.ts   # NEW: D1 implementation
│       └── mappers.ts                 # NEW: D1 row → domain type mapping
├── di/
│   └── serviceFactory.ts             # MODIFIED: wire galaxy repositories
└── domain/
    └── galaxy/
        └── types.ts                   # EXISTING (no changes needed)

tools/
└── galaxy-seeder/
    ├── package.json                   # NEW: tsx dependency
    ├── tsconfig.json                  # NEW: Node.js target
    └── src/
        ├── index.ts                   # NEW: CLI entry point
        ├── reader.ts                  # NEW: read galaxy output files
        ├── validator.ts               # NEW: validate input integrity
        ├── graph.ts                   # NEW: build adjacency list, BFS
        ├── btn.ts                     # NEW: BTN computation
        └── sql-writer.ts             # NEW: generate SQL output
```

**Structure Decision**: Follows existing Clean Architecture layout. Repository ports in `src/application/ports/`, D1 implementations in `src/infrastructure/galaxy/`. Seeder is a separate Node.js tool in `tools/galaxy-seeder/` (consistent with `tools/galaxy-generator/`).

## Testing Strategy

Two distinct test environments for this feature:

**Workers Tests** (`src/**/*.spec.ts` → vitest `workers` project):

- D1 repository implementations tested via `@cloudflare/vitest-pool-workers`
- `isolatedStorage: true` — each test gets fresh D1, auto-rollback
- Migrations applied in `beforeAll()` using inline SQL (no filesystem in Workers)
- Test fixtures: small sets of star systems, routes, and trade pairs inserted via SQL
- Pattern: mock D1 prepared statements for unit tests, real D1 for integration

**Node.js Tests** (`tools/**/*.spec.ts` → vitest `node` project):

- Seeder CLI tested as pure Node.js (mock `fs/promises` for unit tests)
- BFS, BTN computation, SQL generation tested with small fixture data
- Integration test: run full seeder against fixture directory, verify SQL output
- Pattern: `vi.mock('node:fs/promises')` with `vi.hoisted()` for early mocking
- CLI arg parsing tested with error cases (following `tools/galaxy-generator/src/index.spec.ts` pattern)

## Implementation Order

### Phase A: D1 Schema (Migration)

1. Create `migrations/0002_galaxy_schema.sql` with:
   - `star_systems` table (flat + JSON columns)
   - `routes` table (composite PK, bidirectional index)
   - `trade_pairs` table (composite PK, BTN + hops)
   - All indexes defined in data-model.md

### Phase B: Repository Ports (Application Layer)

2. Define `StarSystemRepository` interface in `src/application/ports/`
3. Define `RouteRepository` interface in `src/application/ports/`
4. Define `TradePairRepository` interface in `src/application/ports/`

### Phase C: D1 Repository Implementations (Infrastructure Layer)

5. Create `src/infrastructure/galaxy/mappers.ts` — D1 row → domain type mapping.

   D1 returns plain objects with column names. JSON columns arrive as strings and must be parsed:

   ```typescript
   function mapRowToStarSystem(row: Record<string, unknown>): StarSystem {
     return {
       id: row['id'] as string,
       name: row['name'] as string,
       x: row['x'] as number,
       y: row['y'] as number,
       isOikumene: row['is_oikumene'] === 1,
       classification: row['classification'] as Classification,
       density: JSON.parse(row['density'] as string) as DensityData,
       attributes: JSON.parse(row['attributes'] as string) as TerRating,
       planetary: JSON.parse(row['planetary'] as string) as PlanetaryData,
       civilization: JSON.parse(row['civilization'] as string) as CivilizationData,
       tradeCodes: JSON.parse(row['trade_codes'] as string) as string[],
       economics: JSON.parse(row['economics'] as string) as EconomicsData,
     };
   }
   ```

6. Implement `D1StarSystemRepository` — findById, findByName, searchByNamePrefix.

   Key query for prefix search: `SELECT * FROM star_systems WHERE name LIKE ? || '%' ORDER BY name LIMIT ?`

7. Implement `D1RouteRepository` — findConnectedSystems, findRoute.

   Bidirectional query pattern:

   ```sql
   SELECT s.*, r.cost FROM routes r
   JOIN star_systems s ON s.id = CASE
     WHEN r.origin_id = ? THEN r.destination_id
     ELSE r.origin_id
   END
   WHERE r.origin_id = ? OR r.destination_id = ?
   ```

8. Implement `D1TradePairRepository` — findTradePartners.

   Bidirectional query ordered by BTN:

   ```sql
   SELECT s.*, tp.btn, tp.hops FROM trade_pairs tp
   JOIN star_systems s ON s.id = CASE
     WHEN tp.system_a_id = ? THEN tp.system_b_id
     ELSE tp.system_a_id
   END
   WHERE tp.system_a_id = ? OR tp.system_b_id = ?
   ORDER BY tp.btn DESC
   ```

9. Wire repositories into `ServiceFactory` — add lazy-initialized getters following existing pattern.

### Phase D: Galaxy Seeder CLI Tool

10. Create `tools/galaxy-seeder/` project structure (package.json, tsconfig.json).

11. Implement `reader.ts` — read metadata.json, systems/\*.json, routes.json.
    Uses `fs/promises` readdir + readFile with concurrency limiting (follow galaxy-generator's `MAX_CONCURRENCY = 100` pattern).

12. Implement `validator.ts` — validate input integrity.
    Checks: metadata exists, routes exist, all route IDs reference real systems, no duplicate IDs/coordinates, required fields present.

13. Implement `graph.ts` — build adjacency list from routes, BFS to depth 5.

    Algorithm:

    ```typescript
    // Build adjacency list: Map<systemId, Array<{neighbor, cost}>>
    // For each system with routes:
    //   BFS with visited set, depth limit = 5
    //   Queue entries: {systemId, depth}
    //   For each discovered pair at depth d:
    //     Record (systemA, systemB, hops=d) where systemA < systemB
    //   Deduplicate: keep minimum hop count for each pair
    ```

    Only Oikumene systems (~250) have routes, so BFS runs ~250 times. Beyond systems with no routes produce zero pairs.

14. Implement `btn.ts` — BTN computation with distance modifier lookup.

    Distance modifier table (GURPS Far Trader):

    | Hops ≤ | Modifier |
    | ------ | -------- |
    | 1      | 0        |
    | 2      | 0.5      |
    | 5      | 1.0      |

    At max 5 hops, the modifier caps at 1.0.

    ```typescript
    function distanceModifier(hops: number): number {
      if (hops <= 1) return 0;
      if (hops <= 2) return 0.5;
      return 1.0; // hops 3-5
    }

    function computeBtn(wtnA: number, wtnB: number, hops: number): number {
      const raw = wtnA + wtnB - distanceModifier(hops);
      const cap = Math.min(wtnA, wtnB) + 5;
      return Math.max(Math.min(raw, cap), 0);
    }
    ```

15. Implement `sql-writer.ts` — generate batched INSERT SQL wrapped in transaction.

    Batching strategy:
    - star_systems: 500 rows per INSERT (each row ~500 bytes → ~250 KB per statement)
    - routes: 500 rows per INSERT (~80 bytes each → ~40 KB per statement)
    - trade_pairs: 1000 rows per INSERT (~80 bytes each → ~80 KB per statement)

    SQL escaping: single quotes doubled (`'` → `''`). All string values escaped before interpolation.

    Output structure:

    ```sql
    BEGIN TRANSACTION;
    -- Pre-insertion check
    SELECT CASE WHEN COUNT(*) > 0 THEN RAISE(ABORT, 'star_systems table not empty') END FROM star_systems;
    -- Star systems (batch 1 of 24)
    INSERT INTO star_systems (...) VALUES (...), (...), ...;
    -- ... more batches ...
    -- Routes (batch 1 of 3)
    INSERT INTO routes (...) VALUES (...), (...), ...;
    -- Trade pairs (batch 1 of 30)
    INSERT INTO trade_pairs (...) VALUES (...), (...), ...;
    COMMIT;
    ```

16. Implement `index.ts` — CLI entry point with arg parsing (--input, --output, --verbose).

### Phase E: Integration

17. End-to-end test: generate SQL from fixture data, apply to D1, query via repositories.
    - Fixture: 10 star systems, 5 routes, expected trade pairs pre-computed manually
    - Verify: row counts, field values, bidirectional queries, BTN ordering

## Security Considerations

_Added by sp:04-red-team adversarial review (2026-03-24)._

### SQL Injection in Seeder Output (Critical)

The `sql-writer.ts` generates SQL via string interpolation with single-quote doubling (`'` → `''`). Since the output is a `.sql` file (not parameterized), this is the only option — but the implementation must be thorough:

- **Escape all string values**: system names, IDs, JSON columns. Not just single quotes — also handle NUL bytes (`\0`) which terminate SQLite strings.
- **JSON columns are high-risk**: They contain nested quotes, braces, and special characters. The seeder must `JSON.stringify()` the parsed object (to normalize) then apply SQL escaping to the result.
- **Mitigation**: Create a dedicated `escapeSQL(value: string): string` function with exhaustive test cases covering: single quotes, double quotes, backslashes, NUL bytes, Unicode, and nested JSON with all of the above.
- **Test**: Include a fixture system with adversarial name (e.g., `O'Brien's Star`) and JSON containing nested quotes.

### LIKE Wildcard Injection in Prefix Search (High)

`searchByNamePrefix` uses `WHERE name LIKE ? || '%'` but the characters `%` and `_` are LIKE wildcards. A search for `%` matches all systems; `_` matches any single character.

- **Mitigation**: Escape LIKE metacharacters in the prefix before binding: replace `%` with `\%`, `_` with `\_`, and `\` with `\\`. Use `ESCAPE '\'` clause in the query.
- **Query pattern**: `WHERE name LIKE ? ESCAPE '\'` with the prefix pre-escaped and `%` appended.
- **Test**: Prefix searches containing `%`, `_`, and `\` must return only exact prefix matches.

### Foreign Key Enforcement (Medium)

D1 (SQLite) does not enforce foreign key constraints by default — `PRAGMA foreign_keys` is OFF. D1 may not support setting this pragma per-connection.

- **Mitigation**: Do not rely on FK constraints for data integrity. The seeder's `validator.ts` is the primary integrity gate (validates all route/trade-pair IDs reference real systems). Document that FK declarations in the schema are documentation-only in D1.
- **Test**: Integration tests should verify that the seeder rejects routes referencing non-existent system IDs (validator-level, not DB-level enforcement).

## Edge Cases & Error Handling

_Added by sp:04-red-team adversarial review (2026-03-24)._

### RAISE(ABORT) Invalid Outside Triggers (Critical)

The plan's pre-insertion emptiness check uses:

```sql
SELECT CASE WHEN COUNT(*) > 0 THEN RAISE(ABORT, 'star_systems table not empty') END FROM star_systems;
```

**This will fail.** SQLite's `RAISE()` function is only valid inside trigger bodies. Outside triggers, it causes a parse error.

- **Mitigation**: Move the emptiness check to the seeder CLI (Node.js side). Before generating SQL, query the target D1 database — but since the seeder produces a SQL file (not a live connection), the check must be done differently:
  - **Option A (Recommended)**: Use `INSERT OR ABORT` semantics — the schema's UNIQUE constraints will reject duplicates. Document that re-seeding requires `DELETE FROM` first.
  - **Option B**: Add a sentinel check at the start of the SQL file using a subquery that causes a constraint violation if data exists: `INSERT INTO star_systems (id) SELECT 'GUARD' WHERE (SELECT COUNT(*) FROM star_systems) > 0;` — this inserts a row with incomplete data, triggering NOT NULL violations. However, this is fragile.
  - **Option C (Simplest)**: Remove the SQL-level guard entirely. The seeder contract already states "operator must manually clear tables before re-seeding." The seeder's `--verbose` output shows row counts, making accidental double-seeding obvious. If applied to a non-empty DB, the UNIQUE constraints on `id`, `(x,y)`, and composite PKs will cause the transaction to ABORT.
- **Decision**: Use Option C — rely on UNIQUE constraint violations to prevent double-seeding, which aborts the transaction cleanly. Update the SQL template to remove the `RAISE()` call.

### JSON.parse Failure in Mappers (High)

The `mappers.ts` uses `JSON.parse()` on six JSON columns per star system row. If any column contains malformed JSON (data corruption, encoding issue), the entire query crashes with an unhandled `SyntaxError`.

- **Mitigation**: Wrap `JSON.parse()` calls in a mapper-level try/catch that produces a descriptive error including the system ID and column name. This converts cryptic parse errors into actionable diagnostics.
- **Pattern**:
  ```typescript
  function parseJsonColumn<T>(row: Record<string, unknown>, column: string, systemId: string): T {
    const raw = row[column] as string;
    try {
      return JSON.parse(raw) as T;
    } catch {
      throw new Error(`Corrupt JSON in ${column} for system ${systemId}: ${raw.slice(0, 100)}`);
    }
  }
  ```
- **Test**: Include a test case with malformed JSON to verify the error message is helpful.

### Seeder JSON Schema Validation (Medium)

The validator checks file existence and required top-level fields but not the shape of nested JSON objects. A system file with `economics: {}` (missing `worldTradeNumber`) passes validation but produces a trade pair with `NaN` BTN.

- **Mitigation**: `validator.ts` must validate that each system's `economics` object contains a numeric `worldTradeNumber` field. Extend validation to check all fields that the seeder's computation depends on (coordinates are integers, classification is a valid enum value, economics has required numeric fields).
- **Test**: Fixture with a system missing `worldTradeNumber` must cause a validation error, not a silent NaN.

### BTN Computation with Invalid Input (Low)

If `worldTradeNumber` is `undefined`, `null`, or non-numeric, the BTN formula produces `NaN`. Since `NaN > 0` is false, these pairs are silently excluded — which may be correct behavior, but it masks data quality issues.

- **Mitigation**: The `btn.ts` module should assert that both WTN values are finite numbers before computation. Throw a descriptive error if not (e.g., `"System X has non-numeric WTN: undefined"`).

## Performance Considerations

_Added by sp:04-red-team adversarial review (2026-03-24)._

### D1 Remote Execution Size Limits (High)

The seeder produces a ~4MB SQL file. Executing this via `wrangler d1 execute --file` against remote D1 must transfer the entire file and execute it as a single transaction.

- **Risk**: Remote D1 execution may timeout or hit payload size limits for large files. D1's HTTP API has request size limits.
- **Mitigation**:
  1. Document the expected file size (~4MB) in the seeder CLI contract.
  2. If remote execution fails, provide a fallback: split the SQL file into chunks (one per table) that can be executed sequentially. The seeder could support a `--split` flag that outputs three files instead of one.
  3. Test with the full ~12,000 system dataset against remote D1 before declaring the seeder production-ready.

### Unbounded Prefix Search Results (Medium)

`searchByNamePrefix(prefix, limit?)` has an optional limit. If omitted with a short prefix (e.g., single character), the query returns potentially thousands of results.

- **Mitigation**: Set a sensible default limit (e.g., 50) in the repository implementation when no limit is provided. Document this default in the interface JSDoc.
- **Query**: `SELECT * FROM star_systems WHERE name LIKE ? ESCAPE '\' ORDER BY name LIMIT ?` — always include LIMIT, defaulting to 50.

### Bidirectional Query Index Usage (Medium)

The routes and trade_pairs bidirectional queries use `WHERE origin_id = ? OR destination_id = ?`. SQLite's query planner may not use indexes efficiently with OR conditions.

- **Mitigation**: Consider rewriting as a UNION of two indexed queries instead of OR:
  ```sql
  SELECT ... FROM routes WHERE origin_id = ?
  UNION ALL
  SELECT ... FROM routes WHERE destination_id = ?
  ```
  This allows each sub-query to use its respective index (`PRIMARY KEY` for origin_id, `idx_routes_destination` for destination_id). Benchmark both approaches during integration testing.

## Misuse & Abuse Considerations

_Added by sp:04-red-team adversarial review (2026-03-24)._

### Prefix Search Abuse

The name search endpoint (if exposed via HTTP) could be probed with empty or wildcard-like prefixes to enumerate all system names.

- **Mitigation**: Enforce a minimum prefix length (e.g., 2 characters) at the repository or use-case level. Return an empty list for prefixes shorter than the minimum. This also improves query performance by avoiding full table scans.

### Seeder Re-run Data Corruption

If an operator runs the seeder SQL against a partially-seeded database (e.g., previous run failed mid-transaction), the UNIQUE constraints may reject some rows while allowing others, producing an inconsistent state.

- **Mitigation**: The SQL file wraps all INSERTs in a single `BEGIN TRANSACTION; ... COMMIT;` block. If any statement fails, the entire transaction rolls back. This is already in the plan — document explicitly that partial application is impossible due to transaction atomicity. If the transaction is too large for D1, the `--split` fallback must include instructions to `DELETE FROM` all three tables before retrying.
