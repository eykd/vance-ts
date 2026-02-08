import { ValidationError } from '../errors/ValidationError';

import { SessionId } from './SessionId';

describe('SessionId', () => {
  describe('generate', () => {
    it('creates a session id with a valid UUID', () => {
      const sessionId = SessionId.generate();
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

      expect(uuidRegex.test(sessionId.toString())).toBe(true);
    });

    it('generates unique session ids', () => {
      const id1 = SessionId.generate();
      const id2 = SessionId.generate();

      expect(id1.toString()).not.toBe(id2.toString());
    });
  });

  describe('fromString', () => {
    it('creates a session id from a valid UUID string', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const sessionId = SessionId.fromString(uuid);

      expect(sessionId.toString()).toBe(uuid);
    });

    it('accepts uppercase UUID', () => {
      const uuid = '550E8400-E29B-41D4-A716-446655440000';
      const sessionId = SessionId.fromString(uuid);

      expect(sessionId.toString()).toBe(uuid);
    });

    it('throws ValidationError for empty string', () => {
      expect(() => SessionId.fromString('')).toThrow(ValidationError);
    });

    it('throws ValidationError for non-UUID string', () => {
      expect(() => SessionId.fromString('not-a-uuid')).toThrow(ValidationError);
    });

    it('throws ValidationError for UUID with wrong length', () => {
      expect(() => SessionId.fromString('550e8400-e29b-41d4-a716')).toThrow(ValidationError);
    });

    it('includes field-level error details', () => {
      let caught: ValidationError | undefined;
      try {
        SessionId.fromString('invalid');
      } catch (error: unknown) {
        caught = error as ValidationError;
      }
      expect(caught).toBeInstanceOf(ValidationError);
      expect(caught?.fields).toEqual({
        sessionId: [expect.any(String)],
      });
    });
  });

  describe('toString', () => {
    it('returns the UUID string', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const sessionId = SessionId.fromString(uuid);

      expect(sessionId.toString()).toBe(uuid);
    });
  });

  describe('equals', () => {
    it('returns true for session ids with the same UUID', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const id1 = SessionId.fromString(uuid);
      const id2 = SessionId.fromString(uuid);

      expect(id1.equals(id2)).toBe(true);
    });

    it('returns false for session ids with different UUIDs', () => {
      const id1 = SessionId.fromString('550e8400-e29b-41d4-a716-446655440000');
      const id2 = SessionId.fromString('660e8400-e29b-41d4-a716-446655440000');

      expect(id1.equals(id2)).toBe(false);
    });
  });
});
