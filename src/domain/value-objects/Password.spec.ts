import { ValidationError } from '../errors/ValidationError';

import { Password } from './Password';

describe('Password', () => {
  describe('create', () => {
    it('creates a password from a valid plaintext', () => {
      const password = Password.create('securePassword123');

      expect(password.plaintext).toBe('securePassword123');
    });

    it('accepts password at exactly 12 characters', () => {
      const password = Password.create('abcdefghijkl');

      expect(password.plaintext).toBe('abcdefghijkl');
    });

    it('accepts password at exactly 128 characters', () => {
      const longPassword = 'a'.repeat(128);
      const password = Password.create(longPassword);

      expect(password.plaintext).toBe(longPassword);
    });

    it('throws ValidationError for password shorter than 12 characters', () => {
      expect(() => Password.create('short')).toThrow(ValidationError);
    });

    it('throws ValidationError for password longer than 128 characters', () => {
      const longPassword = 'a'.repeat(129);

      expect(() => Password.create(longPassword)).toThrow(ValidationError);
    });

    it('throws ValidationError for empty password', () => {
      expect(() => Password.create('')).toThrow(ValidationError);
    });

    it('throws ValidationError for common password that meets length requirement', () => {
      expect(() => Password.create('passwordpassword')).toThrow(ValidationError);
    });

    it('includes field-level error details for common password', () => {
      let caught: ValidationError | undefined;
      try {
        Password.create('password12345');
      } catch (error: unknown) {
        caught = error as ValidationError;
      }
      expect(caught).toBeInstanceOf(ValidationError);
      expect(caught?.fields).toEqual({
        password: ['Password is too common'],
      });
    });

    it('includes field-level error details for short password', () => {
      let caught: ValidationError | undefined;
      try {
        Password.create('short');
      } catch (error: unknown) {
        caught = error as ValidationError;
      }
      expect(caught).toBeInstanceOf(ValidationError);
      expect(caught?.fields).toEqual({
        password: [expect.any(String)],
      });
    });
  });

  describe('createUnchecked', () => {
    it('creates a password with minimal validation', () => {
      const password = Password.createUnchecked('short');

      expect(password.plaintext).toBe('short');
    });

    it('allows common passwords', () => {
      const password = Password.createUnchecked('password');

      expect(password.plaintext).toBe('password');
    });

    it('throws ValidationError for empty password', () => {
      expect(() => Password.createUnchecked('')).toThrow(ValidationError);
    });

    it('throws ValidationError for password exceeding 128 characters', () => {
      const longPassword = 'a'.repeat(129);

      expect(() => Password.createUnchecked(longPassword)).toThrow(ValidationError);
    });

    it('accepts password at exactly 128 characters', () => {
      const password = Password.createUnchecked('a'.repeat(128));

      expect(password.plaintext).toBe('a'.repeat(128));
    });

    it('includes field-level error details', () => {
      let caught: ValidationError | undefined;
      try {
        Password.createUnchecked('');
      } catch (error: unknown) {
        caught = error as ValidationError;
      }
      expect(caught).toBeInstanceOf(ValidationError);
      expect(caught?.fields).toEqual({
        password: [expect.any(String)],
      });
    });
  });

  describe('plaintext', () => {
    it('returns the original plaintext value', () => {
      const password = Password.create('mySecurePassword');

      expect(password.plaintext).toBe('mySecurePassword');
    });
  });

  describe('equals', () => {
    it('returns true for passwords with the same plaintext', () => {
      const password1 = Password.create('securePassword123');
      const password2 = Password.create('securePassword123');

      expect(password1.equals(password2)).toBe(true);
    });

    it('returns false for passwords with different plaintext', () => {
      const password1 = Password.create('securePassword123');
      const password2 = Password.create('differentPassword');

      expect(password1.equals(password2)).toBe(false);
    });
  });
});
