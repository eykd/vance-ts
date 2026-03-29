/**
 * DTO for Action API responses.
 *
 * @module
 */

import type { Action } from '../../domain/entities/Action.js';

/** Action data transfer object excluding internal fields. */
export interface ActionDto {
  /** Unique identifier. */
  readonly id: string;
  /** Action title. */
  readonly title: string;
  /** Optional longer description. */
  readonly description: string | null;
  /** Lifecycle status. */
  readonly status: Action['status'];
  /** FK -> area. */
  readonly areaId: string;
  /** FK -> context. */
  readonly contextId: string;
  /** ISO-8601 UTC creation timestamp. */
  readonly createdAt: string;
  /** ISO-8601 UTC last-update timestamp. */
  readonly updatedAt: string;
}

/**
 * Maps an Action domain entity to an ActionDto.
 *
 * @param entity - The domain entity to map.
 * @returns A DTO without internal workspaceId and actorId fields.
 */
export function toActionDto(entity: Action): ActionDto {
  return {
    id: entity.id,
    title: entity.title,
    description: entity.description,
    status: entity.status,
    areaId: entity.areaId,
    contextId: entity.contextId,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  };
}
