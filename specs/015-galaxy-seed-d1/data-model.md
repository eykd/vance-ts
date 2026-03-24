# Data Model: Galaxy Seed to D1

**Branch**: `015-galaxy-seed-d1` | **Date**: 2026-03-24

## Entity: star_systems

Stores complete star system records from the galaxy generator output.

| Column         | Type    | Constraints      | Notes                                                                                            |
| -------------- | ------- | ---------------- | ------------------------------------------------------------------------------------------------ |
| id             | TEXT    | PRIMARY KEY      | UUID from generator                                                                              |
| name           | TEXT    | NOT NULL, UNIQUE | Pronounceable generated name                                                                     |
| x              | INTEGER | NOT NULL         | Galaxy coordinate                                                                                |
| y              | INTEGER | NOT NULL         | Galaxy coordinate                                                                                |
| is_oikumene    | INTEGER | NOT NULL         | 0 or 1 (SQLite boolean)                                                                          |
| classification | TEXT    | NOT NULL         | Enum: oikumene, uninhabited, lost_colony, hidden_enclave                                         |
| density        | TEXT    | NOT NULL         | JSON: {neighborCount, environmentPenalty}                                                        |
| attributes     | TEXT    | NOT NULL         | JSON: {technology, environment, resources}                                                       |
| planetary      | TEXT    | NOT NULL         | JSON: {size, atmosphere, temperature, hydrography}                                               |
| civilization   | TEXT    | NOT NULL         | JSON: {population, starport, government, factions, lawLevel}                                     |
| trade_codes    | TEXT    | NOT NULL         | JSON array: ["Ag", "Ri", ...]                                                                    |
| economics      | TEXT    | NOT NULL         | JSON: {gurpsTechLevel, perCapitaIncome, grossWorldProduct, resourceMultiplier, worldTradeNumber} |

**Indexes**:

- `idx_star_systems_name` on `name` — supports name search (US-5)
- `idx_star_systems_classification` on `classification` — supports filtering by type
- `UNIQUE(x, y)` — enforces coordinate uniqueness

**Validation rules**:

- `x` and `y` are integers
- `classification` must be one of the four enum values
- `is_oikumene` must be 0 or 1
- JSON columns must contain valid JSON matching the expected schema

## Entity: routes

Stores pre-computed navigable routes between star systems. Path coordinates are NOT stored (visualization only, not needed at runtime).

| Column         | Type | Constraints | Notes                |
| -------------- | ---- | ----------- | -------------------- |
| origin_id      | TEXT | NOT NULL    | FK → star_systems.id |
| destination_id | TEXT | NOT NULL    | FK → star_systems.id |
| cost           | REAL | NOT NULL    | Total traversal cost |

**Constraints**:

- `PRIMARY KEY (origin_id, destination_id)`
- `origin_id < destination_id` lexicographically (enforced by seeder)
- `cost > 0`

**Indexes**:

- `idx_routes_destination` on `destination_id` — supports reverse lookups (FR-010 bidirectional queries)

**Validation rules**:

- Both origin_id and destination_id must reference existing star_systems
- Origin and destination must be different systems

## Entity: trade_pairs

Pre-computed Bilateral Trade Numbers for system pairs within 5 hops.

| Column      | Type    | Constraints | Notes                         |
| ----------- | ------- | ----------- | ----------------------------- |
| system_a_id | TEXT    | NOT NULL    | FK → star_systems.id          |
| system_b_id | TEXT    | NOT NULL    | FK → star_systems.id          |
| btn         | REAL    | NOT NULL    | Bilateral Trade Number (> 0)  |
| hops        | INTEGER | NOT NULL    | Shortest path hop count (1-5) |

**Constraints**:

- `PRIMARY KEY (system_a_id, system_b_id)`
- `system_a_id < system_b_id` lexicographically
- `btn > 0` (zero-BTN pairs excluded per FR-003)
- `hops BETWEEN 1 AND 5`

**Indexes**:

- `idx_trade_pairs_system_b` on `system_b_id` — supports reverse lookups

**Validation rules**:

- Both system IDs must reference existing star_systems
- BTN computed as: `clamp(WTN_A + WTN_B - distance_modifier, 0, min(WTN_A, WTN_B) + 5)`
- Distance modifier from hop count lookup table

## Relationships

```
star_systems 1──* routes (via origin_id or destination_id)
star_systems 1──* trade_pairs (via system_a_id or system_b_id)
```

Routes and trade_pairs are both stored with lexicographic ordering on the ID pair to avoid duplicates. Bidirectional queries use OR conditions on both ID columns.

## Scale Estimates

| Table        | Rows           | Avg Row Size | Total Size |
| ------------ | -------------- | ------------ | ---------- |
| star_systems | ~12,000        | ~500 bytes   | ~6 MB      |
| routes       | ~1,000         | ~80 bytes    | ~80 KB     |
| trade_pairs  | ~20,000-40,000 | ~80 bytes    | ~3 MB      |

Total estimated D1 storage: ~10 MB (well within D1's 10 GB limit).
