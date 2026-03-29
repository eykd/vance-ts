/**
 * ClarifyInboxItemD1BatchAdapter — D1 batch transport for inbox-item clarification.
 *
 * Implements {@link ClarifyInboxItemBatchPort} as a single atomic D1 batch call.
 * Statements are ordered to satisfy foreign-key constraints:
 * action (INSERT) → inbox_item (UPDATE) → audit_events (INSERT).
 *
 * All values use parameterized statements — no string interpolation.
 *
 * @module
 */

import type { D1Database } from '@cloudflare/workers-types';

import type { Action } from '../domain/entities/Action.js';
import type { AuditEvent } from '../domain/entities/AuditEvent.js';
import type { InboxItem } from '../domain/entities/InboxItem.js';
import type { ClarifyInboxItemBatchPort } from '../domain/interfaces/ClarifyInboxItemBatchPort.js';

/**
 * Infrastructure adapter that persists the inbox-item clarification payload
 * via a single atomic D1 batch call.
 *
 * Constructed with a bound `D1Database` so the {@link ClarifyInboxItemBatchPort}
 * interface is satisfied without passing `db` at call-site.
 */
export class ClarifyInboxItemD1BatchAdapter implements ClarifyInboxItemBatchPort {
  /** The D1 database binding to use for batch persistence. */
  private readonly _db: D1Database;

  /**
   * Creates a new ClarifyInboxItemD1BatchAdapter.
   *
   * @param db - The raw D1 database binding.
   */
  constructor(db: D1Database) {
    this._db = db;
  }

  /**
   * Atomically persists the clarification payload via a single D1 batch.
   *
   * Statements are ordered to satisfy foreign-key constraints:
   * 1. action (INSERT — new entity, FK → workspace)
   * 2. inbox_item (UPDATE — set clarified status + references)
   * 3. audit_events (INSERT — FK → workspace, actor)
   *
   * @param inboxItem - The updated inbox item (status = clarified).
   * @param action - The newly created action entity.
   * @param auditEvents - The audit events to persist (may be empty).
   * @returns Resolved promise when the batch succeeds.
   */
  async clarifyBatch(
    inboxItem: InboxItem,
    action: Action,
    auditEvents: AuditEvent[]
  ): Promise<void> {
    const statements = [
      this._db
        .prepare(
          `INSERT INTO action (id, workspace_id, created_by_actor_id, title, description, status, area_id, context_id, project_id, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET
             title = excluded.title,
             description = excluded.description,
             status = excluded.status,
             updated_at = excluded.updated_at`
        )
        .bind(
          action.id,
          action.workspaceId,
          action.createdByActorId,
          action.title,
          action.description,
          action.status,
          action.areaId,
          action.contextId,
          action.projectId,
          action.createdAt,
          action.updatedAt
        ),

      this._db
        .prepare(
          `INSERT INTO inbox_item (id, workspace_id, title, description, status, created_at, updated_at, clarified_into_type, clarified_into_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET
             title = excluded.title,
             description = excluded.description,
             status = excluded.status,
             updated_at = excluded.updated_at,
             clarified_into_type = excluded.clarified_into_type,
             clarified_into_id = excluded.clarified_into_id`
        )
        .bind(
          inboxItem.id,
          inboxItem.workspaceId,
          inboxItem.title,
          inboxItem.description,
          inboxItem.status,
          inboxItem.createdAt,
          inboxItem.updatedAt,
          inboxItem.clarifiedIntoType,
          inboxItem.clarifiedIntoId
        ),

      ...auditEvents.map((evt) =>
        this._db
          .prepare(
            `INSERT INTO audit_event (id, workspace_id, entity_type, entity_id, event_type, actor_id, payload, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
          )
          .bind(
            evt.id,
            evt.workspaceId,
            evt.entityType,
            evt.entityId,
            evt.eventType,
            evt.actorId,
            evt.payload,
            evt.createdAt
          )
      ),
    ];

    await this._db.batch(statements);
  }
}
