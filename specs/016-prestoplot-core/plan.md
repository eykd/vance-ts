# Implementation Plan: Prestoplot Core

**Branch**: `016-prestoplot-core` | **Date**: 2026-03-24 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/016-prestoplot-core/spec.md`

## Summary

Implement the Prestoplot grammar-based text generation engine — a deterministic, seed-driven library that parses YAML grammar files and renders procedural narrative text. Follows Clean Architecture with domain (pure logic), application (services, ports), and infrastructure (KV/D1 storage, template engines, PRNG adapter) layers. Reuses the existing Mulberry32 PRNG from galaxy generation.

## Technical Context

**Language/Version**: TypeScript ES2022 (Cloudflare Workers runtime)
**Primary Dependencies**: yaml (YAML parsing), @cloudflare/workers-types, existing Mulberry32 PRNG
**Storage**: Cloudflare KV (primary), D1 (alternative), InMemory (testing)
**Testing**: Vitest with @cloudflare/vitest-pool-workers (Workers project), strict TDD
**Target Platform**: Cloudflare Workers V8 isolate
**Project Type**: Web application (Workers backend library, no frontend changes)
**Performance Goals**: Grammar render < 50ms for typical grammars (< 100 rules)
**Constraints**: No Node.js APIs, async seed hashing (crypto.subtle), Workers CPU time limits
**Scale/Scope**: Dozens of grammar files, hundreds of rules per grammar, thousands of renders per request batch

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                         | Status | Notes                                                                     |
| --------------------------------- | ------ | ------------------------------------------------------------------------- |
| I. Test-First Development         | PASS   | Strict TDD, 100% coverage, Workers vitest pool                            |
| II. Type Safety & Static Analysis | PASS   | All types readonly, explicit returns, no any, branded types               |
| III. Code Quality Standards       | PASS   | JSDoc on all public APIs, consistent naming, import order                 |
| IV. Pre-commit Quality Gates      | PASS   | Existing husky + lint-staged pipeline                                     |
| V. Warning & Deprecation Policy   | PASS   | Zero warnings tolerance maintained                                        |
| VI. Workers Target Environment    | PASS   | crypto.subtle (not Node crypto), KV/D1 (not fs), Web Standard APIs        |
| VII. Simplicity & Maintainability | PASS   | Port-adapter pattern justified by 4 storage backends + 2 template engines |

No violations. No complexity tracking needed.

## Project Structure

### Documentation (this feature)

```text
specs/016-prestoplot-core/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output (no unknowns — design specs are comprehensive)
├── data-model.md        # Phase 1 output — entity model
├── contracts/           # Phase 1 output — port interfaces
│   ├── storage-port.md
│   ├── template-engine-port.md
│   └── random-port.md
└── checklists/
    └── requirements.md  # Spec quality checklist
```

### Source Code (repository root)

```text
src/
├── domain/
│   └── prestoplot/
│       ├── grammar.ts            # Grammar aggregate, Rule types, SelectionMode, RenderStrategy
│       ├── renderedString.ts     # RenderedString value object
│       ├── seed.ts               # Seed, ScopedSeed value objects, scopeSeed
│       ├── articleGeneration.ts  # getArticle function (a/an)
│       ├── markovChain.ts        # MarkovChainModel, train, generate
│       ├── selectionModes.ts     # REUSE, PICK, RATCHET, MARKOV, LIST algorithms
│       ├── errors.ts             # ModuleNotFoundError, RuleNotFoundError, CircularIncludeError
│       ├── grammar.spec.ts
│       ├── renderedString.spec.ts
│       ├── seed.spec.ts
│       ├── articleGeneration.spec.ts
│       ├── markovChain.spec.ts
│       ├── selectionModes.spec.ts
│       └── errors.spec.ts
├── application/
│   └── prestoplot/
│       ├── ports.ts              # StoragePort, TemplateEnginePort, RandomPort
│       ├── renderStoryService.ts # Entry point: RenderStoryRequest → RenderStoryResult
│       ├── grammarParser.ts      # YAML → Grammar parsing + validation
│       ├── renderEngine.ts       # Per-render execution engine (internal)
│       ├── dto.ts                # GrammarDto, grammarFromDto, grammarToDto
│       ├── renderStoryService.spec.ts
│       ├── grammarParser.spec.ts
│       ├── renderEngine.spec.ts
│       └── dto.spec.ts
├── infrastructure/
│   └── prestoplot/
│       ├── inMemoryStorage.ts    # InMemoryStorage implements StoragePort
│       ├── kvStorage.ts          # KVStorage implements StoragePort
│       ├── d1Storage.ts          # D1Storage implements StoragePort
│       ├── cachedStorage.ts      # CachedStorage decorator with TTL
│       ├── ftemplateEngine.ts    # {expression} tokenizer + evaluator
│       ├── jinja2Engine.ts       # {{ expression }} subset interpreter
│       ├── mulberry32Random.ts   # RandomPort adapter wrapping existing PRNG
│       ├── seedHasher.ts         # seedToInt via crypto.subtle SHA-256
│       ├── inMemoryStorage.spec.ts
│       ├── kvStorage.spec.ts
│       ├── d1Storage.spec.ts
│       ├── cachedStorage.spec.ts
│       ├── ftemplateEngine.spec.ts
│       ├── jinja2Engine.spec.ts
│       ├── mulberry32Random.spec.ts
│       └── seedHasher.spec.ts
└── shared/
    └── (no new shared files — reuse existing hex.ts, env.ts)

migrations/
└── 0002_grammar_store.sql        # D1 table for grammar storage (if D1 adapter needed)
```

**Structure Decision**: Follows existing Clean Architecture layout. Each layer gets a `prestoplot/` subdirectory mirroring `galaxy/` pattern. Tests colocated with source (Workers vitest pool requirement).

## Implementation Order

Implementation follows a bottom-up dependency order. Each task is a TDD unit — write failing tests first, implement to green, refactor.

### Layer 1: Domain (Pure Logic, Zero Dependencies)

These have no imports from application or infrastructure. Build in any order, but the natural dependency flow is:

1. **errors.ts** — Domain error types (needed by everything else)
2. **renderedString.ts** — RenderedString value object
3. **seed.ts** — Seed, ScopedSeed value objects (pure string manipulation, no async hashing here)
4. **grammar.ts** — Grammar aggregate root, Rule types, SelectionMode enum, RenderStrategy enum, Databag/Datalist/Database interfaces
5. **articleGeneration.ts** — getArticle pure function with special cases
6. **selectionModes.ts** — Selection algorithm functions (REUSE, PICK, RATCHET, LIST), depends on seed.ts for Rng type
7. **markovChain.ts** — MarkovChainModel, trainMarkovChain, generateMarkov (depends on Rng type)

### Layer 2: Infrastructure Adapters (Implements Ports)

Build adapters before application layer so services can be tested with real (in-memory) adapters:

8. **seedHasher.ts** — `seedToInt` using crypto.subtle SHA-256 (async, first 4 bytes → uint32)
9. **mulberry32Random.ts** — RandomPort wrapping existing Mulberry32 + seedHasher
10. **ftemplateEngine.ts** — Ftemplate tokenizer/evaluator implementing TemplateEnginePort
11. **jinja2Engine.ts** — Jinja2 subset implementing TemplateEnginePort
12. **inMemoryStorage.ts** — InMemoryStorage implementing StoragePort (needed for all service tests)
13. **kvStorage.ts** — KVStorage implementing StoragePort
14. **d1Storage.ts** — D1Storage implementing StoragePort + migration
15. **cachedStorage.ts** — CachedStorage decorator wrapping any StoragePort

### Layer 3: Application Services

16. **ports.ts** — Port interfaces (StoragePort, TemplateEnginePort, RandomPort, Rng)
17. **dto.ts** — GrammarDto ↔ Grammar conversion
18. **grammarParser.ts** — YAML string → Grammar parsing + validation (circular include detection, missing reference detection)
19. **renderEngine.ts** — Per-render execution engine (rule resolution, template evaluation, selection state, seed scoping)
20. **renderStoryService.ts** — Top-level orchestrator: load grammar, parse, create RenderEngine, render entry rule, return result

### Layer 4: Integration & Wiring

21. **DI wiring** — Register Prestoplot services in `src/di/serviceFactory.ts`
22. **KV binding** — Add `GRAMMAR_KV` to `wrangler.toml` (if KV used in this phase)

### Key Technical Decisions

**Async seed hashing**: `crypto.subtle.digest` is async in Workers. The seedToInt function returns a Promise. RenderContext caches resolved seed-ints in a Map to avoid redundant hashing within a single render pass.

**PICK mode statefulness**: PICK maintains per-render depletion state. The SelectionState is held in RenderEngine (not persisted). Each render pass starts fresh — PICK state does not carry across requests.

**Include resolution order**: Breadth-first, left-to-right. Circular detection uses a visited-set built during resolution. CircularIncludeError thrown before any rule merging occurs.

**Template recursion limit**: Both ftemplate and jinja2 engines enforce MAX_DEPTH = 50. Exceeding this throws a TemplateError.

**Markov chain sentinels**: Uses STX (\x02) and ETX (\x03) as start/end sentinels instead of spaces. Training pads with configurable order (default 3) STX sentinels at start and one ETX at end.

**YAML parsing**: Use the `yaml` npm package (already available or add as dependency). Parser validates schema structure and reports errors with rule names.

**No D1 migration in Phase 1**: The D1 storage adapter is included for completeness but grammars will initially be stored in KV. D1 migration deferred unless needed.

## Applied Learnings

No relevant solutions found in `.specify/solutions/` — solutions index is empty.

## Post-Design Constitution Re-Check

| Principle                         | Status | Notes                                                           |
| --------------------------------- | ------ | --------------------------------------------------------------- |
| I. Test-First Development         | PASS   | All 20+ files have colocated .spec.ts, strict TDD               |
| II. Type Safety & Static Analysis | PASS   | Branded types (Seed), readonly throughout, no any               |
| III. Code Quality Standards       | PASS   | JSDoc on all exports, PascalCase types, UPPER_CASE enum members |
| IV. Pre-commit Quality Gates      | PASS   | No changes to pipeline                                          |
| V. Warning & Deprecation Policy   | PASS   | Zero warnings maintained                                        |
| VI. Workers Target Environment    | PASS   | crypto.subtle, KV, D1 — all Workers-native                      |
| VII. Simplicity & Maintainability | PASS   | Bottom-up build order, each file independently testable         |

All gates pass. No violations to justify.
