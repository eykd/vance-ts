# Security Architecture Overview

**Purpose**: High-level security architecture for session-based authentication using better-auth + Hono on Cloudflare Workers

**When to read**: During specification or early planning phase to understand security layers and threat model

---

## Static-First Routing Model

This architecture follows a static-first routing model where:

- **Static content** (`/`, `/about`, `/pricing`) is served directly by Cloudflare Pages
- **Auth pages** (`/auth/*`) are public HTML pages (login, register) served by the Worker
- **Auth API** (`/api/auth/*`) are better-auth endpoints (sign-up, sign-in, sign-out, session)
- **App routes** (`/app/*`) require authentication and are handled by the Worker
- **HTMX partials** (`/app/_/*`) are authenticated endpoints returning HTML fragments
- **Webhooks** (`/webhooks/*`) use signature verification, not session auth

Auth middleware is applied at the `/app/*` boundary in the Hono router, not at individual handlers.

---

## Defense-in-Depth Model

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
│                     Authentication Layer (better-auth)               │
│  • Session Management • Cookie Security • Rate Limiting • Hashing   │
├─────────────────────────────────────────────────────────────────────┤
│                        Data Layer                                    │
│  • Parameterized Queries (Kysely) • Encryption at Rest • ACL       │
└─────────────────────────────────────────────────────────────────────┘
```

## Threat Model for Authentication

| Threat Category        | Attack Vectors                      | Primary Mitigations                                    |
| ---------------------- | ----------------------------------- | ------------------------------------------------------ |
| Credential Attacks     | Brute force, Credential stuffing    | better-auth rate limiting, scrypt/Argon2id hashing     |
| Session Attacks        | Hijacking, Fixation, Token theft    | better-auth cookies (HttpOnly, Secure, SameSite), KV   |
| Cross-Site Attacks     | XSS, CSRF, Clickjacking             | CSP, custom CSRF middleware, X-Frame-Options, encoding |
| Information Disclosure | Account enumeration, Timing attacks | better-auth generic errors, constant-time comparison   |
| Injection              | SQL injection, HTML injection       | Kysely parameterized queries, Safe HTML templates      |

## Browser-to-Server Security Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Browser                                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────┐  │
│  │ Session Cookie  │  │  CSRF Token     │  │  HTMX Config        │  │
│  │ (better-auth    │  │  (Header +      │  │  (selfRequestsOnly, │  │
│  │  managed,       │  │   Form Field)   │  │   allowScriptTags   │  │
│  │  HttpOnly)      │  │                 │  │   =false)           │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼ HTTPS Only
┌─────────────────────────────────────────────────────────────────────┐
│                    Cloudflare Edge (Workers + Hono)                   │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │                    Security Middleware Stack                    ││
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────────┐ ││
│  │  │ Security │→│  CSRF    │→│ Session  │→│    Route           │ ││
│  │  │ Headers  │ │ Verify   │ │ Extract  │ │    Handler         │ ││
│  │  │ (custom) │ │ (custom) │ │ (b-auth) │ │    (Hono)          │ ││
│  │  └──────────┘ └──────────┘ └──────────┘ └────────────────────┘ ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │                   better-auth (library-managed)                 ││
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────────┐││
│  │  │ Auth API     │ │ Password     │ │ Session Management       │││
│  │  │ /api/auth/*  │ │ Hashing      │ │ (Create, Validate,       │││
│  │  │ (sign-up,    │ │ (scrypt or   │ │  Refresh, Revoke)        │││
│  │  │  sign-in,    │ │  Argon2id)   │ │                          │││
│  │  │  sign-out)   │ │              │ │                          │││
│  │  └──────────────┘ └──────────────┘ └──────────────────────────┘││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │                    Data Layer                                   ││
│  │  ┌──────────────────────────┐ ┌────────────────────────────────┐││
│  │  │ D1 Database              │ │ KV Store (Secondary Storage)   │││
│  │  │ (better-auth managed)    │ │ (better-auth managed)          │││
│  │  │ • user table             │ │ • Session cache                │││
│  │  │ • session table          │ │ • Rate limit counters          │││
│  │  │ • account table          │ │                                │││
│  │  │ • verification table     │ │                                │││
│  │  └──────────────────────────┘ └────────────────────────────────┘││
│  └─────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

## What better-auth Handles vs What You Implement

### better-auth manages (library code — you configure, not write):

| Concern             | How                                                         |
| ------------------- | ----------------------------------------------------------- |
| User CRUD           | `user` table auto-managed, hooks for custom logic           |
| Password hashing    | scrypt (default) or custom hasher (Argon2id, PBKDF2)        |
| Session lifecycle   | Create, validate, refresh, revoke — stored in D1 + KV cache |
| Cookie security     | HttpOnly, Secure, SameSite=Lax, configurable prefix         |
| Rate limiting       | Per-endpoint rules, IP detection via `cf-connecting-ip`     |
| Email verification  | Token generation + `sendVerificationEmail` callback         |
| Password reset      | Token generation + `sendResetPassword` callback             |
| Account lockout     | Via rate limiting (configurable per-endpoint windows)       |
| Database migrations | Auto-generated via `@better-auth/cli generate`              |

### You implement (custom code):

| Concern                  | Why                                                              |
| ------------------------ | ---------------------------------------------------------------- |
| CSRF middleware          | better-auth has no CSRF tokens; needed for HTMX form submissions |
| XSS prevention           | Server-rendered HTML needs output encoding (framework-agnostic)  |
| Security headers         | CSP, HSTS, X-Frame-Options are not auth-library concerns         |
| Auth page templates      | HTMX + Alpine.js login/register forms (not a JS SPA)             |
| Hono middleware          | Per-request auth instance wiring (D1 bindings are runtime-only)  |
| Open redirect prevention | Validate redirect URLs on login/register callbacks               |

## Data Storage Architecture

```
┌───────────────────────────────────┐   ┌───────────────────────────────┐
│    D1 Database (better-auth)      │   │    KV Store (Secondary)       │
│  ┌─────────────────────────────┐  │   │  ┌─────────────────────────┐  │
│  │ user                       │  │   │  │ Session Cache            │  │
│  │ - id (TEXT PRIMARY KEY)    │  │   │  │ - Reduces D1 reads       │  │
│  │ - name                     │  │   │  │ - TTL-based expiration   │  │
│  │ - email (UNIQUE)           │  │   │  │                         │  │
│  │ - emailVerified            │  │   │  │ Rate Limit Counters     │  │
│  │ - image                    │  │   │  │ - Per-endpoint windows   │  │
│  │ - createdAt, updatedAt     │  │   │  │ - Min TTL: 60s (KV)    │  │
│  ├─────────────────────────────┤  │   │  └─────────────────────────┘  │
│  │ session                    │  │   └───────────────────────────────┘
│  │ - id, token, userId        │  │
│  │ - expiresAt                │  │
│  │ - ipAddress, userAgent     │  │
│  │ - createdAt, updatedAt     │  │
│  ├─────────────────────────────┤  │
│  │ account                    │  │
│  │ - id, userId, providerId   │  │
│  │ - accountId, password      │  │
│  │ - accessToken, refreshToken│  │
│  │ - createdAt, updatedAt     │  │
│  ├─────────────────────────────┤  │
│  │ verification               │  │
│  │ - id, identifier, value    │  │
│  │ - expiresAt, createdAt     │  │
│  └─────────────────────────────┘  │
└───────────────────────────────────┘
```

## Key Architectural Decisions

1. **Auth library**: better-auth — handles user/session/password lifecycle, eliminating ~70% of hand-rolled code
2. **HTTP framework**: Hono — type-safe, lightweight, built for Cloudflare Workers
3. **Database adapter**: Kysely + kysely-d1 via better-auth's Drizzle adapter or direct Kysely adapter
4. **Session storage**: D1 (primary, better-auth managed) + KV (secondary cache via better-auth-cloudflare)
5. **Rate limiting**: better-auth built-in, backed by KV secondary storage (min 60s window for KV TTL)
6. **CSRF protection**: Custom double-submit cookie middleware (better-auth doesn't provide CSRF tokens)
7. **Password hashing**: scrypt (better-auth default, works on Workers paid plan with `nodejs_compat`) or custom PBKDF2 (Web Crypto, works on all tiers)
8. **Per-request auth**: Auth instance created per-request because D1 bindings are only available at runtime in Workers

## Next Steps

- For initial setup and configuration → Read `implementation/better-auth-setup.md`
- For route protection middleware → Read `implementation/hono-auth-middleware.md`
- For CSRF protection → Read `implementation/csrf-protection.md`
- For XSS prevention → Read `implementation/xss-prevention.md`
- For auth page templates → Read `implementation/auth-templates.md`
