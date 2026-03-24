/**
 * Tests for the galaxy seeder input validator.
 *
 * @module validator.spec
 */

import { describe, it, expect } from 'vitest';

import { validateInput } from './validator.js';

/**
 * Builds a minimal valid system object.
 *
 * @param overrides - Fields to override in the default system.
 * @returns A valid system object with optional overrides applied.
 */
function validSystem(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: 'sys-001',
    name: 'Alpha',
    x: 10,
    y: 20,
    isOikumene: true,
    classification: 'oikumene',
    density: { neighborCount: 5, environmentPenalty: 0 },
    attributes: { technology: 1, environment: 2, resources: 3 },
    planetary: { size: 5, atmosphere: 6, temperature: 7, hydrography: 3 },
    civilization: { population: 8, starport: 4, government: 3, factions: 2, lawLevel: 5 },
    tradeCodes: ['Ag', 'Ri'],
    economics: {
      gurpsTechLevel: 10,
      perCapitaIncome: 25000,
      grossWorldProduct: 1e12,
      resourceMultiplier: 1.2,
      worldTradeNumber: 4.5,
    },
    ...overrides,
  };
}

/**
 * Builds a minimal valid input object.
 *
 * @returns A valid input with metadata, routes, and systems.
 */
function validInput(): {
  metadata: unknown;
  routes: unknown;
  systems: unknown;
} {
  return {
    metadata: { seed: 'test-seed', totalSystems: 2 },
    routes: {
      routes: [{ originId: 'sys-001', destinationId: 'sys-002', cost: 1.5, path: [] }],
    },
    systems: [validSystem(), validSystem({ id: 'sys-002', name: 'Beta', x: 30, y: 40 })],
  };
}

describe('validateInput', () => {
  describe('valid input', () => {
    it('should return ok for valid input', () => {
      const result = validateInput(validInput());

      expect(result.ok).toBe(true);
    });

    it('should return ok when routes array is empty', () => {
      const input = validInput();
      input.routes = { routes: [] };
      input.systems = [validSystem()];

      const result = validateInput(input);

      expect(result.ok).toBe(true);
    });
  });

  describe('metadata validation', () => {
    it('should return an error when metadata is null', () => {
      const input = validInput();
      input.metadata = null;

      const result = validateInput(input);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors).toContain('metadata is missing');
      }
    });

    it('should return an error when metadata is undefined', () => {
      const input = validInput();
      input.metadata = undefined;

      const result = validateInput(input);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors).toContain('metadata is missing');
      }
    });
  });

  describe('routes validation', () => {
    it('should return an error when routes is null', () => {
      const input = validInput();
      input.routes = null;

      const result = validateInput(input);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors).toContain('routes is missing');
      }
    });

    it('should return an error when routes has no routes array', () => {
      const input = validInput();
      input.routes = {};

      const result = validateInput(input);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors).toContain('routes.routes is not an array');
      }
    });

    it('should return an error when routes.routes is not an array', () => {
      const input = validInput();
      input.routes = { routes: 'not-array' };

      const result = validateInput(input);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors).toContain('routes.routes is not an array');
      }
    });
  });

  describe('systems validation', () => {
    it('should return an error when systems is null', () => {
      const input = validInput();
      input.systems = null;

      const result = validateInput(input);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors).toContain('systems is missing');
      }
    });

    it('should return an error when systems is not an array', () => {
      const input = validInput();
      input.systems = 'not-array';

      const result = validateInput(input);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors).toContain('systems is not an array');
      }
    });

    it('should return an error when systems array is empty', () => {
      const input = validInput();
      input.systems = [];
      input.routes = { routes: [] };

      const result = validateInput(input);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors).toContain('systems array is empty');
      }
    });
  });

  describe('system required fields', () => {
    it('should return an error when a system is missing id', () => {
      const input = validInput();
      const sys = validSystem();
      delete sys['id'];
      input.systems = [sys];
      input.routes = { routes: [] };

      const result = validateInput(input);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors).toEqual(
          expect.arrayContaining([expect.stringContaining('missing required field "id"')])
        );
      }
    });

    it('should return an error when a system is missing name', () => {
      const input = validInput();
      const sys = validSystem();
      delete sys['name'];
      input.systems = [sys];
      input.routes = { routes: [] };

      const result = validateInput(input);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors).toEqual(
          expect.arrayContaining([expect.stringContaining('missing required field "name"')])
        );
      }
    });

    it('should return an error when a system is missing x', () => {
      const input = validInput();
      const sys = validSystem();
      delete sys['x'];
      input.systems = [sys];
      input.routes = { routes: [] };

      const result = validateInput(input);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors).toEqual(
          expect.arrayContaining([expect.stringContaining('missing required field "x"')])
        );
      }
    });

    it('should return an error when a system is missing y', () => {
      const input = validInput();
      const sys = validSystem();
      delete sys['y'];
      input.systems = [sys];
      input.routes = { routes: [] };

      const result = validateInput(input);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors).toEqual(
          expect.arrayContaining([expect.stringContaining('missing required field "y"')])
        );
      }
    });

    it('should return an error when a system is missing classification', () => {
      const input = validInput();
      const sys = validSystem();
      delete sys['classification'];
      input.systems = [sys];
      input.routes = { routes: [] };

      const result = validateInput(input);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors).toEqual(
          expect.arrayContaining([
            expect.stringContaining('missing required field "classification"'),
          ])
        );
      }
    });

    it('should return an error when a system is missing economics', () => {
      const input = validInput();
      const sys = validSystem();
      delete sys['economics'];
      input.systems = [sys];
      input.routes = { routes: [] };

      const result = validateInput(input);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors).toEqual(
          expect.arrayContaining([expect.stringContaining('missing required field "economics"')])
        );
      }
    });

    it('should return an error when system is not an object', () => {
      const input = validInput();
      input.systems = ['not-an-object'];
      input.routes = { routes: [] };

      const result = validateInput(input);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors).toEqual(
          expect.arrayContaining([expect.stringContaining('system[0] is not an object')])
        );
      }
    });
  });

  describe('economics.worldTradeNumber validation', () => {
    it('should return an error when worldTradeNumber is missing', () => {
      const input = validInput();
      input.systems = [validSystem({ economics: { gurpsTechLevel: 10 } })];
      input.routes = { routes: [] };

      const result = validateInput(input);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors).toEqual(
          expect.arrayContaining([
            expect.stringContaining('economics.worldTradeNumber is not a number'),
          ])
        );
      }
    });

    it('should return an error when worldTradeNumber is not a number', () => {
      const input = validInput();
      input.systems = [
        validSystem({
          economics: { ...validSystem()['economics'], worldTradeNumber: 'high' },
        }),
      ];
      input.routes = { routes: [] };

      const result = validateInput(input);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors).toEqual(
          expect.arrayContaining([
            expect.stringContaining('economics.worldTradeNumber is not a number'),
          ])
        );
      }
    });
  });

  describe('duplicate system IDs', () => {
    it('should return an error for duplicate system IDs', () => {
      const input = validInput();
      input.systems = [
        validSystem({ id: 'sys-001', x: 10, y: 20 }),
        validSystem({ id: 'sys-001', name: 'Beta', x: 30, y: 40 }),
      ];
      input.routes = { routes: [] };

      const result = validateInput(input);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors).toEqual(
          expect.arrayContaining([expect.stringContaining('duplicate system id: sys-001')])
        );
      }
    });
  });

  describe('duplicate coordinates', () => {
    it('should return an error for duplicate coordinates', () => {
      const input = validInput();
      input.systems = [
        validSystem({ id: 'sys-001', x: 10, y: 20 }),
        validSystem({ id: 'sys-002', name: 'Beta', x: 10, y: 20 }),
      ];
      input.routes = { routes: [] };

      const result = validateInput(input);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors).toEqual(
          expect.arrayContaining([expect.stringContaining('duplicate coordinates (10, 20)')])
        );
      }
    });
  });

  describe('route reference validation', () => {
    it('should return an error when route references non-existent origin system', () => {
      const input = validInput();
      input.systems = [validSystem({ id: 'sys-001' })];
      input.routes = {
        routes: [{ originId: 'sys-001', destinationId: 'sys-999', cost: 1.0, path: [] }],
      };

      const result = validateInput(input);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors).toEqual(
          expect.arrayContaining([
            expect.stringContaining('route[0] references non-existent destination system: sys-999'),
          ])
        );
      }
    });

    it('should return an error when route originId is not a string', () => {
      const input = validInput();
      input.systems = [validSystem({ id: 'sys-001' })];
      input.routes = {
        routes: [{ originId: 123, destinationId: 'sys-001', cost: 1.0, path: [] }],
      };

      const result = validateInput(input);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors).toEqual(
          expect.arrayContaining([expect.stringContaining('route[0] originId is not a string')])
        );
      }
    });

    it('should return an error when route destinationId is not a string', () => {
      const input = validInput();
      input.systems = [validSystem({ id: 'sys-001' })];
      input.routes = {
        routes: [{ originId: 'sys-001', destinationId: null, cost: 1.0, path: [] }],
      };

      const result = validateInput(input);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors).toEqual(
          expect.arrayContaining([
            expect.stringContaining('route[0] destinationId is not a string'),
          ])
        );
      }
    });

    it('should return an error when route cost is not a number', () => {
      const input = validInput();
      input.systems = [
        validSystem({ id: 'sys-001' }),
        validSystem({ id: 'sys-002', name: 'Beta', x: 30, y: 40 }),
      ];
      input.routes = {
        routes: [{ originId: 'sys-001', destinationId: 'sys-002', cost: 'cheap', path: [] }],
      };

      const result = validateInput(input);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors).toEqual(
          expect.arrayContaining([expect.stringContaining('route[0] cost is not a finite number')])
        );
      }
    });

    it('should return an error when route cost is NaN', () => {
      const input = validInput();
      input.systems = [
        validSystem({ id: 'sys-001' }),
        validSystem({ id: 'sys-002', name: 'Beta', x: 30, y: 40 }),
      ];
      input.routes = {
        routes: [{ originId: 'sys-001', destinationId: 'sys-002', cost: NaN, path: [] }],
      };

      const result = validateInput(input);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors).toEqual(
          expect.arrayContaining([expect.stringContaining('route[0] cost is not a finite number')])
        );
      }
    });

    it('should return an error when route cost is Infinity', () => {
      const input = validInput();
      input.systems = [
        validSystem({ id: 'sys-001' }),
        validSystem({ id: 'sys-002', name: 'Beta', x: 30, y: 40 }),
      ];
      input.routes = {
        routes: [{ originId: 'sys-001', destinationId: 'sys-002', cost: Infinity, path: [] }],
      };

      const result = validateInput(input);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors).toEqual(
          expect.arrayContaining([expect.stringContaining('route[0] cost is not a finite number')])
        );
      }
    });

    it('should return an error when route references non-existent destination system', () => {
      const input = validInput();
      input.systems = [validSystem({ id: 'sys-002', name: 'Beta' })];
      input.routes = {
        routes: [{ originId: 'sys-888', destinationId: 'sys-002', cost: 1.0, path: [] }],
      };

      const result = validateInput(input);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors).toEqual(
          expect.arrayContaining([
            expect.stringContaining('route[0] references non-existent origin system: sys-888'),
          ])
        );
      }
    });
  });

  describe('classification validation', () => {
    it('should return an error for invalid classification value', () => {
      const input = validInput();
      input.systems = [validSystem({ classification: 'invalid_class' })];
      input.routes = { routes: [] };

      const result = validateInput(input);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors).toEqual(
          expect.arrayContaining([
            expect.stringContaining('invalid classification "invalid_class"'),
          ])
        );
      }
    });

    it('should accept all valid classification values', () => {
      const classifications = ['oikumene', 'uninhabited', 'lost_colony', 'hidden_enclave'];

      for (const classification of classifications) {
        const input = validInput();
        input.systems = [validSystem({ classification })];
        input.routes = { routes: [] };

        const result = validateInput(input);

        expect(result.ok).toBe(true);
      }
    });
  });

  describe('string length validation', () => {
    it('should return an error when system id exceeds 256 characters', () => {
      const input = validInput();
      const longId = 'x'.repeat(257);
      input.systems = [validSystem({ id: longId })];
      input.routes = { routes: [] };

      const result = validateInput(input);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors).toEqual(
          expect.arrayContaining([
            expect.stringContaining('system[0] id exceeds maximum length of 256'),
          ])
        );
      }
    });

    it('should return an error when system name exceeds 256 characters', () => {
      const input = validInput();
      const longName = 'n'.repeat(257);
      input.systems = [validSystem({ name: longName })];
      input.routes = { routes: [] };

      const result = validateInput(input);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors).toEqual(
          expect.arrayContaining([
            expect.stringContaining('system[0] name exceeds maximum length of 256'),
          ])
        );
      }
    });

    it('should accept system id and name at exactly 256 characters', () => {
      const input = validInput();
      const exactId = 'i'.repeat(256);
      const exactName = 'n'.repeat(256);
      input.systems = [validSystem({ id: exactId, name: exactName })];
      input.routes = { routes: [] };

      const result = validateInput(input);

      expect(result.ok).toBe(true);
    });

    it('should return an error when route originId exceeds 256 characters', () => {
      const input = validInput();
      const longId = 'o'.repeat(257);
      input.systems = [validSystem({ id: 'sys-001' })];
      input.routes = {
        routes: [{ originId: longId, destinationId: 'sys-001', cost: 1.0, path: [] }],
      };

      const result = validateInput(input);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors).toEqual(
          expect.arrayContaining([
            expect.stringContaining('route[0] originId exceeds maximum length of 256'),
          ])
        );
      }
    });

    it('should return an error when route destinationId exceeds 256 characters', () => {
      const input = validInput();
      const longId = 'd'.repeat(257);
      input.systems = [validSystem({ id: 'sys-001' })];
      input.routes = {
        routes: [{ originId: 'sys-001', destinationId: longId, cost: 1.0, path: [] }],
      };

      const result = validateInput(input);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors).toEqual(
          expect.arrayContaining([
            expect.stringContaining('route[0] destinationId exceeds maximum length of 256'),
          ])
        );
      }
    });

    it('should accept route originId and destinationId at exactly 256 characters', () => {
      const input = validInput();
      const exactId = 'r'.repeat(256);
      input.systems = [validSystem({ id: exactId })];
      input.routes = {
        routes: [{ originId: exactId, destinationId: exactId, cost: 1.0, path: [] }],
      };

      const result = validateInput(input);

      expect(result.ok).toBe(true);
    });
  });

  describe('coordinate type validation', () => {
    it('should return an error when x is not an integer', () => {
      const input = validInput();
      input.systems = [validSystem({ x: 10.5 })];
      input.routes = { routes: [] };

      const result = validateInput(input);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors).toEqual(
          expect.arrayContaining([expect.stringContaining('x coordinate is not an integer')])
        );
      }
    });

    it('should return an error when y is not an integer', () => {
      const input = validInput();
      input.systems = [validSystem({ y: 20.7 })];
      input.routes = { routes: [] };

      const result = validateInput(input);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors).toEqual(
          expect.arrayContaining([expect.stringContaining('y coordinate is not an integer')])
        );
      }
    });
  });

  describe('route path validation', () => {
    it('should return an error when route path is missing', () => {
      const input = validInput();
      input.systems = [
        validSystem({ id: 'sys-001' }),
        validSystem({ id: 'sys-002', name: 'Beta', x: 30, y: 40 }),
      ];
      input.routes = {
        routes: [{ originId: 'sys-001', destinationId: 'sys-002', cost: 1.5 }],
      };

      const result = validateInput(input);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors).toEqual(
          expect.arrayContaining([expect.stringContaining('route[0] path is not an array')])
        );
      }
    });

    it('should return an error when route path is not an array', () => {
      const input = validInput();
      input.systems = [
        validSystem({ id: 'sys-001' }),
        validSystem({ id: 'sys-002', name: 'Beta', x: 30, y: 40 }),
      ];
      input.routes = {
        routes: [{ originId: 'sys-001', destinationId: 'sys-002', cost: 1.5, path: 'not-array' }],
      };

      const result = validateInput(input);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors).toEqual(
          expect.arrayContaining([expect.stringContaining('route[0] path is not an array')])
        );
      }
    });

    it('should return an error when path element is not an object', () => {
      const input = validInput();
      input.systems = [
        validSystem({ id: 'sys-001' }),
        validSystem({ id: 'sys-002', name: 'Beta', x: 30, y: 40 }),
      ];
      input.routes = {
        routes: [
          { originId: 'sys-001', destinationId: 'sys-002', cost: 1.5, path: ['not-object'] },
        ],
      };

      const result = validateInput(input);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors).toEqual(
          expect.arrayContaining([
            expect.stringContaining('route[0] path[0] is not a coordinate object'),
          ])
        );
      }
    });

    it('should return an error when path element is missing x', () => {
      const input = validInput();
      input.systems = [
        validSystem({ id: 'sys-001' }),
        validSystem({ id: 'sys-002', name: 'Beta', x: 30, y: 40 }),
      ];
      input.routes = {
        routes: [{ originId: 'sys-001', destinationId: 'sys-002', cost: 1.5, path: [{ y: 10 }] }],
      };

      const result = validateInput(input);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors).toEqual(
          expect.arrayContaining([expect.stringContaining('route[0] path[0] x is not a number')])
        );
      }
    });

    it('should return an error when path element is missing y', () => {
      const input = validInput();
      input.systems = [
        validSystem({ id: 'sys-001' }),
        validSystem({ id: 'sys-002', name: 'Beta', x: 30, y: 40 }),
      ];
      input.routes = {
        routes: [{ originId: 'sys-001', destinationId: 'sys-002', cost: 1.5, path: [{ x: 5 }] }],
      };

      const result = validateInput(input);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors).toEqual(
          expect.arrayContaining([expect.stringContaining('route[0] path[0] y is not a number')])
        );
      }
    });

    it('should return an error when path element x is not a number', () => {
      const input = validInput();
      input.systems = [
        validSystem({ id: 'sys-001' }),
        validSystem({ id: 'sys-002', name: 'Beta', x: 30, y: 40 }),
      ];
      input.routes = {
        routes: [
          {
            originId: 'sys-001',
            destinationId: 'sys-002',
            cost: 1.5,
            path: [{ x: 'bad', y: 10 }],
          },
        ],
      };

      const result = validateInput(input);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors).toEqual(
          expect.arrayContaining([expect.stringContaining('route[0] path[0] x is not a number')])
        );
      }
    });

    it('should return an error when path element y is not a number', () => {
      const input = validInput();
      input.systems = [
        validSystem({ id: 'sys-001' }),
        validSystem({ id: 'sys-002', name: 'Beta', x: 30, y: 40 }),
      ];
      input.routes = {
        routes: [
          {
            originId: 'sys-001',
            destinationId: 'sys-002',
            cost: 1.5,
            path: [{ x: 5, y: null }],
          },
        ],
      };

      const result = validateInput(input);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors).toEqual(
          expect.arrayContaining([expect.stringContaining('route[0] path[0] y is not a number')])
        );
      }
    });

    it('should accept a valid path with coordinate objects', () => {
      const input = validInput();
      input.systems = [
        validSystem({ id: 'sys-001' }),
        validSystem({ id: 'sys-002', name: 'Beta', x: 30, y: 40 }),
      ];
      input.routes = {
        routes: [
          {
            originId: 'sys-001',
            destinationId: 'sys-002',
            cost: 1.5,
            path: [
              { x: 10, y: 20 },
              { x: 30, y: 40 },
            ],
          },
        ],
      };

      const result = validateInput(input);

      expect(result.ok).toBe(true);
    });

    it('should accept an empty path array', () => {
      const input = validInput();
      input.systems = [
        validSystem({ id: 'sys-001' }),
        validSystem({ id: 'sys-002', name: 'Beta', x: 30, y: 40 }),
      ];
      input.routes = {
        routes: [{ originId: 'sys-001', destinationId: 'sys-002', cost: 1.5, path: [] }],
      };

      const result = validateInput(input);

      expect(result.ok).toBe(true);
    });
  });

  describe('multiple errors', () => {
    it('should collect all errors at once', () => {
      const result = validateInput({
        metadata: null,
        routes: null,
        systems: null,
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors).toContain('metadata is missing');
        expect(result.errors).toContain('routes is missing');
        expect(result.errors).toContain('systems is missing');
      }
    });
  });
});
