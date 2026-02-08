import { ValidationError } from '../errors/ValidationError';

import { constantTimeEqual } from './constant-time-equal';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Value object representing a unique user identifier.
 *
 * Wraps a UUID v4 string with validation and equality comparison.
 */
export class UserId {
  private constructor(private readonly value: string) {}

  /**
   * Generates a new UserId using crypto.randomUUID().
   *
   * @returns A new UserId with a randomly generated UUID
   */
  static generate(): UserId {
    return new UserId(crypto.randomUUID());
  }

  /**
   * Creates a UserId from an existing UUID string.
   *
   * @param value - A UUID string to validate and wrap
   * @returns A UserId instance
   * @throws {ValidationError} if the string is not a valid UUID
   */
  static fromString(value: string): UserId {
    if (!UUID_REGEX.test(value)) {
      throw new ValidationError('User ID must be a valid UUID', {
        userId: ['User ID must be a valid UUID'],
      });
    }

    return new UserId(value);
  }

  /**
   * Returns the UUID string representation.
   *
   * @returns The UUID string
   */
  toString(): string {
    return this.value;
  }

  /**
   * Compares two UserId instances using constant-time comparison.
   *
   * @param other - The UserId to compare with
   * @returns True if the UUIDs are equal
   */
  equals(other: UserId): boolean {
    return constantTimeEqual(this.value, other.value);
  }
}
