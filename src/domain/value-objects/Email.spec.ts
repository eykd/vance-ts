import { ValidationError } from '../errors/ValidationError';

import { Email } from './Email';

describe('Email', () => {
  describe('create', () => {
    it('creates an email from a valid address', () => {
      const email = Email.create('alice@example.com');

      expect(email.value).toBe('alice@example.com');
      expect(email.normalizedValue).toBe('alice@example.com');
    });

    it('trims whitespace from input', () => {
      const email = Email.create('  alice@example.com  ');

      expect(email.value).toBe('alice@example.com');
    });

    it('normalizes to lowercase', () => {
      const email = Email.create('Alice@Example.COM');

      expect(email.value).toBe('Alice@Example.COM');
      expect(email.normalizedValue).toBe('alice@example.com');
    });

    it('throws ValidationError for empty string', () => {
      expect(() => Email.create('')).toThrow(ValidationError);
    });

    it('throws ValidationError for whitespace-only string', () => {
      expect(() => Email.create('   ')).toThrow(ValidationError);
    });

    it('throws ValidationError for string exceeding 254 characters', () => {
      const longLocal = 'a'.repeat(243);
      const longEmail = `${longLocal}@example.com`;

      expect(() => Email.create(longEmail)).toThrow(ValidationError);
    });

    it('throws ValidationError for email without @', () => {
      expect(() => Email.create('aliceexample.com')).toThrow(ValidationError);
    });

    it('throws ValidationError for email without local part', () => {
      expect(() => Email.create('@example.com')).toThrow(ValidationError);
    });

    it('throws ValidationError for email without domain', () => {
      expect(() => Email.create('alice@')).toThrow(ValidationError);
    });

    it('throws ValidationError for email with spaces', () => {
      expect(() => Email.create('alice @example.com')).toThrow(ValidationError);
    });

    it('includes field-level error details', () => {
      let caught: ValidationError | undefined;
      try {
        Email.create('');
      } catch (error: unknown) {
        caught = error as ValidationError;
      }
      expect(caught).toBeInstanceOf(ValidationError);
      expect(caught?.fields).toEqual({
        email: [expect.any(String)],
      });
    });

    it('accepts email at exactly 254 characters', () => {
      const local = 'a'.repeat(242);
      const email254 = `${local}@example.com`;
      expect(email254.length).toBe(254);

      const email = Email.create(email254);

      expect(email.value).toBe(email254);
    });
  });

  describe('reconstitute', () => {
    it('creates an email without validation', () => {
      const email = Email.reconstitute('Original@Test.COM', 'original@test.com');

      expect(email.value).toBe('Original@Test.COM');
      expect(email.normalizedValue).toBe('original@test.com');
    });
  });

  describe('domain', () => {
    it('extracts the domain part from the email', () => {
      const email = Email.create('alice@example.com');

      expect(email.domain).toBe('example.com');
    });

    it('extracts domain from normalized value', () => {
      const email = Email.create('alice@Example.COM');

      expect(email.domain).toBe('example.com');
    });
  });

  describe('equals', () => {
    it('returns true for emails with the same normalized value', () => {
      const email1 = Email.create('Alice@Example.COM');
      const email2 = Email.create('alice@example.com');

      expect(email1.equals(email2)).toBe(true);
    });

    it('returns false for emails with different normalized values', () => {
      const email1 = Email.create('alice@example.com');
      const email2 = Email.create('bob@example.com');

      expect(email1.equals(email2)).toBe(false);
    });
  });
});
