import { ValidationError } from '../errors/ValidationError';

import { constantTimeEqual } from './constant-time-equal';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Value object representing a unique session identifier.
 *
 * Wraps a UUID v4 string with validation and equality comparison.
 */
export class SessionId {
  private constructor(private readonly value: string) {}

  /**
   * Generates a new SessionId using crypto.randomUUID().
   *
   * @returns A new SessionId with a randomly generated UUID
   */
  static generate(): SessionId {
    return new SessionId(crypto.randomUUID());
  }

  /**
   * Creates a SessionId from an existing UUID string.
   *
   * @param value - A UUID string to validate and wrap
   * @returns A SessionId instance
   * @throws {ValidationError} if the string is not a valid UUID
   */
  static fromString(value: string): SessionId {
    if (!UUID_REGEX.test(value)) {
      throw new ValidationError('Session ID must be a valid UUID', {
        sessionId: ['Session ID must be a valid UUID'],
      });
    }

    return new SessionId(value);
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
   * Compares two SessionId instances using constant-time comparison.
   *
   * @param other - The SessionId to compare with
   * @returns True if the UUIDs are equal
   */
  equals(other: SessionId): boolean {
    return constantTimeEqual(this.value, other.value);
  }
}
