/**
 * ActorRepository interface.
 *
 * Defines the contract for actor persistence. All implementations must
 * satisfy this interface — the application layer depends only on this type,
 * never on the concrete D1 adapter.
 *
 * @module
 */

/** Minimal actor projection used by the requireWorkspace middleware. */
export interface ActorRecord {
  /** UUID primary key. */
  readonly id: string;
  /** The workspace this actor belongs to. */
  readonly workspaceId: string;
  /** Actor type discriminant. */
  readonly type: 'human' | 'agent';
}

/**
 * Port interface for actor persistence.
 *
 * Infrastructure adapters (`D1ActorRepository`) live in
 * `src/infrastructure/repositories/` and implement this interface.
 */
export interface ActorRepository {
  /**
   * Retrieves the human actor for the given workspace.
   *
   * Each workspace has exactly one human actor in this slice. Returns `null`
   * when no human actor has been provisioned for the workspace.
   *
   * @param workspaceId - The workspace UUID.
   */
  getHumanActorByWorkspaceId(workspaceId: string): Promise<ActorRecord | null>;
}
