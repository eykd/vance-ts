/**
 * WorkspaceBatchPort — output port for atomic workspace provisioning persistence.
 *
 * Defines the contract for persisting the full workspace provisioning payload
 * in a single atomic operation. The application-layer {@link ProvisionWorkspaceUseCase}
 * depends on this port; the infrastructure layer implements it as a D1 batch.
 *
 * @module
 */

import type { Actor } from '../entities/Actor.js';
import type { Area } from '../entities/Area.js';
import type { AuditEvent } from '../entities/AuditEvent.js';
import type { Context } from '../entities/Context.js';
import type { Workspace } from '../entities/Workspace.js';

/**
 * Output port for atomically persisting the workspace provisioning payload.
 *
 * Implemented in the infrastructure layer (e.g. `WorkspaceProvisioningService`)
 * as a single D1 batch call ordered for FK-safety:
 * workspace → actor → areas → contexts → audit_events.
 */
export interface WorkspaceBatchPort {
  /**
   * Atomically persists the workspace, actor, seeded areas, contexts, and
   * audit events in a single database operation.
   *
   * @param workspace - The workspace entity to persist.
   * @param actor - The human actor entity to persist.
   * @param areas - The seeded area entities to persist.
   * @param contexts - The seeded context entities to persist.
   * @param auditEvents - The audit event entities to persist (FK-safe: after workspace + actor).
   * @returns Resolved promise when all entities are persisted atomically.
   */
  provisionBatch(
    workspace: Workspace,
    actor: Actor,
    areas: Area[],
    contexts: Context[],
    auditEvents: AuditEvent[],
  ): Promise<void>;
}
