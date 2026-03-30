import type { StarSystem } from '../galaxy/types';

/**
 * Port interface for accessing star system data.
 *
 * Implementations provide persistence-specific retrieval of star systems.
 */
export interface StarSystemRepository {
  /**
   * Finds a star system by its unique identifier.
   *
   * @param id - The star system identifier.
   * @returns The matching star system, or null if not found.
   */
  findById(id: string): Promise<StarSystem | null>;

  /**
   * Finds a star system by its name.
   *
   * @param name - The star system name.
   * @returns The matching star system, or null if not found.
   */
  findByName(name: string): Promise<StarSystem | null>;

  /**
   * Searches for star systems whose names start with the given prefix.
   *
   * @param prefix - The name prefix to search for.
   * @param limit - Optional maximum number of results to return.
   * @returns An array of matching star systems.
   */
  searchByNamePrefix(prefix: string, limit?: number): Promise<readonly StarSystem[]>;
}
