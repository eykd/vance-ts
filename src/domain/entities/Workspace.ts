/**
 * Workspace entity.
 *
 * The tenant boundary for all GTD data. Each user account owns exactly one
 * workspace. All other entities (areas, contexts, inbox items, actions) belong
 * to a workspace via `workspaceId`.
 *
 * @module
 */

import type { DomainError } from '../errors/DomainError.js';
import type { Result } from '../shared/Result.js';
import { ok } from '../shared/Result.js';
import { requireNonBlank } from '../shared/validation.js';

/**
 * Workspace entity representing a user's GTD workspace.
 *
 * Immutable value object hydrated from persistent storage.
 * Use the `create` factory to construct new instances.
 */
export interface Workspace {
  /** Unique identifier (UUID). */
  readonly id: string;
  /** FK -> `user.id`. Each user has exactly one workspace. */
  readonly userId: string;
  /** ISO-8601 UTC timestamp of workspace creation. */
  readonly createdAt: string;
  /** ISO-8601 UTC timestamp of last workspace update. */
  readonly updatedAt: string;
}

// eslint-disable-next-line @typescript-eslint/no-namespace, no-redeclare
export namespace Workspace {
  /**
   * Creates a new Workspace for the given user, generating a unique ID and current timestamps.
   *
   * @param userId - FK -> `user.id`. The owning user account.
   * @returns A Result containing a new immutable Workspace, or a DomainError.
   */
  export function create(userId: string): Result<Workspace, DomainError> {
    const check = requireNonBlank(userId, 'user_id_required');
    if (!check.success) {
      return check;
    }
    const now = new Date().toISOString();
    return ok({
      id: crypto.randomUUID(),
      userId,
      createdAt: now,
      updatedAt: now,
    });
  }
}
