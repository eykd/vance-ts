/**
 * Shared domain types for the galaxy generation pipeline.
 *
 * These types are portable between the offline generator (Node.js) and the
 * Cloudflare Workers runtime. They MUST NOT import any Node.js or
 * Workers-specific APIs.
 *
 * @module domain/galaxy/types
 */

/** Star system political/narrative category. */
export enum Classification {
  OIKUMENE = 'oikumene',
  UNINHABITED = 'uninhabited',
  LOST_COLONY = 'lost_colony',
  HIDDEN_ENCLAVE = 'hidden_enclave',
}

/** Integer coordinate pair representing a star system position. */
export interface Coordinate {
  readonly x: number;
  readonly y: number;
}

/** Local stellar density metrics. */
export interface DensityData {
  readonly neighborCount: number;
  readonly environmentPenalty: number;
}

/** Technology, Environment, Resources scores. */
export interface TerRating {
  readonly technology: number;
  readonly environment: number;
  readonly resources: number;
}

/** Physical world characteristics. */
export interface PlanetaryData {
  readonly size: number;
  readonly atmosphere: number;
  readonly temperature: number;
  readonly hydrography: number;
}

/** Population and governance data. */
export interface CivilizationData {
  readonly population: number;
  readonly starport: number;
  readonly government: number;
  readonly factions: number;
  readonly lawLevel: number;
}

/** Derived economic values. */
export interface EconomicsData {
  readonly gurpsTechLevel: number;
  readonly perCapitaIncome: number;
  readonly grossWorldProduct: number;
  readonly resourceMultiplier: number;
  readonly worldTradeNumber: number;
}

/** Complete star system record. */
export interface StarSystem {
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

/** A pre-computed navigable path between two star systems. */
export interface Route {
  readonly originId: string;
  readonly destinationId: string;
  readonly cost: number;
  readonly path: readonly Coordinate[];
}

/** Cost map quantization parameters for PNG to actual cost conversion. */
export interface CostMapQuantization {
  readonly minCost: number;
  readonly maxCost: number;
  readonly gridOriginX: number;
  readonly gridOriginY: number;
  readonly gridWidth: number;
  readonly gridHeight: number;
}

/** Galaxy star placement configuration. */
export interface GalaxyConfig {
  readonly center: readonly [number, number];
  readonly size: readonly [number, number];
  readonly turn: number;
  readonly deg: number;
  readonly dynSizeFactor: number;
  readonly spcFactor: number;
  readonly arms: number;
  readonly multiplier: number;
  readonly limit: number | null;
  readonly seed: string;
}

/** Cost map grid dimensions and cost parameters. */
export interface CostMapConfig {
  readonly gridOriginX: number;
  readonly gridOriginY: number;
  readonly gridWidth: number;
  readonly gridHeight: number;
  readonly padding: number;
  readonly minCost: number;
  readonly maxCost: number;
  readonly baseOpenCost: number;
  readonly openNoiseWeight: number;
  readonly baseWallCost: number;
  readonly wallNoiseWeight: number;
}

/** Perlin noise layer parameters. */
export interface PerlinLayerConfig {
  readonly frequency: number;
  readonly octaves: number;
}

/** Perlin noise configuration with base and wall layers. */
export interface PerlinConfig {
  readonly baseLayer: PerlinLayerConfig;
  readonly wallLayer: PerlinLayerConfig;
}

/** Cellular automata corridor generation parameters. */
export interface CaConfig {
  readonly fillProbability: number;
  readonly iterations: number;
  readonly rule: string;
}

/** Oikumene system selection parameters. */
export interface OikumeneConfig {
  readonly coreExclusionRadius: number;
  readonly clusterRadius: number;
  readonly targetCount: number;
}

/** Route computation parameters. */
export interface RouteConfig {
  readonly maxRange: number;
}

/** Pipeline summary statistics. */
export interface GenerationStats {
  readonly totalSystems: number;
  readonly oikumeneSystems: number;
  readonly beyondSystems: number;
  readonly beyondUninhabited: number;
  readonly beyondLostColonies: number;
  readonly beyondHiddenEnclaves: number;
  readonly oikumeneRoutes: number;
  readonly averageRouteCost: number;
}
