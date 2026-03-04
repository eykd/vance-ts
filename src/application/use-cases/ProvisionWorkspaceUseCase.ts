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

    const auditEvents = [
      {
        id: crypto.randomUUID(),
        workspaceId: workspace.id,
        entityType: 'workspace',
        entityId: workspace.id,
        eventType: 'workspace.provisioned',
        actorId: actor.id,
        payload: JSON.stringify(workspace),
        createdAt: now,
      },
      {
        id: crypto.randomUUID(),
        workspaceId: workspace.id,
        entityType: 'actor',
        entityId: actor.id,
        eventType: 'actor.created',
        actorId: actor.id,
        payload: JSON.stringify(actor),
        createdAt: now,
      },
      ...areas.map((area) => ({
        id: crypto.randomUUID(),
        workspaceId: workspace.id,
        entityType: 'area',
        entityId: area.id,
        eventType: 'area.created',
        actorId: actor.id,
        payload: JSON.stringify(area),
        createdAt: now,
      })),
      ...contexts.map((context) => ({
        id: crypto.randomUUID(),
        workspaceId: workspace.id,
        entityType: 'context',
        entityId: context.id,
        eventType: 'context.created',
        actorId: actor.id,
        payload: JSON.stringify(context),
        createdAt: now,
      })),
    ];

    await this._batchPort.provisionBatch(workspace, actor, areas, contexts, auditEvents);
  }
}
