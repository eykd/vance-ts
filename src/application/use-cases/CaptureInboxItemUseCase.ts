/**
 * CaptureInboxItemUseCase — captures a new inbox item into a workspace.
 *
 * @module
 */

import { AuditEvent } from '../../domain/entities/AuditEvent.js';
import { InboxItem } from '../../domain/entities/InboxItem.js';
import type { AuditEventRepository } from '../../domain/interfaces/AuditEventRepository.js';
import type { InboxItemRepository } from '../../domain/interfaces/InboxItemRepository.js';
import type { InboxItemDto } from '../dto/InboxItemDto.js';
import { toInboxItemDto } from '../dto/InboxItemDto.js';

/**
 * Request DTO for {@link CaptureInboxItemUseCase}.
 */
export type CaptureInboxItemRequest = {
  /** The workspace UUID to capture the item into. */
  workspaceId: string;
  /** Raw capture title. */
  title: string;
  /** Optional longer description. */
  description?: string;
  /** Optional actor ID for audit logging. */
  actorId?: string;
};

/**
 * Result type returned by {@link CaptureInboxItemUseCase.execute}.
 *
 * On success, `data` contains the captured inbox item DTO. On failure, `kind`
 * identifies the error category:
 * - `domain_error` — validation or other domain rule violation
 */
export type CaptureInboxItemResult =
  | { ok: true; data: InboxItemDto }
  | { ok: false; kind: 'domain_error'; code: string };

/**
 * Captures a new inbox item into a workspace.
 */
export class CaptureInboxItemUseCase {
  private readonly _repo: InboxItemRepository;
  private readonly _auditRepo: AuditEventRepository | undefined;

  /**
   * Creates a new CaptureInboxItemUseCase.
   *
   * @param repo - Repository for persisting inbox item entities.
   * @param auditRepo - Optional repository for recording audit events.
   */
  constructor(repo: InboxItemRepository, auditRepo?: AuditEventRepository) {
    this._repo = repo;
    this._auditRepo = auditRepo;
  }

  /**
   * Creates and persists a new inbox item, returning a typed result.
   *
   * @param request - The request containing workspace ID and title.
   * @returns A typed result; never throws for domain errors.
   */
  async execute(request: CaptureInboxItemRequest): Promise<CaptureInboxItemResult> {
    const createResult = InboxItem.create(
      request.workspaceId,
      request.title,
      request.description ?? null
    );
    if (!createResult.success) {
      return { ok: false, kind: 'domain_error', code: createResult.error.code };
    }
    const item = createResult.value;
    await this._repo.save(item);
    await this._recordAuditEvent(request, item);
    return { ok: true, data: toInboxItemDto(item) };
  }

  /**
   * Records an audit event for the captured inbox item, if audit logging is configured.
   *
   * @param request - The original capture request containing workspace and actor info.
   * @param item - The persisted inbox item entity.
   */
  private async _recordAuditEvent(
    request: CaptureInboxItemRequest,
    item: InboxItem
  ): Promise<void> {
    if (this._auditRepo === undefined || request.actorId === undefined) {
      return;
    }
    const eventResult = AuditEvent.record(
      request.workspaceId,
      'inbox_item',
      item.id,
      'inbox_item.captured',
      request.actorId,
      JSON.stringify({ title: item.title, description: item.description, status: item.status })
    );
    if (eventResult.success) {
      await this._auditRepo.save(eventResult.value);
    }
  }
}
