import { describe, expect, it } from 'vitest';

import { DomainError } from '../errors/DomainError.js';

import { Actor } from './Actor.js';

/** UUID v4 pattern. */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** ISO-8601 UTC timestamp pattern (ends with Z). */
const ISO_UTC_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

describe('Actor.createHuman', () => {
  it('generates a UUID id', () => {
    const actor = Actor.createHuman('ws-1', 'user-1');

    expect(actor.id).toMatch(UUID_RE);
  });

  it('sets workspaceId and userId from arguments', () => {
    const actor = Actor.createHuman('ws-42', 'user-99');

    expect(actor.workspaceId).toBe('ws-42');
    expect(actor.userId).toBe('user-99');
  });

  it('sets type to human', () => {
    const actor = Actor.createHuman('ws-1', 'user-1');

    expect(actor.type).toBe('human');
  });

  it('sets createdAt to a current ISO-8601 UTC timestamp', () => {
    const before = new Date().toISOString();
    const actor = Actor.createHuman('ws-1', 'user-1');
    const after = new Date().toISOString();

    expect(actor.createdAt).toMatch(ISO_UTC_RE);
    expect(actor.createdAt >= before).toBe(true);
    expect(actor.createdAt <= after).toBe(true);
  });

  it('generates a unique id on each call', () => {
    const a = Actor.createHuman('ws-1', 'user-1');
    const b = Actor.createHuman('ws-1', 'user-1');

    expect(a.id).not.toBe(b.id);
  });

  it('throws DomainError workspace_id_required when workspaceId is blank', () => {
    expect(() => Actor.createHuman('', 'user-1')).toThrow(DomainError);

    try {
      Actor.createHuman('', 'user-1');
    } catch (e) {
      expect((e as DomainError).code).toBe('workspace_id_required');
    }
  });

  it('throws DomainError workspace_id_required when workspaceId is whitespace-only', () => {
    expect(() => Actor.createHuman('   ', 'user-1')).toThrow(DomainError);

    try {
      Actor.createHuman('   ', 'user-1');
    } catch (e) {
      expect((e as DomainError).code).toBe('workspace_id_required');
    }
  });

  it('throws DomainError user_id_required when userId is blank', () => {
    expect(() => Actor.createHuman('ws-1', '')).toThrow(DomainError);

    try {
      Actor.createHuman('ws-1', '');
    } catch (e) {
      expect((e as DomainError).code).toBe('user_id_required');
    }
  });

  it('throws DomainError user_id_required when userId is whitespace-only', () => {
    expect(() => Actor.createHuman('ws-1', '   ')).toThrow(DomainError);

    try {
      Actor.createHuman('ws-1', '   ');
    } catch (e) {
      expect((e as DomainError).code).toBe('user_id_required');
    }
  });
});
