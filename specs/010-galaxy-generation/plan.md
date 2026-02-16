# Implementation Plan: Galaxy Generation Pipeline

**Branch**: `010-galaxy-generation` | **Date**: 2026-02-16 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/010-galaxy-generation/spec.md`

## Summary

An offline TypeScript pipeline that generates a complete galaxy (~12,000 star systems) from a single seed value. The pipeline produces deterministic output including star positions via spiral galaxy algorithm, a 2D traversal cost map (Perlin noise + cellular automata), Oikumene selection (~250 civilized systems), full system attributes (TER, planetary, civilization, trade codes, economics), and pre-computed A\* routes between Oikumene neighbors. Output is JSON files + PNG/binary cost map, consumed by a D1 migration loader (out of scope).

The generator lives in `tools/galaxy-generator/` with its own tsconfig (Node.js target), while shared domain types (PRNG, pathfinding, dice, type definitions) live in `src/domain/galaxy/` for portability between the generator and Cloudflare Workers.

## Technical Context

**Language/Version**: TypeScript 5.9 / Node.js >= 22.0.0
**Primary Dependencies**: `simplex-noise` (Perlin/Simplex noise with seedable PRNG), `fast-png` (grayscale PNG encoding). Custom implementations for PRNG (Mulberry32), A\* pathfinding, cellular automata, spatial hashing, and name generation.
**Storage**: File system output (JSON + PNG + binary). No database in the generator.
**Testing**: Jest with ts-jest, 100% coverage threshold, strict red-green-refactor TDD
**Target Platform**: Node.js 22+ (generator pipeline); shared types portable to Cloudflare Workers
**Project Type**: Tool + shared domain library (dual-target sub-project)
**Performance Goals**: Full pipeline < 60 seconds on standard developer machine
**Constraints**: Deterministic output from seed (byte-for-byte identical across runs), ~12,000 systems, single shared PRNG instance across all stages
**Scale/Scope**: ~12,000 star systems, ~250 Oikumene, ~1,800 routes, ~820x820 cost map grid

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                       | Status              | Notes                                                                                                                                     |
| ------------------------------- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| I. Test-First Development       | PASS                | Strict TDD for all TypeScript code. 100% coverage enforced.                                                                               |
| II. Type Safety                 | PASS                | Strict TypeScript, all flags enabled. Generator tsconfig extends root.                                                                    |
| III. Code Quality Standards     | PASS                | JSDoc, naming conventions, import order — all apply to generator code.                                                                    |
| IV. Pre-commit Quality Gates    | PASS                | lint-staged extended to cover `tools/**/*.ts` with tools-specific tsconfig.                                                               |
| V. Warning/Deprecation Policy   | PASS                | Zero tolerance.                                                                                                                           |
| VI. Cloudflare Workers Target   | JUSTIFIED EXCEPTION | Generator runs on Node.js (uses fs, path). Only shared types in `src/domain/galaxy/` must be Workers-compatible. See Complexity Tracking. |
| VII. Simplicity/Maintainability | PASS                | Pipeline stages are simple, sequential, independently testable. No speculative features.                                                  |

**Post-Phase 1 Re-check**: All gates still pass. The ESLint configuration adds a `tools/**/*.ts` override that disables Node.js import restrictions for the generator directory only, preserving the Workers constraint for `src/`.

## Project Structure

### Documentation (this feature)

```text
specs/010-galaxy-generation/
├── plan.md              # This file
├── research.md          # Phase 0: technology decisions
├── data-model.md        # Phase 1: entity/value object definitions
├── quickstart.md        # Phase 1: development setup guide
└── contracts/           # Phase 1: interface specifications
    ├── pipeline-cli.md
    ├── output-format.md
    └── shared-domain-types.md
```

### Source Code (repository root)

```text
src/domain/galaxy/                    # Shared portable domain types + algorithms
├── types.ts                          # StarSystem, Route, Classification, CostMap types
├── prng.ts                           # PRNG interface + Mulberry32 implementation
├── dice.ts                           # 4dF, NdS dice roll utilities
├── pathfinding.ts                    # A* pathfinder + binary heap priority queue
└── spatial-hash.ts                   # Grid-based spatial index for neighbor lookups

tools/galaxy-generator/
├── tsconfig.json                     # Extends root, Node.js target (no WebWorker lib)
└── src/
    ├── index.ts                      # CLI entry point (argument parsing, config loading)
    ├── pipeline.ts                   # Top-level orchestrator (stages 1-7 in sequence)
    ├── config.ts                     # Default configuration + config file loading
    ├── galaxy/
    │   ├── galaxy-generator.ts       # Star position generation (spiral algorithm)
    │   ├── spiral-arm-generator.ts   # Arm-level generation
    │   └── elliptic-starfield.ts     # Cloud-level star placement
    ├── costmap/
    │   ├── perlin-layer.ts           # Perlin noise layer generation (wraps simplex-noise)
    │   ├── cellular-automata.ts      # CA grid generation and iteration
    │   └── cost-composer.ts          # Combines layers into final cost map
    ├── systems/
    │   ├── density.ts                # Stellar density calculation (uses spatial hash)
    │   ├── classification.ts         # Oikumene selection + Beyond classification
    │   ├── attributes.ts             # TER + planetary + civilization generation
    │   ├── trade-codes.ts            # Trade code assignment from attribute combinations
    │   ├── economics.ts              # Economic derivations (WTN, GWP, etc.)
    │   └── naming.ts                 # System name generation (syllable combinatorial)
    ├── routing/
    │   └── route-builder.ts          # Oikumene route pre-computation + network validation
    └── output/
        └── file-writer.ts            # JSON + PNG + binary file output
```

**Structure Decision**: Dual-target architecture. Shared domain code in `src/domain/galaxy/` (portable, no Node.js or Workers APIs). Generator-specific code in `tools/galaxy-generator/` (Node.js, uses fs/path for file I/O). This matches the spec's assumption that "shared domain code lives under `src/` with no dependencies on Workers-specific or Node.js-specific APIs."

## Complexity Tracking

| Violation                                                        | Why Needed                                                                                                 | Simpler Alternative Rejected Because                                                                                                                                                                                                                      |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Constitution VI: Generator uses Node.js APIs (fs, path, process) | Generator is an offline tool that writes ~12,000 JSON files + PNG to disk. File I/O requires Node.js APIs. | Running the generator inside Workers is impractical — Workers have no file system, and the pipeline produces local files for a separate D1 migration loader. The spec explicitly states "The pipeline runs locally on a developer machine under Node.js." |
| ESLint: Node.js import restrictions disabled for `tools/`        | Generator legitimately imports fs, path, process for CLI and file output.                                  | Wrapping all Node.js calls behind interfaces adds unnecessary abstraction for a tool that will only ever run on Node.js. The restriction override is scoped to `tools/**/*.ts` only — `src/` retains full Workers enforcement.                            |

## Design Decisions

### D-001: PRNG — Custom Mulberry32

Custom 20-line implementation. Zero dependencies, portable across Node.js and Workers, deterministic from 32-bit seed. See [research.md](./research.md#r-001-seedable-prng).

### D-002: Noise — simplex-noise package

The `simplex-noise` npm package (v4.x) accepts a custom PRNG function for permutation table initialization. Multi-octave fractal Brownian motion implemented as a thin wrapper. See [research.md](./research.md#r-002-perlinsimplex-noise).

### D-003: PNG — fast-png for encoding, raw binary for Workers

`fast-png` for Node.js encoding (pure JS, no native deps). Workers load the cost map as a raw `costmap.bin` file, avoiding PNG decoding entirely. See [research.md](./research.md#r-003-png-encoding-and-decoding).

### D-004: Naming — Syllable-based combinatorial generator

Deterministic syllable selection from PRNG-driven index, with Vance-inspired phoneme pools. Guarantees uniqueness through combinatorial space (25,000+ possible syllables) plus Set-based collision detection. See [research.md](./research.md#r-004-system-naming).

### D-005: Pathfinding — Custom A\* in shared domain

Custom A\* with binary heap, 8-directional movement, octile distance heuristic. Lives in `src/domain/galaxy/pathfinding.ts` for portability — the same algorithm will be used by Workers for player exploration. See [research.md](./research.md#r-006-a-pathfinding).

### D-006: Project structure — Shared node_modules, separate tsconfig

Generator extends root tsconfig but overrides `lib` (no WebWorker) and sets Node.js-appropriate options. Single `jest.config.js` with multi-project configuration. ESLint adds a `tools/` override to allow Node.js imports. See [research.md](./research.md#r-005-project-structure).

## Implementation Stages

The pipeline is implemented stage by stage, mirroring the 7-stage pipeline from the game design spec. Each stage is independently testable.

### Stage 0: Foundation (Infrastructure)

Set up the project structure and shared domain types.

1. Create `tools/galaxy-generator/tsconfig.json`
2. Update `jest.config.js` with multi-project configuration
3. Update `eslint.config.mjs` with `tools/` override
4. Update `tsconfig.eslint.json` to include `tools/`
5. Update `lint-staged` in `package.json` for `tools/` files
6. Install new dependencies: `simplex-noise`, `fast-png`
7. Create `src/domain/galaxy/types.ts` — all shared type definitions
8. Create `src/domain/galaxy/prng.ts` — PRNG interface + Mulberry32
9. Create `src/domain/galaxy/dice.ts` — 4dF and NdS utilities

### Stage 1: Galaxy Generation (FR-002, FR-002a, FR-003, FR-013)

Three-level spiral galaxy star placement matching the algorithm in game design spec §3.1, followed by coordinate deduplication.

#### 1a. `tools/galaxy-generator/src/galaxy/elliptic-starfield.ts`

**Signature**: `function* generateEllipticStarfieldCoords(params: EllipticStarfieldParams): Generator<Coordinate>`

**Parameters**: `amount`, `center: [number, number]`, `radius: [number, number]` (rx, ry), `turn`, `multiplier`, `rng: Prng`

**Pseudocode** (must match game design spec §3.1.3 exactly):

```
for i in 0..amount-1:
    degree = rng.randint(0, 360)
    insideFactor = (rng.randint(0, 10000) / 10000) ^ 2   // quadratic center bias
    posX = sin(degree) * round(insideFactor * rx)          // NOTE: sin for x
    posY = cos(degree) * round(insideFactor * ry)          // NOTE: cos for y
    if turn != 0: apply 2D rotation by turn angle
    yield { x: round((center[0] + posX) * multiplier), y: round((center[1] + posY) * multiplier) }
```

**Key implementation details**:

- **sin for x, cos for y**: Intentionally swapped from typical convention. Must be preserved exactly.
- **Rounding before trig**: `round(insideFactor * rx)` happens before the `sin` multiplication.
- **Quadratic bias**: `insideFactor²` clusters most stars near the cloud center.
- Trig functions operate on degrees (use `degree * π / 180` conversion).

**Test requirements**: Deterministic output with fixed seed, center-biased distribution (verify more points near center than edges), correct sin/cos swap, turn rotation correctness.

#### 1b. `tools/galaxy-generator/src/galaxy/spiral-arm-generator.ts`

**Signature**: `function* generateSpiralArmCoords(params: SpiralArmParams): Generator<Coordinate>`

**Parameters** (pre-computed at galaxy level): `center: [number, number]`, `sx`, `sy` (radians-converted size), `shift` (arm angular offset), `turn`, `deg`, `xp1`, `yp1`, `mulStarAmount`, `dynSizeFactor`, `multiplier`, `rng: Prng`

**Pseudocode** (must match game design spec §3.1.2 exactly):

```
n = 0
while n <= deg:
    rawX = cos(n) * (n * sx) * dynSizeFactor
    rawY = sin(n) * (n * sy) * dynSizeFactor
    armAngle = shift + turn
    rotatedX = round(rawX * cos(armAngle) - rawY * sin(armAngle))
    rotatedY = round(rawX * sin(armAngle) + rawY * cos(armAngle))
    dist = sqrt(rotatedX² + rotatedY²)
    sizeTemp = 2 + (mulStarAmount * n) / ((dist / 200) || 1)    // div-by-zero guard
    starCount = floor(sizeTemp / (n || 2))                        // div-by-zero guard
    yield* generateEllipticStarfieldCoords({
        amount: starCount,
        center: [center[0] + rotatedX, center[1] + rotatedY],
        radius: [rotatedX, rotatedY],
        turn: 0, multiplier, rng
    })
    n += rng.randint(0, 4) + 1    // random 1-5 degree step
```

**Key implementation details**:

- **Variable naming**: Python code shadows the galaxy-level `xp1`/`yp1` with local rotation results. TypeScript MUST use distinct names (e.g., `rotatedX`/`rotatedY`) to avoid confusion.
- **Division-by-zero guards**: `(dist / 200) || 1` and `(n || 2)` — use logical OR to default to safe values.
- **Trig on degrees**: `cos(n)` and `sin(n)` operate on `n` in degrees.
- The `radius` passed to elliptic starfield uses the rotated position, not the galaxy-level `xp1`/`yp1`.

**Test requirements**: Deterministic output, stars placed along a spiral curve, cloud sizes decrease with distance from center, random step produces variable spacing.

#### 1c. `tools/galaxy-generator/src/galaxy/galaxy-generator.ts`

**Generator signature**: `function* generateSpiralGalaxyCoords(config: GalaxyGeneratorConfig): Generator<Coordinate>`

**Collector signature**: `function generateGalaxy(config: GalaxyGeneratorConfig): Coordinate[]`

**Galaxy generator pseudocode** (must match game design spec §3.1.1 exactly):

```
sx = 2.0 * size[0] * π / 360.0       // ≈ 69.8 for default 4000
sy = 2.0 * size[1] * π / 360.0
xp1 = round(deg / π * sx / 1.7) * dynSizeFactor
yp1 = round(deg / π * sy / 1.7) * dynSizeFactor
mulStarAmount = (xp1 + yp1) / spcFactor

count = 0
for arm in 0..arms-1:
    shift = (arm / arms) * 2 * π
    for coord of generateSpiralArmCoords({ center, sx, sy, shift, turn, deg, xp1, yp1, mulStarAmount, dynSizeFactor, multiplier, rng }):
        yield coord
        count++
        if limit != null && count >= limit: return
```

**Collector (`generateGalaxy`)**: Calls `generateSpiralGalaxyCoords`, collects all coordinates, deduplicates using a `Set<string>` keyed by `"x,y"` string, returns unique `Coordinate[]`.

**Test requirements**:

- Default config produces ~12,000 raw coordinates, ~10,000–14,000 after deduplication.
- Coordinates span approximately ±400 in each axis.
- Deterministic: same seed produces identical output.
- Four-arm structure visible (coordinates cluster along 4 spiral arms).
- Limit parameter correctly caps output.
- Deduplication removes exact duplicate integer coordinates.

### Stage 2: Cost Map Generation (FR-004, FR-015)

Perlin noise + cellular automata + cost composition.

1. `tools/galaxy-generator/src/costmap/perlin-layer.ts` — simplex-noise wrapper with FBM
2. `tools/galaxy-generator/src/costmap/cellular-automata.ts` — CA grid with 4-5 rule
3. `tools/galaxy-generator/src/costmap/cost-composer.ts` — three-layer composition
4. Tests verify: grid dimensions, corridor costs 1-3, wall costs 10-30, boundary walls, determinism

### Stage 3: Density Calculation (FR-005)

Spatial indexing and neighbor counting.

1. `src/domain/galaxy/spatial-hash.ts` — grid-based spatial index
2. `tools/galaxy-generator/src/systems/density.ts` — density calculation + environment penalty
3. Tests verify: correct neighbor counts, penalty formula, sparse vs dense regions

### Stage 4: Oikumene Selection (FR-006, FR-008)

Core exclusion, cluster identification, Beyond classification.

1. `tools/galaxy-generator/src/systems/classification.ts` — Oikumene selection algorithm + Beyond roll
2. Tests verify: ~250 Oikumene outside core, ~85/5-8/5-8% Beyond breakdown, determinism

### Stage 5: System Attributes (FR-007, FR-008, FR-012)

Full attribute generation for all systems.

1. `tools/galaxy-generator/src/systems/attributes.ts` — TER + planetary + civilization
2. `tools/galaxy-generator/src/systems/trade-codes.ts` — trade code derivation
3. `tools/galaxy-generator/src/systems/economics.ts` — economic calculations
4. `tools/galaxy-generator/src/systems/naming.ts` — name generation
5. Tests verify: classification biases (Oikumene tech >= +1, pop >= 6, etc.), unique names/IDs, determinism

### Stage 6: Route Pre-computation (FR-009, FR-010, FR-016)

A\* pathfinding and network validation.

1. `src/domain/galaxy/pathfinding.ts` — A\* algorithm + binary heap
2. `tools/galaxy-generator/src/routing/route-builder.ts` — route computation + connectivity validation
3. Tests verify: routes between Oikumene pairs within range, full connectivity, bridge routes, bidirectional storage

### Stage 7: Output + CLI (FR-011, FR-014, FR-001)

File writing, CLI argument parsing, pipeline orchestration.

1. `tools/galaxy-generator/src/output/file-writer.ts` — JSON + PNG + binary output
2. `tools/galaxy-generator/src/config.ts` — default config + config file loading
3. `tools/galaxy-generator/src/pipeline.ts` — stage orchestrator
4. `tools/galaxy-generator/src/index.ts` — CLI entry point
5. Tests verify: output file structure, metadata correctness, deterministic reproduction, end-to-end pipeline

## Dependencies

### New npm packages (devDependencies)

| Package         | Version | Purpose                                        |
| --------------- | ------- | ---------------------------------------------- |
| `simplex-noise` | ^4.0.0  | Seedable Simplex noise for cost map generation |
| `fast-png`      | ^6.0.0  | Grayscale PNG encoding for cost map output     |

### Existing packages used

| Package      | Purpose                         |
| ------------ | ------------------------------- |
| `ts-jest`    | TypeScript compilation for Jest |
| `jest`       | Testing framework               |
| `typescript` | Compiler                        |

### No new runtime dependencies

All new packages are used only by the offline generator tool (devDependencies). The Workers runtime bundle is unaffected.

## Performance Considerations

_Added by red team review (2026-02-16). User flagged performance as primary concern._

### P-001: A\* Route Computation Is the Dominant Bottleneck (High)

The pipeline pre-computes ~1,800 routes using A\* on an 820×820 cost map grid (~672K cells). Each A\* search can visit thousands of nodes, and the total route computation stage is by far the most expensive operation in the pipeline.

**Mitigations**:

1. **Pre-filter candidate pairs by Euclidean distance** before running A\*. Only pairs within `maxRange` coordinate units need pathfinding. Use the spatial hash (already planned for density) to enumerate candidate pairs in O(n) instead of O(n²).
2. **Binary heap priority queue** (already in plan) — confirm O(log n) insertion/extraction.
3. **Early termination**: If A\* has expanded nodes totaling more cost than a configurable maximum (e.g., 2× the straight-line heuristic), abandon the search. This prevents degenerate paths through dense walls from consuming disproportionate time.
4. **Typed arrays for visited/cost maps**: Use `Float64Array` for g-scores and `Uint8Array` for the closed set instead of `Map`/`Set` objects. Flat array indexing (`y * width + x`) avoids hash overhead and is cache-friendly.
5. **Measure and log per-route timing** in verbose mode to identify outlier routes that take disproportionately long.

**Performance budget**: Route computation should complete in < 30 seconds (half the total 60-second budget). If it exceeds this, the typed-array and early-termination mitigations must be applied.

### P-002: 12,000 Individual File Writes (High)

Writing ~12,000 separate JSON files for star systems is I/O-bound. Each `fs.writeFile` call incurs filesystem overhead (inode allocation, directory entry update, fsync). On many systems, the default open file descriptor limit is 1024.

**Mitigations**:

1. **Batch file writes with a concurrency limiter** (e.g., process 50-100 files concurrently using a simple semaphore pattern with `Promise.all`). This avoids EMFILE errors from exceeding the file descriptor limit.
2. **Use `fs.promises.writeFile`** (async, non-blocking) — never synchronous `fs.writeFileSync`.
3. **Create the `systems/` directory with `{ recursive: true }`** before starting writes.
4. **Pre-serialize all JSON strings in memory** before starting I/O, so CPU and I/O work don't interleave.

**Performance budget**: File output should complete in < 10 seconds.

### P-003: Route Path Storage Size (Medium)

Each route stores the full ordered path as `[number, number][]` coordinate pairs. With ~1,800 routes averaging ~35-40 steps each, `routes.json` could reach 5-10 MB of JSON — large to serialize and write.

**Mitigations**:

1. **Accept the size** — the file is written once and read at import time. 10 MB JSON is not problematic for an offline tool.
2. **Stream the JSON write** if serialization of the full object exceeds available memory (unlikely at 10 MB, but defensive).
3. **Log the final routes.json file size** in the summary output so developers notice if it grows unexpectedly.

### P-004: Per-Stage Time Budget (Medium)

The plan has a 60-second total performance budget (SC-001) but no per-stage breakdown. Without stage-level budgets, a slow stage could silently consume the entire budget.

**Per-stage time budget** (approximate, standard developer machine):

| Stage                 | Budget | Rationale                       |
| --------------------- | ------ | ------------------------------- |
| 1. Star positions     | < 1s   | Simple math, ~12K iterations    |
| 2. Cost map           | < 2s   | 820×820 grid, Perlin + CA       |
| 3. Density            | < 1s   | Spatial hash, ~12K lookups      |
| 4. Oikumene selection | < 1s   | ~250 selections from ~12K       |
| 5. System attributes  | < 2s   | ~12K × dice rolls + derivations |
| 6. Route computation  | < 30s  | ~1,800 A\* searches (dominant)  |
| 7. File output        | < 10s  | ~12K file writes + PNG encoding |

**Implementation**: The pipeline orchestrator should use `performance.now()` to time each stage and print per-stage durations in the completion summary. If any stage exceeds 2× its budget, log a warning.

### P-005: File Descriptor Limits (Medium)

The default `ulimit -n` on many Linux/macOS systems is 1024 open file descriptors. Writing 12,000 files concurrently would exceed this limit and cause EMFILE errors.

**Mitigation**: The concurrency limiter from P-002 (50-100 concurrent writes) inherently prevents this. Document the requirement: "The output stage uses a concurrency limit of 100 concurrent file writes to avoid exhausting OS file descriptor limits."

## Edge Cases & Error Handling

_Added by red team review (2026-02-16)._

### E-001: A\* Returns No Path for In-Range Oikumene Pairs (High)

Two Oikumene systems may be within `maxRange` Euclidean distance but separated by an impenetrable wall of high-cost cells in the cost map. A\* would return `null` for these pairs.

**Handling strategy**:

1. A\* returning `null` is not an error — skip the pair and log at verbose level.
2. The connectivity validation (FR-010) runs after route computation. If skipped pairs cause disconnected components, the bridge route logic adds longer-distance routes to reconnect.
3. Bridge routes use A\* without a distance cap, so they can traverse through walls (expensive but guaranteed to find a path since the cost map has no infinite-cost cells).
4. **Test**: Verify that a pair with no open-corridor path between them is correctly skipped and the network remains connected via bridge routes.

### E-002: Insufficient Oikumene Candidates After Filtering (Medium)

The Oikumene selection algorithm filters by: (a) outside core exclusion zone, (b) within spiral arm cluster, (c) within connected open corridors. If the cost map or spiral arm geometry produces too few candidates, the target of ~250 cannot be reached.

**Handling strategy**:

1. After filtering, check that candidate count >= `targetCount`. If not, log a warning and relax the corridor openness requirement (accept systems near corridor edges).
2. If still insufficient after relaxation, abort with exit code 3 and a clear error message specifying the bottleneck (core exclusion too large, corridor coverage too sparse, etc.).
3. **Test**: Verify with a config that produces a very sparse corridor that the pipeline either relaxes successfully or aborts cleanly.

### E-003: Name Collision Cascade (Low)

The syllable combinator has ~25,000+ unique single-word names. With ~7,200 single-word names needed (60% of 12,000), ~29% of the space is consumed. Collisions are resolved by consuming the next PRNG value. If the PRNG sequence produces a cluster of collisions, generation slows.

**Handling strategy**:

1. Track total collision count during name generation. Log the collision rate in verbose mode.
2. If collision rate exceeds 10%, log a warning — this signals the phoneme pools may need expansion.
3. The current design is correct (collisions don't break determinism), so this is observability only.

### E-004: Pipeline Stage Failure Recovery (Medium)

The pipeline runs 7 sequential stages. If a mid-pipeline stage fails (e.g., stage 4 Oikumene selection aborts), partial output may already exist from stage 7 of a previous run.

**Handling strategy**:

1. **Clean output directory at pipeline start**: Remove the output directory (if it exists) and recreate it before any stage runs. This prevents stale files from a previous run mixing with new output.
2. **Fail fast**: If any stage throws, the pipeline logs the stage name and error, cleans up the output directory, and exits with code 2.
3. **No partial output**: The file-writing stage (stage 7) runs last. All earlier stages operate in memory. If any stage 1-6 fails, no files are written.

### E-005: Disk Space and File System Errors During Output (Medium)

The output stage writes ~12,000 JSON files + PNG + binary + metadata + routes. Total output is ~20-30 MB depending on route path sizes.

**Handling strategy**:

1. **Check disk space** is not practical portably. Instead, wrap all file writes in try/catch and provide a clear error message if a write fails (including the file path and OS error).
2. **Fail on first write error**: Do not continue writing if one file fails — the output is already inconsistent.
3. **Log total bytes written** in the summary for observability.
