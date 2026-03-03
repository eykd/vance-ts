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

/**
 * D1-backed implementation of the {@link ActorRepository} port.
 *
 * Stub implementation — full D1 query logic is added in workspace-bms.1.3.7.
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
   * @param _actor - The actor entity to persist.
   */
  async save(_actor: Actor): Promise<void> {
    throw new Error('D1ActorRepository.save: not yet implemented');
  }

  /**
   * Returns the actor with the given ID within a workspace, or `null` if not found.
   *
   * @param _id - The actor UUID to look up.
   * @param _workspaceId - The workspace UUID for tenant isolation.
   * @returns The matching actor, or `null`.
   */
  async getById(_id: string, _workspaceId: string): Promise<Actor | null> {
    throw new Error('D1ActorRepository.getById: not yet implemented');
  }

  /**
   * Returns the human actor for a workspace, or `null` if not found.
   *
   * @param _workspaceId - The workspace UUID to query.
   * @returns The human actor, or `null`.
   */
  async getHumanActorByWorkspaceId(_workspaceId: string): Promise<Actor | null> {
    throw new Error('D1ActorRepository.getHumanActorByWorkspaceId: not yet implemented');
  }
}
