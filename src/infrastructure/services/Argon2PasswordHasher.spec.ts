import { Argon2PasswordHasher } from './Argon2PasswordHasher';

/** Fast test config to avoid slow OWASP defaults in unit tests. */
const TEST_CONFIG = { memoryCost: 256, timeCost: 1, parallelism: 1 };

describe('Argon2PasswordHasher', () => {
  describe('hash', () => {
    it('produces a valid PHC format string', async () => {
      const hasher = new Argon2PasswordHasher(TEST_CONFIG);

      const hash = await hasher.hash('test-password-123');

      expect(hash).toMatch(/^\$argon2id\$v=19\$m=256,t=1,p=1\$[a-f0-9]{32}\$[a-f0-9]{64}$/);
    });

    it('produces unique output each call due to random salt', async () => {
      const hasher = new Argon2PasswordHasher(TEST_CONFIG);

      const hash1 = await hasher.hash('test-password-123');
      const hash2 = await hasher.hash('test-password-123');

      expect(hash1).not.toBe(hash2);
    });

    it('uses OWASP defaults when no config provided', async () => {
      const hasher = new Argon2PasswordHasher();

      const hash = await hasher.hash('test-password-123');

      expect(hash).toMatch(/^\$argon2id\$v=19\$m=19456,t=2,p=1\$/);
    });
  });

  describe('verify', () => {
    it('returns true for correct password', async () => {
      const hasher = new Argon2PasswordHasher(TEST_CONFIG);
      const hash = await hasher.hash('correct-password');

      const result = await hasher.verify('correct-password', hash);

      expect(result).toBe(true);
    });

    it('returns false for wrong password', async () => {
      const hasher = new Argon2PasswordHasher(TEST_CONFIG);
      const hash = await hasher.hash('correct-password');

      const result = await hasher.verify('wrong-password!!', hash);

      expect(result).toBe(false);
    });

    it('returns false for malformed hash', async () => {
      const hasher = new Argon2PasswordHasher(TEST_CONFIG);

      const result = await hasher.verify('any-password-test', 'not-a-valid-hash');

      expect(result).toBe(false);
    });

    it('returns false for empty hash', async () => {
      const hasher = new Argon2PasswordHasher(TEST_CONFIG);

      const result = await hasher.verify('any-password-test', '');

      expect(result).toBe(false);
    });

    it('verifies hash from different config by reading params from hash', async () => {
      const hasher1 = new Argon2PasswordHasher({ memoryCost: 256, timeCost: 1, parallelism: 1 });
      const hasher2 = new Argon2PasswordHasher({ memoryCost: 512, timeCost: 2, parallelism: 1 });
      const hash = await hasher1.hash('cross-config-test');

      // hasher2 uses different defaults but reads params from the stored hash
      const result = await hasher2.verify('cross-config-test', hash);

      expect(result).toBe(true);
    });

    it('returns false for hash with incomplete PHC format', async () => {
      const hasher = new Argon2PasswordHasher(TEST_CONFIG);

      const result = await hasher.verify('password-test-12', '$argon2id$v=19$m=256');

      expect(result).toBe(false);
    });

    it('returns false for hash with non-numeric parameters', async () => {
      const hasher = new Argon2PasswordHasher(TEST_CONFIG);

      const result = await hasher.verify(
        'password-test-12',
        '$argon2id$v=19$m=abc,t=1,p=1$aabbccdd$eeff0011'
      );

      expect(result).toBe(false);
    });

    it('returns false when stored hash has different byte length than computed', async () => {
      const hasher = new Argon2PasswordHasher(TEST_CONFIG);
      // Hash with a 4-byte hash output (8 hex chars) instead of the normal 32-byte (64 hex chars)
      // The hasher will compute 4 bytes (reads dkLen from stored hash length) but
      // the actual hash bytes won't match
      const shortHash = '$argon2id$v=19$m=256,t=1,p=1$' + 'aa'.repeat(16) + '$' + 'bb'.repeat(4);

      const result = await hasher.verify('any-password-test', shortHash);

      expect(result).toBe(false);
    });

    it('returns false when argon2id throws due to invalid parameters', async () => {
      const hasher = new Argon2PasswordHasher(TEST_CONFIG);
      // m=0 is invalid and will cause argon2id to throw
      const invalidParamsHash =
        '$argon2id$v=19$m=0,t=1,p=1$' + 'aa'.repeat(16) + '$' + 'bb'.repeat(32);

      const result = await hasher.verify('any-password-test', invalidParamsHash);

      expect(result).toBe(false);
    });
  });
});
