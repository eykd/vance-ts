/**
 * ActionRepository port.
 *
 * Defines the persistence contract for {@link Action} entities.
 * Implementations live in the infrastructure layer.
 *
 * @module
 */

import type { Action } from '../entities/Action';

/**
 * Repository interface for {@link Action} persistence.
 *
 * All query methods scope results to the owning workspace to enforce
 * tenant isolation.
 */
export interface ActionRepository {
  /**
   * Persists an action (insert or update).
   *
   * @param action - The action entity to persist.
   */
  save(action: Action): Promise<void>;

  /**
   * Returns the action with the given ID within a workspace, or `null` if not found.
   *
   * @param id - The action UUID to look up.
   * @param workspaceId - The workspace UUID for tenant isolation.
   * @returns The matching action, or `null`.
   */
  getById(id: string, workspaceId: string): Promise<Action | null>;

  /**
   * Returns actions belonging to a workspace, optionally filtered by status.
   *
   * @param workspaceId - The workspace UUID to query.
   * @param status - Optional status to filter by.
   * @returns Matching actions in the workspace.
   */
  listByWorkspaceId(workspaceId: string, status?: Action['status']): Promise<Action[]>;
}
