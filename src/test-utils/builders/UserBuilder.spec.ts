import type { User } from '../../domain/entities/User';

import { UserBuilder } from './UserBuilder';

describe('UserBuilder', () => {
  describe('build with defaults', () => {
    it('creates a user with valid default values', () => {
      const user = new UserBuilder().build();

      expect(user.id).toBe('user-default-id');
      expect(user.email.value).toBe('default@example.com');
      expect(user.email.normalizedValue).toBe('default@example.com');
      expect(user.passwordHash).toBe('$2a$12$defaulthashedpasswordvalue');
      expect(user.failedLoginAttempts).toBe(0);
      expect(user.lockedUntil).toBeNull();
      expect(user.lastLoginAt).toBeNull();
      expect(user.createdAt).toBe('2025-01-15T00:00:00.000Z');
      expect(user.updatedAt).toBe('2025-01-15T00:00:00.000Z');
      expect(user.passwordChangedAt).toBe('2025-01-15T00:00:00.000Z');
      expect(user.lastLoginIp).toBeNull();
      expect(user.lastLoginUserAgent).toBeNull();
    });
  });

  describe('withId', () => {
    it('sets a custom id', () => {
      const user = new UserBuilder().withId('custom-id').build();

      expect(user.id).toBe('custom-id');
    });
  });

  describe('withEmail', () => {
    it('sets the email and normalized email', () => {
      const user = new UserBuilder().withEmail('Test@Example.COM').build();

      expect(user.email.value).toBe('Test@Example.COM');
      expect(user.email.normalizedValue).toBe('test@example.com');
    });
  });

  describe('withPasswordHash', () => {
    it('sets a custom password hash', () => {
      const user = new UserBuilder().withPasswordHash('$2a$12$customhash').build();

      expect(user.passwordHash).toBe('$2a$12$customhash');
    });
  });

  describe('withFailedAttempts', () => {
    it('sets the number of failed login attempts', () => {
      const user = new UserBuilder().withFailedAttempts(3).build();

      expect(user.failedLoginAttempts).toBe(3);
    });
  });

  describe('withLockedAccount', () => {
    it('sets lockedUntil to a future date and failed attempts to 5', () => {
      const user = new UserBuilder().withLockedAccount().build();

      expect(user.lockedUntil).toBe('2025-12-31T23:59:59.000Z');
      expect(user.failedLoginAttempts).toBe(5);
    });
  });

  describe('withLastLogin', () => {
    it('sets last login timestamp, IP, and user agent', () => {
      const user = new UserBuilder().withLastLogin().build();

      expect(user.lastLoginAt).toBe('2025-01-14T12:00:00.000Z');
      expect(user.lastLoginIp).toBe('192.168.1.1');
      expect(user.lastLoginUserAgent).toBe('Mozilla/5.0 (compatible; TestAgent/1.0)');
    });
  });

  describe('fluent chaining', () => {
    it('supports chaining multiple methods', () => {
      const user = new UserBuilder()
        .withId('chained-id')
        .withEmail('Chained@Test.com')
        .withFailedAttempts(2)
        .withLastLogin()
        .build();

      expect(user.id).toBe('chained-id');
      expect(user.email.value).toBe('Chained@Test.com');
      expect(user.email.normalizedValue).toBe('chained@test.com');
      expect(user.failedLoginAttempts).toBe(2);
      expect(user.lastLoginAt).toBe('2025-01-14T12:00:00.000Z');
    });
  });

  describe('immutability', () => {
    it('returns a new object on each build', () => {
      const builder = new UserBuilder();
      const user1 = builder.build();
      const user2 = builder.build();

      expect(user1.id).toBe(user2.id);
      expect(user1).not.toBe(user2);
    });
  });

  describe('type safety', () => {
    it('returns a User entity', () => {
      const user: User = new UserBuilder().build();

      expect(user).toBeDefined();
    });
  });
});
