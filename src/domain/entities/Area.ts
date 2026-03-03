/**
 * Area entity.
 *
 * A sphere of responsibility (e.g. Work, Personal, Admin). Required when
 * creating actions. Seeded automatically during workspace provisioning.
 *
 * @module
 */

/**
 * Area entity representing a sphere of responsibility within a workspace.
 *
 * Immutable value object hydrated from persistent storage.
 * Use factory functions (`create`, `reconstitute`) to construct instances.
 *
 * State machine: `active` → (archive) → `archived`
 */
export interface Area {
  /** Unique identifier (UUID). */
  readonly id: string;
  /** FK → `workspace.id`. The workspace this area belongs to. */
  readonly workspaceId: string;
  /** Display name for the area (1–100 chars). */
  readonly name: string;
  /** Lifecycle status. Only `active` areas may be used in clarification. */
  readonly status: 'active' | 'archived';
  /** ISO-8601 UTC timestamp of area creation. */
  readonly createdAt: string;
  /** ISO-8601 UTC timestamp of last area update. */
  readonly updatedAt: string;
}
