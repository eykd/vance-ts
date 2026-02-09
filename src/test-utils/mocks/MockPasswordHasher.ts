import type { PasswordHasher } from '../../domain/interfaces/PasswordHasher';

/**
 * In-memory mock implementation of PasswordHasher for testing.
 *
 * Uses a simple "hashed:{password}" format and tracks all calls
 * for test assertions.
 */
export class MockPasswordHasher implements PasswordHasher {
  /** Passwords passed to hash(), in call order. */
  readonly hashCalls: string[] = [];

  /** Arguments passed to verify(), in call order. */
  readonly verifyCalls: Array<{ password: string; hash: string }> = [];

  /**
   * Returns a deterministic hash in "hashed:{password}" format.
   *
   * @param password - The plaintext password to hash
   * @returns The mock hash string
   */
  hash(password: string): Promise<string> {
    this.hashCalls.push(password);
    return Promise.resolve('hashed:' + password);
  }

  /**
   * Verifies a password against a mock hash.
   *
   * @param password - The plaintext password to verify
   * @param hash - The stored hash to compare against
   * @returns True if hash equals "hashed:{password}"
   */
  verify(password: string, hash: string): Promise<boolean> {
    this.verifyCalls.push({ password, hash });
    return Promise.resolve(hash === 'hashed:' + password);
  }
}
