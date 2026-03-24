# Implementation Plan: Prestoplot Core

**Branch**: `016-prestoplot-core` | **Date**: 2026-03-24 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/016-prestoplot-core/spec.md`

## Summary

Implement the Prestoplot grammar-based text generation engine — a deterministic, seed-driven library that parses YAML grammar files and renders procedural narrative text. Follows Clean Architecture with domain (pure logic), application (services, ports), and infrastructure (KV/D1 storage, template engines, PRNG adapter) layers. Reuses the existing Mulberry32 PRNG from galaxy generation.

## Technical Context

**Language/Version**: TypeScript ES2022 (Cloudflare Workers runtime)
**Primary Dependencies**: yaml (YAML parsing — NOT yet installed, must `npm install yaml`), @cloudflare/workers-types, existing Mulberry32 PRNG
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
│       └── *.spec.ts             # Colocated tests (one per source file)
├── application/
│   ├── ports/
│   │   ├── GrammarStorage.ts     # StoragePort interface (one file per port)
│   │   ├── TemplateEngine.ts     # TemplateEnginePort interface
│   │   └── RandomSource.ts       # RandomPort + Rng interfaces
│   └── prestoplot/
│       ├── renderStoryService.ts # Entry point: RenderStoryRequest → RenderStoryResult
│       ├── grammarParser.ts      # YAML → Grammar parsing + validation
│       ├── renderEngine.ts       # Per-render execution engine (internal)
│       ├── dto.ts                # GrammarDto, grammarFromDto, grammarToDto
│       └── *.spec.ts             # Colocated tests
├── infrastructure/
│   └── prestoplot/
│       ├── inMemoryStorage.ts    # InMemoryStorage implements GrammarStorage
│       ├── kvStorage.ts          # KVStorage implements GrammarStorage
│       ├── d1Storage.ts          # D1Storage implements GrammarStorage
│       ├── cachedStorage.ts      # CachedStorage decorator with TTL
│       ├── ftemplateEngine.ts    # {expression} tokenizer + evaluator
│       ├── jinja2Engine.ts       # {{ expression }} subset interpreter
│       ├── mulberry32Random.ts   # RandomPort adapter wrapping existing Mulberry32
│       ├── seedHasher.ts         # seedToInt via crypto.subtle SHA-256
│       └── *.spec.ts             # Colocated tests
├── di/
│   └── serviceFactory.ts        # Add prestoplot lazy singleton getters
└── shared/
    └── env.ts                    # Add GRAMMAR_KV: KVNamespace binding

migrations/
└── 0002_grammar_store.sql        # D1 table for grammar storage (if D1 adapter needed)
```

**Structure Decision**: Follows existing Clean Architecture layout. Port interfaces go in `src/application/ports/` (one file per port, matching existing StarSystemRepository.ts, RouteRepository.ts convention). Domain and infrastructure get `prestoplot/` subdirectories mirroring `galaxy/` pattern. Tests colocated with source (Workers vitest pool requirement).

**Coverage Note**: Workers vitest project (`src/**/*.spec.ts`) cannot contribute to v8 coverage reports — the Workers runtime lacks `node:inspector`. The 100% coverage threshold applies to `acceptance/**/*.ts` only. Prestoplot tests run and must pass but are coverage-exempt by runtime constraint.

## Implementation Order

Implementation follows a bottom-up dependency order. Each task is a TDD unit — write failing tests first, implement to green, refactor.

### Layer 0: Setup

1. **Install `yaml` dependency** — `npm install yaml` (pure JS, Workers-compatible YAML parser)

### Layer 1: Domain (Pure Logic, Zero Dependencies)

These have no imports from application or infrastructure. Build in any order, but the natural dependency flow is:

2. **errors.ts** — Domain error types (needed by everything else)
3. **renderedString.ts** — RenderedString value object
4. **seed.ts** — Seed, ScopedSeed value objects (pure string manipulation, no async hashing here)
5. **grammar.ts** — Grammar aggregate root, Rule types, SelectionMode enum, RenderStrategy enum, Databag/Datalist/Database interfaces
6. **articleGeneration.ts** — getArticle pure function with special cases
7. **selectionModes.ts** — Selection algorithm functions (REUSE, PICK, RATCHET, LIST), depends on seed.ts for Rng type
8. **markovChain.ts** — MarkovChainModel, trainMarkovChain, generateMarkov (depends on Rng type)

### Layer 2: Port Interfaces (Must Precede Infrastructure)

Port interfaces MUST exist before infrastructure adapters can implement them:

9. **GrammarStorage.ts** — `src/application/ports/GrammarStorage.ts` — StoragePort interface (follows existing convention: one file per port in `src/application/ports/`)
10. **TemplateEngine.ts** — `src/application/ports/TemplateEngine.ts` — TemplateEnginePort interface
11. **RandomSource.ts** — `src/application/ports/RandomSource.ts` — RandomPort + Rng interfaces

### Layer 3: Infrastructure Adapters (Implements Ports)

Build adapters with InMemoryStorage first (needed for all service tests):

12. **seedHasher.ts** — `seedToInt` using crypto.subtle SHA-256 (async, first 4 bytes → uint32)
13. **mulberry32Random.ts** — RandomPort wrapping existing Mulberry32 + seedHasher
14. **ftemplateEngine.ts** — Ftemplate tokenizer/evaluator implementing TemplateEnginePort
15. **jinja2Engine.ts** — Jinja2 subset implementing TemplateEnginePort
16. **inMemoryStorage.ts** — InMemoryStorage implementing GrammarStorage (needed for all service tests)
17. **kvStorage.ts** — KVStorage implementing GrammarStorage
18. **d1Storage.ts** — D1Storage implementing GrammarStorage + migration
19. **cachedStorage.ts** — CachedStorage decorator wrapping any GrammarStorage

### Layer 4: Application Services

20. **dto.ts** — GrammarDto ↔ Grammar conversion
21. **grammarParser.ts** — YAML string → Grammar parsing + validation (circular include detection, missing reference detection)
22. **renderEngine.ts** — Per-render execution engine (rule resolution, template evaluation, selection state, seed scoping)
23. **renderStoryService.ts** — Top-level orchestrator: load grammar, parse, create RenderEngine, render entry rule, return result

### Layer 5: Integration & Wiring

24. **Env binding** — Add `GRAMMAR_KV: KVNamespace` to `src/shared/env.ts` and `wrangler.toml`
25. **DI wiring** — Register Prestoplot services in `src/di/serviceFactory.ts` using lazy singleton pattern:

```typescript
// In ServiceFactory class:
private _renderStoryService: RenderStoryService | null = null;

/** Grammar-based text generation service. */
get renderStoryService(): RenderStoryService {
  this._renderStoryService ??= new RenderStoryService(
    new KVStorage(this.env.GRAMMAR_KV),
    new FtemplateEngine(),
    new Mulberry32Random()
  );
  return this._renderStoryService;
}
```

### Key Technical Decisions

**Async seed hashing**: `crypto.subtle.digest` is async in Workers. The `seedToInt` function returns `Promise<number>`. RenderEngine caches resolved seed-ints in a `Map<string, number>` (keyed by scoped seed string) to avoid redundant hashing within a single render pass. Pattern:

```typescript
// In RenderEngine:
private readonly seedIntCache = new Map<string, number>();

async getSeedInt(scopedSeed: string): Promise<number> {
  const cached = this.seedIntCache.get(scopedSeed);
  if (cached !== undefined) return cached;
  const value = await this.randomPort.seedToInt(scopedSeed);
  this.seedIntCache.set(scopedSeed, value);
  return value;
}
```

**PRNG reuse**: The existing `Mulberry32` class in `src/domain/galaxy/prng.ts` provides `random(): number` (returns [0,1)) and `randint(min, max): number`. The `Rng` interface in `RandomSource.ts` wraps this with a `next(): number` contract. Construction: `new Mulberry32(seedInt)`.

**PICK mode statefulness**: PICK maintains per-render depletion state. The `SelectionState` (a shuffled index array + cursor) is held in RenderEngine keyed by rule name. Each render pass starts fresh — PICK state does not carry across requests. When the cursor reaches the end, a new epoch begins with a fresh Fisher-Yates shuffle seeded from `baseSeed-{ruleName}-epoch-{N}`.

**Include resolution order**: Breadth-first, left-to-right. Circular detection uses a `Set<string>` of visited grammar keys built during resolution. `CircularIncludeError` thrown before any rule merging occurs. Resolution loads each included grammar from storage, merges rules (included grammar's rules do NOT override the including grammar's same-named rules).

**Template recursion limit**: Both ftemplate and jinja2 engines enforce `MAX_DEPTH = 50`. The `depth` parameter is incremented on each recursive `evaluate()` call. Exceeding MAX_DEPTH throws `TemplateError`.

**Markov chain sentinels**: Uses STX (`\x02`) and ETX (`\x03`) as start/end sentinels instead of spaces. Training pads with configurable order (default 3) STX sentinels at start and one ETX at end. Model is a `Map<string, Map<string, number>>` (ngram → next-char → count).

**YAML parsing**: Use the `yaml` npm package (must be installed — not currently in package.json). Pure JavaScript, no Node.js deps, Workers-compatible. Parser validates schema structure at parse time and reports errors with rule names via `GrammarParseError`.

**Port naming convention**: Follows existing codebase pattern — port interfaces in `src/application/ports/` as individual files (e.g., `GrammarStorage.ts`, `TemplateEngine.ts`, `RandomSource.ts`), matching `StarSystemRepository.ts`, `RouteRepository.ts` pattern. No `I` prefix on interface names.

**No D1 migration in this phase**: The D1 storage adapter is included for completeness but grammars will initially be stored in KV. D1 migration SQL is prepared but not applied unless needed.

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

## Security Considerations

### Storage Namespace Isolation

`GRAMMAR_KV` MUST be a dedicated KV namespace, not shared with other application data. A misconfigured binding pointing at a shared namespace could silently overwrite unrelated KV entries. The DI wiring must enforce this via a dedicated binding name. All mutating operations (save, delete) should log at INFO level for operational traceability.

### Scoped Seed Separator Collision

`scopeSeed` concatenates as `"{baseSeed}-{scopeKey}"`. A rule named `"a-b"` produces the same scoped seed as rule `"a"` further scoped with `"b"`, breaking determinism isolation. **Mitigation**: Rule names MUST NOT contain the separator character. Enforce at parse time in `grammarParser.ts` — reject rule names containing hyphens with `GrammarParseError`. Alternatively, use NUL (`\x00`) as separator. Document separator choice.

### YAML Deserialization Safety

The `yaml` npm package may coerce values unexpectedly (YAML 1.1 `yes`/`no` → booleans, numeric keys → numbers, `null` values in lists). **Mitigation**: Use `yaml.parse(source, { schema: 'json' })` to prevent type coercions. In `grammarParser.ts`, explicitly type-check all values — reject non-string list items (including `null`, `undefined`, `boolean`, `number`) with `GrammarParseError`. Validate rule name keys match `[A-Za-z_][A-Za-z0-9_]*`.

### Seed Input Validation

`RenderStoryRequest.seed` is typed as `string` but `makeSeed` requires exactly 32 lowercase hex characters. **Decision**: The service accepts any non-empty string as a seed and hashes it directly via `seedToInt` — it does NOT require the 32-char hex format externally. `generateSeed()` produces that format for callers who want a canonical seed. Invalid/empty seed maps to a `{ ok: false, kind: 'invalid_seed' }` result variant.

## Edge Cases & Error Handling

### MARKOV Dead-Ends

MARKOV generation with `order > training-item-length` produces dead-end states where no transition exists from the start key. Dead-ends surface as `template_error` in `RenderStoryResult` with no automatic retry. **Guidance for grammar authors**: Ensure Markov training corpus items are longer than the configured order. Add test cases covering MARKOV with `order > training-item-length` to verify `MarkovDeadEndError` propagation.

### MARKOV Deterministic Identity

A MARKOV rule produces **one deterministic value per (seed, ruleName) pair** per render pass. Multiple references to the same MARKOV rule within one template return identical text (the Rng is initialized from the same scoped seed). This is by design — if varied output per reference is needed, authors must use distinct rule names. Document prominently as this is counterintuitive.

### RenderEngine Transience

`RenderEngine` is constructed fresh inside each `render()` call; it MUST NOT be a field on `RenderStoryService`. The service itself is a DI singleton, but it creates a new engine per invocation. `RenderContext` is single-use — once a render call completes (success or failure), the context is discarded. Callers must not retry by calling `renderRule` again on the same engine after an error.

### Include Resolution: Cycles vs. Diamonds

Circular include detection requires tracking the **current resolution path** (a stack), not just a global visited set. A `Set<string>` visited set is used for **deduplication** (prevents redundant loads of the same grammar via different paths — diamond includes). True cycle detection pushes on entry, pops on exit. An already-visited module reached via a different path is silently skipped (correct behavior), not flagged as circular.

### LIST Mode Out-of-Bounds

Accessing an out-of-bounds index via `{Name[N]}` in template expressions MUST throw `TemplateError` with message `"Index N out of range for list 'Name' (length M)"`. The `Datalist.get()` method returns `undefined` for out-of-range, but the template engine converts this to an actionable error. Add test cases in both `ftemplateEngine.spec.ts` and `jinja2Engine.spec.ts`.

### crypto.subtle Failure

`crypto.subtle.digest` failure (resource-constrained isolate, invalid buffer) is currently unhandled. **Mitigation**: Add `{ ok: false, kind: 'seed_error', message: string }` to `RenderStoryResult`. Wrap all `seedToInt` calls in try/catch inside `RenderEngine` and map failures to this variant. The service's "never throws" contract must hold.

### GrammarDto Deserialization

`grammarFromDto` must include runtime type guards for `kind` on each rule DTO. Unrecognized kinds (e.g., from forward-version content in D1) must throw `StorageError`, not produce `undefined`. Add test: `{ kind: 'unknown' }` → `StorageError`.

### Article Generation Non-ASCII Limitation

Accented vowels (é, è, â, ô, etc.) are treated as consonants → return "a". This is a known limitation acceptable for English-language game content. Grammar authors should avoid leading non-ASCII characters in rule outputs used with article accessors. Add an explicit test verifying fallback behavior for words like "élan".

## Performance Considerations

### CachedStorage Required for KV

The DI wiring MUST use `CachedStorage` wrapping `KVStorage` by default — not just for D1. A grammar with 5 transitive includes triggers 5+ KV reads per render. KV cold reads are ~10-40ms each; without caching, a 5-level include chain adds 50-200ms, exceeding the 50ms performance goal. Update `serviceFactory.ts`:

```typescript
get renderStoryService(): RenderStoryService {
  this._renderStoryService ??= new RenderStoryService(
    new CachedStorage(new KVStorage(this.env.GRAMMAR_KV), { ttlMs: 60_000 }),
    new FtemplateEngine(),
    new Mulberry32Random()
  );
  return this._renderStoryService;
}
```

### Render Budget (Evaluation Counter)

The recursion depth limit (MAX_DEPTH = 50) prevents stack overflow for linear chains but not exponential time for branching mutual recursion. A rule rendering `"{B} and {B}"` where B renders `"{C} and {C}"` produces 2^N evaluations before depth N is reached. **Mitigation**: Add `MAX_EVALUATIONS = 10_000` to `RenderContext`. Increment on every `renderRule` call. Throw `RenderBudgetError` when exceeded. This is distinct from recursion depth — it bounds total work regardless of tree shape.

### Template String Length Limit

Template strings exceeding `MAX_TEMPLATE_LENGTH = 10_000` characters should throw `GrammarParseError` at parse time. This prevents oversized cache entries in the singleton `FtemplateEngine` template cache and bounds tokenizer runtime.

### Template Cache Bounds

`FtemplateEngine` caches tokenized templates in a `Map<string, FtemplateToken[]>` on the singleton instance. Growth is bounded by the total number of distinct rule templates across all grammars (finite for a finite grammar set). Document this invariant. If unbounded growth becomes a concern, add `MAX_CACHE_SIZE = 1000` with FIFO eviction.

### Markov Training Corpus Limits

`trainMarkovChain` with large corpus and high order can exceed Workers' 50ms synchronous CPU budget. **Mitigation**: Validate that `totalCorpusChars × order` does not exceed 100,000. Throw `RangeError` if exceeded. Recommended corpus: < 1,000 total characters × order for Workers runtime.

### Include Depth Limit

Separate from template recursion depth. A deep acyclic include chain (200 levels) triggers 200 sequential KV reads. **Mitigation**: Add `MAX_INCLUDE_DEPTH = 20`. Throw `IncludeDepthError` when exceeded. This is distinct from circular detection — it bounds operational latency.

### Seed Cache Memory

`RenderContext.seedIntCache` is bounded by unique scoped seeds per render pass: at most O(rules × depth). For grammars within documented scale (hundreds of rules, MAX_DEPTH 50), this is ~5,000 entries (~300KB). The cache is GC'd after each render call. This is a known tradeoff vs. redundant SHA-256 calls.
