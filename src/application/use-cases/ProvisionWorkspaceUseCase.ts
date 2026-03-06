/**
 * ProvisionWorkspaceUseCase — creates a workspace with seeded areas, contexts, and an actor.
 *
 * Triggered by better-auth's `databaseHooks.user.create.after` hook on signup.
 * Atomically creates:
 * - 1 Workspace (tenant boundary)
 * - 1 Actor (human, linked to the user)
 * - 3 Areas (Work, Personal, Admin)
 * - 5 Contexts (computer, calls, home, errands, office)
 * - Audit events for each created entity
 *
 * Delegates all persistence to {@link WorkspaceBatchPort} for a single atomic
 * D1 batch call ordered for FK safety.
 *
 * @module
 */

import { Actor } from '../../domain/entities/Actor.js';
import { Area } from '../../domain/entities/Area.js';
import { AuditEvent } from '../../domain/entities/AuditEvent.js';
import { Context } from '../../domain/entities/Context.js';
import { Workspace } from '../../domain/entities/Workspace.js';
import type { WorkspaceBatchPort } from '../../domain/interfaces/WorkspaceBatchPort.js';

/** Default areas seeded for every new workspace. */
const SEED_AREA_NAMES = ['Work', 'Personal', 'Admin'] as const;

/** Default contexts seeded for every new workspace. */
const SEED_CONTEXT_NAMES = ['computer', 'calls', 'home', 'errands', 'office'] as const;

/**
 * Request DTO for {@link ProvisionWorkspaceUseCase}.
 */
export type ProvisionWorkspaceRequest = {
  /** The user ID (from better-auth) to provision a workspace for. */
  userId: string;
};

/**
 * Orchestrates workspace provisioning for a newly registered user.
 *
 * Builds the full workspace skeleton (workspace, actor, seeded areas and
 * contexts, audit events) in memory and delegates all persistence to a
 * single atomic batch via {@link WorkspaceBatchPort}.
 */
export class ProvisionWorkspaceUseCase {
  private readonly _batchPort: WorkspaceBatchPort;

  /**
   * Creates a new ProvisionWorkspaceUseCase.
   *
   * @param batchPort - The output port for atomically persisting the full provisioning payload.
   */
  constructor(batchPort: WorkspaceBatchPort) {
    this._batchPort = batchPort;
  }

  /**
   * Provisions a workspace for the given user.
   *
   * Builds: 1 workspace, 1 human actor, 3 areas (Work, Personal, Admin),
   * 5 contexts (computer, calls, home, errands, office), and audit events
   * for every entity. Persists all entities atomically via the batch port.
   *
   * @param request - The provisioning request containing the user ID.
   * @returns Resolved promise on success.
   */
  async execute(request: ProvisionWorkspaceRequest): Promise<void> {
    const workspace = Workspace.create(request.userId);
    const actor = Actor.createHuman(workspace.id, request.userId);

    const areas = SEED_AREA_NAMES.map((name) => Area.create(workspace.id, name));
    const contexts = SEED_CONTEXT_NAMES.map((name) => Context.create(workspace.id, name));

    const auditEvents = [
      AuditEvent.record(
        workspace.id,
        'workspace',
        workspace.id,
        'workspace.provisioned',
        actor.id,
        JSON.stringify(workspace)
      ),
      AuditEvent.record(
        workspace.id,
        'actor',
        actor.id,
        'actor.created',
        actor.id,
        JSON.stringify(actor)
      ),
      ...areas.map((area) =>
        AuditEvent.record(
          workspace.id,
          'area',
          area.id,
          'area.created',
          actor.id,
          JSON.stringify(area)
        )
      ),
      ...contexts.map((ctx) =>
        AuditEvent.record(
          workspace.id,
          'context',
          ctx.id,
          'context.created',
          actor.id,
          JSON.stringify(ctx)
        )
      ),
    ];

    await this._batchPort.provisionBatch(workspace, actor, areas, contexts, auditEvents);
  }
}
