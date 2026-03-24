# Repository Interface Contracts

**Branch**: `015-galaxy-seed-d1` | **Date**: 2026-03-24

## StarSystemRepository

```typescript
/** Port for querying star system data from persistent storage. */
interface StarSystemRepository {
  /** Find a star system by its unique ID. Returns null if not found. */
  findById(id: string): Promise<StarSystem | null>;

  /** Search star systems by exact name match. Returns null if not found. */
  findByName(name: string): Promise<StarSystem | null>;

  /** Search star systems by name prefix. Returns matching systems sorted by name. */
  searchByNamePrefix(prefix: string, limit?: number): Promise<readonly StarSystem[]>;
}
```

**Location**: `src/application/ports/StarSystemRepository.ts`

## RouteRepository

```typescript
/** A connected system with the cost to reach it. */
interface ConnectedSystem {
  readonly system: StarSystem;
  readonly cost: number;
}

/** Port for querying pre-computed routes between star systems. */
interface RouteRepository {
  /** Find all systems directly connected to the given system via routes. */
  findConnectedSystems(systemId: string): Promise<readonly ConnectedSystem[]>;

  /** Find the route between two specific systems. Returns null if no direct route. */
  findRoute(systemAId: string, systemBId: string): Promise<Route | null>;
}
```

**Location**: `src/application/ports/RouteRepository.ts`

**Notes**:

- `findConnectedSystems` queries both directions (origin_id and destination_id) due to lexicographic storage.
- Returns full StarSystem objects joined from star_systems table, not just IDs.
- Route type excludes `path` (not stored in D1).

## TradePairRepository

```typescript
/** A trade partner with its BTN value and hop count. */
interface TradePairPartner {
  readonly system: StarSystem;
  readonly btn: number;
  readonly hops: number;
}

/** Port for querying pre-computed bilateral trade data. */
interface TradePairRepository {
  /** Find all trade partners for a system, ordered by descending BTN. */
  findTradePartners(systemId: string): Promise<readonly TradePairPartner[]>;
}
```

**Location**: `src/application/ports/TradePairRepository.ts`

**Notes**:

- Results ordered by descending BTN (highest trade volume first).
- Returns full StarSystem objects joined from star_systems table.
- Only includes pairs with BTN > 0.

## Domain Types (Runtime)

The runtime `Route` type omits the `path` field (not stored in D1):

```typescript
/** Route as stored in D1 (no path coordinates). */
interface StoredRoute {
  readonly originId: string;
  readonly destinationId: string;
  readonly cost: number;
}
```

**Note**: The existing `Route` interface in `src/domain/galaxy/types.ts` includes `path`. The D1 implementation returns `StoredRoute` which is a subset. The repository may return the full `Route` type with an empty path, or a new `StoredRoute` type may be introduced. This decision is deferred to implementation.
