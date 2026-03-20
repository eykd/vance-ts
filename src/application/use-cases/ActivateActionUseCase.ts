/**
 * ActivateActionUseCase — transitions an action from 'ready' to 'active'.
 *
 * @module
 */

import { Action } from '../../domain/entities/Action.js';
import { AuditEvent } from '../../domain/entities/AuditEvent.js';
import type { ActionRepository } from '../../domain/interfaces/ActionRepository.js';
import type { AuditEventRepository } from '../../domain/interfaces/AuditEventRepository.js';
import type { ActionDto } from '../dto/ActionDto.js';
import { toActionDto } from '../dto/ActionDto.js';

/**
 * Request DTO for {@link ActivateActionUseCase}.
 */
export type ActivateActionRequest = {
  /** The workspace UUID. */
  workspaceId: string;
  /** The action UUID to activate. */
  actionId: string;
  /** FK -> actor.id for audit trail. */
  actorId: string;
};

/**
 * Result type returned by {@link ActivateActionUseCase.execute}.
 *
 * On success, `data` contains the activated action DTO. On failure, `kind`
 * identifies the error category:
 * - `action_not_found` — no action exists with the given ID in the workspace
 * - `invalid_status_transition` — action is not in 'ready' status
 */
export type ActivateActionResult =
  | { ok: true; data: ActionDto }
  | { ok: false; kind: 'action_not_found' | 'invalid_status_transition' };

/**
 * Activates an action, transitioning it from 'ready' to 'active'.
 */
export class ActivateActionUseCase {
  private readonly _actionRepo: ActionRepository;
  private readonly _auditRepo: AuditEventRepository | undefined;

  /**
   * Creates a new ActivateActionUseCase.
   *
   * @param actionRepo - Repository for action entities.
   * @param auditRepo - Optional repository for recording audit events.
   */
  constructor(actionRepo: ActionRepository, auditRepo?: AuditEventRepository) {
    this._actionRepo = actionRepo;
    this._auditRepo = auditRepo;
  }

  /**
   * Activates an action.
   *
   * @param request - The activation request.
   * @returns A typed result; never throws.
   */
  async execute(request: ActivateActionRequest): Promise<ActivateActionResult> {
    const action = await this._actionRepo.getById(request.actionId, request.workspaceId);
    if (action === null) {
      return { ok: false, kind: 'action_not_found' };
    }

    const activateResult = Action.activate(action);
    if (!activateResult.success) {
      return { ok: false, kind: 'invalid_status_transition' };
    }
    const activated = activateResult.value;

    await this._actionRepo.save(activated);

    if (this._auditRepo !== undefined) {
      const eventResult = AuditEvent.record(
        request.workspaceId,
        'action',
        activated.id,
        'action.activated',
        request.actorId,
        JSON.stringify({ status: activated.status })
      );
      if (eventResult.success) {
        await this._auditRepo.save(eventResult.value);
      }
    }

    return { ok: true, data: toActionDto(activated) };
  }
}
