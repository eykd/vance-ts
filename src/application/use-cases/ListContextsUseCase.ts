/**
 * ListContextsUseCase — retrieves all contexts for a workspace.
 *
 * Returns all contexts belonging to the authenticated user's workspace, ordered
 * by creation date. Used to populate context selects in the clarify form and
 * for the GET /api/v1/contexts endpoint.
 *
 * @module
 */

import type { ContextDto } from '../dto/ContextDto';
import type { ContextRepository } from '../../domain/interfaces/ContextRepository';

/**
 * Request DTO for {@link ListContextsUseCase}.
 */
export type ListContextsRequest = {
  /** The workspace UUID to list contexts for. */
  workspaceId: string;
};

/**
 * Retrieves all contexts for a given workspace.
 *
 * Stub implementation — full logic is added in workspace-bms.1.3.8.
 */
export class ListContextsUseCase {
  private readonly _contextRepo: ContextRepository;

  /**
   * Creates a new ListContextsUseCase.
   *
   * @param contextRepo - Repository for reading context entities.
   */
  constructor(contextRepo: ContextRepository) {
    this._contextRepo = contextRepo;
  }

  /**
   * Returns all contexts for the given workspace.
   *
   * @param _request - The request containing the workspace ID.
   * @returns Array of context DTOs.
   */
  async execute(_request: ListContextsRequest): Promise<ContextDto[]> {
    throw new Error('ListContextsUseCase.execute: not yet implemented');
  }
}
