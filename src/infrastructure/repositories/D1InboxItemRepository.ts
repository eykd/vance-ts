/**
 * D1InboxItemRepository — Cloudflare D1 implementation of InboxItemRepository.
 *
 * Persists and retrieves {@link InboxItem} entities from the `inbox_item` D1 table.
 * All queries include `workspace_id` filters for tenant isolation.
 *
 * @module
 */

import { InboxItem } from '../../domain/entities/InboxItem';
import type { InboxItemRepository } from '../../domain/interfaces/InboxItemRepository';

/** Raw D1 row shape for the `inbox_item` table. */
interface InboxItemRow {
  id: string;
  workspace_id: string;
  title: string;
  description: string | null;
  status: 'inbox' | 'clarified';
  created_at: string;
  updated_at: string;
  clarified_into_type: string | null;
  clarified_into_id: string | null;
}

/** Column list shared across SELECT queries. */
const COLUMNS =
  'id, workspace_id, title, description, status, created_at, updated_at, clarified_into_type, clarified_into_id';

/**
 * D1-backed implementation of the {@link InboxItemRepository} port.
 *
 * Uses prepared statements and upsert semantics. snake_case D1 columns are
 * mapped to camelCase domain fields in `_reconstitute`.
 */
export class D1InboxItemRepository implements InboxItemRepository {
  private readonly _db: D1Database;

  /**
   * Creates a new D1InboxItemRepository.
   *
   * @param db - The D1 database binding from the Cloudflare Workers environment.
   */
  constructor(db: D1Database) {
    this._db = db;
  }

  /**
   * Persists an inbox item (insert or update).
   *
   * @param item - The inbox item entity to persist.
   */
  async save(item: InboxItem): Promise<void> {
    await this._db
      .prepare(
        `INSERT INTO inbox_item (id, workspace_id, title, description, status, created_at, updated_at, clarified_into_type, clarified_into_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           title = excluded.title,
           description = excluded.description,
           status = excluded.status,
           updated_at = excluded.updated_at,
           clarified_into_type = excluded.clarified_into_type,
           clarified_into_id = excluded.clarified_into_id`
      )
      .bind(
        item.id,
        item.workspaceId,
        item.title,
        item.description,
        item.status,
        item.createdAt,
        item.updatedAt,
        item.clarifiedIntoType,
        item.clarifiedIntoId
      )
      .run();
  }

  /**
   * Returns the inbox item with the given ID within a workspace, or `null` if not found.
   *
   * @param id - The inbox item UUID to look up.
   * @param workspaceId - The workspace UUID for tenant isolation.
   * @returns The matching inbox item, or `null`.
   */
  async getById(id: string, workspaceId: string): Promise<InboxItem | null> {
    const row = await this._db
      .prepare(`SELECT ${COLUMNS} FROM inbox_item WHERE id = ? AND workspace_id = ?`)
      .bind(id, workspaceId)
      .first<InboxItemRow>();
    return row !== null ? this._reconstitute(row) : null;
  }

  /**
   * Returns inbox items belonging to a workspace, filtered by status.
   *
   * @param workspaceId - The workspace UUID to query.
   * @param status - The status to filter by. Defaults to `'inbox'`.
   * @returns Matching inbox items in the workspace.
   */
  async listByWorkspaceId(
    workspaceId: string,
    status: InboxItem['status'] = 'inbox'
  ): Promise<InboxItem[]> {
    const { results } = await this._db
      .prepare(`SELECT ${COLUMNS} FROM inbox_item WHERE workspace_id = ? AND status = ?`)
      .bind(workspaceId, status)
      .all<InboxItemRow>();
    return results.map((row) => this._reconstitute(row));
  }

  /**
   * Returns the count of inbox items in a workspace filtered by status.
   *
   * @param workspaceId - The workspace UUID to query.
   * @param status - The status to filter by.
   * @returns The number of matching items.
   */
  async countByWorkspaceId(workspaceId: string, status: InboxItem['status']): Promise<number> {
    const row = await this._db
      .prepare('SELECT COUNT(*) as count FROM inbox_item WHERE workspace_id = ? AND status = ?')
      .bind(workspaceId, status)
      .first<{ count: number }>();
    return row?.count ?? 0;
  }

  /**
   * Maps a D1 row to an InboxItem domain entity.
   *
   * @param row - Raw D1 row from the inbox_item table.
   * @returns The hydrated InboxItem entity.
   */
  private _reconstitute(row: InboxItemRow): InboxItem {
    return InboxItem.reconstitute({
      id: row.id,
      workspaceId: row.workspace_id,
      title: row.title,
      description: row.description,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      clarifiedIntoType: row.clarified_into_type,
      clarifiedIntoId: row.clarified_into_id,
    });
  }
}
