# Unified Galaxy Generation Pipeline

## Specification for Star System and Route Generation

_For a text-based MMORPG inspired by Jack Vance's Oikumene_

---

## 1. Overview

This document specifies a local generation pipeline that produces all the star systems, navigable routes, and terrain data for a galaxy-scale game world. The pipeline runs on a developer's machine (not in production) and outputs a set of JSON and PNG files that are subsequently loaded into a D1 database via a migration script.

The galaxy is divided into two political/narrative regions:

**The Oikumene** — A tight network of ~250 civilized, high-tech, well-connected star systems strung along a spiral arm. Routes between Oikumene systems are well-known, pre-computed, and available to all players from the start.

**The Beyond** — Everything else. ~11,750 systems, mostly uninhabited, with scattered pockets of civilization. Routes in the Beyond are hidden and must be discovered by players through exploration. Travel through the Beyond is more expensive, slower, and more dangerous.

### 1.1 Design Principles

**Emergent geography.** The galaxy's navigable structure arises from layered procedural generation (spiral galaxy placement → Perlin noise → cellular automata), not manual design. "Safe corridors" and "impassable dust" are products of the algorithm.

**Emergent habitability.** A system's environmental hostility is driven by its local stellar density, not by political designation. The packed galactic core is harsh because stars are close together; the outer arms are more hospitable because stars are spread out.

**Terrain as cost, not barrier.** The cellular automata grid defines a traversal cost map, not a hard boundary. Open corridors are cheap to traverse; occluded regions are expensive but not impossible. This allows players to find hidden shortcuts and off-the-beaten-path routes.

**Generation is offline; play is online.** The entire pipeline runs once (or rarely) on a local machine. The output is loaded into D1 and served by Cloudflare Workers at runtime. The Workers only need to perform local-neighborhood pathfinding for player exploration, not full galaxy generation.

### 1.2 Target Environment

- **Generation:** TypeScript running under Node.js on a local machine (macOS, Apple Silicon).
- **Output:** JSON files, PNG cost map, consumed by a D1 migration loader.
- **Runtime:** Cloudflare Workers with D1 storage.
- **Constraints:** No Node.js-specific APIs in the generation code that couldn't be replaced for Workers if needed, but Worker compatibility is not a hard requirement for the generator itself.

### 1.3 Source Specifications

This document reconciles and unifies three prior specifications:

| Source                   | Contribution                                                                                 |
| ------------------------ | -------------------------------------------------------------------------------------------- |
| Galaxy Generator Spec    | Spiral galaxy star placement algorithm                                                       |
| Star Cluster Guide       | System attribute generation (TER ratings, planetary characteristics, trade codes, economics) |
| Cavern Cellular Automata | Cellular automata technique for carving navigable corridors                                  |

---

## 2. Pipeline Stages

The generation pipeline executes the following stages in order:

```
1. Galaxy Generation        → ~12,000 star positions at integer coordinates
2. Cost Map Generation      → 2D traversal cost grid (Perlin + CA + Perlin)
3. Density Calculation      → Local stellar density per system
4. Oikumene Selection       → ~250 systems designated as Oikumene
5. System Attribute Gen     → TER, planets, trade codes, economics for all systems
6. Route Pre-computation    → A* pathfinding between Oikumene neighbors
7. Output                   → JSON files + PNG cost map + metadata
```

Each stage is detailed in the sections that follow.

---

## 3. Stage 1: Galaxy Generation

### 3.1 Algorithm

The spiral galaxy generator uses a three-level hierarchy to place stars: the **galaxy generator** iterates over spiral arms, each **spiral arm generator** walks along a spiral curve depositing star clouds, and each cloud is an **elliptic starfield generator** that places individual stars within an elliptical region biased toward the center. All three levels share a single PRNG instance whose state advances sequentially through the entire generation process.

The generator must be:

- **Seedable and deterministic.** Given the same seed, the same coordinates are produced in the same order.
- **Lazy.** Uses generator functions (`function*` / `yield`) to avoid materializing all coordinates in memory simultaneously, though in practice all coordinates will be collected for subsequent stages.
- **Three-level hierarchy.** `generateSpiralGalaxyCoords` → `generateSpiralArmCoords` → `generateEllipticStarfieldCoords`, each implemented as a generator function.

#### 3.1.1 Level 1: Galaxy Generator (`generateSpiralGalaxyCoords`)

The galaxy generator converts the input `size` to radians, computes cloud size parameters, and iterates over each arm:

```
sx = 2.0 * size[0] * π / 360.0       // ≈ 69.8 for default size 4000
sy = 2.0 * size[1] * π / 360.0

xp1 = round(deg / π * sx / 1.7) * dynSizeFactor   // cloud x-radius
yp1 = round(deg / π * sy / 1.7) * dynSizeFactor   // cloud y-radius

mulStarAmount = (xp1 + yp1) / spcFactor            // stars-per-cloud factor
```

For each arm `arm` in `0..arms-1`:

```
shift = (arm / arms) * 2 * π          // angular offset for this arm
```

Delegate to the spiral arm generator with `shift` as the arm's turn angle (added to the base `turn`). Pass the pre-computed `sx`, `sy`, `xp1`, `yp1`, `mulStarAmount`, and `dynSizeFactor` to the arm generator.

If a `limit` is specified, track the total number of yielded coordinates across all arms and stop when the limit is reached. The limit is tracked per-coordinate (each yielded `{x, y}` counts as one), not per-cloud.

#### 3.1.2 Level 2: Spiral Arm Generator (`generateSpiralArmCoords`)

The spiral arm generator walks along the spiral curve from angle `n = 0` until `n > deg` (in degrees), placing a star cloud at each step:

```
n = 0
while n <= deg:
    // Raw spiral position
    rawX = cos(n) * (n * sx) * dynSizeFactor
    rawY = sin(n) * (n * sy) * dynSizeFactor

    // 2D rotation by arm turn angle (shift + turn)
    armAngle = shift + turn
    rotatedX = round(rawX * cos(armAngle) - rawY * sin(armAngle))
    rotatedY = round(rawX * sin(armAngle) + rawY * cos(armAngle))

    // Distance from center (for cloud size scaling)
    dist = sqrt(rotatedX² + rotatedY²)

    // Cloud size at this point along the arm
    sizeTemp = 2 + (mulStarAmount * n) / ((dist / 200) || 1)

    // Number of stars in this cloud
    starCount = floor(sizeTemp / (n || 2))

    // Place a cloud of stars at (center + rotated position)
    yield* generateEllipticStarfieldCoords({
        amount: starCount,
        center: [center[0] + rotatedX, center[1] + rotatedY],
        radius: [rotatedX, rotatedY],   // note: uses rotated position as radius
        turn: 0,
        multiplier: multiplier,
        rng: rng
    })

    // Random angular step: 1-5 degrees
    n += rng.randint(0, 4) + 1
```

**Key details:**

- The `cos`/`sin` functions operate on `n` in degrees (converted internally or using degree-mode functions).
- `rotatedX`/`rotatedY` are rounded to integers after rotation — TypeScript should use distinct variable names (not shadow the galaxy-level `xp1`/`yp1` as the Python code does).
- Division-by-zero guards: `(dist / 200) || 1` ensures a minimum divisor of 1; `(n || 2)` ensures the first step doesn't divide by zero.
- The random step `rng.randint(0, 4) + 1` produces 1–5 degrees, creating variable spacing along the arm.

#### 3.1.3 Level 3: Elliptic Starfield Generator (`generateEllipticStarfieldCoords`)

The elliptic starfield generator places individual stars within an elliptical region using a center-biased radial distribution:

```
for i in 0..amount-1:
    // Random angle in degrees
    degree = rng.randint(0, 360)

    // Quadratic center-biased radial distribution
    insideFactor = (rng.randint(0, 10000) / 10000) ^ 2

    // Position within ellipse (NOTE: sin for x, cos for y — swapped from typical convention)
    posX = sin(degree) * round(insideFactor * rx)
    posY = cos(degree) * round(insideFactor * ry)

    // Optional rotation by turn angle (if turn != 0)
    if turn != 0:
        rotX = posX * cos(turn) - posY * sin(turn)
        rotY = posX * sin(turn) + posY * cos(turn)
    else:
        rotX = posX
        rotY = posY

    // Final coordinate: offset from center, scaled by multiplier
    x = round((center[0] + rotX) * multiplier)
    y = round((center[1] + rotY) * multiplier)

    yield {x, y}
```

**Key details:**

- **sin for x, cos for y**: The coordinate mapping is intentionally swapped from the typical `cos→x, sin→y` convention. This must be preserved exactly to match the reference output.
- **Quadratic bias**: `insideFactor = (random_0_to_1)²` produces a center-biased distribution — most stars cluster near the center of each cloud, with fewer toward the edges.
- **Rounding before trig**: The `round(insideFactor * rx)` is applied before the `sin`/`cos` multiplication, not after. This produces the characteristic "banded" appearance of the starfield.
- **Integer output**: The final `x` and `y` are both rounded to integers.

### 3.2 Configuration

Use configuration values that produce approximately 12,000 star systems across a coordinate space of roughly ±400 in each axis (approximately 800×800). The exact defaults from the Python implementation should be preserved:

| Parameter       | Value          | Notes                                        |
| --------------- | -------------- | -------------------------------------------- |
| `center`        | `[0, 0]`       | Galaxy origin                                |
| `size`          | `[4000, 4000]` | Input size (converted internally to radians) |
| `turn`          | `0`            | No base rotation                             |
| `deg`           | `5`            | Spiral extent                                |
| `dynSizeFactor` | `1`            | Distance scaling                             |
| `spcFactor`     | `8`            | Stars per cloud                              |
| `arms`          | `4`            | Four spiral arms                             |
| `multiplier`    | `1`            | No output scaling                            |
| `limit`         | `null`         | No hard cap                                  |
| `seed`          | (configurable) | Must be specified for reproducibility        |

### 3.3 Coordinate Handling

All output coordinates are rounded to integers. Multiple stars may map to the same integer coordinate; these should be deduplicated, keeping only one system per coordinate. The deduplication means the final system count will be somewhat less than the raw star count — the dense core loses many overlapping stars, while the sparse arms lose few.

### 3.4 Output

An array of unique `{x, y}` integer coordinate pairs, each representing the position of one star system. Approximately 12,000 systems.

### 3.5 PRNG

The PRNG must be seedable and deterministic. A single PRNG instance is shared across all three levels of the generator (galaxy → arm → cloud) to ensure reproducibility. See the Galaxy Generator Spec §5 for full details.

**Critical: single-instance sharing.** The galaxy generator creates one PRNG instance and passes the same instance to all arm generators and all elliptic starfield generators. The PRNG state advances sequentially as the generator walks through arms and clouds. This means the order of PRNG calls is: galaxy setup → arm 0 cloud 0 stars → arm 0 cloud 1 stars → ... → arm 0 cloud N stars → arm 1 cloud 0 stars → ... etc. Any change to the call order (e.g., parallelizing arms) would produce different output. The single-instance sequential advancement is what makes the output deterministic from a single seed.

Any seedable algorithm is acceptable (Mersenne Twister, xoshiro256, mulberry32). Cross-language reproducibility with the Python implementation is not required. The PRNG must provide a `randint(min, max)` method returning a uniform random integer in `[min, max]` inclusive, matching Python's `random.randint` semantics.

---

## 4. Stage 2: Cost Map Generation

The cost map is a 2D grid of traversal costs overlaid on the galaxy coordinate space. It determines how expensive it is to travel through each cell of the grid. Open corridors have low cost; occluded "dust" regions have high cost.

### 4.1 Grid Dimensions

The cost map grid covers the bounding box of all generated star coordinates, with some padding (e.g., 10 cells on each side). If star coordinates range from -400 to +400, the grid might be 820×820 cells. Each cell corresponds to one integer coordinate unit.

### 4.2 Layer 1: Base Perlin Noise

Generate a Perlin noise layer across the entire grid. This provides gentle, organic variation in traversal cost everywhere — even within open corridors, some paths are naturally preferred over others.

| Parameter       | Suggested Value | Purpose                            |
| --------------- | --------------- | ---------------------------------- |
| Scale/frequency | 0.01–0.03       | Controls feature size of the noise |
| Octaves         | 3–4             | Adds detail at multiple scales     |
| Output range    | 0.0–1.0         | Normalized                         |

The output is a 2D array of floats, one per grid cell.

### 4.3 Layer 2: Cellular Automata

Run a cellular automata pass to carve open corridors ("caverns") through the grid. This creates the macro-scale structure of navigable space versus occluded dust.

#### Initial Fill

Fill the grid randomly: each cell has a probability (e.g., 45%) of being a "wall" (occluded). Cells on the grid boundary are always walls. The fill uses the shared PRNG for reproducibility.

#### Iteration Rule

Apply the 4-5 rule for 4–5 iterations: a cell becomes a wall if the 3×3 region centered on it contains 5 or more walls. Optionally use the extended rule from the cavern spec (also considering the count of walls in the 5×5 neighborhood minus corners) to control the character of the caverns.

#### Connectivity

The CA may produce disconnected open regions. For this use case, disconnected regions are acceptable and even desirable — isolated navigable pockets in the Beyond create interesting exploration targets. However, we must ensure the Oikumene region (selected in Stage 4) falls within a connected open area. If it doesn't, regenerate with a different seed or apply flood-fill to connect the Oikumene region.

### 4.4 Layer 3: Occluded Region Perlin Noise

Generate a second, independent Perlin noise layer applied only to cells that the CA marked as walls. This creates a gradient within the occluded regions: some wall areas are merely difficult, others are nearly impenetrable.

| Parameter       | Suggested Value | Purpose                      |
| --------------- | --------------- | ---------------------------- |
| Scale/frequency | 0.02–0.05       | Finer detail than base layer |
| Octaves         | 2–3             | Moderate detail              |
| Output range    | 0.0–1.0         | Normalized                   |

### 4.5 Cost Composition

The final traversal cost for each cell is computed as:

```
if cell is OPEN (per CA):
    cost = BASE_OPEN_COST + (basePerlin[x][y] * OPEN_NOISE_WEIGHT)
else (cell is WALL):
    cost = BASE_WALL_COST + (wallPerlin[x][y] * WALL_NOISE_WEIGHT)
```

Suggested constants (to be tuned):

| Constant            | Suggested Value | Purpose                                           |
| ------------------- | --------------- | ------------------------------------------------- |
| `BASE_OPEN_COST`    | 1               | Minimum cost for corridor cells                   |
| `OPEN_NOISE_WEIGHT` | 2               | How much Perlin varies corridor costs (range 1–3) |
| `BASE_WALL_COST`    | 10              | Minimum cost for occluded cells                   |
| `WALL_NOISE_WEIGHT` | 20              | How much Perlin varies wall costs (range 10–30)   |

These values mean corridor traversal costs range from 1–3, while wall traversal costs range from 10–30. A path through 10 cells of corridor costs roughly 10–30 units; the same distance through dense wall costs 100–300. This makes wall traversal possible but expensive.

### 4.6 Output

The final cost map is quantized to uint8 (0–255) and stored as a grayscale PNG image. The quantization maps the full cost range linearly to 0–255.

Additionally, store the quantization parameters (min cost, max cost, grid origin offset) in the metadata file so the PNG can be decoded back to actual cost values at runtime.

---

## 5. Stage 3: Density Calculation

For each star system, compute a local stellar density score by counting how many other systems fall within a given radius.

### 5.1 Method

For each system at position `(x, y)`, count the number of other systems within a Euclidean distance of `DENSITY_RADIUS`. A spatial index (e.g., a simple grid-based spatial hash) makes this efficient for 12,000 systems.

| Parameter        | Suggested Value | Purpose                                          |
| ---------------- | --------------- | ------------------------------------------------ |
| `DENSITY_RADIUS` | 20–30           | Radius in coordinate units for neighbor counting |

### 5.2 Environment Modifier

The density count is converted to a negative modifier on the Environment roll (see Stage 5). The mapping should be tuned so that:

- Systems in the sparse outer arms (0–3 neighbors) receive no modifier.
- Systems in the moderately dense inner arms (4–10 neighbors) receive a small penalty (-1 to -2).
- Systems in the packed core (10+ neighbors) receive a large penalty (-3 to -4), making hostile environments almost guaranteed.

Suggested formula:

```
densityPenalty = -Math.floor(Math.min(neighborCount, 16) / 4)
```

This produces penalties of 0, -1, -2, -3, -4 as density increases.

### 5.3 Output

Each system's density count and derived environment penalty are stored as part of the system record.

---

## 6. Stage 4: Oikumene Selection

### 6.1 Core Exclusion

Define a minimum radius from the galaxy center (e.g., 120–150 coordinate units). All systems within this radius are excluded from Oikumene candidacy. They exist in the game but are deep-core systems — dangerous, harsh, and part of the Beyond.

### 6.2 Candidate Identification

Among the remaining systems, identify the densest cluster of approximately 250 systems. The algorithm:

1. Exclude all systems within `CORE_EXCLUSION_RADIUS` of the galaxy center.
2. For each remaining system, compute a "neighborhood score" — the count of other non-core systems within `OIKUMENE_CLUSTER_RADIUS` (e.g., 50–80 coordinate units).
3. Select the system with the highest neighborhood score as the Oikumene seed.
4. From the seed, greedily expand outward, adding the nearest eligible system until ~250 systems are selected.
5. Verify that the selected systems fall predominantly within open CA corridors. If the corridor connectivity is poor, adjust the seed or radius.

The spiral arm structure will naturally cause this cluster to follow an arm.

| Parameter                 | Suggested Value | Purpose                                |
| ------------------------- | --------------- | -------------------------------------- |
| `CORE_EXCLUSION_RADIUS`   | 120–150         | Keeps Oikumene out of the dense core   |
| `OIKUMENE_CLUSTER_RADIUS` | 50–80           | Neighborhood score radius              |
| `OIKUMENE_TARGET_COUNT`   | 250             | Approximate number of Oikumene systems |

### 6.3 Output

Each system is tagged with a boolean `isOikumene` flag.

---

## 7. Stage 5: System Attribute Generation

Every system receives a full set of attributes derived from the Star Cluster Guide's generation methodology. The process is the same for all systems, but input biases differ based on classification.

### 7.1 Generation Sequence

Attributes are generated in this order (dependencies flow downward):

```
1. Technology (T)       ← 4dF, biased by classification
2. Environment (E)      ← 4dF, modified by stellar density
3. Resources (R)        ← 4dF, biased by classification
4. Size                 ← 2d6-2, constrained by E
5. Atmosphere           ← 2d6 + (Size-7), constrained by E
6. Temperature          ← 2d6 + atm modifier, constrained by E
7. Hydrography          ← 2d6 + modifiers, constrained by E
8. Population           ← 2d6-2 + modifiers, biased by classification
9. Starport             ← threshold check on Pop + Tech
10. Government          ← 2d6 + (Pop-7)
11. Factions            ← 1d3 + modifier
12. Law Level           ← 2d6 + (Gov-7)
13. Trade Codes         ← derived from attribute combinations
14. Economics           ← derived (WTN, GWP, per-capita income, etc.)
```

See the Star Cluster Guide §§2–9 for the full details of each step. The formulas, tables, and constraints are adopted without modification except for the biases described below.

### 7.2 Classification Biases

#### Oikumene Systems

| Attribute   | Bias                                                                                                    |
| ----------- | ------------------------------------------------------------------------------------------------------- |
| Technology  | Roll 4dF, then clamp to minimum +1 (reroll or add floor)                                                |
| Population  | Roll normally, then clamp to minimum 6                                                                  |
| Environment | Roll 4dF + density penalty (may be very negative, but Oikumene populations live in habitats regardless) |
| Resources   | Roll normally (no bias)                                                                                 |

Oikumene systems are always high-tech and well-populated, even if the local environment is hostile. A system with Environment -4 and Population 8 simply means billions of people living in orbital habitats and sealed arcologies.

#### Beyond Systems — Uninhabited (default)

| Attribute   | Bias                                                                               |
| ----------- | ---------------------------------------------------------------------------------- |
| Technology  | Not meaningful (no population to use it); roll normally but effectively irrelevant |
| Population  | Set to 0                                                                           |
| Environment | Roll 4dF + density penalty                                                         |
| Resources   | Roll normally                                                                      |

The vast majority (~85%) of Beyond systems. Empty, waiting to be explored and possibly colonized.

#### Beyond Systems — Lost Colony

| Attribute   | Bias                                          |
| ----------- | --------------------------------------------- |
| Technology  | Roll 4dF, then clamp to maximum -2            |
| Population  | Roll normally, allow full range (can be high) |
| Environment | Roll 4dF + density penalty                    |
| Resources   | Roll normally                                 |

Roughly 5–8% of Beyond systems. Civilizations that were cut off from the Oikumene and regressed technologically. Might have large populations living at medieval or industrial tech levels.

#### Beyond Systems — Hidden Enclave

| Attribute   | Bias                                   |
| ----------- | -------------------------------------- |
| Technology  | Roll 4dF, then clamp to minimum +2     |
| Population  | Roll normally, then clamp to maximum 4 |
| Environment | Roll 4dF + density penalty             |
| Resources   | Roll normally                          |

Roughly 5–8% of Beyond systems. Small, secretive, technologically advanced outposts — pirate havens, research stations, reclusive enclaves.

### 7.3 Beyond Classification Assignment

For each Beyond system, roll to determine its sub-classification:

```
roll = rng.randint(1, 100)
if roll <= 85:
    classification = "uninhabited"
else if roll <= 93:
    classification = "lost_colony"
else:
    classification = "hidden_enclave"
```

### 7.4 System Naming

Each system requires a unique name. Name generation is outside the scope of this specification but must produce unique, pronounceable names. A simple approach is a Markov chain trained on a corpus of suitable names (Vance's novels are an obvious source of style). The name generator must be seedable for reproducibility.

### 7.5 System Identifiers

Each system receives a unique ID. A UUID v4 generated from the PRNG is recommended. The system's integer coordinates `(x, y)` also serve as a natural key.

---

## 8. Stage 6: Route Pre-computation

### 8.1 Scope

Pre-compute routes only between Oikumene system pairs that are within the maximum navigation range of each other. These form the known, well-traveled routes of civilized space.

### 8.2 Range Limit

Define a maximum range `MAX_ROUTE_RANGE` (in coordinate units of Euclidean distance) for a single route leg. Only system pairs within this range are candidates for route computation. The exact value should be tuned to produce a well-connected Oikumene network without computing unnecessary long-distance routes.

| Parameter         | Suggested Value | Purpose                                       |
| ----------------- | --------------- | --------------------------------------------- |
| `MAX_ROUTE_RANGE` | 30–50           | Maximum Euclidean distance for a single route |

### 8.3 Pathfinding Algorithm

For each candidate pair, run A\* on the cost map grid from the origin system's coordinates to the destination system's coordinates. The heuristic is Euclidean distance scaled by the minimum possible cell cost.

Movement is 8-directional (including diagonals). Diagonal moves cost `cellCost * √2`; cardinal moves cost `cellCost * 1`.

### 8.4 Route Record

Each computed route stores:

| Field           | Type                 | Description                                                           |
| --------------- | -------------------- | --------------------------------------------------------------------- |
| `originId`      | string               | ID of the origin system                                               |
| `destinationId` | string               | ID of the destination system                                          |
| `cost`          | number               | Total traversal cost along the path                                   |
| `path`          | `[number, number][]` | Ordered array of `[x, y]` grid coordinates from origin to destination |

Routes are bidirectional: if A→B is computed, B→A is the same path reversed with the same cost.

### 8.5 Network Validation

After all routes are computed, verify that the Oikumene network is fully connected — every Oikumene system must be reachable from every other via some sequence of route legs. If the network is disconnected, either increase `MAX_ROUTE_RANGE` or add bridge routes between the disconnected components using A\* at the full distance.

### 8.6 Player-Discovered Routes

At runtime, players exploring the Beyond will compute routes on-demand using the same A\* algorithm against the stored cost map. Successfully traversed routes are saved to the database as player-discovered routes with the same record structure. These are associated with the discovering player and may be shared or sold to other players.

Player-discovered route computation is performed by the Cloudflare Worker. The cost map PNG is loaded, decoded to a uint8 array, and used for pathfinding. At ~640KB for the PNG, this is well within Worker memory limits.

---

## 9. Output Format

### 9.1 Directory Structure

```
galaxy/
  metadata.json              Pipeline configuration, seed, summary statistics
  costmap.png                Traversal cost grid as grayscale PNG
  routes.json                All pre-computed Oikumene routes
  systems/
    <systemId>.json          One file per star system (~12,000 files)
```

### 9.2 `metadata.json`

```json
{
  "seed": "oikumene-alpha-1",
  "generatedAt": "2026-02-15T00:00:00Z",
  "galaxyConfig": {
    "center": [0, 0],
    "size": [4000, 4000],
    "arms": 4,
    "deg": 5,
    "...": "..."
  },
  "costMapConfig": {
    "gridOriginX": -410,
    "gridOriginY": -410,
    "gridWidth": 820,
    "gridHeight": 820,
    "minCost": 1,
    "maxCost": 30,
    "quantization": "uint8_linear"
  },
  "perlinConfig": {
    "baseLayer": { "frequency": 0.02, "octaves": 3 },
    "wallLayer": { "frequency": 0.04, "octaves": 2 }
  },
  "caConfig": {
    "fillProbability": 0.45,
    "iterations": 5,
    "rule": "4-5"
  },
  "oikumeneConfig": {
    "coreExclusionRadius": 130,
    "clusterRadius": 60,
    "targetCount": 250
  },
  "routeConfig": {
    "maxRange": 40
  },
  "stats": {
    "totalSystems": 11987,
    "oikumeneSystems": 247,
    "beyondSystems": 11740,
    "beyondUninhabited": 9982,
    "beyondLostColonies": 893,
    "beyondHiddenEnclaves": 865,
    "oikumeneRoutes": 1843,
    "averageRouteCost": 27.4
  }
}
```

### 9.3 System File (`systems/<id>.json`)

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "name": "Dorvai Cluster",
  "x": 247,
  "y": -83,
  "isOikumene": true,
  "classification": "oikumene",
  "density": {
    "neighborCount": 5,
    "environmentPenalty": -1
  },
  "attributes": {
    "technology": 3,
    "environment": -1,
    "resources": 1
  },
  "planetary": {
    "size": 4,
    "atmosphere": 6,
    "temperature": 7,
    "hydrography": 5
  },
  "civilization": {
    "population": 8,
    "starport": 5,
    "government": 4,
    "factions": 2,
    "lawLevel": 3
  },
  "tradeCodes": ["Rich", "Garden"],
  "economics": {
    "gurpsTechLevel": 11,
    "perCapitaIncome": 9375,
    "grossWorldProduct": 937500000,
    "resourceMultiplier": 1.0,
    "worldTradeNumber": 6.0
  }
}
```

For uninhabited Beyond systems, the `civilization` and `economics` fields are still present but contain zeroes or minimal values.

### 9.4 `routes.json`

```json
{
  "routes": [
    {
      "originId": "a1b2c3d4-...",
      "destinationId": "f9e8d7c6-...",
      "cost": 34.7,
      "path": [[247, -83], [247, -82], [248, -81], "..."]
    }
  ]
}
```

Only one direction of each bidirectional route is stored (e.g., the direction where `originId < destinationId` lexicographically). The consumer reverses the path for the opposite direction.

### 9.5 `costmap.png`

An 8-bit grayscale PNG where each pixel represents one grid cell. Pixel value 0 = minimum cost (cheapest corridor traversal), pixel value 255 = maximum cost (densest occluded region). The mapping from pixel value back to actual cost is:

```
actualCost = minCost + (pixelValue / 255) * (maxCost - minCost)
```

where `minCost` and `maxCost` are stored in `metadata.json`.

---

## 10. PRNG Requirements

### 10.1 Single Shared Instance

A single PRNG instance is created at the start of the pipeline with the master seed. This instance is passed through all stages. This ensures that the entire galaxy — star positions, cost map, system attributes, everything — is fully deterministic from a single seed value.

### 10.2 Interface

```typescript
interface PRNG {
  /** Uniform random integer in [min, max] inclusive. */
  randint(min: number, max: number): number;

  /** Uniform random float in [0, 1). */
  random(): number;
}
```

The `random()` method is needed for Perlin noise generation and other continuous distributions. The `randint()` method is needed for dice rolls and the galaxy generator.

### 10.3 Implementation

Any seedable, deterministic algorithm is acceptable. Recommended: a `mulberry32` or `xoshiro128**` implementation for speed and simplicity. Mersenne Twister is acceptable if cross-language parity with the Python implementation is desired (it is not currently required).

### 10.4 Fate Dice

The 4dF roll used throughout the Star Cluster Guide is implemented as:

```typescript
function roll4dF(rng: PRNG): number {
  let total = 0;
  for (let i = 0; i < 4; i++) {
    total += rng.randint(0, 2) - 1; // produces -1, 0, or +1
  }
  return total;
}
```

---

## 11. Implementation Notes

### 11.1 Perlin Noise

Use a standard 2D Perlin noise or Simplex noise implementation. A simple, dependency-free TypeScript implementation is preferred. The noise function must accept a PRNG instance (or a seed) for the permutation table initialization to ensure determinism.

### 11.2 Cellular Automata

The CA implementation follows the standard approach from the cavern spec:

1. Initialize grid randomly (45% wall probability).
2. Force all boundary cells to walls.
3. Iterate 4–5 times using the 4-5 rule: a cell becomes a wall if the 3×3 region centered on it contains ≥5 walls.

The extended rule (also considering the 5×5 neighborhood, as described in the cavern spec) can be used for additional control over cavern character, but the basic 4-5 rule is sufficient for an initial implementation.

### 11.3 A\* Pathfinding

Standard A\* with 8-directional movement. The heuristic is octile distance (accounts for diagonal moves) scaled by the minimum cell cost:

```typescript
function heuristic(ax: number, ay: number, bx: number, by: number, minCost: number): number {
  const dx = Math.abs(ax - bx);
  const dy = Math.abs(ay - by);
  return minCost * (dx + dy + (Math.SQRT2 - 2) * Math.min(dx, dy));
}
```

Use a binary heap priority queue for the open set. At 800×800 grid size, A\* between systems within a 40-unit range will complete in milliseconds.

### 11.4 Spatial Indexing

For density calculation (Stage 3) and Oikumene selection (Stage 4), a grid-based spatial hash is recommended. Divide the coordinate space into cells of size `DENSITY_RADIUS` and only check neighboring grid cells when counting neighbors. This reduces density calculation for 12,000 systems from O(n²) to effectively O(n).

### 11.5 Performance Expectations

On an Apple M3 MacBook Pro with 16GB RAM, the full pipeline should complete in well under a minute:

| Stage                  | Expected Time                         |
| ---------------------- | ------------------------------------- |
| Galaxy generation      | < 1 second                            |
| Cost map (Perlin + CA) | 1–3 seconds                           |
| Density calculation    | < 1 second                            |
| Oikumene selection     | < 1 second                            |
| System attributes      | 1–2 seconds                           |
| Route pre-computation  | 5–15 seconds (depends on route count) |
| File output            | 2–5 seconds (12,000 JSON files)       |

### 11.6 Project Structure (Recommended)

```
src/
  pipeline.ts                 Top-level orchestrator
  galaxy/
    galaxy-generator.ts       Star position generation
    spiral-arm-generator.ts   Arm-level generation
    elliptic-starfield.ts     Cloud-level generation
  costmap/
    perlin.ts                 Perlin/Simplex noise implementation
    cellular-automata.ts      CA grid generation and iteration
    cost-composer.ts          Combines layers into final cost map
  systems/
    attributes.ts             TER, planetary, civilization generation
    classification.ts         Oikumene selection, Beyond classification
    density.ts                Stellar density calculation
    trade-codes.ts            Trade code assignment
    economics.ts              Economic derivations (WTN, GWP, etc.)
    naming.ts                 System name generation
  routing/
    astar.ts                  A* pathfinding on cost map
    route-builder.ts          Oikumene route pre-computation
  output/
    file-writer.ts            JSON + PNG file output
  util/
    prng.ts                   PRNG interface and implementation
    dice.ts                   Dice roll helpers (4dF, 2d6, etc.)
    spatial-hash.ts           Grid-based spatial index
  types.ts                    Shared type definitions
  index.ts                    CLI entry point

tests/
  galaxy/
  costmap/
  systems/
  routing/
  output/
```

---

## 12. Runtime Considerations

This section briefly describes how the generated data is consumed at runtime by Cloudflare Workers. Full runtime specification is out of scope.

### 12.1 D1 Schema (Sketch)

The migration loader reads the JSON/PNG output and populates D1 tables:

- **`systems`** — One row per star system, containing all attributes.
- **`routes`** — One row per pre-computed route (Oikumene) or player-discovered route, containing origin, destination, cost, and path (as a JSON column or compressed blob).
- **`costmap`** — The PNG blob, loaded into memory by the Worker when pathfinding is needed.

### 12.2 Player Exploration

When a player in the Beyond specifies a destination within range, the Worker:

1. Loads the cost map from cache or D1.
2. Decodes the PNG to a uint8 array.
3. Runs A\* from the player's current system coordinates to the destination coordinates.
4. Returns the route cost and path.
5. If the player successfully traverses the route, stores it as a player-discovered route.

### 12.3 Known Routes

When a player follows a known route (Oikumene or previously discovered), the Worker simply looks up the stored route record. No pathfinding is needed.

---

## 13. Tuning and Iteration

Many parameters in this specification are marked as "suggested values." The generation pipeline should expose all tunable parameters via a configuration file or command-line arguments so they can be adjusted without code changes.

The most important parameters to tune visually are:

- **CA fill probability and iteration count** — Controls how much of the galaxy is open corridor vs. occluded wall. Too much open space and the cost map is trivial; too much wall and the Beyond is impenetrable.
- **Cost weights** — The relative cost of corridor vs. wall traversal determines how much players are incentivized to find corridor routes vs. pushing through dust.
- **Density radius and environment penalty** — Controls how harshly the core penalizes habitability.
- **Oikumene cluster radius and core exclusion** — Determines where the Oikumene lands and how spread out it is.
- **Route range limit** — Affects Oikumene network connectivity and exploration step size.

Building a simple visualization tool (even just a Python matplotlib script) that renders the galaxy, cost map, Oikumene selection, and routes on the same plot is strongly recommended for tuning.

---

## 14. Future Extension Points

These are out of scope for the initial implementation but should be kept in mind:

- **Travel events.** Layering encounters, hazards, and discoveries onto route traversal based on path properties (passing near uncharted systems, cost spikes, etc.).
- **Dynamic routes.** Routes that degrade or improve over time (space weather, political changes).
- **Route trading.** Player-discovered routes as tradeable commodities with gameplay implications.
- **Colonization.** Players establishing populations on uninhabited Beyond systems, changing their classification.
- **Core exploration.** Special high-level content in the dense, dangerous galactic core.
- **3D coordinates.** Adding a z-component for disc thickness, affecting cost map and route computation.
- **Multiple galaxies.** Generating additional galaxies or satellite clusters with inter-galaxy routes.
