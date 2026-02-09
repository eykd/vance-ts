import type { User } from '../../domain/entities/User';
import type { UserRepository } from '../../domain/interfaces/UserRepository';
import type { Email } from '../../domain/value-objects/Email';
import type { UserId } from '../../domain/value-objects/UserId';

/**
 * In-memory mock implementation of UserRepository for testing.
 *
 * Stores users in a Map keyed by user ID string. Supports optional
 * constructor seeding and test helper methods.
 */
export class MockUserRepository implements UserRepository {
  private readonly users: Map<string, User>;

  /**
   * Creates a new MockUserRepository with optional seed data.
   *
   * @param users - Optional array of User entities to pre-populate
   */
  constructor(users?: User[]) {
    this.users = new Map<string, User>();
    if (users !== undefined) {
      for (const user of users) {
        this.users.set(user.id.toString(), user);
      }
    }
  }

  /**
   * Finds a user by email, matching on normalized value.
   *
   * @param email - The Email value object to search by
   * @returns The User if found, or null
   */
  findByEmail(email: Email): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email.normalizedValue === email.normalizedValue) {
        return Promise.resolve(user);
      }
    }
    return Promise.resolve(null);
  }

  /**
   * Finds a user by their unique identifier.
   *
   * @param id - The UserId value object to search by
   * @returns The User if found, or null
   */
  findById(id: UserId): Promise<User | null> {
    const user = this.users.get(id.toString());
    return Promise.resolve(user ?? null);
  }

  /**
   * Persists a User entity, overwriting any existing user with the same ID.
   *
   * @param user - The User entity to save
   * @returns Resolves when the user is stored
   */
  save(user: User): Promise<void> {
    this.users.set(user.id.toString(), user);
    return Promise.resolve();
  }

  /**
   * Checks whether an email address is already registered.
   *
   * @param email - The Email value object to check
   * @returns True if a user with this email exists
   */
  emailExists(email: Email): Promise<boolean> {
    for (const user of this.users.values()) {
      if (user.email.normalizedValue === email.normalizedValue) {
        return Promise.resolve(true);
      }
    }
    return Promise.resolve(false);
  }

  /**
   * Test helper: adds a user directly to the in-memory store.
   *
   * @param user - The User entity to add
   */
  addUser(user: User): void {
    this.users.set(user.id.toString(), user);
  }

  /**
   * Test helper: retrieves a user by ID string directly from the store.
   *
   * @param id - The user ID string to look up
   * @returns The User if found, or undefined
   */
  getById(id: string): User | undefined {
    return this.users.get(id);
  }
}
