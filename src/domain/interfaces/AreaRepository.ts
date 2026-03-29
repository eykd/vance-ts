/**
 * AreaRepository port.
 *
 * Defines the persistence contract for {@link Area} entities.
 * Implementations live in the infrastructure layer (e.g. D1AreaRepository).
 *
 * @module
 */

import type { Area } from '../entities/Area';

/**
 * Repository interface for {@link Area} persistence.
 *
 * All query methods scope results to the owning workspace to enforce
 * tenant isolation.
 */
export interface AreaRepository {
  /**
   * Persists an area (insert or update).
   *
   * @param area - The area entity to persist.
   */
  save(area: Area): Promise<void>;

  /**
   * Returns the area with the given ID within a workspace, or `null` if not found.
   *
   * @param id - The area UUID to look up.
   * @param workspaceId - The workspace UUID for tenant isolation.
   * @returns The matching area, or `null`.
   */
  getById(id: string, workspaceId: string): Promise<Area | null>;

  /**
   * Returns the area with the given ID only if its status is `active`, or `null` otherwise.
   *
   * Used during clarification to enforce the business rule that only active areas
   * may be assigned to actions.
   *
   * @param id - The area UUID to look up.
   * @param workspaceId - The workspace UUID for tenant isolation.
   * @returns The matching active area, or `null` if not found or archived.
   */
  getActiveById(id: string, workspaceId: string): Promise<Area | null>;

  /**
   * Returns all areas belonging to a workspace.
   *
   * @param workspaceId - The workspace UUID to query.
   * @returns All areas in the workspace (active and archived).
   */
  listByWorkspaceId(workspaceId: string): Promise<Area[]>;
}
