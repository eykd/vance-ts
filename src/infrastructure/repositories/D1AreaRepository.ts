/**
 * D1AreaRepository — Cloudflare D1 implementation of AreaRepository.
 *
 * Persists and retrieves {@link Area} entities from the `area` D1 table.
 * All queries include `workspace_id` filters for tenant isolation.
 *
 * @module
 */

import type { Area } from '../../domain/entities/Area';
import type { AreaRepository } from '../../domain/interfaces/AreaRepository';

/**
 * D1-backed implementation of the {@link AreaRepository} port.
 *
 * Stub implementation — full D1 query logic is added in workspace-bms.1.3.7.
 */
export class D1AreaRepository implements AreaRepository {
  private readonly _db: D1Database;

  /**
   * Creates a new D1AreaRepository.
   *
   * @param db - The D1 database binding from the Cloudflare Workers environment.
   */
  constructor(db: D1Database) {
    this._db = db;
  }

  /**
   * Persists an area (insert or update).
   *
   * @param _area - The area entity to persist.
   */
  async save(_area: Area): Promise<void> {
    throw new Error('D1AreaRepository.save: not yet implemented');
  }

  /**
   * Returns the area with the given ID within a workspace, or `null` if not found.
   *
   * @param _id - The area UUID to look up.
   * @param _workspaceId - The workspace UUID for tenant isolation.
   * @returns The matching area, or `null`.
   */
  async getById(_id: string, _workspaceId: string): Promise<Area | null> {
    throw new Error('D1AreaRepository.getById: not yet implemented');
  }

  /**
   * Returns the area with the given ID only if its status is `active`, or `null` otherwise.
   *
   * @param _id - The area UUID to look up.
   * @param _workspaceId - The workspace UUID for tenant isolation.
   * @returns The matching active area, or `null`.
   */
  async getActiveById(_id: string, _workspaceId: string): Promise<Area | null> {
    throw new Error('D1AreaRepository.getActiveById: not yet implemented');
  }

  /**
   * Returns all areas belonging to a workspace.
   *
   * @param _workspaceId - The workspace UUID to query.
   * @returns All areas in the workspace.
   */
  async listByWorkspaceId(_workspaceId: string): Promise<Area[]> {
    throw new Error('D1AreaRepository.listByWorkspaceId: not yet implemented');
  }
}
