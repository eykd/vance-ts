/**
 * Tests for Result type helpers.
 *
 * @module
 */

import { describe, expect, it } from 'vitest';

import { err, ok } from './Result.js';

describe('ok', () => {
  it('creates a successful result', () => {
    const result = ok(42);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toBe(42);
    }
  });

  it('creates a successful result with a string value', () => {
    const result = ok('hello');

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toBe('hello');
    }
  });

  it('creates a successful result with an object value', () => {
    const obj = { id: '1', name: 'test' };
    const result = ok(obj);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toBe(obj);
    }
  });
});

describe('err', () => {
  it('creates a failed result with an Error', () => {
    const error = new Error('something went wrong');
    const result = err(error);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe(error);
    }
  });

  it('creates a failed result with a string error', () => {
    const result = err('bad_input');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('bad_input');
    }
  });

  it('creates a failed result with a custom error object', () => {
    const customError = { code: 'INVALID', field: 'title' };
    const result = err(customError);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toEqual(customError);
    }
  });
});
