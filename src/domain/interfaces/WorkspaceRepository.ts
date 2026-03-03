/**
 * WorkspaceRepository interface.
 *
 * Defines the contract for workspace persistence. All implementations must
 * satisfy this interface — the application layer depends only on this type,
 * never on the concrete D1 adapter.
 *
 * @module
 */

/** Minimal workspace projection used by the requireWorkspace middleware. */
export interface WorkspaceRecord {
  /** UUID primary key. */
  readonly id: string;
  /** The better-auth user ID that owns this workspace (UNIQUE). */
  readonly userId: string;
}

/**
 * Port interface for workspace persistence.
 *
 * Infrastructure adapters (`D1WorkspaceRepository`) live in
 * `src/infrastructure/repositories/` and implement this interface.
 */
export interface WorkspaceRepository {
  /**
   * Retrieves the workspace owned by the given user ID.
   *
   * Returns `null` when no workspace has been provisioned for the user.
   *
   * @param userId - The better-auth user ID.
   */
  getByUserId(userId: string): Promise<WorkspaceRecord | null>;
}
