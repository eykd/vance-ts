import type { User } from '../entities/User';
import type { Email } from '../value-objects/Email';
import type { UserId } from '../value-objects/UserId';

/**
 * Port defining how the domain expects to persist and retrieve User entities.
 *
 * Implementations live in the infrastructure layer (e.g., D1UserRepository).
 */
export interface UserRepository {
  /**
   * Finds a user by their email address.
   *
   * @param email - The Email value object to search by
   * @returns The User entity if found, or null
   */
  findByEmail(email: Email): Promise<User | null>;

  /**
   * Finds a user by their unique identifier.
   *
   * @param id - The UserId value object to search by
   * @returns The User entity if found, or null
   */
  findById(id: UserId): Promise<User | null>;

  /**
   * Persists a User entity (insert or update).
   *
   * @param user - The User entity to save
   */
  save(user: User): Promise<void>;

  /**
   * Checks whether an email address is already registered.
   *
   * @param email - The Email value object to check
   * @returns True if a user with this email exists
   */
  emailExists(email: Email): Promise<boolean>;
}
