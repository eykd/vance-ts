import { describe, expect, it } from 'vitest';

import { hashToken } from './tokenHasher';

const SECRET = 'test-secret-at-least-32-chars-long!!';

describe('hashToken', () => {
  it('returns a 64-character lowercase hex string', async () => {
    const result = await hashToken('some-token', SECRET);

    expect(result).toMatch(/^[0-9a-f]{64}$/);
  });

  it('is deterministic: same token and secret always produce the same hash', async () => {
    const token = 'deterministic-test-token';

    const first = await hashToken(token, SECRET);
    const second = await hashToken(token, SECRET);

    expect(first).toBe(second);
  });

  it('produces different hashes for different tokens', async () => {
    const first = await hashToken('token-alpha', SECRET);
    const second = await hashToken('token-beta', SECRET);

    expect(first).not.toBe(second);
  });

  it('produces different hashes for different secrets', async () => {
    const token = 'shared-token';
    const secretA = 'secret-a-at-least-32-characters-long';
    const secretB = 'secret-b-at-least-32-characters-long';

    const first = await hashToken(token, secretA);
    const second = await hashToken(token, secretB);

    expect(first).not.toBe(second);
  });

  it('handles an empty token without throwing', async () => {
    const result = await hashToken('', SECRET);

    expect(result).toMatch(/^[0-9a-f]{64}$/);
  });

  it('produces the correct HMAC-SHA256 digest for a known input', async () => {
    // Computed independently: HMAC-SHA256("token", "test-secret-at-least-32-chars-long!!")
    // This test pins the algorithm and encoding so regressions are caught immediately.
    const expected = await computeExpectedHmac('token', SECRET);

    const result = await hashToken('token', SECRET);

    expect(result).toBe(expected);
  });
});

/**
 * Reference implementation used only in tests to compute the expected HMAC-SHA256.
 * Duplicates the logic deliberately so a copy-paste regression in hashToken is caught.
 *
 * @param message - The message to sign.
 * @param secret - The HMAC key.
 * @returns Lowercase hex-encoded HMAC-SHA256 digest.
 */
async function computeExpectedHmac(message: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const buf = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
