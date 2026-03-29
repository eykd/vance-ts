/**
 * InboxItem entity.
 *
 * A raw capture that has entered the system but has not yet been clarified
 * into an actionable task. Lives in the inbox until processed.
 *
 * @module
 */

import { DomainError } from '../errors/DomainError.js';
import type { Result } from '../shared/Result.js';
import { err, ok } from '../shared/Result.js';
import { requireMaxLength, requireNonBlank } from '../shared/validation.js';

/** Maximum allowed length for an inbox item title. */
const MAX_TITLE_LENGTH = 500;

/** Maximum allowed length for an inbox item description. */
const MAX_DESCRIPTION_LENGTH = 2000;

/**
 * InboxItem entity representing an unclarified capture within a workspace.
 *
 * Immutable value object hydrated from persistent storage.
 * Use the `create` factory function to construct new instances.
 */
export interface InboxItem {
  /** Unique identifier (UUID). */
  readonly id: string;
  /** FK -> `workspace.id`. The workspace this item belongs to. */
  readonly workspaceId: string;
  /** Raw capture title (1-500 chars). */
  readonly title: string;
  /** Optional longer description, null when not provided. */
  readonly description: string | null;
  /** Lifecycle status. */
  readonly status: 'inbox' | 'clarified';
  /** ISO-8601 UTC timestamp of item creation. */
  readonly createdAt: string;
  /** ISO-8601 UTC timestamp of last item update. */
  readonly updatedAt: string;
  /** Type of entity this item was clarified into, null until clarified. */
  readonly clarifiedIntoType: string | null;
  /** ID of entity this item was clarified into, null until clarified. */
  readonly clarifiedIntoId: string | null;
}

// eslint-disable-next-line @typescript-eslint/no-namespace, no-redeclare
export namespace InboxItem {
  /**
   * Creates a new inbox item, generating a unique ID and current timestamps.
   *
   * @param workspaceId - FK -> `workspace.id`.
   * @param title - Raw capture title.
   * @param description - Optional longer description, defaults to null.
   * @returns A Result containing a new immutable InboxItem with `status='inbox'`, or a DomainError.
   */
  export function create(
    workspaceId: string,
    title: string,
    description: string | null = null
  ): Result<InboxItem, DomainError> {
    const checks: Result<void, DomainError>[] = [
      requireNonBlank(workspaceId, 'workspace_id_required'),
      requireNonBlank(title, 'title_required'),
      requireMaxLength(title, MAX_TITLE_LENGTH, 'title_too_long'),
    ];
    for (const check of checks) {
      if (!check.success) {
        return check;
      }
    }
    if (description !== null) {
      const descBlank = requireNonBlank(description, 'description_required');
      if (!descBlank.success) {
        return descBlank;
      }
      const descLen = requireMaxLength(description, MAX_DESCRIPTION_LENGTH, 'description_too_long');
      if (!descLen.success) {
        return descLen;
      }
    }
    const now = new Date().toISOString();
    return ok({
      id: crypto.randomUUID(),
      workspaceId,
      title,
      description,
      status: 'inbox' as const,
      createdAt: now,
      updatedAt: now,
      clarifiedIntoType: null,
      clarifiedIntoId: null,
    });
  }

  /**
   * Reconstitutes an InboxItem from raw persistent storage fields.
   *
   * @param fields - The raw fields from the database row.
   * @returns A Result containing a hydrated InboxItem entity, or a DomainError.
   */
  export function reconstitute(fields: InboxItem): Result<InboxItem, DomainError> {
    if (
      fields.status === 'clarified' &&
      (fields.clarifiedIntoType === null || fields.clarifiedIntoId === null)
    ) {
      return err(new DomainError('clarified_missing_target'));
    }
    if (
      fields.status === 'inbox' &&
      (fields.clarifiedIntoType !== null || fields.clarifiedIntoId !== null)
    ) {
      return err(new DomainError('inbox_has_clarified_fields'));
    }
    return ok({ ...fields });
  }

  /**
   * Transitions an inbox item from 'inbox' to 'clarified' status.
   *
   * @param item - The inbox item to clarify.
   * @param clarifiedIntoType - The type of entity this item was clarified into.
   * @param clarifiedIntoId - The ID of the entity this item was clarified into.
   * @returns A Result containing a new InboxItem with status 'clarified', or a DomainError.
   */
  export function clarify(
    item: InboxItem,
    clarifiedIntoType: string,
    clarifiedIntoId: string
  ): Result<InboxItem, DomainError> {
    if (item.status === 'clarified') {
      return err(new DomainError('already_clarified'));
    }
    const typeCheck = requireNonBlank(clarifiedIntoType, 'clarified_type_required');
    if (!typeCheck.success) {
      return typeCheck;
    }
    const idCheck = requireNonBlank(clarifiedIntoId, 'clarified_id_required');
    if (!idCheck.success) {
      return idCheck;
    }
    return ok({
      ...item,
      status: 'clarified' as const,
      clarifiedIntoType,
      clarifiedIntoId,
      updatedAt: new Date().toISOString(),
    });
  }
}
