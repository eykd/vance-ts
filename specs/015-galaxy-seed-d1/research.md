# Research: Galaxy Seed to D1

**Branch**: `015-galaxy-seed-d1` | **Date**: 2026-03-24

## Decision 1: D1 Schema Design — Flat vs JSON Columns

**Decision**: Hybrid approach — flat columns for searchable/indexable fields, JSON text columns for nested data structures.

**Rationale**: D1 is SQLite-based and doesn't support native JSON querying efficiently. Fields used in WHERE clauses (id, name, x, y, classification, isOikumene) must be flat columns. Nested structures (density, attributes, planetary, civilization, economics) are read as whole objects and never queried individually at runtime — storing them as JSON text columns avoids schema explosion (30+ columns) while keeping the schema maintainable.

**Alternatives considered**:

- Fully normalized (separate tables per nested object): Rejected — excessive JOINs for a read-only dataset with no update requirements.
- Fully flat (all 30+ fields as columns): Rejected — schema bloat for fields never queried individually.
- Separate lookup tables for tradeCodes: Rejected — trade codes are always read as a complete list per system, never queried across systems.

## Decision 2: Seeder Architecture — SQL File vs Direct D1 API

**Decision**: The seeder produces a SQL file that can be executed via `wrangler d1 execute`. It runs as a Node.js CLI tool in `tools/galaxy-seeder/`.

**Rationale**: Producing SQL files decouples the seeder from runtime D1 connectivity. SQL files can be reviewed, version-controlled, and executed in any environment (local dev via Miniflare, remote via wrangler). The seeder reads the galaxy generator's output directory (Node.js filesystem access) which is unavailable in Workers runtime.

**Alternatives considered**:

- Direct D1 API calls from Workers: Rejected — seeder needs filesystem access to read ~12,000 JSON files.
- Embedded in galaxy generator pipeline: Rejected — generator is already complex; seeder is a separate concern.

## Decision 3: BTN Distance Modifier — Lookup Table

**Decision**: Use the GURPS Far Trader distance modifier lookup table with graph hop counts.

**Rationale**: The spaaace prototype and Far Trader rules define a specific distance modifier table that maps hop ranges to modifier values. This table is well-tested in the reference implementation and produces the expected BTN distribution (high-BTN for adjacent systems, rapid falloff for distant systems).

**Lookup table**:

| Hops ≤ | Modifier |
| ------ | -------- |
| 1      | 0        |
| 2      | 0.5      |
| 5      | 1        |
| 9      | 1.5      |
| 19     | 2        |
| 29     | 2.5      |

At 5 hops max, the maximum distance modifier is 1.0, meaning BTN is reduced by at most 1.0 from the raw WTN sum for the most distant trade pairs.

## Decision 4: WTN Source — Use Generator's Simplified Formula

**Decision**: Use the `worldTradeNumber` value already computed and stored in each system's economics data (`floor((population + starport) / 2)`).

**Rationale**: The galaxy generator already computes and persists WTN. Re-computing it in the seeder would duplicate logic and risk divergence. The simplified formula is the current implementation; if the full GURPS Far Trader formula is adopted later, the generator will be updated and the seeder will automatically pick up the new values on re-seed.

**Alternatives considered**:

- Implement full GURPS Far Trader WTN chain in seeder: Rejected — would diverge from generator output and duplicate computation.

## Decision 5: Route Graph BFS — Implementation Approach

**Decision**: Build an in-memory adjacency list from routes.json, then run BFS from each system up to depth 5. Store discovered pairs with their hop count.

**Rationale**: With ~12,000 systems and ~1,000 routes (Oikumene-only), the graph is sparse. BFS to depth 5 from each connected system is O(V \* branching_factor^5) which is tractable. Most systems are Beyond (unconnected), so BFS only runs from ~250 Oikumene systems.

**Note**: Beyond systems with no routes will have zero trade pairs, which is correct — they have no pre-computed trade routes.

## Decision 6: Drizzle ORM vs Raw SQL

**Decision**: Use raw D1 prepared statements for repository implementations, not Drizzle ORM.

**Rationale**: The galaxy tables are read-only after seeding. The queries are simple (single-table lookups, JOINs on routes). Drizzle ORM adds complexity (schema files, adapter wiring) for zero benefit on read-only data. Raw prepared statements are simpler, faster, and align with the principle of minimal complexity. The existing Drizzle usage is specific to better-auth's adapter requirements.

**Alternatives considered**:

- Drizzle ORM schemas: Rejected — overhead not justified for read-only queries on simple tables.

## Decision 7: Trade Pair Storage — Bidirectional

**Decision**: Store each trade pair once with `system_a_id < system_b_id` lexicographically. Query both directions using `WHERE system_a_id = ? OR system_b_id = ?`.

**Rationale**: Matches the route storage pattern (originId < destinationId). Avoids duplicate rows. The OR query is efficient with a composite index on both columns.

**Alternatives considered**:

- Store both directions (2 rows per pair): Rejected — doubles storage for no query benefit with proper indexing.
