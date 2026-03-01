import { describe, expect, it } from 'vitest';

import { timingSafeStringEqual } from './timingSafeEqual.js';

describe('timingSafeStringEqual', () => {
  it('returns true for two identical strings', () => {
    const token = 'a'.repeat(64);
    expect(timingSafeStringEqual(token, token)).toBe(true);
  });

  it('returns true for equal strings passed as separate values', () => {
    const a = 'deadbeef'.repeat(8);
    const b = 'deadbeef'.repeat(8);
    expect(timingSafeStringEqual(a, b)).toBe(true);
  });

  it('returns false for strings that differ in content but share the same length', () => {
    const a = 'a'.repeat(64);
    const b = 'b'.repeat(64);
    expect(timingSafeStringEqual(a, b)).toBe(false);
  });

  it('returns false when the first string is shorter', () => {
    expect(timingSafeStringEqual('abc', 'abcd')).toBe(false);
  });

  it('returns false when the second string is shorter', () => {
    expect(timingSafeStringEqual('abcd', 'abc')).toBe(false);
  });

  it('returns true for two empty strings', () => {
    expect(timingSafeStringEqual('', '')).toBe(true);
  });

  it('returns false for one empty and one non-empty string', () => {
    expect(timingSafeStringEqual('', 'a')).toBe(false);
  });

  it('returns false for strings that differ only at the last character', () => {
    const a = 'a'.repeat(63) + 'b';
    const b = 'a'.repeat(63) + 'c';
    expect(timingSafeStringEqual(a, b)).toBe(false);
  });
});
