/**
 * InboxItemRepository port.
 *
 * Defines the persistence contract for {@link InboxItem} entities.
 * Implementations live in the infrastructure layer.
 *
 * @module
 */

import type { InboxItem } from '../entities/InboxItem';

/**
 * Repository interface for {@link InboxItem} persistence.
 *
 * All query methods scope results to the owning workspace to enforce
 * tenant isolation.
 */
export interface InboxItemRepository {
  /**
   * Persists an inbox item (insert or update).
   *
   * @param item - The inbox item entity to persist.
   */
  save(item: InboxItem): Promise<void>;

  /**
   * Returns the inbox item with the given ID within a workspace, or `null` if not found.
   *
   * @param id - The inbox item UUID to look up.
   * @param workspaceId - The workspace UUID for tenant isolation.
   * @returns The matching inbox item, or `null`.
   */
  getById(id: string, workspaceId: string): Promise<InboxItem | null>;

  /**
   * Returns inbox items belonging to a workspace, filtered by status.
   *
   * @param workspaceId - The workspace UUID to query.
   * @param status - The status to filter by. Defaults to `'inbox'`.
   * @returns Matching inbox items in the workspace.
   */
  listByWorkspaceId(workspaceId: string, status?: InboxItem['status']): Promise<InboxItem[]>;

  /**
   * Returns the count of inbox items in a workspace filtered by status.
   *
   * @param workspaceId - The workspace UUID to query.
   * @param status - The status to filter by.
   * @returns The number of matching items.
   */
  countByWorkspaceId(workspaceId: string, status: InboxItem['status']): Promise<number>;
}
