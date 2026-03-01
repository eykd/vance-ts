/**
 * Constant-time string comparison utilities.
 *
 * Uses `crypto.subtle.timingSafeEqual` (a synchronous, non-standard Cloudflare
 * Workers extension to the Web Crypto API) to compare secrets without leaking
 * timing information to potential attackers.
 *
 * @module
 */

/**
 * Augments the standard `SubtleCrypto` interface with the non-standard
 * `timingSafeEqual` method provided by the Cloudflare Workers runtime.
 *
 * This method is not part of the Web Crypto API specification and therefore
 * absent from `@cloudflare/workers-types`. The cast in {@link timingSafeStringEqual}
 * is safe because Cloudflare Workers always provides this method at runtime.
 */
interface CloudflareSubtleCrypto extends SubtleCrypto {
  /**
   * Compares two `ArrayBufferView` values in constant time.
   *
   * @param a - First buffer.
   * @param b - Second buffer.
   * @returns `true` if both buffers have identical byte content, `false` otherwise.
   * @throws {TypeError} If `a` and `b` have different byte lengths.
   */
  timingSafeEqual(a: ArrayBufferView, b: ArrayBufferView): boolean;
}

/**
 * Compares two strings in constant time to prevent timing-oracle attacks.
 *
 * Encodes both strings as UTF-8 bytes and delegates to
 * `crypto.subtle.timingSafeEqual`. Returns `false` immediately when the
 * byte-lengths differ (without leaking the difference via timing), since a
 * length mismatch is always invalid for fixed-format tokens such as CSRF
 * hex strings.
 *
 * @param a - First string to compare.
 * @param b - Second string to compare.
 * @returns `true` if both strings are byte-for-byte identical, `false` otherwise.
 */
export function timingSafeStringEqual(a: string, b: string): boolean {
  const encoder = new TextEncoder();
  const aBytes = encoder.encode(a);
  const bBytes = encoder.encode(b);
  if (aBytes.byteLength !== bBytes.byteLength) {
    return false;
  }
  return (crypto.subtle as CloudflareSubtleCrypto).timingSafeEqual(aBytes, bBytes);
}
