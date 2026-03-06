/**
 * Workspace entity.
 *
 * The tenant boundary for all GTD data. Each user account owns exactly one
 * workspace. All other entities (areas, contexts, inbox items, actions) belong
 * to a workspace via `workspaceId`.
 *
 * @module
 */

/**
 * Workspace entity representing a user's GTD workspace.
 *
 * Immutable value object hydrated from persistent storage.
 * Use factory functions (`create`, `reconstitute`) to construct instances.
 */
export interface Workspace {
  /** Unique identifier (UUID). */
  readonly id: string;
  /** FK → `user.id`. Each user has exactly one workspace. */
  readonly userId: string;
  /** ISO-8601 UTC timestamp of workspace creation. */
  readonly createdAt: string;
  /** ISO-8601 UTC timestamp of last workspace update. */
  readonly updatedAt: string;
}

/** Raw D1 row shape for the `workspace` table. */
export interface WorkspaceRow {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

// eslint-disable-next-line @typescript-eslint/no-namespace, no-redeclare
export namespace Workspace {
  /**
   * Creates a new Workspace for the given user, generating a unique ID and current timestamps.
   *
   * @param userId - FK → `user.id`. The owning user account.
   * @returns A new immutable Workspace with `createdAt` and `updatedAt` set to now.
   */
  export function create(userId: string): Workspace {
    const now = new Date().toISOString();
    return {
      id: crypto.randomUUID(),
      userId,
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Hydrates a Workspace from a raw D1 database row.
   *
   * Bypasses validation — the data is assumed valid as it was written by this
   * application.
   *
   * @param row - Raw D1 row from the `workspace` table.
   * @returns The hydrated Workspace domain entity.
   */
  export function reconstitute(row: WorkspaceRow): Workspace {
    return {
      id: row.id,
      userId: row.user_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
