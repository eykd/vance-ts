import type { Email } from '../value-objects/Email';
import type { UserId } from '../value-objects/UserId';

interface UserProps {
  readonly id: UserId;
  readonly email: Email;
  readonly passwordHash: string;
  readonly failedLoginAttempts: number;
  readonly lockedUntil: string | null;
  readonly lastLoginAt: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly passwordChangedAt: string;
  readonly lastLoginIp: string | null;
  readonly lastLoginUserAgent: string | null;
}

/**
 * Entity representing an authenticated user.
 *
 * Tracks login attempts, account lockout, and login metadata.
 * All mutations return a new User instance (immutable).
 */
export class User {
  /** Maximum failed login attempts before account lockout. */
  static readonly MAX_FAILED_ATTEMPTS = 5;

  /** Duration of account lockout in milliseconds (15 minutes). */
  static readonly LOCK_DURATION_MS = 15 * 60 * 1000;

  private constructor(private readonly props: UserProps) {}

  /**
   * Creates a new User with initial default values.
   *
   * @param params - The creation parameters
   * @param params.id - Unique UserId value object
   * @param params.email - Validated Email value object
   * @param params.passwordHash - Hashed password string
   * @param params.now - Current UTC ISO 8601 timestamp
   * @returns A new User instance
   */
  static create(params: { id: UserId; email: Email; passwordHash: string; now: string }): User {
    return new User({
      id: params.id,
      email: params.email,
      passwordHash: params.passwordHash,
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastLoginAt: null,
      createdAt: params.now,
      updatedAt: params.now,
      passwordChangedAt: params.now,
      lastLoginIp: null,
      lastLoginUserAgent: null,
    });
  }

  /**
   * Reconstitutes a User from persisted data without validation.
   *
   * @param props - The stored user properties
   * @param props.id - Unique UserId value object
   * @param props.email - Validated Email value object
   * @param props.passwordHash - Hashed password string
   * @param props.failedLoginAttempts - Number of consecutive failed login attempts
   * @param props.lockedUntil - UTC ISO 8601 lockout expiry or null
   * @param props.lastLoginAt - UTC ISO 8601 last login timestamp or null
   * @param props.createdAt - UTC ISO 8601 creation timestamp
   * @param props.updatedAt - UTC ISO 8601 last update timestamp
   * @param props.passwordChangedAt - UTC ISO 8601 password change timestamp
   * @param props.lastLoginIp - IP address of last login or null
   * @param props.lastLoginUserAgent - User agent of last login or null
   * @returns A User instance
   */
  static reconstitute(props: {
    id: UserId;
    email: Email;
    passwordHash: string;
    failedLoginAttempts: number;
    lockedUntil: string | null;
    lastLoginAt: string | null;
    createdAt: string;
    updatedAt: string;
    passwordChangedAt: string;
    lastLoginIp: string | null;
    lastLoginUserAgent: string | null;
  }): User {
    return new User(props);
  }

  /**
   * Returns the unique user identifier.
   *
   * @returns The UserId value object
   */
  get id(): UserId {
    return this.props.id;
  }

  /**
   * Returns the user's email value object.
   *
   * @returns The Email value object
   */
  get email(): Email {
    return this.props.email;
  }

  /**
   * Returns the hashed password.
   *
   * @returns The password hash string
   */
  get passwordHash(): string {
    return this.props.passwordHash;
  }

  /**
   * Returns the number of consecutive failed login attempts.
   *
   * @returns The failed attempt count
   */
  get failedLoginAttempts(): number {
    return this.props.failedLoginAttempts;
  }

  /**
   * Returns the UTC ISO 8601 timestamp when the lockout expires, or null.
   *
   * @returns The lockout expiry timestamp or null
   */
  get lockedUntil(): string | null {
    return this.props.lockedUntil;
  }

  /**
   * Returns the UTC ISO 8601 timestamp of the last successful login, or null.
   *
   * @returns The last login timestamp or null
   */
  get lastLoginAt(): string | null {
    return this.props.lastLoginAt;
  }

  /**
   * Returns the UTC ISO 8601 timestamp when the user was created.
   *
   * @returns The creation timestamp
   */
  get createdAt(): string {
    return this.props.createdAt;
  }

  /**
   * Returns the UTC ISO 8601 timestamp when the user was last updated.
   *
   * @returns The last update timestamp
   */
  get updatedAt(): string {
    return this.props.updatedAt;
  }

  /**
   * Returns the UTC ISO 8601 timestamp when the password was last changed.
   *
   * @returns The password change timestamp
   */
  get passwordChangedAt(): string {
    return this.props.passwordChangedAt;
  }

  /**
   * Returns the IP address of the last successful login, or null.
   *
   * @returns The last login IP or null
   */
  get lastLoginIp(): string | null {
    return this.props.lastLoginIp;
  }

  /**
   * Returns the user agent of the last successful login, or null.
   *
   * @returns The last login user agent or null
   */
  get lastLoginUserAgent(): string | null {
    return this.props.lastLoginUserAgent;
  }

  /**
   * Checks whether the account is currently locked.
   *
   * @param now - Current UTC ISO 8601 timestamp
   * @returns True if the account is locked and the lockout has not expired
   */
  isLocked(now: string): boolean {
    if (this.props.lockedUntil === null) {
      return false;
    }
    return now < this.props.lockedUntil;
  }

  /**
   * Records a failed login attempt and locks the account if threshold is reached.
   *
   * @param now - Current UTC ISO 8601 timestamp
   * @returns A new User with incremented failed attempts and possible lockout
   */
  recordFailedLogin(now: string): User {
    const newAttempts = this.props.failedLoginAttempts + 1;
    const shouldLock = newAttempts >= User.MAX_FAILED_ATTEMPTS;

    return new User({
      ...this.props,
      failedLoginAttempts: newAttempts,
      lockedUntil: shouldLock
        ? new Date(new Date(now).getTime() + User.LOCK_DURATION_MS).toISOString()
        : this.props.lockedUntil,
      updatedAt: now,
    });
  }

  /**
   * Records a successful login, resetting failed attempts and setting metadata.
   *
   * @param now - Current UTC ISO 8601 timestamp
   * @param ip - IP address of the login request
   * @param userAgent - User agent string of the login request
   * @returns A new User with reset attempts and updated login metadata
   */
  recordSuccessfulLogin(now: string, ip: string, userAgent: string): User {
    return new User({
      ...this.props,
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastLoginAt: now,
      lastLoginIp: ip,
      lastLoginUserAgent: userAgent,
      updatedAt: now,
    });
  }

  /**
   * Updates the password hash and related timestamps.
   *
   * @param newPasswordHash - The new hashed password
   * @param now - Current UTC ISO 8601 timestamp
   * @returns A new User with updated password hash and timestamps
   */
  updatePassword(newPasswordHash: string, now: string): User {
    return new User({
      ...this.props,
      passwordHash: newPasswordHash,
      passwordChangedAt: now,
      updatedAt: now,
    });
  }
}
