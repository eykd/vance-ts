import { argon2id } from '@noble/hashes/argon2.js';
import { bytesToHex, hexToBytes, randomBytes } from '@noble/hashes/utils.js';

import type { PasswordHasher } from '../../domain/interfaces/PasswordHasher';

/**
 * Configuration for Argon2id password hashing.
 *
 * Defaults follow OWASP 2025 recommendations for password storage.
 *
 * @see https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
 */
export interface Argon2Config {
  /** Memory cost in KiB. OWASP minimum: 19456 (19 MiB). */
  readonly memoryCost: number;

  /** Time cost (iterations). OWASP minimum: 2. */
  readonly timeCost: number;

  /** Parallelism factor. OWASP minimum: 1. */
  readonly parallelism: number;

  /** Output hash length in bytes. */
  readonly hashLength: number;

  /** Salt length in bytes. */
  readonly saltLength: number;
}

/** OWASP 2025 recommended defaults for Argon2id. */
const DEFAULT_CONFIG: Argon2Config = {
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
  hashLength: 32,
  saltLength: 16,
};

/**
 * Parsed components of a PHC-format Argon2id hash string.
 */
interface ParsedHash {
  readonly memoryCost: number;
  readonly timeCost: number;
  readonly parallelism: number;
  readonly salt: Uint8Array;
  readonly hash: Uint8Array;
}

/** Regex for validating PHC format: $argon2id$v=19$m=N,t=N,p=N$<hex-salt>$<hex-hash> */
const PHC_REGEX = /^\$argon2id\$v=19\$m=(\d+),t=(\d+),p=(\d+)\$([a-f0-9]+)\$([a-f0-9]+)$/;

/**
 * Parses a PHC-format Argon2id hash string into its components.
 *
 * @param hashString - The PHC-format hash string to parse
 * @returns The parsed components, or null if the format is invalid
 */
function parseHash(hashString: string): ParsedHash | null {
  const match = PHC_REGEX.exec(hashString);
  if (match === null) {
    return null;
  }

  const mStr = match[1];
  const tStr = match[2];
  const pStr = match[3];
  const saltHex = match[4];
  const hashHex = match[5];

  /* istanbul ignore next -- defensive guard: regex capture groups always defined after match */
  if (
    mStr === undefined ||
    tStr === undefined ||
    pStr === undefined ||
    saltHex === undefined ||
    hashHex === undefined
  ) {
    return null;
  }

  return {
    memoryCost: Number(mStr),
    timeCost: Number(tStr),
    parallelism: Number(pStr),
    salt: hexToBytes(saltHex),
    hash: hexToBytes(hashHex),
  };
}

/**
 * Compares two Uint8Arrays in constant time to prevent timing attacks.
 *
 * @param a - First byte array
 * @param b - Second byte array
 * @returns True if the arrays are equal
 */
function constantTimeEqualBytes(a: Uint8Array, b: Uint8Array): boolean {
  /* istanbul ignore next -- argon2id always returns dkLen bytes matching stored hash length */
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    // Non-null assertion safe: loop bound guarantees valid indices after length check
    result |= a[i]! ^ b[i]!;
  }

  return result === 0;
}

/**
 * Argon2id implementation of the PasswordHasher port.
 *
 * Uses the `@noble/hashes` library for pure-JS Argon2id hashing,
 * compatible with Cloudflare Workers (no Node.js crypto required).
 *
 * Output format: PHC string `$argon2id$v=19$m={m},t={t},p={p}${hex-salt}${hex-hash}`
 *
 * Uses hex encoding instead of base64 to avoid dependency on btoa/atob,
 * which have inconsistent behavior across environments.
 */
export class Argon2PasswordHasher implements PasswordHasher {
  private readonly config: Argon2Config;

  /**
   * Creates a new Argon2PasswordHasher.
   *
   * @param config - Optional configuration override (defaults to OWASP 2025 recommendations)
   */
  constructor(config?: Partial<Argon2Config>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Hashes a plaintext password using Argon2id.
   *
   * Generates a unique random salt for each hash operation.
   * Returns a PHC-format string containing algorithm, parameters, salt, and hash.
   *
   * @param password - The plaintext password to hash
   * @returns A PHC-format Argon2id hash string
   */
  hash(password: string): Promise<string> {
    const salt = randomBytes(this.config.saltLength);
    const hashBytes = argon2id(password, salt, {
      m: this.config.memoryCost,
      t: this.config.timeCost,
      p: this.config.parallelism,
      dkLen: this.config.hashLength,
    });

    const saltHex = bytesToHex(salt);
    const hashHex = bytesToHex(hashBytes);

    return Promise.resolve(
      `$argon2id$v=19$m=${String(this.config.memoryCost)},t=${String(this.config.timeCost)},p=${String(this.config.parallelism)}$${saltHex}$${hashHex}`
    );
  }

  /**
   * Verifies a plaintext password against a stored PHC-format hash.
   *
   * Reads parameters from the stored hash for forward compatibility
   * with parameter upgrades. Uses constant-time comparison.
   * Returns false (never throws) for malformed hashes.
   *
   * @param password - The plaintext password to verify
   * @param hashString - The stored PHC-format hash to compare against
   * @returns True if the password matches the hash
   */
  verify(password: string, hashString: string): Promise<boolean> {
    const parsed = parseHash(hashString);
    if (parsed === null) {
      return Promise.resolve(false);
    }

    try {
      const computed = argon2id(password, parsed.salt, {
        m: parsed.memoryCost,
        t: parsed.timeCost,
        p: parsed.parallelism,
        dkLen: parsed.hash.length,
      });

      return Promise.resolve(constantTimeEqualBytes(computed, parsed.hash));
    } catch {
      return Promise.resolve(false);
    }
  }
}
