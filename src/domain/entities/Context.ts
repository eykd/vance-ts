/**
 * Context entity.
 *
 * A situational tag indicating where or how an action can be done
 * (e.g. `computer`, `calls`, `home`). Seeded automatically during workspace
 * provisioning. All contexts are implicitly active in this slice.
 *
 * @module
 */

import type { DomainError } from '../errors/DomainError.js';
import type { Result } from '../shared/Result.js';
import { ok } from '../shared/Result.js';
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
  /** FK -> `workspace.id`. The workspace this context belongs to. */
  readonly workspaceId: string;
  /** Display name for the context (1-100 chars). */
  readonly name: string;
  /** ISO-8601 UTC timestamp of context creation. */
  readonly createdAt: string;
}

// eslint-disable-next-line @typescript-eslint/no-namespace, no-redeclare
export namespace Context {
  /**
   * Creates a new Context, generating a unique ID and current timestamp.
   *
   * @param workspaceId - FK -> `workspace.id`.
   * @param name - Display name (1-100 chars).
   * @returns A Result containing a new immutable Context, or a DomainError.
   */
  export function create(workspaceId: string, name: string): Result<Context, DomainError> {
    const checks = [
      requireNonBlank(workspaceId, 'workspace_id_required'),
      requireNonBlank(name, 'name_required'),
      requireMaxLength(name, 100, 'name_too_long'),
    ];
    for (const check of checks) {
      if (!check.success) {
        return check;
      }
    }
    return ok({
      id: crypto.randomUUID(),
      workspaceId,
      name,
      createdAt: new Date().toISOString(),
    });
  }
}
