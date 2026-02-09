/**
 * Minimal type shims for Cloudflare Workers bindings.
 *
 * Defines only the subset of D1Database and KVNamespace APIs used by
 * infrastructure adapters. Avoids pulling in the full
 * `@cloudflare/workers-types` package which may conflict with
 * the existing lib: ["ES2022", "WebWorker"] TypeScript configuration.
 */

/**
 * Result of a D1 query execution.
 */
export interface D1Result<T> {
  /** The rows returned by the query. */
  readonly results: T[];

  /** Whether the query was successful. */
  readonly success: boolean;
}

/**
 * A prepared D1 SQL statement with bound parameters.
 */
export interface D1PreparedStatement {
  /**
   * Binds positional parameters to the prepared statement.
   *
   * @param values - The values to bind to the statement placeholders
   * @returns A new prepared statement with values bound
   */
  bind(...values: unknown[]): D1PreparedStatement;

  /**
   * Executes the statement and returns the first row.
   *
   * @returns The first matching row, or null if none found
   */
  first<T>(): Promise<T | null>;

  /**
   * Executes the statement and returns all matching rows.
   *
   * @returns The query result containing all matching rows
   */
  all<T>(): Promise<D1Result<T>>;

  /**
   * Executes the statement without returning rows.
   *
   * @returns The query result
   */
  run(): Promise<D1Result<unknown>>;
}

/**
 * Minimal D1 database interface for SQL operations.
 */
export interface D1Database {
  /**
   * Prepares a SQL statement for execution.
   *
   * @param query - The SQL query string with ? placeholders
   * @returns A prepared statement that can be bound and executed
   */
  prepare(query: string): D1PreparedStatement;
}

/**
 * Options for KV put operations.
 */
export interface KVPutOptions {
  /** Time-to-live in seconds. The key will be automatically deleted after this duration. */
  readonly expirationTtl?: number;
}

/**
 * Minimal KV namespace interface for key-value operations.
 */
export interface KVNamespace {
  /**
   * Gets the value for a key as a string.
   *
   * @param key - The key to look up
   * @returns The value as a string, or null if not found
   */
  get(key: string): Promise<string | null>;

  /**
   * Stores a value with an optional TTL.
   *
   * @param key - The key to store
   * @param value - The string value to store
   * @param options - Optional put options including TTL
   */
  put(key: string, value: string, options?: KVPutOptions): Promise<void>;

  /**
   * Deletes a key.
   *
   * @param key - The key to delete
   */
  delete(key: string): Promise<void>;
}
