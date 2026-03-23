# Prestoplot

> A deterministic, seed-driven generative text library for Cloudflare Workers.

Prestoplot is a TypeScript port of the Python `prestoplot` generative text system, itself
similar to Tracery. It provides grammar-based procedural text generation with seeded
randomness, multiple selection strategies, and a template interpolation engine — all
within the Cloudflare Workers runtime (Web Standard APIs only).

## Design Constraints

- **Cloudflare Workers only.** No Node.js APIs (`fs`, `path`, `process`, `crypto` module,
  `buffer`, `stream`). All crypto via `crypto.subtle`.
- **Pure TypeScript.** No external runtime dependencies for the core library; storage
  adapters may depend on CF bindings.
- **Determinism.** Same seed + same grammar → same output, always. This is load-bearing
  for game narrative consistency.
- **Clean Architecture.** Domain layer has zero external dependencies. Storage adapters
  live in infrastructure.

## Spec Index

| File | Contents |
|------|----------|
| [01-domain-model.md](./01-domain-model.md) | Grammar, Rule types, Value Objects, enums |
| [02-ports-and-adapters.md](./02-ports-and-adapters.md) | Port interfaces (StoragePort, TemplateEnginePort, RandomPort) |
| [03-grammar-file-format.md](./03-grammar-file-format.md) | YAML/JSON grammar file schema |
| [04-application-services.md](./04-application-services.md) | `renderStory` entry point, use case orchestration |
| [05-selection-modes.md](./05-selection-modes.md) | reuse, pick, ratchet, markov, list algorithms |
| [06-seed-and-context.md](./06-seed-and-context.md) | Seed value object, ScopedSeed, Context, scoping rules |
| [07-markov-chain.md](./07-markov-chain.md) | Character-level Markov chain training and generation |
| [08-template-engines.md](./08-template-engines.md) | ftemplate interpolation engine, jinja2 subset |
| [09-storage-adapters.md](./09-storage-adapters.md) | KVStorage, D1Storage, InMemoryStorage, CachedStorage |
| [10-article-generation.md](./10-article-generation.md) | `.a` / `.an` / `.A` / `.An` article generation rules |
| [11-test-specification.md](./11-test-specification.md) | Vitest test vectors and coverage requirements |

## Python Deviations Summary

| Concern | Python | TypeScript |
|---------|--------|------------|
| Seed hashing | MD5 of random float string | SHA-256 (first 32 hex chars) via `crypto.subtle` |
| PRNG | MT19937 (Mersenne Twister) | Mulberry32 (existing `src/domain/galaxy/prng.ts`) |
| PRNG seed conversion | implicit MT19937 seeding | `seedToInt`: SHA-256(UTF-8(seed)) → first 4 bytes as big-endian uint32 |
| Template engine 1 | Python f-string (`{expr}`) | Custom ftemplate tokenizer (`{expr}` syntax), iterative |
| Template engine 2 | Jinja2 full library | Jinja2-subset interpreter (no control flow, no filters) |
| File storage | FileStorage (reads YAML from disk) | Removed — no filesystem in Workers |
| New storage adapters | — | KVStorage, D1Storage, InMemoryStorage, CachedStorage |
| Lazy evaluation | Python `__str__` dunder coercion | Explicit `render()` call returning `RenderedString` |
| Circular includes | Silent skip | Detect and throw `CircularIncludeError` |
| PRNG test vectors | MT19937 sequence | New Mulberry32 vectors (computed at implementation time) |
| Article special cases | vowel-only check | Adds `uni-`, `use-`, `eu-` / `hour-`, `heir-`, `hon-` special cases |

## Layer Placement

```
src/domain/prestoplot/
  grammar.ts             — Grammar, Rule, SelectionMode, RenderStrategy, enums
  renderedString.ts      — RenderedString, makeRenderedString
  seed.ts                — Seed, ScopedSeed, scopeSeed branded types
  articleGeneration.ts   — getArticle
  markovChain.ts         — trainMarkovChain, generateMarkov, MarkovChainModel
  selectionModes.ts      — PickState, SelectionState, selection algorithms
  errors.ts              — ModuleNotFoundError, RuleNotFoundError, MarkovDeadEndError, CircularIncludeError

src/application/prestoplot/
  ports.ts               — StoragePort, TemplateEnginePort, RandomPort, Rng
  renderStoryService.ts  — RenderStoryService (primary entry point)
  grammarParser.ts       — YAML → Grammar
  renderEngine.ts        — Per-render execution engine (internal)
  renderContext.ts       — RenderContext construction
  dto.ts                 — GrammarDto, RuleDto, grammarFromDto, grammarToDto
  errors.ts              — TemplateError, StorageError, GrammarParseError

src/infrastructure/prestoplot/
  inMemoryStorage.ts     — InMemoryStorage (for testing and embedded grammars)
  kvStorage.ts           — KVStorage (Cloudflare KV)
  d1Storage.ts           — D1Storage (Cloudflare D1)
  cachedStorage.ts       — CachedStorage decorator
  ftemplateEngine.ts     — FtemplateEngine, tokenizer
  jinja2Engine.ts        — Jinja2Engine (subset)
  mulberry32Random.ts    — RandomPort adapter wrapping existing Mulberry32
  seedHasher.ts          — seedToInt implementation (async, crypto.subtle)
```

## Existing Code to Reuse

- `src/domain/galaxy/prng.ts` — Mulberry32 PRNG. **Do NOT duplicate.**
- `src/shared/hex.ts` — hex encoding utility for seedHasher.ts
- `src/shared/env.ts` — extend with KV/D1 bindings for grammar storage adapters
