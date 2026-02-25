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
 * Accepts any Uint8Array regardless of its backing buffer type
 * (ArrayBuffer or SharedArrayBuffer) to support third-party libraries that
 * return `Uint8Array<ArrayBufferLike>` in their TypeScript declarations.
 *
 * @param buf - The buffer to convert.
 * @returns Lowercase hex string.
 */
export function toHex(buf: ArrayBuffer | Uint8Array<ArrayBufferLike>): string {
  return Array.from(buf instanceof ArrayBuffer ? new Uint8Array(buf) : buf)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
