import { ValidationError } from '../errors/ValidationError';

import { UserId } from './UserId';

describe('UserId', () => {
  describe('generate', () => {
    it('creates a user id with a valid UUID', () => {
      const userId = UserId.generate();
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

      expect(uuidRegex.test(userId.toString())).toBe(true);
    });

    it('generates unique user ids', () => {
      const id1 = UserId.generate();
      const id2 = UserId.generate();

      expect(id1.toString()).not.toBe(id2.toString());
    });
  });

  describe('fromString', () => {
    it('creates a user id from a valid UUID string', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const userId = UserId.fromString(uuid);

      expect(userId.toString()).toBe(uuid);
    });

    it('accepts uppercase UUID', () => {
      const uuid = '550E8400-E29B-41D4-A716-446655440000';
      const userId = UserId.fromString(uuid);

      expect(userId.toString()).toBe(uuid);
    });

    it('throws ValidationError for empty string', () => {
      expect(() => UserId.fromString('')).toThrow(ValidationError);
    });

    it('throws ValidationError for non-UUID string', () => {
      expect(() => UserId.fromString('not-a-uuid')).toThrow(ValidationError);
    });

    it('throws ValidationError for UUID with wrong length', () => {
      expect(() => UserId.fromString('550e8400-e29b-41d4-a716')).toThrow(ValidationError);
    });

    it('includes field-level error details', () => {
      let caught: ValidationError | undefined;
      try {
        UserId.fromString('invalid');
      } catch (error: unknown) {
        caught = error as ValidationError;
      }
      expect(caught).toBeInstanceOf(ValidationError);
      expect(caught?.fields).toEqual({
        userId: [expect.any(String)],
      });
    });
  });

  describe('toString', () => {
    it('returns the UUID string', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const userId = UserId.fromString(uuid);

      expect(userId.toString()).toBe(uuid);
    });
  });

  describe('equals', () => {
    it('returns true for user ids with the same UUID', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const id1 = UserId.fromString(uuid);
      const id2 = UserId.fromString(uuid);

      expect(id1.equals(id2)).toBe(true);
    });

    it('returns false for user ids with different UUIDs', () => {
      const id1 = UserId.fromString('550e8400-e29b-41d4-a716-446655440000');
      const id2 = UserId.fromString('660e8400-e29b-41d4-a716-446655440000');

      expect(id1.equals(id2)).toBe(false);
    });
  });
});
