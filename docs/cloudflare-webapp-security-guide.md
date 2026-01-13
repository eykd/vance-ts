# Comprehensive Security Guide: Browser-Based Interactive Web Applications on Cloudflare

**Securing HTMX, Alpine.js, and TypeScript Workers Applications**

_Defense-in-Depth Strategies for Modern Hypermedia-Driven Web Applications_

_January 2026_

---

## Executive Summary

This guide provides an in-depth, comprehensive approach to securing browser-based interactive web applications built on Cloudflare's edge platform using the hypermedia-driven architecture outlined in our companion guides. The stack—comprising HTMX, Alpine.js, TailwindCSS 4, DaisyUI 5, and TypeScript Workers—offers unique security advantages but also presents specific challenges that require careful attention.

Security in hypermedia applications differs fundamentally from traditional SPAs: the server remains the source of truth for application state, HTML fragments are returned instead of JSON, and the browser's role is primarily display and UI-only interactivity. This architecture simplifies many security concerns but introduces others that developers must understand.

### Key Security Technologies

This guide implements current best practices as of January 2026:

- **Password Hashing**: Argon2id (OWASP recommended) with memory-hard parameters
- **Session Management**: `__Host-` prefixed cookies with 256-bit session IDs
- **CSRF Protection**: Session-tied tokens with Origin header validation
- **Rate Limiting**: Sliding window algorithm with per-IP and per-account limits
- **Account Security**: Lockout after failed attempts, constant-time comparisons

This guide covers the complete security lifecycle: from secure architecture design through implementation patterns, testing strategies, and operational security practices.

---

## Table of Contents

1. [Security Architecture Overview](#1-security-architecture-overview)
2. [Transport Layer Security](#2-transport-layer-security)
3. [Authentication and Session Management](#3-authentication-and-session-management)
4. [Cross-Site Scripting (XSS) Prevention](#4-cross-site-scripting-xss-prevention)
5. [Cross-Site Request Forgery (CSRF) Protection](#5-cross-site-request-forgery-csrf-protection)
6. [Content Security Policy (CSP)](#6-content-security-policy-csp)
7. [Input Validation and Sanitization](#7-input-validation-and-sanitization)
8. [Database Security with D1](#8-database-security-with-d1)
9. [Secrets and Environment Variables](#9-secrets-and-environment-variables)
10. [Rate Limiting and DDoS Protection](#10-rate-limiting-and-ddos-protection)
11. [HTTP Security Headers](#11-http-security-headers)
12. [Secure TypeScript Patterns](#12-secure-typescript-patterns)
13. [HTMX-Specific Security](#13-htmx-specific-security)
14. [Alpine.js Security Considerations](#14-alpinejs-security-considerations)
15. [Security Testing Strategies](#15-security-testing-strategies)
16. [Incident Response and Monitoring](#16-incident-response-and-monitoring)
17. [Complete Security Implementation Example](#17-complete-security-implementation-example)

---

## 1. Security Architecture Overview

### The Defense-in-Depth Model

Security for browser-based applications requires multiple overlapping layers of protection. No single measure is sufficient; the goal is to ensure that if one layer fails, others continue to provide protection.

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Edge Layer (Cloudflare)                       │
│  • DDoS Protection • WAF Rules • Rate Limiting • Bot Management     │
├─────────────────────────────────────────────────────────────────────┤
│                       Transport Layer                                │
│  • TLS 1.3 • HSTS • Certificate Pinning                             │
├─────────────────────────────────────────────────────────────────────┤
│                      Application Layer                               │
│  • CSP • Security Headers • Input Validation • Output Encoding      │
├─────────────────────────────────────────────────────────────────────┤
│                     Authentication Layer                             │
│  • Argon2id Password Hashing • __Host- Prefixed Session Cookies     │
│  • Session-Tied CSRF Tokens • Account Lockout Protection            │
├─────────────────────────────────────────────────────────────────────┤
│                        Data Layer                                    │
│  • Parameterized Queries • Encryption at Rest • Access Control      │
└─────────────────────────────────────────────────────────────────────┘
```

### Core Security Principles

This implementation follows these foundational principles:

1. **Defense in Depth**: Multiple overlapping security layers
2. **Secure by Default**: Strictest settings unless explicitly relaxed
3. **Fail Secure**: Errors default to denying access
4. **Least Privilege**: Minimal permissions at every layer
5. **Audit Everything**: Comprehensive logging for security events

### Security Advantages of the Hypermedia Architecture

The HTMX/Alpine.js approach offers inherent security benefits over traditional SPAs:

1. **Server-Controlled State**: Application state lives on the server, not in client-side JavaScript. This eliminates entire classes of client-side state manipulation attacks.

2. **Reduced Attack Surface**: Less JavaScript means fewer opportunities for XSS exploitation. HTMX's default `selfRequestsOnly: true` prevents requests to untrusted origins.

3. **Simpler Mental Model**: When the server renders HTML and controls what the client displays, security reasoning becomes more straightforward.

4. **Natural CSRF Protection**: HTML form submissions and HTMX requests naturally integrate with traditional CSRF protection mechanisms.

### Threat Model for Cloudflare Edge Applications

Understanding the threats specific to this architecture:

| Threat Category        | Attack Vectors                                      | Primary Mitigations                                      |
| ---------------------- | --------------------------------------------------- | -------------------------------------------------------- |
| Injection              | SQL injection, Command injection, HTML injection    | Parameterized queries, Output encoding, Input validation |
| Authentication         | Credential stuffing, Session hijacking, Token theft | Secure cookies, Rate limiting, MFA                       |
| Cross-Site Attacks     | XSS, CSRF, Clickjacking                             | CSP, CSRF tokens, X-Frame-Options                        |
| Information Disclosure | Error messages, Debug info, Timing attacks          | Error handling, Security headers                         |
| Denial of Service      | Resource exhaustion, Application-layer attacks      | Rate limiting, Cloudflare WAF                            |

---

## 2. Transport Layer Security

### Enforcing HTTPS

All traffic must use HTTPS. Configure Cloudflare to enforce this at the edge:

```typescript
// src/presentation/middleware/https.ts
export function enforceHttps(request: Request): Response | null {
  const url = new URL(request.url);

  // Cloudflare handles HTTPS termination; check the header
  const protocol = request.headers.get('X-Forwarded-Proto');

  if (protocol === 'http') {
    // Redirect to HTTPS
    url.protocol = 'https:';
    return Response.redirect(url.toString(), 301);
  }

  return null; // Continue processing
}
```

### Strict Transport Security (HSTS)

Configure HSTS to ensure browsers always use HTTPS:

```typescript
// src/presentation/middleware/securityHeaders.ts
export function addSecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers);

  // HSTS: Enforce HTTPS for 2 years, include subdomains, allow preloading
  headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
```

### TLS Configuration

Cloudflare handles TLS termination. Ensure your dashboard settings include:

- **Minimum TLS Version**: TLS 1.2 (prefer 1.3)
- **Automatic HTTPS Rewrites**: Enabled
- **Always Use HTTPS**: Enabled
- **Opportunistic Encryption**: Enabled

---

## 3. Authentication and Session Management

### Why Session-Based Authentication?

For browser-based HTMX applications, session-based authentication is the recommended approach over JWTs:

- **Immediate revocation**: Sessions can be invalidated instantly server-side
- **No client-side token storage**: Session IDs stored in HttpOnly cookies
- **Smaller attack surface**: No token parsing or signature verification in browser
- **Better suited for HTMX**: Server-rendered HTML naturally integrates with session state

### Domain Layer: Value Objects

First, define secure value objects for authentication data:

```typescript
// src/domain/value-objects/Email.ts

/**
 * Email value object with validation and normalization
 * Prevents duplicate accounts via case variations
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
}
```

```typescript
// src/domain/value-objects/Password.ts

/**
 * Password value object with strength validation
 * Follows NIST 800-63B guidelines
 */
export class Password {
  private readonly _value: string;

  private static readonly MIN_LENGTH = 12;
  private static readonly MAX_LENGTH = 128;

  private static readonly COMMON_PASSWORDS = new Set([
    'password123456',
    '123456789012',
    'qwertyuiopas',
    // Extended list in production
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

    if (Password.COMMON_PASSWORDS.has(value.toLowerCase())) {
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
    if (this._value.length !== other._value.length) return false;
    let result = 0;
    for (let i = 0; i < this._value.length; i++) {
      result |= this._value.charCodeAt(i) ^ other._value.charCodeAt(i);
    }
    return result === 0;
  }
}
```

### User Entity with Security Features

```typescript
// src/domain/entities/User.ts

export interface UserData {
  readonly id: string;
  readonly email: string;
  readonly emailNormalized: string;
  readonly passwordHash: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly emailVerified: boolean;
  readonly failedLoginAttempts: number;
  readonly lastFailedLoginAt: string | null;
  readonly lockedUntil: string | null;
  readonly lastLoginAt: string | null;
  readonly lastLoginIp: string | null;
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
      failedLoginAttempts: 0,
      lastFailedLoginAt: null,
      lockedUntil: null,
      lastLoginAt: null,
      lastLoginIp: null,
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
    if (this.data.lockedUntil === null) return false;
    return new Date() < new Date(this.data.lockedUntil);
  }

  getLockoutRemainingSeconds(): number {
    if (this.data.lockedUntil === null) return 0;
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

  recordSuccessfulLogin(ip: string): User {
    const now = new Date().toISOString();
    return new User({
      ...this.data,
      failedLoginAttempts: 0,
      lastFailedLoginAt: null,
      lockedUntil: null,
      lastLoginAt: now,
      lastLoginIp: ip,
      updatedAt: now,
    });
  }

  toJSON(): Omit<UserData, 'passwordHash'> {
    const { passwordHash: _, ...safeData } = this.data;
    return safeData;
  }
}
```

### Session Entity with CSRF Token

CSRF tokens are stored within the session for stronger binding:

```typescript
// src/domain/entities/Session.ts

export interface SessionData {
  readonly sessionId: string;
  readonly userId: string;
  readonly createdAt: string;
  readonly expiresAt: string;
  readonly lastActivityAt: string;
  readonly ipAddress: string;
  readonly userAgent: string;
  readonly csrfToken: string; // CSRF token tied to session
}

export class Session {
  private constructor(private readonly data: SessionData) {}

  static create(params: {
    sessionId: string;
    userId: string;
    ipAddress: string;
    userAgent: string;
    csrfToken: string;
    durationSeconds: number;
  }): Session {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + params.durationSeconds * 1000);

    return new Session({
      sessionId: params.sessionId,
      userId: params.userId,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      lastActivityAt: now.toISOString(),
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      csrfToken: params.csrfToken,
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
    if (this.data.csrfToken.length !== token.length) return false;
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

### Password Security with Argon2id

Argon2id is the OWASP-recommended algorithm for password hashing as of 2025. It provides protection against both GPU-based attacks and side-channel attacks:

```typescript
// src/infrastructure/security/Argon2Hasher.ts

import { argon2id } from '@noble/hashes/argon2';
import { randomBytes } from '@noble/hashes/utils';

/**
 * Argon2id password hasher following OWASP 2025 recommendations
 *
 * Parameters:
 * - Memory: minimum 19 MiB (OWASP minimum), 46 MiB recommended
 * - Iterations: minimum 2
 * - Parallelism: 1
 * - Output length: 32 bytes
 */
export interface Argon2Config {
  memoryCost: number; // Memory in KiB
  timeCost: number; // Number of iterations
  parallelism: number; // Degree of parallelism
  hashLength: number; // Output hash length in bytes
  saltLength: number; // Salt length in bytes
}

const DEFAULT_CONFIG: Argon2Config = {
  memoryCost: 19456, // 19 MiB (OWASP minimum for Workers memory constraints)
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
   * Hash a password using Argon2id
   * Returns format: $argon2id$v=19$m=<memory>,t=<time>,p=<parallelism>$<salt>$<hash>
   */
  async hash(password: string): Promise<string> {
    const salt = randomBytes(this.config.saltLength);

    const hash = argon2id(password, salt, {
      m: this.config.memoryCost,
      t: this.config.timeCost,
      p: this.config.parallelism,
      dkLen: this.config.hashLength,
    });

    const saltB64 = this.toBase64(salt);
    const hashB64 = this.toBase64(hash);

    return `$argon2id$v=19$m=${this.config.memoryCost},t=${this.config.timeCost},p=${this.config.parallelism}$${saltB64}$${hashB64}`;
  }

  /**
   * Verify a password against a stored hash
   * Uses constant-time comparison to prevent timing attacks
   */
  async verify(password: string, storedHash: string): Promise<boolean> {
    try {
      const parsed = this.parseHash(storedHash);
      if (parsed === null) return false;

      const computedHash = argon2id(password, parsed.salt, {
        m: parsed.memoryCost,
        t: parsed.timeCost,
        p: parsed.parallelism,
        dkLen: parsed.hash.length,
      });

      return this.constantTimeEqual(computedHash, parsed.hash);
    } catch {
      return false;
    }
  }

  /**
   * Check if a hash needs rehashing with updated parameters
   */
  needsRehash(storedHash: string): boolean {
    const parsed = this.parseHash(storedHash);
    if (parsed === null) return true;

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
    if (parts.length !== 6 || parts[1] !== 'argon2id') return null;

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

### Session ID and CSRF Token Generators

```typescript
// src/infrastructure/security/TokenGenerators.ts

/**
 * Cryptographically secure session ID generator
 * Uses 256 bits of entropy (OWASP recommends minimum 128 bits)
 */
export class SessionIdGenerator {
  private static readonly BYTES_LENGTH = 32; // 256 bits

  generate(): string {
    const bytes = new Uint8Array(SessionIdGenerator.BYTES_LENGTH);
    crypto.getRandomValues(bytes);
    return this.toUrlSafeBase64(bytes);
  }

  isValid(sessionId: string): boolean {
    const expectedLength = Math.ceil((SessionIdGenerator.BYTES_LENGTH * 4) / 3);
    if (sessionId.length !== expectedLength) return false;
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
 * CSRF Token generator (separate from session IDs)
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

### Session Manager with \_\_Host- Cookie Prefix

The `__Host-` cookie prefix provides additional security guarantees:

```typescript
// src/infrastructure/auth/SessionManager.ts

import { Session, type SessionData } from '@domain/entities/Session';
import { SessionIdGenerator, CsrfTokenGenerator } from './TokenGenerators';

export class SessionManager {
  private static readonly SESSION_KEY_PREFIX = 'session:';
  private static readonly USER_SESSIONS_PREFIX = 'user_sessions:';

  private readonly sessionIdGen = new SessionIdGenerator();
  private readonly csrfTokenGen = new CsrfTokenGenerator();

  constructor(
    private readonly kv: KVNamespace,
    private readonly config: {
      sessionDuration: number; // e.g., 86400 (24 hours)
      idleTimeout: number; // e.g., 900 (15 minutes)
      secure: boolean; // true in production
    }
  ) {}

  async createSession(
    userId: string,
    request: Request
  ): Promise<{ session: Session; cookies: string[] }> {
    const sessionId = this.sessionIdGen.generate();
    const csrfToken = this.csrfTokenGen.generate();

    const session = Session.create({
      sessionId,
      userId,
      ipAddress: request.headers.get('CF-Connecting-IP') ?? 'unknown',
      userAgent: request.headers.get('User-Agent') ?? '',
      csrfToken,
      durationSeconds: this.config.sessionDuration,
    });

    await this.save(session);
    await this.addToUserSessions(userId, sessionId);

    const cookies = [this.buildSessionCookie(sessionId), this.buildCsrfCookie(csrfToken)];

    return { session, cookies };
  }

  async validateSession(sessionId: string): Promise<Session | null> {
    const key = `${SessionManager.SESSION_KEY_PREFIX}${sessionId}`;
    const data = await this.kv.get(key);

    if (data === null) return null;

    try {
      const sessionData = JSON.parse(data) as SessionData;
      const session = Session.fromData(sessionData);

      if (session.isExpired()) {
        await this.destroySession(sessionId);
        return null;
      }

      // Update activity if needed
      if (session.needsRefresh(this.config.idleTimeout)) {
        const updated = session.withUpdatedActivity();
        await this.save(updated);
        return updated;
      }

      return session;
    } catch {
      await this.destroySession(sessionId);
      return null;
    }
  }

  async destroySession(sessionId: string): Promise<void> {
    const session = await this.validateSession(sessionId);
    if (session !== null) {
      await this.removeFromUserSessions(session.userId, sessionId);
    }

    const key = `${SessionManager.SESSION_KEY_PREFIX}${sessionId}`;
    await this.kv.delete(key);
  }

  async destroyAllUserSessions(userId: string): Promise<void> {
    const sessionIds = await this.getUserSessionIds(userId);

    await Promise.all(
      sessionIds.map((id) => this.kv.delete(`${SessionManager.SESSION_KEY_PREFIX}${id}`))
    );

    await this.kv.delete(`${SessionManager.USER_SESSIONS_PREFIX}${userId}`);
  }

  private async save(session: Session): Promise<void> {
    const key = `${SessionManager.SESSION_KEY_PREFIX}${session.sessionId}`;
    await this.kv.put(key, JSON.stringify(session.toJSON()), {
      expirationTtl: this.config.sessionDuration,
    });
  }

  /**
   * Build session cookie with __Host- prefix
   *
   * __Host- prefix requirements:
   * - Must have Secure flag
   * - Must have Path=/
   * - Must NOT have Domain attribute
   * - Provides protection against subdomain attacks
   */
  private buildSessionCookie(sessionId: string): string {
    const parts = [
      `__Host-session=${sessionId}`,
      'Path=/',
      'HttpOnly',
      'SameSite=Lax',
      `Max-Age=${this.config.sessionDuration}`,
    ];

    if (this.config.secure) {
      parts.push('Secure');
    }

    return parts.join('; ');
  }

  /**
   * Build CSRF cookie (readable by JavaScript for HTMX)
   */
  private buildCsrfCookie(csrfToken: string): string {
    const parts = [
      `__Host-csrf=${csrfToken}`,
      'Path=/',
      'SameSite=Lax', // NOT HttpOnly - needs JS access
      `Max-Age=${this.config.sessionDuration}`,
    ];

    if (this.config.secure) {
      parts.push('Secure');
    }

    return parts.join('; ');
  }

  private async getUserSessionIds(userId: string): Promise<string[]> {
    const key = `${SessionManager.USER_SESSIONS_PREFIX}${userId}`;
    const data = await this.kv.get(key);
    if (data === null) return [];
    try {
      return JSON.parse(data) as string[];
    } catch {
      return [];
    }
  }

  private async addToUserSessions(userId: string, sessionId: string): Promise<void> {
    const existing = await this.getUserSessionIds(userId);
    if (!existing.includes(sessionId)) {
      existing.push(sessionId);
    }
    const key = `${SessionManager.USER_SESSIONS_PREFIX}${userId}`;
    await this.kv.put(key, JSON.stringify(existing), {
      expirationTtl: this.config.sessionDuration,
    });
  }

  private async removeFromUserSessions(userId: string, sessionId: string): Promise<void> {
    const existing = await this.getUserSessionIds(userId);
    const filtered = existing.filter((id) => id !== sessionId);
    const key = `${SessionManager.USER_SESSIONS_PREFIX}${userId}`;
    if (filtered.length > 0) {
      await this.kv.put(key, JSON.stringify(filtered));
    } else {
      await this.kv.delete(key);
    }
  }
}
```

### Secure Cookie Configuration Reference

```typescript
// Cookie attribute reference for __Host- prefixed cookies
const cookieSecurityGuide = {
  // __Host- prefix requirements (enforced by browser)
  '__Host-': {
    Secure: true, // REQUIRED for __Host- prefix
    Path: '/', // REQUIRED: must be exactly "/"
    Domain: undefined, // REQUIRED: must NOT be set
    // Benefits: prevents subdomain attacks, ensures HTTPS
  },

  // Session cookie attributes
  session: {
    HttpOnly: true, // Prevents JavaScript access (XSS mitigation)
    SameSite: 'Lax', // CSRF protection, allows top-level navigation
  },

  // CSRF cookie attributes
  csrf: {
    HttpOnly: false, // Must be readable by JavaScript for HTMX
    SameSite: 'Lax', // Additional CSRF protection
  },
};

// SameSite behavior reference
const sameSiteBehavior = {
  Strict: {
    crossSitePost: false,
    crossSiteNavigation: false,
    crossSiteResource: false,
  },
  Lax: {
    crossSitePost: false,
    crossSiteNavigation: true, // Cookies sent for top-level navigation
    crossSiteResource: false,
  },
  None: {
    crossSitePost: true,
    crossSiteNavigation: true,
    crossSiteResource: true,
    // Requires Secure flag
  },
};
```

---

## 4. Cross-Site Scripting (XSS) Prevention

### Understanding XSS in Hypermedia Applications

HTMX applications are susceptible to XSS because they insert server responses directly into the DOM. The key insight: **server-side output encoding is your primary defense**.

### Server-Side HTML Encoding

Always encode user-controlled data before including it in HTML responses:

```typescript
// src/infrastructure/security/HtmlEncoder.ts
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
    return unsafe.replace(/[&<>"'/]/g, (char) => this.ENCODE_MAP[char]);
  }

  /**
   * Encode string for safe inclusion in HTML attributes
   */
  static encodeForAttribute(unsafe: string): string {
    // More aggressive encoding for attributes
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

### Template Functions with Automatic Encoding

Create template functions that encode by default:

```typescript
// src/presentation/templates/html.ts
import { HtmlEncoder } from '../../infrastructure/security/HtmlEncoder';

type Primitive = string | number | boolean | null | undefined;

/**
 * Tagged template literal that automatically encodes interpolated values.
 * Use html`` for all HTML generation.
 */
export function html(
  strings: TemplateStringsArray,
  ...values: (Primitive | Primitive[])[]
): string {
  return strings.reduce((result, str, i) => {
    const value = values[i - 1];
    const encoded = encodeValue(value);
    return result + encoded + str;
  });
}

function encodeValue(value: Primitive | Primitive[]): string {
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

/**
 * Mark a string as already safe (pre-encoded or trusted HTML).
 * USE WITH EXTREME CAUTION - only for HTML you control.
 */
export class SafeHtml {
  constructor(public readonly value: string) {}
  toString(): string {
    return this.value;
  }
}

export function safe(html: string): SafeHtml {
  return new SafeHtml(html);
}

// Update html`` to handle SafeHtml
function encodeValue(value: Primitive | Primitive[] | SafeHtml): string {
  if (value instanceof SafeHtml) {
    return value.value; // Already safe, don't encode
  }
  // ... rest of implementation
}
```

### Using the Safe Template System

```typescript
// src/presentation/templates/partials/user-profile.ts
import { html, safe } from '../html';
import type { User } from '../../../domain/entities/User';

export function renderUserProfile(user: User): string {
  // User-provided data is automatically encoded
  return html`
    <div class="profile">
      <h2 class="text-xl font-bold">${user.name}</h2>
      <p class="text-gray-600">${user.bio}</p>
      <a href="/users/${user.id}" class="link">View Profile</a>
    </div>
  `;
}

// Example with intentionally safe HTML (use sparingly!)
export function renderRichContent(sanitizedHtml: string): string {
  // Only use safe() for HTML that has been sanitized
  return html` <div class="rich-content">${safe(sanitizedHtml)}</div> `;
}
```

### HTMX Security Configuration

Configure HTMX to be secure by default:

```html
<!-- In your base template -->
<head>
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
```

Configuration explained:

| Setting            | Value   | Security Impact                                            |
| ------------------ | ------- | ---------------------------------------------------------- |
| `selfRequestsOnly` | `true`  | Only allows requests to same origin (prevents SSRF)        |
| `allowScriptTags`  | `false` | Prevents script execution in HTMX responses                |
| `allowEval`        | `false` | Disables eval-based features (some hx-on handlers)         |
| `historyCacheSize` | `0`     | Disables history caching (prevents sensitive data leakage) |

### The hx-disable Attribute

Use `hx-disable` to create safe zones for untrusted content:

```html
<!-- When rendering user-generated content -->
<div hx-disable>${renderUserContent(user.content)}</div>
```

Any HTMX attributes inside an `hx-disable` zone are ignored, preventing attackers from injecting malicious HTMX triggers.

---

## 5. Cross-Site Request Forgery (CSRF) Protection

### Session-Tied CSRF Token Strategy

CSRF protection for HTMX applications works best when CSRF tokens are tied directly to user sessions. This approach:

- Ensures CSRF tokens expire with sessions
- Reduces KV lookups (token stored in session data)
- Provides stronger binding between session and token

### CSRF Middleware with Session Validation

Since CSRF tokens are stored in the session (see Section 3), the middleware validates against the session's embedded token:

```typescript
// src/presentation/middleware/csrfProtection.ts

import type { Session } from '@domain/entities/Session';

export interface CsrfConfig {
  cookieName: string;
  headerName: string;
  formFieldName: string;
  protectedMethods: string[];
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

  return async function csrfMiddleware(
    request: Request,
    session: Session | null
  ): Promise<Response | null> {
    const method = request.method.toUpperCase();
    const url = new URL(request.url);

    // Skip for non-protected methods
    if (!cfg.protectedMethods.includes(method)) {
      return null;
    }

    // Skip for excluded paths
    if (cfg.excludePaths.some((path) => url.pathname.startsWith(path))) {
      return null;
    }

    // Require valid session for CSRF validation
    if (session === null) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Extract token from request
    const submittedToken = await extractCsrfToken(request, cfg);

    if (submittedToken === null) {
      return csrfError('Missing CSRF token');
    }

    // Validate against session's embedded token
    if (!session.validateCsrfToken(submittedToken)) {
      console.warn('CSRF token mismatch', {
        sessionId: session.sessionId,
        method,
        path: url.pathname,
      });
      return csrfError('Invalid CSRF token');
    }

    // Also verify Origin header for additional protection
    if (!validateOrigin(request)) {
      return csrfError('Invalid request origin');
    }

    return null; // Continue processing
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

  // If no Origin header, check Referer
  if (origin === null) {
    const referer = request.headers.get('Referer');
    if (referer === null) {
      // No origin info - allow but log for monitoring
      return true;
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
```

### Adding CSRF Token to HTMX Requests

Include the token in your base template so all HTMX requests include it:

```typescript
// src/presentation/templates/layouts/base.ts
import { html } from '../html';

interface BaseLayoutProps {
  title: string;
  csrfToken: string;
  content: string;
}

export function baseLayout({ title, csrfToken, content }: BaseLayoutProps): string {
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
        "allowEval": false
      }'
        />
      </head>
      <body hx-headers='{"X-CSRF-Token": "${csrfToken}"}' class="min-h-screen bg-base-100">
        ${content}

        <script src="/js/htmx.min.js" defer></script>
        <script src="/js/alpine.min.js" defer></script>
      </body>
    </html>
  `;
}
```

### HTMX CSRF Configuration via JavaScript

For more dynamic CSRF token handling:

```typescript
// src/presentation/templates/partials/csrfSetup.ts

export function csrfSetup(csrfToken: string): string {
  return `
<script>
  document.addEventListener('DOMContentLoaded', function() {
    // Configure HTMX to include CSRF token in all requests
    document.body.addEventListener('htmx:configRequest', function(event) {
      event.detail.headers['X-CSRF-Token'] = '${escapeJs(csrfToken)}';
    });
  });
</script>
`;
}

export function csrfField(csrfToken: string): string {
  return `<input type="hidden" name="_csrf" value="${escapeHtml(csrfToken)}">`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeJs(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r');
}
```

### Double-Submit Cookie Pattern (Alternative)

For stateless CSRF protection when you prefer not to store tokens in sessions:

```typescript
// src/infrastructure/security/DoubleSubmitCsrf.ts
export class DoubleSubmitCsrf {
  private readonly secret: string;

  constructor(secret: string) {
    this.secret = secret;
  }

  async generateTokenAndCookie(): Promise<{ token: string; cookie: string }> {
    const timestamp = Date.now().toString(36);
    const random = crypto.getRandomValues(new Uint8Array(16));
    const randomStr = btoa(String.fromCharCode(...random));

    const data = `${timestamp}.${randomStr}`;
    const signature = await this.sign(data);
    const token = `${data}.${signature}`;

    const cookie = [
      `csrf=${token}`,
      'HttpOnly',
      'Secure',
      'SameSite=Strict',
      'Path=/',
      'Max-Age=3600',
    ].join('; ');

    return { token, cookie };
  }

  async validateToken(cookieToken: string, headerToken: string): Promise<boolean> {
    // Tokens must match
    if (cookieToken !== headerToken) {
      return false;
    }

    // Validate signature
    const parts = cookieToken.split('.');
    if (parts.length !== 3) return false;

    const [timestamp, random, signature] = parts;
    const data = `${timestamp}.${random}`;
    const expectedSignature = await this.sign(data);

    if (signature !== expectedSignature) {
      return false;
    }

    // Check timestamp (1 hour max age)
    const tokenTime = parseInt(timestamp, 36);
    if (Date.now() - tokenTime > 3600000) {
      return false;
    }

    return true;
  }

  private async sign(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(this.secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
    return btoa(String.fromCharCode(...new Uint8Array(signature)));
  }
}
```

---

## 6. Content Security Policy (CSP)

### Understanding CSP for Hypermedia Applications

Content Security Policy is a critical security header that tells browsers which resources are allowed to load. For HTMX/Alpine.js applications, CSP requires careful configuration.

### CSP Strategy

```typescript
// src/presentation/middleware/csp.ts
interface CspConfig {
  nonce?: string;
  reportUri?: string;
  reportOnly?: boolean;
}

export function buildCsp(config: CspConfig = {}): string {
  const { nonce, reportUri, reportOnly = false } = config;

  const directives: Record<string, string[]> = {
    // Default: only allow same-origin
    'default-src': ["'self'"],

    // Scripts: same-origin + nonce for inline
    'script-src': [
      "'self'",
      nonce ? `'nonce-${nonce}'` : '',
      // Required for Alpine.js x-data evaluation
      "'unsafe-eval'", // Only if needed; try to avoid
    ].filter(Boolean),

    // Styles: same-origin + inline (Tailwind uses inline styles)
    'style-src': [
      "'self'",
      "'unsafe-inline'", // Required for Tailwind/DaisyUI
    ],

    // Images: same-origin + data URIs
    'img-src': ["'self'", 'data:', 'https:'],

    // Fonts: same-origin
    'font-src': ["'self'"],

    // Connections: same-origin only (for HTMX)
    'connect-src': ["'self'"],

    // Forms: same-origin only
    'form-action': ["'self'"],

    // Frames: prevent embedding
    'frame-ancestors': ["'none'"],

    // Base URI: prevent base tag hijacking
    'base-uri': ["'self'"],

    // Object/embed: disabled
    'object-src': ["'none'"],

    // Upgrade HTTP to HTTPS
    'upgrade-insecure-requests': [],
  };

  if (reportUri) {
    directives['report-uri'] = [reportUri];
    directives['report-to'] = ['csp-endpoint'];
  }

  const policy = Object.entries(directives)
    .map(([directive, values]) => {
      if (values.length === 0) {
        return directive;
      }
      return `${directive} ${values.join(' ')}`;
    })
    .join('; ');

  return policy;
}

export function addCspHeader(response: Response, config: CspConfig = {}): Response {
  const headers = new Headers(response.headers);
  const policy = buildCsp(config);

  const headerName = config.reportOnly
    ? 'Content-Security-Policy-Report-Only'
    : 'Content-Security-Policy';

  headers.set(headerName, policy);

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
```

### Nonce-Based CSP for Inline Scripts

When you need inline scripts, use nonces:

```typescript
// src/presentation/middleware/nonceGenerator.ts
export function generateNonce(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return btoa(String.fromCharCode(...bytes));
}

// In your request handler
export async function handleRequest(request: Request): Promise<Response> {
  const nonce = generateNonce();

  // Pass nonce to template
  const html = renderPage({ nonce });

  // Add CSP header with nonce
  const response = new Response(html, {
    headers: { 'Content-Type': 'text/html' },
  });

  return addCspHeader(response, { nonce });
}
```

```typescript
// In your template
export function renderPage({ nonce }: { nonce: string }): string {
  return html`
    <!DOCTYPE html>
    <html>
      <head>
        <script nonce="${nonce}">
          // This inline script is allowed because it has the matching nonce
          document.addEventListener('alpine:init', () => {
            Alpine.data('app', () => ({
              /* ... */
            }));
          });
        </script>
      </head>
      <!-- ... -->
    </html>
  `;
}
```

### CSP for Alpine.js

Alpine.js uses `eval()` for expression evaluation. You have two options:

**Option 1: Allow unsafe-eval (simpler but less secure)**

```typescript
'script-src': ["'self'", "'unsafe-eval'"]
```

**Option 2: Use Alpine's CSP build (more secure)**

Alpine.js offers a CSP-compatible build that doesn't use `eval()`:

```html
<script src="/js/alpine.csp.min.js" defer></script>
```

With the CSP build, you define all component logic in JavaScript:

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
  <button @click="toggle">Toggle</button>
  <div x-show="open">Content</div>
</div>
```

### CSP Reporting

Set up CSP violation reporting:

```typescript
// src/presentation/handlers/cspReport.ts
export async function handleCspReport(request: Request): Promise<Response> {
  const report = await request.json();

  // Log the violation
  console.warn('CSP Violation', {
    documentUri: report['csp-report']['document-uri'],
    blockedUri: report['csp-report']['blocked-uri'],
    violatedDirective: report['csp-report']['violated-directive'],
    originalPolicy: report['csp-report']['original-policy'],
  });

  // Could also send to monitoring service

  return new Response(null, { status: 204 });
}
```

---

## 7. Input Validation and Sanitization

### Validation Philosophy

Input validation is a critical security layer but should not be the sole defense against attacks like XSS and SQL injection. The principle is defense-in-depth:

1. **Validate early**: Check input format at the application boundary
2. **Use parameterized queries**: Prevent SQL injection at the database layer
3. **Encode output**: Prevent XSS at the rendering layer

### Creating a Validation Framework

```typescript
// src/domain/validation/Validator.ts

export type ValidationResult<T> =
  | { success: true; value: T }
  | { success: false; errors: ValidationError[] };

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export abstract class Validator<T> {
  abstract validate(input: unknown): ValidationResult<T>;

  protected error(field: string, message: string, code: string): ValidationError {
    return { field, message, code };
  }
}

// String validators
export class StringValidator extends Validator<string> {
  constructor(
    private readonly field: string,
    private readonly config: {
      minLength?: number;
      maxLength?: number;
      pattern?: RegExp;
      allowEmpty?: boolean;
    } = {}
  ) {
    super();
  }

  validate(input: unknown): ValidationResult<string> {
    const errors: ValidationError[] = [];

    if (typeof input !== 'string') {
      return {
        success: false,
        errors: [this.error(this.field, 'Must be a string', 'INVALID_TYPE')],
      };
    }

    const trimmed = input.trim();

    if (!this.config.allowEmpty && trimmed.length === 0) {
      errors.push(this.error(this.field, 'Cannot be empty', 'EMPTY'));
    }

    if (this.config.minLength && trimmed.length < this.config.minLength) {
      errors.push(
        this.error(this.field, `Must be at least ${this.config.minLength} characters`, 'TOO_SHORT')
      );
    }

    if (this.config.maxLength && trimmed.length > this.config.maxLength) {
      errors.push(
        this.error(this.field, `Must be at most ${this.config.maxLength} characters`, 'TOO_LONG')
      );
    }

    if (this.config.pattern && !this.config.pattern.test(trimmed)) {
      errors.push(this.error(this.field, 'Invalid format', 'INVALID_FORMAT'));
    }

    if (errors.length > 0) {
      return { success: false, errors };
    }

    return { success: true, value: trimmed };
  }
}

// Email validator
export class EmailValidator extends StringValidator {
  private static readonly EMAIL_PATTERN =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  constructor(field: string) {
    super(field, {
      maxLength: 254, // RFC 5321
      pattern: EmailValidator.EMAIL_PATTERN,
    });
  }
}

// Composite validator for request DTOs
export class ObjectValidator<T extends Record<string, unknown>> extends Validator<T> {
  constructor(private readonly validators: Record<keyof T, Validator<unknown>>) {
    super();
  }

  validate(input: unknown): ValidationResult<T> {
    if (typeof input !== 'object' || input === null) {
      return {
        success: false,
        errors: [{ field: 'root', message: 'Must be an object', code: 'INVALID_TYPE' }],
      };
    }

    const errors: ValidationError[] = [];
    const result: Partial<T> = {};

    for (const [field, validator] of Object.entries(this.validators)) {
      const fieldValue = (input as Record<string, unknown>)[field];
      const fieldResult = validator.validate(fieldValue);

      if (fieldResult.success) {
        result[field as keyof T] = fieldResult.value as T[keyof T];
      } else {
        errors.push(...fieldResult.errors);
      }
    }

    if (errors.length > 0) {
      return { success: false, errors };
    }

    return { success: true, value: result as T };
  }
}
```

### Using Validators in Handlers

```typescript
// src/application/dto/CreateUserRequest.ts
import {
  ObjectValidator,
  StringValidator,
  EmailValidator,
} from '../../domain/validation/Validator';

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
}

export const createUserValidator = new ObjectValidator<CreateUserRequest>({
  name: new StringValidator('name', {
    minLength: 2,
    maxLength: 100,
  }),
  email: new EmailValidator('email'),
  password: new StringValidator('password', {
    minLength: 12,
    maxLength: 128,
  }),
});

// In handler
export async function handleCreateUser(request: Request): Promise<Response> {
  const body = await request.json();
  const validation = createUserValidator.validate(body);

  if (!validation.success) {
    // Return validation errors as HTML partial for HTMX
    return new Response(renderValidationErrors(validation.errors), {
      status: 422,
      headers: { 'Content-Type': 'text/html' },
    });
  }

  // Proceed with validated data
  const user = await createUser(validation.value);
  return new Response(renderUserCreated(user));
}
```

### Allowlist Validation Pattern

For fixed-set inputs like select boxes:

```typescript
// src/domain/validation/AllowlistValidator.ts
export class AllowlistValidator<T extends string> extends Validator<T> {
  constructor(
    private readonly field: string,
    private readonly allowedValues: readonly T[]
  ) {
    super();
  }

  validate(input: unknown): ValidationResult<T> {
    if (typeof input !== 'string') {
      return {
        success: false,
        errors: [this.error(this.field, 'Must be a string', 'INVALID_TYPE')],
      };
    }

    if (!this.allowedValues.includes(input as T)) {
      // Log as security event - this shouldn't happen with valid client
      console.warn('Allowlist violation', {
        field: this.field,
        value: input,
        allowed: this.allowedValues,
      });

      return {
        success: false,
        errors: [this.error(this.field, 'Invalid selection', 'NOT_IN_ALLOWLIST')],
      };
    }

    return { success: true, value: input as T };
  }
}

// Usage
const TASK_STATUSES = ['pending', 'in_progress', 'completed', 'cancelled'] as const;
type TaskStatus = (typeof TASK_STATUSES)[number];

const statusValidator = new AllowlistValidator<TaskStatus>('status', TASK_STATUSES);
```

---

## 8. Database Security with D1

### Parameterized Queries: The Foundation

D1 uses SQLite and supports parameterized queries that prevent SQL injection:

```typescript
// src/infrastructure/repositories/D1TaskRepository.ts
import type { TaskRepository } from '../../domain/interfaces/TaskRepository';
import type { Task } from '../../domain/entities/Task';

export class D1TaskRepository implements TaskRepository {
  constructor(private readonly db: D1Database) {}

  async findById(id: string): Promise<Task | null> {
    // ✅ CORRECT: Parameterized query
    const result = await this.db
      .prepare('SELECT * FROM tasks WHERE id = ?')
      .bind(id)
      .first<TaskRow>();

    if (!result) return null;
    return this.mapToEntity(result);
  }

  async findByUser(userId: string, filters: TaskFilters): Promise<Task[]> {
    // Build query safely with parameters
    const conditions: string[] = ['user_id = ?'];
    const params: (string | number)[] = [userId];

    if (filters.status) {
      conditions.push('status = ?');
      params.push(filters.status);
    }

    if (filters.createdAfter) {
      conditions.push('created_at > ?');
      params.push(filters.createdAfter.toISOString());
    }

    // ✅ CORRECT: Dynamic query with parameterized values
    const query = `
      SELECT * FROM tasks 
      WHERE ${conditions.join(' AND ')}
      ORDER BY created_at DESC
      LIMIT ?
    `;
    params.push(filters.limit ?? 50);

    const stmt = this.db.prepare(query);
    const bound = params.reduce((s, p) => s.bind(p), stmt);

    const results = await bound.all<TaskRow>();
    return results.results.map((row) => this.mapToEntity(row));
  }

  // ❌ WRONG: Never do this
  async findByIdUnsafe(id: string): Promise<Task | null> {
    // This is vulnerable to SQL injection!
    const result = await this.db.prepare(`SELECT * FROM tasks WHERE id = '${id}'`).first<TaskRow>();
    // ...
  }
}
```

### Safe Dynamic Queries

When you need dynamic column names or ordering:

```typescript
// src/infrastructure/repositories/QueryBuilder.ts
const ALLOWED_SORT_COLUMNS = new Set(['created_at', 'updated_at', 'title', 'status']);
const ALLOWED_DIRECTIONS = new Set(['ASC', 'DESC']);

export function buildSafeOrderClause(column: string, direction: string): string {
  // Validate against allowlist
  if (!ALLOWED_SORT_COLUMNS.has(column)) {
    throw new Error(`Invalid sort column: ${column}`);
  }

  const normalizedDirection = direction.toUpperCase();
  if (!ALLOWED_DIRECTIONS.has(normalizedDirection)) {
    throw new Error(`Invalid sort direction: ${direction}`);
  }

  // Safe to interpolate because we've validated against allowlist
  return `ORDER BY ${column} ${normalizedDirection}`;
}
```

### Preventing Mass Assignment

Only update allowed fields:

```typescript
// src/infrastructure/repositories/D1TaskRepository.ts
export class D1TaskRepository implements TaskRepository {
  private static readonly UPDATABLE_FIELDS = new Set([
    'title',
    'description',
    'status',
    'due_date',
  ]);

  async update(id: string, updates: Partial<Task>): Promise<void> {
    const setClauses: string[] = [];
    const params: unknown[] = [];

    for (const [field, value] of Object.entries(updates)) {
      // Only allow updating specific fields
      if (!D1TaskRepository.UPDATABLE_FIELDS.has(field)) {
        console.warn('Attempted to update non-updatable field', { field, id });
        continue;
      }

      setClauses.push(`${field} = ?`);
      params.push(value);
    }

    if (setClauses.length === 0) {
      return; // Nothing to update
    }

    params.push(id);

    await this.db
      .prepare(`UPDATE tasks SET ${setClauses.join(', ')} WHERE id = ?`)
      .bind(...params)
      .run();
  }
}
```

### Database Schema Security

Apply security at the schema level:

```sql
-- migrations/0001_initial.sql

-- Users table with secure defaults
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),

    -- Never store plaintext passwords
    -- password_hash should be from a secure hashing function (bcrypt, Argon2, PBKDF2)

    -- Add index for email lookups (case-insensitive)
    UNIQUE (email COLLATE NOCASE)
);

-- Tasks with user foreign key
CREATE TABLE tasks (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create index for user task queries
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
```

---

## 9. Secrets and Environment Variables

### Using Wrangler Secrets

Never store secrets in code or version control. Use Wrangler's secrets management:

```bash
# Add a secret
wrangler secret put JWT_SECRET
# Enter secret value when prompted

# List secrets (names only, not values)
wrangler secret list

# Delete a secret
wrangler secret delete JWT_SECRET
```

### Accessing Secrets in Workers

```typescript
// src/index.ts
export interface Env {
  // KV namespaces
  SESSIONS: KVNamespace;

  // D1 database
  DB: D1Database;

  // Secrets (set via wrangler secret put)
  JWT_SECRET: string;
  CSRF_SECRET: string;

  // Environment variables (set in wrangler.toml)
  ENVIRONMENT: 'development' | 'staging' | 'production';
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Access secrets from env
    const csrfService = new CsrfService(env.CSRF_SECRET);
    // ...
  },
};
```

### Secret Rotation

Implement secret rotation without downtime:

```typescript
// src/infrastructure/security/SecretManager.ts
export class SecretManager {
  constructor(
    private readonly currentSecret: string,
    private readonly previousSecret?: string // Optional, for rotation
  ) {}

  async verify(token: string): Promise<boolean> {
    // Try current secret first
    if (await this.verifyWithSecret(token, this.currentSecret)) {
      return true;
    }

    // Fall back to previous secret during rotation window
    if (this.previousSecret) {
      return await this.verifyWithSecret(token, this.previousSecret);
    }

    return false;
  }

  async sign(data: string): Promise<string> {
    // Always sign with current secret
    return await this.signWithSecret(data, this.currentSecret);
  }

  private async verifyWithSecret(token: string, secret: string): Promise<boolean> {
    // Implementation
  }

  private async signWithSecret(data: string, secret: string): Promise<string> {
    // Implementation
  }
}
```

### Environment-Specific Configuration

```toml
# wrangler.toml
name = "my-app"
main = "src/index.ts"

# Production settings
[env.production]
vars = { ENVIRONMENT = "production" }

# Staging settings
[env.staging]
vars = { ENVIRONMENT = "staging" }
```

```typescript
// src/config/index.ts
export function getConfig(env: Env) {
  const isProduction = env.ENVIRONMENT === 'production';

  return {
    session: {
      duration: isProduction ? 86400 : 604800, // 1 day prod, 1 week dev
      secure: isProduction,
    },
    csrf: {
      enabled: true, // Always enabled
    },
    logging: {
      level: isProduction ? 'warn' : 'debug',
    },
  };
}
```

---

## 10. Rate Limiting and DDoS Protection

### Cloudflare Workers Rate Limiting API

The Rate Limiting API is now generally available (September 2025):

```typescript
// wrangler.toml
[[rate_limits]]
binding = "RATE_LIMITER"
namespace_id = 1001
limit = 100
period = 60 # 100 requests per minute
```

```typescript
// src/index.ts
export interface Env {
  RATE_LIMITER: RateLimit;
  // ...
}

// src/presentation/middleware/rateLimit.ts
export async function rateLimitMiddleware(request: Request, env: Env): Promise<Response | null> {
  const clientIP = request.headers.get('CF-Connecting-IP') ?? 'unknown';

  const { success } = await env.RATE_LIMITER.limit({
    key: clientIP,
  });

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

### KV-Based Sliding Window Rate Limiter

For more granular control, implement a sliding window algorithm using KV:

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

interface RateLimitState {
  requests: number[];
  blockedUntil: number | null;
}

export class KVRateLimiter {
  private static readonly KEY_PREFIX = 'ratelimit:';

  constructor(private readonly kv: KVNamespace) {}

  /**
   * Checks and increments the rate limit counter using sliding window
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

    // Filter to requests within current window (sliding window)
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
```

### Rate Limiting Middleware with Headers

```typescript
// src/presentation/middleware/rateLimiter.ts

import {
  KVRateLimiter,
  RATE_LIMIT_CONFIGS,
  type RateLimitResult,
} from '@infrastructure/security/KVRateLimiter';

export function createRateLimitMiddleware(rateLimiter: KVRateLimiter) {
  return async function rateLimitMiddleware(request: Request): Promise<Response | null> {
    const url = new URL(request.url);
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

    if (!result.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          retryAfter: result.retryAfter,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': result.resetAt.toISOString(),
            'Retry-After': String(result.retryAfter ?? 60),
          },
        }
      );
    }

    return null; // Continue processing
  };
}
```

### Login Protection with Per-Account Limits

Combine IP-based and per-account rate limiting for defense in depth:

```typescript
// src/presentation/handlers/auth.ts

import { User } from '@domain/entities/User';
import { Argon2Hasher } from '@infrastructure/security/Argon2Hasher';
import { KVRateLimiter, RATE_LIMIT_CONFIGS } from '@infrastructure/security/KVRateLimiter';

export class AuthHandler {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly sessionManager: SessionManager,
    private readonly rateLimiter: KVRateLimiter,
    private readonly hasher: Argon2Hasher
  ) {}

  async handleLogin(request: Request): Promise<Response> {
    const clientIp = request.headers.get('CF-Connecting-IP') ?? 'unknown';

    // Check IP-based rate limit first
    const ipLimit = await this.rateLimiter.checkLimit(clientIp, 'login', RATE_LIMIT_CONFIGS.login);

    if (!ipLimit.allowed) {
      return this.rateLimitResponse(ipLimit);
    }

    // Parse credentials
    const formData = await request.formData();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // Check per-account rate limit
    const accountLimit = await this.rateLimiter.checkLimit(
      email.toLowerCase(),
      'loginPerAccount',
      RATE_LIMIT_CONFIGS.loginPerAccount
    );

    if (!accountLimit.allowed) {
      // Don't reveal if account exists - use same message
      return this.loginFailedResponse('Too many login attempts. Please try again later.');
    }

    // Find user
    const user = await this.userRepository.findByEmail(email);

    if (user === null) {
      // Constant-time delay to prevent account enumeration
      await this.hasher.hash('dummy-password-for-timing');
      return this.loginFailedResponse();
    }

    // Check if account is locked
    if (user.isLocked()) {
      const remaining = user.getLockoutRemainingSeconds();
      return new Response(renderLoginLocked(remaining), { status: 423 });
    }

    // Verify password
    const passwordValid = await this.hasher.verify(password, user.passwordHash);

    if (!passwordValid) {
      // Record failed attempt
      const updatedUser = user.recordFailedLogin();
      await this.userRepository.save(updatedUser);
      return this.loginFailedResponse();
    }

    // Success! Clear rate limits and update user
    await this.rateLimiter.reset(email.toLowerCase(), 'loginPerAccount');

    const updatedUser = user.recordSuccessfulLogin(clientIp);
    await this.userRepository.save(updatedUser);

    // Create session
    const { session, cookies } = await this.sessionManager.createSession(user.id, request);

    // Redirect with session cookies
    return new Response(null, {
      status: 302,
      headers: {
        Location: '/dashboard',
        'Set-Cookie': cookies.join(', '),
      },
    });
  }

  private loginFailedResponse(message?: string): Response {
    return new Response(renderLoginFailed(message), { status: 401 });
  }

  private rateLimitResponse(result: RateLimitResult): Response {
    return new Response(renderRateLimitExceeded(result.retryAfter ?? 60), {
      status: 429,
      headers: {
        'Retry-After': String(result.retryAfter ?? 60),
      },
    });
  }
}
```

---

## 11. HTTP Security Headers

### Complete Security Headers Middleware

```typescript
// src/presentation/middleware/securityHeaders.ts
export interface SecurityHeadersConfig {
  cspNonce?: string;
  reportUri?: string;
}

export function addSecurityHeaders(
  response: Response,
  config: SecurityHeadersConfig = {}
): Response {
  const headers = new Headers(response.headers);

  // Strict Transport Security (HSTS)
  // 2 years, include subdomains, allow preloading
  headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');

  // Content Security Policy
  const cspDirectives = [
    "default-src 'self'",
    config.cspNonce ? `script-src 'self' 'nonce-${config.cspNonce}'` : "script-src 'self'",
    "style-src 'self' 'unsafe-inline'", // Required for Tailwind
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "object-src 'none'",
    'upgrade-insecure-requests',
  ];

  if (config.reportUri) {
    cspDirectives.push(`report-uri ${config.reportUri}`);
  }

  headers.set('Content-Security-Policy', cspDirectives.join('; '));

  // Prevent MIME type sniffing
  headers.set('X-Content-Type-Options', 'nosniff');

  // Clickjacking protection (backup for CSP frame-ancestors)
  headers.set('X-Frame-Options', 'DENY');

  // XSS protection (legacy, mostly for older browsers)
  headers.set('X-XSS-Protection', '1; mode=block');

  // Referrer policy
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions policy (restrict browser features)
  headers.set(
    'Permissions-Policy',
    'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()'
  );

  // Prevent caching of sensitive responses
  if (response.headers.get('Content-Type')?.includes('text/html')) {
    headers.set('Cache-Control', 'no-store, max-age=0');
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
```

### Header Reference Table

| Header                      | Value                                          | Purpose                        |
| --------------------------- | ---------------------------------------------- | ------------------------------ |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | Force HTTPS                    |
| `Content-Security-Policy`   | See above                                      | Prevent XSS, data injection    |
| `X-Content-Type-Options`    | `nosniff`                                      | Prevent MIME sniffing          |
| `X-Frame-Options`           | `DENY`                                         | Prevent clickjacking           |
| `X-XSS-Protection`          | `1; mode=block`                                | Legacy XSS filter              |
| `Referrer-Policy`           | `strict-origin-when-cross-origin`              | Control referrer info          |
| `Permissions-Policy`        | Deny unused features                           | Reduce attack surface          |
| `Cache-Control`             | `no-store`                                     | Prevent caching sensitive data |

---

## 12. Secure TypeScript Patterns

### Strict Type Checking

Enable maximum type safety in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": true
  }
}
```

### Type-Safe Request Handling

```typescript
// src/presentation/handlers/types.ts
import type { Env } from '../index';

export interface RequestContext {
  request: Request;
  env: Env;
  params: Record<string, string>;
  session: Session | null;
}

export type Handler = (ctx: RequestContext) => Promise<Response>;

// Type-safe route definitions
export interface Route {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  handler: Handler;
  middleware?: Middleware[];
  requiresAuth?: boolean;
}

export type Middleware = (ctx: RequestContext, next: () => Promise<Response>) => Promise<Response>;
```

### Branded Types for Security

Use branded types to distinguish between sanitized and unsanitized data:

```typescript
// src/domain/types/branded.ts
declare const brand: unique symbol;

type Brand<T, B> = T & { [brand]: B };

// Unsafe string (raw user input)
export type UnsafeString = string;

// Sanitized string (HTML-encoded)
export type SafeHtmlString = Brand<string, 'SafeHtml'>;

// Validated email
export type ValidatedEmail = Brand<string, 'ValidatedEmail'>;

// Validated UUID
export type ValidatedUUID = Brand<string, 'ValidatedUUID'>;

// Type guards/constructors
export function sanitizeForHtml(unsafe: UnsafeString): SafeHtmlString {
  return HtmlEncoder.encodeForHtml(unsafe) as SafeHtmlString;
}

export function validateEmail(input: UnsafeString): ValidatedEmail | null {
  if (EMAIL_REGEX.test(input)) {
    return input as ValidatedEmail;
  }
  return null;
}

export function validateUUID(input: UnsafeString): ValidatedUUID | null {
  if (UUID_REGEX.test(input)) {
    return input as ValidatedUUID;
  }
  return null;
}
```

### Result Types for Error Handling

Avoid throwing exceptions for expected failures:

```typescript
// src/domain/types/Result.ts
export type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

export function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

// Usage in services
export class AuthService {
  async login(email: string, password: string): Promise<Result<User, AuthError>> {
    const user = await this.userRepo.findByEmail(email);

    if (!user) {
      return err({ code: 'USER_NOT_FOUND', message: 'Invalid credentials' });
    }

    const isValid = await this.passwordService.verify(password, user.passwordHash);

    if (!isValid) {
      return err({ code: 'INVALID_PASSWORD', message: 'Invalid credentials' });
    }

    return ok(user);
  }
}

// Usage in handler
export async function handleLogin(ctx: RequestContext): Promise<Response> {
  const result = await authService.login(email, password);

  if (!result.ok) {
    // Handle specific error types
    return renderLoginError(result.error);
  }

  // Create session with validated user
  return createSessionAndRedirect(result.value);
}
```

---

## 13. HTMX-Specific Security

### Four Golden Rules for HTMX Security

Following the official HTMX security guidance:

1. **Only call trusted routes** - Use relative URLs only
2. **Use HttpOnly cookies** - Prevent JavaScript access to auth tokens
3. **Escape user content** - Server-side HTML encoding
4. **Set SameSite=Lax** - Prevent CSRF via cookie policy

### Secure HTMX Configuration

```html
<head>
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
</head>
```

### Protecting Against Attribute Injection

When rendering user content that might contain HTMX attributes:

```typescript
// src/presentation/templates/partials/comment.ts
import { html } from '../html';

export function renderComment(comment: Comment): string {
  // The hx-disable zone prevents any HTMX attributes from working
  return html`
    <div class="comment" hx-disable>
      <p class="author">${comment.authorName}</p>
      <div class="content">${comment.content}</div>
    </div>
  `;
}
```

### URL Validation for HTMX

Validate that HTMX targets are safe:

```typescript
// src/presentation/middleware/htmxSecurity.ts
export function validateHtmxRequest(request: Request): boolean {
  const htmxRequest = request.headers.get('HX-Request') === 'true';

  if (!htmxRequest) {
    return true; // Not an HTMX request
  }

  const currentUrl = request.headers.get('HX-Current-URL');

  if (currentUrl) {
    const current = new URL(currentUrl);
    const target = new URL(request.url);

    // Ensure request comes from same origin
    if (current.origin !== target.origin) {
      console.warn('Cross-origin HTMX request blocked', {
        from: current.origin,
        to: target.origin,
      });
      return false;
    }
  }

  return true;
}
```

### Secure History Handling

Prevent sensitive data from being cached in browser history:

```typescript
// For sensitive pages, prevent history caching
export function renderSecurePage(content: string): Response {
  const headers = new Headers({
    'Content-Type': 'text/html',
    'Cache-Control': 'no-store, max-age=0',
    'HX-Push-Url': 'false', // Prevent URL from being pushed to history
  });

  return new Response(content, { headers });
}
```

---

## 14. Alpine.js Security Considerations

### Expression Injection Prevention

Alpine.js evaluates expressions in `x-data`, `x-bind`, `@click`, etc. Prevent user data from being evaluated:

```typescript
// ❌ WRONG: User input in Alpine expression
function renderProfile(user: User): string {
  return `
    <div x-data="{ name: '${user.name}' }">
      <span x-text="name"></span>
    </div>
  `;
}

// ✅ CORRECT: Separate data from template
function renderProfile(user: User): string {
  // Encode the name for safe inclusion in HTML
  const encodedName = HtmlEncoder.encodeForHtml(user.name);

  return html`
    <div x-data="{ name: '' }" x-init="name = $el.dataset.name" data-name="${encodedName}">
      <span x-text="name"></span>
    </div>
  `;
}

// ✅ BETTER: Use pre-defined components
// In your JavaScript:
Alpine.data('profile', (initialName) => ({
  name: initialName,
}));

// In template:
function renderProfile(user: User): string {
  return html`
    <div x-data="profile('${HtmlEncoder.encodeForJavaScript(user.name)}')">
      <span x-text="name"></span>
    </div>
  `;
}
```

### Content Isolation

Use Alpine's built-in content isolation:

```html
<!-- User content cannot execute Alpine expressions -->
<div class="user-comment" x-ignore>${renderUserContent(comment)}</div>
```

### Safe Event Handling

```typescript
// ❌ WRONG: User input in event handler
`<button @click="${userAction}">Click</button>`
// ✅ CORRECT: Pre-defined handlers only
`<button @click="handleUserAction('${HtmlEncoder.encodeForJavaScript(userId)}')">
  Click
</button>`;

// With pre-defined handler:
Alpine.data('actions', () => ({
  handleUserAction(userId) {
    // Validated handling
  },
}));
```

---

## 15. Security Testing Strategies

### Unit Testing Security Controls

```typescript
// src/infrastructure/security/__tests__/CsrfService.spec.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { CsrfService } from '../CsrfService';
import { createMockKV } from '../../../tests/mocks';

describe('CsrfService', () => {
  let csrfService: CsrfService;
  let mockKV: KVNamespace;

  beforeEach(() => {
    mockKV = createMockKV();
    csrfService = new CsrfService(mockKV);
  });

  describe('generateToken', () => {
    it('generates cryptographically secure token', async () => {
      const token = await csrfService.generateToken('session-1');

      // Token should be sufficiently long
      expect(token.length).toBeGreaterThanOrEqual(32);

      // Token should be URL-safe base64
      expect(token).toMatch(/^[A-Za-z0-9+/=]+$/);
    });

    it('generates unique tokens', async () => {
      const tokens = await Promise.all(
        Array(100)
          .fill(null)
          .map(() => csrfService.generateToken('session-1'))
      );

      const uniqueTokens = new Set(tokens);
      expect(uniqueTokens.size).toBe(100);
    });
  });

  describe('validateToken', () => {
    it('accepts valid token', async () => {
      const token = await csrfService.generateToken('session-1');
      const isValid = await csrfService.validateToken('session-1', token);

      expect(isValid).toBe(true);
    });

    it('rejects modified token', async () => {
      const token = await csrfService.generateToken('session-1');
      const modifiedToken = token.slice(0, -1) + 'X';

      const isValid = await csrfService.validateToken('session-1', modifiedToken);

      expect(isValid).toBe(false);
    });

    it('rejects token for different session', async () => {
      const token = await csrfService.generateToken('session-1');
      const isValid = await csrfService.validateToken('session-2', token);

      expect(isValid).toBe(false);
    });
  });
});
```

### Integration Testing for Security

```typescript
// src/presentation/handlers/__tests__/auth.integration.test.ts
import { describe, it, expect } from 'vitest';
import { createTestApp } from '../../../tests/helpers/testApp';

describe('Authentication Security', () => {
  describe('Login endpoint', () => {
    it('rate limits login attempts', async () => {
      const app = await createTestApp();

      // Make multiple failed login attempts
      for (let i = 0; i < 6; i++) {
        await app.fetch('/auth/login', {
          method: 'POST',
          body: new URLSearchParams({
            email: 'test@example.com',
            password: 'wrong-password',
          }),
        });
      }

      // Next attempt should be rate limited
      const response = await app.fetch('/auth/login', {
        method: 'POST',
        body: new URLSearchParams({
          email: 'test@example.com',
          password: 'wrong-password',
        }),
      });

      expect(response.status).toBe(429);
    });

    it('prevents timing attacks on user enumeration', async () => {
      const app = await createTestApp();

      // Time response for existing user
      const start1 = performance.now();
      await app.fetch('/auth/login', {
        method: 'POST',
        body: new URLSearchParams({
          email: 'existing@example.com',
          password: 'wrong',
        }),
      });
      const time1 = performance.now() - start1;

      // Time response for non-existing user
      const start2 = performance.now();
      await app.fetch('/auth/login', {
        method: 'POST',
        body: new URLSearchParams({
          email: 'nonexistent@example.com',
          password: 'wrong',
        }),
      });
      const time2 = performance.now() - start2;

      // Times should be similar (within 50ms tolerance)
      expect(Math.abs(time1 - time2)).toBeLessThan(50);
    });
  });
});
```

### XSS Testing

```typescript
// src/presentation/templates/__tests__/xss.spec.ts
describe('XSS Prevention', () => {
  const xssPayloads = [
    '<script>alert("XSS")</script>',
    '<img src=x onerror=alert("XSS")>',
    '"><script>alert("XSS")</script>',
    "'; alert('XSS'); //",
    '<svg onload=alert("XSS")>',
    'javascript:alert("XSS")',
    '<iframe src="javascript:alert(\'XSS\')">',
  ];

  xssPayloads.forEach((payload) => {
    it(`escapes XSS payload: ${payload.slice(0, 30)}...`, () => {
      const result = renderUserContent({ content: payload });

      // Should not contain unescaped script
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('onerror=');
      expect(result).not.toContain('onload=');
      expect(result).not.toContain('javascript:');

      // Should contain escaped entities
      expect(result).toContain('&lt;');
    });
  });
});
```

### SQL Injection Testing

```typescript
// src/infrastructure/repositories/__tests__/sqlInjection.spec.ts
describe('SQL Injection Prevention', () => {
  const sqlPayloads = [
    "'; DROP TABLE users; --",
    "' OR '1'='1",
    "1; SELECT * FROM users WHERE '1'='1",
    "' UNION SELECT password FROM users --",
    "'; WAITFOR DELAY '0:0:10'--",
  ];

  sqlPayloads.forEach((payload) => {
    it(`handles SQL injection attempt: ${payload.slice(0, 30)}...`, async () => {
      const repo = new D1TaskRepository(mockDb);

      // Should not throw or return unexpected data
      const result = await repo.findById(payload);

      expect(result).toBeNull();

      // Verify no SQL was executed
      expect(mockDb.exec).not.toHaveBeenCalled();
    });
  });
});
```

---

## 16. Incident Response and Monitoring

### Security Logging

```typescript
// src/infrastructure/logging/SecurityLogger.ts
export interface SecurityEvent {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  ip: string;
  userAgent: string;
  path: string;
  details: Record<string, unknown>;
  timestamp: string;
}

export class SecurityLogger {
  async log(event: SecurityEvent): Promise<void> {
    // Log to console for Cloudflare dashboard
    console.log(
      JSON.stringify({
        level: event.severity === 'critical' ? 'error' : 'warn',
        type: 'security_event',
        ...event,
      })
    );

    // Could also send to external SIEM
  }

  async logAuthFailure(request: Request, reason: string): Promise<void> {
    await this.log({
      type: 'auth_failure',
      severity: 'medium',
      ip: request.headers.get('CF-Connecting-IP') ?? 'unknown',
      userAgent: request.headers.get('User-Agent') ?? 'unknown',
      path: new URL(request.url).pathname,
      details: { reason },
      timestamp: new Date().toISOString(),
    });
  }

  async logCsrfViolation(request: Request): Promise<void> {
    await this.log({
      type: 'csrf_violation',
      severity: 'high',
      ip: request.headers.get('CF-Connecting-IP') ?? 'unknown',
      userAgent: request.headers.get('User-Agent') ?? 'unknown',
      path: new URL(request.url).pathname,
      details: {
        method: request.method,
        origin: request.headers.get('Origin'),
        referer: request.headers.get('Referer'),
      },
      timestamp: new Date().toISOString(),
    });
  }

  async logRateLimitExceeded(request: Request, limitType: string, key: string): Promise<void> {
    await this.log({
      type: 'rate_limit_exceeded',
      severity: 'low',
      ip: request.headers.get('CF-Connecting-IP') ?? 'unknown',
      userAgent: request.headers.get('User-Agent') ?? 'unknown',
      path: new URL(request.url).pathname,
      details: { limitType, key },
      timestamp: new Date().toISOString(),
    });
  }
}
```

### Anomaly Detection

```typescript
// src/infrastructure/security/AnomalyDetector.ts
export class AnomalyDetector {
  constructor(private readonly kv: KVNamespace) {}

  async checkForAnomalies(userId: string, request: Request): Promise<string[]> {
    const anomalies: string[] = [];

    const userKey = `user_profile:${userId}`;
    const profile = (await this.kv.get(userKey, 'json')) as UserProfile | null;

    if (!profile) {
      return anomalies;
    }

    // Check for geographical anomaly
    const currentCountry = request.headers.get('CF-IPCountry');
    if (currentCountry && !profile.knownCountries.includes(currentCountry)) {
      anomalies.push(`New country detected: ${currentCountry}`);
    }

    // Check for unusual time
    const hour = new Date().getUTCHours();
    if (!this.isWithinUsualHours(hour, profile.usualHours)) {
      anomalies.push('Access at unusual time');
    }

    // Check for new user agent
    const userAgent = request.headers.get('User-Agent') ?? '';
    const uaHash = await this.hashUserAgent(userAgent);
    if (!profile.knownUserAgents.includes(uaHash)) {
      anomalies.push('New device/browser detected');
    }

    return anomalies;
  }

  private isWithinUsualHours(hour: number, usual: number[]): boolean {
    return usual.some((h) => Math.abs(h - hour) <= 2);
  }

  private async hashUserAgent(ua: string): Promise<string> {
    const encoder = new TextEncoder();
    const hash = await crypto.subtle.digest('SHA-256', encoder.encode(ua));
    return btoa(String.fromCharCode(...new Uint8Array(hash))).slice(0, 16);
  }
}
```

---

## 17. Complete Security Implementation Example

### Main Entry Point with Security

```typescript
// src/index.ts
import { Router } from './router';
import { addSecurityHeaders } from './presentation/middleware/securityHeaders';
import { rateLimitMiddleware } from './presentation/middleware/rateLimit';
import { csrfMiddleware } from './presentation/middleware/csrf';
import { authMiddleware } from './presentation/middleware/auth';
import { SecurityLogger } from './infrastructure/logging/SecurityLogger';

export interface Env {
  DB: D1Database;
  SESSIONS: KVNamespace;
  RATE_LIMITER: RateLimit;
  CSRF_SECRET: string;
  ENVIRONMENT: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const logger = new SecurityLogger();
    const router = new Router(env);

    try {
      // 1. Rate limiting (first line of defense)
      const rateLimitResult = await rateLimitMiddleware(request, env);
      if (rateLimitResult) {
        await logger.logRateLimitExceeded(request, 'general', 'ip');
        return rateLimitResult;
      }

      // 2. Session validation
      const { session, sessionId } = await authMiddleware(request, env);

      // 3. CSRF validation (for state-changing requests)
      const csrfResult = await csrfMiddleware(request, sessionId, env);
      if (csrfResult) {
        await logger.logCsrfViolation(request);
        return csrfResult;
      }

      // 4. Route handling
      const response = await router.handle(request, session);

      // 5. Apply security headers
      return addSecurityHeaders(response, {
        nonce: crypto.randomUUID(),
      });
    } catch (error) {
      console.error('Unhandled error', error);

      // Don't leak error details in production
      const message = env.ENVIRONMENT === 'production' ? 'An error occurred' : String(error);

      return addSecurityHeaders(new Response(message, { status: 500 }));
    }
  },
};
```

### Secure Handler Example

```typescript
// src/presentation/handlers/TaskHandlers.ts
import { html, safe } from '../templates/html';
import type { RequestContext } from './types';
import { createTaskValidator } from '../../application/dto/CreateTaskRequest';

export async function handleCreateTask(ctx: RequestContext): Promise<Response> {
  // 1. Require authentication
  if (!ctx.session) {
    return new Response(null, {
      status: 303,
      headers: { Location: '/auth/login' },
    });
  }

  // 2. Parse and validate input
  const formData = await ctx.request.formData();
  const input = {
    title: formData.get('title'),
    description: formData.get('description'),
    status: formData.get('status'),
  };

  const validation = createTaskValidator.validate(input);

  if (!validation.success) {
    // Return validation errors as HTMX partial
    return new Response(renderValidationErrors(validation.errors), {
      status: 422,
      headers: { 'Content-Type': 'text/html' },
    });
  }

  // 3. Execute use case with validated data
  const createTask = new CreateTaskUseCase(ctx.env.DB);
  const task = await createTask.execute({
    ...validation.value,
    userId: ctx.session.userId,
  });

  // 4. Return safe HTML response
  const response = new Response(renderTaskCreated(task), {
    status: 201,
    headers: { 'Content-Type': 'text/html' },
  });

  return response;
}

function renderTaskCreated(task: Task): string {
  // All user data is automatically encoded by html``
  return html`
    <div class="alert alert-success">
      <span>Task "${task.title}" created successfully!</span>
    </div>
    <div id="task-list" hx-swap-oob="afterbegin">${renderTaskItem(task)}</div>
  `;
}
```

---

## Security Checklist

Use this checklist when developing and reviewing your application:

### Transport Security

- [ ] HTTPS enforced via Cloudflare
- [ ] HSTS header with preload directive (2+ years max-age)
- [ ] TLS 1.2+ required (prefer 1.3)

### Password Security

- [ ] Argon2id with OWASP-recommended parameters (19+ MiB memory, 2+ iterations)
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

- [ ] CSRF tokens tied to user sessions
- [ ] Double-submit cookie pattern implemented
- [ ] CSRF tokens generated with cryptographic randomness
- [ ] Origin header validation as additional protection
- [ ] All state-changing requests require CSRF validation

### Rate Limiting

- [ ] Login attempts limited per IP address
- [ ] Login attempts limited per account (sliding window)
- [ ] Account lockout after excessive failed attempts
- [ ] Registration rate limited per IP
- [ ] Password reset rate limited per account

### Brute Force Protection

- [ ] Timing attack prevention (constant-time comparisons)
- [ ] Progressive delays or lockouts on failed attempts
- [ ] Account enumeration prevention
- [ ] Generic error messages for authentication failures

### XSS Prevention

- [ ] HTML output encoding by default
- [ ] HTMX selfRequestsOnly enabled
- [ ] HTMX allowScriptTags disabled
- [ ] hx-disable for user content zones
- [ ] Content Security Policy implemented

### Input Validation

- [ ] Server-side validation for all inputs
- [ ] Allowlist validation for fixed options
- [ ] Type-safe validation with TypeScript
- [ ] Email format validation with normalization

### Database Security

- [ ] Parameterized queries only
- [ ] Least privilege database access
- [ ] Mass assignment prevention
- [ ] Input validation before queries

### Security Headers

- [ ] HSTS enabled with appropriate max-age
- [ ] Content-Security-Policy configured
- [ ] X-Frame-Options set to DENY
- [ ] X-Content-Type-Options set to nosniff
- [ ] Referrer-Policy configured
- [ ] Cache-Control prevents caching of authenticated content

### Secrets Management

- [ ] Secrets stored in Wrangler secrets
- [ ] No secrets in code or config files
- [ ] Secret rotation capability

### Audit and Monitoring

- [ ] Security events logged (login, logout, failures)
- [ ] Failed authentication attempts tracked
- [ ] Account lockouts monitored
- [ ] Anomalous patterns detectable

---

## Conclusion

Securing browser-based interactive web applications on Cloudflare requires a defense-in-depth approach that addresses threats at every layer. The hypermedia-driven architecture using HTMX and Alpine.js provides inherent security advantages—server-controlled state, reduced JavaScript attack surface, and natural integration with traditional security mechanisms—but also requires specific considerations for HTML injection and proper output encoding.

Key takeaways:

1. **Use Argon2id** with OWASP-recommended parameters for password hashing—it provides protection against both GPU-based and side-channel attacks.

2. **Store sessions server-side** in KV with automatic TTL expiration, using `__Host-` prefixed cookies for maximum security.

3. **Tie CSRF tokens to sessions** rather than storing them separately—this ensures tokens expire with sessions and provides stronger binding.

4. **Implement defense-in-depth** with multiple overlapping protections at every layer.

5. **Rate limit aggressively** at multiple levels (IP and account) using sliding window algorithms.

6. **Prevent timing attacks** with constant-time comparisons for all security-sensitive operations.

7. **Never reveal information** that could aid attackers (account enumeration, specific error messages).

8. **Log security events** for monitoring and incident response.

9. **Use TypeScript's type system**: Branded types and strict configuration catch entire classes of errors at compile time.

10. **Test security controls**: Write unit tests for security functions and integration tests for security flows.

The patterns and implementations in this guide provide a solid foundation for building secure applications. As threats evolve, stay current with security research and update your defenses accordingly.

---

_This guide reflects security best practices as of January 2026. For the latest security advisories and updates, consult OWASP, NIST, Cloudflare's security documentation, and the security teams for HTMX and Alpine.js._
