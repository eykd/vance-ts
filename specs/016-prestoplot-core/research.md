# Research: Prestoplot Core

**Branch**: `016-prestoplot-core` | **Date**: 2026-03-24

## Summary

No NEEDS CLARIFICATION items existed in the technical context. The feature is backed by 11 comprehensive design specification documents (`docs/spec/systems/prestoplot/01-11`) that provide exact type signatures, algorithms, test vectors, and error handling patterns. Research focused on confirming implementation approaches.

## Decisions

### D1: PRNG Implementation

**Decision**: Reuse existing Mulberry32 from `src/domain/galaxy/prng.ts`
**Rationale**: Already proven in galaxy generation, deterministic, fast, 32-bit state fits Workers constraints
**Alternatives considered**: MT19937 (Python original — too large, 624×32-bit state), xorshift128 (unnecessary complexity)

### D2: Seed Hashing Algorithm

**Decision**: SHA-256 via `crypto.subtle.digest` (async)
**Rationale**: Spec mandates SHA-256; crypto.subtle is the only Web Standard API available in Workers. MD5 (Python original) not available in Workers without a polyfill.
**Alternatives considered**: MD5 polyfill (rejected — unnecessary dependency, spec already chose SHA-256)

### D3: YAML Parser

**Decision**: Use `yaml` npm package (pure JavaScript, Workers-compatible)
**Rationale**: Widely used, well-maintained, no Node.js dependencies. Already compatible with Workers bundling.
**Alternatives considered**: js-yaml (similar but `yaml` has better TypeScript types), custom parser (unjustified complexity)

### D4: Template Engine Implementation

**Decision**: Custom iterative tokenizers for both ftemplate and jinja2 subset
**Rationale**: Spec defines exact tokenizer behavior. No existing library matches the subset needed (jinja2 without control flow/filters). Custom implementation is simpler than adapting a full library.
**Alternatives considered**: nunjucks (too large, includes control flow we'd need to disable), mustache (different syntax)

### D5: Storage Primary Adapter

**Decision**: KV as primary production storage, InMemory for tests, D1 as optional alternative
**Rationale**: Grammars are read-heavy, rarely updated — ideal for KV's eventually-consistent read model. KV supports JSON values natively.
**Alternatives considered**: D1-only (heavier for read-only data), R2 (designed for large objects, overkill for JSON)

### D6: Test Execution Environment

**Decision**: Vitest with @cloudflare/vitest-pool-workers (Workers project in vitest.config.ts)
**Rationale**: Tests must run in Workers runtime to verify crypto.subtle, KV, D1 bindings work correctly. Colocated .spec.ts files follow existing project pattern.
**Alternatives considered**: Node.js test runner (can't test Workers-specific APIs), separate test directory (breaks existing pattern)

### D7: Async Seed Impact on API

**Decision**: RenderStoryService.render() returns Promise<RenderStoryResult>. RenderEngine caches seedToInt results in a Map per render pass.
**Rationale**: crypto.subtle.digest is async — this propagates to any function calling seedToInt. Caching prevents redundant hashing when the same scoped seed is used multiple times.
**Alternatives considered**: Synchronous hash (not possible in Workers), pre-compute all seeds upfront (unpredictable which scopes will be needed)
