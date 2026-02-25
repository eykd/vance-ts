/**
 * Hex encoding utilities for the Web Crypto API.
 *
 * Works in Cloudflare Workers (Web Standard APIs only — no Node.js).
 *
 * @module
 */

/**
 * Converts an ArrayBuffer or Uint8Array to a lowercase hex string.
 *
 * @param buf - The buffer to convert.
 * @returns Lowercase hex string.
 */
export function toHex(buf: ArrayBuffer | Uint8Array<ArrayBuffer>): string {
  return Array.from(buf instanceof ArrayBuffer ? new Uint8Array(buf) : buf)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
