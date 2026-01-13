# Domain Entities for Authentication

**Purpose**: Domain-driven design patterns for authentication entities and value objects

**When to read**: During planning phase when defining domain model structure

**Source**: Full implementation in `docs/secure-authentication-guide.md` (lines 399-900)

---

## Overview

Authentication domain layer consists of:

- **Value Objects**: Email, Password, SessionId, CsrfToken (immutable, validated)
- **Entities**: User, Session (identity, mutable state, business logic)
- **Repository Interfaces**: UserRepository, SessionRepository (persistence abstraction)

## Key Patterns

### Value Object Pattern

- Immutable once created
- Self-validating in factory methods
- Encapsulates validation rules
- Provides domain-specific operations

### Entity Pattern

- Has identity (ID)
- Can change state over time
- Contains business logic methods
- Returns new instances for state changes (immutability where practical)

---

## Email Value Object

**File**: `src/domain/value-objects/Email.ts`

```typescript
export class Email {
  private readonly _value: string;
  private readonly _normalized: string;

  private static readonly MAX_LENGTH = 254;
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  private constructor(value: string, normalized: string) {
    this._value = value;
    this._normalized = normalized;
  }

  static create(value: string): Email {
    const trimmed = value.trim();

    if (trimmed.length === 0) {
      throw new Error('Email cannot be empty');
    }

    if (trimmed.length > Email.MAX_LENGTH) {
      throw new Error(`Email cannot exceed ${Email.MAX_LENGTH} characters`);
    }

    if (!Email.EMAIL_REGEX.test(trimmed)) {
      throw new Error('Invalid email format');
    }

    const normalized = Email.normalize(trimmed);
    return new Email(trimmed, normalized);
  }

  private static normalize(email: string): string {
    const [localPart, domain] = email.split('@');

    if (localPart === undefined || domain === undefined) {
      throw new Error('Invalid email format');
    }

    // Lowercase entire email for consistent comparison
    return `${localPart.toLowerCase()}@${domain.toLowerCase()}`;
  }

  get value(): string {
    return this._value;
  }

  get normalized(): string {
    return this._normalized;
  }

  equals(other: Email): boolean {
    return this._normalized === other._normalized;
  }

  toString(): string {
    return this._value;
  }
}
```

**Security considerations**:

- Normalizes emails to prevent duplicate accounts (User@Example.com vs user@example.com)
- Validates format to prevent injection attacks
- Limits length to prevent DoS via oversized inputs
- Uses normalized form for uniqueness checks

---

## Password Value Object

**File**: `src/domain/value-objects/Password.ts`

```typescript
export class Password {
  private readonly _value: string;

  private static readonly MIN_LENGTH = 12; // NIST 800-63B recommends 8, we use 12
  private static readonly MAX_LENGTH = 128;

  private static readonly COMMON_PASSWORDS = new Set([
    'password123456',
    '123456789012',
    'qwertyuiopas',
    // ... add more
  ]);

  private constructor(value: string) {
    this._value = value;
  }

  static create(value: string): Password {
    if (value.length < Password.MIN_LENGTH) {
      throw new Error(`Password must be at least ${Password.MIN_LENGTH} characters`);
    }

    if (value.length > Password.MAX_LENGTH) {
      throw new Error(`Password cannot exceed ${Password.MAX_LENGTH} characters`);
    }

    const normalized = value.toLowerCase();
    if (Password.COMMON_PASSWORDS.has(normalized)) {
      throw new Error('This password is too common. Please choose a stronger password.');
    }

    return new Password(value);
  }

  static createUnchecked(value: string): Password {
    return new Password(value);
  }

  get value(): string {
    return this._value;
  }

  equals(other: Password): boolean {
    if (this._value.length !== other._value.length) {
      return false;
    }

    // Constant-time comparison
    let result = 0;
    for (let i = 0; i < this._value.length; i++) {
      result |= this._value.charCodeAt(i) ^ other._value.charCodeAt(i);
    }
    return result === 0;
  }
}
```

**Security considerations**:

- Enforces minimum complexity requirements (12 characters)
- Checks against common password lists
- Never stores or logs plaintext password
- Uses constant-time comparison to prevent timing attacks
- `createUnchecked()` for login validation (bypasses rules for existing passwords)

---

## Session Entity

**File**: `src/domain/entities/Session.ts`

```typescript
export interface SessionData {
  readonly sessionId: string;
  readonly userId: string;
  readonly createdAt: string;
  readonly expiresAt: string;
  readonly lastActivityAt: string;
  readonly ipAddress: string;
  readonly userAgent: string;
  readonly csrfToken: string;
}

export class Session {
  private constructor(private readonly data: SessionData) {}

  static create(params: {
    sessionId: SessionId;
    userId: string;
    ipAddress: string;
    userAgent: string;
    csrfToken: CsrfToken;
    durationSeconds: number;
  }): Session {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + params.durationSeconds * 1000);

    return new Session({
      sessionId: params.sessionId.value,
      userId: params.userId,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      lastActivityAt: now.toISOString(),
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      csrfToken: params.csrfToken.value,
    });
  }

  static fromData(data: SessionData): Session {
    return new Session(data);
  }

  get sessionId(): string {
    return this.data.sessionId;
  }

  get userId(): string {
    return this.data.userId;
  }

  get csrfToken(): string {
    return this.data.csrfToken;
  }

  isExpired(): boolean {
    return new Date() > new Date(this.data.expiresAt);
  }

  needsRefresh(idleTimeoutSeconds: number = 900): boolean {
    const lastActivity = new Date(this.data.lastActivityAt);
    const threshold = new Date(Date.now() - idleTimeoutSeconds * 1000);
    return lastActivity < threshold;
  }

  withUpdatedActivity(): Session {
    return new Session({
      ...this.data,
      lastActivityAt: new Date().toISOString(),
    });
  }

  validateCsrfToken(token: string): boolean {
    // Constant-time comparison
    if (this.data.csrfToken.length !== token.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < this.data.csrfToken.length; i++) {
      result |= this.data.csrfToken.charCodeAt(i) ^ token.charCodeAt(i);
    }
    return result === 0;
  }

  toJSON(): SessionData {
    return { ...this.data };
  }
}
```

**Security considerations**:

- Immutable data structure (returns new instance for updates)
- Tracks session expiration and idle timeout
- Binds CSRF token to session
- Stores IP and user agent for anomaly detection
- Constant-time CSRF token validation

---

## User Entity

**File**: `src/domain/entities/User.ts`

```typescript
export interface UserData {
  readonly id: string;
  readonly email: string;
  readonly emailNormalized: string;
  readonly passwordHash: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly emailVerified: boolean;
  readonly emailVerifiedAt: string | null;
  readonly failedLoginAttempts: number;
  readonly lastFailedLoginAt: string | null;
  readonly lockedUntil: string | null;
  readonly passwordChangedAt: string;
  readonly lastLoginAt: string | null;
  readonly lastLoginIp: string | null;
  readonly lastLoginUserAgent: string | null;
}

export class User {
  private static readonly MAX_FAILED_ATTEMPTS = 5;
  private static readonly LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

  private constructor(private readonly data: UserData) {}

  static create(params: { id: string; email: Email; passwordHash: string }): User {
    const now = new Date().toISOString();

    return new User({
      id: params.id,
      email: params.email.value,
      emailNormalized: params.email.normalized,
      passwordHash: params.passwordHash,
      createdAt: now,
      updatedAt: now,
      emailVerified: false,
      emailVerifiedAt: null,
      failedLoginAttempts: 0,
      lastFailedLoginAt: null,
      lockedUntil: null,
      passwordChangedAt: now,
      lastLoginAt: null,
      lastLoginIp: null,
      lastLoginUserAgent: null,
    });
  }

  static fromData(data: UserData): User {
    return new User(data);
  }

  get id(): string {
    return this.data.id;
  }

  get email(): string {
    return this.data.email;
  }

  get emailNormalized(): string {
    return this.data.emailNormalized;
  }

  get passwordHash(): string {
    return this.data.passwordHash;
  }

  get emailVerified(): boolean {
    return this.data.emailVerified;
  }

  isLocked(): boolean {
    if (this.data.lockedUntil === null) {
      return false;
    }
    return new Date() < new Date(this.data.lockedUntil);
  }

  getLockoutRemainingSeconds(): number {
    if (this.data.lockedUntil === null) {
      return 0;
    }
    const remaining = new Date(this.data.lockedUntil).getTime() - Date.now();
    return Math.max(0, Math.ceil(remaining / 1000));
  }

  recordFailedLogin(): User {
    const attempts = this.data.failedLoginAttempts + 1;
    const now = new Date();

    const shouldLock = attempts >= User.MAX_FAILED_ATTEMPTS;
    const lockedUntil = shouldLock
      ? new Date(now.getTime() + User.LOCK_DURATION_MS).toISOString()
      : this.data.lockedUntil;

    return new User({
      ...this.data,
      failedLoginAttempts: attempts,
      lastFailedLoginAt: now.toISOString(),
      lockedUntil,
      updatedAt: now.toISOString(),
    });
  }

  recordSuccessfulLogin(ip: string, userAgent: string): User {
    const now = new Date().toISOString();

    return new User({
      ...this.data,
      failedLoginAttempts: 0,
      lastFailedLoginAt: null,
      lockedUntil: null,
      lastLoginAt: now,
      lastLoginIp: ip,
      lastLoginUserAgent: userAgent,
      updatedAt: now,
    });
  }

  updatePassword(newPasswordHash: string): User {
    const now = new Date().toISOString();

    return new User({
      ...this.data,
      passwordHash: newPasswordHash,
      passwordChangedAt: now,
      updatedAt: now,
    });
  }

  toJSON(): UserData {
    return this.data;
  }
}
```

**Security considerations**:

- Account lockout after 5 failed attempts (15-minute lockout)
- Tracks failed login attempts and lockout state
- Records IP and user agent for audit trail
- Returns new instances for state changes (immutability)
- Never includes password hash in JSON serialization (for API responses)

---

## Repository Interfaces

**File**: `src/domain/interfaces/UserRepository.ts`

```typescript
export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  save(user: User): Promise<void>;
  delete(userId: string): Promise<void>;
}
```

**File**: `src/domain/interfaces/SessionRepository.ts`

```typescript
export interface SessionRepository {
  findById(sessionId: string): Promise<Session | null>;
  save(session: Session, ttlSeconds: number): Promise<void>;
  delete(sessionId: string): Promise<void>;
  deleteAllForUser(userId: string): Promise<void>;
  updateActivity(session: Session, ttlSeconds: number): Promise<void>;
}
```

---

## Testing Strategy

**Value Objects**:

- Test validation rules (Email format, Password length, etc.)
- Test normalization (Email case-insensitivity)
- Test immutability (can't modify after creation)
- Test constant-time operations (Password.equals)

**Entities**:

- Test factory methods (create, fromData)
- Test state transitions (recordFailedLogin, recordSuccessfulLogin)
- Test business rules (account lockout, session expiration)
- Test immutability (returns new instances)

**Example test**:

```typescript
describe('User entity', () => {
  it('should lock account after 5 failed login attempts', () => {
    let user = User.create({
      id: '123',
      email: Email.create('test@example.com'),
      passwordHash: 'hash123',
    });

    expect(user.isLocked()).toBe(false);

    // Record 5 failed attempts
    for (let i = 0; i < 5; i++) {
      user = user.recordFailedLogin();
    }

    expect(user.isLocked()).toBe(true);
    expect(user.getLockoutRemainingSeconds()).toBeGreaterThan(0);
  });
});
```

---

## Next Steps

- For password hashing implementation → Read `password-security.md`
- For session storage with KV → Read `session-management.md`
- For repository implementations → Read full guide sections on D1UserRepository and KVSessionRepository
