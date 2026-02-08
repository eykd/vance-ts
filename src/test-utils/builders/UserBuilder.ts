import { User } from '../../domain/entities/User';
import { Email } from '../../domain/value-objects/Email';
import { UserId } from '../../domain/value-objects/UserId';

/**
 * Fluent builder for creating User entity test instances.
 *
 * Provides sensible defaults and chainable methods for overriding specific
 * properties. Each call to build() returns a new User entity.
 *
 * @example
 * ```typescript
 * const user = new UserBuilder()
 *   .withId('user-123')
 *   .withEmail('alice@example.com')
 *   .withFailedAttempts(3)
 *   .build();
 * ```
 */
export class UserBuilder {
  private id = '00000000-0000-4000-a000-000000000001';
  private email = 'default@example.com';
  private emailNormalized = 'default@example.com';
  private passwordHash = '$argon2id$v=19$m=19456,t=2,p=1$dGVzdHNhbHQ$dGVzdGhhc2h2YWx1ZQ';
  private failedLoginAttempts = 0;
  private lockedUntil: string | null = null;
  private lastLoginAt: string | null = null;
  private createdAt = '2025-01-15T00:00:00.000Z';
  private updatedAt = '2025-01-15T00:00:00.000Z';
  private passwordChangedAt = '2025-01-15T00:00:00.000Z';
  private lastLoginIp: string | null = null;
  private lastLoginUserAgent: string | null = null;

  /**
   * Sets the user ID.
   *
   * @param id - The user ID to set
   * @returns This builder for chaining
   */
  withId(id: string): this {
    this.id = id;
    return this;
  }

  /**
   * Sets the email and its normalized (lowercased) form.
   *
   * @param email - The email address to set
   * @returns This builder for chaining
   */
  withEmail(email: string): this {
    this.email = email;
    this.emailNormalized = email.toLowerCase();
    return this;
  }

  /**
   * Sets the password hash.
   *
   * @param hash - The Argon2id password hash to set
   * @returns This builder for chaining
   */
  withPasswordHash(hash: string): this {
    this.passwordHash = hash;
    return this;
  }

  /**
   * Sets the number of failed login attempts.
   *
   * @param count - The number of failed attempts
   * @returns This builder for chaining
   */
  withFailedAttempts(count: number): this {
    this.failedLoginAttempts = count;
    return this;
  }

  /**
   * Configures the user as locked out with a future lockout date and 5 failed attempts.
   *
   * @returns This builder for chaining
   */
  withLockedAccount(): this {
    this.lockedUntil = '2025-12-31T23:59:59.000Z';
    this.failedLoginAttempts = 5;
    return this;
  }

  /**
   * Sets last login metadata with fixed test values.
   *
   * @returns This builder for chaining
   */
  withLastLogin(): this {
    this.lastLoginAt = '2025-01-14T12:00:00.000Z';
    this.lastLoginIp = '192.168.1.1';
    this.lastLoginUserAgent = 'Mozilla/5.0 (compatible; TestAgent/1.0)';
    return this;
  }

  /**
   * Builds and returns a new User entity with current settings.
   *
   * @returns A User entity instance
   */
  build(): User {
    const emailVo = Email.reconstitute(this.email, this.emailNormalized);

    return User.reconstitute({
      id: UserId.fromString(this.id),
      email: emailVo,
      passwordHash: this.passwordHash,
      failedLoginAttempts: this.failedLoginAttempts,
      lockedUntil: this.lockedUntil,
      lastLoginAt: this.lastLoginAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      passwordChangedAt: this.passwordChangedAt,
      lastLoginIp: this.lastLoginIp,
      lastLoginUserAgent: this.lastLoginUserAgent,
    });
  }
}
