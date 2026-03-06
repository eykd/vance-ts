/**
 * WorkspaceD1BatchAdapter — D1 batch transport for workspace provisioning.
 *
 * Implements {@link WorkspaceBatchPort} as a single atomic D1 batch call.
 * Statements are ordered to satisfy foreign-key constraints:
 * workspace → actor → areas → contexts → audit_events.
 *
 * All values use parameterized statements — no string interpolation.
 *
 * @module
 */

import type { D1Database } from '@cloudflare/workers-types';

import type { Actor } from '../domain/entities/Actor.js';
import type { Area } from '../domain/entities/Area.js';
import type { AuditEvent } from '../domain/entities/AuditEvent.js';
import type { Context } from '../domain/entities/Context.js';
import type { Workspace } from '../domain/entities/Workspace.js';
import type { WorkspaceBatchPort } from '../domain/interfaces/WorkspaceBatchPort.js';

/**
 * Infrastructure adapter that persists the full workspace provisioning payload
 * via a single atomic D1 batch call.
 *
 * Constructed with a bound `D1Database` so the {@link WorkspaceBatchPort}
 * interface is satisfied without passing `db` at call-site.
 */
export class WorkspaceD1BatchAdapter implements WorkspaceBatchPort {
  /** The D1 database binding to use for batch persistence. */
  private readonly _db: D1Database;

  /**
   * Creates a new WorkspaceD1BatchAdapter.
   *
   * @param db - The raw D1 database binding.
   */
  constructor(db: D1Database) {
    this._db = db;
  }

  /**
   * Atomically persists the workspace provisioning payload via a single D1 batch.
   *
   * Statements are ordered to satisfy foreign-key constraints:
   * 1. workspace (no FKs)
   * 2. actor (FK → workspace)
   * 3. areas (FK → workspace)
   * 4. contexts (FK → workspace)
   * 5. audit_events (FK → workspace, actor)
   *
   * All values are bound via parameterized statements — no string interpolation.
   *
   * @param workspace - The workspace entity to insert.
   * @param actor - The human actor entity to insert.
   * @param areas - The seeded area entities to insert.
   * @param contexts - The seeded context entities to insert.
   * @param auditEvents - The audit event entities to insert (inserted last, FK-safe).
   * @returns Resolved promise when the batch succeeds.
   */
  async provisionBatch(
    workspace: Workspace,
    actor: Actor,
    areas: Area[],
    contexts: Context[],
    auditEvents: AuditEvent[]
  ): Promise<void> {
    const statements = [
      this._db
        .prepare('INSERT INTO workspace (id, user_id, created_at, updated_at) VALUES (?, ?, ?, ?)')
        .bind(workspace.id, workspace.userId, workspace.createdAt, workspace.updatedAt),

      this._db
        .prepare(
          'INSERT INTO actor (id, workspace_id, user_id, type, created_at) VALUES (?, ?, ?, ?, ?)'
        )
        .bind(actor.id, actor.workspaceId, actor.userId, actor.type, actor.createdAt),

      ...areas.map((area) =>
        this._db
          .prepare(
            'INSERT INTO area (id, workspace_id, name, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
          )
          .bind(area.id, area.workspaceId, area.name, area.status, area.createdAt, area.updatedAt)
      ),

      ...contexts.map((ctx) =>
        this._db
          .prepare('INSERT INTO context (id, workspace_id, name, created_at) VALUES (?, ?, ?, ?)')
          .bind(ctx.id, ctx.workspaceId, ctx.name, ctx.createdAt)
      ),

      ...auditEvents.map((evt) =>
        this._db
          .prepare(
            'INSERT INTO audit_event (id, workspace_id, entity_type, entity_id, event_type, actor_id, payload, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
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
