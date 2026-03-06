/**
 * ActivateActionUseCase — transitions an action from 'ready' to 'active'.
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
   * @returns The updated action DTO.
   */
  async execute(request: ActivateActionRequest): Promise<ActionDto> {
    const action = await this._actionRepo.getById(request.actionId, request.workspaceId);
    if (action === null) {
      throw new DomainError('action_not_found');
    }

    const activated = Action.activate(action);
    await this._actionRepo.save(activated);

    if (this._auditRepo !== undefined) {
      const event = AuditEvent.record(
        request.workspaceId,
        'action',
        activated.id,
        'action.activated',
        request.actorId,
        JSON.stringify({ status: activated.status })
      );
      await this._auditRepo.save(event);
    }

    return toActionDto(activated);
  }
}
