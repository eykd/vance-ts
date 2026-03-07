/**
 * Context entity.
 *
 * A situational tag indicating where or how an action can be done
 * (e.g. `computer`, `calls`, `home`). Seeded automatically during workspace
 * provisioning. All contexts are implicitly active in this slice.
 *
 * @module
 */

import { requireMaxLength, requireNonBlank } from '../shared/validation.js';

/**
 * Context entity representing a situational tag for actions within a workspace.
 *
 * Immutable value object hydrated from persistent storage.
 * Use the `create` factory to construct new instances.
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

// eslint-disable-next-line @typescript-eslint/no-namespace, no-redeclare
export namespace Context {
  /**
   * Creates a new Context, generating a unique ID and current timestamp.
   *
   * @param workspaceId - FK → `workspace.id`.
   * @param name - Display name (1–100 chars).
   * @returns A new immutable Context.
   */
  export function create(workspaceId: string, name: string): Context {
    requireNonBlank(workspaceId, 'workspace_id_required');
    requireNonBlank(name, 'name_required');
    requireMaxLength(name, 100, 'name_too_long');
    return {
      id: crypto.randomUUID(),
      workspaceId,
      name,
      createdAt: new Date().toISOString(),
    };
  }
}
