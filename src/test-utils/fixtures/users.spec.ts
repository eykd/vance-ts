import { validUser, lockedUser, userWithFailedAttempts } from './users';

describe('User fixtures', () => {
  describe('validUser', () => {
    it('has a valid id', () => {
      expect(validUser.id).toBe('user-valid-001');
    });

    it('has a valid email', () => {
      expect(validUser.email).toBe('alice@example.com');
      expect(validUser.emailNormalized).toBe('alice@example.com');
    });

    it('has a password hash', () => {
      expect(validUser.passwordHash).toBe('$2a$12$validhashedpasswordvalue');
    });

    it('has zero failed login attempts', () => {
      expect(validUser.failedLoginAttempts).toBe(0);
    });

    it('is not locked', () => {
      expect(validUser.lockedUntil).toBeNull();
    });

    it('has no last login info', () => {
      expect(validUser.lastLoginAt).toBeNull();
      expect(validUser.lastLoginIp).toBeNull();
      expect(validUser.lastLoginUserAgent).toBeNull();
    });

    it('has UTC ISO 8601 timestamps', () => {
      expect(validUser.createdAt).toBe('2025-01-15T00:00:00.000Z');
      expect(validUser.updatedAt).toBe('2025-01-15T00:00:00.000Z');
      expect(validUser.passwordChangedAt).toBe('2025-01-15T00:00:00.000Z');
    });
  });

  describe('lockedUser', () => {
    it('has a locked id', () => {
      expect(lockedUser.id).toBe('user-locked-001');
    });

    it('has a locked email', () => {
      expect(lockedUser.email).toBe('locked@example.com');
      expect(lockedUser.emailNormalized).toBe('locked@example.com');
    });

    it('has lockedUntil set to a future date', () => {
      expect(lockedUser.lockedUntil).toBe('2025-12-31T23:59:59.000Z');
    });

    it('has 5 failed login attempts', () => {
      expect(lockedUser.failedLoginAttempts).toBe(5);
    });
  });

  describe('userWithFailedAttempts', () => {
    it('has a failed-attempts id', () => {
      expect(userWithFailedAttempts.id).toBe('user-failed-001');
    });

    it('has a failed-attempts email', () => {
      expect(userWithFailedAttempts.email).toBe('failing@example.com');
      expect(userWithFailedAttempts.emailNormalized).toBe('failing@example.com');
    });

    it('has 4 failed login attempts', () => {
      expect(userWithFailedAttempts.failedLoginAttempts).toBe(4);
    });

    it('is not locked', () => {
      expect(userWithFailedAttempts.lockedUntil).toBeNull();
    });
  });
});
