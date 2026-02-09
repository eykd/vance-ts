import type { User } from '../../domain/entities/User';
import { UserBuilder } from '../builders/UserBuilder';

/**
 * Creates a user with a password hash matching MockPasswordHasher's format.
 *
 * @param overrides - UserBuilder method calls
 * @param overrides.id - User ID override
 * @param overrides.email - Email override
 * @param overrides.passwordHash - Password hash override
 * @param overrides.failedAttempts - Number of failed login attempts
 * @param overrides.locked - Whether the account is locked
 * @returns A User entity
 */
export function makeUser(
  overrides: {
    id?: string;
    email?: string;
    passwordHash?: string;
    failedAttempts?: number;
    locked?: boolean;
  } = {}
): User {
  let builder = new UserBuilder()
    .withId(overrides.id ?? '00000000-0000-4000-a000-000000000001')
    .withEmail(overrides.email ?? 'alice@example.com')
    .withPasswordHash(overrides.passwordHash ?? 'hashed:correct-password');

  if (overrides.failedAttempts !== undefined) {
    builder = builder.withFailedAttempts(overrides.failedAttempts);
  }

  if (overrides.locked === true) {
    builder = builder.withLockedAccount();
  }

  return builder.build();
}
