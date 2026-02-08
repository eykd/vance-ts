import { ValidationError } from '../errors/ValidationError';

import { constantTimeEqual } from './constant-time-equal';

const HEX_REGEX = /^[0-9a-f]{64}$/;
const TOKEN_BYTE_LENGTH = 32;

/**
 * Value object representing a CSRF protection token.
 *
 * Wraps a 64-character lowercase hex string (32 random bytes).
 * Uses constant-time comparison for equality checks.
 */
export class CsrfToken {
  private constructor(private readonly value: string) {}

  /**
   * Generates a new CsrfToken using crypto.getRandomValues().
   *
   * @returns A new CsrfToken with 32 bytes of cryptographic randomness
   */
  static generate(): CsrfToken {
    const bytes = new Uint8Array(TOKEN_BYTE_LENGTH);
    crypto.getRandomValues(bytes);
    const hex = Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    return new CsrfToken(hex);
  }

  /**
   * Creates a CsrfToken from an existing 64-character hex string.
   *
   * @param value - A 64-character lowercase hex string
   * @returns A CsrfToken instance
   * @throws {ValidationError} if the string is not a valid 64-char hex value
   */
  static fromString(value: string): CsrfToken {
    if (!HEX_REGEX.test(value)) {
      throw new ValidationError('CSRF token must be a 64-character hex string', {
        csrfToken: ['CSRF token must be a 64-character hex string'],
      });
    }

    return new CsrfToken(value);
  }

  /**
   * Returns the hex string representation.
   *
   * @returns The 64-character hex string
   */
  toString(): string {
    return this.value;
  }

  /**
   * Compares two CsrfToken instances using constant-time comparison.
   *
   * @param other - The CsrfToken to compare with
   * @returns True if the hex values are equal
   */
  equals(other: CsrfToken): boolean {
    return constantTimeEqual(this.value, other.value);
  }
}
