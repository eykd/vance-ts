/**
 * D1-backed implementation of the RouteRepository port.
 *
 * @module infrastructure/galaxy/D1RouteRepository
 */

import type { ConnectedSystem, RouteRepository } from '../../domain/interfaces/RouteRepository.js';

import { assertConnectedSystemRow, mapRowToConnectedSystem } from './mappers.js';

/**
 * Retrieves route data from a Cloudflare D1 database.
 */
export class D1RouteRepository implements RouteRepository {
  /** The D1 database binding. */
  private readonly db: D1Database;

  /**
   * Creates a new D1RouteRepository.
   *
   * @param db - The D1 database binding
   */
  constructor(db: D1Database) {
    this.db = db;
  }

  /**
   * Finds all star systems directly connected to the given system via routes.
   *
   * Uses UNION ALL for bidirectional lookup: queries where the system is the
   * origin and where it is the destination, for index efficiency.
   *
   * @param systemId - The identifier of the star system
   * @returns An array of connected systems with their route costs
   */
  async findConnectedSystems(systemId: string): Promise<readonly ConnectedSystem[]> {
    const sql = `
      SELECT s.*, r.cost
      FROM routes r
      JOIN star_systems s ON s.id = r.destination_id
      WHERE r.origin_id = ?
      UNION ALL
      SELECT s.*, r.cost
      FROM routes r
      JOIN star_systems s ON s.id = r.origin_id
      WHERE r.destination_id = ?
    `;

    const rows = await this.db.prepare(sql).bind(systemId, systemId).all();

    return rows.results.map((row) => mapRowToConnectedSystem(assertConnectedSystemRow(row)));
  }
}
