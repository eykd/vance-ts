/**
 * ContextRepository port.
 *
 * Defines the persistence contract for {@link Context} entities.
 * Implementations live in the infrastructure layer (e.g. D1ContextRepository).
 *
 * @module
 */

import type { Context } from '../entities/Context';

/**
 * Repository interface for {@link Context} persistence.
 *
 * All query methods scope results to the owning workspace to enforce
 * tenant isolation.
 */
export interface ContextRepository {
  /**
   * Persists a context (insert or update).
   *
   * @param context - The context entity to persist.
   */
  save(context: Context): Promise<void>;

  /**
   * Returns the context with the given ID within a workspace, or `null` if not found.
   *
   * @param id - The context UUID to look up.
   * @param workspaceId - The workspace UUID for tenant isolation.
   * @returns The matching context, or `null`.
   */
  getById(id: string, workspaceId: string): Promise<Context | null>;

  /**
   * Returns all contexts belonging to a workspace.
   *
   * @param workspaceId - The workspace UUID to query.
   * @returns All contexts in the workspace.
   */
  listByWorkspaceId(workspaceId: string): Promise<Context[]>;
}
