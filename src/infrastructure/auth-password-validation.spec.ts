/**
 * Integration tests verifying better-auth password validation behaviour at the
 * API boundary (auth.api.signUpEmail, backing POST /api/auth/sign-up/email).
 *
 * Security review finding S5: verify better-auth v1.4.x password.validate
 * hook return convention before implementing it in auth.ts.
 *
 * INVESTIGATION RESULT: better-auth v1.4.x does NOT expose a password.validate
 * hook. The `emailAndPassword.password` option only accepts `hash()` (custom
 * hashing) and `verify()` (custom verification). Returning `false` from
 * `verify()` means "invalid credentials" during sign-in, not "reject this
 * password during sign-up". There is no callback to intercept or veto a
 * password at registration time.
 *
 * CONSEQUENCE: Common-password validation MUST be implemented in the application
 * layer (SignUpUseCase) before delegating to auth.api.signUpEmail. The auth.ts
 * module docstring documents this design decision.
 *
 * These tests use the real better-auth library (no vi.mock) backed by the
 * built-in memoryAdapter. The memoryAdapter requires no D1 database, making
 * it suitable for unit-speed integration testing within the Workers runtime.
 *
 * @module
 */

import { betterAuth } from 'better-auth';
import { memoryAdapter } from 'better-auth/adapters/memory';
import type { MemoryDB } from 'better-auth/adapters/memory';
import { describe, expect, it } from 'vitest';

/**
 * Builds a fresh in-memory database with empty tables required by
 * better-auth's emailAndPassword feature.
 *
 * Tables provided:
 * - `user` — user records
 * - `account` — credential (password) links created by better-auth on sign-up
 * - `session` — session records (created when autoSignIn is true)
 * - `verification` — email verification tokens
 *
 * @returns A MemoryDB with empty tables for a clean test environment.
 */
function makeTestDb(): MemoryDB {
  return {
    user: [],
    account: [],
    session: [],
    verification: [],
  };
}

/**
 * Creates a real better-auth instance backed by an in-memory database.
 *
 * Configured with the same constraints as production:
 * - minPasswordLength: 12
 * - maxPasswordLength: 128
 * - emailAndPassword enabled, email verification not required
 *
 * Uses better-auth's default password hasher (not the custom Argon2id hasher
 * from domain/services/passwordHasher) to keep the test self-contained.
 *
 * @param db - The MemoryDB instance to use for this auth instance.
 * @returns A configured better-auth instance.
 */
function makeTestAuth(db: MemoryDB): ReturnType<typeof betterAuth> {
  return betterAuth({
    database: memoryAdapter(db),
    baseURL: 'http://localhost:8787',
    secret: 'a'.repeat(32),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
      minPasswordLength: 12,
      maxPasswordLength: 128,
    },
  });
}

describe('POST /api/auth/sign-up/email: password validation at the API boundary', () => {
  /**
   * Primary test required by security review finding S5.
   *
   * 'password123' is 11 characters — below minPasswordLength:12. better-auth
   * rejects it with HTTP 400 (BAD_REQUEST / PASSWORD_TOO_SHORT) before any
   * database access occurs. An empty MemoryDB is sufficient for this path.
   *
   * NOTE: 'password123' is NOT in the COMMON_PASSWORDS blocklist. Its
   * rejection here is solely due to length, not common-password detection.
   * Common passwords that are ≥ 12 characters (e.g. 'iloveyou1234') would
   * NOT be rejected by better-auth — the application layer must handle those.
   */
  it('rejects password123 with 400: it has 11 characters and minPasswordLength is 12', async () => {
    const auth = makeTestAuth(makeTestDb());

    const response = await auth.api.signUpEmail({
      body: { email: 'user@example.com', password: 'password123', name: 'User' },
      asResponse: true,
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(400);
  });
});
