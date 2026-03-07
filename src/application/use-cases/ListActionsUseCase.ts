/**
 * ListActionsUseCase — retrieves actions for a workspace.
 *
 * @module
 */

import type { Action } from '../../domain/entities/Action.js';
import type { ActionRepository } from '../../domain/interfaces/ActionRepository.js';
import type { ActionDto } from '../dto/ActionDto.js';
import { toActionDto } from '../dto/ActionDto.js';

/** Maximum number of items before emitting a warning. */
const LIST_SAFETY_CAP = 500;

/**
 * Request DTO for {@link ListActionsUseCase}.
 */
export type ListActionsRequest = {
  /** The workspace UUID to list actions for. */
  workspaceId: string;
  /** Optional status filter. */
  status?: Action['status'];
};

/**
 * Retrieves actions for a given workspace.
 */
export class ListActionsUseCase {
  private readonly _repo: ActionRepository;

  /**
   * Creates a new ListActionsUseCase.
   *
   * @param repo - Repository for reading action entities.
   */
  constructor(repo: ActionRepository) {
    this._repo = repo;
  }

  /**
   * Returns actions for the given workspace, optionally filtered by status.
   *
   * @param request - The request containing the workspace ID and optional status filter.
   * @returns Array of action DTOs.
   */
  async execute(request: ListActionsRequest): Promise<ActionDto[]> {
    const items = await this._repo.listByWorkspaceId(request.workspaceId, request.status);
    if (items.length >= LIST_SAFETY_CAP) {
      console.warn('[ListActionsUseCase] Result count hit 500-item safety cap', {
        workspaceId: request.workspaceId,
      });
    }
    return items.map(toActionDto);
  }
}
