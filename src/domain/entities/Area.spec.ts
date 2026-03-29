/**
 * Area entity unit tests.
 *
 * @module
 */

import { describe, expect, it } from 'vitest';

import { DomainError } from '../errors/DomainError.js';

import { Area } from './Area.js';

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

describe('Area.create', () => {
  it('generates a UUID id', () => {
    const area = unwrap(Area.create('ws-1', 'Work'));

    expect(area.id).toMatch(UUID_RE);
  });

  it('sets status to active', () => {
    const area = unwrap(Area.create('ws-1', 'Work'));

    expect(area.status).toBe('active');
  });

  it('sets workspaceId and name from arguments', () => {
    const area = unwrap(Area.create('ws-42', 'Personal'));

    expect(area.workspaceId).toBe('ws-42');
    expect(area.name).toBe('Personal');
  });

  it('sets createdAt and updatedAt to current ISO-8601 UTC timestamps', () => {
    const before = new Date().toISOString();
    const area = unwrap(Area.create('ws-1', 'Work'));
    const after = new Date().toISOString();

    expect(area.createdAt).toMatch(ISO_UTC_RE);
    expect(area.updatedAt).toMatch(ISO_UTC_RE);
    expect(area.createdAt >= before).toBe(true);
    expect(area.createdAt <= after).toBe(true);
    expect(area.updatedAt >= before).toBe(true);
    expect(area.updatedAt <= after).toBe(true);
  });

  it('generates a unique id on each call', () => {
    const a = unwrap(Area.create('ws-1', 'Work'));
    const b = unwrap(Area.create('ws-1', 'Work'));

    expect(a.id).not.toBe(b.id);
  });

  it('returns failure with name_required when name is empty', () => {
    const result = Area.create('ws-1', '');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(DomainError);
      expect(result.error.code).toBe('name_required');
    }
  });

  it('returns failure with name_too_long when name exceeds 100 chars', () => {
    const result = Area.create('ws-1', 'a'.repeat(101));

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(DomainError);
      expect(result.error.code).toBe('name_too_long');
    }
  });

  it('accepts a name of exactly 100 chars', () => {
    const area = unwrap(Area.create('ws-1', 'a'.repeat(100)));

    expect(area.name).toHaveLength(100);
  });

  it('accepts a name of exactly 1 char', () => {
    const area = unwrap(Area.create('ws-1', 'X'));

    expect(area.name).toBe('X');
  });

  it('returns failure with name_required when name is whitespace-only', () => {
    const result = Area.create('ws-1', '   ');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(DomainError);
      expect(result.error.code).toBe('name_required');
    }
  });

  it('returns failure with workspace_id_required when workspaceId is blank', () => {
    const result = Area.create('', 'Work');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(DomainError);
      expect(result.error.code).toBe('workspace_id_required');
    }
  });

  it('returns failure with workspace_id_required when workspaceId is whitespace-only', () => {
    const result = Area.create('   ', 'Work');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(DomainError);
      expect(result.error.code).toBe('workspace_id_required');
    }
  });
});

describe('Area.archive', () => {
  it('returns a new Area with status archived', () => {
    const area = unwrap(Area.create('ws-1', 'Work'));
    const archived = unwrap(Area.archive(area));

    expect(archived.status).toBe('archived');
  });

  it('preserves id, workspaceId, name, and createdAt', () => {
    const area = unwrap(Area.create('ws-1', 'Work'));
    const archived = unwrap(Area.archive(area));

    expect(archived.id).toBe(area.id);
    expect(archived.workspaceId).toBe(area.workspaceId);
    expect(archived.name).toBe(area.name);
    expect(archived.createdAt).toBe(area.createdAt);
  });

  it('sets updatedAt to the current ISO-8601 UTC timestamp', () => {
    const area = unwrap(Area.create('ws-1', 'Work'));
    const before = new Date().toISOString();
    const archived = unwrap(Area.archive(area));
    const after = new Date().toISOString();

    expect(archived.updatedAt).toMatch(ISO_UTC_RE);
    expect(archived.updatedAt >= before).toBe(true);
    expect(archived.updatedAt <= after).toBe(true);
  });

  it('returns failure with already_archived when already archived', () => {
    const area = unwrap(Area.create('ws-1', 'Work'));
    const archived = unwrap(Area.archive(area));
    const result = Area.archive(archived);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(DomainError);
      expect(result.error.code).toBe('already_archived');
    }
  });
});
