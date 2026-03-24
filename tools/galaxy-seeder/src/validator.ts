/**
 * Validates galaxy seeder input data.
 *
 * @module validator
 */

/** Maximum allowed length for string fields to prevent oversized SQL statements. */
const MAX_STRING_LENGTH = 256;

/** Valid classification values from the domain. */
const VALID_CLASSIFICATIONS = new Set(['oikumene', 'uninhabited', 'lost_colony', 'hidden_enclave']);

/** Input shape for validation. */
interface ValidatorInput {
  /** Galaxy metadata. */
  metadata: unknown;
  /** Route data. */
  routes: unknown;
  /** System data. */
  systems: unknown;
}

/** Successful validation result. */
interface ValidationSuccess {
  /** Indicates validation passed. */
  ok: true;
}

/** Failed validation result. */
interface ValidationFailure {
  /** Indicates validation failed. */
  ok: false;
  /** List of validation errors. */
  errors: string[];
}

/** Result of input validation. */
type ValidationResult = ValidationSuccess | ValidationFailure;

import { isObject } from '../../../src/shared/type-guards.js';

/**
 * Validates the top-level structure (metadata, routes, systems).
 *
 * @param input - The input data to validate.
 * @param errors - The error accumulator.
 * @returns Whether structural validation passed (safe to proceed with deep checks).
 */
function validateStructure(input: ValidatorInput, errors: string[]): boolean {
  let structureValid = true;

  if (input.metadata == null) {
    errors.push('metadata is missing');
  }

  if (input.routes == null) {
    errors.push('routes is missing');
    structureValid = false;
  } else if (!isObject(input.routes) || !Array.isArray(input.routes['routes'])) {
    errors.push('routes.routes is not an array');
    structureValid = false;
  }

  if (input.systems == null) {
    errors.push('systems is missing');
    structureValid = false;
  } else if (!Array.isArray(input.systems)) {
    errors.push('systems is not an array');
    structureValid = false;
  } else if (input.systems.length === 0) {
    errors.push('systems array is empty');
    structureValid = false;
  }

  return structureValid;
}

/**
 * Validates individual system fields and collects system IDs.
 *
 * @param systems - The array of system objects.
 * @param errors - The error accumulator.
 * @returns Set of valid system IDs for route cross-referencing.
 */
function validateSystems(systems: unknown[], errors: string[]): Set<string> {
  const systemIds = new Set<string>();
  const coordinates = new Set<string>();
  const requiredFields = ['id', 'name', 'x', 'y', 'classification', 'economics'] as const;

  for (let i = 0; i < systems.length; i++) {
    const sys = systems[i];

    if (!isObject(sys)) {
      errors.push(`system[${String(i)}] is not an object`);
      continue;
    }

    for (const field of requiredFields) {
      if (sys[field] == null) {
        errors.push(`system[${String(i)}] missing required field "${field}"`);
      }
    }

    if (typeof sys['id'] === 'string') {
      if (sys['id'].length > MAX_STRING_LENGTH) {
        errors.push(
          `system[${String(i)}] id exceeds maximum length of ${String(MAX_STRING_LENGTH)}`
        );
      }
      if (systemIds.has(sys['id'])) {
        errors.push(`duplicate system id: ${sys['id']}`);
      }
      systemIds.add(sys['id']);
    }

    if (typeof sys['name'] === 'string' && sys['name'].length > MAX_STRING_LENGTH) {
      errors.push(
        `system[${String(i)}] name exceeds maximum length of ${String(MAX_STRING_LENGTH)}`
      );
    }

    if (typeof sys['x'] === 'number' && typeof sys['y'] === 'number') {
      if (!Number.isInteger(sys['x'])) {
        errors.push(`system[${String(i)}] x coordinate is not an integer`);
      }
      if (!Number.isInteger(sys['y'])) {
        errors.push(`system[${String(i)}] y coordinate is not an integer`);
      }

      const coordKey = `${String(sys['x'])},${String(sys['y'])}`;
      if (coordinates.has(coordKey)) {
        errors.push(`duplicate coordinates (${String(sys['x'])}, ${String(sys['y'])})`);
      }
      coordinates.add(coordKey);
    }

    if (
      typeof sys['classification'] === 'string' &&
      !VALID_CLASSIFICATIONS.has(sys['classification'])
    ) {
      errors.push(`system[${String(i)}] invalid classification "${sys['classification']}"`);
    }

    if (isObject(sys['economics'])) {
      const econ = sys['economics'];
      if (typeof econ['worldTradeNumber'] !== 'number') {
        errors.push(`system[${String(i)}] economics.worldTradeNumber is not a number`);
      }
    }
  }

  return systemIds;
}

/**
 * Validates that all route references point to existing system IDs.
 *
 * @param routes - The array of route objects.
 * @param systemIds - Set of known system IDs.
 * @param errors - The error accumulator.
 */
function validateRouteReferences(
  routes: unknown[],
  systemIds: Set<string>,
  errors: string[]
): void {
  for (let i = 0; i < routes.length; i++) {
    const route = routes[i];
    if (!isObject(route)) {
      continue;
    }

    const originId = route['originId'];
    const destinationId = route['destinationId'];
    const cost = route['cost'];

    if (typeof originId !== 'string') {
      errors.push(`route[${String(i)}] originId is not a string`);
    } else {
      if (originId.length > MAX_STRING_LENGTH) {
        errors.push(
          `route[${String(i)}] originId exceeds maximum length of ${String(MAX_STRING_LENGTH)}`
        );
      }
      if (!systemIds.has(originId)) {
        errors.push(`route[${String(i)}] references non-existent origin system: ${originId}`);
      }
    }

    if (typeof destinationId !== 'string') {
      errors.push(`route[${String(i)}] destinationId is not a string`);
    } else {
      if (destinationId.length > MAX_STRING_LENGTH) {
        errors.push(
          `route[${String(i)}] destinationId exceeds maximum length of ${String(MAX_STRING_LENGTH)}`
        );
      }
      if (!systemIds.has(destinationId)) {
        errors.push(
          `route[${String(i)}] references non-existent destination system: ${destinationId}`
        );
      }
    }

    if (typeof cost !== 'number' || !Number.isFinite(cost)) {
      errors.push(`route[${String(i)}] cost is not a finite number`);
    }

    const path = route['path'];
    if (!Array.isArray(path)) {
      errors.push(`route[${String(i)}] path is not an array`);
    } else {
      for (let j = 0; j < path.length; j++) {
        const point = path[j] as unknown;
        if (!isObject(point)) {
          errors.push(`route[${String(i)}] path[${String(j)}] is not a coordinate object`);
          continue;
        }
        if (typeof point['x'] !== 'number') {
          errors.push(`route[${String(i)}] path[${String(j)}] x is not a number`);
        }
        if (typeof point['y'] !== 'number') {
          errors.push(`route[${String(i)}] path[${String(j)}] y is not a number`);
        }
      }
    }
  }
}

/**
 * Validates the galaxy seeder input data.
 *
 * @param input - The input data to validate.
 * @returns A validation result indicating success or failure with errors.
 */
export function validateInput(input: ValidatorInput): ValidationResult {
  const errors: string[] = [];

  const structureValid = validateStructure(input, errors);

  if (structureValid) {
    const systems = input.systems as unknown[];
    const routesObj = input.routes as Record<string, unknown>;
    const routesArray = routesObj['routes'] as unknown[];

    const systemIds = validateSystems(systems, errors);
    validateRouteReferences(routesArray, systemIds, errors);
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return { ok: true };
}
