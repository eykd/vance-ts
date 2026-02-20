# Contract: Shared Domain Types

**Type**: TypeScript Interface Specification
**Date**: 2026-02-16
**Location**: `src/domain/galaxy/`

## Overview

Shared domain types live in `src/domain/galaxy/` and are imported by both the generator (`tools/galaxy-generator/`) and the Workers application (`src/`). These types MUST be portable — no Node.js or Cloudflare Workers specific APIs.

## PRNG Interface

```typescript
// src/domain/galaxy/prng.ts

/** Seedable pseudorandom number generator interface. */
interface Prng {
  /** Returns a uniform random integer in [min, max] inclusive. */
  randint(min: number, max: number): number;

  /** Returns a uniform random float in [0, 1). */
  random(): number;
}
```

## Coordinate

```typescript
// src/domain/galaxy/types.ts

/** Integer coordinate pair representing a star system position. */
interface Coordinate {
  readonly x: number;
  readonly y: number;
}
```

## Classification

```typescript
// src/domain/galaxy/types.ts

/** Star system political/narrative category. */
enum Classification {
  OIKUMENE = 'oikumene',
  UNINHABITED = 'uninhabited',
  LOST_COLONY = 'lost_colony',
  HIDDEN_ENCLAVE = 'hidden_enclave',
}
```

## Star System Types

```typescript
// src/domain/galaxy/types.ts

/** Local stellar density metrics. */
interface DensityData {
  readonly neighborCount: number;
  readonly environmentPenalty: number;
}

/** Technology, Environment, Resources scores. */
interface TerRating {
  readonly technology: number;
  readonly environment: number;
  readonly resources: number;
}

/** Physical world characteristics. */
interface PlanetaryData {
  readonly size: number;
  readonly atmosphere: number;
  readonly temperature: number;
  readonly hydrography: number;
}

/** Population and governance data. */
interface CivilizationData {
  readonly population: number;
  readonly starport: number;
  readonly government: number;
  readonly factions: number;
  readonly lawLevel: number;
}

/** Derived economic values. */
interface EconomicsData {
  readonly gurpsTechLevel: number;
  readonly perCapitaIncome: number;
  readonly grossWorldProduct: number;
  readonly resourceMultiplier: number;
  readonly worldTradeNumber: number;
}

/** Complete star system record. */
interface StarSystem {
  readonly id: string;
  readonly name: string;
  readonly x: number;
  readonly y: number;
  readonly isOikumene: boolean;
  readonly classification: Classification;
  readonly density: DensityData;
  readonly attributes: TerRating;
  readonly planetary: PlanetaryData;
  readonly civilization: CivilizationData;
  readonly tradeCodes: readonly string[];
  readonly economics: EconomicsData;
}
```

## Route Types

```typescript
// src/domain/galaxy/types.ts

/** A pre-computed navigable path between two star systems. */
interface Route {
  readonly originId: string;
  readonly destinationId: string;
  readonly cost: number;
  readonly path: readonly Coordinate[];
}
```

## Cost Map Types

```typescript
// src/domain/galaxy/types.ts

/** Cost map quantization parameters for PNG ↔ actual cost conversion. */
interface CostMapQuantization {
  readonly minCost: number;
  readonly maxCost: number;
  readonly gridOriginX: number;
  readonly gridOriginY: number;
  readonly gridWidth: number;
  readonly gridHeight: number;
}
```

## A\* Pathfinding Interface

```typescript
// src/domain/galaxy/pathfinding.ts

/** Result of an A* pathfinding computation. */
interface PathfindingResult {
  readonly path: readonly Coordinate[];
  readonly totalCost: number;
}

/** A* pathfinder that operates on a cost map. */
interface Pathfinder {
  /**
   * Finds the lowest-cost path between two coordinates on the cost map.
   *
   * @param start - Starting coordinate
   * @param end - Destination coordinate
   * @returns Path and total cost, or null if no path exists
   */
  findPath(start: Coordinate, end: Coordinate): PathfindingResult | null;
}
```

## Dice Utilities

```typescript
// src/domain/galaxy/dice.ts

/** Rolls 4 Fate dice (4dF), producing a value from -4 to +4. */
function roll4dF(rng: Prng): number;

/** Rolls NdS (N dice with S sides), producing a value from N to N*S. */
function rollNdS(rng: Prng, count: number, sides: number): number;
```

## Galaxy Generator Interfaces

These interfaces live in the generator tool directory (`tools/galaxy-generator/src/galaxy/`) since they are specific to the galaxy generation algorithm, not shared domain types. They are documented here for completeness.

```typescript
// tools/galaxy-generator/src/galaxy/elliptic-starfield.ts

/** Parameters for the elliptic starfield generator (Level 3). */
interface EllipticStarfieldParams {
  /** Number of stars to place in this cloud. */
  readonly amount: number;
  /** Center position of the elliptical cloud [x, y]. */
  readonly center: readonly [number, number];
  /** Ellipse radii [rx, ry] — typically the rotated arm position. */
  readonly radius: readonly [number, number];
  /** Rotation angle for the starfield (radians). 0 = no rotation. */
  readonly turn: number;
  /** Output coordinate scaling factor. 1 = no scaling. */
  readonly multiplier: number;
  /** Shared PRNG instance. State advances with each star placed. */
  readonly rng: Prng;
}
```

```typescript
// tools/galaxy-generator/src/galaxy/spiral-arm-generator.ts

/** Parameters for the spiral arm generator (Level 2). Pre-computed at galaxy level. */
interface SpiralArmParams {
  /** Galaxy center position [x, y]. */
  readonly center: readonly [number, number];
  /** Size converted to radians: 2.0 * size[0] * π / 360.0. */
  readonly sx: number;
  /** Size converted to radians: 2.0 * size[1] * π / 360.0. */
  readonly sy: number;
  /** Angular offset for this arm: (arm / arms) * 2 * π. */
  readonly shift: number;
  /** Base rotation angle (radians). */
  readonly turn: number;
  /** Spiral extent in degrees. Walk continues while n <= deg. */
  readonly deg: number;
  /** Cloud x-radius: round(deg / π * sx / 1.7) * dynSizeFactor. */
  readonly xp1: number;
  /** Cloud y-radius: round(deg / π * sy / 1.7) * dynSizeFactor. */
  readonly yp1: number;
  /** Stars-per-cloud factor: (xp1 + yp1) / spcFactor. */
  readonly mulStarAmount: number;
  /** Distance scaling factor. */
  readonly dynSizeFactor: number;
  /** Output coordinate scaling factor. */
  readonly multiplier: number;
  /** Shared PRNG instance. */
  readonly rng: Prng;
}
```

```typescript
// tools/galaxy-generator/src/galaxy/galaxy-generator.ts

/** Top-level configuration for the galaxy generator (Level 1). */
interface GalaxyGeneratorConfig {
  /** Galaxy center position [x, y]. Default: [0, 0]. */
  readonly center: readonly [number, number];
  /** Input size (converted internally to radians). Default: [4000, 4000]. */
  readonly size: readonly [number, number];
  /** Base rotation angle (radians). Default: 0. */
  readonly turn: number;
  /** Spiral extent in degrees. Default: 5. */
  readonly deg: number;
  /** Distance scaling factor. Default: 1. */
  readonly dynSizeFactor: number;
  /** Stars-per-cloud divisor. Higher = fewer stars per cloud. Default: 8. */
  readonly spcFactor: number;
  /** Number of spiral arms. Default: 4. */
  readonly arms: number;
  /** Output coordinate scaling factor. Default: 1. */
  readonly multiplier: number;
  /** Maximum total star count, or null for unlimited. Default: null. */
  readonly limit: number | null;
  /** Shared PRNG instance. */
  readonly rng: Prng;
}
```

## Portability Contract

All types in `src/domain/galaxy/` MUST:

1. Use only ES2022 standard APIs (no Node.js, no Workers-specific)
2. Have no runtime dependencies beyond the PRNG interface
3. Be purely declarative (interfaces, enums, type aliases) or contain only portable logic
4. Be importable by both the generator and Workers without modification
