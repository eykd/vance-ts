# Selection Modes

## Overview

Selection modes determine how a `ListRule`'s items are chosen at render time.
Each mode has distinct semantics around statefulness, item ordering, and rendering.

All selection algorithms receive the current `RenderContext` (see: 06-seed-and-context.md)
and the rule name, which is used for seed scoping and state keys.

## REUSE Mode

**Semantics**: Uniform random with replacement. The same item may be selected on
consecutive calls. Items are recursively rendered as template strings.

**Algorithm**:
1. Construct RNG from `ScopedSeed("{baseSeed}-{ruleName}-reuse")`.
2. Call `rng.randint(0, items.length - 1)` to select an index.
3. Recursively render `items[index]` as a template string via the TemplateEngine.
4. Return the rendered `RenderedString`.

**Statefulness**: None (fully determined by seed + ruleName).

**Item rendering**: Recursive (items are template strings).

## PICK Mode

**Semantics**: Uniform random without replacement. Once an item is selected, it is
removed from the available pool. When the pool is exhausted, it is reshuffled from the
full item list (seeded with a new epoch seed), starting a new epoch.

**Algorithm**:
1. Retrieve or initialize the depletion state from `RenderContext.selectionState.pickState[ruleName]`:
   - `available`: shuffled copy of all item indices not yet picked in this epoch.
   - `epoch`: integer epoch counter, starts at 0.
2. If `available` is empty: increment `epoch`, reshuffle all items using Fisher-Yates
   with RNG seeded from `ScopedSeed("{baseSeed}-{ruleName}-pick-epoch-{epoch}")`.
3. Pop the first index from `available` (head of the shuffled list).
4. Recursively render `items[index]` as a template string.
5. Persist updated state to `RenderContext.selectionState.pickState[ruleName]`.
6. Return the rendered `RenderedString`.

**Initial shuffle (epoch 0)**: Fisher-Yates with
`ScopedSeed("{baseSeed}-{ruleName}-pick-epoch-0")`.

**Statefulness**: Per-render (state lives in `RenderContext.selectionState`; not
persisted across render calls).

**Item rendering**: Recursive (items are template strings).

## RATCHET Mode

**Semantics**: Sequential cycling. Items are selected in order; wraps around at the
end. Items are plain strings — no recursive rendering.

**Algorithm**:
1. Retrieve call count from `RenderContext.selectionState.ratchetCount[ruleName]`
   (starts at 0).
2. `index = callCount % items.length`.
3. Increment `ratchetCount[ruleName]`.
4. Return `items[index]` wrapped in `makeRenderedString` (plain string passthrough).

**Statefulness**: Per-render (call counter in `RenderContext.selectionState`).

**Item rendering**: None (plain string passthrough).

**Test vector**: A three-item ratchet list `["red", "blue", "green"]` accessed four
times produces `"red"`, `"blue"`, `"green"`, `"red"` (wraps around).

## MARKOV Mode

**Semantics**: Generates a novel string from a character-level Markov chain trained on
the item corpus. Items are training data, not directly emitted.

**Algorithm**:
1. Build or retrieve a `MarkovChainModel` from `RenderEngine`'s per-render model cache
   (keyed by `ruleName`). If not cached, call `trainMarkovChain(items, order)`.
2. Construct RNG from `ScopedSeed("{baseSeed}-{ruleName}-markov")`.
3. Call `generateMarkov(model, rng, maxLength)`.
4. Return the generated string wrapped in `makeRenderedString`.

See 07-markov-chain.md for the full training and generation specification.

**Statefulness**: None per-call (model is cached, generation is seeded).

**Item rendering**: None (items are corpus strings only).

**Order**: Taken from `ListRule.order` (default 2). See 03-grammar-file-format.md.

## LIST Mode

**Semantics**: No selection; returns all items as a `Datalist`. Callers access items
by index. Items are plain strings.

**Algorithm**:
1. Construct a `Datalist` wrapping `rule.items`.
2. Return the `Datalist` directly (not a `RenderedString`).

**Statefulness**: None.

**Item rendering**: None (plain string passthrough).

**Usage in templates**: LIST mode rules cannot appear in template positions that expect
a `RenderedString`. They must be accessed via index:
```
{MyList[0]}
{MyList[2]}
```

## SelectionState Types

```typescript
/**
 * Mutable selection state carried within a RenderContext for one render call.
 */
export interface SelectionState {
  /**
   * Per-rule pick state for PICK mode.
   * Keys are rule names; values are the current depletion state.
   */
  readonly pickState: Map<string, PickState>;

  /**
   * Per-rule call counters for RATCHET mode.
   * Keys are rule names; values are the number of times the rule has been called.
   */
  readonly ratchetCount: Map<string, number>;
}

/** Depletion state for a single PICK mode rule during one render call. */
export interface PickState {
  /** Shuffled remaining item indices for the current epoch. */
  available: number[];
  /** Current epoch counter; incremented on pool exhaustion. */
  epoch: number;
}
```

## Comparison Table

| Mode | Replacement | Item Rendering | Statefulness | Return Type |
|------|-------------|----------------|--------------|-------------|
| REUSE | With | Template (recursive) | None | RenderedString |
| PICK | Without | Template (recursive) | Per-render (depletion) | RenderedString |
| RATCHET | N/A (sequential) | None (plain passthrough) | Per-render (counter) | RenderedString |
| MARKOV | N/A (generated) | None (corpus training) | None | RenderedString |
| LIST | N/A (all items) | None (plain passthrough) | None | Datalist |
