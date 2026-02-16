# Contract: Galaxy Generation Output Format

**Type**: File Output Specification
**Date**: 2026-02-16

## Directory Structure

```
<output-dir>/
  metadata.json              Pipeline configuration + summary statistics
  costmap.png                Traversal cost grid as grayscale uint8 PNG
  costmap.bin                Raw uint8 cost map for Workers runtime loading
  routes.json                All pre-computed Oikumene routes
  systems/
    <systemId>.json           One file per star system (~12,000 files)
```

## metadata.json

```typescript
interface GalaxyMetadata {
  seed: string;
  generatedAt: string; // ISO 8601 UTC
  galaxyConfig: {
    center: [number, number];
    size: [number, number];
    turn: number;
    deg: number;
    dynSizeFactor: number;
    spcFactor: number;
    arms: number;
    multiplier: number;
    limit: number | null;
  };
  costMapConfig: {
    gridOriginX: number;
    gridOriginY: number;
    gridWidth: number;
    gridHeight: number;
    minCost: number;
    maxCost: number;
    quantization: 'uint8_linear';
  };
  perlinConfig: {
    baseLayer: { frequency: number; octaves: number };
    wallLayer: { frequency: number; octaves: number };
  };
  caConfig: {
    fillProbability: number;
    iterations: number;
    rule: string;
  };
  oikumeneConfig: {
    coreExclusionRadius: number;
    clusterRadius: number;
    targetCount: number;
  };
  routeConfig: {
    maxRange: number;
  };
  stats: {
    totalSystems: number;
    oikumeneSystems: number;
    beyondSystems: number;
    beyondUninhabited: number;
    beyondLostColonies: number;
    beyondHiddenEnclaves: number;
    oikumeneRoutes: number;
    averageRouteCost: number;
  };
}
```

## systems/\<id\>.json

```typescript
interface StarSystemOutput {
  id: string; // UUID v4
  name: string; // Unique pronounceable name
  x: number; // Integer coordinate
  y: number; // Integer coordinate
  isOikumene: boolean;
  classification: 'oikumene' | 'uninhabited' | 'lost_colony' | 'hidden_enclave';
  density: {
    neighborCount: number;
    environmentPenalty: number;
  };
  attributes: {
    technology: number;
    environment: number;
    resources: number;
  };
  planetary: {
    size: number;
    atmosphere: number;
    temperature: number;
    hydrography: number;
  };
  civilization: {
    population: number;
    starport: number;
    government: number;
    factions: number;
    lawLevel: number;
  };
  tradeCodes: string[];
  economics: {
    gurpsTechLevel: number;
    perCapitaIncome: number;
    grossWorldProduct: number;
    resourceMultiplier: number;
    worldTradeNumber: number;
  };
}
```

## routes.json

```typescript
interface RoutesOutput {
  routes: Array<{
    originId: string; // UUID, originId < destinationId lexicographically
    destinationId: string; // UUID
    cost: number; // Total traversal cost (float)
    path: [number, number][]; // Ordered [x, y] grid coordinates
  }>;
}
```

## costmap.png

- Format: 8-bit grayscale PNG (colorType 0)
- Dimensions: ~820x820 pixels (varies by generated star extent)
- Pixel value 0 = minimum cost (open corridor)
- Pixel value 255 = maximum cost (dense wall)
- Decode: `actualCost = minCost + (pixelValue / 255) * (maxCost - minCost)`
- Size: expected < 1 MB

## costmap.bin

- Format: Raw uint8 array, row-major order
- Dimensions: Same as costmap.png (width \* height bytes)
- Same quantization as PNG
- Purpose: Direct loading by Workers without PNG decoding
- Size: ~672 KB for 820x820 grid
