# Password Security

**Purpose**: OWASP-compliant password hashing with Argon2id or PBKDF2

**When to read**: During implementation of user registration/login functionality

**Source**: Full implementation in `docs/secure-authentication-guide.md` (lines 870-1255)

---

## Algorithm Choice

| Algorithm                  | Pros                                    | Cons                                | When to Use                   |
| -------------------------- | --------------------------------------- | ----------------------------------- | ----------------------------- |
| **Argon2id** (Recommended) | Most secure, memory-hard, GPU-resistant | Requires `@noble/hashes` dependency | Default choice, memory allows |
| **PBKDF2** (Fallback)      | Built into Web Crypto API, no deps      | Less resistant to GPU attacks       | Native-only requirements      |

**OWASP 2025 Recommendation**: Argon2id as primary, PBKDF2 (600,000+ iterations) as acceptable alternative

---

## Argon2id Configuration

**OWASP 2025 Parameters**:

- Memory: minimum 19 MiB (19456 KiB), recommended 46 MiB
- Iterations: minimum 2
- Parallelism: 1
- Output length: 32 bytes
- Salt length: 16 bytes (128 bits)

**File**: `src/infrastructure/security/Argon2Hasher.ts`

```typescript
import { argon2id } from '@noble/hashes/argon2';
import { randomBytes } from '@noble/hashes/utils';

const DEFAULT_CONFIG = {
  memoryCost: 19456, // 19 MiB for Workers
  timeCost: 2,
  parallelism: 1,
  hashLength: 32,
  saltLength: 16,
};

export class Argon2Hasher {
  async hash(password: string): Promise<string> {
    const salt = randomBytes(this.config.saltLength);

    const hash = argon2id(password, salt, {
      m: this.config.memoryCost,
      t: this.config.timeCost,
      p: this.config.parallelism,
      dkLen: this.config.hashLength,
    });

    // Format: $argon2id$v=19$m=19456,t=2,p=1$<salt>$<hash>
    const saltB64 = this.toBase64(salt);
    const hashB64 = this.toBase64(hash);

    return `$argon2id$v=19$m=${this.config.memoryCost},t=${this.config.timeCost},p=${this.config.parallelism}$${saltB64}$${hashB64}`;
  }

  async verify(password: string, storedHash: string): Promise<boolean> {
    const parsed = this.parseHash(storedHash);
    if (parsed === null) return false;

    const computedHash = argon2id(password, parsed.salt, {
      m: parsed.memoryCost,
      t: parsed.timeCost,
      p: parsed.parallelism,
      dkLen: parsed.hash.length,
    });

    // Constant-time comparison
    return this.constantTimeEqual(computedHash, parsed.hash);
  }

  needsRehash(storedHash: string): boolean {
    const parsed = this.parseHash(storedHash);
    if (parsed === null) return true;

    return parsed.memoryCost < this.config.memoryCost || parsed.timeCost < this.config.timeCost;
  }
}
```

**Key points**:

- PHC string format: `$argon2id$v=19$m=<memory>,t=<time>,p=<parallelism>$<salt>$<hash>`
- Salt stored with hash (no separate salt storage needed)
- Constant-time comparison prevents timing attacks
- `needsRehash()` supports parameter upgrades over time

---

## PBKDF2 Implementation (Native Web Crypto)

**OWASP 2024 Parameters**:

- Iterations: 600,000 for SHA-256
- Salt length: 16 bytes
- Output length: 32 bytes

**File**: `src/infrastructure/security/PBKDF2Hasher.ts`

```typescript
export class PBKDF2Hasher {
  private readonly iterations = 600000; // OWASP 2024

  async hash(password: string): Promise<string> {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const encoder = new TextEncoder();

    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits']
    );

    const hash = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: this.iterations,
        hash: 'SHA-256',
      },
      keyMaterial,
      256 // 32 bytes * 8 bits
    );

    // Combine salt + hash
    const combined = new Uint8Array(salt.length + hash.byteLength);
    combined.set(salt);
    combined.set(new Uint8Array(hash), salt.length);

    // Format: $pbkdf2-sha256$<iterations>$<base64>
    return `$pbkdf2-sha256$${this.iterations}$${btoa(String.fromCharCode(...combined))}`;
  }

  async verify(password: string, storedHash: string): Promise<boolean> {
    const parsed = this.parseHash(storedHash);
    if (parsed === null) return false;

    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits']
    );

    const actualHash = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: parsed.salt,
        iterations: parsed.iterations,
        hash: 'SHA-256',
      },
      keyMaterial,
      parsed.hash.length * 8
    );

    return this.constantTimeEqual(new Uint8Array(actualHash), parsed.hash);
  }
}
```

---

## Unified Password Service

**File**: `src/infrastructure/security/PasswordService.ts`

Provides algorithm abstraction and automatic format detection:

```typescript
export class PasswordService {
  private readonly primaryHasher: PasswordHasher;

  constructor(useArgon2: boolean = true) {
    this.primaryHasher = useArgon2 ? new Argon2Hasher() : new PBKDF2Hasher();
  }

  async hash(password: string): Promise<string> {
    this.validatePasswordStrength(password);
    return this.primaryHasher.hash(password);
  }

  async verify(password: string, storedHash: string): Promise<boolean> {
    // Auto-detect algorithm from hash format
    if (storedHash.startsWith('$argon2id$')) {
      return new Argon2Hasher().verify(password, storedHash);
    } else if (storedHash.startsWith('$pbkdf2-sha256$')) {
      return new PBKDF2Hasher().verify(password, storedHash);
    }
    return false;
  }

  private validatePasswordStrength(password: string): void {
    if (password.length < 12) {
      throw new Error('Password must be at least 12 characters');
    }
    if (password.length > 128) {
      throw new Error('Password cannot exceed 128 characters');
    }
    // Add: common password check, entropy check, etc.
  }
}
```

**Migration strategy**:

- Use `needsRehash()` to detect old algorithms/parameters
- Rehash during successful login when needed
- Supports gradual migration from PBKDF2 → Argon2id

---

## Security Best Practices

1. **Never log plaintext passwords** - Ever. Not even in debug mode.
2. **Use constant-time comparison** - Prevents timing attacks on password verification
3. **Salt is mandatory** - Every password gets unique random salt
4. **Upgrade parameters over time** - Use `needsRehash()` to migrate to stronger parameters
5. **Validate before hashing** - Check length, common passwords, etc. before expensive hashing
6. **Timing attack mitigation** - Always hash password even if user doesn't exist (prevents account enumeration)

---

## Testing Strategy

```typescript
describe('Argon2Hasher', () => {
  it('should hash and verify password correctly', async () => {
    const hasher = new Argon2Hasher();
    const password = 'MySecurePassword123!';

    const hash = await hasher.hash(password);

    expect(hash).toMatch(/^\$argon2id\$/);
    expect(await hasher.verify(password, hash)).toBe(true);
    expect(await hasher.verify('WrongPassword', hash)).toBe(false);
  });

  it('should detect when rehash is needed', async () => {
    const oldHash = '$argon2id$v=19$m=10000,t=1,p=1$...'; // Old parameters
    const hasher = new Argon2Hasher(); // Default config has higher parameters

    expect(hasher.needsRehash(oldHash)).toBe(true);
  });

  it('should use constant-time comparison', async () => {
    // Timing attack test - verify similar hashes take similar time
    const hasher = new Argon2Hasher();
    const hash = await hasher.hash('test');

    const start1 = performance.now();
    await hasher.verify('test', hash);
    const time1 = performance.now() - start1;

    const start2 = performance.now();
    await hasher.verify('wrong', hash);
    const time2 = performance.now() - start2;

    // Times should be within reasonable delta (not exact due to system variance)
    expect(Math.abs(time1 - time2)).toBeLessThan(10); // 10ms tolerance
  });
});
```

---

## Dependencies

**Argon2id**:

```json
{
  "dependencies": {
    "@noble/hashes": "^1.3.0"
  }
}
```

**PBKDF2**: No external dependencies (uses Web Crypto API)

---

## Next Steps

- For session management → Read `session-management.md`
- For complete authentication flow → Read full guide sections on AuthenticateUser use case
- For rate limiting → Read full guide sections on KVRateLimiter
