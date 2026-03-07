/**
 * ClarifyInboxItemToActionUseCase — transitions an inbox item to 'clarified'
 * and creates a new Action entity in a single coordinated operation.
 *
 * @module
 */

import { Action } from '../../domain/entities/Action.js';
import { AuditEvent } from '../../domain/entities/AuditEvent.js';
import { InboxItem } from '../../domain/entities/InboxItem.js';
import { DomainError } from '../../domain/errors/DomainError.js';
import type { AreaRepository } from '../../domain/interfaces/AreaRepository.js';
import type { ClarifyInboxItemBatchPort } from '../../domain/interfaces/ClarifyInboxItemBatchPort.js';
import type { ContextRepository } from '../../domain/interfaces/ContextRepository.js';
import type { InboxItemRepository } from '../../domain/interfaces/InboxItemRepository.js';
import type { ActionDto } from '../dto/ActionDto.js';
import { toActionDto } from '../dto/ActionDto.js';

/**
 * Request DTO for {@link ClarifyInboxItemToActionUseCase}.
 */
export type ClarifyInboxItemRequest = {
  /** The workspace UUID. */
  workspaceId: string;
  /** The inbox item UUID to clarify. */
  inboxItemId: string;
  /** Title for the new action. */
  title: string;
  /** FK -> area.id. Must be an active area. */
  areaId: string;
  /** FK -> context.id. Must exist. */
  contextId: string;
  /** FK -> actor.id for audit trail. */
  actorId: string;
  /** Optional description override; defaults to inbox item description. */
  description?: string;
};

/**
 * Clarifies an inbox item into an action, persisting both state changes.
 */
export class ClarifyInboxItemToActionUseCase {
  private readonly _inboxRepo: InboxItemRepository;
  private readonly _batchPort: ClarifyInboxItemBatchPort;
  private readonly _areaRepo: AreaRepository;
  private readonly _contextRepo: ContextRepository;

  /**
   * Creates a new ClarifyInboxItemToActionUseCase.
   *
   * @param inboxRepo - Repository for inbox item reads.
   * @param batchPort - Port for atomic persistence of clarification payload.
   * @param areaRepo - Repository for area entities.
   * @param contextRepo - Repository for context entities.
   */
  constructor(
    inboxRepo: InboxItemRepository,
    batchPort: ClarifyInboxItemBatchPort,
    areaRepo: AreaRepository,
    contextRepo: ContextRepository
  ) {
    this._inboxRepo = inboxRepo;
    this._batchPort = batchPort;
    this._areaRepo = areaRepo;
    this._contextRepo = contextRepo;
  }

  /**
   * Clarifies an inbox item into an action.
   *
   * @param request - The clarification request.
   * @returns The newly created action DTO.
   */
  async execute(request: ClarifyInboxItemRequest): Promise<ActionDto> {
    const item = await this._inboxRepo.getById(request.inboxItemId, request.workspaceId);
    if (item === null) {
      throw new DomainError('inbox_item_not_found');
    }

    const area = await this._areaRepo.getActiveById(request.areaId, request.workspaceId);
    if (area === null) {
      throw new DomainError('area_not_found_or_archived');
    }

    const context = await this._contextRepo.getById(request.contextId, request.workspaceId);
    if (context === null) {
      throw new DomainError('context_not_found');
    }

    const description = request.description ?? item.description;
    const action = Action.create(
      request.workspaceId,
      request.actorId,
      request.title,
      request.areaId,
      request.contextId,
      description
    );

    const clarifiedItem = InboxItem.clarify(item, 'action', action.id);
    const auditEvents = this._buildAuditEvents(request, clarifiedItem, action);

    await this._batchPort.clarifyBatch(clarifiedItem, action, auditEvents);

    return toActionDto(action);
  }

  /**
   * Builds audit events for the clarification (inbox_item.clarified + action.created).
   *
   * @param request - The original clarification request.
   * @param item - The clarified inbox item.
   * @param action - The newly created action.
   * @returns Array of audit events to persist.
   */
  private _buildAuditEvents(
    request: ClarifyInboxItemRequest,
    item: InboxItem,
    action: Action
  ): AuditEvent[] {
    const itemEvent = AuditEvent.record(
      request.workspaceId,
      'inbox_item',
      item.id,
      'inbox_item.clarified',
      request.actorId,
      JSON.stringify({
        status: item.status,
        clarifiedIntoType: item.clarifiedIntoType,
        clarifiedIntoId: item.clarifiedIntoId,
      })
    );
    const actionEvent = AuditEvent.record(
      request.workspaceId,
      'action',
      action.id,
      'action.created',
      request.actorId,
      JSON.stringify({
        title: action.title,
        status: action.status,
        areaId: action.areaId,
        contextId: action.contextId,
      })
    );
    return [itemEvent, actionEvent];
  }
}
