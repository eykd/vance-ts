/**
 * D1-backed implementation of the StarSystemRepository port.
 *
 * @module infrastructure/galaxy/D1StarSystemRepository
 */

import type { StarSystem } from '../../domain/galaxy/types.js';
import type { StarSystemRepository } from '../../domain/interfaces/StarSystemRepository.js';

import type { StarSystemRow } from './mappers.js';
import { mapRowToStarSystem } from './mappers.js';

/** Default maximum number of results for prefix search. */
const DEFAULT_PREFIX_LIMIT = 50;

/** Minimum prefix length required for prefix search. */
const MIN_PREFIX_LENGTH = 2;

/**
 * Escape LIKE metacharacters (%, _, \) in a string for safe use in a LIKE clause.
 *
 * @param value - The raw string to escape
 * @returns The escaped string safe for use in a LIKE pattern with ESCAPE '\'
 */
function escapeLikePattern(value: string): string {
  return value.replace(/[\\%_]/g, (ch) => `\\${ch}`);
}

/**
 * Retrieves star system data from a Cloudflare D1 database.
 */
export class D1StarSystemRepository implements StarSystemRepository {
  /** The D1 database binding. */
  private readonly db: D1Database;

  /**
   * Creates a new D1StarSystemRepository.
   *
   * @param db - The D1 database binding
   */
  constructor(db: D1Database) {
    this.db = db;
  }

  /**
   * Finds a star system by its unique identifier.
   *
   * @param id - The star system identifier
   * @returns The matching star system, or null if not found
   */
  async findById(id: string): Promise<StarSystem | null> {
    const row = await this.db.prepare('SELECT * FROM star_systems WHERE id = ?').bind(id).first();

    if (row === null) {
      return null;
    }

    return mapRowToStarSystem(row as unknown as StarSystemRow);
  }

  /**
   * Finds a star system by its exact name.
   *
   * @param name - The star system name
   * @returns The matching star system, or null if not found
   */
  async findByName(name: string): Promise<StarSystem | null> {
    const row = await this.db
      .prepare('SELECT * FROM star_systems WHERE name = ?')
      .bind(name)
      .first();

    if (row === null) {
      return null;
    }

    return mapRowToStarSystem(row as unknown as StarSystemRow);
  }

  /**
   * Searches for star systems whose names start with the given prefix.
   *
   * Escapes LIKE metacharacters (%, _, \) in the prefix to prevent injection.
   * Requires a minimum prefix length of 2 characters.
   *
   * @param prefix - The name prefix to search for (minimum 2 characters)
   * @param limit - Maximum number of results (defaults to 50)
   * @returns An array of matching star systems, or empty array if prefix is too short
   */
  async searchByNamePrefix(
    prefix: string,
    limit: number = DEFAULT_PREFIX_LIMIT
  ): Promise<readonly StarSystem[]> {
    if (prefix.length < MIN_PREFIX_LENGTH) {
      return [];
    }

    const escapedPrefix = escapeLikePattern(prefix);
    const rows = await this.db
      .prepare("SELECT * FROM star_systems WHERE name LIKE ? ESCAPE '\\' ORDER BY name LIMIT ?")
      .bind(`${escapedPrefix}%`, limit)
      .all();

    return rows.results.map((row) => mapRowToStarSystem(row as unknown as StarSystemRow));
  }
}
