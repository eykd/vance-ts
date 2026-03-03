import { describe, expect, it } from 'vitest';

import { DomainError } from '../errors/DomainError.js';

import { Context } from './Context.js';

/** UUID v4 pattern. */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** ISO-8601 UTC timestamp pattern (ends with Z). */
const ISO_UTC_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

describe('Context.create', () => {
  it('generates a UUID id', () => {
    const ctx = Context.create('ws-1', 'computer');

    expect(ctx.id).toMatch(UUID_RE);
  });

  it('sets workspaceId and name from arguments', () => {
    const ctx = Context.create('ws-42', 'calls');

    expect(ctx.workspaceId).toBe('ws-42');
    expect(ctx.name).toBe('calls');
  });

  it('sets createdAt to a current ISO-8601 UTC timestamp', () => {
    const before = new Date().toISOString();
    const ctx = Context.create('ws-1', 'home');
    const after = new Date().toISOString();

    expect(ctx.createdAt).toMatch(ISO_UTC_RE);
    expect(ctx.createdAt >= before).toBe(true);
    expect(ctx.createdAt <= after).toBe(true);
  });

  it('does not include an updatedAt field', () => {
    const ctx = Context.create('ws-1', 'computer');

    expect(ctx).not.toHaveProperty('updatedAt');
  });

  it('generates a unique id on each call', () => {
    const a = Context.create('ws-1', 'computer');
    const b = Context.create('ws-1', 'computer');

    expect(a.id).not.toBe(b.id);
  });

  it('throws DomainError name_required when name is empty', () => {
    expect(() => Context.create('ws-1', '')).toThrow(DomainError);

    try {
      Context.create('ws-1', '');
    } catch (e) {
      expect((e as DomainError).code).toBe('name_required');
    }
  });

  it('throws DomainError name_too_long when name exceeds 100 chars', () => {
    expect(() => Context.create('ws-1', 'a'.repeat(101))).toThrow(DomainError);

    try {
      Context.create('ws-1', 'a'.repeat(101));
    } catch (e) {
      expect((e as DomainError).code).toBe('name_too_long');
    }
  });

  it('accepts a name of exactly 100 chars', () => {
    const ctx = Context.create('ws-1', 'a'.repeat(100));

    expect(ctx.name).toHaveLength(100);
  });

  it('accepts a name of exactly 1 char', () => {
    const ctx = Context.create('ws-1', 'X');

    expect(ctx.name).toBe('X');
  });
});

describe('Context.reconstitute', () => {
  it('hydrates a Context from a D1 row', () => {
    const row = {
      id: 'ctx-1',
      workspace_id: 'ws-1',
      name: 'computer',
      created_at: '2026-01-01T00:00:00.000Z',
    };

    const ctx = Context.reconstitute(row);

    expect(ctx).toEqual({
      id: 'ctx-1',
      workspaceId: 'ws-1',
      name: 'computer',
      createdAt: '2026-01-01T00:00:00.000Z',
    });
  });

  it('preserves all field values exactly as stored', () => {
    const row = {
      id: 'ctx-99',
      workspace_id: 'ws-99',
      name: 'errands',
      created_at: '2026-02-15T12:30:00.000Z',
    };

    const ctx = Context.reconstitute(row);

    expect(ctx.id).toBe('ctx-99');
    expect(ctx.workspaceId).toBe('ws-99');
    expect(ctx.name).toBe('errands');
    expect(ctx.createdAt).toBe('2026-02-15T12:30:00.000Z');
  });
});
