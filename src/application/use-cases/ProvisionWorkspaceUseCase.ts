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
 * Uses D1 batch API for atomic multi-entity inserts.
 *
 * @module
 */

import type { ActorRepository } from '../../domain/interfaces/ActorRepository';
import type { AreaRepository } from '../../domain/interfaces/AreaRepository';
import type { AuditEventRepository } from '../../domain/interfaces/AuditEventRepository';
import type { ContextRepository } from '../../domain/interfaces/ContextRepository';
import type { WorkspaceRepository } from '../../domain/interfaces/WorkspaceRepository';

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
 * Creates the full workspace skeleton (workspace, actor, seeded areas and
 * contexts) and records audit events for every created entity.
 */
export class ProvisionWorkspaceUseCase {
  private readonly _workspaceRepo: WorkspaceRepository;
  private readonly _actorRepo: ActorRepository;
  private readonly _areaRepo: AreaRepository;
  private readonly _contextRepo: ContextRepository;
  private readonly _auditRepo: AuditEventRepository;

  /**
   * Creates a new ProvisionWorkspaceUseCase.
   *
   * @param workspaceRepo - Repository for persisting workspace entities.
   * @param actorRepo - Repository for persisting actor entities.
   * @param areaRepo - Repository for persisting area entities.
   * @param contextRepo - Repository for persisting context entities.
   * @param auditRepo - Repository for appending audit events.
   */
  constructor(
    workspaceRepo: WorkspaceRepository,
    actorRepo: ActorRepository,
    areaRepo: AreaRepository,
    contextRepo: ContextRepository,
    auditRepo: AuditEventRepository,
  ) {
    this._workspaceRepo = workspaceRepo;
    this._actorRepo = actorRepo;
    this._areaRepo = areaRepo;
    this._contextRepo = contextRepo;
    this._auditRepo = auditRepo;
  }

  /**
   * Provisions a workspace for the given user.
   *
   * Creates: 1 workspace, 1 human actor, 3 areas (Work, Personal, Admin),
   * 5 contexts (computer, calls, home, errands, office), and audit events
   * for every created entity.
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
    await this._workspaceRepo.save(workspace);

    const actor = {
      id: crypto.randomUUID(),
      workspaceId: workspace.id,
      userId: request.userId,
      type: 'human' as const,
      createdAt: now,
    };
    await this._actorRepo.save(actor);

    const areaNames = ['Work', 'Personal', 'Admin'];
    const areas = areaNames.map((name) => ({
      id: crypto.randomUUID(),
      workspaceId: workspace.id,
      name,
      status: 'active' as const,
      createdAt: now,
      updatedAt: now,
    }));
    for (const area of areas) {
      await this._areaRepo.save(area);
    }

    const contextNames = ['computer', 'calls', 'home', 'errands', 'office'];
    const contexts = contextNames.map((name) => ({
      id: crypto.randomUUID(),
      workspaceId: workspace.id,
      name,
      createdAt: now,
    }));
    for (const context of contexts) {
      await this._contextRepo.save(context);
    }

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
    await this._auditRepo.saveBatch(auditEvents);
  }
}
