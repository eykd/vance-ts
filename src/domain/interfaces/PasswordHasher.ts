/**
 * Port defining how the domain expects to hash and verify passwords.
 *
 * Implementations MUST use Argon2id with default parameters per OWASP
 * recommendations (minimum: m=19456 KiB, t=2, p=1).
 *
 * @see https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
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
