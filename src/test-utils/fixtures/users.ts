import type { User } from '../../domain/entities/User';
import { UserBuilder } from '../builders/UserBuilder';

/**
 * A normal user with no lockout and zero failed attempts.
 *
 * Use this fixture for tests involving standard authenticated user behavior.
 */
export const validUser: User = new UserBuilder()
  .withId('00000000-0000-4000-a000-000000000101')
  .withEmail('alice@example.com')
  .withPasswordHash('$2a$12$validhashedpasswordvalue')
  .build();

/**
 * A user whose account is locked with lockedUntil set to a future date.
 *
 * Use this fixture for tests involving account lockout logic.
 */
export const lockedUser: User = new UserBuilder()
  .withId('00000000-0000-4000-a000-000000000102')
  .withEmail('locked@example.com')
  .withPasswordHash('$2a$12$lockedhashedpasswordvalue')
  .withLockedAccount()
  .build();

/**
 * A user with 4 failed login attempts (one away from lockout).
 *
 * Use this fixture for tests involving failed attempt thresholds.
 */
export const userWithFailedAttempts: User = new UserBuilder()
  .withId('00000000-0000-4000-a000-000000000103')
  .withEmail('failing@example.com')
  .withPasswordHash('$2a$12$failedhashedpasswordvalue')
  .withFailedAttempts(4)
  .build();
