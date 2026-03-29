/**
 * Fast PBKDF2 password hasher for acceptance tests.
 *
 * Drop-in replacement for `src/domain/services/passwordHasher.ts` that uses
 * PBKDF2 with a single iteration instead of Argon2id (19 MiB, 2 iterations).
 * This reduces per-hash time from ~2-5 s to < 5 ms in the Miniflare Workers
 * environment, making rate-limit acceptance tests complete well within their
 * timeout budget.
 *
 * **This module must NEVER be used in production.** It is wired only via a
 * `resolve.alias` in the acceptance project of `vitest.config.mts`.
 *
 * Hash format: `pbkdf2-fast$<iterations>$<salt-hex>$<derived-hex>`
 *
 * @module
 */

/** Number of PBKDF2 iterations — intentionally minimal for speed. */
const ITERATIONS = 1;

/** Derived key length in bytes (256-bit output). */
const DERIVED_BYTES = 32;

/** Minimum salt length required for verification (tamper guard). */
const MIN_SALT_BYTES = 8;

/**
 * Converts a Uint8Array to a lowercase hex string.
 *
 * @param buf - The buffer to convert.
 * @returns Lowercase hex string.
 */
function toHex(buf: Uint8Array<ArrayBuffer>): string {
  return Array.from(buf)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Converts a hex string to a Uint8Array.
 *
 * Returns an empty Uint8Array when the hex string has odd length (malformed
 * input) rather than throwing, allowing callers to handle the error gracefully.
 *
 * @param hex - Lowercase hex string to decode.
 * @returns Decoded bytes, or empty array on malformed input.
 */
function fromHex(hex: string): Uint8Array<ArrayBuffer> {
  if (hex.length % 2 !== 0) return new Uint8Array(0);
  const arr = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    arr[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return arr;
}

/**
 * Hashes a plaintext password using PBKDF2-SHA256 with a single iteration.
 *
 * API-compatible with `src/domain/services/passwordHasher.ts#hashPassword`.
 *
 * @param password - The plaintext password to hash.
 * @returns A promise resolving to `pbkdf2-fast$1$<salt-hex>$<derived-hex>`.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' },
    key,
    DERIVED_BYTES * 8
  );
  const derived = new Uint8Array(bits);
  return `pbkdf2-fast$${ITERATIONS}$${toHex(salt)}$${toHex(derived)}`;
}

/**
 * Verifies a plaintext password against a stored PBKDF2-fast hash.
 *
 * Uses constant-time comparison to match the production hasher's behaviour.
 * Returns `false` for any malformed, tampered, or non-matching input.
 *
 * API-compatible with `src/domain/services/passwordHasher.ts#verifyPassword`.
 *
 * @param password - The plaintext password to verify.
 * @param stored - The stored hash in `pbkdf2-fast$<iterations>$<salt-hex>$<derived-hex>` format.
 * @returns A promise resolving to `true` if the password matches, `false` otherwise.
 */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split('$');
  if (parts.length !== 4 || (parts[0] ?? '') !== 'pbkdf2-fast') return false;

  const iterations = parseInt(parts[1] ?? '0', 10);
  if (iterations < 1) return false;

  const salt = fromHex(parts[2] ?? '');
  const expected = fromHex(parts[3] ?? '');
  if (salt.length < MIN_SALT_BYTES || expected.length === 0) return false;

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle
    .deriveBits({ name: 'PBKDF2', salt, iterations, hash: 'SHA-256' }, key, expected.length * 8)
    .catch(() => null);

  if (bits === null) return false;

  const computed = new Uint8Array(bits);
  if (computed.length !== expected.length) return false;

  // Constant-time comparison
  let diff = 0;
  for (let i = 0; i < computed.length; i++) {
    diff |= (computed[i] ?? 0) ^ (expected[i] ?? 0);
  }
  return diff === 0;
}
