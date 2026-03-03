/**
 * ListAreasUseCase — retrieves all areas for a workspace.
 *
 * Returns all areas (active and archived) belonging to the authenticated user's
 * workspace, ordered by creation date. Used to populate area selects in the
 * clarify form and for the GET /api/v1/areas endpoint.
 *
 * @module
 */

import type { AreaRepository } from '../../domain/interfaces/AreaRepository';
import type { AreaDto } from '../dto/AreaDto';

/**
 * Request DTO for {@link ListAreasUseCase}.
 */
export type ListAreasRequest = {
  /** The workspace UUID to list areas for. */
  workspaceId: string;
};

/**
 * Retrieves all areas for a given workspace.
 *
 * Stub implementation — full logic is added in workspace-bms.1.3.8.
 */
export class ListAreasUseCase {
  private readonly _areaRepo: AreaRepository;

  /**
   * Creates a new ListAreasUseCase.
   *
   * @param areaRepo - Repository for reading area entities.
   */
  constructor(areaRepo: AreaRepository) {
    this._areaRepo = areaRepo;
  }

  /**
   * Returns all areas for the given workspace.
   *
   * @param request - The request containing the workspace ID.
   * @returns Array of area DTOs.
   */
  async execute(request: ListAreasRequest): Promise<AreaDto[]> {
    const areas = await this._areaRepo.listByWorkspaceId(request.workspaceId);
    return areas.map((area) => ({
      id: area.id,
      name: area.name,
      status: area.status,
      createdAt: area.createdAt,
      updatedAt: area.updatedAt,
    }));
  }
}
