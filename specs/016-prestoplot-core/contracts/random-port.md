# Contract: RandomPort

**Layer**: Application (port interface)
**File**: `src/application/prestoplot/ports.ts`

## Interfaces

```typescript
/** Synchronous random number generator (stateful, seeded). */
interface Rng {
  /** Returns a float in [0, 1). Advances internal state. */
  next(): number;
}

/** Port for creating seeded random number generators. */
interface RandomPort {
  /**
   * Convert a seed string to a 32-bit unsigned integer.
   * Uses SHA-256 hashing, taking the first 4 bytes as big-endian uint32.
   * Async because crypto.subtle.digest is async in Workers.
   */
  seedToInt(seed: string): Promise<number>;

  /**
   * Create a new Rng instance from a numeric seed.
   * The returned Rng is deterministic — same seed always produces same sequence.
   */
  createRng(seed: number): Rng;
}
```

## Implementation

| Adapter          | File                                                | PRNG Algorithm                                  |
| ---------------- | --------------------------------------------------- | ----------------------------------------------- |
| Mulberry32Random | `src/infrastructure/prestoplot/mulberry32Random.ts` | Mulberry32 (reuses `src/domain/galaxy/prng.ts`) |

## Behavior

- `seedToInt` is async due to `crypto.subtle.digest` — callers should cache results
- `createRng` is synchronous — returns a stateful Rng that advances on each `next()` call
- Determinism guarantee: `createRng(N).next()` always returns the same value for the same N
