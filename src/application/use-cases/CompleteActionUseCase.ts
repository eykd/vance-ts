/**
 * CompleteActionUseCase — transitions an action from 'active' to 'done'.
 *
 * @module
 */

import { Action } from '../../domain/entities/Action.js';
import { AuditEvent } from '../../domain/entities/AuditEvent.js';
import { DomainError } from '../../domain/errors/DomainError.js';
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
   * @returns The updated action DTO.
   */
  async execute(request: CompleteActionRequest): Promise<ActionDto> {
    const action = await this._actionRepo.getById(request.actionId, request.workspaceId);
    if (action === null) {
      throw new DomainError('action_not_found');
    }

    const completed = Action.complete(action);
    await this._actionRepo.save(completed);

    if (this._auditRepo !== undefined) {
      const event = AuditEvent.record(
        request.workspaceId,
        'action',
        completed.id,
        'action.completed',
        request.actorId,
        JSON.stringify({ status: completed.status })
      );
      await this._auditRepo.save(event);
    }

    return toActionDto(completed);
  }
}
