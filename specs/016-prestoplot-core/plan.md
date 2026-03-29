# Implementation Plan: Prestoplot Core

**Branch**: `016-prestoplot-core` | **Date**: 2026-03-24 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/016-prestoplot-core/spec.md`

## Summary

Implement the Prestoplot grammar-based text generation engine — a deterministic, seed-driven library that parses YAML grammar files and renders procedural narrative text. Follows Clean Architecture with domain (pure logic), application (services, ports), and infrastructure (KV/D1 storage, template engines, PRNG adapter) layers. Reuses the existing Mulberry32 PRNG from galaxy generation.

## Technical Context

**Language/Version**: TypeScript ES2022 (Cloudflare Workers runtime)
**Primary Dependencies**: yaml ^2.3.0 (YAML parsing — present in `node_modules/` v2.8.2 as transitive dep but NOT a direct dependency; must `npm install yaml@^2.3.0` to make it explicit and prevent silent removal; `maxAliasCount` and `uniqueKeys` options are available since 2.0.0 but ^2.3.0 is pinned for stability; browser build used via conditional exports — Workers-compatible, no Node.js imports), @cloudflare/workers-types, existing Mulberry32 PRNG
**Storage**: Cloudflare KV (primary), D1 (alternative), InMemory (testing)
**Testing**: Vitest with @cloudflare/vitest-pool-workers (Workers project), strict TDD
**Target Platform**: Cloudflare Workers V8 isolate
**Project Type**: Web application (Workers backend library, no frontend changes)
**Performance Goals**: Grammar render < 50ms for typical grammars (< 100 rules)
**Constraints**: No Node.js APIs, async seed hashing (crypto.subtle), Workers CPU time limits
**Scale/Scope**: Dozens of grammar files, hundreds of rules per grammar, thousands of renders per request batch

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                         | Status | Notes                                                                    |
| --------------------------------- | ------ | ------------------------------------------------------------------------ |
| I. Test-First Development         | PASS   | Strict TDD, 100% coverage, Workers vitest pool                           |
| II. Type Safety & Static Analysis | PASS   | All types readonly, explicit returns, no any, branded types              |
| III. Code Quality Standards       | PASS   | JSDoc on all public APIs, consistent naming, import order                |
| IV. Pre-commit Quality Gates      | PASS   | Existing husky + lint-staged pipeline                                    |
| V. Warning & Deprecation Policy   | PASS   | Zero warnings tolerance maintained                                       |
| VI. Workers Target Environment    | PASS   | crypto.subtle (not Node crypto), KV/D1 (not fs), Web Standard APIs       |
| VII. Simplicity & Maintainability | PASS   | Port-adapter pattern justified by 4 storage backends + 1 template engine |

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
│       ├── jinja2Engine.ts       # {{ expression }} template engine (sole implementation)
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

**Structure Decision**: Follows existing Clean Architecture layout. Port interfaces go in `src/application/ports/` (one file per port, matching existing StarSystemRepository.ts, RouteRepository.ts convention). Domain and infrastructure get `prestoplot/` subdirectories mirroring `galaxy/` pattern. Tests colocated with source (Workers vitest pool requirement). Single template engine (jinja2 subset) — no ftemplate.

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
14. **jinja2Engine.ts** — Jinja2 subset implementing TemplateEnginePort (sole template engine)
15. **inMemoryStorage.ts** — InMemoryStorage implementing GrammarStorage (needed for all service tests)
16. **kvStorage.ts** — KVStorage implementing GrammarStorage
17. **d1Storage.ts** — D1Storage implementing GrammarStorage + migration
18. **cachedStorage.ts** — CachedStorage decorator wrapping any GrammarStorage

### Layer 4: Application Services

19. **dto.ts** — GrammarDto ↔ Grammar conversion
20. **grammarParser.ts** — YAML string → Grammar parsing + validation (circular include detection, missing reference detection)
21. **renderEngine.ts** — Per-render execution engine (rule resolution, template evaluation, selection state, seed scoping)
22. **renderStoryService.ts** — Top-level orchestrator: load grammar, parse, create RenderEngine, render entry rule, return result

### Layer 5: Integration & Wiring

23. **Env binding** — Add `GRAMMAR_KV: KVNamespace` to `src/shared/env.ts` and `wrangler.toml`
24. **DI wiring** — Register Prestoplot services in `src/di/serviceFactory.ts` using lazy singleton pattern:

```typescript
// In ServiceFactory class:
private _renderStoryService: RenderStoryService | null = null;

/** Grammar-based text generation service. */
get renderStoryService(): RenderStoryService {
  this._renderStoryService ??= new RenderStoryService(
    new KVStorage(this.env.GRAMMAR_KV),
    new Jinja2Engine(),
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

**PICK mode statefulness**: PICK maintains per-render depletion state. The `SelectionState` (a shuffled index array + cursor) is held in RenderEngine keyed by rule name. Each render pass starts fresh — PICK state does not carry across requests. When the cursor reaches the end, a new epoch begins with a fresh Fisher-Yates shuffle seeded from `baseSeed-{ruleName}-epoch-{N}`. The epoch counter is stored in `RenderContext.selectionState` and is reset to 0 at the start of each render call. It is impossible for epoch counters to accumulate across requests because `RenderContext` is discarded after each `render()` call completes. Add a test verifying that two separate calls to `renderStoryService.render()` with the same seed produce identical output (confirming state isolation between calls).

**Include resolution order**: Breadth-first, left-to-right. Circular detection uses a `Set<string>` of visited grammar keys built during resolution. `CircularIncludeError` thrown before any rule merging occurs. Resolution loads each included grammar from storage, merges rules (included grammar's rules do NOT override the including grammar's same-named rules).

**Template recursion limit**: The jinja2 engine enforces `MAX_DEPTH = 50`. The `depth` parameter is incremented on each recursive `evaluate()` call. Exceeding MAX_DEPTH throws `TemplateError`.

**Markov chain sentinels**: Uses STX (`\x02`) and ETX (`\x03`) as start/end sentinels instead of spaces. Training pads with configurable order (default 3) STX sentinels at start and one ETX at end. Model is a `Map<string, Map<string, number>>` (ngram → next-char → count).

**YAML parsing**: Use the `yaml` npm package (present as transitive dep at v2.8.2 in `node_modules/`, but MUST be added as a direct dependency via `npm install yaml@^2.3.0` to prevent silent removal on dependency tree changes). Pure JavaScript, no Node.js deps, Workers-compatible. Parser validates schema structure at parse time and reports errors with rule names via `GrammarParseError`.

**Markov rng.choice implementation**: The Markov spec references `rng.choice(successors)` but the `Rng` interface only exposes `next(): number`. Implement `choice` as a utility function: `function rngChoice<T>(rng: Rng, items: readonly T[]): T { return items[Math.floor(rng.next() * items.length)]!; }`. Place in `markovChain.ts` as a private helper (co-located with its only caller). This has the same modulo bias as `randint` (documented in Edge Cases) — acceptable for text generation.

**Port naming convention**: Follows existing codebase pattern — port interfaces in `src/application/ports/` as individual files (e.g., `GrammarStorage.ts`, `TemplateEngine.ts`, `RandomSource.ts`), matching `StarSystemRepository.ts`, `RouteRepository.ts` pattern. No `I` prefix on interface names.

**No D1 migration in this phase**: The D1 storage adapter is included for completeness but grammars will initially be stored in KV. D1 migration SQL is prepared but not applied unless needed.

### Constants Placement

All limits and thresholds with their owning files:

| Constant                    | Value      | File                              | Scope                       |
| --------------------------- | ---------- | --------------------------------- | --------------------------- |
| `MAX_GRAMMAR_SOURCE_BYTES`  | 262,144    | `grammarParser.ts`                | Parse-time input guard      |
| `MAX_TEMPLATE_LENGTH`       | 10,000     | `grammarParser.ts`                | Parse-time per-rule guard   |
| `MAX_DEPTH`                 | 50         | `jinja2Engine.ts`                 | Template recursion limit    |
| `MAX_EVALUATIONS`           | 10,000     | `renderEngine.ts` (RenderContext) | Per-render work budget      |
| `MAX_INCLUDE_DEPTH`         | 20         | `renderStoryService.ts`           | Include chain depth limit   |
| `MAX_INCLUDE_COUNT`         | 50         | `renderStoryService.ts`           | Total resolved grammars     |
| `MAX_ACCESSOR_DEPTH`        | 10         | `jinja2Engine.ts`                 | Dot-access chain limit      |
| `MAX_CACHE_SIZE`            | 500        | `jinja2Engine.ts`                 | Template token cache (FIFO) |
| `MAX_KV_VALUE_BYTES`        | 24,000,000 | `kvStorage.ts`                    | KV put size guard           |
| `MAX_MARKOV_CORPUS_PRODUCT` | 100,000    | `grammarParser.ts`                | chars × order budget        |
| `MAX_MARKOV_ORDER`          | 10         | `grammarParser.ts`                | Markov order upper bound    |
| `MAX_DTO_CACHE_SIZE`        | 100        | `cachedStorage.ts`                | Grammar DTO cache (FIFO)    |
| `MAX_SEED_LENGTH`           | 256        | `renderStoryService.ts`           | Seed string length guard    |

### Validation Rules Placement

All regex patterns and reject-lists in `grammarParser.ts`:

| Validation                  | Pattern / Rule                                                                                                                                                                               | Error Type          |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| Grammar key format          | `/^[a-z][a-z0-9_-]*$/`                                                                                                                                                                       | `GrammarParseError` |
| Rule name format            | `/^[A-Za-z_][A-Za-z0-9_]*$/`                                                                                                                                                                 | `GrammarParseError` |
| Rule name reject-list       | `constructor`, `toString`, `valueOf`, `__proto__`, `hasOwnProperty`, `isPrototypeOf`, `propertyIsEnumerable`, `__defineGetter__`, `__defineSetter__`, `__lookupGetter__`, `__lookupSetter__` | `GrammarParseError` |
| Reserved rule names         | `include`, `render`                                                                                                                                                                          | `GrammarParseError` |
| Weight range                | finite number > 0                                                                                                                                                                            | `GrammarParseError` |
| MARKOV order range          | integer in [1, 10]                                                                                                                                                                           | `GrammarParseError` |
| MARKOV items no templates   | reject items containing `{` or `{{`                                                                                                                                                          | `GrammarParseError` |
| MARKOV non-empty corpus     | at least one non-empty item                                                                                                                                                                  | `GrammarParseError` |
| StructRule non-empty fields | at least one field                                                                                                                                                                           | `GrammarParseError` |
| Entry rule exists           | `entry` key in `rules` map                                                                                                                                                                   | `GrammarParseError` |
| Scoped seed separator       | Rule names must not contain `-` (hyphen)                                                                                                                                                     | `GrammarParseError` |

## Applied Learnings

No relevant solutions found in `.specify/solutions/` — solutions index is empty.

### Deepening Research (2026-03-24)

Verified plan assumptions against current codebase state:

1. **Mulberry32 PRNG** (`src/domain/galaxy/prng.ts`): Confirmed exact API match — `constructor(seed: number)`, `random(): number` [0,1), `randint(min, max): number` [min,max]. Implements `Prng` interface. No discrepancies.
2. **ServiceFactory** (`src/di/serviceFactory.ts`): Lazy singleton pattern confirmed — `private _field: T | null = null` + `??=` in getter. 13 existing singletons. Plan's proposed `renderStoryService` getter fits the pattern exactly.
3. **Env bindings** (`src/shared/env.ts`): Current bindings: `ASSETS`, `DB`, `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET`, `RATE_LIMIT`. No KV bindings exist yet — `GRAMMAR_KV` must be added (Layer 5, task 23).
4. **wrangler.toml**: No `[[kv_namespaces]]` section exists. Must add for `GRAMMAR_KV` (Layer 5, task 23).
5. **Port conventions** (`src/application/ports/`): 6 existing ports confirm pattern — PascalCase, no `I` prefix, one file per port, JSDoc on all methods. Proposed `GrammarStorage.ts`, `TemplateEngine.ts`, `RandomSource.ts` fit perfectly.
6. **yaml package**: Not in `package.json` (present in `node_modules/` v2.8.2 as transitive dep). `maxAliasCount` and `uniqueKeys` available since v2.0.0 (not 2.3.0/2.1 as originally stated — corrected above). Browser build via conditional exports ensures Workers compatibility.

### Deepening Research — Uncertainty Resolution (2026-03-24)

Resolved 13 uncertain sections identified by systematic scan:

1. **rngChoice placement**: Decided `markovChain.ts` (co-located with its only caller).
2. **Scoped seed separator**: Decided hyphen (`-`), NUL rejected (invisible in debug output).
3. **Storage logging**: Strengthened "should" → "MUST" for INFO-level mutation logging.
4. **Template length limit**: Strengthened "should" → "MUST" for parse-time enforcement.
5. **CachedStorage TTL batch determinism**: Remains deferred — Phase 1 is single-render only.
6. **StoragePort read/write split**: Decided single interface for Phase 1; split deferred to Phase 4+.
7. **Cross-render SHA-256 cache**: Remains deferred — no interface hooks needed until Phase 4.
8. **Include wall-clock budget**: Remains documentation-only mitigation — acceptable for Phase 1.
9. **D1 parameterized queries**: Strengthened from "code review" to test-as-primary-gate.
10. **Weighted selection float bias**: Decided last-item fallback approach; integer normalization rejected.
11. **GrammarDto version**: Clarified ownership in `dto.ts`, strengthened to a firm requirement.
12. **Grammar key namespace docs**: Specified JSDoc in `GrammarStorage.ts` as documentation target.
13. **yaml package status**: Resolved contradiction — present as transitive dep, MUST be added as direct dep.

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

`GRAMMAR_KV` MUST be a dedicated KV namespace, not shared with other application data. A misconfigured binding pointing at a shared namespace could silently overwrite unrelated KV entries. The DI wiring must enforce this via a dedicated binding name. All mutating operations (save, delete) MUST log at INFO level for operational traceability.

### Scoped Seed Separator Collision

`scopeSeed` concatenates as `"{baseSeed}-{scopeKey}"`. A rule named `"a-b"` produces the same scoped seed as rule `"a"` further scoped with `"b"`, breaking determinism isolation. **Mitigation**: Rule names MUST NOT contain the separator character (hyphen). Enforce at parse time in `grammarParser.ts` — reject rule names containing hyphens with `GrammarParseError`. **Decision**: Use hyphen (`-`) as the separator. NUL was considered but rejected: hyphen is visible in debug output and already validated against in rule names (see Validation Rules Placement table).

### YAML Anchor/Alias Bomb (Billion Laughs)

The `yaml` npm package processes anchors (`&name`) and aliases (`*name`) before schema validation. A malicious grammar file with nested aliases can trigger exponential expansion — a classic "billion laughs" attack — exhausting the Workers isolate's 128MB memory ceiling long before `schema: 'json'` type coercion checks run. Example: a grammar with 9 levels of aliased arrays, each alias referenced 9 times, expands to 9^9 ≈ 387 million entries. **Mitigation**: Enforce a `MAX_GRAMMAR_SOURCE_BYTES` limit before calling `yaml.parse()` — reject inputs larger than 256KB with `GrammarParseError("Grammar source exceeds maximum size")`. Additionally, configure `yaml.parse` with `{ maxAliasCount: 100 }` (supported by the `yaml` npm package since v2.0.0) to abort on excessive alias expansion. Add adversarial test cases: deeply nested anchors/aliases exceeding the alias limit, grammar source at the byte limit boundary, grammar source one byte over the limit.

### yaml Package Version Constraint

The billion-laughs mitigation depends on the `maxAliasCount` option, which is available in `yaml` package since v2.0.0 (the entire 2.x line). If a developer runs `npm install yaml` without a version constraint, npm may resolve to an older 1.x version (still published) that silently ignores the `maxAliasCount` option — leaving the billion-laughs mitigation completely ineffective while appearing to work. **Mitigation**: (1) The install command MUST specify `npm install yaml@^2.3.0` (pinned above 2.3.0 for stability, not because earlier 2.x lacks the option). (2) In `grammarParser.ts`, add a build-time or startup assertion that the installed `yaml` package exports the expected API shape (specifically that `parse` accepts an options object with `maxAliasCount`). (3) Pin the version range in `package.json` as `"yaml": "^2.3.0"` to prevent accidental downgrade to 1.x. Add a test case verifying that `yaml.parse` with `maxAliasCount: 1` throws on a YAML document with 2 alias references (confirms the option is actually enforced by the installed version).

### YAML Deserialization Safety

The `yaml` npm package may coerce values unexpectedly (YAML 1.1 `yes`/`no` → booleans, numeric keys → numbers, `null` values in lists). **Mitigation**: Use `yaml.parse(source, { schema: 'json' })` to prevent type coercions. In `grammarParser.ts`, explicitly type-check all values — reject non-string list items (including `null`, `undefined`, `boolean`, `number`) with `GrammarParseError`. Validate rule name keys match `[A-Za-z_][A-Za-z0-9_]*`.

### Grammar Source Size Limit

There is no `MAX_GRAMMAR_SOURCE_BYTES` guard before the `yaml.parse()` call. An unbounded input string — even a syntactically valid one with no anchors — can consume excessive CPU and memory during tokenization. The plan defines `MAX_TEMPLATE_LENGTH = 10,000` for individual rule templates but places no limit on the overall grammar YAML source, making it possible to submit a 100MB file with thousands of rules. **Mitigation**: In `grammarParser.ts`, check `source.length` (in UTF-16 code units, a conservative proxy for byte size) before calling `yaml.parse()`. Reject inputs exceeding `MAX_GRAMMAR_SOURCE_BYTES = 262_144` (256KB) with `GrammarParseError("Grammar source exceeds maximum size of 256KB")`. This limit is consistent with the YAML anchor/alias bomb mitigation above and must be enforced before any parsing begins. Add test cases: source at exactly 256KB (valid), source at 256KB + 1 byte (rejected).

### Seed Input Validation

`RenderStoryRequest.seed` is typed as `string` but `makeSeed` requires exactly 32 lowercase hex characters. **Decision**: The service accepts any non-empty string as a seed and hashes it directly via `seedToInt` — it does NOT require the 32-char hex format externally. `generateSeed()` produces that format for callers who want a canonical seed. Invalid/empty seed maps to a `{ ok: false, kind: 'invalid_seed' }` result variant.

### Template Tokenizer ReDoS Prevention

The custom tokenizer for `{{ expression }}` syntax MUST use iterative character-by-character scanning, not regex-based matching. Nested or malformed delimiters (e.g., `{{ {{ {{ }}`) could trigger catastrophic backtracking in regex engines. **Mitigation**: Implement the `jinja2Engine.ts` tokenizer as a single-pass state machine scanning character-by-character. Add adversarial test cases: deeply nested delimiters (`{{` × 1000), unclosed delimiters. Verify tokenizer completes in O(n) time for input length n.

### Error Message Information Leakage in Error Variants

`RenderStoryResult` error variants expose `moduleName`, `sourcePath`, and `message` fields containing internal grammar structure (rule names, include chains, validation details). If error results are surfaced directly in HTTP API responses, they leak internal content architecture to end users — module naming reveals the grammar catalog, and `sourcePath` values like `"system-descriptions.planetType"` reveal rule hierarchy. **Mitigation**: (1) `RenderStoryResult` error variants are internal to the application layer. (2) Presentation-layer handlers that expose render results via HTTP MUST map all `ok: false` variants to a generic user-facing error (e.g., `{ error: "Content generation failed" }`) and log the detailed error server-side at WARN level. (3) Document this contract in `RenderStoryService` JSDoc: "Error variants contain internal details intended for logging, not for end-user display." Add a test in the presentation layer verifying that no `moduleName`, `sourcePath`, or `message` from error variants appears in HTTP response bodies.

### Template Expression Accessor Chain Depth

The jinja2 expression grammar `identifier accessor*` places no limit on accessor chain length. While the 10,000-char template length limit indirectly bounds this, a pathological expression like `{{ a.b.c.d... }}` with 1,000+ dot accessors would create a large token array cached in the singleton Jinja2Engine. **Mitigation**: Add `MAX_ACCESSOR_DEPTH = 10` in the tokenizer. Throw `TemplateError("Accessor chain exceeds maximum depth")` when exceeded. StructRule nesting beyond 10 levels is not a realistic grammar pattern.

### Grammar Key Sanitization

Grammar keys are used directly as KV namespace keys. Rule names are validated with `[A-Za-z_][A-Za-z0-9_]*` but grammar keys have no equivalent validation. Keys containing path-like characters (e.g., `../admin/secrets`), `__proto__`, empty strings, or null bytes could behave unexpectedly. **Mitigation**: In `grammarParser.ts`, validate grammar keys match `[a-z][a-z0-9_-]*` (lowercase-only, hyphens allowed for keys like `system-descriptions`). This eliminates KV case-normalization divergence (see KV Key Case-Normalization Consistency below). Reject keys with path separators, null bytes, uppercase, or non-ASCII characters with `GrammarParseError`. Add test cases: `'../other'`, `''`, `'__proto__'`, `'SystemDesc'` (uppercase) as grammar keys.

### Prototype Pollution via Rule Names

Rule names are validated with `[A-Za-z_][A-Za-z0-9_]*`, but this pattern permits names such as `constructor`, `toString`, `valueOf`, and `__defineGetter__` — all of which are properties on `Object.prototype`. Grammar keys are excluded from this risk by their stricter `[A-Za-z][A-Za-z0-9_-]*` pattern (which excludes leading underscores), but rule names allow a leading underscore. If YAML-parsed grammar objects are iterated or accessed via plain object property lookups at any point before conversion to a `Map`, prototype-inherited properties could be inadvertently shadowed, producing undefined behavior or leaking runtime internals. **Mitigation**: (1) Add explicit reject-list validation in `grammarParser.ts` after the regex check: throw `GrammarParseError("Rule name '{name}' is a reserved JavaScript identifier")` for any name in `['constructor', 'toString', 'valueOf', '__defineGetter__', '__defineSetter__', '__lookupGetter__', '__lookupSetter__', '__proto__', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable']`. (2) Ensure that the parsed YAML object is accessed exclusively via `Object.entries()` or `Object.keys()` (never direct property access by name) before conversion to a `Map`. (3) Use `Map` (not plain objects) throughout the grammar domain model to eliminate prototype chain lookups. Add test cases: rule name `'constructor'` → `GrammarParseError`; rule name `'toString'` → `GrammarParseError`; rule name `'__proto__'` → `GrammarParseError`.

### Grammar Key Namespace Conventions

Grammar keys are global within the `GRAMMAR_KV` namespace. Multiple features or content domains storing grammars without a naming convention will collide silently (overwriting each other). **Decision**: Flat keys are acceptable for Phase 1 since there is only one content domain. Phase 4+ MUST adopt a prefix convention (e.g., `feature:grammar-name`) if multiple content domains share the namespace. Document this constraint in `GrammarStorage.ts` JSDoc: "Keys are global within the KV namespace. Phase 4+ multi-domain usage requires a prefix convention to prevent collisions."

### Seed Metadata Exposure in RenderStoryResult

`RenderedString` tracks `ruleName` and `seed` as metadata. If `RenderStoryResult` includes the full `RenderedString`, callers exposing results in API responses could leak the seed. For a deterministic system, leaking seed + grammar key allows anyone to reproduce the exact output. **Decision**: `RenderStoryResult.ok: true` exposes only the rendered `text: string`. Keep `RenderedString` as an internal value object within `RenderEngine`. This prevents accidental seed exposure and keeps the public API minimal.

### D1 Parameterized Queries Required

`D1Storage` MUST use D1's `prepare().bind()` API for all queries — never string interpolation or template literals for SQL construction. Grammar keys are developer-defined strings that could contain SQL metacharacters. **Mitigation**: (1) The `D1Storage` implementation MUST use `prepare().bind()` exclusively — no string interpolation or template literals in SQL. (2) Add a test case with a grammar key containing SQL injection payload (e.g., `"'; DROP TABLE grammars; --"`) verifying it is stored and retrieved correctly without side effects. The test is the primary enforcement gate; code review is a secondary check.

### KV Key Case-Normalization Consistency

The design spec (`09-storage-adapters.md`) specifies that `KVStorage` normalizes module names to lowercase for KV key construction (`grammar:{moduleName}`). The plan validates grammar keys with `[A-Za-z][A-Za-z0-9_-]*` (allowing uppercase), but if KV normalizes at write time, a grammar keyed as `"SystemDescriptions"` would be retrievable only as `"systemdescriptions"`. `InMemoryStorage` uses a `Map` (case-sensitive), creating behavioral divergence: tests pass with mixed-case keys in memory but production silently lowercases. **Mitigation**: Enforce lowercase-only grammar keys via `[a-z][a-z0-9_-]*` validation in `grammarParser.ts`, eliminating the need for runtime normalization. Update `contracts/storage-port.md` to document that all keys are lowercase. Add test: mixed-case key `"SystemDesc"` → `GrammarParseError`.

### userVar Value Template Injection

The existing edge case "userVars Name Collision With Grammar Rules" addresses userVar KEY conflicts, but does not specify whether userVar VALUES are recursively rendered through the template engine. If `RenderEngine` passes userVar values directly into the template context and the template engine recursively evaluates them, a caller supplying `userVars: { title: "{secretRule}" }` can force the engine to render any rule in the grammar — including rules the caller is not expected to access — and receive the output. This is an information-disclosure risk and an uncontrolled computation vector (a single userVar value could trigger the full evaluation budget). **Mitigation**: userVar values MUST be treated as opaque plain strings by the template engine. They are substituted literally without recursive evaluation. Enforce this in `RenderEngine`: when a template expression resolves to a userVar value, return the raw string without calling `evaluate()` or `renderRule()` on it. Document this explicitly in grammar authoring docs: "userVar values are plain text substitutions, not templates." Add test cases: `userVars: { adjective: "{color}" }` used in a template `{adjective} ship` — verify the output is literally `{color} ship`, not the result of rendering the `color` rule.

### Jinja2 Dot-Access Prototype Property Leak

The jinja2 subset supports `{{ object.property }}` dot-access expressions. If context values are plain JavaScript objects, expressions like `{{ obj.constructor }}`, `{{ obj.__proto__ }}`, or `{{ obj.toString }}` resolve to inherited prototype properties via normal JS property lookup, potentially leaking internal runtime details (function source text, constructor names) into rendered output. Context objects in this engine are `Record<string, string>` (flat string maps), which limits exposure — but `toString` and `valueOf` are still reachable. **Mitigation**: In `jinja2Engine.ts`, resolve dot-access properties exclusively via `Object.hasOwn(target, prop)` — never via direct bracket notation. If `Object.hasOwn` returns false, treat the property access as undefined and throw `TemplateError("Property '{prop}' not found on context object")` rather than returning `"[object Object]"` or a function reference. Add test cases: `{{ ctx.constructor }}` → `TemplateError`; `{{ ctx.toString }}` → `TemplateError`; `{{ ctx.__proto__ }}` → `TemplateError`.

## Edge Cases & Error Handling

### Design Spec vs Plan Contract Divergence

The design specs in `docs/spec/systems/prestoplot/02-ports-and-adapters.md` and the plan contracts in `specs/016-prestoplot-core/contracts/` use different interface signatures. These are intentional refinements — the plan contracts are canonical for implementation:

| Port           | Design Spec                                              | Plan Contract (Canonical)                                                |
| -------------- | -------------------------------------------------------- | ------------------------------------------------------------------------ |
| StoragePort    | `resolveModule(name): Promise<Grammar>`, `listModules()` | `load(key): Promise<GrammarDto \| null>`, `save()`, `delete()`, `keys()` |
| TemplateEngine | `render(template, sourcePath, context): RenderedString`  | `evaluate(template, context, depth): string` (jinja2 only)               |
| RandomPort     | `getRng(seed)` with rich `Rng` (random, randint, choice) | `seedToInt(seed): Promise<number>`, `createRng(seed): Rng` (next only)   |

**Key design decisions behind divergence**:

- **StoragePort** returns `GrammarDto | null` (not `Grammar`) — keeps infrastructure layer unaware of domain types. Null return for missing keys (not exception) follows the existing codebase pattern.
- **TemplateEnginePort** takes a flat `Record<string, string>` context (not `RenderContext`) — keeps the jinja2 engine decoupled from domain state. `depth` is passed explicitly for recursion tracking. Returns `string` (not `RenderedString`) — article accessor resolution is handled in `RenderEngine`, not the template engine. Single implementation (Jinja2Engine) — ftemplate syntax dropped for simplicity.
- **RandomPort** splits into `seedToInt` (async SHA-256) + `createRng` (sync construction) — cleaner separation of async and sync concerns. `Rng.next()` is minimal; `randint` and `choice` are utility functions in `selectionModes.ts`.

**Action**: The design specs are reference documents for the original Prestoplot design. Where they conflict with plan contracts, the plan contracts govern implementation. Do not update the design specs — they serve as historical context.

### UTF-16 Surrogate Pair Corruption in Template Tokenizers

The ReDoS prevention mandate requires character-by-character scanning via `str[i]` or `str.charAt(i)`. In JavaScript, these return individual UTF-16 code units, not Unicode code points. Characters outside the Basic Multilingual Plane (U+10000+) — including emoji, some CJK ideographs, and mathematical symbols — are encoded as surrogate pairs (two 16-bit code units). A tokenizer scanning `str[i]` will see two separate code units for a single astral character. More critically, splitting surrogate pairs produces lone surrogates in output strings, which are invalid UTF-16 and render as replacement characters (U+FFFD) or cause encoding errors. **Mitigation**: The tokenizer in `jinja2Engine.ts` MUST iterate using `for...of` (which yields code points, not code units) or use `String.prototype.codePointAt()` with proper index advancement. The delimiter characters (`{`, `}`, `#`) are all BMP ASCII — surrogate code units will never match them — but output slicing must respect code point boundaries to avoid corrupting non-BMP content. Add test cases: template containing emoji (e.g., `"The {{ animal }} says 🚀"`) and astral math symbols (e.g., `"Score: 𝟙𝟘𝟘"`) — verify output preserves characters intact without replacement characters.

### MARKOV Empty Corpus Validation

A `ListRule` with `selectionMode: MARKOV` and an empty `items[]` array (or items that are all empty strings) trains the Markov model on nothing — producing a model with only start sentinels and no transitions. `generateMarkov` immediately hits a dead-end on the first step. While `MarkovDeadEndError` catches this at render time, the error message ("no transitions from start key") is confusing for grammar authors — the real problem is an empty corpus, not a Markov modeling issue. **Mitigation**: In `grammarParser.ts`, validate that MARKOV rules have at least one non-empty item. Throw `GrammarParseError("MARKOV rule '{name}' requires at least one non-empty training item")` at parse time. This catches the authoring error early with an actionable message. Add test cases: MARKOV with `items: []` → `GrammarParseError`; MARKOV with `items: [""]` → `GrammarParseError`.

### MARKOV Dead-Ends

MARKOV generation with `order > training-item-length` produces dead-end states where no transition exists from the start key. Dead-ends surface as `template_error` in `RenderStoryResult` with no automatic retry. **Guidance for grammar authors**: Ensure Markov training corpus items are longer than the configured order. Add test cases covering MARKOV with `order > training-item-length` to verify `MarkovDeadEndError` propagation.

**Implementation note**: `MarkovDeadEndError` is thrown from the domain layer (`markovChain.ts`) during `renderRule()` execution. It is NOT a `TemplateError` and will not be caught by the `TemplateError` catch block in `RenderStoryService.render()`. `RenderStoryService.render()` MUST include an explicit catch for `MarkovDeadEndError` and map it to `{ ok: false, kind: 'template_error', sourcePath: '{moduleName}.{ruleName}', message: e.message }`. The catch order matters: `MarkovDeadEndError` must be checked before the generic `Error` fallback. Add a test in `renderStoryService.spec.ts` where a Markov rule has a corpus of one single-character item (`["a"]` with `order: 2`), verify the result is `{ ok: false, kind: 'template_error' }` rather than an unhandled exception.

### MARKOV Items With Template Syntax

A ListRule with `selectionMode: MARKOV` trains its Markov model on `items[]`. If items contain template expressions (e.g., `{adjective} ship`), the training corpus includes un-rendered template syntax. The Markov model trains on literal text like `{adjective}`, producing nonsense output with partial `{` sequences. **Mitigation**: MARKOV training items are treated as PLAIN strings — they are NOT rendered through the template engine before training. Enforce at parse time by rejecting MARKOV list items containing `{` or `{{` with `GrammarParseError('MARKOV rule items must be plain strings, not templates')`. Add a test case verifying this validation.

### MARKOV Deterministic Identity

A MARKOV rule produces **one deterministic value per (seed, ruleName) pair** per render pass. Multiple references to the same MARKOV rule within one template return identical text (the Rng is initialized from the same scoped seed). This is by design — if varied output per reference is needed, authors must use distinct rule names. Document prominently as this is counterintuitive.

### RenderEngine Transience

`RenderEngine` is constructed fresh inside each `render()` call; it MUST NOT be a field on `RenderStoryService`. The service itself is a DI singleton, but it creates a new engine per invocation. `RenderContext` is single-use — once a render call completes (success or failure), the context is discarded. Callers must not retry by calling `renderRule` again on the same engine after an error.

### Include Resolution: Cycles vs. Diamonds

Circular include detection requires tracking the **current resolution path** (a stack), not just a global visited set. A `Set<string>` visited set is used for **deduplication** (prevents redundant loads of the same grammar via different paths — diamond includes). True cycle detection pushes on entry, pops on exit. An already-visited module reached via a different path is silently skipped (correct behavior), not flagged as circular.

### LIST Mode Out-of-Bounds

Accessing an out-of-bounds index via `{{ Name[N] }}` in template expressions MUST throw `TemplateError` with message `"Index N out of range for list 'Name' (length M)"`. The `Datalist.get()` method returns `undefined` for out-of-range, but the template engine converts this to an actionable error. Add test cases in `jinja2Engine.spec.ts`.

### crypto.subtle Failure

`crypto.subtle.digest` failure (resource-constrained isolate, invalid buffer) is currently unhandled. **Mitigation**: Add `{ ok: false, kind: 'seed_error', message: string }` to `RenderStoryResult`. Wrap all `seedToInt` calls in try/catch inside `RenderEngine` and map failures to this variant. The service's "never throws" contract must hold.

### GrammarDto Deserialization

`grammarFromDto` must include runtime type guards for `kind` on each rule DTO. Unrecognized kinds (e.g., from forward-version content in D1) must throw `StorageError`, not produce `undefined`. Add test: `{ kind: 'unknown' }` → `StorageError`.

### Article Generation Non-ASCII Limitation

Accented vowels (é, è, â, ô, etc.) are treated as consonants → return "a". This is a known limitation acceptable for English-language game content. Grammar authors should avoid leading non-ASCII characters in rule outputs used with article accessors. Add an explicit test verifying fallback behavior for words like "élan".

### WeightedAlternative Zero/Negative Weight

`WeightedAlternative.weight` is documented as "Positive number, default 1" but without parse-time validation, a grammar with `weight: 0` causes division-by-zero in weighted random selection (total weight sums to zero), and `weight: -1` corrupts cumulative probability distributions, producing undefined selection behavior. **Mitigation**: In `grammarParser.ts`, validate that every `weight` is a finite number > 0. Reject with `GrammarParseError("Rule '{name}': weight must be a positive number, got {value}")`. Add test cases: `weight: 0`, `weight: -1`, `weight: NaN`, `weight: Infinity`, `weight: "not a number"`.

### Entry Rule Validation

No validation ensures `Grammar.entry` refers to an existing rule in `Grammar.rules`. A grammar with `entry: "nonexistent"` passes parsing but fails at render time with an unclear `RuleNotFoundError`. **Mitigation**: In `grammarParser.ts`, after building the rules map, verify that `entry` is a key in `rules`. Throw `GrammarParseError("Entry rule '{entry}' not found in grammar rules")` at parse time. This catches authoring errors early.

### StructRule Field Dangling References

StructRule fields map field names to rule names (e.g., `fields: { name: 'planetName' }`). The plan validates `entry` references at parse time, but there is no equivalent validation for StructRule field values. A struct with a dangling field reference fails at render time with an unclear `RuleNotFoundError` rather than a clear `GrammarParseError`. Additionally, struct field references can point to rules provided by includes — which are only known after include resolution. **Mitigation**: Add a post-include-resolution validation pass in `renderStoryService.ts`: after all includes are merged into the final rule set, verify that every StructRule field value is a valid rule name in the merged grammar. Surface missing references as `{ ok: false, kind: 'parse_error' }`. Add test case: StructRule referencing a rule that only exists in an included grammar (valid), and one referencing a non-existent rule (error).

### Include Rule Name Conflicts Between Included Grammars

The plan specifies that included grammars' rules do not override the parent's same-named rules, but does not define behavior when two _included_ grammars (neither the parent) define the same rule name. **Resolution**: Apply left-to-right precedence matching the breadth-first include order. If grammar A includes [B, C] and both B and C define rule "color", B's definition wins because it appears first in the includes array. Document this precedence rule in the grammar format specification. Add test case: two includes with conflicting rule names, verify left-to-right precedence.

### Include Resolution Partial Failure

The plan covers circular includes and depth/fan-out limits, but does not specify behavior when one included grammar fails to load (storage error, not-found, or parse error in the included grammar itself). The parallel batch load via `Promise.all` rejects on the first failure, losing resolution results for any grammars already successfully loaded in the same batch. The entire render fails, but the error kind is ambiguous — a KV network error (storage_error), a missing include (module_not_found), and a corrupt include (parse_error) all surface as undifferentiated `Promise.all` rejections. **Mitigation**: (1) Map `storage.load()` returning `null` for an included grammar key to `{ ok: false, kind: 'module_not_found', moduleName: key }`. (2) Wrap each per-grammar load+parse in an individual try/catch inside the include resolver before `Promise.all`. Collect errors per grammar key and surface the first error with its specific kind, not a generic `Error`. (3) Do NOT partially apply successfully loaded includes when any include in the batch fails — treat the include resolution as an atomic all-or-nothing step. Add test cases: one valid include and one missing include → `module_not_found`; one valid include and one grammar with a parse error → `parse_error` with the included grammar's module name; two missing includes → only the first (left-to-right) error is reported.

### CachedStorage TTL Determinism Within Request Batches

`CachedStorage` is a DI singleton with TTL-based cache expiry. If TTL expires during a request that renders multiple grammars in sequence, earlier renders use cached grammar version X while later renders fetch fresh version Y from KV. This breaks within-request determinism for systems rendering multiple descriptions in one handler. **Mitigation**: Document that `CachedStorage` is acceptable for single-render requests. For batch rendering (multiple grammars per request), callers should pre-warm all needed grammars before rendering begins, or use a request-scoped cache snapshot. Implementation deferred — not needed for Phase 1 single-render use case, but note the constraint for Phase 4 game turn integration.

### RenderContext Evaluation Counter

The plan describes `MAX_EVALUATIONS = 10_000` but `RenderContext` in the data model tracks only `recursionDepth`. Add `evaluationCount: number` to `RenderContext`, initialized to 0. Increment on every `renderRule` call. The evaluation counter is the primary defense against exponential-time grammar expansion (branching mutual recursion), while recursion depth guards against stack overflow in linear chains. Both limits must be enforced independently.

### Mulberry32 Seed-Zero and NaN Collapse

SHA-256 first-4-bytes can legitimately produce 0, and corrupted ArrayBuffer data could yield NaN from DataView.getUint32. Both collapse to seed 0 via the `| 0` coercion in Mulberry32's constructor. **Mitigation**: In `seedToInt`, validate that `DataView.getUint32` returns a finite number; if not, throw rather than silently using 0. Add a test case verifying behavior with a seed string whose SHA-256 starts with four zero bytes (construct one via brute force or mock). Document that seed 0 is valid but has known correlation with seed 0x6d2b79f5 in early sequence positions — acceptable for game text but worth noting.

### Fisher-Yates Modulo Bias in randint

Mulberry32's `randint(min, max)` uses `Math.floor(random() * range)` which has inherent modulo bias: the 2^32 possible PRNG outputs do not divide evenly into arbitrary ranges. For PICK mode Fisher-Yates shuffles, this produces slightly non-uniform permutation probabilities. The bias magnitude is approximately `range / 2^32` — negligible for game text generation (< 100 items per list). **Decision**: Accept this bias. Document as a known limitation. If a future use case requires cryptographic-quality shuffling, `randint` must be replaced with rejection sampling.

### GrammarDto Schema Version

`GrammarDto` stored in KV/D1 has no version discriminator. While grammar versioning is out of scope for this phase, adding a `version: 1` field to `GrammarDto` now costs nothing and prevents a painful heuristic-based migration later. **Decision**: Add `readonly version: 1` to the `GrammarDto` interface in `src/application/prestoplot/dto.ts`. In `grammarFromDto`, validate that `version === 1` and throw `StorageError("Unsupported grammar version: {N}")` for unrecognized versions. `grammarToDto` MUST set `version: 1` on all serialized DTOs. This is a forward-compatibility requirement — the field is required and only one value is accepted in Phase 1.

### Jinja2 Comment Syntax Silent Content Suppression

The jinja2 subset supports `{# comment #}` (rendered as empty string). A grammar author writing literal `{#` (e.g., "Room {#42}") will have content silently swallowed between `{#` and the next `#}`, or get an unclosed-comment error if no `#}` exists. **Mitigation**: (1) Unclosed `{#` without matching `#}` MUST throw `TemplateError("Unclosed comment")`. (2) Document the comment syntax prominently in grammar authoring docs. (3) Add test cases: unclosed comment, comment containing braces, comment at end of template.

### KV List Pagination

Cloudflare KV `list()` returns at most 1,000 keys per call with cursor-based pagination. `KVStorage.listModules()` must handle pagination to avoid silently truncating results. **Mitigation**: Implement cursor-following loop in `listModules()`: repeat `kv.list({ prefix, cursor })` while `list_complete === false`. Even though current scale is dozens of grammars, the implementation MUST be correct for the documented KV API contract. Add test case with mock KV returning paginated results.

### RATCHET Counter Shared State Across Template References

RATCHET mode maintains a single call counter per rule name in `RenderContext.selectionState`. If a template references the same RATCHET rule from two different positions (e.g., `{Color} hat and {Color} boots`), the second reference sees counter=1 (next item), not counter=0 (same item). This is correct stateful behavior but counterintuitive — authors expecting the same color twice must use REUSE mode instead. **Mitigation**: Document this behavior explicitly in grammar authoring docs and add a test case demonstrating two references to the same RATCHET rule producing different items within one render pass.

### GrammarParseError Result Mapping

`RenderStoryResult` has no `parse_error` variant. `GrammarParseError` thrown by `GrammarParser.parse()` would escape the "never throws" contract if not caught and mapped. **Mitigation**: Add `| { readonly ok: false; readonly kind: 'parse_error'; readonly moduleName: string; readonly message: string }` to `RenderStoryResult`. Map `GrammarParseError` to this variant in `RenderStoryService.render()`. This ensures grammar validation failures surface as typed results, not uncaught exceptions.

### RenderStoryResult Type Must Include All Error Variants

The plan references `seed_error` (crypto.subtle failure) and implies `render_budget` (evaluation counter exceeded) but neither appears in the `RenderStoryResult` type definition from the spec. **Mitigation**: The implementation MUST extend `RenderStoryResult` with:

- `| { readonly ok: false; readonly kind: 'seed_error'; readonly message: string }`
- `| { readonly ok: false; readonly kind: 'render_budget'; readonly evaluationCount: number }`
- `| { readonly ok: false; readonly kind: 'parse_error'; readonly moduleName: string; readonly message: string }`
- `| { readonly ok: false; readonly kind: 'storage_error'; readonly moduleName: string; readonly message: string }`
- `| { readonly ok: false; readonly kind: 'include_depth'; readonly moduleName: string; readonly depth: number }`
- `| { readonly ok: false; readonly kind: 'include_limit'; readonly count: number }`

Domain error types in `errors.ts` MUST include: `IncludeDepthError` (thrown when include chain exceeds `MAX_INCLUDE_DEPTH = 20`), `IncludeLimitError` (thrown when total resolved grammars exceed `MAX_INCLUDE_COUNT = 50`), and `RenderBudgetError` (thrown when `evaluationCount` exceeds `MAX_EVALUATIONS = 10_000`). All are caught and mapped in `RenderStoryService.render()`.

All error types — including `StorageError` from `storage.load()` / `storage.save()` failures (KV network errors, D1 connection failures) — must be caught and mapped in `RenderStoryService.render()` to maintain the "never throws" contract. Add test cases: mock storage that throws on `load()`, verify result is `{ ok: false, kind: 'storage_error' }`.

### Single-Alternative TextRule Weight Warning

A `TextRule` with exactly one `WeightedAlternative` always selects that alternative regardless of weight. A non-default weight on a single alternative is likely an authoring mistake (e.g., the author intended multiple alternatives but only wrote one). **Mitigation**: In `grammarParser.ts`, emit a parse-time warning (not error) when a TextRule has exactly one alternative with `weight != 1`. Log at WARN level via the service logger. This catches common authoring mistakes without blocking valid grammars.

### StructRule Field Rendering Independence

StructRule fields are rendered lazily on access in template expressions. Each field access MUST create its own scoped seed: `scopeSeed(baseSeed, "{structName}-{fieldName}")`. Fields must NOT share a single Rng instance — otherwise the order of field access in the template would affect output, breaking determinism when two templates access the same struct's fields in different orders. Add test case: two templates accessing the same struct fields in different orders, verify identical per-field output.

### PICK State Key Scope for Struct Field Access

`RenderContext.selectionState.pickState` uses rule names as keys. When a ListRule named `"speed"` is accessed directly as `{speed}` and also indirectly via `{Stats.speed}` (which resolves the struct field referencing the `"speed"` rule), both access paths share the same PICK state entry `pickState["speed"]`. However, the scoped seed used for PICK epoch initialization differs: direct access uses `"{baseSeed}-speed-pick-epoch-0"` while struct-mediated access uses `"{Stats-scoped-seed}-speed-pick-epoch-0"`. **Resolution**: PICK state key MUST include the scoped seed prefix to avoid cross-scope state sharing. Key PICK state by `"{scopedSeed}-{ruleName}-pick"` instead of just `"{ruleName}"`. This guarantees that direct and struct-scoped accesses maintain independent depletion pools. Add a test: a PICK rule accessed both directly and via a struct field within the same template — verify each access path depletes independently.

### userVars Name Collision With Grammar Rules

`RenderStoryRequest.userVars` keys are resolved before grammar rule names in template expressions. A userVar with the same name as a grammar rule silently shadows the rule, and since userVar values are plain strings (not recursively rendered), any template expressions in the rule's alternatives are never evaluated. This is correct per spec (userVars take priority) but is a common authoring mistake. **Mitigation**: In `RenderStoryService.render()`, after loading and merging the grammar, validate that no `userVars` key matches an existing rule name in the merged grammar. If a collision is detected, return `{ ok: false, kind: 'template_error', sourcePath: '(request)', message: "userVar '{key}' conflicts with grammar rule of the same name" }`. Add test cases: userVar matching a rule name → collision error; userVar with a unique name → injected correctly.

### Reserved Grammar Key Rejection

The grammar file format reserves `include` and `render` as top-level keys. A grammar YAML that defines a rule named `"include"` or `"render"` must be rejected at parse time. Since `include` and `render` match the allowed identifier pattern `[A-Za-z_][A-Za-z0-9_]*`, the parser would silently misinterpret them without explicit validation. **Mitigation**: In `grammarParser.ts`, after collecting all top-level YAML keys, validate that no rule name is `"include"` or `"render"` (case-sensitive). Throw `GrammarParseError("Rule name '{name}' is reserved and cannot be used as a rule name")`. Add test cases: YAML with `include:` and `render:` as rule names → `GrammarParseError`.

### Markov maxLength Validation

`generateMarkov(model, rng, maxLength)` with `maxLength <= 0` silently returns an empty string without entering the generation loop. This is not a `MarkovDeadEndError` — it's a silent contract violation. **Mitigation**: In `generateMarkov`, validate `maxLength >= 1` and throw `RangeError("maxLength must be >= 1, got {maxLength}")` if violated. Also validate `maxLength` is a finite integer. Add test cases: `maxLength: 0` → `RangeError`; `maxLength: -5` → `RangeError`; `maxLength: NaN` → `RangeError`.

## Performance Considerations

### CachedStorage Required for KV

The DI wiring MUST use `CachedStorage` wrapping `KVStorage` by default — not just for D1. A grammar with 5 transitive includes triggers 5+ KV reads per render. KV cold reads are ~10-40ms each; without caching, a 5-level include chain adds 50-200ms, exceeding the 50ms performance goal. Update `serviceFactory.ts`:

```typescript
get renderStoryService(): RenderStoryService {
  this._renderStoryService ??= new RenderStoryService(
    new CachedStorage(new KVStorage(this.env.GRAMMAR_KV), { ttlMs: 60_000 }),
    new Jinja2Engine(),
    new Mulberry32Random()
  );
  return this._renderStoryService;
}
```

### Render Budget (Evaluation Counter)

The recursion depth limit (MAX_DEPTH = 50) prevents stack overflow for linear chains but not exponential time for branching mutual recursion. A rule rendering `"{B} and {B}"` where B renders `"{C} and {C}"` produces 2^N evaluations before depth N is reached. **Mitigation**: Add `MAX_EVALUATIONS = 10_000` to `RenderContext`. Increment on every `renderRule` call. Throw `RenderBudgetError` when exceeded. This is distinct from recursion depth — it bounds total work regardless of tree shape.

### Template Depth vs. Render Depth Interaction

The plan defines `MAX_DEPTH = 50` (template recursion, per jinja2 engine) and `MAX_EVALUATIONS = 10_000` (rule evaluation counter, in RenderContext). These are two independent depth counters that interact when templates invoke rule references: `renderEngine.renderRule()` → `jinja2Engine.evaluate()` → `{{ ruleName }}` → `renderEngine.renderRule()`. If tracked independently, the effective maximum depth could be `50 × 50 = 2,500` nested calls. **Clarification**: Template engine `depth` tracks recursive template evaluation calls within one `evaluate()` invocation. RenderEngine recursion depth tracks `renderRule` call depth. The evaluation counter (`MAX_EVALUATIONS`) is the unified budget that bounds total work regardless of which counter fires first. Add a test demonstrating that a `renderRule → evaluate → {{ rule ref }} → renderRule → evaluate` chain correctly increments both counters.

### Template String Length Limit

Template strings exceeding `MAX_TEMPLATE_LENGTH = 10_000` characters MUST throw `GrammarParseError` at parse time. This prevents oversized cache entries in the singleton `Jinja2Engine` template cache and bounds tokenizer runtime.

### Template Cache Bounds

`Jinja2Engine` caches tokenized templates in a `Map<string, Jinja2Token[]>` on the singleton instance. Growth is bounded by the total number of distinct rule templates across all grammars (finite for a finite grammar set). Document this invariant. **Decision**: Implement `MAX_CACHE_SIZE = 500` with FIFO eviction from Phase 1 (consistent with Template Cache Eviction section below).

### Markov Training Corpus Limits

`trainMarkovChain` with large corpus and high order can exceed Workers' 50ms synchronous CPU budget. **Mitigation**: Validate that `totalCorpusChars × order` does not exceed 100,000. Throw `RangeError` if exceeded. Recommended corpus: < 1,000 total characters × order for Workers runtime.

### Markov Model Per-Render Training Cost

`RenderContext` holds `markovCache: Map<string, MarkovChainModel>` scoped to a single render pass. Markov training on the same corpus is deterministic and grammar-static — the model does not change between requests. Re-training on every render call wastes CPU. **Decision**: Accept per-render training cost for Phase 1. The Markov training corpus limit (< 1,000 chars × order, bounded to 100,000 char×order product) makes training fast enough (~0.1ms). Cross-request caching would require coupling the cache to grammar version, adding complexity. If profiling shows Markov training as a hotspot in Phase 4 batch rendering, add a grammar-keyed singleton cache at that time.

### Include Depth Limit

Separate from template recursion depth. A deep acyclic include chain (200 levels) triggers 200 sequential KV reads. **Mitigation**: Add `MAX_INCLUDE_DEPTH = 20`. Throw `IncludeDepthError` when exceeded. This is distinct from circular detection — it bounds operational latency.

### Include Fan-Out Limit

`MAX_INCLUDE_DEPTH = 20` bounds vertical depth but not horizontal breadth. A grammar including 100 other grammars at depth 1 triggers 100 KV reads, far exceeding the 50ms budget even with caching cold starts. **Mitigation**: Add `MAX_INCLUDE_COUNT = 50` bounding the total number of unique grammars resolved (including transitive includes) per render pass. Throw `IncludeLimitError` when exceeded. Track count in the include resolver alongside the visited set.

### Parallel Include Resolution

Include resolution is breadth-first but currently implied as sequential — each grammar loaded one at a time from storage. At each depth level, all grammars at that level are independent and can be loaded concurrently via `Promise.all`. **Optimization**: In the include resolver, batch-load all grammars at the same depth level using `Promise.all(keys.map(k => storage.get(k)))`. This reduces latency from O(totalIncludes × kvLatency) to O(maxDepth × kvLatency). Important for grammars with wide include trees.

### Seed Cache Memory

`RenderContext.seedIntCache` is bounded by unique scoped seeds per render pass: at most O(rules × depth). For grammars within documented scale (hundreds of rules, MAX_DEPTH 50), this is ~5,000 entries (~300KB). The cache is GC'd after each render call. This is a known tradeoff vs. redundant SHA-256 calls.

### KV Eventual Consistency on Grammar Updates

Cloudflare KV is eventually consistent — writes may take up to 60 seconds to propagate across edge locations. Combined with `CachedStorage` TTL (default 60s), the total staleness window after a grammar update is up to 120 seconds. During this window, renders at different edge locations may use different grammar versions, breaking cross-request determinism for the same seed. **Mitigation**: Document this as a known operational constraint. For development iteration, authors should use `InMemoryStorage` (instant consistency). For production grammar updates, recommend a "deploy and wait" window of 2× TTL before relying on new grammar content. This is inherent to KV and cannot be fixed at the application layer.

### CachedStorage Design: In-Memory vs KV Cache

The spec (09-storage-adapters.md) defines `CachedStorage` as using a secondary KV namespace for cross-request persistence: `constructor(backing, cache: KVNamespace, ttlSeconds)`. The plan's DI wiring uses `new CachedStorage(new KVStorage(...), { ttlMs: 60_000 })` suggesting an in-memory Map cache. These are different designs with different behavior. **Decision**: Use in-memory `Map<string, { dto: GrammarDto; expiresAt: number }>` for Phase 1. The primary storage is already KV — caching KV reads in another KV namespace adds latency and complexity. Update the DI wiring to match the chosen design and update or override the spec.

### CachedStorage Concurrent Miss (Thundering Herd)

Cloudflare Workers handle concurrent requests via the event loop (single-threaded but cooperative at `await` points). Two concurrent render calls for the same uncached grammar will both observe a cache miss, both call `backing.load()`, and both write to the in-memory Map on resolution. This is benign for correctness (last write wins, both values are identical) but wastes a backing store call. **Decision**: Accept duplicate backing store calls for Phase 1 — the waste is bounded to one extra KV/D1 read per concurrent miss. If profiling shows this as a hotspot, implement a `pending: Map<string, Promise<GrammarDto | null>>` to coalesce concurrent misses: store the in-flight promise before the first `await`, subsequent misses for the same key return the same promise.

### GrammarDto KV Value Size Limit

Cloudflare KV values are limited to 25MB. A grammar with thousands of rules, each containing long weighted alternatives or large Markov training corpora, could produce a JSON-serialized `GrammarDto` approaching this limit. `kv.put()` with an oversized value throws a runtime error that would escape the "never throws" contract if uncaught. **Mitigation**: In `kvStorage.ts`, validate `JSON.stringify(dto).length < MAX_KV_VALUE_BYTES` (set to `24_000_000` — 24MB, leaving headroom for KV metadata) before calling `kv.put()`. Throw `StorageError("Grammar exceeds maximum storage size")` if exceeded. This is a defensive guard — at documented scale (hundreds of rules per grammar), typical DTOs are well under 1MB. Add a test verifying the size check triggers for an oversized DTO.

### Template Cache Eviction

`Jinja2Engine` caches tokenized templates on the DI singleton instance. When grammars are updated and `CachedStorage` TTL expires, old tokenized templates remain in the cache indefinitely. Since the cache is keyed by template string content and tokens are deterministic, stale entries are harmless for correctness — only a memory issue. **Decision**: Implement `MAX_CACHE_SIZE = 500` with FIFO eviction from Phase 1. Workers isolate lifetimes are bounded (minutes to hours), making unbounded growth tolerable at current scale, but the eviction guard is cheap insurance. Add a test verifying that the cache evicts the oldest entry when the limit is reached.

### Deterministic Oracle Seed Recovery

The system is fully deterministic: given the same grammar and seed, output is identical. An attacker who obtains the grammar file (e.g., from a public repo or leaked deployment artifact) can brute-force seeds by rendering the grammar with candidate seeds and comparing output to observed game text. For SHA-256-based seeds, the search space is 2^32 (Mulberry32 seed width) — exhaustible in seconds on commodity hardware. **Risk assessment**: Low for Phase 1 — grammars are developer-authored, seeds are internal, and game text prediction has limited exploit value. **Decision**: Accept this risk. Document as a known property of the deterministic design. If future phases expose seed-sensitive content (e.g., hidden locations, loot tables), consider: (1) adding a server-side secret salt to `scopeSeed` derivation so grammar+output alone is insufficient for seed recovery, or (2) using a wider PRNG state (64-bit or higher).

## Red Team Findings

_Added by adversarial review (sp:04-red-team, 2026-03-24)._

### Template Engine Dispatch Strategy — RESOLVED

~~The plan originally defined two template engines (FtemplateEngine and Jinja2Engine), creating dispatch ambiguity.~~ **Resolution**: Simplified to a single jinja2 engine. All template expressions use `{{ expr }}` syntax exclusively. FtemplateEngine (`{expr}`) has been removed from the plan. This eliminates the entire class of dispatch, mixed-syntax, and delimiter ambiguity issues.

### MARKOV `order` Parameter Parse-Time Validation (Medium — EdgeCase)

The plan validates MARKOV empty corpus, items with template syntax, and corpus size limits, but does not validate the `order` parameter at parse time. `order: 0` creates zero-length ngrams (every character maps to every other character — near-random output). `order: -1` creates negative-length string slices producing empty ngrams. `order: 1.5` is non-integer, causing inconsistent ngram lengths. `order: 100` on a 10-character corpus creates no transitions (dead end).

**Mitigation**: In `grammarParser.ts`, validate MARKOV `order` is a finite integer in range `[1, 10]`. Throw `GrammarParseError("MARKOV rule '{name}': order must be an integer between 1 and 10, got {value}")`. Upper bound of 10 is generous — character-level Markov chains with order > 5 reproduce training data verbatim. Add test cases: `order: 0`, `order: -1`, `order: 1.5`, `order: 11`, `order: "three"` → `GrammarParseError`.

### WeightedAlternative Floating-Point Cumulative Selection (Medium — EdgeCase)

Weighted random selection accumulates weights to build a cumulative distribution, then compares `rng.next() * totalWeight` against cumulative sums. With many alternatives (e.g., 50+ items with fractional weights like 0.1), IEEE 754 floating-point addition accumulates rounding errors. The final cumulative sum may be slightly less than `totalWeight`, creating a tiny unreachable range at the top. If `rng.next() * totalWeight` falls in this gap, no alternative is selected.

**Mitigation**: In the weighted selection algorithm (`selectionModes.ts`), always select the last alternative as a fallback if no cumulative threshold is reached. This guarantees termination regardless of float precision. **Decision**: Use the last-item fallback approach (simpler, no weight type changes). Integer weight normalization was considered but rejected — it requires a common-factor calculation and changes the weight type from `number` to integer, adding complexity without meaningful benefit for game text. Add a test case with 100 alternatives each weighted 0.1 and a mock rng returning 0.9999999 — verify an alternative is always selected.

### Spec/Plan Empty Seed String Contradiction (Medium — EdgeCase)

The spec's edge cases section states: "What happens when seed string is empty? → SHA-256 of empty string is valid; produces a deterministic (if unusual) seed." The plan's seed validation (Security Considerations) states: "Invalid/empty seed maps to a `{ ok: false, kind: 'invalid_seed' }` result variant." These are contradictory — one says empty is valid, the other rejects it.

**Resolution**: The plan's decision to reject empty seeds is correct and takes precedence. Empty seeds are technically hashable but produce a fixed, publicly known hash — any game content rendered with an empty seed is trivially reproducible by anyone who knows the grammar. Update the spec's edge case answer to: "What happens when seed string is empty? → Rejected with `invalid_seed` error. While SHA-256 of empty string is valid, empty seeds produce a publicly known hash, making all output trivially reproducible."

### YAML Duplicate Key Silent Override (Medium — EdgeCase)

The YAML specification allows duplicate keys with "last wins" semantics. The `yaml` npm package follows this behavior by default. A grammar with two definitions of rule `"planet"` silently uses only the last definition — the first is discarded without warning. This is a content authoring error that goes undetected at parse time, potentially producing confusing render results when the author intended both rules.

**Mitigation**: In `grammarParser.ts`, configure `yaml.parse` with `{ uniqueKeys: true }` (supported by the `yaml` package since v2.0.0) to throw on duplicate keys. If the `yaml` package version does not support `uniqueKeys`, manually check for duplicates by collecting keys during iteration and throwing `GrammarParseError("Duplicate rule name '{name}' in grammar")` on collision. Add test cases: grammar YAML with duplicate rule names → `GrammarParseError`.

### grammarToDto Serialization Failure (Medium — ErrorHandling)

`RenderStoryResult` maps `StorageError` from `storage.load()` to `{ ok: false, kind: 'storage_error' }`, but `storage.save()` calls `JSON.stringify(dto)` internally. If any grammar value is non-serializable (e.g., `undefined` values stripped silently, circular references from a future code change), `JSON.stringify` throws `TypeError`. Additionally, `kv.put()` can throw for network errors. Neither failure path is explicitly caught in `kvStorage.ts` or `d1Storage.ts`.

**Mitigation**: In `kvStorage.ts` and `d1Storage.ts`, wrap the entire `save()` implementation in try/catch. Catch `TypeError` from `JSON.stringify` and KV/D1 runtime errors, wrapping both as `StorageError`. The "never throws" contract applies to `RenderStoryService.render()` (which only calls `load`), but `save()` is called by content deployment tooling which MUST also receive typed errors rather than raw exceptions. Add test case: mock a grammar DTO that causes `JSON.stringify` to throw → verify `StorageError` is thrown, not `TypeError`.

### StructRule With Zero Fields (Low — EdgeCase)

A `StructRule` with an empty `fields` map (`fields: {}`) is not rejected at parse time. It would render its template with no field context, leaving all `{field}` references unresolved and triggering `TemplateError` at render time. Like zero-rule grammars and single-alternative TextRules, this is likely an authoring mistake.

**Mitigation**: In `grammarParser.ts`, validate that StructRule has at least one field. Throw `GrammarParseError("StructRule '{name}' must have at least one field")`. Add test case: struct with empty fields → `GrammarParseError`.

### Include Resolution Wall-Clock Budget (Low — Performance)

`MAX_INCLUDE_DEPTH = 20` and `MAX_INCLUDE_COUNT = 50` bound iterations but not wall-clock time. With parallel resolution at each depth level, worst case is 20 sequential depth levels × KV cold read latency (10-40ms) = 200-800ms per render for deep include chains. While the 50ms performance goal applies to "typical grammars (< 100 rules)", deep include trees could exceed Workers' CPU time limits (10-50ms on free tier, 30s on paid).

**Mitigation**: Document that deep include chains (> 5 levels) should be avoided in grammar design. For Phase 1, the practical include depth is 2-3 levels. If Phase 4 batch rendering hits latency issues, consider pre-resolving includes at grammar upload time (flattening the include tree into a single merged grammar stored as one KV entry). This eliminates per-render include resolution entirely.

### CachedStorage DTO Cache Unbounded Growth (Medium — Performance)

_Added by adversarial review (sp:04-red-team, 2026-03-24)._

`CachedStorage` holds a `Map<string, { dto: GrammarDto; expiresAt: number }>` on the DI singleton. The Jinja2Engine template cache is bounded at `MAX_CACHE_SIZE = 500` with FIFO eviction, but no equivalent bound exists for the grammar DTO cache. Workers isolates can be long-lived (minutes to hours). With `MAX_KV_VALUE_BYTES = 24_000_000`, even a few large cached DTOs could consume significant memory against the 128MB isolate ceiling.

**Mitigation**: Add `MAX_DTO_CACHE_SIZE = 100` to `cachedStorage.ts` with FIFO eviction (same pattern as template cache). At documented scale (dozens of grammars), this is generous but prevents unbounded growth in edge cases. Add a test verifying eviction triggers when the 101st distinct key is cached.

### StoragePort Save/Delete Authorization Gate (Medium — Security)

_Added by adversarial review (sp:04-red-team, 2026-03-24)._

`StoragePort.save()` and `StoragePort.delete()` are included in the port interface with no authorization contract documented anywhere in the call stack. `RenderStoryService` only calls `load()`, but the port interface is generic — if a future handler wires directly to the storage port, mutating operations on production KV are unguarded. Since `InMemoryStorage` is wired in tests without restriction, the absence of an authorization contract is invisible in unit tests.

**Mitigation**: (1) Add JSDoc to `StoragePort.save()` and `StoragePort.delete()`: "Administrative operation — must not be exposed in public-facing handlers without authorization." (2) Document in the DI wiring section: "StoragePort save/delete are administrative operations. The `renderStoryService` getter only needs `load()` and `keys()`. A separate admin service or authorized middleware must gate save/delete access in production." **Decision on port split**: Keep a single `GrammarStorage` interface for Phase 1 — splitting into `GrammarReader`/`GrammarWriter` adds two interfaces, two implementation targets per adapter, and DI complexity for a distinction that JSDoc + code review enforces adequately at current scale. Revisit if a grammar management API is added in Phase 4+.

### InMemoryStorage Accidental Production Wiring (Medium — Misuse)

_Added by adversarial review (sp:04-red-team, 2026-03-24)._

`InMemoryStorage` is documented as "for testing" but is a valid `StoragePort` implementation with no production guard. If accidentally wired in `serviceFactory.ts` (e.g., during staging setup or when `GRAMMAR_KV` binding is missing), the singleton holds state across all requests in the same isolate. Grammars saved in one request are silently visible to subsequent requests — cross-request state leakage. Unlike a missing KV binding (which fails loudly), `InMemoryStorage` succeeds silently.

**Mitigation**: In `inMemoryStorage.ts`, document prominently: "Test-only implementation — must not appear in serviceFactory.ts." In `serviceFactory.ts`, the `renderStoryService` getter must reference `this.env.GRAMMAR_KV` — if the binding is missing, construction fails loudly at the KV adapter level. No additional runtime guard needed in Phase 1 since the DI wiring is code-reviewed.

### Jinja2Engine Error Messages Echo User Content (Low — Security)

_Added by adversarial review (sp:04-red-team, 2026-03-24)._

`TemplateError` messages include user-supplied content from parsed tokens (e.g., `"Property 'X' not found on context object"` where X comes from the template expression). The plan requires logging errors at WARN level. If logs are accessible to operators or monitoring systems, crafted grammar expressions can use error messages as a side channel to probe context structure. Combined with the existing "Error Message Information Leakage" finding (HTTP responses), this creates a logging-side exposure.

**Mitigation**: In `jinja2Engine.ts`, truncate user-supplied content in error messages to 50 characters and strip non-printable characters before interpolating into `TemplateError`. Add a test: template with a 1,000-character expression name → verify error message truncates the expression. This complements the existing HTTP-response mitigation with a logging-side defense.

### PICK/RATCHET With Duplicate List Items (Low — EdgeCase)

_Added by adversarial review (sp:04-red-team, 2026-03-24)._

The plan does not specify behavior when a `ListRule` with PICK or RATCHET mode contains duplicate string values (e.g., `items: ["red", "red", "blue"]`). PICK's Fisher-Yates shuffle treats each index as a distinct slot — duplicates are valid and each slot is picked once per epoch. RATCHET cycles by index. This is well-defined algorithmically, but grammar authors may expect deduplicated semantics.

**Resolution**: Duplicates are treated as distinct slots by index, not by value. A rule with `items: ['red', 'red', 'blue']` in PICK mode returns 'red' twice per epoch (once per slot). This is intentional — authors who want weighted selection should use REUSE mode with TextRule weights. No parse-time rejection of duplicates. Add a test verifying PICK with duplicates returns each slot exactly once per epoch.

### GrammarDto Map Key Order on Round-Trip (Low — EdgeCase)

_Added by adversarial review (sp:04-red-team, 2026-03-24)._

`Grammar.rules` is a `ReadonlyMap<string, Rule>`. `grammarToDto` serializes to a plain JSON object. V8 guarantees insertion order for string-keyed properties, so round-trips within Workers preserve order. However, if a future migration tool or admin script processes GrammarDto JSON outside V8 (Python, Deno, etc.), key order may differ, causing subtle divergence in include conflict resolution (left-to-right precedence depends on rule iteration order).

**Resolution**: Document in `dto.ts` JSDoc: "Rule order in JSON is insertion order (V8-guaranteed). `grammarFromDto` reconstructs the Map in `Object.entries()` order. External tools processing GrammarDto JSON must preserve key order." Add a round-trip test: `grammarToDto → JSON.stringify → JSON.parse → grammarFromDto` produces identical key iteration order.

### Cross-Render SHA-256 Cache for Batch Scenarios (Low — Performance)

_Added by adversarial review (sp:04-red-team, 2026-03-24)._

`RenderContext.seedIntCache` caches `seedToInt` results per render pass but discards the cache after each call. For Phase 4 batch rendering (e.g., 100 system descriptions per request), the same scoped seed strings are hashed redundantly: 50 rules × 100 renders = 5,000 SHA-256 calls. While `crypto.subtle.digest` is sub-millisecond in Workers, the aggregate adds measurable latency.

**Decision**: Deferred — Phase 1 single-render use case does not require cross-render caching. If Phase 4 profiling shows SHA-256 as a hotspot, add a `SeedCache` (bounded `Map<string, number>`, max 10,000 entries) on `RenderStoryService` shared across render calls within one request. Do not share across requests to avoid unbounded growth.

### Seed String Unicode Normalization (Medium — EdgeCase)

_Added by adversarial review (sp:04-red-team, 2026-03-29)._

Visually identical Unicode strings with different normalization forms (NFC vs NFD) produce different SHA-256 hashes. For example, "café" in NFC (4 code points: U+0063 U+0061 U+0066 U+00E9) and NFD (5 code points: U+0063 U+0061 U+0066 U+0065 U+0301) display identically but hash to different values. If seeds are derived from copy-pasted text, user input, or external systems, SC-001 ("same seed always yields same output") breaks silently — two users providing what appears to be the same seed get different game content.

**Mitigation**: In `seedHasher.ts`, normalize the seed string to NFC before encoding: `new TextEncoder().encode(seed.normalize('NFC'))`. NFC is the W3C-recommended normalization form and the default for most text input. Document this normalization in `seedHasher.ts` JSDoc so future maintainers understand why it's necessary. Add test cases: seed "café" in NFC and NFD produce identical `seedToInt` output; seed with combining diacriticals (e.g., U+0065 U+0301) produces the same hash as the precomposed form (U+00E9).

### Seed String Length Unbounded (Medium — Security)

_Added by adversarial review (sp:04-red-team, 2026-03-29)._

`RenderStoryRequest.seed` validates only non-emptiness (rejecting empty strings as `invalid_seed`). No maximum length is enforced. A multi-megabyte seed string triggers a large `TextEncoder.encode()` + `crypto.subtle.digest()` call. Since `seedToInt` is called for every scoped seed — formatted as `"{baseSeed}-{scopeKey}"` — a 1MB seed with 50 rules produces 50× 1MB+ strings to encode and hash, consuming ~50MB+ of encoding work per render against the Workers 128MB memory ceiling. This is a resource exhaustion vector even without exceeding `MAX_EVALUATIONS`.

**Mitigation**: Add `MAX_SEED_LENGTH = 256` validation in `RenderStoryService.render()` before any processing. Reject seeds exceeding this limit with `{ ok: false, kind: 'invalid_seed', message: 'Seed exceeds maximum length of 256 characters' }`. 256 characters is generous for any reasonable seed format (hex strings, UUIDs, location identifiers) while bounding the amplification factor. Add to the Constants Placement table. Add test cases: seed at exactly 256 characters (valid); seed at 257 characters (rejected); seed at 1MB (rejected).

### `seedToInt` Encoding MUST Use UTF-8 (Low — EdgeCase)

_Added by adversarial review (sp:04-red-team, 2026-03-29)._

The plan specifies "SHA-256 hashing via `crypto.subtle`" but `crypto.subtle.digest` accepts `ArrayBuffer`, not strings. The byte encoding used to convert the seed string determines the hash. If `seedHasher.ts` uses `TextEncoder` (UTF-8) but a future CLI tool, migration script, or cross-platform client uses UTF-16 or Latin-1 encoding, the same seed string produces different hashes — breaking determinism portability.

**Mitigation**: In `seedHasher.ts`, explicitly use `new TextEncoder().encode(normalizedSeed)` (which is always UTF-8 per WHATWG spec) and document in JSDoc: "Seed strings are encoded as UTF-8 before SHA-256 hashing. External tools computing seed hashes MUST use UTF-8 encoding for compatibility." Add a test case: a seed containing non-ASCII characters (e.g., "système-α") produces a specific, hardcoded expected hash — this pins the encoding and prevents silent changes.

### Include Depth Counting Convention (Low — EdgeCase)

_Added by adversarial review (sp:04-red-team, 2026-03-29)._

`MAX_INCLUDE_DEPTH = 20` bounds include chain depth, but the plan does not define whether the root grammar counts as depth 0 or depth 1. An off-by-one in the depth counter allows either 19 or 21 transitive include levels depending on the implementer's interpretation. For a limit this small (20), a one-off error is a 5% deviation.

**Mitigation**: Define explicitly: the root grammar is depth 0. The first level of includes is depth 1. `MAX_INCLUDE_DEPTH = 20` means the deepest include chain is `root → include₁ → include₂ → ... → include₂₀` (20 hops from root). Throw `IncludeDepthError` when `depth > MAX_INCLUDE_DEPTH`. Document this convention in `renderStoryService.ts` JSDoc next to the constant definition. Add test cases: include chain at exactly depth 20 (valid); include chain at depth 21 (rejected).
