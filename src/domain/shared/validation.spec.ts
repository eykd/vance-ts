/**
 * Tests for shared domain validation helpers.
 *
 * @module
 */

import { describe, expect, it } from 'vitest';

import { DomainError } from '../errors/DomainError.js';

import { requireMaxLength, requireNonBlank } from './validation.js';

describe('requireNonBlank', () => {
  it('returns ok for a non-blank string', () => {
    const result = requireNonBlank('hello', 'code');

    expect(result.success).toBe(true);
  });

  it('returns failure for an empty string', () => {
    const result = requireNonBlank('', 'field_required');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(DomainError);
    }
  });

  it('returns failure for a whitespace-only string', () => {
    const result = requireNonBlank('   ', 'field_required');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(DomainError);
    }
  });

  it('returns failure for tabs and newlines only', () => {
    const result = requireNonBlank('\t\n', 'field_required');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(DomainError);
    }
  });

  it('uses the provided error code', () => {
    const result = requireNonBlank('', 'my_custom_code');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(DomainError);
      expect(result.error.code).toBe('my_custom_code');
    }
  });
});

describe('requireMaxLength', () => {
  it('returns ok when string length is within limit', () => {
    const result = requireMaxLength('abc', 5, 'code');

    expect(result.success).toBe(true);
  });

  it('returns ok when string length equals limit', () => {
    const result = requireMaxLength('abcde', 5, 'code');

    expect(result.success).toBe(true);
  });

  it('returns failure when string exceeds limit', () => {
    const result = requireMaxLength('abcdef', 5, 'too_long');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(DomainError);
    }
  });

  it('uses the provided error code', () => {
    const result = requireMaxLength('abcdef', 5, 'my_length_code');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(DomainError);
      expect(result.error.code).toBe('my_length_code');
    }
  });
});
