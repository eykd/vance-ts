/**
 * D1AuditEventRepository — Cloudflare D1 implementation of AuditEventRepository.
 *
 * Appends {@link AuditEvent} entities to the `audit_event` D1 table.
 * This is an append-only repository — no query or delete methods are defined.
 *
 * @module
 */

import type { AuditEvent } from '../../domain/entities/AuditEvent';
import type { AuditEventRepository } from '../../domain/interfaces/AuditEventRepository';

/**
 * D1-backed implementation of the {@link AuditEventRepository} port.
 *
 * Append-only: `save` and `saveBatch` only insert rows. Duplicate IDs will
 * throw a UNIQUE constraint error.
 */
export class D1AuditEventRepository implements AuditEventRepository {
  private readonly _db: D1Database;

  /**
   * Creates a new D1AuditEventRepository.
   *
   * @param db - The D1 database binding from the Cloudflare Workers environment.
   */
  constructor(db: D1Database) {
    this._db = db;
  }

  /**
   * Appends a single audit event to the log.
   *
   * @param event - The audit event to persist.
   * @returns Resolved promise on success.
   */
  async save(event: AuditEvent): Promise<void> {
    await this._db
      .prepare(
        `INSERT INTO audit_event (id, workspace_id, entity_type, entity_id, event_type, actor_id, payload, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        event.id,
        event.workspaceId,
        event.entityType,
        event.entityId,
        event.eventType,
        event.actorId,
        event.payload,
        event.createdAt
      )
      .run();
  }

  /**
   * Appends multiple audit events to the log in a single batch operation.
   *
   * @param events - The audit events to persist.
   * @returns Resolved promise on success.
   */
  async saveBatch(events: AuditEvent[]): Promise<void> {
    if (events.length === 0) return;
    const statements = events.map((event) =>
      this._db
        .prepare(
          `INSERT INTO audit_event (id, workspace_id, entity_type, entity_id, event_type, actor_id, payload, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(
          event.id,
          event.workspaceId,
          event.entityType,
          event.entityId,
          event.eventType,
          event.actorId,
          event.payload,
          event.createdAt
        )
    );
    await this._db.batch(statements);
  }
}
