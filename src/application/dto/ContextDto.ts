/**
 * DTO for Context API responses.
 *
 * @module
 */

import type { Context } from '../../domain/entities/Context.js';

/** Context data transfer object excluding internal fields. */
export interface ContextDto {
  /** Unique identifier (UUID). */
  readonly id: string;
  /** Display name for the context. */
  readonly name: string;
  /** ISO-8601 UTC timestamp of context creation. */
  readonly createdAt: string;
}

/**
 * Maps a Context domain entity to a ContextDto.
 *
 * @param entity - The domain entity to map.
 * @returns A DTO without the internal workspaceId field.
 */
export function toContextDto(entity: Context): ContextDto {
  return {
    id: entity.id,
    name: entity.name,
    createdAt: entity.createdAt,
  };
}
