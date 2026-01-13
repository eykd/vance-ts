# Secure Session-Based Authentication Pattern

**Purpose**: OWASP-compliant session-based authentication for Cloudflare Workers with HTMX/Alpine.js

**Trigger keywords**: authentication, login, logout, session, password, user registration, auth

---

## Pattern Overview

**What this pattern provides**:

- OWASP-compliant security architecture (January 2026)
- Session-based auth for Cloudflare Workers
- Defense-in-depth with multiple security layers
- Domain-driven design patterns for auth
- Complete implementation examples with tests

**Technologies**:

- Cloudflare Workers (TypeScript)
- D1 Database (user storage)
- KV Storage (sessions, rate limits)
- HTMX + Alpine.js (frontend)
- Argon2id or PBKDF2 (password hashing)

**Security features**:

- Password hashing with Argon2id/PBKDF2
- Session management with KV storage
- CSRF protection (signed double-submit cookie)
- XSS prevention (output encoding, safe templates)
- Rate limiting and account lockout
- Secure cookie configuration

---

## Progressive Disclosure Path

### Level 1: Architecture Overview (~120 lines)

**File**: `architecture/overview.md`

**When to read**: Specification phase, early planning

**What you get**:

- Defense-in-depth security model (5 layers)
- Threat model for authentication (credential attacks, session attacks, XSS, CSRF)
- Browser-to-server security flow diagrams
- Data storage architecture (D1 for users, KV for sessions)
- Key architectural decisions

**Use this when**:

- Writing feature specifications
- Understanding security requirements
- Making high-level design decisions

---

### Level 2: Domain Design (~504 lines)

**File**: `implementation/domain-entities.md`

**When to read**: Planning phase, domain modeling

**What you get**:

- Email value object (validation, normalization)
- Password value object (strength validation, constant-time comparison)
- User entity (account lockout, login tracking)
- Session entity (expiration, CSRF binding)
- Repository interfaces (UserRepository, SessionRepository)
- Testing strategies for domain layer

**Use this when**:

- Designing domain model structure
- Planning entity relationships
- Setting up repository interfaces

---

### Level 3: Implementation Details (choose based on current work)

#### Password Security (~295 lines)

**File**: `implementation/password-security.md`

**When to read**: Implementing user registration or login

**What you get**:

- Argon2id implementation with OWASP parameters
- PBKDF2 fallback (Web Crypto API)
- Unified password service with algorithm detection
- Hash format specifications
- Migration strategy (PBKDF2 → Argon2id)
- Testing patterns for password hashing

**Use this when**:

- Implementing user registration
- Implementing login verification
- Setting up password hashing infrastructure

---

#### Session Management (~373 lines)

**File**: `implementation/session-management.md`

**When to read**: Implementing session persistence

**What you get**:

- KV session repository implementation
- Session data structure
- Cookie security configuration (\_\_Host- prefix, HttpOnly, Secure, SameSite)
- Session lifecycle (create, validate, destroy, revoke all)
- Session ID generation (256-bit entropy)
- Testing patterns for session storage

**Use this when**:

- Implementing session storage layer
- Setting up session cookies
- Building logout functionality
- Implementing "logout everywhere" feature

---

#### CSRF Protection (~384 lines)

**File**: `implementation/csrf-protection.md`

**When to read**: Implementing form submissions

**What you get**:

- Signed double-submit cookie pattern
- CSRF middleware implementation
- CSRF token generation
- HTMX integration (global headers, event listeners)
- Traditional form integration (hidden fields)
- Origin/Referer validation
- Testing patterns for CSRF protection

**Use this when**:

- Implementing POST/PUT/PATCH/DELETE endpoints
- Setting up HTMX forms
- Building traditional HTML forms
- Configuring middleware stack

---

#### XSS Prevention (~458 lines)

**File**: `implementation/xss-prevention.md`

**When to read**: Implementing server-rendered templates

**What you get**:

- HTML encoder (context-specific encoding)
- Safe HTML tagged template literal system
- HTMX security configuration (hx-disable, allowScriptTags: false)
- Content Security Policy (CSP) setup
- URL validation patterns
- Testing patterns for XSS prevention

**Use this when**:

- Building HTML templates
- Rendering user-provided content
- Setting up HTMX responses
- Configuring security headers

---

## Usage by Phase

### Specification Phase (`/sp:02-specify`)

**Goal**: Identify security requirements for feature spec

**Steps**:

1. Load: `architecture/overview.md`
2. Extract: Threat model, security layers
3. Document: Security requirements in spec
4. Note: Implementation details deferred to planning

**Token cost**: ~120 lines

**Example output for spec**:

```markdown
## Security Requirements

This feature requires authentication following OWASP guidelines:

- Password security: Argon2id hashing with 19 MiB memory cost
- Session management: KV-based storage with TTL
- CSRF protection: Signed double-submit cookie pattern
- XSS prevention: Output encoding for all user data
- Rate limiting: Account lockout after 5 failed attempts

See latent-features/secure-auth for implementation patterns.
```

---

### Planning Phase (`/sp:04-plan`)

**Goal**: Create implementation plan with domain structure

**Steps**:

1. Load: `architecture/overview.md` (if not already loaded)
2. Load: `implementation/domain-entities.md`
3. Extract: Entity structure, repository interfaces
4. Create: Implementation phases
5. Reference: Specific implementation files for each phase

**Token cost**: ~620 lines (architecture + domain)

**Example plan structure**:

```markdown
## Implementation Plan

### Phase 1: Domain Layer

- Reference: domain-entities.md
- Implement: Email, Password value objects
- Implement: User, Session entities
- Define: Repository interfaces

### Phase 2: Password Security

- Reference: password-security.md
- Implement: Argon2Hasher service
- Implement: PasswordService with algorithm detection

### Phase 3: Session Management

- Reference: session-management.md
- Implement: KVSessionRepository
- Implement: Session cookie handling

### Phase 4: CSRF Protection

- Reference: csrf-protection.md
- Implement: CSRF middleware
- Configure: HTMX integration

### Phase 5: XSS Prevention

- Reference: xss-prevention.md
- Implement: Safe HTML template system
- Configure: Security headers (CSP)
```

---

### Implementation Phase

**Goal**: Load specific patterns as needed for current work

**Approach**: On-demand loading based on implementation task

**Examples**:

```
Task: Implement user registration
→ Load: implementation/password-security.md
→ Token cost: ~295 lines

Task: Implement session storage
→ Load: implementation/session-management.md
→ Token cost: ~373 lines

Task: Build login form
→ Load: implementation/csrf-protection.md
→ Load: implementation/xss-prevention.md
→ Token cost: ~842 lines
```

---

## Complete Reference

**File**: `docs/secure-authentication-guide.md` (~3,818 lines)

**When to use**: Rarely - only when focused reference files are insufficient

**Contains**:

- Complete implementation examples
- Infrastructure setup (wrangler.jsonc, database migrations)
- Detailed code samples for all components
- Edge cases and advanced scenarios
- Integration patterns
- Complete testing suites

**Prefer**: Focused reference files above for 75% token savings

---

## Token Efficiency Comparison

### Progressive Disclosure Approach

```
Session 1 (Specification): 120 lines
Session 2 (Planning): 504 lines
Session 3 (Password impl): 295 lines
Session 4 (Session impl): 373 lines
Session 5 (CSRF impl): 384 lines

Total: ~1,676 lines across 5 sessions
```

### Monolithic Approach

```
Session 1: Load entire guide (3,818 lines)
Total: 3,818 lines
```

**Token savings**: 56% reduction through progressive disclosure

---

## Testing Strategy

Each reference file includes testing patterns:

- **domain-entities.md**: Unit tests for value objects and entities
- **password-security.md**: Hash/verify tests, constant-time comparison tests
- **session-management.md**: Repository tests, TTL expiration tests
- **csrf-protection.md**: Middleware tests, token validation tests
- **xss-prevention.md**: Template encoding tests, XSS attack prevention tests

---

## Dependencies

```json
{
  "dependencies": {
    "@noble/hashes": "^1.3.0" // For Argon2id (optional, can use PBKDF2 instead)
  },
  "devDependencies": {
    "@cloudflare/workers-types": "^4.0.0",
    "@cloudflare/vitest-pool-workers": "^0.1.0"
  }
}
```

---

## Next Steps After Reading This Pattern

1. **For architecture understanding** → Read `architecture/overview.md`
2. **For domain modeling** → Read `implementation/domain-entities.md`
3. **For implementation** → Choose specific implementation file based on current task
4. **For complete examples** → Refer to `docs/secure-authentication-guide.md` (use sparingly)

---

## Notes

- All patterns follow OWASP guidelines (January 2026)
- Security uses defense-in-depth (multiple overlapping layers)
- Implementation examples target Cloudflare Workers (TypeScript)
- Architecture assumes DDD/Clean Architecture approach
- All patterns include comprehensive testing strategies
