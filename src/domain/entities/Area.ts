/**
 * Area entity.
 *
 * A sphere of responsibility (e.g. Work, Personal, Admin). Required when
 * creating actions. Seeded automatically during workspace provisioning.
 *
 * @module
 */

import { DomainError } from '../errors/DomainError.js';
import { requireMaxLength, requireNonBlank } from '../shared/validation.js';

/**
 * Area entity representing a sphere of responsibility within a workspace.
 *
 * Immutable value object hydrated from persistent storage.
 * Use factory functions (`create`, `archive`, `reconstitute`) to construct instances.
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

/** Raw D1 row shape for the `area` table. */
export interface AreaRow {
  id: string;
  workspace_id: string;
  name: string;
  status: 'active' | 'archived';
  created_at: string;
  updated_at: string;
}

// eslint-disable-next-line @typescript-eslint/no-namespace, no-redeclare
export namespace Area {
  /**
   * Creates a new active Area, generating a unique ID and current timestamps.
   *
   * @param workspaceId - FK → `workspace.id`.
   * @param name - Display name (1–100 chars).
   * @returns A new immutable Area with `status='active'`.
   * @throws {DomainError} `'name_required'` if name is empty.
   * @throws {DomainError} `'name_too_long'` if name exceeds 100 chars.
   */
  export function create(workspaceId: string, name: string): Area {
    requireNonBlank(workspaceId, 'workspace_id_required');
    requireNonBlank(name, 'name_required');
    requireMaxLength(name, 100, 'name_too_long');
    const now = new Date().toISOString();
    return {
      id: crypto.randomUUID(),
      workspaceId,
      name,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Archives an active Area, returning a new Area with `status='archived'`.
   *
   * @param area - The area to archive. Must be `active`.
   * @returns A new immutable Area with `status='archived'` and updated `updatedAt`.
   * @throws {DomainError} `'already_archived'` if the area is already archived.
   */
  export function archive(area: Area): Area {
    if (area.status === 'archived') {
      throw new DomainError('already_archived');
    }
    return {
      ...area,
      status: 'archived',
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Hydrates an Area from a raw D1 database row.
   *
   * Bypasses validation — the data is assumed valid as it was written by this
   * application.
   *
   * @param row - Raw D1 row from the `area` table.
   * @returns The hydrated Area domain entity.
   */
  export function reconstitute(row: AreaRow): Area {
    return {
      id: row.id,
      workspaceId: row.workspace_id,
      name: row.name,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
