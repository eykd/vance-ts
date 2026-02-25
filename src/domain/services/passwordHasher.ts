/**
 * PBKDF2 password hashing using the Web Crypto API.
 *
 * Uses `crypto.subtle` (Web Standard API — no Node.js). Hash format:
 * `pbkdf2$<iterations>$<salt-hex>$<derived-hex>`. The format is
 * self-describing so the iteration count can be increased in future
 * without invalidating existing hashes.
 *
 * This is a domain service (async computation, no I/O) — not a value
 * object. Inner layers may import from it without boundary violations.
 *
 * @module
 */

import { toHex } from '../../shared/hex';

const ITERATIONS = 600_000; // OWASP 2023 minimum for PBKDF2-HMAC-SHA-256
const DERIVED_BITS = 256;
const MIN_ITERATIONS = 100_000; // Reject hashes with fewer iterations (tamper protection)

/**
 * Converts a hex string to a Uint8Array backed by a plain ArrayBuffer.
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
 * Hashes a plaintext password using PBKDF2-HMAC-SHA-256 with a fresh
 * 16-byte cryptographically random salt.
 *
 * Each call generates a new salt, so identical passwords produce different
 * hashes. The resulting hash string is self-describing and can be stored
 * directly in the database.
 *
 * @param password - The plaintext password to hash.
 * @returns A promise resolving to `pbkdf2$<iterations>$<salt-hex>$<derived-hex>`.
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
    DERIVED_BITS
  );
  return `pbkdf2$${ITERATIONS}$${toHex(salt)}$${toHex(bits)}`;
}

/**
 * Verifies a plaintext password against a stored PBKDF2 hash.
 *
 * Uses constant-time comparison to prevent timing oracle attacks on the
 * hash comparison step. Returns `false` for any malformed, tampered, or
 * non-matching input.
 *
 * @param password - The plaintext password to verify.
 * @param stored - The stored hash in `pbkdf2$<iterations>$<salt-hex>$<derived-hex>` format.
 * @returns A promise resolving to `true` if the password matches, `false` otherwise.
 */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split('$');
  if (parts.length !== 4 || parts[0] !== 'pbkdf2') return false;
  const iterations = parseInt(parts[1] ?? '0', 10);
  if (iterations < MIN_ITERATIONS) return false;
  const salt = fromHex(parts[2] ?? '');
  const expected = fromHex(parts[3] ?? '');
  if (salt.length === 0 || expected.length === 0) return false;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    key,
    DERIVED_BITS
  );
  // Constant-time comparison — prevent timing oracle on hash comparison
  const computed = new Uint8Array(bits);
  if (computed.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < computed.length; i++) {
    diff |= (computed[i] ?? 0) ^ (expected[i] ?? 0);
  }
  return diff === 0;
}
