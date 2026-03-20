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
import type { Area as AreaType } from '../../domain/entities/Area.js';
import { AuditEvent } from '../../domain/entities/AuditEvent.js';
import type {
  AuditEntityType,
  AuditEvent as AuditEventType,
  AuditEventKind,
} from '../../domain/entities/AuditEvent.js';
import { Context } from '../../domain/entities/Context.js';
import type { Context as ContextType } from '../../domain/entities/Context.js';
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

/** Result type returned by {@link ProvisionWorkspaceUseCase.execute}. */
export type ProvisionWorkspaceResult = { ok: true } | { ok: false; error: string };

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
   * @returns A result indicating success or a provisioning bug description.
   */
  async execute(request: ProvisionWorkspaceRequest): Promise<ProvisionWorkspaceResult> {
    const wsResult = Workspace.create(request.userId);
    if (!wsResult.success) return { ok: false, error: `Provisioning bug: ${wsResult.error.code}` };
    const workspace = wsResult.value;

    const actorResult = Actor.createHuman(workspace.id, request.userId);
    if (!actorResult.success)
      return { ok: false, error: `Provisioning bug: ${actorResult.error.code}` };
    const actor = actorResult.value;

    const areas: AreaType[] = [];
    for (const name of SEED_AREA_NAMES) {
      const r = Area.create(workspace.id, name);
      if (!r.success) return { ok: false, error: `Provisioning bug: ${r.error.code}` };
      areas.push(r.value);
    }

    const contexts: ContextType[] = [];
    for (const name of SEED_CONTEXT_NAMES) {
      const r = Context.create(workspace.id, name);
      if (!r.success) return { ok: false, error: `Provisioning bug: ${r.error.code}` };
      contexts.push(r.value);
    }

    const auditEvents: AuditEventType[] = [];
    const auditInputs: Array<[AuditEntityType, string, AuditEventKind, string, string]> = [
      ['workspace', workspace.id, 'workspace.provisioned', actor.id, JSON.stringify(workspace)],
      ['actor', actor.id, 'actor.created', actor.id, JSON.stringify(actor)],
      ...areas.map((a): [AuditEntityType, string, AuditEventKind, string, string] => [
        'area',
        a.id,
        'area.created',
        actor.id,
        JSON.stringify(a),
      ]),
      ...contexts.map((c): [AuditEntityType, string, AuditEventKind, string, string] => [
        'context',
        c.id,
        'context.created',
        actor.id,
        JSON.stringify(c),
      ]),
    ];
    for (const [entityType, entityId, eventType, actorId, payload] of auditInputs) {
      const r = AuditEvent.record(workspace.id, entityType, entityId, eventType, actorId, payload);
      if (!r.success) return { ok: false, error: `Provisioning bug: ${r.error.code}` };
      auditEvents.push(r.value);
    }

    await this._batchPort.provisionBatch(workspace, actor, areas, contexts, auditEvents);
    return { ok: true };
  }
}
