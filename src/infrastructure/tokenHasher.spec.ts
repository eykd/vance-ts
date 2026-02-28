import { describe, expect, it } from 'vitest';

import { hashToken } from './tokenHasher';

const SECRET = 'test-secret-at-least-32-chars-long!!';
const LABEL = 'session-token-v1';

describe('hashToken', () => {
  it('returns a 64-character lowercase hex string', async () => {
    const result = await hashToken('some-token', SECRET, LABEL);

    expect(result).toMatch(/^[0-9a-f]{64}$/);
  });

  it('is deterministic: same token, secret, and label always produce the same hash', async () => {
    const token = 'deterministic-test-token';

    const first = await hashToken(token, SECRET, LABEL);
    const second = await hashToken(token, SECRET, LABEL);

    expect(first).toBe(second);
  });

  it('produces different hashes for different tokens', async () => {
    const first = await hashToken('token-alpha', SECRET, LABEL);
    const second = await hashToken('token-beta', SECRET, LABEL);

    expect(first).not.toBe(second);
  });

  it('produces different hashes for different secrets', async () => {
    const token = 'shared-token';
    const secretA = 'secret-a-at-least-32-characters-long';
    const secretB = 'secret-b-at-least-32-characters-long';

    const first = await hashToken(token, secretA, LABEL);
    const second = await hashToken(token, secretB, LABEL);

    expect(first).not.toBe(second);
  });

  it('produces different hashes for different sub-key labels (key separation)', async () => {
    // This test verifies that the sub-key derivation enforces key separation:
    // HMAC(secret, 'session-token-v1') ≠ HMAC(secret, 'verification-token-v1'),
    // so a token hashed under one purpose cannot collide with one hashed under another.
    const token = 'shared-token';

    const first = await hashToken(token, SECRET, 'session-token-v1');
    const second = await hashToken(token, SECRET, 'verification-token-v1');

    expect(first).not.toBe(second);
  });

  it('handles an empty token without throwing', async () => {
    const result = await hashToken('', SECRET, LABEL);

    expect(result).toMatch(/^[0-9a-f]{64}$/);
  });

  it('produces the correct HMAC-SHA256 digest for a known input', async () => {
    // Pins the two-step sub-key derivation algorithm so regressions are caught immediately.
    // Step 1: subKey = HMAC(masterSecret, label)
    // Step 2: digest = HMAC(subKey, token)
    const expected = await computeExpectedHmacWithSubKey('token', SECRET, LABEL);

    const result = await hashToken('token', SECRET, LABEL);

    expect(result).toBe(expected);
  });
});

/**
 * Reference implementation used only in tests to compute the expected two-step HMAC-SHA256.
 * Mirrors the sub-key derivation in hashToken so a regression in that algorithm is caught.
 *
 * Step 1: subKey  = HMAC(masterSecret, label)
 * Step 2: digest  = HMAC(subKey, message)
 *
 * @param message - The message to sign.
 * @param masterSecret - The master HMAC key.
 * @param label - The sub-key derivation label.
 * @returns Lowercase hex-encoded HMAC-SHA256 digest.
 */
async function computeExpectedHmacWithSubKey(
  message: string,
  masterSecret: string,
  label: string
): Promise<string> {
  const encoder = new TextEncoder();
  const masterKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(masterSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const subKeyBuffer = await crypto.subtle.sign('HMAC', masterKey, encoder.encode(label));
  const subKey = await crypto.subtle.importKey(
    'raw',
    subKeyBuffer,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const buf = await crypto.subtle.sign('HMAC', subKey, encoder.encode(message));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
