# Security Architecture Overview

**Purpose**: High-level security architecture for session-based authentication on Cloudflare Workers

**When to read**: During specification or early planning phase to understand security layers and threat model

---

## Static-First Routing Model

This architecture follows a static-first routing model where:

- **Static content** (`/`, `/about`, `/pricing`) is served directly by Cloudflare Pages
- **Auth routes** (`/auth/*`) are public and handled by the Worker
- **App routes** (`/app/*`) require authentication and are handled by the Worker
- **HTMX partials** (`/app/_/*`) are authenticated endpoints returning HTML fragments
- **Webhooks** (`/webhooks/*`) use signature verification, not session auth

Auth middleware is applied at the `/app/*` boundary in the router, not at individual handlers.

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
│                     Authentication Layer                             │
│  • Session Management • CSRF Tokens • Cookie Security               │
├─────────────────────────────────────────────────────────────────────┤
│                        Data Layer                                    │
│  • Parameterized Queries • Encryption at Rest • Access Control      │
└─────────────────────────────────────────────────────────────────────┘
```

## Threat Model for Authentication

| Threat Category        | Attack Vectors                      | Primary Mitigations                                |
| ---------------------- | ----------------------------------- | -------------------------------------------------- |
| Credential Attacks     | Brute force, Credential stuffing    | Rate limiting, Account lockout, Argon2id           |
| Session Attacks        | Hijacking, Fixation, Token theft    | Secure cookies, KV storage, Session regeneration   |
| Cross-Site Attacks     | XSS, CSRF, Clickjacking             | CSP, CSRF tokens, X-Frame-Options, Output encoding |
| Information Disclosure | Account enumeration, Timing attacks | Generic errors, Constant-time comparison           |
| Injection              | SQL injection, HTML injection       | Parameterized queries, Safe HTML templates         |

## Browser-to-Server Security Flow

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
│  │  │  └──────────────┘ └──────────────┘ └──────────────────────┘││
│  └─────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

## Data Storage Architecture

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

## Key Architectural Decisions

1. **Session Storage**: KV for session data (fast, edge-replicated)
2. **User Storage**: D1 for persistent user records (relational, durable)
3. **Rate Limiting**: KV for distributed rate limit counters
4. **CSRF Protection**: Signed double-submit cookie pattern
5. **Password Hashing**: Argon2id (primary) or PBKDF2 (fallback)

## Next Steps

- For domain entity implementations → Read `implementation/domain-entities.md`
- For password security details → Read `implementation/password-security.md`
- For session management → Read `implementation/session-management.md`
- For CSRF protection → Read `implementation/csrf-protection.md`
- For XSS prevention → Read `implementation/xss-prevention.md`
