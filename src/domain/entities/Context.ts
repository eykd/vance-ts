/**
 * Context entity.
 *
 * A situational tag indicating where or how an action can be done
 * (e.g. `computer`, `calls`, `home`). Seeded automatically during workspace
 * provisioning. All contexts are implicitly active in this slice.
 *
 * @module
 */

/**
 * Context entity representing a situational tag for actions within a workspace.
 *
 * Immutable value object hydrated from persistent storage.
 * Use factory functions (`create`, `reconstitute`) to construct instances.
 */
export interface Context {
  /** Unique identifier (UUID). */
  readonly id: string;
  /** FK → `workspace.id`. The workspace this context belongs to. */
  readonly workspaceId: string;
  /** Display name for the context (1–100 chars). */
  readonly name: string;
  /** ISO-8601 UTC timestamp of context creation. */
  readonly createdAt: string;
}
