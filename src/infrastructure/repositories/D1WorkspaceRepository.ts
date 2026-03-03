/**
 * D1WorkspaceRepository — Cloudflare D1 implementation of WorkspaceRepository.
 *
 * Persists and retrieves {@link Workspace} entities from the `workspace` D1 table.
 * All queries include `workspace_id` or `user_id` filters for tenant isolation.
 *
 * @module
 */

import type { Workspace } from '../../domain/entities/Workspace';
import type { WorkspaceRepository } from '../../domain/interfaces/WorkspaceRepository';

/**
 * D1-backed implementation of the {@link WorkspaceRepository} port.
 *
 * Stub implementation — full D1 query logic is added in workspace-bms.1.3.7.
 */
export class D1WorkspaceRepository implements WorkspaceRepository {
  private readonly _db: D1Database;

  /**
   * Creates a new D1WorkspaceRepository.
   *
   * @param db - The D1 database binding from the Cloudflare Workers environment.
   */
  constructor(db: D1Database) {
    this._db = db;
    void this._db;
  }

  /**
   * Persists a workspace (insert or update).
   *
   * @param _workspace - The workspace entity to persist.
   * @returns Resolved promise on success.
   */
  save(_workspace: Workspace): Promise<void> {
    return Promise.reject(new Error('D1WorkspaceRepository.save: not yet implemented'));
  }

  /**
   * Returns the workspace owned by the given user, or `null` if none exists.
   *
   * @param _userId - The user ID to look up.
   * @returns The matching workspace, or `null`.
   */
  getByUserId(_userId: string): Promise<Workspace | null> {
    return Promise.reject(new Error('D1WorkspaceRepository.getByUserId: not yet implemented'));
  }

  /**
   * Returns the workspace with the given ID, or `null` if not found.
   *
   * @param _id - The workspace UUID to look up.
   * @returns The matching workspace, or `null`.
   */
  getById(_id: string): Promise<Workspace | null> {
    return Promise.reject(new Error('D1WorkspaceRepository.getById: not yet implemented'));
  }
}
