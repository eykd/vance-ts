/**
 * Unit tests for prestoplot storage utilities.
 *
 * @module
 */

import { describe, expect, it } from 'vitest';

import { StorageError } from '../../domain/prestoplot/errors.js';

import { wrapError } from './storageUtils.js';

describe('wrapError', () => {
  it('wraps an Error instance as a StorageError', () => {
    const cause = new Error('original');
    const result = wrapError('test_code', 'test message', cause);

    expect(result).toBeInstanceOf(StorageError);
    expect(result.code).toBe('test_code');
    expect(result.message).toBe('test message');
    expect(result.cause).toBe(cause);
  });

  it('wraps a non-Error value by converting to string', () => {
    const result = wrapError('test_code', 'test message', 'string cause');

    expect(result).toBeInstanceOf(StorageError);
    expect(result.code).toBe('test_code');
    expect(result.message).toBe('test message');
    expect(result.cause).toBeInstanceOf(Error);
    expect((result.cause as Error).message).toBe('string cause');
  });

  it('wraps a numeric cause by converting to string', () => {
    const result = wrapError('num_code', 'numeric cause', 42);

    expect(result).toBeInstanceOf(StorageError);
    expect(result.cause).toBeInstanceOf(Error);
    expect((result.cause as Error).message).toBe('42');
  });
});
