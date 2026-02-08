/**
 * Shape of a User data object for testing purposes.
 *
 * Matches the expected User entity structure before the entity is implemented.
 * All timestamps are in UTC ISO 8601 format.
 */
export interface UserProps {
  /** Unique user identifier. */
  readonly id: string;
  /** User's email address as originally provided. */
  readonly email: string;
  /** Lowercased email for case-insensitive lookups. */
  readonly emailNormalized: string;
  /** Bcrypt-hashed password. */
  readonly passwordHash: string;
  /** Number of consecutive failed login attempts. */
  readonly failedLoginAttempts: number;
  /** UTC ISO 8601 timestamp when account lockout expires, or null if not locked. */
  readonly lockedUntil: string | null;
  /** UTC ISO 8601 timestamp of last successful login, or null if never logged in. */
  readonly lastLoginAt: string | null;
  /** UTC ISO 8601 timestamp when the user was created. */
  readonly createdAt: string;
  /** UTC ISO 8601 timestamp when the user was last updated. */
  readonly updatedAt: string;
  /** UTC ISO 8601 timestamp when the password was last changed. */
  readonly passwordChangedAt: string;
  /** IP address of last successful login, or null if never logged in. */
  readonly lastLoginIp: string | null;
  /** User agent of last successful login, or null if never logged in. */
  readonly lastLoginUserAgent: string | null;
}

/**
 * Fluent builder for creating User test data objects.
 *
 * Provides sensible defaults and chainable methods for overriding specific
 * properties. Each call to build() returns a new object.
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
  private id = 'user-default-id';
  private email = 'default@example.com';
  private emailNormalized = 'default@example.com';
  private passwordHash = '$2a$12$defaulthashedpasswordvalue';
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
   * @param hash - The bcrypt password hash to set
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
   * Builds and returns a new UserProps object with current settings.
   *
   * @returns A frozen UserProps object
   */
  build(): UserProps {
    return {
      id: this.id,
      email: this.email,
      emailNormalized: this.emailNormalized,
      passwordHash: this.passwordHash,
      failedLoginAttempts: this.failedLoginAttempts,
      lockedUntil: this.lockedUntil,
      lastLoginAt: this.lastLoginAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      passwordChangedAt: this.passwordChangedAt,
      lastLoginIp: this.lastLoginIp,
      lastLoginUserAgent: this.lastLoginUserAgent,
    };
  }
}
