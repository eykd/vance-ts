/**
 * D1-backed implementation of the StarSystemRepository port.
 *
 * @module infrastructure/galaxy/D1StarSystemRepository
 */

import type { StarSystem } from '../../domain/galaxy/types.js';

import { mapRowToStarSystem } from './mappers.js';

/**
 * Retrieves star system data from a Cloudflare D1 database.
 */
export class D1StarSystemRepository {
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

    return mapRowToStarSystem(row as unknown as Parameters<typeof mapRowToStarSystem>[0]);
  }
}
