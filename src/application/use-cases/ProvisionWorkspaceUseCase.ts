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

import type { AuditEvent } from '../../domain/entities/AuditEvent.js';
import type { WorkspaceBatchPort } from '../../domain/interfaces/WorkspaceBatchPort.js';

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
    const now = new Date().toISOString();

    const workspace = {
      id: crypto.randomUUID(),
      userId: request.userId,
      createdAt: now,
      updatedAt: now,
    };

    const actor = {
      id: crypto.randomUUID(),
      workspaceId: workspace.id,
      userId: request.userId,
      type: 'human' as const,
      createdAt: now,
    };

    const areaNames = ['Work', 'Personal', 'Admin'];
    const areas = areaNames.map((name) => ({
      id: crypto.randomUUID(),
      workspaceId: workspace.id,
      name,
      status: 'active' as const,
      createdAt: now,
      updatedAt: now,
    }));

    const contextNames = ['computer', 'calls', 'home', 'errands', 'office'];
    const contexts = contextNames.map((name) => ({
      id: crypto.randomUUID(),
      workspaceId: workspace.id,
      name,
      createdAt: now,
    }));

    const makeAuditEvent = (
      entityType: string,
      entityId: string,
      eventType: string,
      payload: unknown,
    ): AuditEvent => ({
      id: crypto.randomUUID(),
      workspaceId: workspace.id,
      entityType,
      entityId,
      eventType,
      actorId: actor.id,
      payload: JSON.stringify(payload),
      createdAt: now,
    });

    const auditEvents = [
      makeAuditEvent('workspace', workspace.id, 'workspace.provisioned', workspace),
      makeAuditEvent('actor', actor.id, 'actor.created', actor),
      ...areas.map((area) => makeAuditEvent('area', area.id, 'area.created', area)),
      ...contexts.map((ctx) => makeAuditEvent('context', ctx.id, 'context.created', ctx)),
    ];

    await this._batchPort.provisionBatch(workspace, actor, areas, contexts, auditEvents);
  }
}
