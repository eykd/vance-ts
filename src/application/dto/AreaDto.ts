/**
 * AreaDto — data transfer object for area responses.
 *
 * Used by {@link ListAreasUseCase} to return area data across the application
 * boundary without exposing the domain entity directly.
 *
 * @module
 */

/**
 * Data transfer object representing an area in API responses.
 */
export type AreaDto = {
  /** Unique identifier (UUID). */
  id: string;
  /** Display name for the area. */
  name: string;
  /** Lifecycle status of the area. */
  status: 'active' | 'archived';
  /** ISO-8601 UTC timestamp of area creation. */
  createdAt: string;
  /** ISO-8601 UTC timestamp of last area update. */
  updatedAt: string;
};
