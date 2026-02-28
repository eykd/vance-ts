/**
 * HMAC-SHA256 token hasher for session and verification token storage.
 *
 * Hashes raw tokens before they are persisted to D1, ensuring that a
 * database exfiltration does not expose usable plaintext token values.
 * The hash is deterministic: the same (token, secret) pair always produces
 * the same digest, enabling lookup by re-deriving the hash from the candidate.
 *
 * Uses only Web Standard APIs (`crypto.subtle`) — compatible with the
 * Cloudflare Workers runtime.
 *
 * @module
 */

import { toHex } from '../shared/hex';

/**
 * Computes an HMAC-SHA256 hash of the given token, keyed with the provided
 * secret. Returns a 64-character lowercase hex string.
 *
 * The hash is deterministic: the same `(token, secret)` pair always produces
 * the same output, so a token value stored as a hash can be looked up by
 * re-hashing the candidate.
 *
 * @param token - The raw token value to hash (e.g. a session token string).
 * @param secret - The HMAC signing key (e.g. BETTER_AUTH_SECRET).
 * @returns A 64-character lowercase hex string representing the HMAC-SHA256 digest.
 */
export async function hashToken(token: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(token));
  return toHex(new Uint8Array(signature));
}
