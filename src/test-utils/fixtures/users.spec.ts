import { validUser, lockedUser, userWithFailedAttempts } from './users';

describe('User fixtures', () => {
  describe('validUser', () => {
    it('has a valid id', () => {
      expect(validUser.id.toString()).toBe('00000000-0000-4000-a000-000000000101');
    });

    it('has a valid email', () => {
      expect(validUser.email.value).toBe('alice@example.com');
      expect(validUser.email.normalizedValue).toBe('alice@example.com');
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
      expect(lockedUser.id.toString()).toBe('00000000-0000-4000-a000-000000000102');
    });

    it('has a locked email', () => {
      expect(lockedUser.email.value).toBe('locked@example.com');
      expect(lockedUser.email.normalizedValue).toBe('locked@example.com');
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
      expect(userWithFailedAttempts.id.toString()).toBe('00000000-0000-4000-a000-000000000103');
    });

    it('has a failed-attempts email', () => {
      expect(userWithFailedAttempts.email.value).toBe('failing@example.com');
      expect(userWithFailedAttempts.email.normalizedValue).toBe('failing@example.com');
    });

    it('has 4 failed login attempts', () => {
      expect(userWithFailedAttempts.failedLoginAttempts).toBe(4);
    });

    it('is not locked', () => {
      expect(userWithFailedAttempts.lockedUntil).toBeNull();
    });
  });
});
