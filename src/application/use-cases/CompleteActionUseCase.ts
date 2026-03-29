/**
 * CompleteActionUseCase — transitions an action from 'active' to 'done'.
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
 * Request DTO for {@link CompleteActionUseCase}.
 */
export type CompleteActionRequest = {
  /** The workspace UUID. */
  workspaceId: string;
  /** The action UUID to complete. */
  actionId: string;
  /** FK -> actor.id for audit trail. */
  actorId: string;
};

/**
 * Result type returned by {@link CompleteActionUseCase.execute}.
 *
 * On success, `data` contains the completed action DTO. On failure, `kind`
 * identifies the error category:
 * - `action_not_found` — no action exists with the given ID in the workspace
 * - `invalid_status_transition` — action is not in 'active' status
 */
export type CompleteActionResult =
  | { ok: true; data: ActionDto }
  | { ok: false; kind: 'action_not_found' | 'invalid_status_transition' };

/**
 * Completes an action, transitioning it from 'active' to 'done'.
 */
export class CompleteActionUseCase {
  private readonly _actionRepo: ActionRepository;
  private readonly _auditRepo: AuditEventRepository | undefined;

  /**
   * Creates a new CompleteActionUseCase.
   *
   * @param actionRepo - Repository for action entities.
   * @param auditRepo - Optional repository for recording audit events.
   */
  constructor(actionRepo: ActionRepository, auditRepo?: AuditEventRepository) {
    this._actionRepo = actionRepo;
    this._auditRepo = auditRepo;
  }

  /**
   * Completes an action.
   *
   * @param request - The completion request.
   * @returns A typed result; never throws.
   */
  async execute(request: CompleteActionRequest): Promise<CompleteActionResult> {
    const action = await this._actionRepo.getById(request.actionId, request.workspaceId);
    if (action === null) {
      return { ok: false, kind: 'action_not_found' };
    }

    const completeResult = Action.complete(action);
    if (!completeResult.success) {
      return { ok: false, kind: 'invalid_status_transition' };
    }
    const completed = completeResult.value;

    await this._actionRepo.save(completed);

    if (this._auditRepo !== undefined) {
      const eventResult = AuditEvent.record(
        request.workspaceId,
        'action',
        completed.id,
        'action.completed',
        request.actorId,
        JSON.stringify({ status: completed.status })
      );
      if (eventResult.success) {
        await this._auditRepo.save(eventResult.value);
      }
    }

    return { ok: true, data: toActionDto(completed) };
  }
}
