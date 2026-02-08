import { ValidationError } from '../errors/ValidationError';

import { COMMON_PASSWORDS } from './common-passwords';
import { constantTimeEqual } from './constant-time-equal';

const MIN_PASSWORD_LENGTH = 12;
const MAX_PASSWORD_LENGTH = 128;

/**
 * Value object representing a password with NIST 800-63B validation.
 *
 * Enforces minimum/maximum length and rejects common passwords.
 * Uses constant-time comparison for equality checks.
 */
export class Password {
  private constructor(private readonly value: string) {}

  /**
   * Creates a Password with full NIST 800-63B validation.
   *
   * Validates length (12-128 characters) and rejects common passwords.
   *
   * @param plaintext - The raw password string
   * @returns A validated Password instance
   * @throws {ValidationError} if the password fails validation
   */
  static create(plaintext: string): Password {
    if (plaintext.length < MIN_PASSWORD_LENGTH) {
      throw new ValidationError(
        `Password must be at least ${String(MIN_PASSWORD_LENGTH)} characters`,
        {
          password: [`Password must be at least ${String(MIN_PASSWORD_LENGTH)} characters`],
        }
      );
    }

    if (plaintext.length > MAX_PASSWORD_LENGTH) {
      throw new ValidationError(
        `Password must not exceed ${String(MAX_PASSWORD_LENGTH)} characters`,
        {
          password: [`Password must not exceed ${String(MAX_PASSWORD_LENGTH)} characters`],
        }
      );
    }

    // istanbul ignore next -- all current common passwords are < 12 chars, so this branch is unreachable after the min-length check
    if (COMMON_PASSWORDS.has(plaintext.toLowerCase())) {
      throw new ValidationError('Password is too common', {
        password: ['Password is too common'],
      });
    }

    return new Password(plaintext);
  }

  /**
   * Creates a Password with minimal validation (non-empty, max length only).
   *
   * Use this for reconstituting passwords from storage or for testing.
   *
   * @param plaintext - The raw password string
   * @returns A Password instance with minimal validation
   * @throws {ValidationError} if the password is empty or exceeds max length
   */
  static createUnchecked(plaintext: string): Password {
    if (plaintext.length === 0) {
      throw new ValidationError('Password is required', {
        password: ['Password is required'],
      });
    }

    if (plaintext.length > MAX_PASSWORD_LENGTH) {
      throw new ValidationError(
        `Password must not exceed ${String(MAX_PASSWORD_LENGTH)} characters`,
        {
          password: [`Password must not exceed ${String(MAX_PASSWORD_LENGTH)} characters`],
        }
      );
    }

    return new Password(plaintext);
  }

  /**
   * Returns the raw plaintext password.
   *
   * @returns The plaintext password string
   */
  get plaintext(): string {
    return this.value;
  }

  /**
   * Compares two Password instances using constant-time comparison.
   *
   * @param other - The Password to compare with
   * @returns True if the plaintext values are equal
   */
  equals(other: Password): boolean {
    return constantTimeEqual(this.value, other.value);
  }
}
