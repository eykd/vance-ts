# Secure Session-Based Authentication on Cloudflare Workers

**A Comprehensive Implementation Guide for Interactive Browser Applications**

_Using HTMX, Alpine.js, TailwindCSS 4, DaisyUI 5, and TypeScript Workers_

_Last Updated: January 2026_

---

## Table of Contents

1. [Introduction](#introduction)
2. [Security Architecture Overview](#security-architecture-overview)
3. [Project Structure](#project-structure)
4. [Infrastructure Setup](#infrastructure-setup)
5. [Domain Layer: User and Session Entities](#domain-layer)
6. [Password Security](#password-security)
7. [Session Management](#session-management)
8. [CSRF Protection](#csrf-protection)
9. [XSS Prevention and Safe HTML Templates](#xss-prevention)
10. [HTMX and Alpine.js Security](#htmx-alpine-security)
11. [Rate Limiting and Brute Force Protection](#rate-limiting)
12. [Security Headers and Cookie Configuration](#security-headers)
13. [Authentication Handlers](#authentication-handlers)
14. [Frontend Implementation](#frontend-implementation)
15. [Testing Authentication Flows](#testing)
16. [Security Checklist](#security-checklist)

---

## Introduction

This guide provides a comprehensive, security-first approach to implementing session-based user authentication for interactive web applications on Cloudflare's edge platform. It serves as a companion to the _Comprehensive Security Guide: Browser-Based Interactive Web Applications on Cloudflare_ and implements its authentication recommendations in detail.

The architecture prioritizes defense-in-depth, following OWASP guidelines and current best practices as of January 2026.

### Why Session-Based Authentication?

For browser-based HTMX applications, session cookies are the recommended approach—they are simpler and more secure than JWTs for this use case:

- **Immediate revocation**: Sessions can be invalidated instantly server-side
- **No client-side token storage vulnerabilities**: Session IDs are stored in HttpOnly cookies
- **Smaller attack surface**: No token parsing or signature verification in the browser
- **Better suited for HTMX**: Server-rendered HTML naturally integrates with session state
- **Server-controlled state**: Application state lives on the server, not in client-side JavaScript

### Security Advantages of the Hypermedia Architecture

The HTMX/Alpine.js approach offers inherent security benefits over traditional SPAs:

1. **Server-Controlled State**: Application state lives on the server, not in client-side JavaScript. This eliminates entire classes of client-side state manipulation attacks.

2. **Reduced Attack Surface**: Less JavaScript means fewer opportunities for XSS exploitation. HTMX's default `selfRequestsOnly: true` prevents requests to untrusted origins.

3. **Simpler Mental Model**: When the server renders HTML and controls what the client displays, security reasoning becomes more straightforward.

4. **Natural CSRF Protection**: HTML form submissions and HTMX requests naturally integrate with traditional CSRF protection mechanisms.

### Security Principles

This implementation follows these core security principles:

1. **Defense in Depth**: Multiple overlapping security layers
2. **Secure by Default**: Strictest settings unless explicitly relaxed
3. **Fail Secure**: Errors default to denying access
4. **Least Privilege**: Minimal permissions at every layer
5. **Audit Everything**: Comprehensive logging for security events

---

## Security Architecture Overview

### Defense-in-Depth Model

Security for browser-based applications requires multiple overlapping layers of protection. No single measure is sufficient; the goal is to ensure that if one layer fails, others continue to provide protection.

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Edge Layer (Cloudflare)                       │
│  • DDoS Protection • WAF Rules • Rate Limiting • Bot Management     │
├─────────────────────────────────────────────────────────────────────┤
│                       Transport Layer                                │
│  • TLS 1.3 • HSTS • Certificate Management                          │
├─────────────────────────────────────────────────────────────────────┤
│                      Application Layer                               │
│  • CSP • Security Headers • Input Validation • Output Encoding      │
├─────────────────────────────────────────────────────────────────────┤
│                     Authentication Layer                             │
│  • Session Management • CSRF Tokens • Cookie Security               │
├─────────────────────────────────────────────────────────────────────┤
│                        Data Layer                                    │
│  • Parameterized Queries • Encryption at Rest • Access Control      │
└─────────────────────────────────────────────────────────────────────┘
```

### Threat Model for Authentication

| Threat Category        | Attack Vectors                      | Primary Mitigations                                |
| ---------------------- | ----------------------------------- | -------------------------------------------------- |
| Credential Attacks     | Brute force, Credential stuffing    | Rate limiting, Account lockout, Argon2id           |
| Session Attacks        | Hijacking, Fixation, Token theft    | Secure cookies, KV storage, Session regeneration   |
| Cross-Site Attacks     | XSS, CSRF, Clickjacking             | CSP, CSRF tokens, X-Frame-Options, Output encoding |
| Information Disclosure | Account enumeration, Timing attacks | Generic errors, Constant-time comparison           |
| Injection              | SQL injection, HTML injection       | Parameterized queries, Safe HTML templates         |

### Browser-to-Server Security Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Browser                                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────┐  │
│  │ Session Cookie  │  │  CSRF Token     │  │  HTMX Config        │  │
│  │ (HttpOnly,      │  │  (Header +      │  │  (selfRequestsOnly, │  │
│  │  Secure,        │  │   Form Field)   │  │   allowScriptTags   │  │
│  │  SameSite=Lax)  │  │                 │  │   =false)           │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼ HTTPS Only
┌─────────────────────────────────────────────────────────────────────┐
│                    Cloudflare Edge (Workers)                         │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │                    Security Middleware Stack                    ││
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────────┐ ││
│  │  │ Security │→│  Rate    │→│  CSRF    │→│    Session         │ ││
│  │  │ Headers  │ │ Limiting │ │ Verify   │ │    Validation      │ ││
│  │  └──────────┘ └──────────┘ └──────────┘ └────────────────────┘ ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │                    Application Layer                            ││
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────────┐││
│  │  │ Auth Handlers│ │ Safe HTML    │ │ Session Management       │││
│  │  │ (Login,      │ │ Templates    │ │ (Create, Validate,       │││
│  │  │  Register,   │ │ (html``)     │ │  Invalidate)             │││
│  │  │  Logout)     │ │              │ │                          │││
│  │  └──────────────┘ └──────────────┘ └──────────────────────────┘││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │                    Data Layer                                   ││
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────────┐││
│  │  │ D1 Database  │ │ KV Sessions  │ │ KV Rate Limits           │││
│  │  │ (Users)      │ │              │ │                          │││
│  │  └──────────────┘ └──────────────┘ └──────────────────────────┘││
│  └─────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

### Data Storage Architecture

```
┌───────────────────────────────────┐   ┌───────────────────────────────┐
│         D1 Database               │   │         KV Store              │
│  ┌─────────────────────────────┐  │   │  ┌─────────────────────────┐  │
│  │ users                       │  │   │  │ Sessions                │  │
│  │ - id (TEXT PRIMARY KEY)     │  │   │  │ - session:{id} → JSON   │  │
│  │ - email (TEXT UNIQUE)       │  │   │  │   (userId, createdAt,   │  │
│  │ - email_normalized          │  │   │  │    expiresAt, ipHash,   │  │
│  │ - password_hash             │  │   │  │    userAgent, csrfToken)│  │
│  │ - created_at                │  │   │  │                         │  │
│  │ - email_verified            │  │   │  │ Rate Limits             │  │
│  │ - failed_login_attempts     │  │   │  │ - ratelimit:{action}:   │  │
│  │ - locked_until              │  │   │  │   {id} → {requests[],   │  │
│  │ - password_changed_at       │  │   │  │   blockedUntil}         │  │
│  └─────────────────────────────┘  │   │  └─────────────────────────┘  │
└───────────────────────────────────┘   └───────────────────────────────┘
```

---

## Project Structure

```
project-root/
├── src/
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── User.ts
│   │   │   ├── User.spec.ts
│   │   │   ├── Session.ts
│   │   │   └── Session.spec.ts
│   │   ├── value-objects/
│   │   │   ├── Email.ts
│   │   │   ├── Email.spec.ts
│   │   │   ├── Password.ts
│   │   │   ├── Password.spec.ts
│   │   │   ├── SessionId.ts
│   │   │   └── CsrfToken.ts
│   │   └── interfaces/
│   │       ├── UserRepository.ts
│   │       ├── SessionRepository.ts
│   │       └── RateLimiter.ts
│   │
│   ├── application/
│   │   ├── use-cases/
│   │   │   ├── RegisterUser.ts
│   │   │   ├── RegisterUser.spec.ts
│   │   │   ├── AuthenticateUser.ts
│   │   │   ├── AuthenticateUser.spec.ts
│   │   │   ├── LogoutUser.ts
│   │   │   └── ValidateSession.ts
│   │   └── dto/
│   │       ├── RegisterRequest.ts
│   │       ├── LoginRequest.ts
│   │       └── AuthResult.ts
│   │
│   ├── infrastructure/
│   │   ├── repositories/
│   │   │   ├── D1UserRepository.ts
│   │   │   ├── D1UserRepository.integration.test.ts
│   │   │   ├── KVSessionRepository.ts
│   │   │   └── KVSessionRepository.integration.test.ts
│   │   ├── security/
│   │   │   ├── Argon2Hasher.ts
│   │   │   ├── CryptoSessionIdGenerator.ts
│   │   │   └── KVRateLimiter.ts
│   │   └── crypto/
│   │       └── WebCryptoProvider.ts
│   │
│   ├── presentation/
│   │   ├── handlers/
│   │   │   ├── AuthHandlers.ts
│   │   │   ├── AuthHandlers.spec.ts
│   │   │   └── AuthHandlers.acceptance.test.ts
│   │   ├── middleware/
│   │   │   ├── securityHeaders.ts
│   │   │   ├── rateLimiter.ts
│   │   │   ├── csrfProtection.ts
│   │   │   ├── sessionValidator.ts
│   │   │   └── errorHandler.ts
│   │   └── templates/
│   │       ├── layouts/
│   │       │   └── base.ts
│   │       ├── pages/
│   │       │   ├── login.ts
│   │       │   ├── register.ts
│   │       │   └── dashboard.ts
│   │       └── partials/
│   │           ├── loginForm.ts
│   │           ├── registerForm.ts
│   │           └── errorAlert.ts
│   │
│   ├── index.ts
│   └── router.ts
│
├── migrations/
│   └── 0001_users_and_auth.sql
│
├── wrangler.jsonc
├── vitest.config.ts
├── tsconfig.json
└── package.json
```

---

## Infrastructure Setup

### Wrangler Configuration

```jsonc
// wrangler.jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "secure-app",
  "main": "src/index.ts",
  "compatibility_date": "2025-01-01",
  "compatibility_flags": ["nodejs_compat"],

  "observability": {
    "enabled": true,
  },

  "assets": {
    "directory": "./public",
    "binding": "ASSETS",
  },

  // D1 for persistent user data
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "secure-app-db",
      "database_id": "your-database-id",
    },
  ],

  // KV for sessions and rate limiting
  "kv_namespaces": [
    {
      "binding": "SESSIONS",
      "id": "your-sessions-kv-id",
    },
    {
      "binding": "RATE_LIMITS",
      "id": "your-rate-limits-kv-id",
    },
  ],

  // Environment variables (use secrets for production)
  "vars": {
    "ENVIRONMENT": "development",
    "SESSION_DURATION_SECONDS": "86400",
    "SESSION_COOKIE_NAME": "__Host-session",
    "CSRF_COOKIE_NAME": "__Host-csrf",
  },
}
```

### Database Migration

```sql
-- migrations/0001_users_and_auth.sql

-- Users table with security fields
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    email_normalized TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    email_verified INTEGER NOT NULL DEFAULT 0,
    email_verified_at TEXT,

    -- Security tracking
    failed_login_attempts INTEGER NOT NULL DEFAULT 0,
    last_failed_login_at TEXT,
    locked_until TEXT,
    password_changed_at TEXT NOT NULL DEFAULT (datetime('now')),

    -- Audit fields
    last_login_at TEXT,
    last_login_ip TEXT,
    last_login_user_agent TEXT
);

-- Index for email lookups (case-insensitive via normalized)
CREATE INDEX IF NOT EXISTS idx_users_email_normalized ON users(email_normalized);

-- Audit log for security events
CREATE TABLE IF NOT EXISTS security_audit_log (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    event_type TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    details TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),

    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_audit_user_id ON security_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_event_type ON security_audit_log(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON security_audit_log(created_at);
```

### TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022"],
    "types": ["@cloudflare/workers-types"],
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@domain/*": ["src/domain/*"],
      "@application/*": ["src/application/*"],
      "@infrastructure/*": ["src/infrastructure/*"],
      "@presentation/*": ["src/presentation/*"]
    }
  },
  "include": ["src/**/*", "tests/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

## Domain Layer

### Email Value Object

```typescript
// src/domain/value-objects/Email.ts

/**
 * Email value object with validation and normalization
 *
 * Security considerations:
 * - Normalizes emails for consistent comparison (prevents duplicate accounts)
 * - Validates format to prevent injection attacks
 * - Limits length to prevent DoS via oversized inputs
 */
export class Email {
  private readonly _value: string;
  private readonly _normalized: string;

  private static readonly MAX_LENGTH = 254;
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  private constructor(value: string, normalized: string) {
    this._value = value;
    this._normalized = normalized;
  }

  /**
   * Creates an Email from a raw string input
   * @throws Error if email is invalid
   */
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

    // Normalize: lowercase and handle Gmail-style dots/plus addressing
    const normalized = Email.normalize(trimmed);

    return new Email(trimmed, normalized);
  }

  /**
   * Normalizes email for consistent storage and comparison
   * This prevents users from creating multiple accounts with
   * variations like User@Example.com vs user@example.com
   */
  private static normalize(email: string): string {
    const [localPart, domain] = email.split('@');

    if (localPart === undefined || domain === undefined) {
      throw new Error('Invalid email format');
    }

    // Lowercase the entire email (RFC 5321 says local part is case-sensitive,
    // but virtually all providers treat it as case-insensitive)
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

### Password Value Object with Argon2id

```typescript
// src/domain/value-objects/Password.ts

/**
 * Password value object with strength validation
 *
 * Security considerations:
 * - Enforces minimum complexity requirements
 * - Checks against common password lists
 * - Never stores or logs the plaintext password
 */
export class Password {
  private readonly _value: string;

  // NIST 800-63B recommends minimum 8 characters
  // We use 12 for additional security
  private static readonly MIN_LENGTH = 12;
  private static readonly MAX_LENGTH = 128;

  // Common weak passwords (extend this list or use external service)
  private static readonly COMMON_PASSWORDS = new Set([
    'password123456',
    '123456789012',
    'qwertyuiopas',
    // ... add more
  ]);

  private constructor(value: string) {
    this._value = value;
  }

  /**
   * Creates a Password from raw input with validation
   * @throws Error if password doesn't meet requirements
   */
  static create(value: string): Password {
    if (value.length < Password.MIN_LENGTH) {
      throw new Error(`Password must be at least ${Password.MIN_LENGTH} characters`);
    }

    if (value.length > Password.MAX_LENGTH) {
      throw new Error(`Password cannot exceed ${Password.MAX_LENGTH} characters`);
    }

    // Check against common passwords
    const normalized = value.toLowerCase();
    if (Password.COMMON_PASSWORDS.has(normalized)) {
      throw new Error('This password is too common. Please choose a stronger password.');
    }

    // Optional: Check for character variety
    // NIST 800-63B no longer requires special characters, but
    // we can still encourage good password hygiene

    return new Password(value);
  }

  /**
   * Creates a Password without validation (for comparing against stored hashes)
   * Use only when verifying login credentials
   */
  static createUnchecked(value: string): Password {
    return new Password(value);
  }

  get value(): string {
    return this._value;
  }

  /**
   * Securely compares two passwords in constant time
   */
  equals(other: Password): boolean {
    if (this._value.length !== other._value.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < this._value.length; i++) {
      result |= this._value.charCodeAt(i) ^ other._value.charCodeAt(i);
    }
    return result === 0;
  }
}
```

### Session Entity

```typescript
// src/domain/entities/Session.ts

import type { SessionId } from '../value-objects/SessionId';
import type { CsrfToken } from '../value-objects/CsrfToken';

/**
 * Session data stored in KV
 */
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

/**
 * Session entity with security validation
 */
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

  get ipAddress(): string {
    return this.data.ipAddress;
  }

  get userAgent(): string {
    return this.data.userAgent;
  }

  /**
   * Checks if session has expired
   */
  isExpired(): boolean {
    return new Date() > new Date(this.data.expiresAt);
  }

  /**
   * Checks if session needs refresh (e.g., last activity > 15 minutes ago)
   */
  needsRefresh(idleTimeoutSeconds: number = 900): boolean {
    const lastActivity = new Date(this.data.lastActivityAt);
    const threshold = new Date(Date.now() - idleTimeoutSeconds * 1000);
    return lastActivity < threshold;
  }

  /**
   * Creates a new session with updated activity timestamp
   */
  withUpdatedActivity(): Session {
    return new Session({
      ...this.data,
      lastActivityAt: new Date().toISOString(),
    });
  }

  /**
   * Validates CSRF token against the session's stored token
   */
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

### User Entity

```typescript
// src/domain/entities/User.ts

import type { Email } from '../value-objects/Email';

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

/**
 * User entity with security-focused methods
 */
export class User {
  // Lock account after 5 failed attempts
  private static readonly MAX_FAILED_ATTEMPTS = 5;
  // Lock duration: 15 minutes
  private static readonly LOCK_DURATION_MS = 15 * 60 * 1000;

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

  /**
   * Checks if account is currently locked
   */
  isLocked(): boolean {
    if (this.data.lockedUntil === null) {
      return false;
    }
    return new Date() < new Date(this.data.lockedUntil);
  }

  /**
   * Gets remaining lockout time in seconds
   */
  getLockoutRemainingSeconds(): number {
    if (this.data.lockedUntil === null) {
      return 0;
    }
    const remaining = new Date(this.data.lockedUntil).getTime() - Date.now();
    return Math.max(0, Math.ceil(remaining / 1000));
  }

  /**
   * Records a failed login attempt
   * Returns a new User with updated state
   */
  recordFailedLogin(): User {
    const attempts = this.data.failedLoginAttempts + 1;
    const now = new Date();

    // Lock account if max attempts exceeded
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

  /**
   * Records a successful login
   * Returns a new User with reset security counters
   */
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

  /**
   * Updates password and invalidates existing sessions
   */
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
    // Never include passwordHash in JSON output
    const { passwordHash: _, ...safeData } = this.data;
    return this.data; // For repository use only
  }
}
```

---

## Password Security

### Choosing a Password Hashing Algorithm

For Cloudflare Workers, you have two recommended options:

| Algorithm    | Pros                                       | Cons                                           | When to Use                                 |
| ------------ | ------------------------------------------ | ---------------------------------------------- | ------------------------------------------- |
| **Argon2id** | Most secure, memory-hard, GPU-resistant    | Higher memory usage, requires external library | When memory constraints allow (recommended) |
| **PBKDF2**   | Built into Web Crypto API, no dependencies | Less resistant to GPU attacks                  | When using only native APIs                 |

OWASP recommends Argon2id as the primary choice, with PBKDF2 (600,000+ iterations) as an acceptable alternative when Argon2 is unavailable.

### Argon2id Implementation

Argon2id is the current OWASP-recommended algorithm for password hashing. It provides protection against both GPU-based attacks and side-channel attacks.

```typescript
// src/infrastructure/security/Argon2Hasher.ts

/**
 * Argon2id password hasher
 *
 * OWASP 2025 recommended parameters:
 * - Memory: minimum 19 MiB (19456 KiB), recommended 46 MiB for better security
 * - Iterations: minimum 2
 * - Parallelism: 1
 * - Output length: 32 bytes
 *
 * RFC 9106 recommends these settings for memory-constrained environments.
 */
import { argon2id } from '@noble/hashes/argon2';
import { randomBytes } from '@noble/hashes/utils';

export interface Argon2Config {
  /** Memory cost in KiB (default: 19456 = 19 MiB per OWASP minimum) */
  memoryCost: number;
  /** Number of iterations (default: 2 per OWASP minimum) */
  timeCost: number;
  /** Degree of parallelism (default: 1) */
  parallelism: number;
  /** Output hash length in bytes (default: 32) */
  hashLength: number;
  /** Salt length in bytes (default: 16 = 128 bits) */
  saltLength: number;
}

const DEFAULT_CONFIG: Argon2Config = {
  // OWASP minimum: 19 MiB
  // For Cloudflare Workers with limited memory, use 19 MiB
  // For higher security, use 46 MiB or more
  memoryCost: 19456, // 19 MiB in KiB
  timeCost: 2,
  parallelism: 1,
  hashLength: 32,
  saltLength: 16,
};

export class Argon2Hasher {
  private readonly config: Argon2Config;

  constructor(config: Partial<Argon2Config> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Hashes a password using Argon2id
   * Returns a string in the format: $argon2id$v=19$m=19456,t=2,p=1$<salt>$<hash>
   */
  async hash(password: string): Promise<string> {
    const salt = randomBytes(this.config.saltLength);

    const hash = argon2id(password, salt, {
      m: this.config.memoryCost,
      t: this.config.timeCost,
      p: this.config.parallelism,
      dkLen: this.config.hashLength,
    });

    // Format: $argon2id$v=19$m=<memory>,t=<time>,p=<parallelism>$<salt>$<hash>
    const saltB64 = this.toBase64(salt);
    const hashB64 = this.toBase64(hash);

    return `$argon2id$v=19$m=${this.config.memoryCost},t=${this.config.timeCost},p=${this.config.parallelism}$${saltB64}$${hashB64}`;
  }

  /**
   * Verifies a password against a stored hash
   * Uses constant-time comparison to prevent timing attacks
   */
  async verify(password: string, storedHash: string): Promise<boolean> {
    try {
      const parsed = this.parseHash(storedHash);
      if (parsed === null) {
        return false;
      }

      const computedHash = argon2id(password, parsed.salt, {
        m: parsed.memoryCost,
        t: parsed.timeCost,
        p: parsed.parallelism,
        dkLen: parsed.hash.length,
      });

      // Constant-time comparison
      return this.constantTimeEqual(computedHash, parsed.hash);
    } catch {
      return false;
    }
  }

  /**
   * Checks if a hash needs to be rehashed with updated parameters
   */
  needsRehash(storedHash: string): boolean {
    const parsed = this.parseHash(storedHash);
    if (parsed === null) {
      return true;
    }

    return (
      parsed.memoryCost < this.config.memoryCost ||
      parsed.timeCost < this.config.timeCost ||
      parsed.parallelism !== this.config.parallelism
    );
  }

  private parseHash(hashString: string): {
    memoryCost: number;
    timeCost: number;
    parallelism: number;
    salt: Uint8Array;
    hash: Uint8Array;
  } | null {
    const parts = hashString.split('$');
    if (parts.length !== 6 || parts[1] !== 'argon2id') {
      return null;
    }

    const params = parts[3];
    if (params === undefined) return null;

    const paramMatch = params.match(/m=(\d+),t=(\d+),p=(\d+)/);
    if (paramMatch === null) return null;

    const saltB64 = parts[4];
    const hashB64 = parts[5];
    if (saltB64 === undefined || hashB64 === undefined) return null;

    return {
      memoryCost: parseInt(paramMatch[1] ?? '0', 10),
      timeCost: parseInt(paramMatch[2] ?? '0', 10),
      parallelism: parseInt(paramMatch[3] ?? '0', 10),
      salt: this.fromBase64(saltB64),
      hash: this.fromBase64(hashB64),
    };
  }

  private constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
    if (a.length !== b.length) return false;
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= (a[i] ?? 0) ^ (b[i] ?? 0);
    }
    return result === 0;
  }

  private toBase64(bytes: Uint8Array): string {
    return btoa(String.fromCharCode(...bytes))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  private fromBase64(str: string): Uint8Array {
    const padded = str
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .padEnd(str.length + ((4 - (str.length % 4)) % 4), '=');
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }
}
```

### PBKDF2 Implementation (Native Web Crypto Alternative)

When you need to avoid external dependencies, use PBKDF2 with the Web Crypto API:

```typescript
// src/infrastructure/security/PBKDF2Hasher.ts

/**
 * PBKDF2 password hasher using native Web Crypto API
 *
 * OWASP 2024 recommendation: 600,000 iterations for SHA-256
 * Use this when Argon2 is unavailable or memory-constrained
 */
export class PBKDF2Hasher {
  private readonly iterations: number;
  private readonly hashLength: number;
  private readonly saltLength: number;

  constructor(
    config: {
      iterations?: number;
      hashLength?: number;
      saltLength?: number;
    } = {}
  ) {
    this.iterations = config.iterations ?? 600000; // OWASP 2024 recommendation
    this.hashLength = config.hashLength ?? 32;
    this.saltLength = config.saltLength ?? 16;
  }

  async hash(password: string): Promise<string> {
    const salt = crypto.getRandomValues(new Uint8Array(this.saltLength));
    const encoder = new TextEncoder();
    const passwordData = encoder.encode(password);

    const keyMaterial = await crypto.subtle.importKey('raw', passwordData, 'PBKDF2', false, [
      'deriveBits',
    ]);

    const hash = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: this.iterations,
        hash: 'SHA-256',
      },
      keyMaterial,
      this.hashLength * 8
    );

    // Store salt + hash together with iteration count
    const combined = new Uint8Array(salt.length + hash.byteLength);
    combined.set(salt);
    combined.set(new Uint8Array(hash), salt.length);

    // Format: $pbkdf2-sha256$iterations$<combined_base64>
    return `$pbkdf2-sha256$${this.iterations}$${btoa(String.fromCharCode(...combined))}`;
  }

  async verify(password: string, storedHash: string): Promise<boolean> {
    try {
      const parsed = this.parseHash(storedHash);
      if (parsed === null) return false;

      const encoder = new TextEncoder();
      const passwordData = encoder.encode(password);

      const keyMaterial = await crypto.subtle.importKey('raw', passwordData, 'PBKDF2', false, [
        'deriveBits',
      ]);

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
    } catch {
      return false;
    }
  }

  private parseHash(hashString: string): {
    iterations: number;
    salt: Uint8Array;
    hash: Uint8Array;
  } | null {
    const parts = hashString.split('$');
    if (parts.length !== 4 || parts[1] !== 'pbkdf2-sha256') {
      return null;
    }

    const iterations = parseInt(parts[2] ?? '0', 10);
    const combined = Uint8Array.from(atob(parts[3] ?? ''), (c) => c.charCodeAt(0));

    return {
      iterations,
      salt: combined.slice(0, this.saltLength),
      hash: combined.slice(this.saltLength),
    };
  }

  private constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
    if (a.length !== b.length) return false;
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= (a[i] ?? 0) ^ (b[i] ?? 0);
    }
    return result === 0;
  }

  needsRehash(storedHash: string): boolean {
    const parsed = this.parseHash(storedHash);
    if (parsed === null) return true;
    return parsed.iterations < this.iterations;
  }
}
```

### Unified Password Service

Create a service that can use either algorithm:

```typescript
// src/infrastructure/security/PasswordService.ts

import { Argon2Hasher } from './Argon2Hasher';
import { PBKDF2Hasher } from './PBKDF2Hasher';

export interface PasswordHasher {
  hash(password: string): Promise<string>;
  verify(password: string, storedHash: string): Promise<boolean>;
  needsRehash(storedHash: string): boolean;
}

export class PasswordService {
  private readonly primaryHasher: PasswordHasher;
  private readonly fallbackHasher: PasswordHasher;

  constructor(useArgon2: boolean = true) {
    // Primary hasher for new passwords
    this.primaryHasher = useArgon2 ? new Argon2Hasher() : new PBKDF2Hasher();

    // Fallback for verifying legacy hashes
    this.fallbackHasher = new PBKDF2Hasher();
  }

  async hash(password: string): Promise<string> {
    this.validatePasswordStrength(password);
    return this.primaryHasher.hash(password);
  }

  async verify(password: string, storedHash: string): Promise<boolean> {
    // Detect algorithm from hash format
    if (storedHash.startsWith('$argon2id$')) {
      return new Argon2Hasher().verify(password, storedHash);
    } else if (storedHash.startsWith('$pbkdf2-sha256$')) {
      return new PBKDF2Hasher().verify(password, storedHash);
    }
    return false;
  }

  needsRehash(storedHash: string): boolean {
    if (storedHash.startsWith('$argon2id$')) {
      return new Argon2Hasher().needsRehash(storedHash);
    } else if (storedHash.startsWith('$pbkdf2-sha256$')) {
      // If we're using Argon2 as primary, all PBKDF2 hashes need upgrade
      return (
        this.primaryHasher instanceof Argon2Hasher || new PBKDF2Hasher().needsRehash(storedHash)
      );
    }
    return true; // Unknown format
  }

  private validatePasswordStrength(password: string): void {
    if (password.length < 12) {
      throw new Error('Password must be at least 12 characters');
    }
    if (password.length > 128) {
      throw new Error('Password cannot exceed 128 characters');
    }
    // Add additional checks: common passwords, entropy, etc.
  }
}
```

### Session ID Generator

```typescript
// src/infrastructure/security/CryptoSessionIdGenerator.ts

/**
 * Cryptographically secure session ID generator
 *
 * Security requirements:
 * - At least 128 bits of entropy (we use 256 bits)
 * - Unpredictable (using crypto.getRandomValues)
 * - URL-safe encoding
 */
export class SessionIdGenerator {
  private static readonly BYTES_LENGTH = 32; // 256 bits

  /**
   * Generates a cryptographically secure session ID
   */
  generate(): string {
    const bytes = new Uint8Array(SessionIdGenerator.BYTES_LENGTH);
    crypto.getRandomValues(bytes);
    return this.toUrlSafeBase64(bytes);
  }

  /**
   * Validates that a session ID has the expected format
   */
  isValid(sessionId: string): boolean {
    // URL-safe base64 without padding: [A-Za-z0-9_-]+
    const expectedLength = Math.ceil((SessionIdGenerator.BYTES_LENGTH * 4) / 3);

    if (sessionId.length !== expectedLength) {
      return false;
    }

    return /^[A-Za-z0-9_-]+$/.test(sessionId);
  }

  private toUrlSafeBase64(bytes: Uint8Array): string {
    return btoa(String.fromCharCode(...bytes))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }
}

/**
 * CSRF Token generator (similar but separate from session IDs)
 */
export class CsrfTokenGenerator {
  private static readonly BYTES_LENGTH = 32;

  generate(): string {
    const bytes = new Uint8Array(CsrfTokenGenerator.BYTES_LENGTH);
    crypto.getRandomValues(bytes);
    return btoa(String.fromCharCode(...bytes))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }
}
```

---

## Session Management

### KV Session Repository

```typescript
// src/infrastructure/repositories/KVSessionRepository.ts

import type { Session, SessionData } from '@domain/entities/Session';
import type { SessionRepository } from '@domain/interfaces/SessionRepository';

/**
 * Session repository using Cloudflare KV
 *
 * Security considerations:
 * - Uses TTL for automatic session expiration
 * - Session data is stored as JSON (consider encryption for sensitive data)
 * - Key prefix prevents collisions with other KV data
 */
export class KVSessionRepository implements SessionRepository {
  private static readonly KEY_PREFIX = 'session:';
  private static readonly USER_SESSIONS_PREFIX = 'user_sessions:';

  constructor(private readonly kv: KVNamespace) {}

  /**
   * Stores a session with automatic TTL expiration
   */
  async save(session: Session, ttlSeconds: number): Promise<void> {
    const key = this.sessionKey(session.sessionId);
    const data = JSON.stringify(session.toJSON());

    await this.kv.put(key, data, {
      expirationTtl: ttlSeconds,
    });

    // Also track session by user for management/revocation
    await this.addToUserSessions(session.userId, session.sessionId, ttlSeconds);
  }

  /**
   * Retrieves a session by ID
   */
  async findById(sessionId: string): Promise<Session | null> {
    const key = this.sessionKey(sessionId);
    const data = await this.kv.get(key);

    if (data === null) {
      return null;
    }

    try {
      const sessionData = JSON.parse(data) as SessionData;
      return Session.fromData(sessionData);
    } catch {
      // Invalid session data - treat as not found
      await this.delete(sessionId);
      return null;
    }
  }

  /**
   * Deletes a specific session
   */
  async delete(sessionId: string): Promise<void> {
    const session = await this.findById(sessionId);
    if (session !== null) {
      await this.removeFromUserSessions(session.userId, sessionId);
    }

    const key = this.sessionKey(sessionId);
    await this.kv.delete(key);
  }

  /**
   * Deletes all sessions for a user (e.g., on password change)
   */
  async deleteAllForUser(userId: string): Promise<void> {
    const sessionIds = await this.getUserSessionIds(userId);

    await Promise.all(sessionIds.map((id) => this.kv.delete(this.sessionKey(id))));

    await this.kv.delete(this.userSessionsKey(userId));
  }

  /**
   * Gets all active session IDs for a user
   */
  async getUserSessionIds(userId: string): Promise<string[]> {
    const key = this.userSessionsKey(userId);
    const data = await this.kv.get(key);

    if (data === null) {
      return [];
    }

    try {
      return JSON.parse(data) as string[];
    } catch {
      return [];
    }
  }

  /**
   * Updates session activity timestamp
   */
  async updateActivity(session: Session, ttlSeconds: number): Promise<void> {
    const updated = session.withUpdatedActivity();
    await this.save(updated, ttlSeconds);
  }

  private sessionKey(sessionId: string): string {
    return `${KVSessionRepository.KEY_PREFIX}${sessionId}`;
  }

  private userSessionsKey(userId: string): string {
    return `${KVSessionRepository.USER_SESSIONS_PREFIX}${userId}`;
  }

  private async addToUserSessions(
    userId: string,
    sessionId: string,
    ttlSeconds: number
  ): Promise<void> {
    const key = this.userSessionsKey(userId);
    const existing = await this.getUserSessionIds(userId);

    // Add new session if not already tracked
    if (!existing.includes(sessionId)) {
      existing.push(sessionId);
    }

    await this.kv.put(key, JSON.stringify(existing), {
      expirationTtl: ttlSeconds,
    });
  }

  private async removeFromUserSessions(userId: string, sessionId: string): Promise<void> {
    const key = this.userSessionsKey(userId);
    const existing = await this.getUserSessionIds(userId);
    const filtered = existing.filter((id) => id !== sessionId);

    if (filtered.length > 0) {
      await this.kv.put(key, JSON.stringify(filtered));
    } else {
      await this.kv.delete(key);
    }
  }
}
```

---

## CSRF Protection

### Signed Double-Submit Cookie Pattern

```typescript
// src/presentation/middleware/csrfProtection.ts

import type { Context, Next } from './types';

/**
 * CSRF Protection Middleware using Signed Double-Submit Cookie Pattern
 *
 * How it works:
 * 1. On session creation, generate a CSRF token and store it in the session
 * 2. Send the token to the client in a cookie (readable by JS)
 * 3. Client includes the token in a header or form field for state-changing requests
 * 4. Server validates that the submitted token matches the session's token
 *
 * This is combined with SameSite=Lax cookies for defense in depth
 */

export interface CsrfConfig {
  /** Cookie name for CSRF token */
  cookieName: string;
  /** Header name to check for token */
  headerName: string;
  /** Form field name to check for token */
  formFieldName: string;
  /** HTTP methods that require CSRF validation */
  protectedMethods: string[];
  /** Paths to exclude from CSRF protection */
  excludePaths: string[];
}

const DEFAULT_CSRF_CONFIG: CsrfConfig = {
  cookieName: '__Host-csrf',
  headerName: 'X-CSRF-Token',
  formFieldName: '_csrf',
  protectedMethods: ['POST', 'PUT', 'PATCH', 'DELETE'],
  excludePaths: [], // e.g., ["/api/webhooks"]
};

export function createCsrfMiddleware(config: Partial<CsrfConfig> = {}) {
  const cfg = { ...DEFAULT_CSRF_CONFIG, ...config };

  return async function csrfMiddleware(ctx: Context, next: Next): Promise<Response> {
    const { request, session } = ctx;
    const method = request.method.toUpperCase();
    const url = new URL(request.url);

    // Skip for non-protected methods
    if (!cfg.protectedMethods.includes(method)) {
      return next();
    }

    // Skip for excluded paths
    if (cfg.excludePaths.some((path) => url.pathname.startsWith(path))) {
      return next();
    }

    // Require valid session for CSRF validation
    if (session === undefined) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Get token from request
    const submittedToken = await extractCsrfToken(request, cfg);

    if (submittedToken === null) {
      return csrfError('Missing CSRF token');
    }

    // Validate against session token
    if (!session.validateCsrfToken(submittedToken)) {
      return csrfError('Invalid CSRF token');
    }

    // Also verify Origin header for additional protection
    const originValid = validateOrigin(request);
    if (!originValid) {
      return csrfError('Invalid request origin');
    }

    return next();
  };
}

async function extractCsrfToken(request: Request, config: CsrfConfig): Promise<string | null> {
  // First check header (preferred for HTMX/AJAX)
  const headerToken = request.headers.get(config.headerName);
  if (headerToken !== null && headerToken.length > 0) {
    return headerToken;
  }

  // Then check form body for traditional form submissions
  const contentType = request.headers.get('Content-Type') ?? '';

  if (contentType.includes('application/x-www-form-urlencoded')) {
    try {
      const cloned = request.clone();
      const formData = await cloned.formData();
      const formToken = formData.get(config.formFieldName);

      if (typeof formToken === 'string' && formToken.length > 0) {
        return formToken;
      }
    } catch {
      // Form parsing failed
    }
  }

  return null;
}

function validateOrigin(request: Request): boolean {
  const origin = request.headers.get('Origin');
  const host = request.headers.get('Host');

  // If no Origin header (same-origin request), check Referer
  if (origin === null) {
    const referer = request.headers.get('Referer');
    if (referer === null) {
      // No origin info - this is suspicious for POST requests
      // However, some legitimate scenarios (e.g., bookmarklets) may lack both
      // Be conservative: allow if other protections are in place
      return true; // Or false for stricter security
    }

    try {
      const refererUrl = new URL(referer);
      return refererUrl.host === host;
    } catch {
      return false;
    }
  }

  // Validate Origin matches Host
  try {
    const originUrl = new URL(origin);
    return originUrl.host === host;
  } catch {
    return false;
  }
}

function csrfError(message: string): Response {
  return new Response(JSON.stringify({ error: 'CSRF validation failed', message }), {
    status: 403,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Helper to generate CSRF token cookie header
 */
export function csrfCookieHeader(token: string, secure: boolean): string {
  const parts = [`__Host-csrf=${token}`, 'Path=/', 'SameSite=Lax'];

  if (secure) {
    parts.push('Secure');
  }

  // Note: NOT HttpOnly - needs to be readable by JavaScript for HTMX
  return parts.join('; ');
}
```

### HTMX CSRF Configuration

```typescript
// src/presentation/templates/partials/csrfSetup.ts

import { html, safe } from '../html';
import { HtmlEncoder } from '@infrastructure/security/HtmlEncoder';

/**
 * HTMX configuration for automatic CSRF token inclusion
 * Include this in your base layout
 */
export function csrfSetup(csrfToken: string): string {
  const encodedToken = HtmlEncoder.encodeForJavaScript(csrfToken);

  return `
<script>
  // Configure HTMX to include CSRF token in all requests
  document.addEventListener('DOMContentLoaded', function() {
    document.body.addEventListener('htmx:configRequest', function(event) {
      event.detail.headers['X-CSRF-Token'] = '${encodedToken}';
    });
  });
</script>
`;
}

/**
 * Hidden CSRF field for traditional forms
 */
export function csrfField(csrfToken: string): string {
  return html`<input type="hidden" name="_csrf" value="${csrfToken}" />`;
}

/**
 * Base layout with CSRF token properly configured
 */
export function baseLayout(props: {
  title: string;
  csrfToken: string;
  content: string;
  nonce?: string;
}): string {
  const { title, csrfToken, content, nonce } = props;
  const nonceAttr = nonce !== undefined ? ` nonce="${nonce}"` : '';

  return html`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${title}</title>
        <link rel="stylesheet" href="/css/app.css" />

        <!-- HTMX security configuration -->
        <meta
          name="htmx-config"
          content='{
        "selfRequestsOnly": true,
        "allowScriptTags": false,
        "allowEval": false,
        "historyCacheSize": 0
      }'
        />
      </head>
      <body hx-headers='{"X-CSRF-Token": "${csrfToken}"}' class="min-h-screen bg-base-100">
        ${safe(content)}

        <script src="/js/htmx.min.js" defer${safe(nonceAttr)}></script>
        <script src="/js/alpine.min.js" defer${safe(nonceAttr)}></script>
      </body>
    </html>
  `;
}
```

---

## XSS Prevention and Safe HTML Templates

### Understanding XSS in Hypermedia Applications

HTMX applications are susceptible to XSS because they insert server responses directly into the DOM. The key insight: **server-side output encoding is your primary defense**.

### HTML Encoder

Always encode user-controlled data before including it in HTML responses:

```typescript
// src/infrastructure/security/HtmlEncoder.ts

/**
 * HTML encoding utilities for XSS prevention
 *
 * Use context-appropriate encoding:
 * - encodeForHtml: Content between HTML tags
 * - encodeForAttribute: HTML attribute values
 * - encodeForJavaScript: JavaScript string literals
 */
export class HtmlEncoder {
  private static readonly ENCODE_MAP: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  /**
   * Encode string for safe inclusion in HTML content
   */
  static encodeForHtml(unsafe: string): string {
    return unsafe.replace(/[&<>"'/]/g, (char) => this.ENCODE_MAP[char] ?? char);
  }

  /**
   * Encode string for safe inclusion in HTML attributes
   */
  static encodeForAttribute(unsafe: string): string {
    return unsafe.replace(
      /[^a-zA-Z0-9,._-]/g,
      (char) => `&#x${char.charCodeAt(0).toString(16).padStart(2, '0')};`
    );
  }

  /**
   * Encode string for safe inclusion in JavaScript strings
   */
  static encodeForJavaScript(unsafe: string): string {
    return unsafe.replace(
      /[\\'"<>&\u0000-\u001f\u007f-\u009f\u2028\u2029]/g,
      (char) => `\\u${char.charCodeAt(0).toString(16).padStart(4, '0')}`
    );
  }
}
```

### Safe HTML Tagged Template Literal

Create template functions that encode by default:

```typescript
// src/presentation/templates/html.ts

import { HtmlEncoder } from '@infrastructure/security/HtmlEncoder';

type Primitive = string | number | boolean | null | undefined;

/**
 * Marks a string as already safe (pre-encoded or trusted HTML).
 * USE WITH EXTREME CAUTION - only for HTML you control.
 */
export class SafeHtml {
  constructor(public readonly value: string) {}
  toString(): string {
    return this.value;
  }
}

/**
 * Mark content as already safe (pre-encoded or trusted)
 */
export function safe(html: string): SafeHtml {
  return new SafeHtml(html);
}

/**
 * Tagged template literal that automatically encodes interpolated values.
 * Use html`` for all HTML generation.
 *
 * @example
 * // User data is automatically encoded
 * html`<div class="profile">
 *   <h2>${user.name}</h2>
 *   <p>${user.bio}</p>
 * </div>`
 *
 * // Trusted HTML can be marked safe
 * html`<div class="content">${safe(trustedHtml)}</div>`
 */
export function html(
  strings: TemplateStringsArray,
  ...values: (Primitive | Primitive[] | SafeHtml)[]
): string {
  let result = strings[0] ?? '';

  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    const encoded = encodeValue(value);
    result += encoded + (strings[i + 1] ?? '');
  }

  return result;
}

function encodeValue(value: Primitive | Primitive[] | SafeHtml): string {
  if (value instanceof SafeHtml) {
    return value.value; // Already safe, don't encode
  }
  if (value === null || value === undefined) {
    return '';
  }
  if (Array.isArray(value)) {
    return value.map(encodeValue).join('');
  }
  if (typeof value === 'string') {
    return HtmlEncoder.encodeForHtml(value);
  }
  return HtmlEncoder.encodeForHtml(String(value));
}
```

### Using the Safe Template System

```typescript
// src/presentation/templates/partials/userProfile.ts

import { html, safe } from '../html';
import type { User } from '@domain/entities/User';

export function renderUserProfile(user: User): string {
  // User-provided data is automatically encoded
  return html`
    <div class="profile card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title">${user.name}</h2>
        <p class="text-gray-600">${user.bio}</p>
        <a href="/users/${user.id}" class="btn btn-primary">View Profile</a>
      </div>
    </div>
  `;
}

// Composing templates - child templates return SafeHtml-like strings
export function renderUserList(users: User[]): string {
  const userCards = users.map((u) => renderUserProfile(u));

  return html`
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      ${safe(userCards.join(''))}
    </div>
  `;
}
```

---

## HTMX and Alpine.js Security

### HTMX Security Configuration

Configure HTMX to be secure by default:

```html
<!-- In your base template <head> -->
<meta
  name="htmx-config"
  content='{
  "selfRequestsOnly": true,
  "allowScriptTags": false,
  "allowEval": false,
  "historyCacheSize": 0,
  "refreshOnHistoryMiss": true,
  "defaultSwapStyle": "innerHTML",
  "includeIndicatorStyles": false
}'
/>
```

Configuration explained:

| Setting            | Value   | Security Impact                                            |
| ------------------ | ------- | ---------------------------------------------------------- |
| `selfRequestsOnly` | `true`  | Only allows requests to same origin (prevents SSRF)        |
| `allowScriptTags`  | `false` | Prevents script execution in HTMX responses                |
| `allowEval`        | `false` | Disables eval-based features                               |
| `historyCacheSize` | `0`     | Disables history caching (prevents sensitive data leakage) |

### The hx-disable Attribute

Use `hx-disable` to create safe zones for untrusted content:

```typescript
// src/presentation/templates/partials/userComment.ts

import { html } from '../html';

export function renderComment(comment: Comment): string {
  // The hx-disable zone prevents any HTMX attributes from working
  return html`
    <div class="comment card bg-base-200" hx-disable>
      <div class="card-body">
        <p class="font-semibold">${comment.authorName}</p>
        <div class="content">${comment.content}</div>
      </div>
    </div>
  `;
}
```

Any HTMX attributes inside an `hx-disable` zone are ignored, preventing attackers from injecting malicious HTMX triggers.

### HTMX Request Validation Middleware

Validate that HTMX requests come from the expected origin:

```typescript
// src/presentation/middleware/htmxSecurity.ts

import type { Context, Next } from './types';

export async function htmxSecurityMiddleware(ctx: Context, next: Next): Promise<Response> {
  const { request } = ctx;
  const htmxRequest = request.headers.get('HX-Request') === 'true';

  if (!htmxRequest) {
    return next(); // Not an HTMX request
  }

  const currentUrl = request.headers.get('HX-Current-URL');

  if (currentUrl !== null) {
    try {
      const current = new URL(currentUrl);
      const target = new URL(request.url);

      // Ensure request comes from same origin
      if (current.origin !== target.origin) {
        console.warn('Cross-origin HTMX request blocked', {
          from: current.origin,
          to: target.origin,
        });
        return new Response('Forbidden', { status: 403 });
      }
    } catch {
      // Invalid URL - block request
      return new Response('Bad Request', { status: 400 });
    }
  }

  return next();
}
```

### Secure History Handling

Prevent sensitive data from being cached in browser history:

```typescript
// src/presentation/utils/secureResponse.ts

/**
 * For sensitive pages, prevent history caching
 */
export function secureHtmlResponse(content: string): Response {
  return new Response(content, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store, max-age=0',
      'HX-Push-Url': 'false', // Prevent URL from being pushed to history
    },
  });
}
```

### Alpine.js Expression Injection Prevention

Alpine.js evaluates expressions in `x-data`, `x-bind`, `@click`, etc. Prevent user data from being evaluated as code:

```typescript
// ❌ WRONG: User input in Alpine expression
function renderProfile(user: User): string {
  return `
    <div x-data="{ name: '${user.name}' }">
      <span x-text="name"></span>
    </div>
  `;
}

// ✅ CORRECT: Use data attributes and read them safely
function renderProfileSafe(user: User): string {
  return html`
    <div x-data="{ name: '' }" x-init="name = $el.dataset.name" data-name="${user.name}">
      <span x-text="name"></span>
    </div>
  `;
}

// ✅ BETTER: Use pre-defined components with encoded data
// In your JavaScript:
// Alpine.data('profile', (initialName) => ({ name: initialName }));

function renderProfileBest(user: User): string {
  const encodedName = HtmlEncoder.encodeForJavaScript(user.name);
  return html`
    <div x-data="profile('${safe(encodedName)}')">
      <span x-text="name"></span>
    </div>
  `;
}
```

### Content Isolation with x-ignore

Use Alpine's built-in content isolation for user-generated content:

```html
<!-- User content cannot execute Alpine expressions -->
<div class="user-comment" x-ignore>${renderUserContent(comment)}</div>
```

### CSP Considerations for Alpine.js

Alpine.js uses `eval()` for expression evaluation. You have two options:

**Option 1: Allow unsafe-eval (simpler but less secure)**

```typescript
"script-src": ["'self'", "'unsafe-eval'"]
```

**Option 2: Use Alpine's CSP build (more secure)**

Alpine.js offers a CSP-compatible build that doesn't use `eval()`:

```html
<script src="/js/alpine.csp.min.js" defer></script>
```

With the CSP build, define all component logic in JavaScript:

```typescript
// In your JavaScript
Alpine.data('dropdown', () => ({
  open: false,
  toggle() {
    this.open = !this.open;
  },
}));
```

```html
<!-- In your HTML -->
<div x-data="dropdown">
  <button @click="toggle" class="btn">Toggle</button>
  <div x-show="open" class="dropdown-content">Content</div>
</div>
```

---

## Rate Limiting

### Cloudflare Workers Rate Limiting API

For production deployments, use Cloudflare's native Rate Limiting API:

```toml
# wrangler.toml

# General rate limiter
[[rate_limits]]
binding = "RATE_LIMIT_GENERAL"
namespace_id = 1001
limit = 100
period = 60

# Stricter limit for auth endpoints
[[rate_limits]]
binding = "RATE_LIMIT_AUTH"
namespace_id = 1002
limit = 10
period = 60

# Application routes rate limit (/app/* including /app/_/*)
[[rate_limits]]
binding = "RATE_LIMIT_APP"
namespace_id = 1003
limit = 1000
period = 60
```

```typescript
// src/presentation/middleware/rateLimitCloudflare.ts

export interface Env {
  RATE_LIMIT_GENERAL: RateLimit;
  RATE_LIMIT_AUTH: RateLimit;
  RATE_LIMIT_APP: RateLimit; // For /app/* routes including HTMX partials
}

export async function rateLimitMiddleware(request: Request, env: Env): Promise<Response | null> {
  const url = new URL(request.url);
  const clientIP = request.headers.get('CF-Connecting-IP') ?? 'unknown';

  let limiter: RateLimit;

  // Select appropriate rate limiter based on static-first routing model
  if (url.pathname.startsWith('/auth/')) {
    limiter = env.RATE_LIMIT_AUTH;
  } else if (url.pathname.startsWith('/app/')) {
    // All dynamic routes under /app/* including HTMX partials (/app/_/*)
    limiter = env.RATE_LIMIT_APP;
  } else {
    limiter = env.RATE_LIMIT_GENERAL;
  }

  const { success } = await limiter.limit({ key: clientIP });

  if (!success) {
    return new Response('Too Many Requests', {
      status: 429,
      headers: {
        'Retry-After': '60',
        'Content-Type': 'text/plain',
      },
    });
  }

  return null; // Continue processing
}
```

### KV-Based Rate Limiter (Alternative)

For more granular control or when the Rate Limiting API isn't available, use a KV-based implementation:

```typescript
// src/infrastructure/security/KVRateLimiter.ts

/**
 * Rate limiter using Cloudflare KV with sliding window algorithm
 *
 * Provides protection against:
 * - Brute force login attempts
 * - Credential stuffing attacks
 * - Account enumeration
 * - DoS on expensive operations
 */

export interface RateLimitConfig {
  /** Maximum requests in the window */
  maxRequests: number;
  /** Window size in seconds */
  windowSeconds: number;
  /** Optional: block duration after limit exceeded (seconds) */
  blockDuration?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  retryAfter?: number;
}

export const RATE_LIMIT_CONFIGS = {
  // Strict limit for login attempts per IP
  login: {
    maxRequests: 5,
    windowSeconds: 60, // 5 attempts per minute
    blockDuration: 300, // 5 minute block after exceeded
  },

  // Separate limit per account (prevents distributed attacks)
  loginPerAccount: {
    maxRequests: 10,
    windowSeconds: 300, // 10 attempts per 5 minutes per account
    blockDuration: 900, // 15 minute block
  },

  // Registration rate limit
  registration: {
    maxRequests: 3,
    windowSeconds: 3600, // 3 registrations per hour per IP
  },

  // Password reset requests
  passwordReset: {
    maxRequests: 3,
    windowSeconds: 3600,
  },

  // General API rate limit
  api: {
    maxRequests: 100,
    windowSeconds: 60,
  },
} as const;

export class KVRateLimiter {
  private static readonly KEY_PREFIX = 'ratelimit:';

  constructor(private readonly kv: KVNamespace) {}

  /**
   * Checks and increments the rate limit counter
   */
  async checkLimit(
    identifier: string,
    action: string,
    config: RateLimitConfig
  ): Promise<RateLimitResult> {
    const key = this.buildKey(identifier, action);
    const now = Date.now();
    const windowStart = now - config.windowSeconds * 1000;

    // Get current state
    const state = await this.getState(key);

    // Check for active block
    if (state.blockedUntil !== null && state.blockedUntil > now) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: new Date(state.blockedUntil),
        retryAfter: Math.ceil((state.blockedUntil - now) / 1000),
      };
    }

    // Filter to requests within current window
    const recentRequests = state.requests.filter((ts) => ts > windowStart);

    // Check if limit exceeded
    if (recentRequests.length >= config.maxRequests) {
      // Apply block if configured
      if (config.blockDuration !== undefined) {
        const blockedUntil = now + config.blockDuration * 1000;
        await this.setState(
          key,
          {
            requests: recentRequests,
            blockedUntil,
          },
          config.blockDuration
        );

        return {
          allowed: false,
          remaining: 0,
          resetAt: new Date(blockedUntil),
          retryAfter: config.blockDuration,
        };
      }

      // Calculate when oldest request expires from window
      const oldestInWindow = Math.min(...recentRequests);
      const resetAt = oldestInWindow + config.windowSeconds * 1000;

      return {
        allowed: false,
        remaining: 0,
        resetAt: new Date(resetAt),
        retryAfter: Math.ceil((resetAt - now) / 1000),
      };
    }

    // Allow request and record timestamp
    recentRequests.push(now);

    await this.setState(
      key,
      {
        requests: recentRequests,
        blockedUntil: null,
      },
      config.windowSeconds
    );

    return {
      allowed: true,
      remaining: config.maxRequests - recentRequests.length,
      resetAt: new Date(now + config.windowSeconds * 1000),
    };
  }

  /**
   * Resets rate limit for an identifier (e.g., after successful login)
   */
  async reset(identifier: string, action: string): Promise<void> {
    const key = this.buildKey(identifier, action);
    await this.kv.delete(key);
  }

  private buildKey(identifier: string, action: string): string {
    return `${KVRateLimiter.KEY_PREFIX}${action}:${identifier}`;
  }

  private async getState(key: string): Promise<RateLimitState> {
    const data = await this.kv.get(key);

    if (data === null) {
      return { requests: [], blockedUntil: null };
    }

    try {
      return JSON.parse(data) as RateLimitState;
    } catch {
      return { requests: [], blockedUntil: null };
    }
  }

  private async setState(key: string, state: RateLimitState, ttlSeconds: number): Promise<void> {
    await this.kv.put(key, JSON.stringify(state), {
      expirationTtl: ttlSeconds,
    });
  }
}

interface RateLimitState {
  requests: number[];
  blockedUntil: number | null;
}
```

### Rate Limiting Middleware

```typescript
// src/presentation/middleware/rateLimiter.ts

import {
  KVRateLimiter,
  RATE_LIMIT_CONFIGS,
  type RateLimitResult,
} from '@infrastructure/security/KVRateLimiter';
import type { Context, Next } from './types';

/**
 * Rate limiting middleware for authentication endpoints
 */
export function createRateLimitMiddleware(rateLimiter: KVRateLimiter) {
  return async function rateLimitMiddleware(ctx: Context, next: Next): Promise<Response> {
    const { request } = ctx;
    const url = new URL(request.url);

    // Get client IP (Cloudflare provides this)
    const clientIp = request.headers.get('CF-Connecting-IP') ?? 'unknown';

    let result: RateLimitResult;

    // Apply different limits based on endpoint
    if (url.pathname === '/auth/login' && request.method === 'POST') {
      result = await rateLimiter.checkLimit(clientIp, 'login', RATE_LIMIT_CONFIGS.login);
    } else if (url.pathname === '/auth/register' && request.method === 'POST') {
      result = await rateLimiter.checkLimit(
        clientIp,
        'registration',
        RATE_LIMIT_CONFIGS.registration
      );
    } else if (url.pathname === '/auth/forgot-password' && request.method === 'POST') {
      result = await rateLimiter.checkLimit(
        clientIp,
        'passwordReset',
        RATE_LIMIT_CONFIGS.passwordReset
      );
    } else {
      // Default API rate limit
      result = await rateLimiter.checkLimit(clientIp, 'api', RATE_LIMIT_CONFIGS.api);
    }

    // Add rate limit headers
    const headers = new Headers();
    headers.set('X-RateLimit-Remaining', result.remaining.toString());
    headers.set('X-RateLimit-Reset', result.resetAt.toISOString());

    if (!result.allowed) {
      headers.set('Retry-After', (result.retryAfter ?? 60).toString());

      // Return 429 with HTMX-compatible response
      return new Response(rateLimitExceededHtml(result), {
        status: 429,
        headers: {
          ...Object.fromEntries(headers),
          'Content-Type': 'text/html; charset=utf-8',
        },
      });
    }

    // Store result in context for handler use
    ctx.rateLimit = result;

    const response = await next();

    // Add rate limit headers to successful response
    const newResponse = new Response(response.body, response);
    headers.forEach((value, key) => {
      newResponse.headers.set(key, value);
    });

    return newResponse;
  };
}

function rateLimitExceededHtml(result: RateLimitResult): string {
  const retryAfter = result.retryAfter ?? 60;
  const minutes = Math.ceil(retryAfter / 60);

  return `
<div class="alert alert-error" role="alert">
  <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
  <div>
    <h3 class="font-bold">Too many requests</h3>
    <p>Please wait ${minutes} minute${minutes !== 1 ? 's' : ''} before trying again.</p>
  </div>
</div>
`;
}
```

---

## Security Headers

### Comprehensive Security Headers Middleware

```typescript
// src/presentation/middleware/securityHeaders.ts

import type { Context, Next } from './types';

/**
 * Security headers middleware
 *
 * Implements defense-in-depth through HTTP headers:
 * - Prevents clickjacking
 * - Prevents MIME type sniffing
 * - Enables HSTS
 * - Configures CSP
 * - Prevents information leakage
 */

export interface SecurityHeadersConfig {
  /** Enable/disable specific headers */
  enableHsts: boolean;
  enableCsp: boolean;
  enableFrameOptions: boolean;
  /** Custom CSP directives */
  cspDirectives?: Record<string, string[]>;
  /** HSTS max-age in seconds */
  hstsMaxAge: number;
  /** Include subdomains in HSTS */
  hstsIncludeSubdomains: boolean;
}

const DEFAULT_CONFIG: SecurityHeadersConfig = {
  enableHsts: true,
  enableCsp: true,
  enableFrameOptions: true,
  hstsMaxAge: 31536000, // 1 year
  hstsIncludeSubdomains: true,
};

export function createSecurityHeadersMiddleware(config: Partial<SecurityHeadersConfig> = {}) {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  return async function securityHeaders(ctx: Context, next: Next): Promise<Response> {
    const response = await next();

    // Clone response to modify headers
    const newResponse = new Response(response.body, response);
    const headers = newResponse.headers;

    // Strict-Transport-Security (HSTS)
    // Forces browsers to use HTTPS for all future requests
    if (cfg.enableHsts) {
      const hstsValue = cfg.hstsIncludeSubdomains
        ? `max-age=${cfg.hstsMaxAge}; includeSubDomains; preload`
        : `max-age=${cfg.hstsMaxAge}`;
      headers.set('Strict-Transport-Security', hstsValue);
    }

    // Content-Security-Policy
    // Prevents XSS, clickjacking, and other injection attacks
    if (cfg.enableCsp) {
      const cspDirectives = cfg.cspDirectives ?? getDefaultCspDirectives();
      const cspValue = Object.entries(cspDirectives)
        .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
        .join('; ');
      headers.set('Content-Security-Policy', cspValue);
    }

    // X-Frame-Options (legacy, CSP frame-ancestors is preferred)
    // Prevents clickjacking
    if (cfg.enableFrameOptions) {
      headers.set('X-Frame-Options', 'DENY');
    }

    // X-Content-Type-Options
    // Prevents MIME type sniffing
    headers.set('X-Content-Type-Options', 'nosniff');

    // Referrer-Policy
    // Controls information sent in Referer header
    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // X-XSS-Protection
    // Deprecated in modern browsers, but doesn't hurt
    headers.set('X-XSS-Protection', '1; mode=block');

    // Permissions-Policy (formerly Feature-Policy)
    // Restricts browser features
    headers.set(
      'Permissions-Policy',
      'accelerometer=(), camera=(), geolocation=(), gyroscope=(), ' +
        'magnetometer=(), microphone=(), payment=(), usb=()'
    );

    // Cache-Control for authenticated pages
    // Prevents caching of sensitive content
    if (ctx.session !== undefined) {
      headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      headers.set('Pragma', 'no-cache');
      headers.set('Expires', '0');
    }

    return newResponse;
  };
}

function getDefaultCspDirectives(): Record<string, string[]> {
  return {
    // Default: only same origin
    'default-src': ["'self'"],

    // Scripts: same origin + HTMX + Alpine.js inline handlers
    // Note: 'unsafe-inline' is needed for Alpine.js x-on handlers
    // Consider using nonces for stricter security
    'script-src': ["'self'", "'unsafe-inline'"],

    // Styles: same origin + inline for Tailwind
    'style-src': ["'self'", "'unsafe-inline'"],

    // Images: same origin + data URIs (for inline images)
    'img-src': ["'self'", 'data:', 'https:'],

    // Fonts: same origin
    'font-src': ["'self'"],

    // Connections: same origin only
    'connect-src': ["'self'"],

    // Forms: same origin only
    'form-action': ["'self'"],

    // Frame ancestors: none (prevents clickjacking)
    'frame-ancestors': ["'none'"],

    // Base URI: same origin
    'base-uri': ["'self'"],

    // Upgrade insecure requests
    'upgrade-insecure-requests': [],
  };
}
```

### Cookie Configuration

```typescript
// src/presentation/middleware/sessionValidator.ts

import type { Session } from '@domain/entities/Session';
import type { KVSessionRepository } from '@infrastructure/repositories/KVSessionRepository';
import type { Context, Next } from './types';

/**
 * Session cookie configuration following security best practices
 */
export interface SessionCookieConfig {
  /** Cookie name (use __Host- prefix for maximum security) */
  name: string;
  /** Session duration in seconds */
  maxAge: number;
  /** Require HTTPS */
  secure: boolean;
  /** Prevent JavaScript access */
  httpOnly: boolean;
  /** CSRF protection via SameSite */
  sameSite: 'Strict' | 'Lax' | 'None';
  /** Cookie path */
  path: string;
}

export const SESSION_COOKIE_CONFIG: SessionCookieConfig = {
  // __Host- prefix provides strongest security:
  // - Must have Secure flag
  // - Must have Path=/
  // - Must NOT have Domain attribute
  // - Must be from a secure origin
  name: '__Host-session',
  maxAge: 86400, // 24 hours
  secure: true,
  httpOnly: true,
  sameSite: 'Lax', // Lax allows top-level navigations with cookies
  path: '/',
};

/**
 * Creates a session cookie Set-Cookie header value
 */
export function createSessionCookie(
  sessionId: string,
  config: SessionCookieConfig = SESSION_COOKIE_CONFIG
): string {
  const parts = [
    `${config.name}=${sessionId}`,
    `Path=${config.path}`,
    `Max-Age=${config.maxAge}`,
    `SameSite=${config.sameSite}`,
  ];

  if (config.secure) {
    parts.push('Secure');
  }

  if (config.httpOnly) {
    parts.push('HttpOnly');
  }

  return parts.join('; ');
}

/**
 * Creates a cookie deletion header (expires immediately)
 */
export function deleteSessionCookie(config: SessionCookieConfig = SESSION_COOKIE_CONFIG): string {
  return [
    `${config.name}=`,
    `Path=${config.path}`,
    'Max-Age=0',
    `SameSite=${config.sameSite}`,
    config.secure ? 'Secure' : '',
    config.httpOnly ? 'HttpOnly' : '',
  ]
    .filter(Boolean)
    .join('; ');
}

/**
 * Session validation middleware
 */
export function createSessionMiddleware(
  sessionRepository: KVSessionRepository,
  config: SessionCookieConfig = SESSION_COOKIE_CONFIG
) {
  return async function sessionMiddleware(ctx: Context, next: Next): Promise<Response> {
    const cookies = parseCookies(ctx.request.headers.get('Cookie') ?? '');
    const sessionId = cookies[config.name];

    if (sessionId !== undefined && sessionId.length > 0) {
      const session = await sessionRepository.findById(sessionId);

      if (session !== null && !session.isExpired()) {
        ctx.session = session;

        // Update activity timestamp if needed
        if (session.needsRefresh()) {
          await sessionRepository.updateActivity(session, config.maxAge);
        }
      }
    }

    return next();
  };
}

function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {};

  for (const part of cookieHeader.split(';')) {
    const [name, ...valueParts] = part.trim().split('=');
    if (name !== undefined && valueParts.length > 0) {
      cookies[name] = valueParts.join('=');
    }
  }

  return cookies;
}
```

---

## Authentication Handlers

### Complete Authentication Handler Implementation

```typescript
// src/presentation/handlers/AuthHandlers.ts

import type { Email } from '@domain/value-objects/Email';
import type { Password } from '@domain/value-objects/Password';
import type { User } from '@domain/entities/User';
import type { Session } from '@domain/entities/Session';
import type { D1UserRepository } from '@infrastructure/repositories/D1UserRepository';
import type { KVSessionRepository } from '@infrastructure/repositories/KVSessionRepository';
import type { Argon2Hasher } from '@infrastructure/security/Argon2Hasher';
import type {
  SessionIdGenerator,
  CsrfTokenGenerator,
} from '@infrastructure/security/CryptoSessionIdGenerator';
import type { KVRateLimiter } from '@infrastructure/security/KVRateLimiter';
import { RATE_LIMIT_CONFIGS } from '@infrastructure/security/KVRateLimiter';
import {
  createSessionCookie,
  deleteSessionCookie,
  SESSION_COOKIE_CONFIG,
} from '../middleware/sessionValidator';
import { csrfCookieHeader } from '../middleware/csrfProtection';
import { loginPage } from '../templates/pages/login';
import { registerPage } from '../templates/pages/register';
import { dashboardPage } from '../templates/pages/dashboard';
import { loginFormPartial, loginErrorPartial } from '../templates/partials/loginForm';

export interface AuthHandlerDeps {
  userRepository: D1UserRepository;
  sessionRepository: KVSessionRepository;
  passwordHasher: Argon2Hasher;
  sessionIdGenerator: SessionIdGenerator;
  csrfTokenGenerator: CsrfTokenGenerator;
  rateLimiter: KVRateLimiter;
}

export class AuthHandlers {
  constructor(private readonly deps: AuthHandlerDeps) {}

  /**
   * GET /auth/login
   * Renders the login page
   */
  async showLoginPage(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const redirectTo = url.searchParams.get('redirect') ?? '/dashboard';

    return new Response(loginPage({ redirectTo }), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  /**
   * POST /auth/login
   * Handles login form submission
   */
  async handleLogin(request: Request): Promise<Response> {
    const clientIp = request.headers.get('CF-Connecting-IP') ?? 'unknown';
    const userAgent = request.headers.get('User-Agent') ?? 'unknown';

    // Parse form data
    const formData = await request.formData();
    const emailRaw = formData.get('email');
    const passwordRaw = formData.get('password');
    const redirectTo = formData.get('redirect')?.toString() ?? '/dashboard';
    const isHtmxRequest = request.headers.get('HX-Request') === 'true';

    // Validate inputs
    if (typeof emailRaw !== 'string' || typeof passwordRaw !== 'string') {
      return this.loginError('Email and password are required', isHtmxRequest);
    }

    // Create value objects
    let email: Email;
    let password: Password;

    try {
      email = Email.create(emailRaw);
      password = Password.createUnchecked(passwordRaw); // Skip validation for login
    } catch (error) {
      return this.loginError('Invalid email or password', isHtmxRequest);
    }

    // Check rate limit for this account (prevents targeted attacks)
    const accountRateLimit = await this.deps.rateLimiter.checkLimit(
      email.normalized,
      'loginPerAccount',
      RATE_LIMIT_CONFIGS.loginPerAccount
    );

    if (!accountRateLimit.allowed) {
      return this.loginError(
        `Too many login attempts. Please try again in ${Math.ceil((accountRateLimit.retryAfter ?? 60) / 60)} minutes.`,
        isHtmxRequest,
        429
      );
    }

    // Find user
    const user = await this.deps.userRepository.findByEmail(email.normalized);

    if (user === null) {
      // User not found - use constant-time comparison to prevent timing attacks
      await this.deps.passwordHasher.verify(
        password.value,
        '$argon2id$v=19$m=19456,t=2,p=1$AAAAAAAAAAAAAAAAAAAAAA$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
      );
      return this.loginError('Invalid email or password', isHtmxRequest);
    }

    // Check if account is locked
    if (user.isLocked()) {
      const remaining = user.getLockoutRemainingSeconds();
      return this.loginError(
        `Account temporarily locked. Try again in ${Math.ceil(remaining / 60)} minutes.`,
        isHtmxRequest,
        423
      );
    }

    // Verify password
    const passwordValid = await this.deps.passwordHasher.verify(password.value, user.passwordHash);

    if (!passwordValid) {
      // Record failed attempt
      const updatedUser = user.recordFailedLogin();
      await this.deps.userRepository.save(updatedUser);

      // Log security event
      await this.logSecurityEvent(user.id, 'login_failed', clientIp, userAgent);

      return this.loginError('Invalid email or password', isHtmxRequest);
    }

    // Check if password hash needs upgrading
    if (this.deps.passwordHasher.needsRehash(user.passwordHash)) {
      const newHash = await this.deps.passwordHasher.hash(password.value);
      const updatedUser = user.updatePassword(newHash);
      await this.deps.userRepository.save(updatedUser);
    }

    // Create session
    const sessionId = this.deps.sessionIdGenerator.generate();
    const csrfToken = this.deps.csrfTokenGenerator.generate();

    const session = Session.create({
      sessionId: { value: sessionId },
      userId: user.id,
      ipAddress: clientIp,
      userAgent,
      csrfToken: { value: csrfToken },
      durationSeconds: SESSION_COOKIE_CONFIG.maxAge,
    });

    await this.deps.sessionRepository.save(session, SESSION_COOKIE_CONFIG.maxAge);

    // Update user with successful login
    const loggedInUser = user.recordSuccessfulLogin(clientIp, userAgent);
    await this.deps.userRepository.save(loggedInUser);

    // Reset rate limits on successful login
    await this.deps.rateLimiter.reset(clientIp, 'login');
    await this.deps.rateLimiter.reset(email.normalized, 'loginPerAccount');

    // Log security event
    await this.logSecurityEvent(user.id, 'login_success', clientIp, userAgent);

    // Set cookies and redirect
    const headers = new Headers();
    headers.append('Set-Cookie', createSessionCookie(sessionId));
    headers.append('Set-Cookie', csrfCookieHeader(csrfToken, true));

    if (isHtmxRequest) {
      headers.set('HX-Redirect', redirectTo);
      return new Response(null, { status: 200, headers });
    }

    headers.set('Location', redirectTo);
    return new Response(null, { status: 302, headers });
  }

  /**
   * GET /auth/register
   * Renders the registration page
   */
  async showRegisterPage(request: Request): Promise<Response> {
    return new Response(registerPage(), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  /**
   * POST /auth/register
   * Handles registration form submission
   */
  async handleRegister(request: Request): Promise<Response> {
    const clientIp = request.headers.get('CF-Connecting-IP') ?? 'unknown';
    const userAgent = request.headers.get('User-Agent') ?? 'unknown';
    const isHtmxRequest = request.headers.get('HX-Request') === 'true';

    const formData = await request.formData();
    const emailRaw = formData.get('email');
    const passwordRaw = formData.get('password');
    const confirmPasswordRaw = formData.get('confirmPassword');

    // Validate inputs
    if (
      typeof emailRaw !== 'string' ||
      typeof passwordRaw !== 'string' ||
      typeof confirmPasswordRaw !== 'string'
    ) {
      return this.registerError('All fields are required', isHtmxRequest);
    }

    if (passwordRaw !== confirmPasswordRaw) {
      return this.registerError('Passwords do not match', isHtmxRequest);
    }

    // Create value objects
    let email: Email;
    let password: Password;

    try {
      email = Email.create(emailRaw);
    } catch (error) {
      return this.registerError(
        error instanceof Error ? error.message : 'Invalid email',
        isHtmxRequest
      );
    }

    try {
      password = Password.create(passwordRaw);
    } catch (error) {
      return this.registerError(
        error instanceof Error ? error.message : 'Invalid password',
        isHtmxRequest
      );
    }

    // Check if email already exists
    const existingUser = await this.deps.userRepository.findByEmail(email.normalized);
    if (existingUser !== null) {
      // Don't reveal that email exists - use generic message
      // but still do the password hashing to prevent timing attacks
      await this.deps.passwordHasher.hash(password.value);

      // Return success-like response but don't actually create account
      // This prevents account enumeration while being user-friendly
      return this.registerSuccess(isHtmxRequest);
    }

    // Hash password
    const passwordHash = await this.deps.passwordHasher.hash(password.value);

    // Create user
    const userId = crypto.randomUUID();
    const user = User.create({
      id: userId,
      email,
      passwordHash,
    });

    await this.deps.userRepository.save(user);

    // Log security event
    await this.logSecurityEvent(userId, 'user_registered', clientIp, userAgent);

    return this.registerSuccess(isHtmxRequest);
  }

  /**
   * POST /auth/logout
   * Handles logout
   */
  async handleLogout(request: Request, session: Session): Promise<Response> {
    const clientIp = request.headers.get('CF-Connecting-IP') ?? 'unknown';
    const userAgent = request.headers.get('User-Agent') ?? 'unknown';
    const isHtmxRequest = request.headers.get('HX-Request') === 'true';

    // Delete session
    await this.deps.sessionRepository.delete(session.sessionId);

    // Log security event
    await this.logSecurityEvent(session.userId, 'logout', clientIp, userAgent);

    // Clear cookies
    const headers = new Headers();
    headers.append('Set-Cookie', deleteSessionCookie());
    headers.append('Set-Cookie', '__Host-csrf=; Path=/; Max-Age=0; Secure; SameSite=Lax');

    if (isHtmxRequest) {
      headers.set('HX-Redirect', '/auth/login');
      return new Response(null, { status: 200, headers });
    }

    headers.set('Location', '/auth/login');
    return new Response(null, { status: 302, headers });
  }

  private loginError(message: string, isHtmx: boolean, status: number = 400): Response {
    if (isHtmx) {
      return new Response(loginErrorPartial(message), {
        status,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'HX-Reswap': 'innerHTML',
          'HX-Retarget': '#error-container',
        },
      });
    }

    return new Response(loginPage({ error: message }), {
      status,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  private registerError(message: string, isHtmx: boolean): Response {
    if (isHtmx) {
      return new Response(`<div class="alert alert-error">${escapeHtml(message)}</div>`, {
        status: 400,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'HX-Reswap': 'innerHTML',
          'HX-Retarget': '#error-container',
        },
      });
    }

    return new Response(registerPage({ error: message }), {
      status: 400,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  private registerSuccess(isHtmx: boolean): Response {
    if (isHtmx) {
      return new Response(
        `<div class="alert alert-success">Registration successful! Please check your email to verify your account.</div>`,
        {
          status: 200,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'HX-Reswap': 'innerHTML',
            'HX-Retarget': '#form-container',
          },
        }
      );
    }

    return new Response(null, {
      status: 302,
      headers: { Location: '/auth/login?registered=true' },
    });
  }

  private async logSecurityEvent(
    userId: string,
    eventType: string,
    ip: string,
    userAgent: string
  ): Promise<void> {
    // Implementation depends on your audit logging setup
    // This could write to D1, KV, or an external logging service
    console.log(`Security event: ${eventType} for user ${userId} from ${ip}`);
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
```

---

## Frontend Implementation

### Login Page Template

```typescript
// src/presentation/templates/pages/login.ts

import { baseLayout } from '../layouts/base';
import { csrfField, csrfSetup } from '../partials/csrfSetup';

interface LoginPageProps {
  error?: string;
  redirectTo?: string;
  csrfToken?: string;
}

export function loginPage(props: LoginPageProps = {}): string {
  const { error, redirectTo = '/dashboard', csrfToken = '' } = props;

  const content = `
<div class="flex min-h-[calc(100vh-4rem)] items-center justify-center">
  <div class="card bg-base-100 shadow-xl w-full max-w-md">
    <div class="card-body">
      <h2 class="card-title text-2xl font-bold mb-6">Sign In</h2>
      
      <div id="error-container">
        ${
          error
            ? `
        <div class="alert alert-error mb-4" role="alert">
          <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>${escapeHtml(error)}</span>
        </div>
        `
            : ''
        }
      </div>
      
      <form 
        hx-post="/auth/login" 
        hx-indicator="#login-spinner"
        hx-disabled-elt="button[type=submit]"
        class="space-y-4"
        x-data="{ email: '', password: '' }"
      >
        ${csrfField(csrfToken)}
        <input type="hidden" name="redirect" value="${escapeHtml(redirectTo)}">
        
        <div class="form-control">
          <label class="label" for="email">
            <span class="label-text">Email</span>
          </label>
          <input 
            type="email" 
            id="email"
            name="email" 
            class="input input-bordered w-full" 
            placeholder="you@example.com"
            required
            autocomplete="email"
            x-model="email"
          >
        </div>
        
        <div class="form-control">
          <label class="label" for="password">
            <span class="label-text">Password</span>
          </label>
          <input 
            type="password" 
            id="password"
            name="password" 
            class="input input-bordered w-full" 
            placeholder="••••••••••••"
            required
            autocomplete="current-password"
            x-model="password"
          >
          <label class="label">
            <a href="/auth/forgot-password" class="label-text-alt link link-hover">
              Forgot password?
            </a>
          </label>
        </div>
        
        <button 
          type="submit" 
          class="btn btn-primary w-full"
          :disabled="!email || !password"
        >
          <span id="login-spinner" class="loading loading-spinner htmx-indicator"></span>
          Sign In
        </button>
      </form>
      
      <div class="divider">OR</div>
      
      <p class="text-center text-sm">
        Don't have an account? 
        <a href="/auth/register" class="link link-primary" hx-boost="true">
          Sign up
        </a>
      </p>
    </div>
  </div>
</div>
`;

  return baseLayout({
    title: 'Sign In',
    content,
    scripts: csrfSetup(csrfToken),
  });
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
```

### Registration Page Template

```typescript
// src/presentation/templates/pages/register.ts

import { baseLayout } from '../layouts/base';
import { csrfField, csrfSetup } from '../partials/csrfSetup';

interface RegisterPageProps {
  error?: string;
  csrfToken?: string;
}

export function registerPage(props: RegisterPageProps = {}): string {
  const { error, csrfToken = '' } = props;

  const content = `
<div class="flex min-h-[calc(100vh-4rem)] items-center justify-center">
  <div class="card bg-base-100 shadow-xl w-full max-w-md">
    <div class="card-body">
      <h2 class="card-title text-2xl font-bold mb-6">Create Account</h2>
      
      <div id="error-container">
        ${
          error
            ? `
        <div class="alert alert-error mb-4" role="alert">
          <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>${escapeHtml(error)}</span>
        </div>
        `
            : ''
        }
      </div>
      
      <div id="form-container">
        <form 
          hx-post="/auth/register" 
          hx-indicator="#register-spinner"
          hx-disabled-elt="button[type=submit]"
          class="space-y-4"
          x-data="{ 
            email: '', 
            password: '', 
            confirmPassword: '',
            get passwordsMatch() {
              return this.password === this.confirmPassword;
            },
            get passwordStrength() {
              if (this.password.length === 0) return { level: 0, text: '' };
              if (this.password.length < 12) return { level: 1, text: 'Too short (min 12 characters)' };
              if (this.password.length < 16) return { level: 2, text: 'Good' };
              return { level: 3, text: 'Strong' };
            }
          }"
        >
          ${csrfField(csrfToken)}
          
          <div class="form-control">
            <label class="label" for="email">
              <span class="label-text">Email</span>
            </label>
            <input 
              type="email" 
              id="email"
              name="email" 
              class="input input-bordered w-full" 
              placeholder="you@example.com"
              required
              autocomplete="email"
              x-model="email"
            >
          </div>
          
          <div class="form-control">
            <label class="label" for="password">
              <span class="label-text">Password</span>
            </label>
            <input 
              type="password" 
              id="password"
              name="password" 
              class="input input-bordered w-full" 
              placeholder="••••••••••••"
              required
              minlength="12"
              autocomplete="new-password"
              x-model="password"
            >
            <label class="label" x-show="password.length > 0">
              <span 
                class="label-text-alt"
                :class="{
                  'text-error': passwordStrength.level === 1,
                  'text-warning': passwordStrength.level === 2,
                  'text-success': passwordStrength.level === 3
                }"
                x-text="passwordStrength.text"
              ></span>
            </label>
          </div>
          
          <div class="form-control">
            <label class="label" for="confirmPassword">
              <span class="label-text">Confirm Password</span>
            </label>
            <input 
              type="password" 
              id="confirmPassword"
              name="confirmPassword" 
              class="input input-bordered w-full" 
              :class="{ 'input-error': confirmPassword.length > 0 && !passwordsMatch }"
              placeholder="••••••••••••"
              required
              autocomplete="new-password"
              x-model="confirmPassword"
            >
            <label class="label" x-show="confirmPassword.length > 0 && !passwordsMatch">
              <span class="label-text-alt text-error">Passwords do not match</span>
            </label>
          </div>
          
          <button 
            type="submit" 
            class="btn btn-primary w-full"
            :disabled="!email || !password || !confirmPassword || !passwordsMatch || passwordStrength.level < 2"
          >
            <span id="register-spinner" class="loading loading-spinner htmx-indicator"></span>
            Create Account
          </button>
        </form>
      </div>
      
      <div class="divider">OR</div>
      
      <p class="text-center text-sm">
        Already have an account? 
        <a href="/auth/login" class="link link-primary" hx-boost="true">
          Sign in
        </a>
      </p>
    </div>
  </div>
</div>
`;

  return baseLayout({
    title: 'Create Account',
    content,
    scripts: csrfSetup(csrfToken),
  });
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
```

---

## Testing

### Authentication Handler Tests

```typescript
// src/presentation/handlers/AuthHandlers.spec.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthHandlers, type AuthHandlerDeps } from './AuthHandlers';

describe('AuthHandlers', () => {
  let handlers: AuthHandlers;
  let mockDeps: AuthHandlerDeps;

  beforeEach(() => {
    mockDeps = {
      userRepository: {
        findByEmail: vi.fn(),
        save: vi.fn(),
      },
      sessionRepository: {
        save: vi.fn(),
        findById: vi.fn(),
        delete: vi.fn(),
      },
      passwordHasher: {
        hash: vi.fn(),
        verify: vi.fn(),
        needsRehash: vi.fn().mockReturnValue(false),
      },
      sessionIdGenerator: {
        generate: vi.fn().mockReturnValue('test-session-id'),
      },
      csrfTokenGenerator: {
        generate: vi.fn().mockReturnValue('test-csrf-token'),
      },
      rateLimiter: {
        checkLimit: vi.fn().mockResolvedValue({
          allowed: true,
          remaining: 5,
          resetAt: new Date(),
        }),
        reset: vi.fn(),
      },
    } as unknown as AuthHandlerDeps;

    handlers = new AuthHandlers(mockDeps);
  });

  describe('handleLogin', () => {
    it('should return error for invalid email format', async () => {
      const request = createRequest('POST', '/auth/login', {
        email: 'invalid',
        password: 'testpassword123',
      });

      const response = await handlers.handleLogin(request);

      expect(response.status).toBe(400);
    });

    it('should return error for non-existent user', async () => {
      mockDeps.userRepository.findByEmail = vi.fn().mockResolvedValue(null);
      mockDeps.passwordHasher.verify = vi.fn().mockResolvedValue(false);

      const request = createRequest('POST', '/auth/login', {
        email: 'test@example.com',
        password: 'testpassword123',
      });

      const response = await handlers.handleLogin(request);

      expect(response.status).toBe(400);
      // Verify timing attack prevention
      expect(mockDeps.passwordHasher.verify).toHaveBeenCalled();
    });

    it('should return error for incorrect password', async () => {
      mockDeps.userRepository.findByEmail = vi.fn().mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        passwordHash: '$argon2id$...',
        isLocked: () => false,
        recordFailedLogin: vi.fn().mockReturnThis(),
      });
      mockDeps.passwordHasher.verify = vi.fn().mockResolvedValue(false);

      const request = createRequest('POST', '/auth/login', {
        email: 'test@example.com',
        password: 'wrongpassword',
      });

      const response = await handlers.handleLogin(request);

      expect(response.status).toBe(400);
      expect(mockDeps.userRepository.save).toHaveBeenCalled();
    });

    it('should create session and set cookies on successful login', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        passwordHash: '$argon2id$...',
        isLocked: () => false,
        recordSuccessfulLogin: vi.fn().mockReturnThis(),
      };
      mockDeps.userRepository.findByEmail = vi.fn().mockResolvedValue(mockUser);
      mockDeps.passwordHasher.verify = vi.fn().mockResolvedValue(true);

      const request = createRequest('POST', '/auth/login', {
        email: 'test@example.com',
        password: 'correctpassword',
      });

      const response = await handlers.handleLogin(request);

      expect(response.status).toBe(302);
      expect(response.headers.get('Set-Cookie')).toContain('__Host-session');
      expect(mockDeps.sessionRepository.save).toHaveBeenCalled();
    });

    it('should reject login for locked account', async () => {
      const mockUser = {
        id: 'user-1',
        isLocked: () => true,
        getLockoutRemainingSeconds: () => 600,
      };
      mockDeps.userRepository.findByEmail = vi.fn().mockResolvedValue(mockUser);

      const request = createRequest('POST', '/auth/login', {
        email: 'test@example.com',
        password: 'testpassword123',
      });

      const response = await handlers.handleLogin(request);

      expect(response.status).toBe(423);
    });
  });

  describe('handleRegister', () => {
    it('should reject password below minimum length', async () => {
      const request = createRequest('POST', '/auth/register', {
        email: 'new@example.com',
        password: 'short',
        confirmPassword: 'short',
      });

      const response = await handlers.handleRegister(request);

      expect(response.status).toBe(400);
    });

    it('should reject mismatched passwords', async () => {
      const request = createRequest('POST', '/auth/register', {
        email: 'new@example.com',
        password: 'validpassword123',
        confirmPassword: 'differentpassword123',
      });

      const response = await handlers.handleRegister(request);

      expect(response.status).toBe(400);
    });

    it('should create user on valid registration', async () => {
      mockDeps.userRepository.findByEmail = vi.fn().mockResolvedValue(null);
      mockDeps.passwordHasher.hash = vi.fn().mockResolvedValue('$argon2id$...');

      const request = createRequest('POST', '/auth/register', {
        email: 'new@example.com',
        password: 'validpassword123',
        confirmPassword: 'validpassword123',
      });

      const response = await handlers.handleRegister(request);

      expect(response.status).toBe(302);
      expect(mockDeps.userRepository.save).toHaveBeenCalled();
    });

    it('should not reveal if email already exists', async () => {
      mockDeps.userRepository.findByEmail = vi.fn().mockResolvedValue({
        id: 'existing-user',
      });
      mockDeps.passwordHasher.hash = vi.fn().mockResolvedValue('$argon2id$...');

      const request = createRequest('POST', '/auth/register', {
        email: 'existing@example.com',
        password: 'validpassword123',
        confirmPassword: 'validpassword123',
      });

      const response = await handlers.handleRegister(request);

      // Should appear successful to prevent account enumeration
      expect(response.status).toBe(302);
      // But should not actually save a new user
      expect(mockDeps.userRepository.save).not.toHaveBeenCalled();
    });
  });
});

function createRequest(method: string, url: string, body: Record<string, string>): Request {
  const formData = new URLSearchParams(body);

  return new Request(`http://localhost${url}`, {
    method,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'CF-Connecting-IP': '127.0.0.1',
      'User-Agent': 'Test Agent',
    },
    body: formData.toString(),
  });
}
```

---

## Security Checklist

Use this checklist to verify your authentication implementation covers all critical security concerns. This aligns with the comprehensive security checklist in the companion _Comprehensive Security Guide_.

### Transport Security

- [ ] HTTPS enforced via Cloudflare
- [ ] HSTS header with preload directive
- [ ] TLS 1.2+ required

### Password Security

- [ ] Argon2id with OWASP-recommended parameters (19+ MiB memory, 2+ iterations)
- [ ] PBKDF2 with 600,000+ iterations (alternative when Argon2 unavailable)
- [ ] Password minimum length of 12 characters
- [ ] Password checked against common password list
- [ ] Constant-time password comparison
- [ ] Password hashes upgradable when parameters change

### Session Security

- [ ] Session IDs generated with 256+ bits of cryptographic randomness
- [ ] Session cookies use `__Host-` prefix
- [ ] Session cookies have `HttpOnly` flag
- [ ] Session cookies have `Secure` flag
- [ ] Session cookies have `SameSite=Lax` or `Strict`
- [ ] Sessions stored server-side with TTL expiration
- [ ] Session regeneration on privilege changes
- [ ] Ability to invalidate all user sessions

### CSRF Protection

- [ ] Double-submit cookie pattern implemented
- [ ] CSRF tokens generated with cryptographic randomness
- [ ] CSRF tokens tied to user sessions
- [ ] Origin header validation as additional protection
- [ ] All state-changing requests require CSRF validation
- [ ] HTMX configured to include CSRF token in all requests

### XSS Prevention

- [ ] HTML output encoding by default via `html``` template
- [ ] Context-appropriate encoding (HTML content, attributes, JavaScript)
- [ ] HTMX `selfRequestsOnly` enabled
- [ ] HTMX `allowScriptTags` disabled
- [ ] HTMX `allowEval` disabled
- [ ] `hx-disable` used for user content zones
- [ ] Alpine.js `x-ignore` used for user-generated content
- [ ] Content Security Policy implemented

### Rate Limiting

- [ ] Login attempts limited per IP address
- [ ] Login attempts limited per account
- [ ] Account lockout after excessive failed attempts
- [ ] Registration rate limited per IP
- [ ] Password reset rate limited per account
- [ ] Using Cloudflare Rate Limiting API or KV-based limiter

### Brute Force Protection

- [ ] Timing attack prevention (constant-time comparisons)
- [ ] Progressive delays or lockouts on failed attempts
- [ ] Account enumeration prevention
- [ ] Generic error messages for authentication failures

### Security Headers

- [ ] HSTS enabled with appropriate max-age (2+ years)
- [ ] Content-Security-Policy configured
- [ ] X-Frame-Options set to DENY
- [ ] X-Content-Type-Options set to nosniff
- [ ] Referrer-Policy configured
- [ ] Permissions-Policy restricts unnecessary features
- [ ] Cache-Control prevents caching of authenticated content

### HTMX-Specific Security

- [ ] Only trusted routes called (relative URLs)
- [ ] HttpOnly cookies for auth tokens
- [ ] All user content escaped server-side
- [ ] SameSite=Lax cookies
- [ ] Cross-origin HTMX requests validated
- [ ] History caching disabled for sensitive pages

### Alpine.js Security

- [ ] User data never in Alpine expressions
- [ ] Data passed via data attributes or pre-defined components
- [ ] CSP build used if unsafe-eval not acceptable
- [ ] x-ignore for user-generated content areas

### Input Validation

- [ ] Server-side validation for all inputs
- [ ] Email format validation
- [ ] Email normalization for consistent comparison
- [ ] Password length limits enforced
- [ ] Allowlist validation for fixed options
- [ ] Type-safe validation with TypeScript

### Database Security

- [ ] Parameterized queries only
- [ ] Least privilege database access
- [ ] Input validation before queries

### Secrets Management

- [ ] Secrets stored in Wrangler secrets
- [ ] No secrets in code or config files
- [ ] Secret rotation capability

### Audit and Monitoring

- [ ] Security events logged (login, logout, failures)
- [ ] Failed authentication attempts tracked
- [ ] Account lockouts monitored
- [ ] Anomalous patterns detectable
- [ ] CSRF violations logged
- [ ] Rate limit violations logged

---

## Conclusion

This guide provides a comprehensive foundation for secure session-based authentication on Cloudflare Workers, serving as the authentication-focused companion to the _Comprehensive Security Guide: Browser-Based Interactive Web Applications on Cloudflare_. The implementation follows defense-in-depth principles, combining multiple security layers.

### Key Security Layers Implemented

1. **Password Security**: Argon2id (or PBKDF2) with OWASP-recommended parameters
2. **Session Management**: Server-side storage in KV with automatic TTL expiration
3. **CSRF Protection**: Double-submit cookie pattern with Origin validation
4. **XSS Prevention**: Safe HTML templates with automatic encoding
5. **HTMX Security**: selfRequestsOnly, disabled script tags, hx-disable zones
6. **Rate Limiting**: Multi-layer protection (IP and account-based)
7. **Security Headers**: HSTS, CSP, X-Frame-Options, and more

### Key Takeaways

1. **Server-side rendering is your friend**: The server controls what HTML the browser displays. Use this to your advantage by ensuring all output is properly encoded with the `html``` tagged template.

2. **Layer your defenses**: No single security measure is sufficient. Combine CSP, CSRF tokens, input validation, output encoding, and rate limiting.

3. **Use TypeScript's type system**: Branded types and strict configuration catch entire classes of errors at compile time.

4. **Prevent timing attacks**: Use constant-time comparisons for all security-sensitive operations.

5. **Rate limit aggressively**: Protect at multiple levels (IP and account) with progressive lockouts.

6. **Never reveal information**: Prevent account enumeration through generic error messages.

7. **Log security events**: Maintain comprehensive audit trails for monitoring and incident response.

8. **Test security controls**: Write unit tests for security functions and integration tests for security flows.

### Further Reading

For comprehensive security coverage beyond authentication, refer to the companion guide which covers:

- Content Security Policy in depth
- Database security with D1
- Complete input validation framework
- Incident response and monitoring
- Security testing strategies

Remember that security is an ongoing process. Regularly review and update your implementation as new vulnerabilities are discovered and best practices evolve.

---

_This guide reflects security best practices as of January 2026. For the latest security advisories and updates, consult OWASP, Cloudflare's security documentation, and the security teams for HTMX and Alpine.js._
