import { describe, expect, it } from 'vitest';

import { DomainError } from '../errors/DomainError.js';

import { Area } from './Area.js';

/** UUID v4 pattern. */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** ISO-8601 UTC timestamp pattern (ends with Z). */
const ISO_UTC_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

describe('Area.create', () => {
  it('generates a UUID id', () => {
    const area = Area.create('ws-1', 'Work');

    expect(area.id).toMatch(UUID_RE);
  });

  it('sets status to active', () => {
    const area = Area.create('ws-1', 'Work');

    expect(area.status).toBe('active');
  });

  it('sets workspaceId and name from arguments', () => {
    const area = Area.create('ws-42', 'Personal');

    expect(area.workspaceId).toBe('ws-42');
    expect(area.name).toBe('Personal');
  });

  it('sets createdAt and updatedAt to current ISO-8601 UTC timestamps', () => {
    const before = new Date().toISOString();
    const area = Area.create('ws-1', 'Work');
    const after = new Date().toISOString();

    expect(area.createdAt).toMatch(ISO_UTC_RE);
    expect(area.updatedAt).toMatch(ISO_UTC_RE);
    expect(area.createdAt >= before).toBe(true);
    expect(area.createdAt <= after).toBe(true);
    expect(area.updatedAt >= before).toBe(true);
    expect(area.updatedAt <= after).toBe(true);
  });

  it('generates a unique id on each call', () => {
    const a = Area.create('ws-1', 'Work');
    const b = Area.create('ws-1', 'Work');

    expect(a.id).not.toBe(b.id);
  });

  it('throws DomainError name_required when name is empty', () => {
    expect(() => Area.create('ws-1', '')).toThrow(DomainError);

    try {
      Area.create('ws-1', '');
    } catch (e) {
      expect((e as DomainError).code).toBe('name_required');
    }
  });

  it('throws DomainError name_too_long when name exceeds 100 chars', () => {
    expect(() => Area.create('ws-1', 'a'.repeat(101))).toThrow(DomainError);

    try {
      Area.create('ws-1', 'a'.repeat(101));
    } catch (e) {
      expect((e as DomainError).code).toBe('name_too_long');
    }
  });

  it('accepts a name of exactly 100 chars', () => {
    const area = Area.create('ws-1', 'a'.repeat(100));

    expect(area.name).toHaveLength(100);
  });

  it('accepts a name of exactly 1 char', () => {
    const area = Area.create('ws-1', 'X');

    expect(area.name).toBe('X');
  });

  it('throws DomainError name_required when name is whitespace-only', () => {
    expect(() => Area.create('ws-1', '   ')).toThrow(DomainError);

    try {
      Area.create('ws-1', '   ');
    } catch (e) {
      expect((e as DomainError).code).toBe('name_required');
    }
  });

  it('throws DomainError workspace_id_required when workspaceId is blank', () => {
    expect(() => Area.create('', 'Work')).toThrow(DomainError);

    try {
      Area.create('', 'Work');
    } catch (e) {
      expect((e as DomainError).code).toBe('workspace_id_required');
    }
  });

  it('throws DomainError workspace_id_required when workspaceId is whitespace-only', () => {
    expect(() => Area.create('   ', 'Work')).toThrow(DomainError);

    try {
      Area.create('   ', 'Work');
    } catch (e) {
      expect((e as DomainError).code).toBe('workspace_id_required');
    }
  });
});

describe('Area.archive', () => {
  it('returns a new Area with status archived', () => {
    const area = Area.create('ws-1', 'Work');
    const archived = Area.archive(area);

    expect(archived.status).toBe('archived');
  });

  it('preserves id, workspaceId, name, and createdAt', () => {
    const area = Area.create('ws-1', 'Work');
    const archived = Area.archive(area);

    expect(archived.id).toBe(area.id);
    expect(archived.workspaceId).toBe(area.workspaceId);
    expect(archived.name).toBe(area.name);
    expect(archived.createdAt).toBe(area.createdAt);
  });

  it('sets updatedAt to the current ISO-8601 UTC timestamp', () => {
    const area = Area.create('ws-1', 'Work');
    const before = new Date().toISOString();
    const archived = Area.archive(area);
    const after = new Date().toISOString();

    expect(archived.updatedAt).toMatch(ISO_UTC_RE);
    expect(archived.updatedAt >= before).toBe(true);
    expect(archived.updatedAt <= after).toBe(true);
  });

  it('throws DomainError already_archived when already archived', () => {
    const area = Area.create('ws-1', 'Work');
    const archived = Area.archive(area);

    expect(() => Area.archive(archived)).toThrow(DomainError);

    try {
      Area.archive(archived);
    } catch (e) {
      expect((e as DomainError).code).toBe('already_archived');
    }
  });
});
