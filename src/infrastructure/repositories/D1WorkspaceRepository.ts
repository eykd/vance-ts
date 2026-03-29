/**
 * D1WorkspaceRepository — Cloudflare D1 implementation of WorkspaceRepository.
 *
 * Persists and retrieves {@link Workspace} entities from the `workspace` D1 table.
 * All queries include `user_id` or `id` filters for tenant isolation.
 *
 * @module
 */

import type { Workspace } from '../../domain/entities/Workspace';
import type { WorkspaceRepository } from '../../domain/interfaces/WorkspaceRepository';

/** Raw D1 row shape for the `workspace` table. */
interface WorkspaceRow {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

/**
 * D1-backed implementation of the {@link WorkspaceRepository} port.
 *
 * Uses prepared statements and upsert semantics. snake_case D1 columns are
 * mapped to camelCase domain fields in `_reconstitute`.
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
  }

  /**
   * Persists a workspace (insert or update).
   *
   * @param workspace - The workspace entity to persist.
   * @returns Resolved promise on success.
   */
  async save(workspace: Workspace): Promise<void> {
    await this._db
      .prepare(
        `INSERT INTO workspace (id, user_id, created_at, updated_at)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           updated_at = excluded.updated_at`
      )
      .bind(workspace.id, workspace.userId, workspace.createdAt, workspace.updatedAt)
      .run();
  }

  /**
   * Returns the workspace owned by the given user, or `null` if none exists.
   *
   * @param userId - The user ID to look up.
   * @returns The matching workspace, or `null`.
   */
  async getByUserId(userId: string): Promise<Workspace | null> {
    const row = await this._db
      .prepare('SELECT id, user_id, created_at, updated_at FROM workspace WHERE user_id = ?')
      .bind(userId)
      .first<WorkspaceRow>();
    return row !== null ? this._reconstitute(row) : null;
  }

  /**
   * Returns the workspace with the given ID, or `null` if not found.
   *
   * @param id - The workspace UUID to look up.
   * @returns The matching workspace, or `null`.
   */
  async getById(id: string): Promise<Workspace | null> {
    const row = await this._db
      .prepare('SELECT id, user_id, created_at, updated_at FROM workspace WHERE id = ?')
      .bind(id)
      .first<WorkspaceRow>();
    return row !== null ? this._reconstitute(row) : null;
  }

  /**
   * Maps a D1 row to a Workspace domain entity.
   *
   * @param row - Raw D1 row from the workspace table.
   * @returns The hydrated Workspace entity.
   */
  private _reconstitute(row: WorkspaceRow): Workspace {
    return {
      id: row.id,
      userId: row.user_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
