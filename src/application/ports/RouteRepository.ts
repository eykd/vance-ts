import type { StarSystem } from '../../domain/galaxy/types';

/**
 * A star system reachable via a route, along with the traversal cost.
 */
export interface ConnectedSystem {
  /** The connected star system. */
  readonly system: StarSystem;
  /** The cost of traversing the route to this system. */
  readonly cost: number;
}

/**
 * Port interface for accessing route data between star systems.
 *
 * Implementations provide persistence-specific retrieval of routes.
 */
export interface RouteRepository {
  /**
   * Finds all star systems directly connected to the given system via routes.
   *
   * @param systemId - The identifier of the origin star system.
   * @returns An array of connected systems with their route costs.
   */
  findConnectedSystems(systemId: string): Promise<readonly ConnectedSystem[]>;
}
