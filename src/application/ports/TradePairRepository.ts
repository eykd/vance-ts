import type { StarSystem } from '../../domain/galaxy/types';

/**
 * A star system that is a trade partner, along with its bilateral trade number and hop distance.
 */
export interface TradePairPartner {
  /** The partner star system. */
  readonly system: StarSystem;
  /** The bilateral trade number (BTN) for this trade pair. */
  readonly btn: number;
  /** The number of route hops to reach this partner. */
  readonly hops: number;
}

/**
 * Port interface for accessing trade pair data between star systems.
 *
 * Implementations provide persistence-specific retrieval of trade partners.
 */
export interface TradePairRepository {
  /**
   * Finds all trade partners for the given star system, ordered by descending BTN.
   *
   * @param systemId - The identifier of the origin star system.
   * @returns An array of trade partners with their BTN values, ordered by descending BTN.
   */
  findTradePartners(systemId: string): Promise<readonly TradePairPartner[]>;
}
