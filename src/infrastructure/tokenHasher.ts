/**
 * HMAC-SHA256 token hasher for session and verification token storage.
 *
 * Hashes raw tokens before they are persisted to D1, ensuring that a
 * database exfiltration does not expose usable plaintext token values.
 * The hash is deterministic: the same (token, masterSecret, subKeyLabel) triple
 * always produces the same digest, enabling lookup by re-deriving the hash from
 * the candidate.
 *
 * ## Key separation
 *
 * Rather than using `BETTER_AUTH_SECRET` directly as the HMAC key, a dedicated
 * sub-key is derived per purpose via a two-step HMAC:
 * `subKey = HMAC(masterSecret, label)` then `digest = HMAC(subKey, token)`.
 *
 * This prevents cross-protocol token confusion: even if two purposes share the
 * same master secret, their sub-keys are distinct, so a token stored under one
 * purpose cannot collide with a token stored under another.
 *
 * Uses only Web Standard APIs (`crypto.subtle`) — compatible with the
 * Cloudflare Workers runtime.
 *
 * @module
 */

import { toHex } from '../shared/hex';

/**
 * Derives a dedicated sub-key from the master secret and a purpose label.
 *
 * subKey = HMAC-SHA256(key=masterSecret, message=label)
 *
 * The 32-byte output is then used as the HMAC key for the actual operation,
 * ensuring keys are never reused across different purposes.
 *
 * @param masterSecret - The master HMAC signing key (e.g. BETTER_AUTH_SECRET).
 * @param label - A purpose label that uniquely identifies the sub-key domain (e.g. 'session-token-v1').
 * @returns A 32-byte ArrayBuffer sub-key.
 */
async function deriveSubKey(masterSecret: string, label: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const masterKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(masterSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  return crypto.subtle.sign('HMAC', masterKey, encoder.encode(label));
}

/**
 * Computes an HMAC-SHA256 hash of the given token using a purpose-specific sub-key.
 * Returns a 64-character lowercase hex string.
 *
 * Two-step derivation: `subKey = HMAC(masterSecret, subKeyLabel)`,
 * then `digest = HMAC(subKey, token)`.
 *
 * The hash is deterministic: the same `(token, masterSecret, subKeyLabel)` triple
 * always produces the same output, so a token value stored as a hash can be
 * looked up by re-hashing the candidate with the same label.
 *
 * @param token - The raw token value to hash (e.g. a session token string).
 * @param masterSecret - The master HMAC signing key (e.g. BETTER_AUTH_SECRET).
 * @param subKeyLabel - A purpose label for sub-key derivation (e.g. 'session-token-v1').
 * @returns A 64-character lowercase hex string representing the HMAC-SHA256 digest.
 */
export async function hashToken(
  token: string,
  masterSecret: string,
  subKeyLabel: string
): Promise<string> {
  const encoder = new TextEncoder();
  const subKeyBytes = await deriveSubKey(masterSecret, subKeyLabel);
  const key = await crypto.subtle.importKey(
    'raw',
    subKeyBytes,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(token));
  return toHex(new Uint8Array(signature));
}
