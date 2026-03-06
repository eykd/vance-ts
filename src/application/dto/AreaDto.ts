/**
 * DTO for Area API responses.
 *
 * @module
 */

import type { Area } from '../../domain/entities/Area.js';

/** Area data transfer object excluding internal fields. */
export interface AreaDto {
  /** Unique identifier (UUID). */
  readonly id: string;
  /** Display name for the area. */
  readonly name: string;
  /** Lifecycle status of the area. */
  readonly status: Area['status'];
  /** ISO-8601 UTC timestamp of area creation. */
  readonly createdAt: string;
  /** ISO-8601 UTC timestamp of last area update. */
  readonly updatedAt: string;
}

/**
 * Maps an Area domain entity to an AreaDto.
 *
 * @param entity - The domain entity to map.
 * @returns A DTO without the internal workspaceId field.
 */
export function toAreaDto(entity: Area): AreaDto {
  return {
    id: entity.id,
    name: entity.name,
    status: entity.status,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  };
}
