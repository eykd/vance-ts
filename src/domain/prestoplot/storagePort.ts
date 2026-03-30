/**
 * Storage port interface and DTO for grammar persistence.
 *
 * Defines the contract for loading, saving, deleting, and listing
 * grammar DTOs. Infrastructure adapters (KV, D1, InMemory) implement
 * this interface to provide persistence-specific behavior.
 *
 * @module domain/prestoplot/storagePort
 */

/**
 * Serialization format for storing and retrieving grammars.
 *
 * This is the persistence representation — domain Grammar objects
 * are converted to/from this DTO at the application boundary.
 * Rule order in the rules object is insertion order (V8-guaranteed).
 */
export interface GrammarDto {
  /** Schema version for forward compatibility. Currently 1. */
  readonly version: number;
  /** Unique identifier for this grammar. */
  readonly key: string;
  /** Default rule name to render. */
  readonly entry: string;
  /** Grammar keys to include (resolved transitively). */
  readonly includes: readonly string[];
  /** Map of rule name to serialized rule data. */
  readonly rules: Readonly<Record<string, unknown>>;
}

/**
 * Port for loading and persisting grammar data.
 *
 * Implementations provide storage-specific behavior while keeping
 * the application layer decoupled from infrastructure concerns.
 */
export interface StoragePort {
  /**
   * Load a grammar DTO by key.
   *
   * @param key - The unique grammar identifier.
   * @returns The grammar DTO, or null if not found.
   */
  load(key: string): Promise<GrammarDto | null>;

  /**
   * Save a grammar DTO. Overwrites if key exists.
   *
   * @param key - The unique grammar identifier.
   * @param grammar - The grammar DTO to persist.
   * @throws {import('./errors.js').StorageError} On write failure.
   */
  save(key: string, grammar: GrammarDto): Promise<void>;

  /**
   * Delete a grammar by key. No-op if not found.
   *
   * @param key - The unique grammar identifier.
   */
  delete(key: string): Promise<void>;

  /**
   * List all stored grammar keys.
   *
   * @returns An array of grammar keys.
   */
  keys(): Promise<readonly string[]>;
}
