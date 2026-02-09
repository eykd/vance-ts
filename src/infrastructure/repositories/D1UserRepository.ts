import { User } from '../../domain/entities/User';
import type { UserRepository } from '../../domain/interfaces/UserRepository';
import { Email } from '../../domain/value-objects/Email';
import { UserId } from '../../domain/value-objects/UserId';
import type { D1Database } from '../types/CloudflareTypes';

/**
 * Database row shape for the users table.
 *
 * Maps directly to the column names in migrations/0001_create_users_table.sql.
 * This type is file-private and must not be exported.
 */
interface UserRow {
  readonly id: string;
  readonly email: string;
  readonly email_normalized: string;
  readonly password_hash: string;
  readonly failed_login_attempts: number;
  readonly locked_until: string | null;
  readonly last_login_at: string | null;
  readonly created_at: string;
  readonly updated_at: string;
  readonly password_changed_at: string;
  readonly last_login_ip: string | null;
  readonly last_login_user_agent: string | null;
}

/**
 * Reconstitutes a User entity from a database row.
 *
 * @param row - The database row to convert
 * @returns A User entity
 */
function toDomain(row: UserRow): User {
  return User.reconstitute({
    id: UserId.fromString(row.id),
    email: Email.reconstitute(row.email, row.email_normalized),
    passwordHash: row.password_hash,
    failedLoginAttempts: row.failed_login_attempts,
    lockedUntil: row.locked_until,
    lastLoginAt: row.last_login_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    passwordChangedAt: row.password_changed_at,
    lastLoginIp: row.last_login_ip,
    lastLoginUserAgent: row.last_login_user_agent,
  });
}

/**
 * D1-backed implementation of the UserRepository port.
 *
 * Persists and retrieves User entities using Cloudflare D1 (SQLite).
 * All queries use parameterized bindings to prevent SQL injection.
 */
export class D1UserRepository implements UserRepository {
  private readonly db: D1Database;

  /**
   * Creates a new D1UserRepository.
   *
   * @param db - The D1 database binding
   */
  constructor(db: D1Database) {
    this.db = db;
  }

  /**
   * Finds a user by their email address.
   *
   * Searches by normalized (lowercased) email for case-insensitive matching.
   *
   * @param email - The Email value object to search by
   * @returns The User entity if found, or null
   */
  async findByEmail(email: Email): Promise<User | null> {
    const row = await this.db
      .prepare('SELECT * FROM users WHERE email_normalized = ?')
      .bind(email.normalizedValue)
      .first<UserRow>();

    if (row === null) {
      return null;
    }

    return toDomain(row);
  }

  /**
   * Finds a user by their unique identifier.
   *
   * @param id - The UserId value object to search by
   * @returns The User entity if found, or null
   */
  async findById(id: UserId): Promise<User | null> {
    const row = await this.db
      .prepare('SELECT * FROM users WHERE id = ?')
      .bind(id.toString())
      .first<UserRow>();

    if (row === null) {
      return null;
    }

    return toDomain(row);
  }

  /**
   * Persists a User entity using upsert (insert or update on conflict).
   *
   * @param user - The User entity to save
   */
  async save(user: User): Promise<void> {
    await this.db
      .prepare(
        `INSERT INTO users (id, email, email_normalized, password_hash, failed_login_attempts, locked_until, last_login_at, created_at, updated_at, password_changed_at, last_login_ip, last_login_user_agent)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           email = excluded.email,
           email_normalized = excluded.email_normalized,
           password_hash = excluded.password_hash,
           failed_login_attempts = excluded.failed_login_attempts,
           locked_until = excluded.locked_until,
           last_login_at = excluded.last_login_at,
           updated_at = excluded.updated_at,
           password_changed_at = excluded.password_changed_at,
           last_login_ip = excluded.last_login_ip,
           last_login_user_agent = excluded.last_login_user_agent`
      )
      .bind(
        user.id.toString(),
        user.email.value,
        user.email.normalizedValue,
        user.passwordHash,
        user.failedLoginAttempts,
        user.lockedUntil,
        user.lastLoginAt,
        user.createdAt,
        user.updatedAt,
        user.passwordChangedAt,
        user.lastLoginIp,
        user.lastLoginUserAgent
      )
      .run();
  }

  /**
   * Checks whether an email address is already registered.
   *
   * Searches by normalized (lowercased) email for case-insensitive matching.
   *
   * @param email - The Email value object to check
   * @returns True if a user with this email exists
   */
  async emailExists(email: Email): Promise<boolean> {
    const row = await this.db
      .prepare('SELECT 1 FROM users WHERE email_normalized = ?')
      .bind(email.normalizedValue)
      .first<{ '1': number }>();

    return row !== null;
  }
}
