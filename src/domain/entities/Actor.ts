/**
 * Actor entity.
 *
 * An identity within a workspace that can author mutations. In the current
 * vertical slice, always a human actor linked to a user account. An `'agent'`
 * type is reserved for future automation.
 *
 * @module
 */

import type { DomainError } from '../errors/DomainError.js';
import type { Result } from '../shared/Result.js';
import { ok } from '../shared/Result.js';
import { requireNonBlank } from '../shared/validation.js';

/**
 * Actor entity representing an identity that can author mutations in a workspace.
 *
 * Immutable value object hydrated from persistent storage.
 * Use the `createHuman` factory to construct new instances.
 */
export interface Actor {
  /** Unique identifier (UUID). */
  readonly id: string;
  /** FK -> `workspace.id`. The workspace this actor belongs to. */
  readonly workspaceId: string;
  /** FK -> `user.id`. The user account linked to this actor (for human actors). */
  readonly userId: string;
  /** Actor type. `'agent'` is reserved for future automation; only `'human'` in this slice. */
  readonly type: 'human' | 'agent';
  /** ISO-8601 UTC timestamp of actor creation. */
  readonly createdAt: string;
}

// eslint-disable-next-line @typescript-eslint/no-namespace, no-redeclare
export namespace Actor {
  /**
   * Creates a new human Actor within a workspace, generating a unique ID and current timestamp.
   *
   * @param workspaceId - FK -> `workspace.id`. The workspace this actor belongs to.
   * @param userId - FK -> `user.id`. The user account linked to this actor.
   * @returns A Result containing a new immutable Actor, or a DomainError.
   */
  export function createHuman(workspaceId: string, userId: string): Result<Actor, DomainError> {
    const wsCheck = requireNonBlank(workspaceId, 'workspace_id_required');
    if (!wsCheck.success) {
      return wsCheck;
    }
    const userCheck = requireNonBlank(userId, 'user_id_required');
    if (!userCheck.success) {
      return userCheck;
    }
    return ok({
      id: crypto.randomUUID(),
      workspaceId,
      userId,
      type: 'human' as const,
      createdAt: new Date().toISOString(),
    });
  }
}
