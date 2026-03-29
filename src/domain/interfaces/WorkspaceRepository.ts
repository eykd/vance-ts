/**
 * WorkspaceRepository port.
 *
 * Defines the persistence contract for {@link Workspace} entities.
 * Implementations live in the infrastructure layer (e.g. D1WorkspaceRepository).
 *
 * @module
 */

import type { Workspace } from '../entities/Workspace';

/**
 * Repository interface for {@link Workspace} persistence.
 *
 * All query methods scope results to the owning user or workspace to enforce
 * tenant isolation.
 */
export interface WorkspaceRepository {
  /**
   * Persists a workspace (insert or update).
   *
   * @param workspace - The workspace entity to persist.
   */
  save(workspace: Workspace): Promise<void>;

  /**
   * Returns the workspace owned by the given user, or `null` if none exists.
   *
   * @param userId - The user ID to look up.
   * @returns The matching workspace, or `null`.
   */
  getByUserId(userId: string): Promise<Workspace | null>;

  /**
   * Returns the workspace with the given ID, or `null` if not found.
   *
   * @param id - The workspace UUID to look up.
   * @returns The matching workspace, or `null`.
   */
  getById(id: string): Promise<Workspace | null>;
}
