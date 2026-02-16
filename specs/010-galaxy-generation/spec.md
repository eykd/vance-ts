# Feature Specification: Galaxy Generation Pipeline

**Feature Branch**: `010-galaxy-generation`
**Created**: 2026-02-16
**Status**: Draft
**Beads Epic**: `workspace-gvd`
**Input**: Offline procedural generation pipeline for ~12,000 star systems, navigable cost map, Oikumene selection, system attributes, and route pre-computation for a text-based MMORPG inspired by Jack Vance's Oikumene.

**Beads Phase Tasks**:

- clarify: `workspace-gvd.10`
- plan: `workspace-gvd.11`
- red-team: `workspace-gvd.12`
- tasks: `workspace-gvd.13`
- analyze: `workspace-gvd.14`
- implement: `workspace-gvd.15`
- security-review: `workspace-gvd.16`
- architecture-review: `workspace-gvd.17`
- code-quality-review: `workspace-gvd.18`

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Generate a Complete Galaxy from a Seed (Priority: P1)

As a game developer, I want to run a single command with a seed value and receive a complete, deterministic galaxy output (star positions, cost map, system attributes, and routes) so that the game world is reproducible and consistent across builds.

**Why this priority**: Without deterministic galaxy generation, no other features can function. The entire game world depends on consistent, reproducible output from this pipeline. This is the foundational building block.

**Independent Test**: Can be fully tested by running the pipeline with a fixed seed and verifying the output matches expected structure, counts, and deterministic reproduction on re-run.

**Acceptance Scenarios**:

1. **Given** a seed value and default configuration, **When** the pipeline is executed, **Then** approximately 12,000 unique star systems are generated at integer coordinates with no duplicate positions.
2. **Given** the same seed value and configuration, **When** the pipeline is executed twice, **Then** the outputs are byte-for-byte identical (deterministic).
3. **Given** the pipeline completes, **Then** the output directory contains: `metadata.json`, `costmap.png`, `routes.json`, and one JSON file per system in a `systems/` subdirectory.
4. **Given** the pipeline completes, **Then** `metadata.json` contains the seed, all configuration parameters, and summary statistics (total systems, Oikumene count, Beyond breakdown, route count).

---

### User Story 2 - Navigate Civilized Space via Pre-computed Routes (Priority: P1)

As a game developer, I want the pipeline to identify ~250 Oikumene systems and pre-compute navigable routes between nearby pairs so that civilized space is well-connected and players can travel known routes from the start.

**Why this priority**: The Oikumene network is the starting gameplay experience. Players need a connected web of known routes to begin playing. Without this, there is no playable game.

**Independent Test**: Can be tested by verifying the Oikumene network is fully connected (every Oikumene system reachable from every other via some chain of routes) and that routes have valid cost and path data.

**Acceptance Scenarios**:

1. **Given** the pipeline completes, **Then** approximately 250 systems are flagged as Oikumene, all located outside the galactic core exclusion zone and clustered along a spiral arm.
2. **Given** Oikumene systems are selected, **When** routes are computed between pairs within range, **Then** every Oikumene system is reachable from every other via a sequence of route legs (network is fully connected).
3. **Given** a computed route, **Then** the route record contains origin ID, destination ID, total cost, and the full ordered path of grid coordinates.
4. **Given** the Oikumene network is disconnected after initial route computation, **Then** the pipeline adds bridge routes to connect isolated components.

---

### User Story 3 - Traverse the Cost Map for Exploration (Priority: P2)

As a game developer, I want the pipeline to generate a 2D traversal cost map (using Perlin noise and cellular automata) so that player exploration in the Beyond has meaningful geography with corridors and obstacles.

**Why this priority**: The cost map creates the gameplay "terrain" that makes exploration interesting. Open corridors are cheap to traverse, occluded dust regions are expensive but passable. This is essential for Beyond exploration but secondary to having the core galaxy and routes.

**Independent Test**: Can be tested by generating the cost map, verifying it has the correct dimensions, that open corridor cells have low cost (1-3 range) and wall cells have high cost (10-30 range), and that the PNG output decodes back to valid cost values.

**Acceptance Scenarios**:

1. **Given** star positions are generated, **When** the cost map is computed, **Then** the grid covers the bounding box of all star coordinates with padding, and each cell has a traversal cost.
2. **Given** the cost map is generated, **Then** open corridor cells (per cellular automata) have costs in the range of 1-3, and wall cells have costs in the range of 10-30.
3. **Given** the cost map is generated, **Then** it is output as a grayscale uint8 PNG with quantization parameters stored in metadata for decoding back to actual costs.
4. **Given** a cost map with cellular automata corridors, **Then** the Oikumene region predominantly falls within connected open corridors.

---

### User Story 4 - Generate Rich System Attributes (Priority: P2)

As a game developer, I want each star system to have a full set of generated attributes (Technology, Environment, Resources, planetary characteristics, population, government, trade codes, and economics) so that every system feels unique and gameplay-relevant.

**Why this priority**: System attributes give meaning to exploration — without them, systems are just dots on a map. They drive trade, colonization, and narrative. But the pipeline structure (positions + cost map + routes) must exist first.

**Independent Test**: Can be tested by generating attributes for systems with known seeds and verifying they match expected ranges, that classification biases are applied correctly (Oikumene always high-tech and populated, Lost Colonies always low-tech, etc.), and that trade codes and economics are correctly derived.

**Acceptance Scenarios**:

1. **Given** an Oikumene system, **When** attributes are generated, **Then** Technology is at least +1 and Population is at least 6.
2. **Given** a Beyond system, **When** classification is rolled, **Then** approximately 85% are uninhabited, 5-8% are Lost Colonies (Technology clamped to maximum -2), and 5-8% are Hidden Enclaves (Technology at least +2, Population at most 4).
3. **Given** a system in the dense galactic core (many nearby neighbors), **When** Environment is rolled, **Then** it receives a negative density penalty making hostile environments more likely.
4. **Given** a system with generated attributes, **Then** trade codes and economic values (per-capita income, gross world product, world trade number) are correctly derived from the attribute combinations.
5. **Given** any system, **Then** it has a unique, pronounceable name and a unique ID.

---

### User Story 5 - Configure and Tune Generation Parameters (Priority: P3)

As a game developer, I want all tunable parameters (spiral arm count, CA fill probability, cost weights, density radius, Oikumene cluster settings, route range) exposed via configuration so that I can adjust the galaxy's characteristics without changing code.

**Why this priority**: Tuning is essential for getting the galaxy to feel right, but only matters once the pipeline itself works. This is the polish and iteration layer.

**Independent Test**: Can be tested by running the pipeline with modified configuration values and verifying the output reflects the changes (e.g., more arms, different Oikumene size, adjusted cost weights).

**Acceptance Scenarios**:

1. **Given** a configuration with different parameter values, **When** the pipeline runs, **Then** the output reflects those parameters (e.g., 6 spiral arms instead of 4 produces a visibly different galaxy shape).
2. **Given** the pipeline completes, **Then** all configuration parameters used are recorded in `metadata.json` for reproducibility.
3. **Given** the pipeline is run from the command line, **Then** the seed and key parameters can be specified as arguments or via a configuration file.

---

### Edge Cases

- What happens when two or more stars map to the same integer coordinate? They are deduplicated, keeping only one system per coordinate. The dense core loses more stars than the sparse arms.
- What happens when the cellular automata produces disconnected open regions? Disconnected regions in the Beyond are acceptable. However, the Oikumene region must fall within a connected open area. If not, the pipeline regenerates with a different seed or applies flood-fill to connect the Oikumene.
- What happens when the Oikumene route network is disconnected? The pipeline adds bridge routes between disconnected components using A\* at full distance to ensure full connectivity.
- What happens when a Beyond system has Population 0? Civilization and economics fields are still present but contain zeroes or minimal values. The system is classified as uninhabited.
- What happens when the PRNG is not seeded? The pipeline must require a seed value. Running without a seed is an error.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: Pipeline MUST produce deterministic output — given the same seed and configuration, the output must be identical across runs.
- **FR-002**: Pipeline MUST generate approximately 12,000 star systems at unique integer coordinates using a spiral galaxy algorithm with configurable arm count, degree, and cloud density.
- **FR-003**: Pipeline MUST deduplicate star positions by rounding to integers and keeping one system per coordinate.
- **FR-004**: Pipeline MUST generate a 2D traversal cost map using three composited layers: base Perlin noise, cellular automata corridors, and occluded-region Perlin noise.
- **FR-005**: Pipeline MUST compute local stellar density for each system by counting neighbors within a configurable radius, and derive an environment penalty from the density.
- **FR-006**: Pipeline MUST select approximately 250 Oikumene systems outside the galactic core, clustered along a spiral arm, within connected open corridors of the cost map.
- **FR-007**: Pipeline MUST generate attributes for all systems following a defined sequence: Technology, Environment, Resources, Size, Atmosphere, Temperature, Hydrography, Population, Starport, Government, Factions, Law Level, Trade Codes, and Economics.
- **FR-008**: Pipeline MUST apply classification-specific biases to system attributes: Oikumene (high tech, high pop), Uninhabited Beyond (zero pop), Lost Colony (low tech), Hidden Enclave (high tech, low pop).
- **FR-009**: Pipeline MUST pre-compute routes between Oikumene system pairs within a configurable maximum range using A\* pathfinding on the cost map.
- **FR-010**: Pipeline MUST validate that the Oikumene route network is fully connected, adding bridge routes if needed.
- **FR-011**: Pipeline MUST output results as: `metadata.json` (config + stats), `costmap.png` (grayscale uint8), `costmap.bin` (raw uint8 for Workers runtime loading), `routes.json` (all Oikumene routes), and individual system JSON files.
- **FR-012**: Pipeline MUST assign each system a unique ID and a unique, pronounceable name.
- **FR-013**: Pipeline MUST use a single shared seedable PRNG instance across all stages for full determinism.
- **FR-014**: Pipeline MUST expose all tunable parameters via configuration (seed, spiral arms, CA parameters, cost weights, density radius, Oikumene settings, route range).
- **FR-015**: Pipeline MUST store cost map quantization parameters (min cost, max cost, grid origin) in metadata so the PNG can be decoded back to actual cost values.
- **FR-016**: Pipeline MUST store routes bidirectionally: only one direction per pair is stored (origin < destination lexicographically), and consumers reverse for the opposite direction.

### Key Entities

- **Star System**: A unique location in the galaxy defined by integer (x, y) coordinates, with a unique ID, name, classification, density metrics, TER attributes, planetary characteristics, civilization data, trade codes, and economic values.
- **Cost Map**: A 2D grid of traversal costs covering the galaxy coordinate space, where each cell represents the expense of traveling through that point. Composed from Perlin noise and cellular automata layers.
- **Route**: A pre-computed navigable path between two star systems, containing origin/destination IDs, total traversal cost, and an ordered list of grid coordinates forming the path.
- **Oikumene**: The network of approximately 250 civilized, high-tech, well-connected star systems clustered along a spiral arm. All routes between Oikumene systems are known from the start.
- **The Beyond**: All star systems outside the Oikumene (~11,750 systems), mostly uninhabited, with scattered Lost Colonies and Hidden Enclaves. Routes must be discovered by players.
- **Classification**: A system's political/narrative category — one of: Oikumene, Uninhabited (Beyond), Lost Colony (Beyond), or Hidden Enclave (Beyond). Determines attribute generation biases.
- **TER Rating**: A system's Technology, Environment, and Resources scores, each generated by rolling 4dF (Fate dice) with classification-based biases and density-derived modifiers.
- **Stellar Density**: The count of neighboring star systems within a configurable radius, used to derive a negative environment modifier. Dense core = harsh environments.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: The full pipeline completes in under 60 seconds on a standard developer machine.
- **SC-002**: Two runs with the same seed produce identical output files.
- **SC-003**: The generated galaxy contains between 10,000 and 14,000 unique star systems.
- **SC-004**: The Oikumene contains between 230 and 270 systems, all outside the core exclusion zone.
- **SC-005**: The Oikumene route network is fully connected — 100% of Oikumene systems are reachable from any other.
- **SC-006**: Beyond systems break down to approximately 85% uninhabited, 5-8% Lost Colonies, and 5-8% Hidden Enclaves.
- **SC-007**: Cost map corridor cells have costs in the 1-3 range and wall cells have costs in the 10-30 range.
- **SC-008**: Every system has a unique name and unique ID with no duplicates.
- **SC-009**: All Oikumene systems have Technology >= +1 and Population >= 6.
- **SC-010**: The cost map PNG file is under 1 MB in size (suitable for loading into a Worker at runtime).

## Assumptions

- The pipeline runs locally on a developer machine under Node.js, not inside Cloudflare Workers. Node.js-specific APIs are acceptable in the generator.
- The generator pipeline lives in a separate `tools/galaxy-generator/` directory with its own `tsconfig.json` and jest config, fully isolated from the Workers `src/` directory. This prevents Node.js types from leaking into the Workers build and keeps the two codebases independently testable.
- Shared domain code (types, interfaces, portable algorithms) lives under `src/` with no dependencies on Workers-specific or Node.js-specific APIs. The generator imports from `src/` for domain types and portable logic; Workers import from `src/` as they already do. This avoids duplicating domain definitions across codebases.
- The output JSON/PNG files will be loaded into D1 via a separate migration script (out of scope for this feature).
- Runtime pathfinding by Workers for player exploration is out of scope — only the offline generation pipeline is in scope. When A\* pathfinding is later needed in Workers, the portable algorithm can be extracted into a shared module.
- System naming uses a seedable Markov chain or similar algorithm; the specific name corpus is a design decision to be made during planning.
- Cross-language reproducibility with the original Python implementation is not required; only TypeScript self-consistency matters.
- The Star Cluster Guide's formulas, tables, and constraints for attribute generation (Size, Atmosphere, Temperature, Hydrography, Population, Starport, Government, Factions, Law Level, Trade Codes, Economics) are adopted without modification except for the classification biases described in the game design spec.
- The pipeline is run rarely (once or a few times) and does not need to be optimized for repeated rapid execution.

## Clarifications

### Session 2026-02-16

- Q: Should the generator pipeline live in `src/` (alongside Workers code) or in a separate top-level directory? → A: Separate `tools/galaxy-generator/` directory with its own `tsconfig.json` and jest config, fully isolated from Workers `src/`. Node.js code must not mix into the Workers codebase.
- Q: Should domain code be shared between generator and Workers? → A: Yes. Portable domain types, interfaces, and algorithms (no Workers or Node.js dependencies) live in `src/` and are imported by both codebases.

## Interview

### Open Questions

_(none)_

### Answer Log

- **Q1** (2026-02-16): Should the generator pipeline live in `src/` (alongside Workers code) or in a separate directory? → **A**: Option A — separate `tools/galaxy-generator/` directory. Node.js must not mix into Workers.
