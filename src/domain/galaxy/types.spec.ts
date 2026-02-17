import {
  Classification,
  type Coordinate,
  type DensityData,
  type TerRating,
  type PlanetaryData,
  type CivilizationData,
  type EconomicsData,
  type StarSystem,
  type Route,
  type CostMapQuantization,
  type GalaxyConfig,
  type CostMapConfig,
  type PerlinConfig,
  type CaConfig,
  type OikumeneConfig,
  type RouteConfig,
  type GenerationStats,
  type PerlinLayerConfig,
} from './types';

describe('Classification', () => {
  it('has OIKUMENE value', () => {
    expect(Classification.OIKUMENE).toBe('oikumene');
  });

  it('has UNINHABITED value', () => {
    expect(Classification.UNINHABITED).toBe('uninhabited');
  });

  it('has LOST_COLONY value', () => {
    expect(Classification.LOST_COLONY).toBe('lost_colony');
  });

  it('has HIDDEN_ENCLAVE value', () => {
    expect(Classification.HIDDEN_ENCLAVE).toBe('hidden_enclave');
  });

  it('has exactly four members', () => {
    const values = Object.values(Classification);

    expect(values).toHaveLength(4);
  });
});

describe('Coordinate', () => {
  it('accepts readonly integer coordinate pair', () => {
    const coord: Coordinate = { x: 10, y: -5 };

    expect(coord.x).toBe(10);
    expect(coord.y).toBe(-5);
  });
});

describe('DensityData', () => {
  it('accepts readonly neighbor count and environment penalty', () => {
    const density: DensityData = { neighborCount: 12, environmentPenalty: -3 };

    expect(density.neighborCount).toBe(12);
    expect(density.environmentPenalty).toBe(-3);
  });
});

describe('TerRating', () => {
  it('accepts readonly technology, environment, and resources scores', () => {
    const ter: TerRating = { technology: 2, environment: -1, resources: 3 };

    expect(ter.technology).toBe(2);
    expect(ter.environment).toBe(-1);
    expect(ter.resources).toBe(3);
  });
});

describe('PlanetaryData', () => {
  it('accepts readonly physical world characteristics', () => {
    const planetary: PlanetaryData = {
      size: 7,
      atmosphere: 5,
      temperature: 6,
      hydrography: 4,
    };

    expect(planetary.size).toBe(7);
    expect(planetary.atmosphere).toBe(5);
    expect(planetary.temperature).toBe(6);
    expect(planetary.hydrography).toBe(4);
  });
});

describe('CivilizationData', () => {
  it('accepts readonly population and governance data', () => {
    const civ: CivilizationData = {
      population: 8,
      starport: 3,
      government: 5,
      factions: 2,
      lawLevel: 4,
    };

    expect(civ.population).toBe(8);
    expect(civ.starport).toBe(3);
    expect(civ.government).toBe(5);
    expect(civ.factions).toBe(2);
    expect(civ.lawLevel).toBe(4);
  });
});

describe('EconomicsData', () => {
  it('accepts readonly derived economic values', () => {
    const econ: EconomicsData = {
      gurpsTechLevel: 10,
      perCapitaIncome: 25000,
      grossWorldProduct: 1e12,
      resourceMultiplier: 1.5,
      worldTradeNumber: 4.2,
    };

    expect(econ.gurpsTechLevel).toBe(10);
    expect(econ.perCapitaIncome).toBe(25000);
    expect(econ.grossWorldProduct).toBe(1e12);
    expect(econ.resourceMultiplier).toBe(1.5);
    expect(econ.worldTradeNumber).toBe(4.2);
  });
});

describe('StarSystem', () => {
  it('accepts a complete readonly star system record', () => {
    const system: StarSystem = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Aldebaran',
      x: 100,
      y: -200,
      isOikumene: true,
      classification: Classification.OIKUMENE,
      density: { neighborCount: 8, environmentPenalty: -2 },
      attributes: { technology: 3, environment: 1, resources: 2 },
      planetary: { size: 6, atmosphere: 5, temperature: 7, hydrography: 3 },
      civilization: {
        population: 9,
        starport: 4,
        government: 6,
        factions: 3,
        lawLevel: 5,
      },
      tradeCodes: ['Ri', 'In'],
      economics: {
        gurpsTechLevel: 11,
        perCapitaIncome: 30000,
        grossWorldProduct: 2e12,
        resourceMultiplier: 1.2,
        worldTradeNumber: 5.0,
      },
    };

    expect(system.id).toBe('550e8400-e29b-41d4-a716-446655440000');
    expect(system.name).toBe('Aldebaran');
    expect(system.x).toBe(100);
    expect(system.y).toBe(-200);
    expect(system.isOikumene).toBe(true);
    expect(system.classification).toBe(Classification.OIKUMENE);
    expect(system.tradeCodes).toEqual(['Ri', 'In']);
  });
});

describe('Route', () => {
  it('accepts a readonly route with coordinate path', () => {
    const route: Route = {
      originId: 'aaa',
      destinationId: 'bbb',
      cost: 42.5,
      path: [
        { x: 1, y: 2 },
        { x: 3, y: 4 },
      ],
    };

    expect(route.originId).toBe('aaa');
    expect(route.destinationId).toBe('bbb');
    expect(route.cost).toBe(42.5);
    expect(route.path).toHaveLength(2);
  });
});

describe('CostMapQuantization', () => {
  it('accepts readonly quantization parameters', () => {
    const quant: CostMapQuantization = {
      minCost: 1.0,
      maxCost: 30.0,
      gridOriginX: -500,
      gridOriginY: -500,
      gridWidth: 1000,
      gridHeight: 1000,
    };

    expect(quant.minCost).toBe(1.0);
    expect(quant.maxCost).toBe(30.0);
    expect(quant.gridOriginX).toBe(-500);
    expect(quant.gridOriginY).toBe(-500);
    expect(quant.gridWidth).toBe(1000);
    expect(quant.gridHeight).toBe(1000);
  });
});

describe('GalaxyConfig', () => {
  it('accepts readonly galaxy generation configuration', () => {
    const config: GalaxyConfig = {
      center: [0, 0],
      size: [4000, 4000],
      turn: 0,
      deg: 5,
      dynSizeFactor: 1,
      spcFactor: 8,
      arms: 4,
      multiplier: 1,
      limit: null,
      seed: 'test-seed',
    };

    expect(config.center).toEqual([0, 0]);
    expect(config.size).toEqual([4000, 4000]);
    expect(config.arms).toBe(4);
    expect(config.limit).toBeNull();
    expect(config.seed).toBe('test-seed');
  });

  it('accepts a numeric limit', () => {
    const config: GalaxyConfig = {
      center: [0, 0],
      size: [4000, 4000],
      turn: 0,
      deg: 5,
      dynSizeFactor: 1,
      spcFactor: 8,
      arms: 4,
      multiplier: 1,
      limit: 12000,
      seed: 'test-seed',
    };

    expect(config.limit).toBe(12000);
  });
});

describe('CostMapConfig', () => {
  it('accepts readonly cost map configuration', () => {
    const config: CostMapConfig = {
      gridOriginX: -600,
      gridOriginY: -600,
      gridWidth: 1200,
      gridHeight: 1200,
      padding: 50,
      minCost: 1,
      maxCost: 30,
      baseOpenCost: 1.5,
      openNoiseWeight: 0.5,
      baseWallCost: 15,
      wallNoiseWeight: 5,
    };

    expect(config.padding).toBe(50);
    expect(config.baseOpenCost).toBe(1.5);
    expect(config.wallNoiseWeight).toBe(5);
  });
});

describe('PerlinConfig', () => {
  it('accepts readonly Perlin noise configuration with layer configs', () => {
    const config: PerlinConfig = {
      baseLayer: { frequency: 0.02, octaves: 4 },
      wallLayer: { frequency: 0.05, octaves: 2 },
    };

    expect(config.baseLayer.frequency).toBe(0.02);
    expect(config.wallLayer.octaves).toBe(2);
  });
});

describe('PerlinLayerConfig', () => {
  it('accepts readonly frequency and octaves', () => {
    const layer: PerlinLayerConfig = { frequency: 0.03, octaves: 3 };

    expect(layer.frequency).toBe(0.03);
    expect(layer.octaves).toBe(3);
  });
});

describe('CaConfig', () => {
  it('accepts readonly cellular automata configuration', () => {
    const config: CaConfig = {
      fillProbability: 0.45,
      iterations: 5,
      rule: 'B5678/S45678',
    };

    expect(config.fillProbability).toBe(0.45);
    expect(config.iterations).toBe(5);
    expect(config.rule).toBe('B5678/S45678');
  });
});

describe('OikumeneConfig', () => {
  it('accepts readonly Oikumene selection configuration', () => {
    const config: OikumeneConfig = {
      coreExclusionRadius: 200,
      clusterRadius: 50,
      targetCount: 250,
    };

    expect(config.coreExclusionRadius).toBe(200);
    expect(config.clusterRadius).toBe(50);
    expect(config.targetCount).toBe(250);
  });
});

describe('RouteConfig', () => {
  it('accepts readonly route computation configuration', () => {
    const config: RouteConfig = { maxRange: 100 };

    expect(config.maxRange).toBe(100);
  });
});

describe('GenerationStats', () => {
  it('accepts readonly summary statistics', () => {
    const stats: GenerationStats = {
      totalSystems: 12000,
      oikumeneSystems: 250,
      beyondSystems: 11750,
      beyondUninhabited: 9988,
      beyondLostColonies: 881,
      beyondHiddenEnclaves: 881,
      oikumeneRoutes: 500,
      averageRouteCost: 42.3,
    };

    expect(stats.totalSystems).toBe(12000);
    expect(stats.oikumeneSystems).toBe(250);
    expect(stats.beyondSystems).toBe(11750);
    expect(stats.oikumeneRoutes).toBe(500);
    expect(stats.averageRouteCost).toBe(42.3);
  });
});
