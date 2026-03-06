/**
 * D1ActorRepository — Cloudflare D1 implementation of ActorRepository.
 *
 * Persists and retrieves {@link Actor} entities from the `actor` D1 table.
 * All queries include `workspace_id` filters for tenant isolation.
 *
 * @module
 */

import type { Actor } from '../../domain/entities/Actor';
import type { ActorRepository } from '../../domain/interfaces/ActorRepository';

/** Raw D1 row shape for the `actor` table. */
interface ActorRow {
  id: string;
  workspace_id: string;
  user_id: string;
  type: 'human' | 'agent';
  created_at: string;
}

/**
 * D1-backed implementation of the {@link ActorRepository} port.
 *
 * Uses prepared statements and upsert semantics. snake_case D1 columns are
 * mapped to camelCase domain fields in `_reconstitute`.
 */
export class D1ActorRepository implements ActorRepository {
  private readonly _db: D1Database;

  /**
   * Creates a new D1ActorRepository.
   *
   * @param db - The D1 database binding from the Cloudflare Workers environment.
   */
  constructor(db: D1Database) {
    this._db = db;
  }

  /**
   * Persists an actor (insert or update).
   *
   * @param actor - The actor entity to persist.
   * @returns Resolved promise on success.
   */
  async save(actor: Actor): Promise<void> {
    await this._db
      .prepare(
        `INSERT INTO actor (id, workspace_id, user_id, type, created_at)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           type = excluded.type
         WHERE workspace_id = excluded.workspace_id`
      )
      .bind(actor.id, actor.workspaceId, actor.userId, actor.type, actor.createdAt)
      .run();
  }

  /**
   * Returns the actor with the given ID within a workspace, or `null` if not found.
   *
   * @param id - The actor UUID to look up.
   * @param workspaceId - The workspace UUID for tenant isolation.
   * @returns The matching actor, or `null`.
   */
  async getById(id: string, workspaceId: string): Promise<Actor | null> {
    const row = await this._db
      .prepare(
        'SELECT id, workspace_id, user_id, type, created_at FROM actor WHERE id = ? AND workspace_id = ?'
      )
      .bind(id, workspaceId)
      .first<ActorRow>();
    return row !== null ? this._reconstitute(row) : null;
  }

  /**
   * Returns the human actor for a workspace, or `null` if not found.
   *
   * @param workspaceId - The workspace UUID to query.
   * @returns The human actor, or `null` if provisioning has not completed.
   */
  async getHumanActorByWorkspaceId(workspaceId: string): Promise<Actor | null> {
    const row = await this._db
      .prepare(
        "SELECT id, workspace_id, user_id, type, created_at FROM actor WHERE workspace_id = ? AND type = 'human' LIMIT 1"
      )
      .bind(workspaceId)
      .first<ActorRow>();
    return row !== null ? this._reconstitute(row) : null;
  }

  /**
   * Maps a D1 row to an Actor domain entity.
   *
   * @param row - Raw D1 row from the actor table.
   * @returns The hydrated Actor entity.
   */
  private _reconstitute(row: ActorRow): Actor {
    return {
      id: row.id,
      workspaceId: row.workspace_id,
      userId: row.user_id,
      type: row.type,
      createdAt: row.created_at,
    };
  }
}
