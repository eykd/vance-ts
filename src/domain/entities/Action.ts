/**
 * Action entity.
 *
 * A concrete, single next step that has been clarified from an inbox item.
 * Lifecycle in this slice: `ready` → `active` → `done`.
 *
 * @module
 */

import { DomainError } from '../errors/DomainError.js';

/** Maximum allowed length for an action title. */
const MAX_TITLE_LENGTH = 255;

/** Maximum allowed length for an action description. */
const MAX_DESCRIPTION_LENGTH = 2000;

/**
 * Throws a DomainError if the string is empty or whitespace-only.
 *
 * @param value - The string to validate.
 * @param errorCode - The error code to throw.
 */
function requireNonBlank(value: string, errorCode: string): void {
  if (value.trim().length === 0) {
    throw new DomainError(errorCode);
  }
}

/**
 * Throws a DomainError if the string exceeds the maximum length.
 *
 * @param value - The string to validate.
 * @param max - The maximum allowed length.
 * @param errorCode - The error code to throw.
 */
function requireMaxLength(value: string, max: number, errorCode: string): void {
  if (value.length > max) {
    throw new DomainError(errorCode);
  }
}

/** Valid action statuses. */
export type ActionStatus = 'ready' | 'active' | 'done' | 'waiting' | 'scheduled' | 'archived';

/**
 * Action entity representing a concrete next step within a workspace.
 *
 * Immutable value object hydrated from persistent storage.
 * Use the `create` factory function to construct new instances.
 */
export interface Action {
  /** Unique identifier (UUID). */
  readonly id: string;
  /** FK -> `workspace.id`. */
  readonly workspaceId: string;
  /** FK -> `actor.id`. The actor who created this action. */
  readonly createdByActorId: string;
  /** Action title (1-255 chars). */
  readonly title: string;
  /** Optional longer description, null when not provided. */
  readonly description: string | null;
  /** Lifecycle status. */
  readonly status: ActionStatus;
  /** FK -> `area.id`. Required, must reference an active area. */
  readonly areaId: string;
  /** FK -> `context.id`. Required. */
  readonly contextId: string;
  /** FK -> `project.id`. Reserved for future; always null in this slice. */
  readonly projectId: string | null;
  /** ISO-8601 UTC timestamp of action creation. */
  readonly createdAt: string;
  /** ISO-8601 UTC timestamp of last action update. */
  readonly updatedAt: string;
}

// eslint-disable-next-line @typescript-eslint/no-namespace, no-redeclare
export namespace Action {
  /**
   * Creates a new action with 'ready' status.
   *
   * @param workspaceId - FK -> `workspace.id`.
   * @param actorId - FK -> `actor.id`.
   * @param title - Action title.
   * @param areaId - FK -> `area.id`.
   * @param contextId - FK -> `context.id`.
   * @param description - Optional description, defaults to null.
   * @returns A new immutable Action with `status='ready'`.
   */
  export function create(
    workspaceId: string,
    actorId: string,
    title: string,
    areaId: string,
    contextId: string,
    description: string | null = null
  ): Action {
    requireNonBlank(workspaceId, 'workspace_id_required');
    requireNonBlank(actorId, 'actor_id_required');
    requireNonBlank(title, 'title_required');
    requireMaxLength(title, MAX_TITLE_LENGTH, 'title_too_long');
    requireNonBlank(areaId, 'area_id_required');
    requireNonBlank(contextId, 'context_id_required');
    if (description !== null) {
      requireNonBlank(description, 'description_required');
      requireMaxLength(description, MAX_DESCRIPTION_LENGTH, 'description_too_long');
    }
    const now = new Date().toISOString();
    return {
      id: crypto.randomUUID(),
      workspaceId,
      createdByActorId: actorId,
      title,
      description,
      status: 'ready',
      areaId,
      contextId,
      projectId: null,
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Reconstitutes an Action from raw persistent storage fields.
   *
   * @param fields - The raw fields from the database row.
   * @returns A hydrated Action entity.
   */
  export function reconstitute(fields: Action): Action {
    return { ...fields };
  }

  /**
   * Transitions an action from 'ready' to 'active'.
   *
   * @param action - The action to activate.
   * @returns A new Action with `status='active'`.
   */
  export function activate(action: Action): Action {
    if (action.status !== 'ready') {
      throw new DomainError('invalid_status_transition');
    }
    return {
      ...action,
      status: 'active',
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Transitions an action from 'active' to 'done'.
   *
   * @param action - The action to complete.
   * @returns A new Action with `status='done'`.
   */
  export function complete(action: Action): Action {
    if (action.status !== 'active') {
      throw new DomainError('invalid_status_transition');
    }
    return {
      ...action,
      status: 'done',
      updatedAt: new Date().toISOString(),
    };
  }
}
