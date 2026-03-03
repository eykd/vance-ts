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

/** Raw D1 row shape for the `context` table. */
interface ContextRow {
  id: string;
  workspace_id: string;
  name: string;
  created_at: string;
}

/**
 * D1-backed implementation of the {@link ContextRepository} port.
 *
 * Uses prepared statements and upsert semantics. snake_case D1 columns are
 * mapped to camelCase domain fields in `_reconstitute`.
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
  }

  /**
   * Persists a context (insert or update).
   *
   * @param context - The context entity to persist.
   * @returns Resolved promise on success.
   */
  async save(context: Context): Promise<void> {
    await this._db
      .prepare(
        `INSERT INTO context (id, workspace_id, name, created_at)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           name = excluded.name`,
      )
      .bind(context.id, context.workspaceId, context.name, context.createdAt)
      .run();
  }

  /**
   * Returns the context with the given ID within a workspace, or `null` if not found.
   *
   * @param id - The context UUID to look up.
   * @param workspaceId - The workspace UUID for tenant isolation.
   * @returns The matching context, or `null`.
   */
  async getById(id: string, workspaceId: string): Promise<Context | null> {
    const row = await this._db
      .prepare(
        'SELECT id, workspace_id, name, created_at FROM context WHERE id = ? AND workspace_id = ?',
      )
      .bind(id, workspaceId)
      .first<ContextRow>();
    return row !== null ? this._reconstitute(row) : null;
  }

  /**
   * Returns all contexts belonging to a workspace.
   *
   * @param workspaceId - The workspace UUID to query.
   * @returns All contexts in the workspace.
   */
  async listByWorkspaceId(workspaceId: string): Promise<Context[]> {
    const { results } = await this._db
      .prepare(
        'SELECT id, workspace_id, name, created_at FROM context WHERE workspace_id = ? ORDER BY created_at ASC',
      )
      .bind(workspaceId)
      .all<ContextRow>();
    return results.map((row) => this._reconstitute(row));
  }

  /** Maps a D1 row to a {@link Context} domain entity. */
  private _reconstitute(row: ContextRow): Context {
    return {
      id: row.id,
      workspaceId: row.workspace_id,
      name: row.name,
      createdAt: row.created_at,
    };
  }
}
