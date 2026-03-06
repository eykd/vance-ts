/**
 * DTO for InboxItem API responses.
 *
 * @module
 */

import type { InboxItem } from '../../domain/entities/InboxItem.js';

/** InboxItem data transfer object excluding internal fields. */
export interface InboxItemDto {
  /** Unique identifier. */
  readonly id: string;
  /** Raw capture title. */
  readonly title: string;
  /** Optional longer description. */
  readonly description: string | null;
  /** Lifecycle status. */
  readonly status: string;
  /** Type of entity this item was clarified into. */
  readonly clarifiedIntoType: string | null;
  /** ID of entity this item was clarified into. */
  readonly clarifiedIntoId: string | null;
  /** ISO-8601 UTC creation timestamp. */
  readonly createdAt: string;
  /** ISO-8601 UTC last-update timestamp. */
  readonly updatedAt: string;
}

/**
 * Maps an InboxItem domain entity to an InboxItemDto.
 *
 * @param entity - The domain entity to map.
 * @returns A DTO without the internal workspaceId field.
 */
export function toInboxItemDto(entity: InboxItem): InboxItemDto {
  return {
    id: entity.id,
    title: entity.title,
    description: entity.description,
    status: entity.status,
    clarifiedIntoType: entity.clarifiedIntoType,
    clarifiedIntoId: entity.clarifiedIntoId,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  };
}
