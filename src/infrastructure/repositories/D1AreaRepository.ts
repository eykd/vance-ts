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

/** Raw D1 row shape for the `area` table. */
interface AreaRow {
  id: string;
  workspace_id: string;
  name: string;
  status: 'active' | 'archived';
  created_at: string;
  updated_at: string;
}

/**
 * D1-backed implementation of the {@link AreaRepository} port.
 *
 * Uses prepared statements and upsert semantics. snake_case D1 columns are
 * mapped to camelCase domain fields in `_reconstitute`.
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
   * @param area - The area entity to persist.
   * @returns Resolved promise on success.
   */
  async save(area: Area): Promise<void> {
    await this._db
      .prepare(
        `INSERT INTO area (id, workspace_id, name, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           name = excluded.name,
           status = excluded.status,
           updated_at = excluded.updated_at`,
      )
      .bind(area.id, area.workspaceId, area.name, area.status, area.createdAt, area.updatedAt)
      .run();
  }

  /**
   * Returns the area with the given ID within a workspace, or `null` if not found.
   *
   * @param id - The area UUID to look up.
   * @param workspaceId - The workspace UUID for tenant isolation.
   * @returns The matching area, or `null`.
   */
  async getById(id: string, workspaceId: string): Promise<Area | null> {
    const row = await this._db
      .prepare(
        'SELECT id, workspace_id, name, status, created_at, updated_at FROM area WHERE id = ? AND workspace_id = ?',
      )
      .bind(id, workspaceId)
      .first<AreaRow>();
    return row !== null ? this._reconstitute(row) : null;
  }

  /**
   * Returns the area with the given ID only if its status is `active`, or `null` otherwise.
   *
   * @param id - The area UUID to look up.
   * @param workspaceId - The workspace UUID for tenant isolation.
   * @returns The matching active area, or `null` if not found or archived.
   */
  async getActiveById(id: string, workspaceId: string): Promise<Area | null> {
    const row = await this._db
      .prepare(
        "SELECT id, workspace_id, name, status, created_at, updated_at FROM area WHERE id = ? AND workspace_id = ? AND status = 'active'",
      )
      .bind(id, workspaceId)
      .first<AreaRow>();
    return row !== null ? this._reconstitute(row) : null;
  }

  /**
   * Returns all areas belonging to a workspace.
   *
   * @param workspaceId - The workspace UUID to query.
   * @returns All areas in the workspace (active and archived).
   */
  async listByWorkspaceId(workspaceId: string): Promise<Area[]> {
    const { results } = await this._db
      .prepare(
        'SELECT id, workspace_id, name, status, created_at, updated_at FROM area WHERE workspace_id = ? ORDER BY created_at ASC',
      )
      .bind(workspaceId)
      .all<AreaRow>();
    return results.map((row) => this._reconstitute(row));
  }

  /** Maps a D1 row to an {@link Area} domain entity. */
  private _reconstitute(row: AreaRow): Area {
    return {
      id: row.id,
      workspaceId: row.workspace_id,
      name: row.name,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
