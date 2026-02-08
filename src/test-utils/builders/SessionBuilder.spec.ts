import type { Session } from '../../domain/entities/Session';

import { SessionBuilder } from './SessionBuilder';

describe('SessionBuilder', () => {
  describe('build with defaults', () => {
    it('creates a session with valid default values', () => {
      const session = new SessionBuilder().build();

      expect(session.sessionId.toString()).toBe('00000000-0000-4000-a000-000000000001');
      expect(session.userId.toString()).toBe('00000000-0000-4000-a000-000000000001');
      expect(session.csrfToken.toString()).toBe('a'.repeat(64));
      expect(session.expiresAt).toBe('2025-12-31T23:59:59.000Z');
      expect(session.lastActivityAt).toBe('2025-01-15T00:00:00.000Z');
      expect(session.ipAddress).toBe('127.0.0.1');
      expect(session.userAgent).toBe('Mozilla/5.0 (compatible; TestAgent/1.0)');
      expect(session.createdAt).toBe('2025-01-15T00:00:00.000Z');
    });
  });

  describe('withSessionId', () => {
    it('sets a custom session id', () => {
      const session = new SessionBuilder()
        .withSessionId('550e8400-e29b-41d4-a716-446655440000')
        .build();

      expect(session.sessionId.toString()).toBe('550e8400-e29b-41d4-a716-446655440000');
    });
  });

  describe('withUserId', () => {
    it('sets a custom user id', () => {
      const session = new SessionBuilder()
        .withUserId('550e8400-e29b-41d4-a716-446655440000')
        .build();

      expect(session.userId.toString()).toBe('550e8400-e29b-41d4-a716-446655440000');
    });
  });

  describe('withCsrfToken', () => {
    it('sets a custom CSRF token', () => {
      const token = 'b'.repeat(64);
      const session = new SessionBuilder().withCsrfToken(token).build();

      expect(session.csrfToken.toString()).toBe(token);
    });
  });

  describe('withExpiry', () => {
    it('sets a custom expiry date', () => {
      const session = new SessionBuilder().withExpiry('2026-06-15T12:00:00.000Z').build();

      expect(session.expiresAt).toBe('2026-06-15T12:00:00.000Z');
    });
  });

  describe('expired', () => {
    it('sets the expiry to a past date', () => {
      const session = new SessionBuilder().expired().build();

      expect(session.expiresAt).toBe('2024-01-01T00:00:00.000Z');
    });
  });

  describe('withIpAddress', () => {
    it('sets a custom IP address', () => {
      const session = new SessionBuilder().withIpAddress('10.0.0.1').build();

      expect(session.ipAddress).toBe('10.0.0.1');
    });
  });

  describe('withUserAgent', () => {
    it('sets a custom user agent', () => {
      const session = new SessionBuilder().withUserAgent('CustomBrowser/2.0').build();

      expect(session.userAgent).toBe('CustomBrowser/2.0');
    });
  });

  describe('withLastActivity', () => {
    it('sets a custom last activity timestamp', () => {
      const session = new SessionBuilder().withLastActivity('2025-06-01T10:30:00.000Z').build();

      expect(session.lastActivityAt).toBe('2025-06-01T10:30:00.000Z');
    });
  });

  describe('fluent chaining', () => {
    it('supports chaining multiple methods', () => {
      const session = new SessionBuilder()
        .withSessionId('550e8400-e29b-41d4-a716-446655440000')
        .withUserId('660e8400-e29b-41d4-a716-446655440000')
        .withCsrfToken('c'.repeat(64))
        .withIpAddress('10.0.0.5')
        .build();

      expect(session.sessionId.toString()).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(session.userId.toString()).toBe('660e8400-e29b-41d4-a716-446655440000');
      expect(session.csrfToken.toString()).toBe('c'.repeat(64));
      expect(session.ipAddress).toBe('10.0.0.5');
    });
  });

  describe('immutability', () => {
    it('returns a new object on each build', () => {
      const builder = new SessionBuilder();
      const session1 = builder.build();
      const session2 = builder.build();

      expect(session1.userId.toString()).toBe(session2.userId.toString());
      expect(session1).not.toBe(session2);
    });
  });

  describe('type safety', () => {
    it('returns a Session entity', () => {
      const session: Session = new SessionBuilder().build();

      expect(session).toBeDefined();
    });
  });
});
