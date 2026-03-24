/**
 * D1-backed implementation of the TradePairRepository port.
 *
 * @module infrastructure/galaxy/D1TradePairRepository
 */

import type {
  TradePairPartner,
  TradePairRepository,
} from '../../application/ports/TradePairRepository.js';

import type { StarSystemRow } from './mappers.js';
import { mapRowToTradePairPartner } from './mappers.js';

/** D1 row shape for a joined trade_pairs + star_systems query. */
type TradePairPartnerRow = StarSystemRow & {
  readonly btn: number;
  readonly hops: number;
};

/**
 * Retrieves trade pair data from a Cloudflare D1 database.
 */
export class D1TradePairRepository implements TradePairRepository {
  /** The D1 database binding. */
  private readonly db: D1Database;

  /**
   * Creates a new D1TradePairRepository.
   *
   * @param db - The D1 database binding
   */
  constructor(db: D1Database) {
    this.db = db;
  }

  /**
   * Finds all trade partners for the given star system, ordered by descending BTN.
   *
   * Uses UNION ALL for bidirectional lookup: queries where the system is system_a
   * and where it is system_b, for index efficiency.
   *
   * @param systemId - The identifier of the star system
   * @returns An array of trade partners with BTN values, ordered by BTN descending
   */
  async findTradePartners(systemId: string): Promise<readonly TradePairPartner[]> {
    const sql = `
      SELECT s.*, tp.btn, tp.hops
      FROM trade_pairs tp
      JOIN star_systems s ON s.id = tp.system_b_id
      WHERE tp.system_a_id = ?
      UNION ALL
      SELECT s.*, tp.btn, tp.hops
      FROM trade_pairs tp
      JOIN star_systems s ON s.id = tp.system_a_id
      WHERE tp.system_b_id = ?
      ORDER BY btn DESC
    `;

    const rows = await this.db.prepare(sql).bind(systemId, systemId).all();

    return rows.results.map((row) =>
      mapRowToTradePairPartner(row as unknown as TradePairPartnerRow)
    );
  }
}
