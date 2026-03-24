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

5. Create `src/infrastructure/galaxy/mappers.ts` — D1 row → domain type mapping (JSON parsing)
6. Implement `D1StarSystemRepository` — findById, findByName, searchByNamePrefix
7. Implement `D1RouteRepository` — findConnectedSystems, findRoute
8. Implement `D1TradePairRepository` — findTradePartners
9. Wire repositories into `ServiceFactory`

### Phase D: Galaxy Seeder CLI Tool

10. Create `tools/galaxy-seeder/` project structure (package.json, tsconfig.json)
11. Implement `reader.ts` — read metadata.json, systems/\*.json, routes.json
12. Implement `validator.ts` — validate input integrity
13. Implement `graph.ts` — build adjacency list from routes, BFS to depth 5
14. Implement `btn.ts` — BTN computation with distance modifier lookup
15. Implement `sql-writer.ts` — generate batched INSERT SQL wrapped in transaction
16. Implement `index.ts` — CLI entry point with arg parsing

### Phase E: Integration

17. End-to-end test: generate SQL from fixture data, apply to D1, query via repositories
