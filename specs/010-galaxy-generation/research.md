# Research: Galaxy Generation Pipeline

**Feature**: 010-galaxy-generation
**Date**: 2026-02-16

## R-001: Seedable PRNG

**Decision**: Custom Mulberry32 implementation (~20 lines of code)

**Rationale**: Ultra-compact (20 lines), zero dependencies, deterministic, fast (653ms for 400k iterations), and portable across Node.js and Cloudflare Workers. The 32-bit state space is more than sufficient for procedural galaxy generation. Implements the PRNG interface specified in the game design spec (randint + random).

**Alternatives considered**:

- **seedrandom** (npm): Well-maintained but adds external dependency, overkill for non-cryptographic use.
- **xoshiro128\*\***: 128-bit state, slightly better statistical properties. Unnecessary complexity for this use case.
- **Alea**: Good statistical properties (670ms for 400k iterations), but adds dependency and marginally slower.
- **rand-seed** (npm): TypeScript-native wrapper over multiple algorithms. Unnecessary abstraction layer.

**Implementation note**: The Mulberry32 class lives in shared domain code (`src/domain/galaxy/`) since it has no Node.js or Workers dependencies and may be needed by Workers for runtime pathfinding PRNG operations in the future.

---

## R-002: Perlin/Simplex Noise

**Decision**: Use `simplex-noise` npm package (v4.x) with custom PRNG injection

**Rationale**: The library accepts a custom PRNG function for permutation table initialization, ensuring full determinism from the shared PRNG. It's tiny (~2KB minified), fast (~70M noise2D calls/sec), TypeScript-native, and well-maintained. Multi-octave fractal Brownian motion is implemented as a thin wrapper on top.

**Alternatives considered**:

- **Custom Perlin implementation**: 200-300 lines of code with significant testing burden. The game design spec prefers "a simple, dependency-free TypeScript implementation" but also says "use a standard 2D Perlin noise or Simplex noise implementation." The simplex-noise package is effectively dependency-free (no transitive deps) and standard.
- **open-simplex-noise**: Less flexible seeding mechanism, larger package.
- **Porting reference implementation**: Same effort as custom implementation with less community validation.

**Key integration**: `createNoise2D(prng.random.bind(prng))` — pass the shared PRNG's random() method as the seeding function. Noise output is [-1, 1], normalized to [0, 1] with `(value + 1) / 2`.

**Note**: The simplex-noise package is a devDependency only (used by the generator tool, not the Workers runtime). It will be added to the root package.json since the tools/ directory shares the root node_modules.

---

## R-003: PNG Encoding and Decoding

**Decision**: `fast-png` for Node.js encoding; manual uint8 array for Workers decoding

**Rationale**: fast-png is pure JavaScript (no native bindings), lightweight (~30KB), supports 8-bit grayscale natively via `channels: 1`, and is actively maintained. For Workers runtime decoding, the PNG is loaded from R2/D1 as raw bytes — since we control the encoding format, we can store the cost map as a simple binary blob (raw uint8 array) alongside the PNG visualization, avoiding the need for PNG decoding in Workers entirely.

**Alternatives considered**:

- **pngjs**: Excellent grayscale support via `colorType: 0`, but slightly larger and older API.
- **sharp**: Uses native libvips binary — deployment complexity, overkill for simple uint8 → PNG conversion.
- **@cf-wasm/png for Workers decoding**: Good option if PNG decoding is needed, but storing the raw uint8 cost map as a separate binary file avoids this entirely.

**Encoding approach**:

```typescript
import { encode } from 'fast-png';
const pngBuffer = encode({ width, height, depth: 8, channels: 1, data: costMapUint8 });
```

**Workers runtime approach**: Store the cost map as both:

1. `costmap.png` — for visualization and debugging
2. `costmap.bin` — raw uint8 array for direct loading into Workers (no decoding needed)

This avoids importing any PNG library into the Workers bundle. The binary file is simply `new Uint8Array(buffer)` at runtime.

---

## R-004: System Naming

**Decision**: Syllable-based combinatorial generator with Vance-inspired phoneme pools

**Rationale**: Guarantees uniqueness through deterministic PRNG-driven selection from a combinatorial space far larger than 12,000 (40 onsets x 25 nuclei x 25 codas = 25,000 syllable combos per word, with 2-4 syllables and optional multi-word names). No corpus training required — phoneme pools are hand-crafted to match Vance's naming style (exotic vowel clusters, hard consonants, flowing syllables).

**Alternatives considered**:

- **Markov chain**: Higher Vance fidelity but harder to guarantee uniqueness across 12,000 names. Requires corpus building. Collision detection and rerolling complicates determinism.
- **Hash-based naming**: Perfect uniqueness but names feel cold/mechanical.
- **Hybrid Markov + combinatorial**: More complex for marginal style improvement.

**Uniqueness strategy**: The PRNG generates an index that maps deterministically to a syllable sequence. A Set tracks used names during generation. On collision (extremely rare given combinatorial space), the next PRNG value is used. Since the PRNG is deterministic and collisions are resolved in order, the output remains fully deterministic.

**Style characteristics**:

- 60% single-word names (2-4 syllables): "Trasven", "Kormelaith", "Dorvai"
- 25% two-word names: "Trasven Nex", "Dorvai Cluster"
- 15% three-word names: "The Synche Reach", "Port Malagai"
- Phoneme pools emphasize: hard consonants (k, t, d, v), exotic vowels (ai, ei, au, ia), liquid endings (l, r, n, th)

---

## R-005: Project Structure for tools/galaxy-generator/

**Decision**: Separate `tools/galaxy-generator/` directory with its own `tsconfig.json` extending root config, shared `node_modules` and `jest.config.js`

**Rationale**: TypeScript project references are unnecessary here since the generator only imports types (not compiled output) from `src/`. A separate tsconfig that extends the root and overrides `lib` and `module` settings is simpler. The generator uses relative imports to `../../src/domain/` for shared types. Jest uses the multi-project configuration to run both test suites from a single command.

**Key configuration decisions**:

1. **tsconfig**: `tools/galaxy-generator/tsconfig.json` extends root, removes `WebWorker` from lib, keeps `ES2022`. Module remains `NodeNext` (CommonJS interop via package.json `"type": "commonjs"`).
2. **Jest**: Root `jest.config.js` adds a second project entry for `tools/` with its own test roots and coverage collection.
3. **ESLint**: Add `tools/**/*.ts` file override in `eslint.config.mjs` that disables Node.js import restrictions (since the generator legitimately uses `fs`, `path`, `process`).
4. **lint-staged**: Extend to cover `tools/**/*.ts` files with the tools-specific tsconfig for type checking.
5. **Dependencies**: All npm packages stay in root `package.json`. No separate `package.json` for tools/.

**Shared types import pattern**:

```typescript
// From tools/galaxy-generator/src/pipeline.ts
import type { StarSystem } from '../../src/domain/galaxy/types.js';
```

---

## R-006: A\* Pathfinding

**Decision**: Custom implementation in shared domain code (`src/domain/galaxy/`)

**Rationale**: A\* is a well-known algorithm (~100 lines), the game design spec provides the exact heuristic (octile distance), and the implementation must be portable between the generator (Node.js) and Workers (for future player exploration). A binary heap priority queue keeps it efficient. No external library needed.

**Key design points**:

- 8-directional movement with diagonal cost = cellCost \* sqrt(2)
- Octile distance heuristic scaled by minimum cell cost
- Binary heap priority queue (custom, ~50 lines)
- Input: cost map as flat Uint8Array + width/height + quantization params
- Output: path as coordinate array + total cost
- Lives in `src/domain/galaxy/` (portable, no Node.js or Workers dependencies)

---

## R-007: Cellular Automata

**Decision**: Custom implementation following the 4-5 rule from the game design spec

**Rationale**: The CA algorithm is straightforward (~60 lines): initialize grid randomly, iterate with neighbor-counting rule. The game design spec provides exact parameters (45% fill probability, 4-5 iterations, 4-5 rule). No library needed.

**Key design points**:

- Grid stored as flat Uint8Array (0 = open, 1 = wall)
- Boundary cells forced to walls
- Rule: cell becomes wall if 3x3 neighborhood has >= 5 walls
- Configurable: fill probability, iteration count
- Lives in `tools/galaxy-generator/src/` (only used during generation, not at runtime)

---

## R-008: Spatial Indexing

**Decision**: Grid-based spatial hash (custom, ~40 lines)

**Rationale**: For density calculation (12,000 systems, radius ~20-30), a spatial hash reduces neighbor lookup from O(n^2) to effectively O(n). The coordinate space (~800x800) maps naturally to a grid where each cell is `DENSITY_RADIUS` units wide. Only neighboring grid cells need checking.

**Key design points**:

- Hash: `Math.floor(x / cellSize) + Math.floor(y / cellSize) * gridWidth`
- Stores system indices per cell
- Query returns all systems within radius by checking 9 neighboring cells
- Lives in shared domain code if needed at runtime, otherwise in tools/
