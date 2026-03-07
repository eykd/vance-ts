/**
 * ActorRepository port.
 *
 * Defines the persistence contract for {@link Actor} entities.
 * Implementations live in the infrastructure layer (e.g. D1ActorRepository).
 *
 * @module
 */

import type { Actor } from '../entities/Actor';

/**
 * Repository interface for {@link Actor} persistence.
 *
 * All query methods scope results to the owning workspace to enforce
 * tenant isolation.
 */
export interface ActorRepository {
  /**
   * Persists an actor (insert or update).
   *
   * @param actor - The actor entity to persist.
   */
  save(actor: Actor): Promise<void>;

  /**
   * Returns the actor with the given ID within a workspace, or `null` if not found.
   *
   * @param id - The actor UUID to look up.
   * @param workspaceId - The workspace UUID for tenant isolation.
   * @returns The matching actor, or `null`.
   */
  getById(id: string, workspaceId: string): Promise<Actor | null>;

  /**
   * Returns the human actor for a workspace, or `null` if not found.
   *
   * In the current vertical slice each workspace has exactly one human actor.
   *
   * @param workspaceId - The workspace UUID to query.
   * @returns The human actor, or `null` if provisioning has not completed.
   */
  getHumanActorByWorkspaceId(workspaceId: string): Promise<Actor | null>;
}
