/**
 * D1ContextRepository — Cloudflare D1 implementation of ContextRepository.
 *
 * Persists and retrieves {@link Context} entities from the `context` D1 table.
 * All queries include `workspace_id` filters for tenant isolation.
 *
 * @module
 */

import type { Context } from '../../domain/entities/Context';
import type { ContextRepository } from '../../domain/interfaces/ContextRepository';

/**
 * D1-backed implementation of the {@link ContextRepository} port.
 *
 * Stub implementation — full D1 query logic is added in workspace-bms.1.3.7.
 */
export class D1ContextRepository implements ContextRepository {
  private readonly _db: D1Database;

  /**
   * Creates a new D1ContextRepository.
   *
   * @param db - The D1 database binding from the Cloudflare Workers environment.
   */
  constructor(db: D1Database) {
    this._db = db;
    void this._db;
  }

  /**
   * Persists a context (insert or update).
   *
   * @param _context - The context entity to persist.
   * @returns Resolved promise on success.
   */
  save(_context: Context): Promise<void> {
    return Promise.reject(new Error('D1ContextRepository.save: not yet implemented'));
  }

  /**
   * Returns the context with the given ID within a workspace, or `null` if not found.
   *
   * @param _id - The context UUID to look up.
   * @param _workspaceId - The workspace UUID for tenant isolation.
   * @returns The matching context, or `null`.
   */
  getById(_id: string, _workspaceId: string): Promise<Context | null> {
    return Promise.reject(new Error('D1ContextRepository.getById: not yet implemented'));
  }

  /**
   * Returns all contexts belonging to a workspace.
   *
   * @param _workspaceId - The workspace UUID to query.
   * @returns All contexts in the workspace.
   */
  listByWorkspaceId(_workspaceId: string): Promise<Context[]> {
    return Promise.reject(
      new Error('D1ContextRepository.listByWorkspaceId: not yet implemented')
    );
  }
}
