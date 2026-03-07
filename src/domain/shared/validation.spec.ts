/**
 * Tests for shared domain validation helpers.
 *
 * @module
 */

import { describe, expect, it } from 'vitest';

import { DomainError } from '../errors/DomainError.js';

import { requireMaxLength, requireNonBlank } from './validation.js';

describe('requireNonBlank', () => {
  it('does not throw for a non-blank string', () => {
    expect(() => requireNonBlank('hello', 'code')).not.toThrow();
  });

  it('throws DomainError for an empty string', () => {
    expect(() => requireNonBlank('', 'field_required')).toThrow(DomainError);
  });

  it('throws DomainError for a whitespace-only string', () => {
    expect(() => requireNonBlank('   ', 'field_required')).toThrow(DomainError);
  });

  it('throws DomainError for tabs and newlines only', () => {
    expect(() => requireNonBlank('\t\n', 'field_required')).toThrow(DomainError);
  });

  it('uses the provided error code', () => {
    try {
      requireNonBlank('', 'my_custom_code');
      expect.fail('should have thrown');
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(DomainError);
      expect((err as DomainError).code).toBe('my_custom_code');
    }
  });
});

describe('requireMaxLength', () => {
  it('does not throw when string length is within limit', () => {
    expect(() => requireMaxLength('abc', 5, 'code')).not.toThrow();
  });

  it('does not throw when string length equals limit', () => {
    expect(() => requireMaxLength('abcde', 5, 'code')).not.toThrow();
  });

  it('throws DomainError when string exceeds limit', () => {
    expect(() => requireMaxLength('abcdef', 5, 'too_long')).toThrow(DomainError);
  });

  it('uses the provided error code', () => {
    try {
      requireMaxLength('abcdef', 5, 'my_length_code');
      expect.fail('should have thrown');
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(DomainError);
      expect((err as DomainError).code).toBe('my_length_code');
    }
  });
});
