import { Email } from '../value-objects/Email';
import { UserId } from '../value-objects/UserId';

import { User } from './User';

describe('User', () => {
  const defaultId = UserId.fromString('550e8400-e29b-41d4-a716-446655440000');
  const defaultEmail = Email.create('alice@example.com');
  const now = '2025-01-15T00:00:00.000Z';

  describe('create', () => {
    it('creates a new user with initial values', () => {
      const user = User.create({
        id: defaultId,
        email: defaultEmail,
        passwordHash: '$2a$12$hash',
        now,
      });

      expect(user.id.equals(defaultId)).toBe(true);
      expect(user.email.equals(defaultEmail)).toBe(true);
      expect(user.passwordHash).toBe('$2a$12$hash');
      expect(user.failedLoginAttempts).toBe(0);
      expect(user.lockedUntil).toBeNull();
      expect(user.lastLoginAt).toBeNull();
      expect(user.createdAt).toBe(now);
      expect(user.updatedAt).toBe(now);
      expect(user.passwordChangedAt).toBe(now);
      expect(user.lastLoginIp).toBeNull();
      expect(user.lastLoginUserAgent).toBeNull();
    });
  });

  describe('reconstitute', () => {
    it('creates a user from stored data without validation', () => {
      const email = Email.reconstitute('Bob@Test.COM', 'bob@test.com');
      const anotherId = UserId.fromString('660e8400-e29b-41d4-a716-446655440000');
      const user = User.reconstitute({
        id: anotherId,
        email,
        passwordHash: '$2a$12$stored',
        failedLoginAttempts: 3,
        lockedUntil: '2025-12-31T23:59:59.000Z',
        lastLoginAt: '2025-01-14T12:00:00.000Z',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-14T12:00:00.000Z',
        passwordChangedAt: '2025-01-10T00:00:00.000Z',
        lastLoginIp: '192.168.1.1',
        lastLoginUserAgent: 'Mozilla/5.0',
      });

      expect(user.id.equals(anotherId)).toBe(true);
      expect(user.email.equals(email)).toBe(true);
      expect(user.passwordHash).toBe('$2a$12$stored');
      expect(user.failedLoginAttempts).toBe(3);
      expect(user.lockedUntil).toBe('2025-12-31T23:59:59.000Z');
      expect(user.lastLoginAt).toBe('2025-01-14T12:00:00.000Z');
      expect(user.createdAt).toBe('2025-01-01T00:00:00.000Z');
      expect(user.updatedAt).toBe('2025-01-14T12:00:00.000Z');
      expect(user.passwordChangedAt).toBe('2025-01-10T00:00:00.000Z');
      expect(user.lastLoginIp).toBe('192.168.1.1');
      expect(user.lastLoginUserAgent).toBe('Mozilla/5.0');
    });
  });

  describe('isLocked', () => {
    it('returns false when lockedUntil is null', () => {
      const user = User.create({
        id: defaultId,
        email: defaultEmail,
        passwordHash: '$2a$12$hash',
        now,
      });

      expect(user.isLocked(now)).toBe(false);
    });

    it('returns true when now is before lockedUntil', () => {
      const user = User.reconstitute({
        id: defaultId,
        email: defaultEmail,
        passwordHash: '$2a$12$hash',
        failedLoginAttempts: 5,
        lockedUntil: '2025-01-15T00:15:00.000Z',
        lastLoginAt: null,
        createdAt: now,
        updatedAt: now,
        passwordChangedAt: now,
        lastLoginIp: null,
        lastLoginUserAgent: null,
      });

      expect(user.isLocked('2025-01-15T00:10:00.000Z')).toBe(true);
    });

    it('returns false when now is after lockedUntil', () => {
      const user = User.reconstitute({
        id: defaultId,
        email: defaultEmail,
        passwordHash: '$2a$12$hash',
        failedLoginAttempts: 5,
        lockedUntil: '2025-01-15T00:15:00.000Z',
        lastLoginAt: null,
        createdAt: now,
        updatedAt: now,
        passwordChangedAt: now,
        lastLoginIp: null,
        lastLoginUserAgent: null,
      });

      expect(user.isLocked('2025-01-15T00:20:00.000Z')).toBe(false);
    });

    it('returns false when now equals lockedUntil', () => {
      const user = User.reconstitute({
        id: defaultId,
        email: defaultEmail,
        passwordHash: '$2a$12$hash',
        failedLoginAttempts: 5,
        lockedUntil: '2025-01-15T00:15:00.000Z',
        lastLoginAt: null,
        createdAt: now,
        updatedAt: now,
        passwordChangedAt: now,
        lastLoginIp: null,
        lastLoginUserAgent: null,
      });

      expect(user.isLocked('2025-01-15T00:15:00.000Z')).toBe(false);
    });
  });

  describe('recordFailedLogin', () => {
    it('increments failed login attempts', () => {
      const user = User.create({
        id: defaultId,
        email: defaultEmail,
        passwordHash: '$2a$12$hash',
        now,
      });

      const updated = user.recordFailedLogin(now, '2025-01-15T00:15:00.000Z');

      expect(updated.failedLoginAttempts).toBe(1);
      expect(updated.updatedAt).toBe(now);
    });

    it('does not mutate the original user', () => {
      const user = User.create({
        id: defaultId,
        email: defaultEmail,
        passwordHash: '$2a$12$hash',
        now,
      });

      user.recordFailedLogin(now, '2025-01-15T00:15:00.000Z');

      expect(user.failedLoginAttempts).toBe(0);
    });

    it('sets lockedUntil when reaching max failed attempts', () => {
      const user = User.reconstitute({
        id: defaultId,
        email: defaultEmail,
        passwordHash: '$2a$12$hash',
        failedLoginAttempts: 4,
        lockedUntil: null,
        lastLoginAt: null,
        createdAt: now,
        updatedAt: now,
        passwordChangedAt: now,
        lastLoginIp: null,
        lastLoginUserAgent: null,
      });

      const failTime = '2025-01-15T10:00:00.000Z';
      const lockoutExpiry = '2025-01-15T10:15:00.000Z';
      const locked = user.recordFailedLogin(failTime, lockoutExpiry);

      expect(locked.failedLoginAttempts).toBe(5);
      expect(locked.lockedUntil).toBe(lockoutExpiry);
    });

    it('does not set lockedUntil before reaching max failed attempts', () => {
      const user = User.reconstitute({
        id: defaultId,
        email: defaultEmail,
        passwordHash: '$2a$12$hash',
        failedLoginAttempts: 3,
        lockedUntil: null,
        lastLoginAt: null,
        createdAt: now,
        updatedAt: now,
        passwordChangedAt: now,
        lastLoginIp: null,
        lastLoginUserAgent: null,
      });

      const updated = user.recordFailedLogin(now, '2025-01-15T00:15:00.000Z');

      expect(updated.failedLoginAttempts).toBe(4);
      expect(updated.lockedUntil).toBeNull();
    });
  });

  describe('recordSuccessfulLogin', () => {
    it('resets failed login attempts and sets login metadata', () => {
      const user = User.reconstitute({
        id: defaultId,
        email: defaultEmail,
        passwordHash: '$2a$12$hash',
        failedLoginAttempts: 3,
        lockedUntil: '2025-01-15T00:15:00.000Z',
        lastLoginAt: null,
        createdAt: now,
        updatedAt: now,
        passwordChangedAt: now,
        lastLoginIp: null,
        lastLoginUserAgent: null,
      });

      const loginTime = '2025-01-15T01:00:00.000Z';
      const loggedIn = user.recordSuccessfulLogin(loginTime, '10.0.0.1', 'Chrome/120');

      expect(loggedIn.failedLoginAttempts).toBe(0);
      expect(loggedIn.lockedUntil).toBeNull();
      expect(loggedIn.lastLoginAt).toBe(loginTime);
      expect(loggedIn.lastLoginIp).toBe('10.0.0.1');
      expect(loggedIn.lastLoginUserAgent).toBe('Chrome/120');
      expect(loggedIn.updatedAt).toBe(loginTime);
    });

    it('does not mutate the original user', () => {
      const user = User.create({
        id: defaultId,
        email: defaultEmail,
        passwordHash: '$2a$12$hash',
        now,
      });

      user.recordSuccessfulLogin(now, '10.0.0.1', 'Chrome/120');

      expect(user.lastLoginAt).toBeNull();
    });
  });

  describe('updatePassword', () => {
    it('updates password hash and timestamps', () => {
      const user = User.create({
        id: defaultId,
        email: defaultEmail,
        passwordHash: '$2a$12$oldhash',
        now,
      });

      const changeTime = '2025-01-16T00:00:00.000Z';
      const updated = user.updatePassword('$2a$12$newhash', changeTime);

      expect(updated.passwordHash).toBe('$2a$12$newhash');
      expect(updated.passwordChangedAt).toBe(changeTime);
      expect(updated.updatedAt).toBe(changeTime);
    });

    it('does not mutate the original user', () => {
      const user = User.create({
        id: defaultId,
        email: defaultEmail,
        passwordHash: '$2a$12$oldhash',
        now,
      });

      user.updatePassword('$2a$12$newhash', '2025-01-16T00:00:00.000Z');

      expect(user.passwordHash).toBe('$2a$12$oldhash');
    });
  });
});
