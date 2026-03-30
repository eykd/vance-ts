/**
 * Unit tests for prestoplot application constants.
 *
 * @module
 */

import { describe, expect, it } from 'vitest';

import { GRAMMAR_KEY_PATTERN } from './constants.js';

describe('GRAMMAR_KEY_PATTERN', () => {
  it('matches valid lowercase keys starting with a letter', () => {
    expect(GRAMMAR_KEY_PATTERN.test('hello')).toBe(true);
    expect(GRAMMAR_KEY_PATTERN.test('crew-chatter')).toBe(true);
    expect(GRAMMAR_KEY_PATTERN.test('a0_b-c')).toBe(true);
    expect(GRAMMAR_KEY_PATTERN.test('abc123')).toBe(true);
  });

  it('rejects invalid keys', () => {
    expect(GRAMMAR_KEY_PATTERN.test('')).toBe(false);
    expect(GRAMMAR_KEY_PATTERN.test('0abc')).toBe(false);
    expect(GRAMMAR_KEY_PATTERN.test('Hello')).toBe(false);
    expect(GRAMMAR_KEY_PATTERN.test('a b')).toBe(false);
    expect(GRAMMAR_KEY_PATTERN.test('../etc')).toBe(false);
  });
});
