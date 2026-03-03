import { describe, expect, it } from 'vitest';

import { AuditEvent } from './AuditEvent';

/** UUID v4 pattern. */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** ISO-8601 UTC timestamp pattern (ends with Z). */
const ISO_UTC_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

describe('AuditEvent.record', () => {
  it('creates an AuditEvent with a generated UUID id', () => {
    const event = AuditEvent.record(
      'ws-1',
      'inbox_item',
      'item-1',
      'inbox_item.created',
      'actor-1',
      '{}',
    );

    expect(event.id).toMatch(UUID_RE);
  });

  it('creates an AuditEvent with a current ISO-8601 UTC createdAt', () => {
    const before = new Date().toISOString();
    const event = AuditEvent.record(
      'ws-1',
      'action',
      'action-1',
      'action.created',
      'actor-1',
      '{"status":"ready"}',
    );
    const after = new Date().toISOString();

    expect(event.createdAt).toMatch(ISO_UTC_RE);
    expect(event.createdAt >= before).toBe(true);
    expect(event.createdAt <= after).toBe(true);
  });

  it('passes all provided fields through unchanged', () => {
    const event = AuditEvent.record(
      'ws-abc',
      'workspace',
      'entity-xyz',
      'workspace.provisioned',
      'actor-xyz',
      '{"userId":"u-1"}',
    );

    expect(event.workspaceId).toBe('ws-abc');
    expect(event.entityType).toBe('workspace');
    expect(event.entityId).toBe('entity-xyz');
    expect(event.eventType).toBe('workspace.provisioned');
    expect(event.actorId).toBe('actor-xyz');
    expect(event.payload).toBe('{"userId":"u-1"}');
  });

  it('generates a unique id on each call', () => {
    const a = AuditEvent.record('ws-1', 'action', 'e-1', 'action.activated', 'actor-1', '{}');
    const b = AuditEvent.record('ws-1', 'action', 'e-1', 'action.activated', 'actor-1', '{}');

    expect(a.id).not.toBe(b.id);
  });
});

describe('AuditEvent.reconstitute', () => {
  it('hydrates an AuditEvent from a D1 row', () => {
    const row = {
      id: 'audit-1',
      workspace_id: 'ws-1',
      entity_type: 'inbox_item',
      entity_id: 'item-1',
      event_type: 'inbox_item.clarified',
      actor_id: 'actor-1',
      payload: '{"status":"clarified"}',
      created_at: '2026-03-01T10:00:00.000Z',
    };

    const event = AuditEvent.reconstitute(row);

    expect(event.id).toBe('audit-1');
    expect(event.workspaceId).toBe('ws-1');
    expect(event.entityType).toBe('inbox_item');
    expect(event.entityId).toBe('item-1');
    expect(event.eventType).toBe('inbox_item.clarified');
    expect(event.actorId).toBe('actor-1');
    expect(event.payload).toBe('{"status":"clarified"}');
    expect(event.createdAt).toBe('2026-03-01T10:00:00.000Z');
  });

  it('preserves all field values exactly as stored', () => {
    const row = {
      id: 'audit-99',
      workspace_id: 'ws-99',
      entity_type: 'action',
      entity_id: 'action-99',
      event_type: 'action.completed',
      actor_id: 'actor-99',
      payload: '{"status":"done","title":"Buy milk"}',
      created_at: '2026-01-15T08:30:00.000Z',
    };

    const event = AuditEvent.reconstitute(row);

    expect(event).toEqual({
      id: 'audit-99',
      workspaceId: 'ws-99',
      entityType: 'action',
      entityId: 'action-99',
      eventType: 'action.completed',
      actorId: 'actor-99',
      payload: '{"status":"done","title":"Buy milk"}',
      createdAt: '2026-01-15T08:30:00.000Z',
    });
  });
});
