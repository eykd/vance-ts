import { CsrfToken } from '../value-objects/CsrfToken';
import { SessionId } from '../value-objects/SessionId';

import { Session } from './Session';

describe('Session', () => {
  const sessionId = SessionId.fromString('550e8400-e29b-41d4-a716-446655440000');
  const csrfToken = CsrfToken.fromString('a'.repeat(64));
  const now = '2025-01-15T00:00:00.000Z';

  describe('create', () => {
    it('creates a new session with computed expiry', () => {
      const session = Session.create({
        sessionId,
        userId: 'user-001',
        csrfToken,
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
        now,
      });

      expect(session.sessionId.equals(sessionId)).toBe(true);
      expect(session.userId).toBe('user-001');
      expect(session.csrfToken.equals(csrfToken)).toBe(true);
      expect(session.ipAddress).toBe('127.0.0.1');
      expect(session.userAgent).toBe('Mozilla/5.0');
      expect(session.createdAt).toBe(now);
      expect(session.lastActivityAt).toBe(now);
      // 24 hours from now
      expect(session.expiresAt).toBe('2025-01-16T00:00:00.000Z');
    });
  });

  describe('reconstitute', () => {
    it('creates a session from stored data without validation', () => {
      const session = Session.reconstitute({
        sessionId,
        userId: 'user-002',
        csrfToken,
        expiresAt: '2025-12-31T23:59:59.000Z',
        lastActivityAt: '2025-01-15T12:00:00.000Z',
        ipAddress: '10.0.0.1',
        userAgent: 'Chrome/120',
        createdAt: now,
      });

      expect(session.sessionId.equals(sessionId)).toBe(true);
      expect(session.userId).toBe('user-002');
      expect(session.csrfToken.equals(csrfToken)).toBe(true);
      expect(session.expiresAt).toBe('2025-12-31T23:59:59.000Z');
      expect(session.lastActivityAt).toBe('2025-01-15T12:00:00.000Z');
      expect(session.ipAddress).toBe('10.0.0.1');
      expect(session.userAgent).toBe('Chrome/120');
      expect(session.createdAt).toBe(now);
    });
  });

  describe('isExpired', () => {
    it('returns true when now is after expiresAt', () => {
      const session = Session.reconstitute({
        sessionId,
        userId: 'user-001',
        csrfToken,
        expiresAt: '2025-01-15T12:00:00.000Z',
        lastActivityAt: now,
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
        createdAt: now,
      });

      expect(session.isExpired('2025-01-15T13:00:00.000Z')).toBe(true);
    });

    it('returns true when now equals expiresAt', () => {
      const session = Session.reconstitute({
        sessionId,
        userId: 'user-001',
        csrfToken,
        expiresAt: '2025-01-15T12:00:00.000Z',
        lastActivityAt: now,
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
        createdAt: now,
      });

      expect(session.isExpired('2025-01-15T12:00:00.000Z')).toBe(true);
    });

    it('returns false when now is before expiresAt', () => {
      const session = Session.reconstitute({
        sessionId,
        userId: 'user-001',
        csrfToken,
        expiresAt: '2025-01-15T12:00:00.000Z',
        lastActivityAt: now,
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
        createdAt: now,
      });

      expect(session.isExpired('2025-01-15T11:00:00.000Z')).toBe(false);
    });
  });

  describe('needsRefresh', () => {
    it('returns true when time since last activity exceeds threshold', () => {
      const session = Session.reconstitute({
        sessionId,
        userId: 'user-001',
        csrfToken,
        expiresAt: '2025-01-16T00:00:00.000Z',
        lastActivityAt: '2025-01-15T10:00:00.000Z',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
        createdAt: now,
      });

      // 6 minutes after last activity (threshold is 5 minutes)
      expect(session.needsRefresh('2025-01-15T10:06:00.000Z')).toBe(true);
    });

    it('returns true when time since last activity equals threshold', () => {
      const session = Session.reconstitute({
        sessionId,
        userId: 'user-001',
        csrfToken,
        expiresAt: '2025-01-16T00:00:00.000Z',
        lastActivityAt: '2025-01-15T10:00:00.000Z',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
        createdAt: now,
      });

      // Exactly 5 minutes after last activity
      expect(session.needsRefresh('2025-01-15T10:05:00.000Z')).toBe(true);
    });

    it('returns false when time since last activity is below threshold', () => {
      const session = Session.reconstitute({
        sessionId,
        userId: 'user-001',
        csrfToken,
        expiresAt: '2025-01-16T00:00:00.000Z',
        lastActivityAt: '2025-01-15T10:00:00.000Z',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
        createdAt: now,
      });

      // 4 minutes after last activity
      expect(session.needsRefresh('2025-01-15T10:04:00.000Z')).toBe(false);
    });
  });

  describe('withUpdatedActivity', () => {
    it('returns a new session with updated lastActivityAt', () => {
      const session = Session.create({
        sessionId,
        userId: 'user-001',
        csrfToken,
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
        now,
      });

      const updatedTime = '2025-01-15T01:00:00.000Z';
      const updated = session.withUpdatedActivity(updatedTime);

      expect(updated.lastActivityAt).toBe(updatedTime);
      expect(updated.sessionId.equals(sessionId)).toBe(true);
    });

    it('does not mutate the original session', () => {
      const session = Session.create({
        sessionId,
        userId: 'user-001',
        csrfToken,
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
        now,
      });

      session.withUpdatedActivity('2025-01-15T01:00:00.000Z');

      expect(session.lastActivityAt).toBe(now);
    });
  });

  describe('validateCsrfToken', () => {
    it('returns true for a matching CSRF token', () => {
      const session = Session.create({
        sessionId,
        userId: 'user-001',
        csrfToken,
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
        now,
      });

      const sameToken = CsrfToken.fromString('a'.repeat(64));

      expect(session.validateCsrfToken(sameToken)).toBe(true);
    });

    it('returns false for a different CSRF token', () => {
      const session = Session.create({
        sessionId,
        userId: 'user-001',
        csrfToken,
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
        now,
      });

      const differentToken = CsrfToken.fromString('b'.repeat(64));

      expect(session.validateCsrfToken(differentToken)).toBe(false);
    });
  });
});
