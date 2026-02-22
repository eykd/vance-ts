import type { Feature } from './types';

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
 * Deserializes a Feature from a JSON string (previously written by serializeIR).
 *
 * @param json - The JSON string to parse.
 * @returns The deserialized Feature.
 */
export function deserializeIR(json: string): Feature {
  return JSON.parse(json) as Feature;
}
