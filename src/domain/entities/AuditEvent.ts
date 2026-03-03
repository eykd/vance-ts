/**
 * AuditEvent entity.
 *
 * Immutable, append-only record of every state-changing mutation. One event
 * is recorded per affected entity per mutation. The `payload` field stores a
 * JSON snapshot of the entity state at the time of the event.
 *
 * @module
 */

/**
 * AuditEvent entity — an immutable, append-only record of a domain mutation.
 *
 * Constructed only via the `record` factory. No updates or deletes are ever
 * performed on audit events.
 */
export interface AuditEvent {
  /** Unique identifier (UUID). */
  readonly id: string;
  /** FK → `workspace.id`. The workspace this event belongs to. */
  readonly workspaceId: string;
  /** Type of the affected entity (e.g. `'inbox_item'`, `'action'`). */
  readonly entityType: string;
  /** UUID of the affected entity. */
  readonly entityId: string;
  /** Event type string (e.g. `'action.created'`, `'workspace.provisioned'`). */
  readonly eventType: string;
  /** FK → `actor.id`. The actor who caused this event. */
  readonly actorId: string;
  /** JSON snapshot of the entity state at the time of the event. */
  readonly payload: string;
  /** ISO-8601 UTC timestamp of event creation. */
  readonly createdAt: string;
}

/** Raw D1 row shape for the `audit_event` table. */
export interface AuditEventRow {
  id: string;
  workspace_id: string;
  entity_type: string;
  entity_id: string;
  event_type: string;
  actor_id: string;
  payload: string;
  created_at: string;
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace AuditEvent {
  /**
   * Records a new audit event, generating a unique ID and current timestamp.
   *
   * This is the only way to create a new AuditEvent. No update or delete
   * operations exist — audit events are append-only.
   *
   * @param workspaceId - FK → `workspace.id`.
   * @param entityType - Type of the affected entity (e.g. `'inbox_item'`).
   * @param entityId - UUID of the affected entity.
   * @param eventType - Event type string (e.g. `'action.created'`).
   * @param actorId - FK → `actor.id`.
   * @param payload - JSON snapshot of the entity state at event time.
   * @returns A new immutable AuditEvent.
   */
  export function record(
    workspaceId: string,
    entityType: string,
    entityId: string,
    eventType: string,
    actorId: string,
    payload: string,
  ): AuditEvent {
    return {
      id: crypto.randomUUID(),
      workspaceId,
      entityType,
      entityId,
      eventType,
      actorId,
      payload,
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Hydrates an AuditEvent from a raw D1 database row.
   *
   * Bypasses validation — the data is assumed valid as it was written by this
   * application.
   *
   * @param row - Raw D1 row from the `audit_event` table.
   * @returns The hydrated AuditEvent domain entity.
   */
  export function reconstitute(row: AuditEventRow): AuditEvent {
    return {
      id: row.id,
      workspaceId: row.workspace_id,
      entityType: row.entity_type,
      entityId: row.entity_id,
      eventType: row.event_type,
      actorId: row.actor_id,
      payload: row.payload,
      createdAt: row.created_at,
    };
  }
}
