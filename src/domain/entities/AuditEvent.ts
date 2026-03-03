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
