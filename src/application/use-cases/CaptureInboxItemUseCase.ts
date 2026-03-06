/**
 * CaptureInboxItemUseCase — captures a new inbox item into a workspace.
 *
 * @module
 */

import { InboxItem } from '../../domain/entities/InboxItem.js';
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
};

/**
 * Captures a new inbox item into a workspace.
 */
export class CaptureInboxItemUseCase {
  private readonly _repo: InboxItemRepository;

  /**
   * Creates a new CaptureInboxItemUseCase.
   *
   * @param repo - Repository for persisting inbox item entities.
   */
  constructor(repo: InboxItemRepository) {
    this._repo = repo;
  }

  /**
   * Creates and persists a new inbox item, returning its DTO.
   *
   * @param request - The request containing workspace ID and title.
   * @returns The newly created inbox item DTO.
   */
  async execute(request: CaptureInboxItemRequest): Promise<InboxItemDto> {
    const item = InboxItem.create(request.workspaceId, request.title, request.description ?? null);
    await this._repo.save(item);
    return toInboxItemDto(item);
  }
}
