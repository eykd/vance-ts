/**
 * Validates galaxy seeder input data.
 *
 * @module validator
 */

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

/**
 * Validates the galaxy seeder input data.
 *
 * @param input - The input data to validate.
 * @returns A validation result indicating success or failure with errors.
 */
export function validateInput(input: ValidatorInput): ValidationResult {
  const errors: string[] = [];

  if (input.metadata === null || input.metadata === undefined) {
    errors.push('metadata is missing');
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return { ok: true };
}
