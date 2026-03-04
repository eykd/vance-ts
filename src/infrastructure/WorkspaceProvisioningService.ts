/**
 * WorkspaceProvisioningService — infrastructure adapter bridging better-auth's
 * `databaseHooks.user.create.after` hook to the application-layer provisioning
 * use case.
 *
 * Constructed inside `getAuth(env)` where `env.DB` (raw D1) is available, so
 * the {@link ProvisionWorkspaceUseCase} can be wired with all required
 * repository implementations before being passed here.
 *
 * @module
 */

import type { D1Database } from '@cloudflare/workers-types';

import type { ProvisionWorkspaceUseCase } from '../application/use-cases/ProvisionWorkspaceUseCase';
import type { Actor } from '../domain/entities/Actor.js';
import type { Area } from '../domain/entities/Area.js';
import type { AuditEvent } from '../domain/entities/AuditEvent.js';
import type { Context } from '../domain/entities/Context.js';
import type { Workspace } from '../domain/entities/Workspace.js';

/**
 * Infrastructure adapter that bridges better-auth's post-signup user hook
 * to the {@link ProvisionWorkspaceUseCase} application use case.
 *
 * Receives the fully-wired use case from `getAuth(env)`, which constructs all
 * repository dependencies using the raw `env.DB` D1 binding.
 */
export class WorkspaceProvisioningService {
  /** The provisioning use case to delegate workspace creation to. */
  private readonly _useCase: ProvisionWorkspaceUseCase;

  /**
   * Creates a new WorkspaceProvisioningService.
   *
   * @param useCase - The provisioning use case to delegate to on user creation.
   */
  constructor(useCase: ProvisionWorkspaceUseCase) {
    this._useCase = useCase;
  }

  /**
   * Called after a new user is created by better-auth.
   *
   * Delegates workspace provisioning to {@link ProvisionWorkspaceUseCase},
   * which atomically creates the workspace, actor, seeded areas and contexts,
   * and all associated audit events for the new user.
   *
   * Errors are propagated to the caller. The better-auth hook in `auth.ts`
   * wraps this call in a try/catch and logs errors rather than rethrowing,
   * because the user row is already committed by the time this hook fires.
   *
   * @param userId - The newly created user's ID (from better-auth).
   * @returns Resolved promise when provisioning completes successfully.
   * @throws {Error} When the use case fails.
   */
  async onUserCreated(userId: string): Promise<void> {
    await this._useCase.execute({ userId });
  }

  /**
   * Atomically persists the full workspace provisioning payload via a single D1 batch.
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
   * @param db - The raw D1 database binding.
   * @param workspace - The workspace entity to insert.
   * @param actor - The human actor entity to insert.
   * @param areas - The seeded area entities to insert.
   * @param contexts - The seeded context entities to insert.
   * @param auditEvents - The audit event entities to insert (inserted last, FK-safe).
   * @returns Resolved promise when the batch succeeds.
   */
  async provisionBatch(
    db: D1Database,
    workspace: Workspace,
    actor: Actor,
    areas: Area[],
    contexts: Context[],
    auditEvents: AuditEvent[],
  ): Promise<void> {
    const statements = [
      db
        .prepare('INSERT INTO workspace (id, user_id, created_at, updated_at) VALUES (?, ?, ?, ?)')
        .bind(workspace.id, workspace.userId, workspace.createdAt, workspace.updatedAt),

      db
        .prepare(
          'INSERT INTO actor (id, workspace_id, user_id, type, created_at) VALUES (?, ?, ?, ?, ?)',
        )
        .bind(actor.id, actor.workspaceId, actor.userId, actor.type, actor.createdAt),

      ...areas.map((area) =>
        db
          .prepare(
            'INSERT INTO area (id, workspace_id, name, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
          )
          .bind(area.id, area.workspaceId, area.name, area.status, area.createdAt, area.updatedAt),
      ),

      ...contexts.map((ctx) =>
        db
          .prepare('INSERT INTO context (id, workspace_id, name, created_at) VALUES (?, ?, ?, ?)')
          .bind(ctx.id, ctx.workspaceId, ctx.name, ctx.createdAt),
      ),

      ...auditEvents.map((evt) =>
        db
          .prepare(
            'INSERT INTO audit_event (id, workspace_id, entity_type, entity_id, event_type, actor_id, payload, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          )
          .bind(
            evt.id,
            evt.workspaceId,
            evt.entityType,
            evt.entityId,
            evt.eventType,
            evt.actorId,
            evt.payload,
            evt.createdAt,
          ),
      ),
    ];

    await db.batch(statements);
  }
}
