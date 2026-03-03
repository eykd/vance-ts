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
