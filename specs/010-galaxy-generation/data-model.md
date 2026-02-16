# Data Model: Galaxy Generation Pipeline

**Feature**: 010-galaxy-generation
**Date**: 2026-02-16

## Entities

### StarSystem

The core entity. Each star system is a unique location in the galaxy with generated attributes.

| Field          | Type             | Description                            | Constraints                 |
| -------------- | ---------------- | -------------------------------------- | --------------------------- |
| id             | string           | UUID v4, generated from PRNG           | Unique                      |
| name           | string           | Pronounceable generated name           | Unique                      |
| x              | number           | Integer X coordinate                   | Integer, unique pair with y |
| y              | number           | Integer Y coordinate                   | Integer, unique pair with x |
| isOikumene     | boolean          | Whether system belongs to the Oikumene |                             |
| classification | Classification   | Political/narrative category           | Enum                        |
| density        | DensityData      | Local stellar density metrics          |                             |
| attributes     | TerRating        | Technology, Environment, Resources     |                             |
| planetary      | PlanetaryData    | Physical world characteristics         |                             |
| civilization   | CivilizationData | Population and governance              |                             |
| tradeCodes     | string[]         | Derived trade classifications          |                             |
| economics      | EconomicsData    | Derived economic values                |                             |

### Route

A pre-computed navigable path between two star systems.

| Field         | Type               | Description                                         | Constraints                                                 |
| ------------- | ------------------ | --------------------------------------------------- | ----------------------------------------------------------- |
| originId      | string             | UUID of origin system                               | FK to StarSystem.id, origin < destination lexicographically |
| destinationId | string             | UUID of destination system                          | FK to StarSystem.id                                         |
| cost          | number             | Total traversal cost along path                     | Positive float                                              |
| path          | [number, number][] | Ordered grid coordinates from origin to destination | Non-empty array                                             |

### CostMap

A 2D grid of traversal costs covering the galaxy coordinate space.

| Field   | Type       | Description                             | Constraints              |
| ------- | ---------- | --------------------------------------- | ------------------------ |
| data    | Uint8Array | Flat array of quantized cost values     | Length = width \* height |
| width   | number     | Grid width in cells                     | Positive integer         |
| height  | number     | Grid height in cells                    | Positive integer         |
| originX | number     | X coordinate of grid origin (top-left)  | Integer                  |
| originY | number     | Y coordinate of grid origin (top-left)  | Integer                  |
| minCost | number     | Minimum actual cost (maps to pixel 0)   | Positive float           |
| maxCost | number     | Maximum actual cost (maps to pixel 255) | Positive float           |

### GalaxyMetadata

Pipeline configuration and summary statistics.

| Field          | Type            | Description                      |
| -------------- | --------------- | -------------------------------- |
| seed           | string          | Master seed used for generation  |
| generatedAt    | string          | ISO 8601 UTC timestamp           |
| galaxyConfig   | GalaxyConfig    | Star placement parameters        |
| costMapConfig  | CostMapConfig   | Grid dimensions and quantization |
| perlinConfig   | PerlinConfig    | Noise layer parameters           |
| caConfig       | CaConfig        | Cellular automata parameters     |
| oikumeneConfig | OikumeneConfig  | Oikumene selection parameters    |
| routeConfig    | RouteConfig     | Route computation parameters     |
| stats          | GenerationStats | Summary statistics               |

---

## Value Objects

### Classification (enum)

```
OIKUMENE        — Civilized, high-tech, well-connected
UNINHABITED     — Empty Beyond system (default ~85%)
LOST_COLONY     — Technologically regressed Beyond settlement (~5-8%)
HIDDEN_ENCLAVE  — Small, secretive, high-tech Beyond outpost (~5-8%)
```

### Coordinate

```
{ x: number, y: number }  — Integer pair, unique per system
```

### DensityData

```
{ neighborCount: number, environmentPenalty: number }
```

- neighborCount: systems within DENSITY_RADIUS
- environmentPenalty: derived as -floor(min(neighborCount, 16) / 4), range [0, -4]

### TerRating

```
{ technology: number, environment: number, resources: number }
```

- Each generated via 4dF roll with classification biases
- Range: typically -4 to +4 (before bias clamping)

### PlanetaryData

```
{ size: number, atmosphere: number, temperature: number, hydrography: number }
```

- Derived from TER and dice rolls per Star Cluster Guide formulas

### CivilizationData

```
{ population: number, starport: number, government: number, factions: number, lawLevel: number }
```

- Population biased by classification (Oikumene >= 6, Uninhabited = 0, etc.)

### EconomicsData

```
{ gurpsTechLevel: number, perCapitaIncome: number, grossWorldProduct: number, resourceMultiplier: number, worldTradeNumber: number }
```

- Derived from attribute combinations per Star Cluster Guide formulas

---

## Configuration Value Objects

### GalaxyConfig

```
{ center: [number, number], size: [number, number], turn: number, deg: number, dynSizeFactor: number, spcFactor: number, arms: number, multiplier: number, limit: number | null, seed: string }
```

### CostMapConfig

```
{ gridOriginX: number, gridOriginY: number, gridWidth: number, gridHeight: number, padding: number, minCost: number, maxCost: number, baseOpenCost: number, openNoiseWeight: number, baseWallCost: number, wallNoiseWeight: number }
```

### PerlinConfig

```
{ baseLayer: { frequency: number, octaves: number }, wallLayer: { frequency: number, octaves: number } }
```

### CaConfig

```
{ fillProbability: number, iterations: number, rule: string }
```

### OikumeneConfig

```
{ coreExclusionRadius: number, clusterRadius: number, targetCount: number }
```

### RouteConfig

```
{ maxRange: number }
```

### GenerationStats

```
{ totalSystems: number, oikumeneSystems: number, beyondSystems: number, beyondUninhabited: number, beyondLostColonies: number, beyondHiddenEnclaves: number, oikumeneRoutes: number, averageRouteCost: number }
```

---

## Relationships

```
StarSystem 1──* Route (as origin)
StarSystem 1──* Route (as destination)
StarSystem *──1 Classification
StarSystem 1──1 DensityData
StarSystem 1──1 TerRating
StarSystem 1──1 PlanetaryData
StarSystem 1──1 CivilizationData
StarSystem 1──1 EconomicsData
StarSystem 1──* TradeCode (string[])

CostMap ← used by → Route (pathfinding)
GalaxyMetadata ← references → all config objects
```

---

## State Transitions

Star systems do not change state during generation. The pipeline is a single pass:

```
Coordinates → Density → Classification → Attributes → Names/IDs → Output
```

Routes are computed after all systems are fully generated.

---

## Validation Rules

### StarSystem

- x, y must be integers
- No two systems share the same (x, y)
- id must be unique across all systems
- name must be unique across all systems
- If classification = OIKUMENE: technology >= +1, population >= 6
- If classification = UNINHABITED: population = 0
- If classification = LOST_COLONY: technology <= -2
- If classification = HIDDEN_ENCLAVE: technology >= +2, population <= 4

### Route

- originId < destinationId (lexicographic ordering, stored unidirectionally)
- cost > 0
- path must be non-empty
- path[0] must correspond to origin system coordinates
- path[last] must correspond to destination system coordinates

### CostMap

- All values in range [0, 255] (uint8)
- Open corridor cells decode to cost range 1-3
- Wall cells decode to cost range 10-30
- Boundary cells must be walls

### Galaxy-wide

- Total systems: 10,000-14,000
- Oikumene systems: 230-270
- Beyond breakdown: ~85% uninhabited, ~5-8% lost colonies, ~5-8% hidden enclaves
- Oikumene network must be fully connected
- Two identical seeds must produce byte-for-byte identical output
