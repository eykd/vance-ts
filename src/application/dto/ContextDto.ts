/**
 * ContextDto — data transfer object for context responses.
 *
 * Used by {@link ListContextsUseCase} to return context data across the
 * application boundary without exposing the domain entity directly.
 *
 * @module
 */

/**
 * Data transfer object representing a context in API responses.
 */
export type ContextDto = {
  /** Unique identifier (UUID). */
  id: string;
  /** Display name for the context. */
  name: string;
  /** ISO-8601 UTC timestamp of context creation. */
  createdAt: string;
};
