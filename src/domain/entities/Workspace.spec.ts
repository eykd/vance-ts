/**
 * Workspace entity unit tests.
 *
 * @module
 */

import { describe, expect, it } from 'vitest';

import { DomainError } from '../errors/DomainError.js';

import { Workspace } from './Workspace.js';

/** UUID v4 pattern. */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** ISO-8601 UTC timestamp pattern (ends with Z). */
const ISO_UTC_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

/**
 * Helper to unwrap a successful Result or fail the test.
 *
 * @param result - The Result to unwrap.
 * @returns The success value.
 */
function unwrap<T>(
  result: { success: true; value: T } | { success: false; error: DomainError }
): T {
  if (!result.success) {
    throw new Error(`Unexpected failure: ${result.error.code}`);
  }
  return result.value;
}

describe('Workspace.create', () => {
  it('generates a UUID id', () => {
    const ws = unwrap(Workspace.create('user-1'));

    expect(ws.id).toMatch(UUID_RE);
  });

  it('sets userId from argument', () => {
    const ws = unwrap(Workspace.create('user-42'));

    expect(ws.userId).toBe('user-42');
  });

  it('sets createdAt and updatedAt to current ISO-8601 UTC timestamps', () => {
    const before = new Date().toISOString();
    const ws = unwrap(Workspace.create('user-1'));
    const after = new Date().toISOString();

    expect(ws.createdAt).toMatch(ISO_UTC_RE);
    expect(ws.updatedAt).toMatch(ISO_UTC_RE);
    expect(ws.createdAt >= before).toBe(true);
    expect(ws.createdAt <= after).toBe(true);
    expect(ws.updatedAt >= before).toBe(true);
    expect(ws.updatedAt <= after).toBe(true);
  });

  it('sets createdAt and updatedAt to the same value', () => {
    const ws = unwrap(Workspace.create('user-1'));

    expect(ws.createdAt).toBe(ws.updatedAt);
  });

  it('generates a unique id on each call', () => {
    const a = unwrap(Workspace.create('user-1'));
    const b = unwrap(Workspace.create('user-1'));

    expect(a.id).not.toBe(b.id);
  });

  it('returns failure with user_id_required when userId is empty', () => {
    const result = Workspace.create('');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(DomainError);
      expect(result.error.code).toBe('user_id_required');
    }
  });

  it('returns failure with user_id_required when userId is whitespace-only', () => {
    const result = Workspace.create('   ');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(DomainError);
      expect(result.error.code).toBe('user_id_required');
    }
  });
});
