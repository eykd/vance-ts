/**
 * InboxItem entity.
 *
 * A raw capture that has entered the system but has not yet been clarified
 * into an actionable task. Lives in the inbox until processed.
 *
 * @module
 */

import { DomainError } from '../errors/DomainError.js';

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
   * @returns A new immutable InboxItem with `status='inbox'`.
   */
  export function create(
    workspaceId: string,
    title: string,
    description: string | null = null
  ): InboxItem {
    if (workspaceId.trim().length === 0) {
      throw new DomainError('workspace_id_required');
    }
    if (title.trim().length === 0) {
      throw new DomainError('title_required');
    }
    if (title.length > MAX_TITLE_LENGTH) {
      throw new DomainError('title_too_long');
    }
    if (description !== null && description.length > MAX_DESCRIPTION_LENGTH) {
      throw new DomainError('description_too_long');
    }
    const now = new Date().toISOString();
    return {
      id: crypto.randomUUID(),
      workspaceId,
      title,
      description,
      status: 'inbox',
      createdAt: now,
      updatedAt: now,
      clarifiedIntoType: null,
      clarifiedIntoId: null,
    };
  }

  /**
   * Reconstitutes an InboxItem from raw persistent storage fields.
   *
   * @param fields - The raw fields from the database row.
   * @returns A hydrated InboxItem entity.
   */
  export function reconstitute(fields: InboxItem): InboxItem {
    if (
      fields.status === 'clarified' &&
      (fields.clarifiedIntoType === null || fields.clarifiedIntoId === null)
    ) {
      throw new DomainError('clarified_missing_target');
    }
    return { ...fields };
  }

  /**
   * Transitions an inbox item from 'inbox' to 'clarified' status.
   *
   * @param item - The inbox item to clarify.
   * @param clarifiedIntoType - The type of entity this item was clarified into.
   * @param clarifiedIntoId - The ID of the entity this item was clarified into.
   * @returns A new InboxItem with status 'clarified'.
   */
  export function clarify(
    item: InboxItem,
    clarifiedIntoType: string,
    clarifiedIntoId: string
  ): InboxItem {
    if (item.status === 'clarified') {
      throw new DomainError('already_clarified');
    }
    if (clarifiedIntoType.trim().length === 0) {
      throw new DomainError('clarified_type_required');
    }
    if (clarifiedIntoId.trim().length === 0) {
      throw new DomainError('clarified_id_required');
    }
    return {
      ...item,
      status: 'clarified',
      clarifiedIntoType,
      clarifiedIntoId,
      updatedAt: new Date().toISOString(),
    };
  }
}
