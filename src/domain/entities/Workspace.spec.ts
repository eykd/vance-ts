import { describe, expect, it } from 'vitest';

import { Workspace } from './Workspace.js';

/** UUID v4 pattern. */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** ISO-8601 UTC timestamp pattern (ends with Z). */
const ISO_UTC_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

describe('Workspace.create', () => {
  it('generates a UUID id', () => {
    const ws = Workspace.create('user-1');

    expect(ws.id).toMatch(UUID_RE);
  });

  it('sets userId from argument', () => {
    const ws = Workspace.create('user-42');

    expect(ws.userId).toBe('user-42');
  });

  it('sets createdAt and updatedAt to current ISO-8601 UTC timestamps', () => {
    const before = new Date().toISOString();
    const ws = Workspace.create('user-1');
    const after = new Date().toISOString();

    expect(ws.createdAt).toMatch(ISO_UTC_RE);
    expect(ws.updatedAt).toMatch(ISO_UTC_RE);
    expect(ws.createdAt >= before).toBe(true);
    expect(ws.createdAt <= after).toBe(true);
    expect(ws.updatedAt >= before).toBe(true);
    expect(ws.updatedAt <= after).toBe(true);
  });

  it('sets createdAt and updatedAt to the same value', () => {
    const ws = Workspace.create('user-1');

    expect(ws.createdAt).toBe(ws.updatedAt);
  });

  it('generates a unique id on each call', () => {
    const a = Workspace.create('user-1');
    const b = Workspace.create('user-1');

    expect(a.id).not.toBe(b.id);
  });
});

describe('Workspace.reconstitute', () => {
  it('hydrates a Workspace from a D1 row', () => {
    const row = {
      id: 'ws-1',
      user_id: 'user-1',
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-02T00:00:00.000Z',
    };

    const ws = Workspace.reconstitute(row);

    expect(ws).toEqual({
      id: 'ws-1',
      userId: 'user-1',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
    });
  });

  it('maps snake_case columns to camelCase fields', () => {
    const row = {
      id: 'ws-99',
      user_id: 'user-99',
      created_at: '2026-03-01T12:00:00.000Z',
      updated_at: '2026-03-02T12:00:00.000Z',
    };

    const ws = Workspace.reconstitute(row);

    expect(ws.userId).toBe('user-99');
    expect(ws.createdAt).toBe('2026-03-01T12:00:00.000Z');
    expect(ws.updatedAt).toBe('2026-03-02T12:00:00.000Z');
  });
});
