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
