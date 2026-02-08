import { ValidationError } from '../errors/ValidationError';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 254;

/**
 * Value object representing a validated email address.
 *
 * Stores both the original casing and a normalized (lowercased) form
 * for case-insensitive comparison.
 */
export class Email {
  private constructor(
    private readonly original: string,
    private readonly normalized: string
  ) {}

  /**
   * Creates a validated Email from a raw string.
   *
   * Trims whitespace, validates format and length, and normalizes to lowercase.
   *
   * @param value - Raw email string
   * @returns A validated Email instance
   * @throws {ValidationError} if the email is invalid
   */
  static create(value: string): Email {
    const trimmed = value.trim();

    if (trimmed.length === 0) {
      throw new ValidationError('Email is required', {
        email: ['Email is required'],
      });
    }

    if (trimmed.length > MAX_EMAIL_LENGTH) {
      throw new ValidationError('Email must not exceed 254 characters', {
        email: ['Email must not exceed 254 characters'],
      });
    }

    if (!EMAIL_REGEX.test(trimmed)) {
      throw new ValidationError('Email format is invalid', {
        email: ['Email format is invalid'],
      });
    }

    return new Email(trimmed, trimmed.toLowerCase());
  }

  /**
   * Reconstitutes an Email from persisted data without validation.
   *
   * @param original - The original email string as stored
   * @param normalized - The normalized (lowercased) email string
   * @returns An Email instance
   */
  static reconstitute(original: string, normalized: string): Email {
    return new Email(original, normalized);
  }

  /**
   * Returns the original email string.
   *
   * @returns The original email as provided (preserving case)
   */
  get value(): string {
    return this.original;
  }

  /**
   * Returns the normalized (lowercased) email string.
   *
   * @returns The lowercased email string
   */
  get normalizedValue(): string {
    return this.normalized;
  }

  /**
   * Extracts the domain part from the normalized email.
   *
   * @returns The domain portion of the email address
   */
  get domain(): string {
    // istanbul ignore next -- '@' guaranteed by regex validation in create()
    return this.normalized.split('@')[1] ?? '';
  }

  /**
   * Compares two Email instances by their normalized values.
   *
   * @param other - The Email to compare with
   * @returns True if the normalized values are equal
   */
  equals(other: Email): boolean {
    return this.normalized === other.normalized;
  }
}
