/**
 * ListInboxItemsUseCase — retrieves inbox-status items for a workspace.
 *
 * @module
 */

import type { InboxItemRepository } from '../../domain/interfaces/InboxItemRepository.js';
import type { InboxItemDto } from '../dto/InboxItemDto.js';
import { toInboxItemDto } from '../dto/InboxItemDto.js';

/**
 * Request DTO for {@link ListInboxItemsUseCase}.
 */
export type ListInboxItemsRequest = {
  /** The workspace UUID to list inbox items for. */
  workspaceId: string;
};

/**
 * Retrieves inbox-status items for a given workspace.
 */
export class ListInboxItemsUseCase {
  private readonly _repo: InboxItemRepository;

  /**
   * Creates a new ListInboxItemsUseCase.
   *
   * @param repo - Repository for reading inbox item entities.
   */
  constructor(repo: InboxItemRepository) {
    this._repo = repo;
  }

  /**
   * Returns all inbox-status items for the given workspace.
   *
   * @param request - The request containing the workspace ID.
   * @returns Array of inbox item DTOs.
   */
  async execute(request: ListInboxItemsRequest): Promise<InboxItemDto[]> {
    const items = await this._repo.listByWorkspaceId(request.workspaceId, 'inbox');
    return items.map(toInboxItemDto);
  }
}
