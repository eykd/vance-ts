# Seed and Context

## Seed Value Object

```typescript
/**
 * A 32-character lowercase hexadecimal string used to seed the PRNG.
 *
 * Seeds are opaque; their value is the hex string itself. Two Seed instances
 * with the same string are equal.
 *
 * Seeds are generated via: SHA-256(random 32 bytes) → first 32 hex chars (128 bits).
 * This replaces Python's MD5(str(random_float)).
 *
 * @remarks
 * The TypeScript implementation uses a branded type to prevent accidental use
 * of arbitrary strings as seeds.
 */
export type Seed = string & { readonly __brand: 'Seed' };

/**
 * Creates a Seed from a validated 32-char hex string.
 *
 * @param value - Must be exactly 32 lowercase hex characters [0-9a-f].
 * @throws {TypeError} if value is not a valid seed string.
 */
export function makeSeed(value: string): Seed;

/**
 * Generates a fresh cryptographically random Seed.
 *
 * Algorithm:
 * 1. `crypto.getRandomValues(new Uint8Array(32))` → 32 random bytes
 * 2. `crypto.subtle.digest('SHA-256', bytes)` → 32-byte (256-bit) digest
 * 3. Encode as lowercase hex; take the first 32 characters (128 bits)
 *
 * @returns Promise resolving to a fresh Seed.
 */
export async function generateSeed(): Promise<Seed>;
```

## ScopedSeed

```typescript
/**
 * A scoped seed derived from a base seed and a scope key.
 *
 * Format: `"{baseSeed}-{key}"` (plain string concatenation with hyphen separator).
 *
 * ScopedSeeds allow deterministic sub-randomness: accessing a StructRule field
 * at key "Hero" creates ScopedSeed `"{base}-Hero"` so that different fields of
 * the same struct always produce different (but deterministic) outputs for the
 * same base seed.
 *
 * ScopedSeeds are hashed to a 32-bit integer via the same pipeline as Seed
 * (SHA-256 → first 4 bytes as big-endian uint32) for PRNG initialization.
 */
export type ScopedSeed = string & { readonly __brand: 'ScopedSeed' };

/**
 * Creates a ScopedSeed from a base seed and a scope key.
 *
 * @param baseSeed - The base Seed or ScopedSeed.
 * @param key - The scope key (rule name, field name, mode suffix, etc.).
 * @returns ScopedSeed in format "{baseSeed}-{key}".
 */
export function scopeSeed(baseSeed: Seed | ScopedSeed, key: string): ScopedSeed;
```

## Seed to PRNG Integer Conversion

The Mulberry32 PRNG (see: `src/domain/galaxy/prng.ts`) takes a 32-bit unsigned integer
seed. The conversion algorithm:

1. Encode the seed string as UTF-8 bytes (using `TextEncoder`).
2. Compute `SHA-256(bytes)` via `crypto.subtle.digest('SHA-256', ...)`.
3. Read the **first 4 bytes** of the 32-byte digest as a **big-endian unsigned 32-bit
   integer** via `DataView.getUint32(0, false)`.

```typescript
/**
 * Converts a seed string to a 32-bit unsigned integer for Mulberry32 initialization.
 *
 * Uses SHA-256 of the UTF-8 encoding, taking the first 4 bytes as a
 * big-endian uint32. Deterministic: same input always produces the same uint32.
 *
 * IMPORTANT: This is async because crypto.subtle.digest is async in the
 * Cloudflare Workers runtime. The RenderContext caches results for the
 * duration of a single render call to avoid redundant hashing.
 *
 * @param seed - Seed or ScopedSeed string.
 * @returns Promise resolving to a 32-bit unsigned integer.
 */
export async function seedToInt(seed: Seed | ScopedSeed | string): Promise<number>;
```

**Performance note**: `seedToInt` is called once per unique seed string during rendering.
Implementations MUST cache the seed→int mapping in `RenderContext.seedIntCache` for the
duration of a single render call to avoid repeated SHA-256 invocations.

## RenderContext

```typescript
/**
 * Mutable render context for a single story render invocation.
 *
 * Created once by RenderStoryService.render and threaded through all rule
 * evaluations. NOT shared across concurrent render calls — each call gets
 * its own RenderContext.
 *
 * @remarks
 * RenderContext is intentionally mutable for performance (avoids repeated
 * allocation in hot render loops). The seedIntCache and selectionState are
 * the primary mutable fields.
 */
export interface RenderContext {
  /** Base seed for this render invocation. */
  readonly seed: Seed;

  /** User-supplied variables (read-only; not recursively rendered). */
  readonly userVars: Readonly<Record<string, string>>;

  /** Mutable selection state (PICK depletion, RATCHET counters). */
  readonly selectionState: SelectionState;

  /**
   * Cache for seedToInt results within this render call.
   * Key: seed or scoped seed string. Value: uint32.
   */
  readonly seedIntCache: Map<string, number>;

  /**
   * Set of module names currently in the include resolution stack.
   * Used for circular include detection.
   */
  readonly resolveStack: Set<string>;
}
```

## Context Scoping Rules

When a template expression accesses a named rule or a StructRule field, the effective
seed for that sub-evaluation is a ScopedSeed:

| Access | ScopedSeed |
|--------|-----------|
| `{Hero}` (rule reference) | `"{baseSeed}-Hero"` |
| `{Stats.speed}` (struct field) | `"{baseSeed}-Stats-speed"` |
| REUSE selection | `"{baseSeed}-{ruleName}-reuse"` |
| PICK epoch N selection | `"{baseSeed}-{ruleName}-pick-epoch-{N}"` |
| MARKOV generation | `"{baseSeed}-{ruleName}-markov"` |

This ensures:
- The same base seed + same rule name always produces the same result.
- Different rule names from the same base seed produce independent random sequences.
- Nested scoping is transitive: each level appends its key with a hyphen.

## Determinism Guarantees

The following must hold for identical inputs:

1. Same `moduleName` + same `seed` + same `userVars` → identical output text.
2. Changing any of these three inputs → (very likely) different output.
3. Across deployments and runtimes: guaranteed only if `Mulberry32` and `seedToInt`
   produce identical results, which they will as long as `crypto.subtle` SHA-256 is
   consistent (it is standardized).

## Deviation from Python

- Python uses `MD5(str(random_float))` for seed generation. TypeScript uses
  `SHA-256(random 32 bytes)` → first 32 hex chars. MD5 is not available in
  `crypto.subtle`; SHA-256 is the standard CF Workers digest algorithm.
- Python's MT19937 PRNG is replaced by Mulberry32, which already exists in this
  codebase at `src/domain/galaxy/prng.ts`. This ensures a single PRNG implementation
  across the project.
- Test vectors from the Python spec DO NOT apply. New vectors must be defined in
  11-test-specification.md at implementation time.
- `seedToInt` is async because `crypto.subtle.digest` is async in Workers.
  The caching layer in `RenderContext.seedIntCache` mitigates the performance impact.
