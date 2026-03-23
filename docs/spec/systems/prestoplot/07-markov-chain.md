# Markov Chain

## Overview

The MARKOV selection mode generates novel strings from a character-level Markov chain
trained on the items of a `ListRule`. This mirrors the Python implementation but uses
pure TypeScript (no external libraries) and the project's Mulberry32 PRNG.

## Data Types

```typescript
/**
 * Trained Markov chain model.
 *
 * Maps each n-gram key to an array of characters that followed it in
 * the training corpus. Duplicate characters appear multiple times
 * (frequency encoding for weighted random selection via rng.choice).
 */
export interface MarkovChainModel {
  /** Order of the Markov chain (n-gram length). Default: 2. Must be >= 1. */
  readonly order: number;

  /**
   * Transition table.
   * Key: n-gram string (or sentinel-padded for start/end).
   * Value: array of successor characters (with repeats for frequency weighting).
   */
  readonly transitions: ReadonlyMap<string, readonly string[]>;
}

/** Sentinel character marking start-of-string boundaries. */
export const MARKOV_START = '\x02';  // STX (ASCII 2)

/** Sentinel character marking end-of-string boundaries. */
export const MARKOV_END = '\x03';    // ETX (ASCII 3)
```

## Training Phase

```typescript
/**
 * Trains a character-level Markov chain from a corpus of strings.
 *
 * @param corpus - Array of training strings. Must be non-empty.
 * @param order - N-gram order. Default 2. Must be >= 1.
 * @returns Trained MarkovChainModel.
 * @throws {RangeError} if corpus is empty.
 * @throws {RangeError} if order < 1.
 */
export function trainMarkovChain(
  corpus: readonly string[],
  order?: number,
): MarkovChainModel;
```

### Training Algorithm

For each string `W` in the corpus, with n-gram order `N`:

1. Construct padded string: `paddedW = MARKOV_START.repeat(N) + W + MARKOV_END`
2. Slide a window of width `N` across `paddedW`:
   ```
   for i in range(len(paddedW) - N):
     key       = paddedW.slice(i, i + N)
     successor = paddedW[i + N]
     transitions.get(key) ?? []; transitions.set(key, [...existing, successor])
   ```
3. The start key for generation is `MARKOV_START.repeat(N)`.

Example for `W = "cat"`, `N = 2`:
- `paddedW = "\x02\x02cat\x03"`
- Transitions:
  - `"\x02\x02"` → `["c"]`
  - `"\x02c"` → `["a"]`
  - `"ca"` → `["t"]`
  - `"at"` → `["\x03"]`

## Generation Phase

```typescript
/**
 * Generates a single string from a trained Markov chain model.
 *
 * @param model - Trained MarkovChainModel.
 * @param rng - Seeded Rng for deterministic generation.
 * @param maxLength - Maximum output length (characters). Default: 100.
 * @param start - Optional string to continue from. Default: "" (fresh start).
 * @returns Generated string (without sentinel characters).
 * @throws {MarkovDeadEndError} if generation reaches a state with no transitions.
 */
export function generateMarkov(
  model: MarkovChainModel,
  rng: Rng,
  maxLength?: number,
  start?: string,
): string;

/**
 * Thrown when Markov generation reaches a state with no available transitions.
 *
 * This indicates a gap in training corpus coverage — the current n-gram was
 * never observed during training. Callers may retry with a different seed.
 */
export class MarkovDeadEndError extends Error {
  /** The n-gram key that had no successors in the model. */
  readonly deadKey: string;

  constructor(deadKey: string) {
    super(`Markov dead end at key: ${JSON.stringify(deadKey)}`);
    this.name = 'MarkovDeadEndError';
    this.deadKey = deadKey;
  }
}
```

### Generation Algorithm

1. Compute initial prefix:
   - If `start` is provided: take the last `N` characters of `start`,
     left-padded with `MARKOV_START` to length `N`.
   - Otherwise: `MARKOV_START.repeat(N)` (fresh start from the beginning).
2. Initialize output buffer (empty string or `start` if provided).
3. Loop (up to `maxLength` total output characters):
   a. Look up successors = `model.transitions.get(currentKey)`.
   b. If successors is `undefined` or empty → throw `MarkovDeadEndError(currentKey)`.
   c. Pick successor: `rng.choice(successors)`.
   d. If successor == `MARKOV_END` → stop (successful termination).
   e. Append successor to output buffer.
   f. Advance key: `currentKey = currentKey.slice(1) + successor`.
4. Return output buffer (without any sentinel characters).

## Caching

Training a Markov chain from a large corpus on every render call is expensive. The
`RenderEngine` maintains a per-render `Map<string, MarkovChainModel>` keyed by
`ruleName` to avoid retraining the same rule within a single render call.

Grammar-level cross-render caching (e.g., training once and persisting in KV) is out
of scope for the core library but is supported naturally via the `StoragePort` adapter
pattern (store pre-trained models separately).

## Order Selection

Default order is 2 (bigram model). The YAML options object accepts an `order` key:

```yaml
Names:
  - {mode: markov, order: 3}
  - Aldric
  - Beren
  - Calidwen
```

`order` must be an integer >= 1. Values >= 10 are impractical for typical corpus sizes;
implementors MAY warn but MUST NOT reject values > 10.

## MARKOV and Seed Scoping

MARKOV generation uses `ScopedSeed("{baseSeed}-{ruleName}-markov")`. Each call with
the same base seed and rule name generates the same string (deterministic). Different
rules from the same base seed produce independent sequences.

## Deviation from Python

- Python uses `random.choice` (MT19937). TypeScript uses `rng.choice` (Mulberry32),
  seeded from the scoped seed.
- Python pads the start string with spaces (`" " * chainlen`). TypeScript uses
  `MARKOV_START` (`\x02`) sentinels, which cannot appear in natural language text
  and therefore cannot be confused with content characters.
- Python computes the Markov model lazily on first `__str__` coercion. TypeScript
  trains eagerly on first render of the rule and caches the result per render call.
- Test vectors from the Python spec (e.g., "Owenry" for seed "testing-Protag" with
  MT19937) DO NOT apply. New vectors must be computed at implementation time.
