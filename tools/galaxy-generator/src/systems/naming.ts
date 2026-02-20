/**
 * Syllable-based combinatorial name generator with Vance-inspired phoneme pools.
 *
 * Generates unique, pronounceable star system names by combining onset, nucleus,
 * and coda phonemes into syllables, then assembling syllables into words. Supports
 * single-word (60%), two-word (25%), and three-word (15%) name formats.
 *
 * Uniqueness is guaranteed via Set-based collision detection with PRNG reroll.
 * All generation is deterministic given a fixed PRNG seed.
 *
 * @module systems/naming
 */

import type { Prng } from '../../../../src/domain/galaxy/prng';

/** Statistics about the name generation process. */
export interface NamingStats {
  /** Total number of names generated. */
  readonly total: number;
  /** Number of collision rerolls that occurred. */
  readonly collisions: number;
  /** Ratio of collisions to total attempts (0.0 to 1.0). */
  readonly collisionRate: number;
}

/** Result of name generation containing names and generation statistics. */
export interface NamingResult {
  /** Array of unique generated names. */
  readonly names: readonly string[];
  /** Statistics about the generation process. */
  readonly stats: NamingStats;
}

/**
 * Onset consonant clusters for syllable construction.
 *
 * Emphasizes hard consonants (k, t, d, v) and exotic clusters
 * characteristic of Jack Vance's naming style.
 */
const ONSETS: readonly string[] = [
  'b',
  'br',
  'ch',
  'd',
  'dr',
  'f',
  'fl',
  'fr',
  'g',
  'gl',
  'gr',
  'h',
  'j',
  'k',
  'kh',
  'kr',
  'l',
  'm',
  'n',
  'p',
  'pr',
  'r',
  's',
  'sh',
  'sk',
  'sl',
  'sm',
  'sn',
  'sp',
  'st',
  'str',
  'sv',
  't',
  'th',
  'tr',
  'v',
  'vr',
  'w',
  'z',
  'zr',
];

/**
 * Nucleus vowel sounds for syllable construction.
 *
 * Includes exotic vowel clusters (ai, ei, au, ia) for a
 * distinctive alien-world feel.
 */
const NUCLEI: readonly string[] = [
  'a',
  'ai',
  'au',
  'e',
  'ei',
  'i',
  'ia',
  'ie',
  'o',
  'oi',
  'ou',
  'u',
  'ue',
  'a',
  'e',
  'i',
  'o',
  'u',
  'ae',
  'ea',
  'oa',
  'oo',
  'ee',
  'ar',
  'or',
];

/**
 * Coda consonant endings for syllable construction.
 *
 * Features liquid endings (l, r, n, th) that create
 * flowing, pronounceable name endings.
 */
const CODAS: readonly string[] = [
  'l',
  'n',
  'r',
  'th',
  's',
  'x',
  'nd',
  'nt',
  'rn',
  'lk',
  'rk',
  'rd',
  'st',
  'sk',
  'ng',
  'ld',
  'rm',
  'rt',
  'nk',
  'lm',
  'rv',
  'lv',
  'sh',
  'ch',
  'ph',
];

/** Threshold for single-word names (0.0 to 0.60). */
const SINGLE_WORD_THRESHOLD = 0.6;

/** Threshold for two-word names (0.60 to 0.85). */
const TWO_WORD_THRESHOLD = 0.85;

/** Minimum syllables per word. */
const MIN_SYLLABLES = 2;

/** Maximum syllables per word. */
const MAX_SYLLABLES = 3;

/**
 * Picks a random element from a readonly array using the PRNG.
 *
 * @param arr - array to pick from
 * @param rng - seeded PRNG instance
 * @returns randomly selected element
 */
function pick<T>(arr: readonly T[], rng: Prng): T {
  return arr[rng.randint(0, arr.length - 1)]!;
}

/**
 * Generates a single syllable from onset + nucleus + optional coda.
 *
 * Approximately 50% of syllables include a coda ending to balance
 * pronounceability with variety.
 *
 * @param rng - seeded PRNG instance
 * @returns generated syllable string
 */
function generateSyllable(rng: Prng): string {
  const onset = pick(ONSETS, rng);
  const nucleus = pick(NUCLEI, rng);
  const hasCoda = rng.random() < 0.5;
  const coda = hasCoda ? pick(CODAS, rng) : '';
  return onset + nucleus + coda;
}

/**
 * Generates a single word from multiple syllables.
 *
 * Combines 2-4 syllables into one word, capitalized.
 *
 * @param rng - seeded PRNG instance
 * @returns capitalized generated word
 */
function generateWord(rng: Prng): string {
  const syllableCount = rng.randint(MIN_SYLLABLES, MAX_SYLLABLES);
  let word = '';
  for (let i = 0; i < syllableCount; i++) {
    word += generateSyllable(rng);
  }
  return word.charAt(0).toUpperCase() + word.slice(1);
}

/**
 * Generates a complete system name with 1-3 words.
 *
 * Distribution: ~60% single-word, ~25% two-word, ~15% three-word.
 * Each word is independently generated and capitalized.
 *
 * @param rng - seeded PRNG instance
 * @returns generated system name
 */
function generateName(rng: Prng): string {
  const roll = rng.random();

  if (roll < SINGLE_WORD_THRESHOLD) {
    return generateWord(rng);
  }

  if (roll < TWO_WORD_THRESHOLD) {
    return generateWord(rng) + ' ' + generateWord(rng);
  }

  return generateWord(rng) + ' ' + generateWord(rng) + ' ' + generateWord(rng);
}

/**
 * Generates a UUID v4 string from PRNG output.
 *
 * Produces a standard UUID v4 format (xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx)
 * where version bits are set to 4 and variant bits to 10xx.
 *
 * @param rng - seeded PRNG instance
 * @returns UUID v4 string
 */
export function generateUuid(rng: Prng): string {
  const hex = '0123456789abcdef';
  let uuid = '';

  for (let i = 0; i < 32; i++) {
    if (i === 12) {
      uuid += '4';
    } else if (i === 16) {
      const variant = 8 + rng.randint(0, 3);
      uuid += hex.charAt(variant);
    } else {
      uuid += hex.charAt(rng.randint(0, 15));
    }

    if (i === 7 || i === 11 || i === 15 || i === 19) {
      uuid += '-';
    }
  }

  return uuid;
}

/**
 * Generates unique system names for a galaxy.
 *
 * Uses syllable-based combinatorial generation with Vance-inspired phoneme
 * pools. Guarantees uniqueness through Set-based collision detection — on
 * collision, the next PRNG value is consumed for a reroll. Since the PRNG
 * is deterministic and collisions are resolved in order, output is fully
 * deterministic.
 *
 * @param count - number of unique names to generate
 * @param rng - seeded PRNG instance
 * @returns naming result with unique names and generation statistics
 */
export function generateSystemNames(count: number, rng: Prng): NamingResult {
  const names: string[] = [];
  const usedNames = new Set<string>();
  let collisions = 0;
  let attempts = 0;

  while (names.length < count) {
    attempts++;
    const name = generateName(rng);

    if (usedNames.has(name)) {
      collisions++;
      continue;
    }

    usedNames.add(name);
    names.push(name);
  }

  const collisionRate = attempts > 0 ? collisions / attempts : 0;

  return {
    names,
    stats: {
      total: count,
      collisions,
      collisionRate,
    },
  };
}
