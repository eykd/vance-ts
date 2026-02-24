import { describe, expect, it } from 'vitest';

import { hashPassword, verifyPassword } from './passwordHasher';

const HASH_FORMAT = /^pbkdf2\$\d+\$[0-9a-f]+\$[0-9a-f]+$/;

describe('hashPassword', () => {
  it('returns a string in pbkdf2$<iterations>$<salt-hex>$<derived-hex> format', async () => {
    const hash = await hashPassword('correct-horse-battery-staple');
    expect(hash).toMatch(HASH_FORMAT);
  });

  it('uses a fresh random salt on each call (two identical passwords produce different hashes)', async () => {
    const hash1 = await hashPassword('same-password');
    const hash2 = await hashPassword('same-password');
    expect(hash1).not.toBe(hash2);
  });
});

describe('verifyPassword', () => {
  it('returns true when the password matches the stored hash', async () => {
    const password = 'correct-horse-battery-staple';
    const hash = await hashPassword(password);
    expect(await verifyPassword(password, hash)).toBe(true);
  });

  it('returns false when the password does not match the stored hash', async () => {
    const hash = await hashPassword('correct-horse-battery-staple');
    expect(await verifyPassword('wrong-password', hash)).toBe(false);
  });

  it('returns false for a malformed hash string (wrong prefix)', async () => {
    expect(await verifyPassword('password', 'sha256$1000$abc$def')).toBe(false);
  });

  it('returns false for a malformed hash string (too few segments)', async () => {
    expect(await verifyPassword('password', 'pbkdf2$600000$abc')).toBe(false);
  });

  it('returns false for a hash with iterations below MIN_ITERATIONS (tamper protection)', async () => {
    // Manually craft a hash with only 99_999 iterations
    const lowIterHash = 'pbkdf2$99999$aabbccdd$eeff0011';
    expect(await verifyPassword('password', lowIterHash)).toBe(false);
  });

  it('returns false when the salt hex segment has odd length (malformed fromHex input)', async () => {
    // Odd-length hex in salt segment — fromHex returns empty Uint8Array
    const malformedSaltHash = 'pbkdf2$600000$abc$eeff001122334455';
    expect(await verifyPassword('password', malformedSaltHash)).toBe(false);
  });

  it('returns false when the derived hex segment has odd length (malformed fromHex input)', async () => {
    // Odd-length hex in derived segment — fromHex returns empty Uint8Array
    const malformedDerivedHash = 'pbkdf2$600000$aabbccdd$abc';
    expect(await verifyPassword('password', malformedDerivedHash)).toBe(false);
  });
});
