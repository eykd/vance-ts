/**
 * Selection mode algorithms for list rule item selection.
 *
 * Each function implements a distinct selection strategy:
 * - REUSE: random with replacement
 * - PICK: Fisher-Yates shuffle without replacement (per epoch)
 * - RATCHET: sequential cycling
 * - LIST: direct index access
 *
 * @module domain/prestoplot/selectionModes
 */

/**
 * Minimal synchronous RNG interface consumed by selection algorithms.
 */
export interface SelectionRng {
  /** Returns a float in [0, 1). Advances internal state. */
  next(): number;
}

/**
 * Per-rule depletion state for PICK mode.
 */
export interface PickState {
  /** Remaining shuffled indices in current epoch. */
  available: number[];
  /** Current epoch counter (incremented on exhaustion). */
  epoch: number;
}

/**
 * Mutable per-render state for stateful selection modes.
 */
export interface SelectionState {
  /** PICK mode depletion state, keyed by scopedSeed+ruleName. */
  readonly pickStates: Map<string, PickState>;
  /** RATCHET mode call counters, keyed by rule name. */
  readonly ratchetCounts: Map<string, number>;
}

/**
 * Creates a fresh, empty SelectionState.
 *
 * @returns An empty mutable SelectionState for a new render pass.
 */
export function createSelectionState(): SelectionState {
  return {
    pickStates: new Map(),
    ratchetCounts: new Map(),
  };
}

/**
 * REUSE mode: select a random item with replacement.
 *
 * Falls back to the last item if float precision causes
 * the index to equal items.length.
 *
 * @param items - Non-empty list of items.
 * @param rng - Seeded RNG instance.
 * @returns The selected item.
 */
export function selectReuse(items: readonly string[], rng: SelectionRng): string {
  const index = Math.min(Math.floor(rng.next() * items.length), items.length - 1);
  return items[index]!;
}

/**
 * PICK mode: select without replacement using Fisher-Yates shuffle per epoch.
 *
 * Maintains a shuffled pool of indices. When exhausted, a new epoch
 * begins with a fresh shuffle. State is keyed by the provided key
 * (typically scopedSeed+ruleName) for isolation.
 *
 * @param items - Non-empty list of items.
 * @param rng - Seeded RNG instance (used for initial shuffle and reshuffles).
 * @param stateKey - Unique key for state isolation (scopedSeed+ruleName).
 * @param state - Mutable selection state for the current render pass.
 * @returns The selected item.
 */
export function selectPick(
  items: readonly string[],
  rng: SelectionRng,
  stateKey: string,
  state: SelectionState
): string {
  let pickState = state.pickStates.get(stateKey);

  if (pickState === undefined || pickState.available.length === 0) {
    const epoch = pickState !== undefined ? pickState.epoch + 1 : 0;
    const shuffled = fisherYatesShuffle(items.length, rng);
    pickState = { available: shuffled, epoch };
    state.pickStates.set(stateKey, pickState);
  }

  const index = pickState.available.shift()!;
  return items[index]!;
}

/**
 * RATCHET mode: cycle through items sequentially.
 *
 * Returns items in order 0, 1, 2, ..., 0, 1, 2, ... wrapping
 * via modulo. State is keyed by the provided key.
 *
 * @param items - Non-empty list of items.
 * @param stateKey - Unique key for counter isolation.
 * @param state - Mutable selection state for the current render pass.
 * @returns The selected item.
 */
export function selectRatchet(
  items: readonly string[],
  stateKey: string,
  state: SelectionState
): string {
  const count = state.ratchetCounts.get(stateKey) ?? 0;
  const index = count % items.length;
  state.ratchetCounts.set(stateKey, count + 1);
  return items[index]!;
}

/**
 * LIST mode: return the item at a given index.
 *
 * Clamps the index to valid bounds: negative indices resolve to 0,
 * indices beyond the end resolve to the last item.
 *
 * @param items - Non-empty list of items.
 * @param index - The requested index.
 * @returns The item at the clamped index.
 */
export function selectList(items: readonly string[], index: number): string {
  const clamped = Math.max(0, Math.min(index, items.length - 1));
  return items[clamped]!;
}

/**
 * Fisher-Yates (Knuth) shuffle producing a shuffled array of indices.
 *
 * Uses last-item fallback for float precision safety.
 *
 * @param length - Number of indices to shuffle.
 * @param rng - Seeded RNG instance.
 * @returns A shuffled array of indices [0, length).
 */
function fisherYatesShuffle(length: number, rng: SelectionRng): number[] {
  const indices = Array.from({ length }, (_, i) => i);
  for (let i = length - 1; i > 0; i--) {
    const j = Math.min(Math.floor(rng.next() * (i + 1)), i);
    const tmp = indices[i]!;
    indices[i] = indices[j]!;
    indices[j] = tmp;
  }
  return indices;
}
