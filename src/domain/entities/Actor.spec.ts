/**
 * Actor entity unit tests.
 *
 * @module
 */

import { describe, expect, it } from 'vitest';

import { DomainError } from '../errors/DomainError.js';

import { Actor } from './Actor.js';

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

describe('Actor.createHuman', () => {
  it('generates a UUID id', () => {
    const actor = unwrap(Actor.createHuman('ws-1', 'user-1'));

    expect(actor.id).toMatch(UUID_RE);
  });

  it('sets workspaceId and userId from arguments', () => {
    const actor = unwrap(Actor.createHuman('ws-42', 'user-99'));

    expect(actor.workspaceId).toBe('ws-42');
    expect(actor.userId).toBe('user-99');
  });

  it('sets type to human', () => {
    const actor = unwrap(Actor.createHuman('ws-1', 'user-1'));

    expect(actor.type).toBe('human');
  });

  it('sets createdAt to a current ISO-8601 UTC timestamp', () => {
    const before = new Date().toISOString();
    const actor = unwrap(Actor.createHuman('ws-1', 'user-1'));
    const after = new Date().toISOString();

    expect(actor.createdAt).toMatch(ISO_UTC_RE);
    expect(actor.createdAt >= before).toBe(true);
    expect(actor.createdAt <= after).toBe(true);
  });

  it('generates a unique id on each call', () => {
    const a = unwrap(Actor.createHuman('ws-1', 'user-1'));
    const b = unwrap(Actor.createHuman('ws-1', 'user-1'));

    expect(a.id).not.toBe(b.id);
  });

  it('returns failure with workspace_id_required when workspaceId is blank', () => {
    const result = Actor.createHuman('', 'user-1');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(DomainError);
      expect(result.error.code).toBe('workspace_id_required');
    }
  });

  it('returns failure with workspace_id_required when workspaceId is whitespace-only', () => {
    const result = Actor.createHuman('   ', 'user-1');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(DomainError);
      expect(result.error.code).toBe('workspace_id_required');
    }
  });

  it('returns failure with user_id_required when userId is blank', () => {
    const result = Actor.createHuman('ws-1', '');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(DomainError);
      expect(result.error.code).toBe('user_id_required');
    }
  });

  it('returns failure with user_id_required when userId is whitespace-only', () => {
    const result = Actor.createHuman('ws-1', '   ');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(DomainError);
      expect(result.error.code).toBe('user_id_required');
    }
  });
});
