/**
 * Area entity.
 *
 * A sphere of responsibility (e.g. Work, Personal, Admin). Required when
 * creating actions. Seeded automatically during workspace provisioning.
 *
 * @module
 */

import { DomainError } from '../errors/DomainError.js';
import type { Result } from '../shared/Result.js';
import { err, ok } from '../shared/Result.js';
import { requireMaxLength, requireNonBlank } from '../shared/validation.js';

/**
 * Area entity representing a sphere of responsibility within a workspace.
 *
 * Immutable value object hydrated from persistent storage.
 * Use factory functions (`create`, `archive`) to construct instances.
 *
 * State machine: `active` -> (archive) -> `archived`
 */
export interface Area {
  /** Unique identifier (UUID). */
  readonly id: string;
  /** FK -> `workspace.id`. The workspace this area belongs to. */
  readonly workspaceId: string;
  /** Display name for the area (1-100 chars). */
  readonly name: string;
  /** Lifecycle status. Only `active` areas may be used in clarification. */
  readonly status: 'active' | 'archived';
  /** ISO-8601 UTC timestamp of area creation. */
  readonly createdAt: string;
  /** ISO-8601 UTC timestamp of last area update. */
  readonly updatedAt: string;
}

// eslint-disable-next-line @typescript-eslint/no-namespace, no-redeclare
export namespace Area {
  /**
   * Creates a new active Area, generating a unique ID and current timestamps.
   *
   * @param workspaceId - FK -> `workspace.id`.
   * @param name - Display name (1-100 chars).
   * @returns A Result containing a new immutable Area with `status='active'`, or a DomainError.
   */
  export function create(workspaceId: string, name: string): Result<Area, DomainError> {
    const checks: Result<void, DomainError>[] = [
      requireNonBlank(workspaceId, 'workspace_id_required'),
      requireNonBlank(name, 'name_required'),
      requireMaxLength(name, 100, 'name_too_long'),
    ];
    for (const check of checks) {
      if (!check.success) {
        return check;
      }
    }
    const now = new Date().toISOString();
    return ok({
      id: crypto.randomUUID(),
      workspaceId,
      name,
      status: 'active' as const,
      createdAt: now,
      updatedAt: now,
    });
  }

  /**
   * Archives an active Area, returning a new Area with `status='archived'`.
   *
   * @param area - The area to archive. Must be `active`.
   * @returns A Result containing a new immutable Area with `status='archived'`, or a DomainError.
   */
  export function archive(area: Area): Result<Area, DomainError> {
    if (area.status === 'archived') {
      return err(new DomainError('already_archived'));
    }
    return ok({
      ...area,
      status: 'archived' as const,
      updatedAt: new Date().toISOString(),
    });
  }
}
