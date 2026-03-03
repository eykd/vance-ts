/**
 * Actor entity.
 *
 * An identity within a workspace that can author mutations. In the current
 * vertical slice, always a human actor linked to a user account. An `'agent'`
 * type is reserved for future automation.
 *
 * @module
 */

/**
 * Actor entity representing an identity that can author mutations in a workspace.
 *
 * Immutable value object hydrated from persistent storage.
 * Use factory functions (`createHuman`, `reconstitute`) to construct instances.
 */
export interface Actor {
  /** Unique identifier (UUID). */
  readonly id: string;
  /** FK → `workspace.id`. The workspace this actor belongs to. */
  readonly workspaceId: string;
  /** FK → `user.id`. The user account linked to this actor (for human actors). */
  readonly userId: string;
  /** Actor type. `'agent'` is reserved for future automation; only `'human'` in this slice. */
  readonly type: 'human' | 'agent';
  /** ISO-8601 UTC timestamp of actor creation. */
  readonly createdAt: string;
}

/** Raw D1 row shape for the `actor` table. */
export interface ActorRow {
  id: string;
  workspace_id: string;
  user_id: string;
  type: 'human' | 'agent';
  created_at: string;
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Actor {
  /**
   * Creates a new human Actor within a workspace, generating a unique ID and current timestamp.
   *
   * @param workspaceId - FK → `workspace.id`. The workspace this actor belongs to.
   * @param userId - FK → `user.id`. The user account linked to this actor.
   * @returns A new immutable Actor with `type='human'` and `createdAt` set to now.
   */
  export function createHuman(workspaceId: string, userId: string): Actor {
    return {
      id: crypto.randomUUID(),
      workspaceId,
      userId,
      type: 'human',
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Hydrates an Actor from a raw D1 database row.
   *
   * Bypasses validation — the data is assumed valid as it was written by this
   * application.
   *
   * @param row - Raw D1 row from the `actor` table.
   * @returns The hydrated Actor domain entity.
   */
  export function reconstitute(row: ActorRow): Actor {
    return {
      id: row.id,
      workspaceId: row.workspace_id,
      userId: row.user_id,
      type: row.type,
      createdAt: row.created_at,
    };
  }
}
