/**
 * Port defining how the domain expects to hash and verify passwords.
 *
 * Implementations live in the infrastructure layer and should use
 * Web Crypto API compatible hashing (e.g., PBKDF2, argon2).
 */
export interface PasswordHasher {
  /**
   * Hashes a plaintext password.
   *
   * @param password - The plaintext password to hash
   * @returns The hashed password string
   */
  hash(password: string): Promise<string>;

  /**
   * Verifies a plaintext password against a hash.
   *
   * @param password - The plaintext password to verify
   * @param hash - The stored hash to compare against
   * @returns True if the password matches the hash
   */
  verify(password: string, hash: string): Promise<boolean>;
}
