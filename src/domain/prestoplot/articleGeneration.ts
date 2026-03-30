/**
 * Article generation — determines the correct English indefinite article
 * ("a" or "an") for a given word.
 *
 * @module domain/prestoplot/articleGeneration
 */

/** Words starting with silent 'h' that require "an". */
const SILENT_H_WORDS = new Set([
  'heir',
  'herb',
  'homage',
  'honest',
  'honor',
  'honour',
  'hour',
  'hors',
]);

/** Vowel characters for simple initial-letter check. */
const VOWELS = new Set(['a', 'e', 'i', 'o', 'u']);

/**
 * Returns the correct English indefinite article ("a" or "an") for the given word.
 *
 * Rules applied in order:
 * 1. Empty/non-ASCII → "a"
 * 2. "one"/"once" → "a" (pronounced with initial /w/)
 * 3. "uni-" prefix → "a" (pronounced with initial /juː/)
 * 4. "eu-" prefix → "a" (pronounced with initial /juː/)
 * 5. Silent-h words → "an"
 * 6. Vowel-initial → "an"
 * 7. Otherwise → "a"
 *
 * @param word - The word to determine the article for
 * @returns "a" or "an"
 */
export function getArticle(word: string): 'a' | 'an' {
  const lower = word.toLowerCase();

  // Empty string or non-ASCII first character
  if (lower.length === 0 || lower.charCodeAt(0) > 127) {
    return 'a';
  }

  // "one" and "once" are pronounced with initial /w/
  if (lower === 'one' || lower === 'once') {
    return 'a';
  }

  // "uni-" prefix pronounced /juːnɪ/
  if (lower.startsWith('uni')) {
    return 'a';
  }

  // "eu-" prefix pronounced /juː/
  if (lower.startsWith('eu')) {
    return 'a';
  }

  // Silent-h words
  const firstWord = lower.split(/\s/)[0] ?? lower;
  for (const silentH of SILENT_H_WORDS) {
    if (firstWord.startsWith(silentH)) {
      return 'an';
    }
  }

  // Simple vowel check
  const firstChar = lower[0];
  if (firstChar !== undefined && VOWELS.has(firstChar)) {
    return 'an';
  }

  return 'a';
}
