import { ValidationError } from '../errors/ValidationError';

import { CsrfToken } from './CsrfToken';

describe('CsrfToken', () => {
  describe('generate', () => {
    it('creates a token with a 64-character hex string', () => {
      const token = CsrfToken.generate();
      const hexRegex = /^[0-9a-f]{64}$/;

      expect(hexRegex.test(token.toString())).toBe(true);
    });

    it('generates unique tokens', () => {
      const token1 = CsrfToken.generate();
      const token2 = CsrfToken.generate();

      expect(token1.toString()).not.toBe(token2.toString());
    });
  });

  describe('fromString', () => {
    it('creates a token from a valid 64-char hex string', () => {
      const hex = 'a'.repeat(64);
      const token = CsrfToken.fromString(hex);

      expect(token.toString()).toBe(hex);
    });

    it('throws ValidationError for empty string', () => {
      expect(() => CsrfToken.fromString('')).toThrow(ValidationError);
    });

    it('throws ValidationError for non-hex string', () => {
      const invalid = 'g'.repeat(64);

      expect(() => CsrfToken.fromString(invalid)).toThrow(ValidationError);
    });

    it('throws ValidationError for hex string with wrong length', () => {
      const shortHex = 'a'.repeat(32);

      expect(() => CsrfToken.fromString(shortHex)).toThrow(ValidationError);
    });

    it('throws ValidationError for uppercase hex', () => {
      const upperHex = 'A'.repeat(64);

      expect(() => CsrfToken.fromString(upperHex)).toThrow(ValidationError);
    });

    it('includes field-level error details', () => {
      let caught: ValidationError | undefined;
      try {
        CsrfToken.fromString('invalid');
      } catch (error: unknown) {
        caught = error as ValidationError;
      }
      expect(caught).toBeInstanceOf(ValidationError);
      expect(caught?.fields).toEqual({
        csrfToken: [expect.any(String)],
      });
    });
  });

  describe('toString', () => {
    it('returns the hex string', () => {
      const hex = 'b'.repeat(64);
      const token = CsrfToken.fromString(hex);

      expect(token.toString()).toBe(hex);
    });
  });

  describe('equals', () => {
    it('returns true for tokens with the same value', () => {
      const hex = 'c'.repeat(64);
      const token1 = CsrfToken.fromString(hex);
      const token2 = CsrfToken.fromString(hex);

      expect(token1.equals(token2)).toBe(true);
    });

    it('returns false for tokens with different values', () => {
      const token1 = CsrfToken.fromString('a'.repeat(64));
      const token2 = CsrfToken.fromString('b'.repeat(64));

      expect(token1.equals(token2)).toBe(false);
    });
  });
});
