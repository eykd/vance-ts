/**
 * Context entity unit tests.
 *
 * @module
 */

import { describe, expect, it } from 'vitest';

import { DomainError } from '../errors/DomainError.js';

import { Context } from './Context.js';

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

describe('Context.create', () => {
  it('generates a UUID id', () => {
    const ctx = unwrap(Context.create('ws-1', 'computer'));

    expect(ctx.id).toMatch(UUID_RE);
  });

  it('sets workspaceId and name from arguments', () => {
    const ctx = unwrap(Context.create('ws-42', 'calls'));

    expect(ctx.workspaceId).toBe('ws-42');
    expect(ctx.name).toBe('calls');
  });

  it('sets createdAt to a current ISO-8601 UTC timestamp', () => {
    const before = new Date().toISOString();
    const ctx = unwrap(Context.create('ws-1', 'home'));
    const after = new Date().toISOString();

    expect(ctx.createdAt).toMatch(ISO_UTC_RE);
    expect(ctx.createdAt >= before).toBe(true);
    expect(ctx.createdAt <= after).toBe(true);
  });

  it('does not include an updatedAt field', () => {
    const ctx = unwrap(Context.create('ws-1', 'computer'));

    expect(ctx).not.toHaveProperty('updatedAt');
  });

  it('generates a unique id on each call', () => {
    const a = unwrap(Context.create('ws-1', 'computer'));
    const b = unwrap(Context.create('ws-1', 'computer'));

    expect(a.id).not.toBe(b.id);
  });

  it('returns failure with name_required when name is empty', () => {
    const result = Context.create('ws-1', '');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(DomainError);
      expect(result.error.code).toBe('name_required');
    }
  });

  it('returns failure with name_too_long when name exceeds 100 chars', () => {
    const result = Context.create('ws-1', 'a'.repeat(101));

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(DomainError);
      expect(result.error.code).toBe('name_too_long');
    }
  });

  it('accepts a name of exactly 100 chars', () => {
    const ctx = unwrap(Context.create('ws-1', 'a'.repeat(100)));

    expect(ctx.name).toHaveLength(100);
  });

  it('accepts a name of exactly 1 char', () => {
    const ctx = unwrap(Context.create('ws-1', 'X'));

    expect(ctx.name).toBe('X');
  });

  it('returns failure with name_required when name is whitespace-only', () => {
    const result = Context.create('ws-1', '   ');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(DomainError);
      expect(result.error.code).toBe('name_required');
    }
  });

  it('returns failure with workspace_id_required when workspaceId is blank', () => {
    const result = Context.create('', 'computer');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(DomainError);
      expect(result.error.code).toBe('workspace_id_required');
    }
  });

  it('returns failure with workspace_id_required when workspaceId is whitespace-only', () => {
    const result = Context.create('   ', 'computer');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(DomainError);
      expect(result.error.code).toBe('workspace_id_required');
    }
  });
});
