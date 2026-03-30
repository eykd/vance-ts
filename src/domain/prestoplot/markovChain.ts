/**
 * Character-level Markov chain training and generation.
 *
 * Trains on a corpus of strings, building an n-gram transition table
 * with frequency-encoded successors for weighted random selection.
 * Uses STX/ETX sentinels to mark string boundaries.
 *
 * @module domain/prestoplot/markovChain
 */

import type { Result } from '../shared/Result.js';

import type { SelectionRng } from './selectionModes.js';

/** Sentinel character marking start-of-string boundaries. */
export const MARKOV_START = '\x02';

/** Sentinel character marking end-of-string boundaries. */
export const MARKOV_END = '\x03';

/**
 * Maximum allowed product of total corpus characters and order.
 *
 * Prevents excessive memory use during training. If
 * `totalChars × order > MAX_MARKOV_CORPUS_PRODUCT`, parsing rejects the grammar.
 */
export const MAX_MARKOV_CORPUS_PRODUCT = 100_000;

/**
 * Trained Markov chain model.
 *
 * Maps each n-gram key to an array of characters that followed it
 * in the training corpus. Duplicate characters appear multiple times
 * (frequency encoding for weighted random selection via rngChoice).
 */
export interface MarkovChainModel {
  /** Order of the Markov chain (n-gram length). */
  readonly order: number;

  /**
   * Transition table.
   * Key: n-gram string (sentinel-padded for start/end).
   * Value: array of successor characters (with repeats for frequency weighting).
   */
  readonly transitions: ReadonlyMap<string, readonly string[]>;
}

/**
 * Error details when Markov generation reaches a state with no transitions.
 *
 * Indicates a gap in training corpus coverage — the current n-gram was
 * never observed during training. Callers may retry with a different seed.
 */
export interface MarkovDeadEndError {
  /** Discriminator for the error type. */
  readonly code: 'markov_dead_end';
  /** The n-gram key that had no successors in the model. */
  readonly deadKey: string;
  /** Human-readable message. */
  readonly message: string;
}

/**
 * Creates a MarkovDeadEndError value.
 *
 * @param deadKey - The n-gram key with no successors.
 * @returns A MarkovDeadEndError value object.
 */
export function markovDeadEnd(deadKey: string): MarkovDeadEndError {
  return {
    code: 'markov_dead_end',
    deadKey,
    message: `Markov dead end at key: ${JSON.stringify(deadKey)}`,
  };
}

/**
 * Selects a uniformly random element from a non-empty array.
 *
 * Uses floor(rng.next() * length) with clamping for float precision safety.
 *
 * @param items - Non-empty array of items.
 * @param rng - Seeded RNG instance.
 * @returns The selected item.
 */
export function rngChoice<T>(items: readonly T[], rng: SelectionRng): T {
  const index = Math.min(Math.floor(rng.next() * items.length), items.length - 1);
  return items[index]!;
}

/**
 * Trains a character-level Markov chain from a corpus of strings.
 *
 * For each string, pads with MARKOV_START sentinels (order times) at
 * the start and a single MARKOV_END at the end, then slides an n-gram
 * window to build the transition table.
 *
 * @param corpus - Array of training strings. Must be non-empty.
 * @param order - N-gram order. Default 2. Must be >= 1.
 * @returns Ok with trained model, or Err with RangeError.
 */
export function trainMarkovChain(
  corpus: readonly string[],
  order: number = 2
): Result<MarkovChainModel, RangeError> {
  if (corpus.length === 0) {
    return { success: false, error: new RangeError('Corpus must be non-empty') };
  }
  if (order < 1) {
    return { success: false, error: new RangeError('Order must be >= 1') };
  }

  const transitions = new Map<string, string[]>();

  for (const word of corpus) {
    const padded = MARKOV_START.repeat(order) + word + MARKOV_END;

    for (let i = 0; i <= padded.length - order - 1; i++) {
      const key = padded.slice(i, i + order);
      const successor = padded[i + order]!;
      let successors = transitions.get(key);
      if (successors === undefined) {
        successors = [];
        transitions.set(key, successors);
      }
      successors.push(successor);
    }
  }

  return { success: true, value: { order, transitions } };
}

/** Default maximum output length for generation. */
const DEFAULT_MAX_LENGTH = 100;

/**
 * Generates a single string from a trained Markov chain model.
 *
 * Walks the transition table, picking successors via rngChoice until
 * ETX is encountered or maxLength is reached.
 *
 * @param model - Trained MarkovChainModel.
 * @param rng - Seeded RNG for deterministic generation.
 * @param maxLength - Maximum output length (characters). Default: 100. Must be >= 1.
 * @param start - Optional string to continue from. Default: fresh start.
 * @returns Ok with generated string, or Err with MarkovDeadEndError or RangeError.
 */
export function generateMarkov(
  model: MarkovChainModel,
  rng: SelectionRng,
  maxLength: number = DEFAULT_MAX_LENGTH,
  start?: string
): Result<string, MarkovDeadEndError | RangeError> {
  if (maxLength < 1) {
    return { success: false, error: new RangeError('maxLength must be >= 1') };
  }

  const n = model.order;
  let currentKey: string;
  let output: string;

  if (start !== undefined && start.length > 0) {
    if (start.length >= n) {
      currentKey = start.slice(start.length - n);
    } else {
      currentKey = MARKOV_START.repeat(n - start.length) + start;
    }
    output = start;
  } else {
    currentKey = MARKOV_START.repeat(n);
    output = '';
  }

  while (output.length < maxLength) {
    const successors = model.transitions.get(currentKey);
    if (successors === undefined || successors.length === 0) {
      return { success: false, error: markovDeadEnd(currentKey) };
    }

    const successor = rngChoice(successors, rng);
    if (successor === MARKOV_END) {
      break;
    }

    output += successor;
    currentKey = currentKey.slice(1) + successor;
  }

  return { success: true, value: output };
}
