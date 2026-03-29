import { type MockInstance, beforeEach, describe, expect, it, vi } from 'vitest';

import { toHex } from '../../shared/hex.js';

// Mock @noble/hashes/argon2.js before importing the module under test
vi.mock('@noble/hashes/argon2.js', () => ({
  argon2idAsync: vi.fn(),
}));

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
let argon2idAsync: MockInstance<(typeof import('@noble/hashes/argon2.js'))['argon2idAsync']>;

beforeEach(async () => {
  const mod = await import('@noble/hashes/argon2.js');
  argon2idAsync = mod.argon2idAsync as unknown as typeof argon2idAsync;
  argon2idAsync.mockReset();
});

import { hashPassword, verifyPassword } from './passwordHasher.js';

/** Deterministic 32-byte derived key for mock returns. */
const FAKE_DERIVED = new Uint8Array(32).fill(0xab);

/** Deterministic 16-byte salt for readable assertions. */
const FAKE_SALT = new Uint8Array(16).fill(0xcd);

describe('hashPassword', () => {
  it('returns a string in argon2id$<memory>$<time>$<parallelism>$<salt-hex>$<derived-hex> format', async () => {
    argon2idAsync.mockResolvedValue(FAKE_DERIVED);

    const hash = await hashPassword('test-password');

    expect(hash).toMatch(/^argon2id\$\d+\$\d+\$\d+\$[0-9a-f]+\$[0-9a-f]+$/);
  });

  it('embeds OWASP parameters (memory=19456, time=2, parallelism=1)', async () => {
    argon2idAsync.mockResolvedValue(FAKE_DERIVED);

    const hash = await hashPassword('test-password');
    const parts = hash.split('$');

    expect(parts[1]).toBe('19456');
    expect(parts[2]).toBe('2');
    expect(parts[3]).toBe('1');
  });

  it('passes the password, salt, and parameters to argon2idAsync', async () => {
    argon2idAsync.mockResolvedValue(FAKE_DERIVED);

    await hashPassword('my-password');

    expect(argon2idAsync).toHaveBeenCalledOnce();
    const [password, salt, opts] = argon2idAsync.mock.calls[0]!;
    expect(new TextDecoder().decode(password as Uint8Array)).toBe('my-password');
    expect((salt as Uint8Array).length).toBe(16);
    expect(opts).toEqual({ m: 19456, t: 2, p: 1, dkLen: 32 });
  });

  it('encodes salt and derived key as hex in the hash string', async () => {
    // Spy on crypto.getRandomValues to return a known salt
    const spy = vi.spyOn(crypto, 'getRandomValues').mockReturnValueOnce(FAKE_SALT);
    argon2idAsync.mockResolvedValue(FAKE_DERIVED);

    const hash = await hashPassword('test-password');
    const parts = hash.split('$');

    expect(parts[4]).toBe(toHex(FAKE_SALT));
    expect(parts[5]).toBe(toHex(FAKE_DERIVED));

    spy.mockRestore();
  });

  it('uses a fresh random salt on each call (two identical passwords produce different hashes)', async () => {
    argon2idAsync.mockResolvedValue(FAKE_DERIVED);

    const hash1 = await hashPassword('same-password');
    const hash2 = await hashPassword('same-password');

    // Salt segments differ because crypto.getRandomValues produces different bytes
    const salt1 = hash1.split('$')[4];
    const salt2 = hash2.split('$')[4];
    expect(salt1).not.toBe(salt2);
  });
});

describe('verifyPassword', () => {
  /**
   * Builds a well-formed hash string for testing.
   *
   * @param overrides - Optional field overrides.
   * @param overrides.prefix - Algorithm prefix (default: "argon2id").
   * @param overrides.memory - Memory cost in KiB.
   * @param overrides.time - Time cost (iterations).
   * @param overrides.parallelism - Degree of parallelism.
   * @param overrides.saltHex - Hex-encoded salt.
   * @param overrides.derivedHex - Hex-encoded derived key.
   * @returns Formatted hash string.
   */
  function buildHash(overrides?: {
    prefix?: string;
    memory?: number;
    time?: number;
    parallelism?: number;
    saltHex?: string;
    derivedHex?: string;
  }): string {
    const {
      prefix = 'argon2id',
      memory = 19456,
      time = 2,
      parallelism = 1,
      saltHex = toHex(FAKE_SALT),
      derivedHex = toHex(FAKE_DERIVED),
    } = overrides ?? {};
    return `${prefix}$${memory}$${time}$${parallelism}$${saltHex}$${derivedHex}`;
  }

  it('returns true when the password matches the stored hash', async () => {
    argon2idAsync.mockResolvedValue(FAKE_DERIVED);

    const result = await verifyPassword('correct-password', buildHash());

    expect(result).toBe(true);
  });

  it('returns false when the computed hash differs from stored', async () => {
    const differentDerived = new Uint8Array(32).fill(0x00);
    argon2idAsync.mockResolvedValue(differentDerived);

    const result = await verifyPassword('wrong-password', buildHash());

    expect(result).toBe(false);
  });

  it('passes stored parameters to argon2idAsync for re-computation', async () => {
    argon2idAsync.mockResolvedValue(FAKE_DERIVED);

    await verifyPassword('test', buildHash({ memory: 19456, time: 3, parallelism: 2 }));

    expect(argon2idAsync).toHaveBeenCalledOnce();
    const [, , opts] = argon2idAsync.mock.calls[0]!;
    expect(opts).toEqual({ m: 19456, t: 3, p: 2, dkLen: 32 });
  });

  it('returns false for a malformed hash string (wrong prefix)', async () => {
    const result = await verifyPassword('password', 'pbkdf2$600000$abc$def');

    expect(result).toBe(false);
    expect(argon2idAsync).not.toHaveBeenCalled();
  });

  it('returns false for a malformed hash string (too few segments)', async () => {
    const result = await verifyPassword('password', 'argon2id$19456$2$1$abc');

    expect(result).toBe(false);
    expect(argon2idAsync).not.toHaveBeenCalled();
  });

  it('returns false for hash with extra trailing segment (7 segments instead of 6)', async () => {
    const hash = `${buildHash()}$extrasegment`;

    const result = await verifyPassword('password', hash);

    expect(result).toBe(false);
    expect(argon2idAsync).not.toHaveBeenCalled();
  });

  it('returns false when hash has correct segment count but wrong algorithm prefix', async () => {
    const result = await verifyPassword('password', buildHash({ prefix: 'bcrypt' }));

    expect(result).toBe(false);
    expect(argon2idAsync).not.toHaveBeenCalled();
  });

  it('returns false for a hash with memory below MIN_MEMORY_KB (tamper protection)', async () => {
    const result = await verifyPassword('password', buildHash({ memory: 9215 }));

    expect(result).toBe(false);
    expect(argon2idAsync).not.toHaveBeenCalled();
  });

  it('accepts a hash with memory exactly at MIN_MEMORY_KB boundary (9216)', async () => {
    argon2idAsync.mockResolvedValue(FAKE_DERIVED);

    const result = await verifyPassword('password', buildHash({ memory: 9216 }));

    expect(result).toBe(true);
  });

  it('returns false for hash with time cost of zero', async () => {
    const result = await verifyPassword('password', buildHash({ time: 0 }));

    expect(result).toBe(false);
    expect(argon2idAsync).not.toHaveBeenCalled();
  });

  it('accepts a hash with time cost of 1 (minimum valid)', async () => {
    argon2idAsync.mockResolvedValue(FAKE_DERIVED);

    const result = await verifyPassword('password', buildHash({ time: 1 }));

    expect(result).toBe(true);
  });

  it('returns false for hash with parallelism of zero', async () => {
    const result = await verifyPassword('password', buildHash({ parallelism: 0 }));

    expect(result).toBe(false);
    expect(argon2idAsync).not.toHaveBeenCalled();
  });

  it('returns false when the salt hex segment has odd length (malformed fromHex input)', async () => {
    const result = await verifyPassword('password', buildHash({ saltHex: 'abc' }));

    expect(result).toBe(false);
    expect(argon2idAsync).not.toHaveBeenCalled();
  });

  it('accepts a hash with salt exactly at MIN_SALT_BYTES boundary (8 bytes)', async () => {
    argon2idAsync.mockResolvedValue(FAKE_DERIVED);
    const eightByteSalt = toHex(new Uint8Array(8).fill(0xee));

    const result = await verifyPassword('password', buildHash({ saltHex: eightByteSalt }));

    expect(result).toBe(true);
  });

  it('returns false when salt is below MIN_SALT_BYTES (7 bytes)', async () => {
    const sevenByteSalt = toHex(new Uint8Array(7).fill(0xee));

    const result = await verifyPassword('password', buildHash({ saltHex: sevenByteSalt }));

    expect(result).toBe(false);
    expect(argon2idAsync).not.toHaveBeenCalled();
  });

  it('returns false when the derived hex segment has odd length (malformed fromHex input)', async () => {
    const result = await verifyPassword('password', buildHash({ derivedHex: 'abc' }));

    expect(result).toBe(false);
    expect(argon2idAsync).not.toHaveBeenCalled();
  });

  it('returns false for valid salt but empty derived hex (expected.length === 0)', async () => {
    const result = await verifyPassword('password', buildHash({ derivedHex: '' }));

    expect(result).toBe(false);
    expect(argon2idAsync).not.toHaveBeenCalled();
  });

  it('returns false when argon2idAsync throws (computation error)', async () => {
    argon2idAsync.mockRejectedValue(new Error('computation failed'));

    const result = await verifyPassword('password', buildHash());

    expect(result).toBe(false);
  });

  it('returns false when computed length differs from expected length', async () => {
    // Return a 16-byte result instead of expected 32 bytes
    argon2idAsync.mockResolvedValue(new Uint8Array(16).fill(0xab));

    const result = await verifyPassword('password', buildHash());

    expect(result).toBe(false);
  });
});
