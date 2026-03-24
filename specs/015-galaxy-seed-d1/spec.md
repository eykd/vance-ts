# Feature Specification: Galaxy Seed to D1

**Feature Branch**: `015-galaxy-seed-d1`
**Created**: 2026-03-23
**Status**: Draft
**Input**: User description: "Phase 0: Galaxy Seed to D1 — Galaxy data queryable from Workers runtime via D1"
**Beads Epic**: `turtlebased-1t2`

**Beads Phase Tasks**:

- clarify: `turtlebased-1t2.1`
- plan: `turtlebased-1t2.2`
- red-team: `turtlebased-1t2.3`
- tasks: `turtlebased-1t2.4`
- analyze: `turtlebased-1t2.5`
- implement: `turtlebased-1t2.6`
- security-review: `turtlebased-1t2.7`
- architecture-review: `turtlebased-1t2.8`
- code-quality-review: `turtlebased-1t2.9`

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Query Star Systems by ID (Priority: P1)

A developer or game system queries a star system by its unique ID and receives the full system record — name, coordinates, classification, attributes, trade codes, and economic data.

**Why this priority**: Every downstream system (travel, jobs, storylets, economy) depends on looking up star system data by ID. This is the foundational read operation.

**Independent Test**: Can be fully tested by seeding a D1 database and querying a known system ID, verifying all fields match the source JSON.

**Acceptance Scenarios**:

1. **Given** a seeded D1 database with galaxy data, **When** a system is queried by its ID, **Then** all fields (name, coordinates, classification, TER rating, planetary data, civilization data, trade codes, economics) are returned matching the original generator output.
2. **Given** a seeded D1 database, **When** a non-existent system ID is queried, **Then** the repository returns null/undefined (no error thrown).

---

### User Story 2 - Find Connected Systems (Priority: P1)

A game system queries all star systems reachable from a given system (via pre-computed routes) to display navigation options to the player.

**Why this priority**: The travel system needs to show where a player can go from their current location, along with route costs. This is the second most critical query for the turn loop.

**Independent Test**: Can be tested by seeding routes and querying connected systems from a known origin, verifying the correct neighbors and costs are returned.

**Acceptance Scenarios**:

1. **Given** a seeded database with routes, **When** connected systems are queried from an Oikumene hub, **Then** all directly connected systems are returned with their route costs.
2. **Given** a seeded database, **When** connected systems are queried from a system with no routes, **Then** an empty list is returned.

---

### User Story 3 - Seed Galaxy Data from Generator Output (Priority: P1)

A developer runs a CLI tool that reads the galaxy generator's JSON output files and populates a D1 database with star systems, routes, and pre-computed trade pair data (BTN values).

**Why this priority**: Without seeding, there is no data to query. The seeder bridges the existing galaxy generator pipeline to the D1 runtime storage.

**Independent Test**: Can be tested by running the seeder against a known generator output directory and verifying row counts and data integrity in the resulting database.

**Acceptance Scenarios**:

1. **Given** a complete galaxy generator output directory (metadata.json, systems/\*.json, routes.json), **When** the seeder CLI is run, **Then** all star systems are inserted into the `star_systems` table with correct field mappings.
2. **Given** a complete generator output, **When** the seeder is run, **Then** all routes are inserted into the `routes` table with origin/destination IDs and costs.
3. **Given** a complete generator output with routes and system economics, **When** the seeder is run, **Then** BTN values are computed for all connected system pairs and stored in the `trade_pairs` table.

---

### User Story 4 - Query Trade Pairs for a System (Priority: P2)

A game system queries all trade pairs for a given star system to determine available freight job generation parameters (BTN-based volume and pricing).

**Why this priority**: Trade pairs drive the job generation algorithm in Phase 5. Pre-computing and storing BTN during seeding avoids expensive runtime calculations.

**Independent Test**: Can be tested by querying trade pairs for a known system and verifying BTN values match the expected WTN/distance formula.

**Acceptance Scenarios**:

1. **Given** a seeded database with trade pairs, **When** trade pairs are queried for a system, **Then** all partner systems are returned with their BTN values, ordered by descending BTN.
2. **Given** a system with no trade partners (isolated Beyond system), **When** trade pairs are queried, **Then** an empty list is returned.

---

### User Story 5 - Search Systems by Name (Priority: P2)

A game system or developer searches for star systems by name (exact or partial match) to support navigation, UI search, and content authoring lookup.

**Why this priority**: Name-based lookup supports player-facing search and developer tooling but is not on the critical path for the turn loop.

**Independent Test**: Can be tested by searching for a known system name and verifying the correct system is returned.

**Acceptance Scenarios**:

1. **Given** a seeded database, **When** a system is searched by exact name, **Then** the matching system is returned.
2. **Given** a seeded database, **When** a system is searched by partial name prefix, **Then** all systems with matching name prefixes are returned.

---

### Edge Cases

- What happens when the seeder is run twice against the same database? The seeder MUST fail with a clear error if galaxy tables already contain data. The operator must manually clear tables before re-seeding.
- What happens when a route references a system ID not present in the systems directory? (Seeder should fail with a clear validation error)
- What happens when the generator output is incomplete (missing metadata.json or routes.json)? (Seeder should fail early with a clear error message)
- How are very large galaxies (~12,000 systems) handled in a single D1 database? (D1 supports up to 10GB; galaxy data should be well under this limit)

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST store star system records in D1 with all fields from the generator output (id, name, coordinates, classification, density, TER rating, planetary data, civilization data, trade codes, economics).
- **FR-002**: System MUST store pre-computed routes in D1 with origin ID, destination ID, and traversal cost.
- **FR-003**: System MUST pre-compute and store Bilateral Trade Numbers (BTN) for all system pairs within 5 hops of each other (via the route graph) during seeding, using the formula: `BTN = clamp(WTN_A + WTN_B - distance_modifier, 0, min(WTN_A, WTN_B) + 5)`. The seeder MUST perform BFS on the route graph to discover multi-hop pairs and compute hop-count distance modifiers. Pairs with BTN = 0 MUST be omitted.
- **FR-004**: System MUST provide a repository interface for querying star systems by ID, returning the full system record or null.
- **FR-005**: System MUST provide a repository interface for querying all routes from a given system, returning connected systems and route costs.
- **FR-006**: System MUST provide a repository interface for querying trade pairs by system ID, returning partner systems with BTN values.
- **FR-007**: System MUST provide a repository interface for searching star systems by name (exact and prefix match).
- **FR-008**: The seeder CLI MUST read the galaxy generator's output directory structure (metadata.json, systems/\*.json, routes.json) and produce SQL for D1 insertion.
- **FR-009**: The seeder MUST validate input data integrity before insertion (all route system IDs exist, required fields present). The seeder MUST also check that galaxy tables are empty before proceeding and fail with a clear error if data already exists.
- **FR-010**: Route storage MUST be bidirectional — querying routes from system A returns route to B, and querying from B returns route to A, even though routes are stored with lexicographic ordering (originId < destinationId).

### Key Entities

- **Star System**: A unique location in the galaxy with identity, coordinates, classification, physical attributes, civilization data, trade codes, and economic indicators. Stored as a single row with structured JSON columns for nested data.
- **Route**: A pre-computed navigable path between two star systems, with traversal cost. Path coordinates are not stored in the runtime database (only needed for visualization, not gameplay).
- **Trade Pair**: A pre-computed bilateral trade relationship between two systems within 5 hops of each other, storing the BTN value and hop count that drive job generation volume. Derived from route-graph BFS and system World Trade Numbers. Zero-BTN pairs are excluded.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: All star systems from the generator output (~12,000) are queryable by ID within the Workers runtime, returning complete records.
- **SC-002**: Connected systems for any given star system are retrievable in a single query operation.
- **SC-003**: The seeder processes a full galaxy output (~12,000 systems, ~1,000+ routes) and populates the database without errors.
- **SC-004**: Trade pair BTN values for any system are retrievable in a single query operation, enabling downstream job generation.
- **SC-005**: All repository operations return correct data matching the original generator output, verified by automated tests.

## Assumptions

- The galaxy generator output format is stable and matches the contract defined in `specs/010-galaxy-generation/contracts/output-format.md`.
- Route path coordinates (the sequence of grid cells) are not needed at runtime for gameplay — only origin, destination, and total cost are stored. Path data remains in the generator output for visualization purposes.
- BTN distance modifier uses hop count (number of route segments in the shortest path between systems) rather than raw traversal cost, consistent with the GURPS Far Trader model. Trade pairs are computed for all system pairs within 5 hops, not just directly adjacent systems.
- The seeder is a developer-facing CLI tool run during deployment/setup, not a player-facing feature.
- Storage capacity is sufficient for the full galaxy dataset (estimated well under 100MB for ~12,000 systems).

## Clarifications

### Session 2026-03-24

- Q: What is the scope of trade pairs to pre-compute? → A: All pairs within N hops (via route graph), not just directly connected systems. Requires BFS in the seeder to discover multi-hop pairs and compute hop distances.
- Q: What maximum hop count (N) for trade pair computation? → A: 5 hops. Captures nearly all non-zero BTN pairs while keeping table size manageable (~20,000-40,000 rows).
- Q: What should happen when the seeder is run against an already-seeded database? → A: Fail with a clear error. Operator must manually clear tables before re-seeding.

## Interview

### Open Questions

### Answer Log

- **Q1** (2026-03-24): Trade pair scope? → **A:** All pairs within N hops via route graph (Option B).
- **Q2** (2026-03-24): Maximum hop count N? → **A:** 5 hops (Option B).
- **Q3** (2026-03-24): Re-seeding behavior? → **A:** Fail with error if data exists (Option B).
