import { argon2idAsync } from '@noble/hashes/argon2.js';
import { describe, expect, it } from 'vitest';

import { toHex } from '../../shared/hex.js';

import { hashPassword, TEST_PARAMS, verifyPassword } from './passwordHasher';

const HASH_FORMAT = /^argon2id\$\d+\$\d+\$\d+\$[0-9a-f]+\$[0-9a-f]+$/;

/**
 * Builds an argon2id hash string with custom parameters for boundary testing.
 *
 * @param password - Plaintext password.
 * @param salt - Salt bytes.
 * @param m - Memory cost in KiB.
 * @param t - Time cost (iterations).
 * @param p - Parallelism.
 * @returns Hash string in the standard format.
 */
async function hashWithParams(
  password: string,
  salt: Uint8Array,
  m: number,
  t: number,
  p: number
): Promise<string> {
  const derived = await argon2idAsync(new TextEncoder().encode(password), salt, {
    m,
    t,
    p,
    dkLen: 32,
  });
  return `argon2id$${m}$${t}$${p}$${toHex(salt)}$${toHex(derived)}`;
}

describe('hashPassword', () => {
  it('returns a string in argon2id$<memory>$<time>$<parallelism>$<salt-hex>$<derived-hex> format', async () => {
    const hash = await hashPassword('correct-horse-battery-staple', TEST_PARAMS);
    expect(hash).toMatch(HASH_FORMAT);
  });

  it('uses a fresh random salt on each call (two identical passwords produce different hashes)', async () => {
    const hash1 = await hashPassword('same-password', TEST_PARAMS);
    const hash2 = await hashPassword('same-password', TEST_PARAMS);
    expect(hash1).not.toBe(hash2);
  });
});

describe('verifyPassword', () => {
  it('returns true when the password matches the stored hash', async () => {
    const password = 'correct-horse-battery-staple';
    const hash = await hashPassword(password, TEST_PARAMS);
    expect(await verifyPassword(password, hash)).toBe(true);
  });

  it('returns false when the password does not match the stored hash', async () => {
    const hash = await hashPassword('correct-horse-battery-staple', TEST_PARAMS);
    expect(await verifyPassword('wrong-password', hash)).toBe(false);
  });

  it('returns false for a malformed hash string (wrong prefix)', async () => {
    expect(await verifyPassword('password', 'pbkdf2$600000$abc$def')).toBe(false);
  });

  it('returns false for a malformed hash string (too few segments)', async () => {
    expect(await verifyPassword('password', 'argon2id$19456$2$1$abc')).toBe(false);
  });

  it('returns false for a hash with memory below MIN_MEMORY_KB (tamper protection)', async () => {
    // Manually craft a hash with only 9215 KiB — below the 9216 KiB minimum
    const lowMemHash =
      'argon2id$9215$2$1$aabbccddaabbccdd$eeff001122334455eeff001122334455eeff001122334455eeff001122334455';
    expect(await verifyPassword('password', lowMemHash)).toBe(false);
  });

  it('returns false when the salt hex segment has odd length (malformed fromHex input)', async () => {
    // Odd-length hex in salt segment — fromHex returns empty Uint8Array
    const malformedSaltHash =
      'argon2id$19456$2$1$abc$eeff001122334455eeff001122334455eeff001122334455eeff001122334455';
    expect(await verifyPassword('password', malformedSaltHash)).toBe(false);
  });

  it('returns false when the derived hex segment has odd length (malformed fromHex input)', async () => {
    // Odd-length hex in derived segment — fromHex returns empty Uint8Array
    const malformedDerivedHash = 'argon2id$19456$2$1$aabbccddaabbccdd$abc';
    expect(await verifyPassword('password', malformedDerivedHash)).toBe(false);
  });

  it('returns false when hash has correct segment count but wrong algorithm prefix', async () => {
    // 6 segments with valid salt/derived but wrong prefix — the prefix guard must reject
    const password = 'boundary-prefix-test';
    const hash = await hashPassword(password, TEST_PARAMS);
    const wrongPrefixHash = hash.replace('argon2id', 'bcrypt');
    expect(await verifyPassword(password, wrongPrefixHash)).toBe(false);
  });

  it('returns false for hash with time cost of zero', async () => {
    const zeroTimeHash =
      'argon2id$19456$0$1$aabbccddaabbccddaabbccddaabbccdd$eeff001122334455eeff001122334455eeff001122334455eeff001122334455';
    expect(await verifyPassword('password', zeroTimeHash)).toBe(false);
  });

  it('returns false for hash with parallelism of zero', async () => {
    const zeroParHash =
      'argon2id$19456$2$0$aabbccddaabbccddaabbccddaabbccdd$eeff001122334455eeff001122334455eeff001122334455eeff001122334455';
    expect(await verifyPassword('password', zeroParHash)).toBe(false);
  });

  it('accepts a hash with memory exactly at MIN_MEMORY_KB boundary (9216)', async () => {
    const password = 'boundary-memory-test';
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const hash = await hashWithParams(password, salt, 9216, 2, 1);
    expect(await verifyPassword(password, hash)).toBe(true);
  });

  it('accepts a hash with time cost of 1 (minimum valid)', async () => {
    const password = 'boundary-time-test';
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const hash = await hashWithParams(password, salt, 9216, 1, 1);
    expect(await verifyPassword(password, hash)).toBe(true);
  });

  it('accepts a hash with salt exactly at MIN_SALT_BYTES boundary (8 bytes)', async () => {
    const password = 'boundary-salt-test';
    const salt = crypto.getRandomValues(new Uint8Array(8));
    const hash = await hashWithParams(password, salt, 9216, 1, 1);
    expect(await verifyPassword(password, hash)).toBe(true);
  });

  it('returns false when memory is below MIN_MEMORY_KB even if password matches', async () => {
    const password = 'low-memory-test';
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const hash = await hashWithParams(password, salt, 9215, 2, 1);
    expect(await verifyPassword(password, hash)).toBe(false);
  });

  it('returns false for valid salt but empty derived hex (expected.length === 0)', async () => {
    const emptyDerivedHash = 'argon2id$19456$2$1$aabbccddaabbccddaabbccddaabbccdd$';
    expect(await verifyPassword('password', emptyDerivedHash)).toBe(false);
  });

  it('returns false for hash with extra trailing segment (7 segments instead of 6)', async () => {
    // Valid content in first 6 segments but an extra trailing field — segment count guard must reject
    const password = 'extra-segment-test';
    const hash = await hashPassword(password, TEST_PARAMS);
    const extraSegmentHash = `${hash}$extrasegment`;
    expect(await verifyPassword(password, extraSegmentHash)).toBe(false);
  });
});
