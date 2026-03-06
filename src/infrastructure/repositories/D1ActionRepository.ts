/**
 * D1ActionRepository — Cloudflare D1 implementation of ActionRepository.
 *
 * Persists and retrieves {@link Action} entities from the `action` D1 table.
 * All queries include `workspace_id` filters for tenant isolation.
 *
 * @module
 */

import { Action } from '../../domain/entities/Action';
import type { ActionStatus } from '../../domain/entities/Action';
import type { ActionRepository } from '../../domain/interfaces/ActionRepository';

/** Raw D1 row shape for the `action` table. */
interface ActionRow {
  id: string;
  workspace_id: string;
  created_by_actor_id: string;
  title: string;
  description: string | null;
  status: ActionStatus;
  area_id: string;
  context_id: string;
  project_id: string | null;
  created_at: string;
  updated_at: string;
}

/** Column list shared across SELECT queries. */
const COLUMNS =
  'id, workspace_id, created_by_actor_id, title, description, status, area_id, context_id, project_id, created_at, updated_at';

/**
 * D1-backed implementation of the {@link ActionRepository} port.
 */
export class D1ActionRepository implements ActionRepository {
  private readonly _db: D1Database;

  /**
   * Creates a new D1ActionRepository.
   *
   * @param db - The D1 database binding from the Cloudflare Workers environment.
   */
  constructor(db: D1Database) {
    this._db = db;
  }

  /**
   * Persists an action (insert or update).
   *
   * @param action - The action entity to persist.
   */
  async save(action: Action): Promise<void> {
    await this._db
      .prepare(
        `INSERT INTO action (id, workspace_id, created_by_actor_id, title, description, status, area_id, context_id, project_id, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           title = excluded.title,
           description = excluded.description,
           status = excluded.status,
           updated_at = excluded.updated_at
         WHERE workspace_id = excluded.workspace_id`
      )
      .bind(
        action.id,
        action.workspaceId,
        action.createdByActorId,
        action.title,
        action.description,
        action.status,
        action.areaId,
        action.contextId,
        action.projectId,
        action.createdAt,
        action.updatedAt
      )
      .run();
  }

  /**
   * Returns the action with the given ID within a workspace, or `null` if not found.
   *
   * @param id - The action UUID to look up.
   * @param workspaceId - The workspace UUID for tenant isolation.
   * @returns The matching action, or `null`.
   */
  async getById(id: string, workspaceId: string): Promise<Action | null> {
    const row = await this._db
      .prepare(`SELECT ${COLUMNS} FROM action WHERE id = ? AND workspace_id = ?`)
      .bind(id, workspaceId)
      .first<ActionRow>();
    return row !== null ? this._reconstitute(row) : null;
  }

  /**
   * Returns actions belonging to a workspace, optionally filtered by status.
   *
   * @param workspaceId - The workspace UUID to query.
   * @param status - Optional status to filter by.
   * @returns Matching actions in the workspace.
   */
  async listByWorkspaceId(workspaceId: string, status?: Action['status']): Promise<Action[]> {
    if (status !== undefined) {
      const { results } = await this._db
        .prepare(`SELECT ${COLUMNS} FROM action WHERE workspace_id = ? AND status = ?`)
        .bind(workspaceId, status)
        .all<ActionRow>();
      return results.map((row) => this._reconstitute(row));
    }
    const { results } = await this._db
      .prepare(`SELECT ${COLUMNS} FROM action WHERE workspace_id = ?`)
      .bind(workspaceId)
      .all<ActionRow>();
    return results.map((row) => this._reconstitute(row));
  }

  /**
   * Maps a D1 row to an Action domain entity.
   *
   * @param row - Raw D1 row from the action table.
   * @returns The hydrated Action entity.
   */
  private _reconstitute(row: ActionRow): Action {
    return Action.reconstitute({
      id: row.id,
      workspaceId: row.workspace_id,
      createdByActorId: row.created_by_actor_id,
      title: row.title,
      description: row.description,
      status: row.status,
      areaId: row.area_id,
      contextId: row.context_id,
      projectId: row.project_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }
}
