/**
 * Argon2id password hashing for Cloudflare Workers.
 *
 * Uses `@noble/hashes` argon2idAsync (pure-JS, no WASM) which runs in the
 * Workers runtime without any bundler WASM-import configuration. Hash format:
 * `argon2id$<memory_kb>$<time_cost>$<parallelism>$<salt-hex>$<derived-hex>`.
 * The format is self-describing so parameters can be increased in future
 * without invalidating existing hashes (re-hash on next successful login).
 *
 * Parameters follow OWASP 2023 minimums: memory=19456 KiB (19 MiB), time=2, parallelism=1.
 *
 * This is a domain service (async computation, no I/O) — not a value
 * object. Inner layers may import from it without boundary violations.
 *
 * @module
 */

import { argon2idAsync } from '@noble/hashes/argon2.js';

import { toHex } from '../../shared/hex.js';

/** Memory cost in KiB — OWASP 2023 minimum for Argon2id (19 MiB). */
const MEMORY_KB = 19_456;

/** Time cost (iterations) — OWASP 2023 minimum for Argon2id. */
const TIME_COST = 2;

/** Degree of parallelism. */
const PARALLELISM = 1;

/** Derived key length in bytes (256-bit output). */
const DERIVED_BYTES = 32;

/** Minimum acceptable memory cost for stored hashes (tamper protection). */
const MIN_MEMORY_KB = 9_216;

/** Minimum salt length required by the Argon2 spec. */
const MIN_SALT_BYTES = 8;

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
 * Hashes a plaintext password using Argon2id (OWASP 2023 parameters) with
 * a fresh 16-byte cryptographically random salt.
 *
 * Each call generates a new salt, so identical passwords produce different
 * hashes. The resulting hash string is self-describing and can be stored
 * directly in the database.
 *
 * @param password - The plaintext password to hash.
 * @returns A promise resolving to `argon2id$<memory_kb>$<time_cost>$<parallelism>$<salt-hex>$<derived-hex>`.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const derived = await argon2idAsync(new TextEncoder().encode(password), salt, {
    m: MEMORY_KB,
    t: TIME_COST,
    p: PARALLELISM,
    dkLen: DERIVED_BYTES,
  });
  return `argon2id$${MEMORY_KB}$${TIME_COST}$${PARALLELISM}$${toHex(salt)}$${toHex(derived)}`;
}

/**
 * Verifies a plaintext password against a stored Argon2id hash.
 *
 * Uses constant-time comparison to prevent timing oracle attacks on the
 * hash comparison step. Returns `false` for any malformed, tampered, or
 * non-matching input.
 *
 * @param password - The plaintext password to verify.
 * @param stored - The stored hash in `argon2id$<memory_kb>$<time_cost>$<parallelism>$<salt-hex>$<derived-hex>` format.
 * @returns A promise resolving to `true` if the password matches, `false` otherwise.
 */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split('$');
  if (parts.length !== 6 || parts[0] !== 'argon2id') return false;

  const memory = parseInt(parts[1] ?? '0', 10);
  const time = parseInt(parts[2] ?? '0', 10);
  const parallelism = parseInt(parts[3] ?? '0', 10);
  if (memory < MIN_MEMORY_KB || time < 1 || parallelism < 1) return false;

  const salt = fromHex(parts[4] ?? '');
  const expected = fromHex(parts[5] ?? '');
  if (salt.length < MIN_SALT_BYTES || expected.length === 0) return false;

  // Compute Argon2id with stored parameters; null on any computation error
  const computed = await argon2idAsync(new TextEncoder().encode(password), salt, {
    m: memory,
    t: time,
    p: parallelism,
    dkLen: expected.length,
  }).catch(() => null);

  if (computed === null) return false;

  // Constant-time comparison — prevent timing oracle on hash comparison
  if (computed.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < computed.length; i++) {
    diff |= (computed[i] ?? 0) ^ (expected[i] ?? 0);
  }
  return diff === 0;
}
