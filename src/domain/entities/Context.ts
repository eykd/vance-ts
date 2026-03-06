/**
 * Context entity.
 *
 * A situational tag indicating where or how an action can be done
 * (e.g. `computer`, `calls`, `home`). Seeded automatically during workspace
 * provisioning. All contexts are implicitly active in this slice.
 *
 * @module
 */

import { DomainError } from '../errors/DomainError.js';

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

/** Raw D1 row shape for the `context` table. */
export interface ContextRow {
  id: string;
  workspace_id: string;
  name: string;
  created_at: string;
}

// eslint-disable-next-line @typescript-eslint/no-namespace, no-redeclare
export namespace Context {
  /**
   * Creates a new Context, generating a unique ID and current timestamp.
   *
   * @param workspaceId - FK → `workspace.id`.
   * @param name - Display name (1–100 chars).
   * @returns A new immutable Context.
   * @throws {DomainError} `'name_required'` if name is empty.
   * @throws {DomainError} `'name_too_long'` if name exceeds 100 chars.
   */
  export function create(workspaceId: string, name: string): Context {
    if (name.length === 0) {
      throw new DomainError('name_required');
    }
    if (name.length > 100) {
      throw new DomainError('name_too_long');
    }
    return {
      id: crypto.randomUUID(),
      workspaceId,
      name,
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Hydrates a Context from a raw D1 database row.
   *
   * Bypasses validation — the data is assumed valid as it was written by this
   * application.
   *
   * @param row - Raw D1 row from the `context` table.
   * @returns The hydrated Context domain entity.
   */
  export function reconstitute(row: ContextRow): Context {
    return {
      id: row.id,
      workspaceId: row.workspace_id,
      name: row.name,
      createdAt: row.created_at,
    };
  }
}
