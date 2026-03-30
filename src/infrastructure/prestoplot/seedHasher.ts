/**
 * Seed-to-integer hashing using SHA-256.
 *
 * Converts a seed string to a deterministic 32-bit unsigned integer
 * by computing its SHA-256 digest and reading the first 4 bytes as
 * a big-endian uint32. Seeds are NFC-normalized and UTF-8 encoded
 * before hashing for cross-platform consistency.
 *
 * Uses only Web Standard APIs (`crypto.subtle`) — compatible with
 * the Cloudflare Workers runtime.
 *
 * @module infrastructure/prestoplot/seedHasher
 */

/**
 * Convert a seed string to a 32-bit unsigned integer via SHA-256.
 *
 * Pipeline: NFC normalize → UTF-8 encode → SHA-256 → first 4 bytes → big-endian uint32.
 *
 * @param seed - The seed string to hash.
 * @returns A 32-bit unsigned integer derived from the seed.
 */
export async function seedToInt(seed: string): Promise<number> {
  const normalized = seed.normalize('NFC');
  const encoded = new TextEncoder().encode(normalized);
  const digest = await crypto.subtle.digest('SHA-256', encoded);
  return new DataView(digest).getUint32(0, false);
}
