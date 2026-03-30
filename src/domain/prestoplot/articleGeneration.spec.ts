/**
 * Tests for getArticle — returns "a" or "an" based on the following word.
 *
 * @module domain/prestoplot/articleGeneration.spec
 */

import { describe, expect, it } from 'vitest';

import { getArticle } from './articleGeneration.js';

describe('getArticle', () => {
  describe('vowel-initial words → "an"', () => {
    it.each(['apple', 'elephant', 'igloo', 'orange', 'umbrella'])(
      'returns "an" for "%s"',
      (word) => {
        expect(getArticle(word)).toBe('an');
      }
    );
  });

  describe('consonant-initial words → "a"', () => {
    it.each(['banana', 'cat', 'dog', 'fish', 'grape', 'tree', 'zebra'])(
      'returns "a" for "%s"',
      (word) => {
        expect(getArticle(word)).toBe('a');
      }
    );
  });

  describe('silent-h words → "an"', () => {
    it.each(['hour', 'honest', 'honor', 'heir'])('returns "an" for "%s"', (word) => {
      expect(getArticle(word)).toBe('an');
    });
  });

  describe('aspirated-h words → "a"', () => {
    it.each(['house', 'happy', 'hero', 'hotel'])('returns "a" for "%s"', (word) => {
      expect(getArticle(word)).toBe('a');
    });
  });

  describe('uni- prefix → "a"', () => {
    it.each(['unicorn', 'universe', 'uniform', 'united', 'unique'])(
      'returns "a" for "%s"',
      (word) => {
        expect(getArticle(word)).toBe('a');
      }
    );
  });

  describe('eu- prefix → "a"', () => {
    it.each(['european', 'eulogy', 'euphoria'])('returns "a" for "%s"', (word) => {
      expect(getArticle(word)).toBe('a');
    });
  });

  describe('one/once → "a"', () => {
    it.each(['one', 'once'])('returns "a" for "%s"', (word) => {
      expect(getArticle(word)).toBe('a');
    });
  });

  describe('case insensitivity', () => {
    it('handles uppercase vowel-initial word', () => {
      expect(getArticle('Apple')).toBe('an');
    });

    it('handles uppercase consonant-initial word', () => {
      expect(getArticle('Banana')).toBe('a');
    });

    it('handles uppercase silent-h word', () => {
      expect(getArticle('Hour')).toBe('an');
    });

    it('handles uppercase uni- word', () => {
      expect(getArticle('Unicorn')).toBe('a');
    });
  });

  describe('non-ASCII fallback → "a"', () => {
    it('returns "a" for non-ASCII initial character', () => {
      expect(getArticle('über')).toBe('a');
    });

    it('returns "a" for Chinese character', () => {
      expect(getArticle('龙')).toBe('a');
    });

    it('returns "a" for emoji', () => {
      expect(getArticle('🎉party')).toBe('a');
    });
  });

  describe('edge cases', () => {
    it('returns "a" for empty string', () => {
      expect(getArticle('')).toBe('a');
    });

    it('handles single vowel character', () => {
      expect(getArticle('a')).toBe('an');
    });

    it('handles single consonant character', () => {
      expect(getArticle('b')).toBe('a');
    });
  });
});
