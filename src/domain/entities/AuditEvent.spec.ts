/**
 * AuditEvent entity unit tests.
 *
 * @module
 */

import { describe, expect, it } from 'vitest';

import { DomainError } from '../errors/DomainError.js';

import { AuditEvent } from './AuditEvent';

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

describe('AuditEvent.record', () => {
  it('creates an AuditEvent with a generated UUID id', () => {
    const event = unwrap(
      AuditEvent.record('ws-1', 'inbox_item', 'item-1', 'inbox_item.captured', 'actor-1', '{}')
    );

    expect(event.id).toMatch(UUID_RE);
  });

  it('creates an AuditEvent with a current ISO-8601 UTC createdAt', () => {
    const before = new Date().toISOString();
    const event = unwrap(
      AuditEvent.record(
        'ws-1',
        'action',
        'action-1',
        'action.created',
        'actor-1',
        '{"status":"ready"}'
      )
    );
    const after = new Date().toISOString();

    expect(event.createdAt).toMatch(ISO_UTC_RE);
    expect(event.createdAt >= before).toBe(true);
    expect(event.createdAt <= after).toBe(true);
  });

  it('passes all provided fields through unchanged', () => {
    const event = unwrap(
      AuditEvent.record(
        'ws-abc',
        'workspace',
        'entity-xyz',
        'workspace.provisioned',
        'actor-xyz',
        '{"userId":"u-1"}'
      )
    );

    expect(event.workspaceId).toBe('ws-abc');
    expect(event.entityType).toBe('workspace');
    expect(event.entityId).toBe('entity-xyz');
    expect(event.eventType).toBe('workspace.provisioned');
    expect(event.actorId).toBe('actor-xyz');
    expect(event.payload).toBe('{"userId":"u-1"}');
  });

  it('generates a unique id on each call', () => {
    const a = unwrap(
      AuditEvent.record('ws-1', 'action', 'e-1', 'action.activated', 'actor-1', '{}')
    );
    const b = unwrap(
      AuditEvent.record('ws-1', 'action', 'e-1', 'action.activated', 'actor-1', '{}')
    );

    expect(a.id).not.toBe(b.id);
  });

  it('returns failure with workspace_id_required when workspaceId is blank', () => {
    const result = AuditEvent.record('', 'action', 'e-1', 'action.created', 'actor-1', '{}');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(DomainError);
      expect(result.error.code).toBe('workspace_id_required');
    }
  });

  it('returns failure with entity_id_required when entityId is blank', () => {
    const result = AuditEvent.record('ws-1', 'action', '', 'action.created', 'actor-1', '{}');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(DomainError);
      expect(result.error.code).toBe('entity_id_required');
    }
  });

  it('returns failure with actor_id_required when actorId is blank', () => {
    const result = AuditEvent.record('ws-1', 'action', 'e-1', 'action.created', '', '{}');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(DomainError);
      expect(result.error.code).toBe('actor_id_required');
    }
  });

  it('returns failure with payload_required when payload is blank', () => {
    const result = AuditEvent.record('ws-1', 'action', 'e-1', 'action.created', 'actor-1', '');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(DomainError);
      expect(result.error.code).toBe('payload_required');
    }
  });
});
