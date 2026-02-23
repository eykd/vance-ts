import type { Feature } from './types.js';

/**
 * Serializes a Feature to a JSON string for storage as an IR file.
 *
 * @param feature - The Feature to serialize.
 * @returns A JSON string representation of the Feature.
 */
export function serializeIR(feature: Feature): string {
  return JSON.stringify(feature, null, 2);
}

/**
 * Type guard that checks whether an unknown value matches the Feature shape.
 *
 * @param value - The value to check.
 * @returns True if the value matches the Feature shape.
 */
function isFeature(value: unknown): value is Feature {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return typeof obj['sourceFile'] === 'string' && Array.isArray(obj['scenarios']);
}

/**
 * Deserializes a Feature from a JSON string (previously written by serializeIR).
 *
 * @param json - The JSON string to parse.
 * @returns The deserialized Feature.
 * @throws {Error} If the JSON does not match the Feature shape.
 */
export function deserializeIR(json: string): Feature {
  const parsed: unknown = JSON.parse(json) as unknown;
  if (!isFeature(parsed)) {
    throw new Error('Invalid IR: does not match Feature shape');
  }
  return parsed;
}
