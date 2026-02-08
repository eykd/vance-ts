import { validSession, expiredSession, recentlyActiveSession } from './sessions';

describe('Session fixtures', () => {
  describe('validSession', () => {
    it('has a valid session id', () => {
      expect(validSession.sessionId.toString()).toBe('00000000-0000-4000-a000-000000000010');
    });

    it('has a valid user id', () => {
      expect(validSession.userId.toString()).toBe('00000000-0000-4000-a000-000000000101');
    });

    it('has a CSRF token', () => {
      expect(validSession.csrfToken.toString()).toBe('ab'.repeat(32));
    });

    it('has a future expiry', () => {
      expect(validSession.expiresAt).toBe('2025-12-31T23:59:59.000Z');
    });

    it('has a last activity timestamp', () => {
      expect(validSession.lastActivityAt).toBe('2025-01-15T00:00:00.000Z');
    });

    it('has an IP address', () => {
      expect(validSession.ipAddress).toBe('192.168.1.100');
    });

    it('has a user agent', () => {
      expect(validSession.userAgent).toBe('Mozilla/5.0 (compatible; TestAgent/1.0)');
    });

    it('has a creation timestamp', () => {
      expect(validSession.createdAt).toBe('2025-01-15T00:00:00.000Z');
    });
  });

  describe('expiredSession', () => {
    it('has an expired session id', () => {
      expect(expiredSession.sessionId.toString()).toBe('00000000-0000-4000-a000-000000000020');
    });

    it('has a past expiry', () => {
      expect(expiredSession.expiresAt).toBe('2024-01-01T00:00:00.000Z');
    });

    it('has a user id', () => {
      expect(expiredSession.userId.toString()).toBe('00000000-0000-4000-a000-000000000101');
    });
  });

  describe('recentlyActiveSession', () => {
    it('has a recently active session id', () => {
      expect(recentlyActiveSession.sessionId.toString()).toBe(
        '00000000-0000-4000-a000-000000000030'
      );
    });

    it('has a recent last activity timestamp', () => {
      expect(recentlyActiveSession.lastActivityAt).toBe('2025-01-15T11:55:00.000Z');
    });

    it('has a future expiry', () => {
      expect(recentlyActiveSession.expiresAt).toBe('2025-12-31T23:59:59.000Z');
    });

    it('has a user id', () => {
      expect(recentlyActiveSession.userId.toString()).toBe('00000000-0000-4000-a000-000000000101');
    });
  });
});
