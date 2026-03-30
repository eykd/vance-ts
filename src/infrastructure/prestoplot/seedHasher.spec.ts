import { describe, expect, it } from 'vitest';

import { seedToInt } from './seedHasher.js';

describe('seedToInt', () => {
  it('returns a 32-bit unsigned integer', async () => {
    const result = await seedToInt('test-seed');

    expect(typeof result).toBe('number');
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(0xffffffff);
    expect(Number.isInteger(result)).toBe(true);
  });

  it('is deterministic: same seed always produces the same integer', async () => {
    const first = await seedToInt('deterministic');
    const second = await seedToInt('deterministic');

    expect(first).toBe(second);
  });

  it('produces different integers for different seeds', async () => {
    const alpha = await seedToInt('alpha');
    const beta = await seedToInt('beta');

    expect(alpha).not.toBe(beta);
  });

  it('applies NFC normalization before hashing', async () => {
    // U+00E9 (e-acute precomposed) vs U+0065 U+0301 (e + combining acute)
    const precomposed = '\u00e9';
    const decomposed = '\u0065\u0301';

    const fromPrecomposed = await seedToInt(precomposed);
    const fromDecomposed = await seedToInt(decomposed);

    expect(fromPrecomposed).toBe(fromDecomposed);
  });

  it('encodes seed as UTF-8 before hashing', async () => {
    // Multi-byte UTF-8 character should hash without error
    const result = await seedToInt('\u{1F680}'); // rocket emoji

    expect(typeof result).toBe('number');
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(0xffffffff);
  });

  it('validates that result is finite', async () => {
    const result = await seedToInt('finite-check');

    expect(Number.isFinite(result)).toBe(true);
  });

  it('produces a known test vector for a fixed seed', async () => {
    // Pin the algorithm: NFC("hello") = "hello", UTF-8 encode, SHA-256, first 4 bytes big-endian.
    // SHA-256(UTF-8("hello")) first 4 bytes as big-endian uint32 = 754077114
    const result = await seedToInt('hello');

    expect(result).toBe(754077114);
  });

  it('handles empty string by hashing it normally', async () => {
    // SHA-256(UTF-8("")) = e3b0c44298fc... → first 4 bytes big-endian = 0xe3b0c442 = 3820012610
    const result = await seedToInt('');

    expect(result).toBe(3820012610);
  });
});
