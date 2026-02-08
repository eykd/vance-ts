import { SessionBuilder } from './SessionBuilder';
import type { SessionProps } from './SessionBuilder';

describe('SessionBuilder', () => {
  describe('build with defaults', () => {
    it('creates a session with valid default values', () => {
      const session = new SessionBuilder().build();

      expect(session.sessionId).toBe('session-default-id');
      expect(session.userId).toBe('user-default-id');
      expect(session.csrfToken).toBe('csrf-default-token');
      expect(session.expiresAt).toBe('2025-12-31T23:59:59.000Z');
      expect(session.lastActivityAt).toBe('2025-01-15T00:00:00.000Z');
      expect(session.ipAddress).toBe('127.0.0.1');
      expect(session.userAgent).toBe('Mozilla/5.0 (compatible; TestAgent/1.0)');
      expect(session.createdAt).toBe('2025-01-15T00:00:00.000Z');
    });
  });

  describe('withSessionId', () => {
    it('sets a custom session id', () => {
      const session = new SessionBuilder().withSessionId('custom-session').build();

      expect(session.sessionId).toBe('custom-session');
    });
  });

  describe('withUserId', () => {
    it('sets a custom user id', () => {
      const session = new SessionBuilder().withUserId('custom-user-id').build();

      expect(session.userId).toBe('custom-user-id');
    });
  });

  describe('withCsrfToken', () => {
    it('sets a custom CSRF token', () => {
      const session = new SessionBuilder().withCsrfToken('custom-csrf').build();

      expect(session.csrfToken).toBe('custom-csrf');
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
        .withSessionId('chain-session')
        .withUserId('chain-user')
        .withCsrfToken('chain-csrf')
        .withIpAddress('10.0.0.5')
        .build();

      expect(session.sessionId).toBe('chain-session');
      expect(session.userId).toBe('chain-user');
      expect(session.csrfToken).toBe('chain-csrf');
      expect(session.ipAddress).toBe('10.0.0.5');
    });
  });

  describe('immutability', () => {
    it('returns a new object on each build', () => {
      const builder = new SessionBuilder();
      const session1 = builder.build();
      const session2 = builder.build();

      expect(session1).toEqual(session2);
      expect(session1).not.toBe(session2);
    });
  });

  describe('type safety', () => {
    it('returns an object conforming to SessionProps', () => {
      const session: SessionProps = new SessionBuilder().build();

      expect(session).toBeDefined();
    });
  });
});
