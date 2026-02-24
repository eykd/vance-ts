# Feature Specification: User Authentication

**Feature Branch**: `011-better-auth`
**Created**: 2026-02-23
**Status**: Ready
**Input**: User description: "We have a pretty decent authentication implementation in our downstream repo at ~/vance-ts/ that doesn't use better-auth and it doesn't use Hono, which this upstream repo has adopted. We want to implement user/password authentication in this repo using better-auth and Hono. Anything that isn't already implemented by those, we can look to ~/vance-ts for examples. We should also leave room for implementing OAuth based solutions e.g. Google login."

**Beads Epic**: `tb-ltk`

**Beads Phase Tasks**:

- clarify: `tb-ltk.1`
- plan: `tb-ltk.2`
- red-team: `tb-ltk.3`
- tasks: `tb-ltk.4`
- analyze: `tb-ltk.5`
- implement: `tb-ltk.6`
- security-review: `tb-ltk.7`
- architecture-review: `tb-ltk.8`
- code-quality-review: `tb-ltk.9`

---

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Register a New Account (Priority: P1)

A new visitor can create an account by providing their email address and a password. After successful registration, they are redirected to the sign-in page to complete sign-in.

**Why this priority**: Account creation is the entry point for all authenticated functionality. Without registration, no other auth flows are possible.

**Independent Test**: Can be fully tested by submitting a valid registration form and verifying the user is redirected to the sign-in page.

**Acceptance Scenarios**:

1. **Given** a visitor is on the registration page, **When** they submit a valid email and password, **Then** their account is created and they are redirected to the sign-in page to complete sign-in
2. **Given** a visitor submits a registration form, **When** the email address is already in use, **Then** they are silently redirected to the sign-in page with `?registered=true` — identical to successful registration, preventing email enumeration (FR-007)
3. **Given** a visitor submits a registration form, **When** the password is fewer than 12 characters or is one of the 100 most common passwords, **Then** they see a specific error explaining what is required (minimum 12 characters; common passwords are rejected)
4. **Given** a visitor submits a registration form, **When** the email address is malformed, **Then** they see a validation error before the form is submitted
5. **Given** a visitor submits 5 failed registration attempts within 5 minutes, **When** the rate limit is exceeded, **Then** they see a "too many attempts" message and must wait before trying again

---

### User Story 2 - Sign In with Email and Password (Priority: P1)

An existing user can sign in using their registered email address and password. After successful sign-in, they are redirected to the page they originally requested (or the application home if no specific destination was pending).

**Why this priority**: Sign-in is the primary gate to all protected functionality. All other flows depend on it working correctly.

**Independent Test**: Can be fully tested by submitting valid credentials and verifying session creation and redirection.

**Acceptance Scenarios**:

1. **Given** a registered user is on the sign-in page, **When** they submit valid credentials, **Then** they are signed in and redirected to the application
2. **Given** a registered user is on the sign-in page, **When** they submit an incorrect password, **Then** they see a generic error (not revealing whether the email exists), and the attempt is logged
3. **Given** an unregistered email is submitted on the sign-in page, **When** the form is submitted, **Then** the same generic error is shown (preventing email enumeration)
4. **Given** a user submits 5 failed sign-in attempts within 15 minutes, **When** the rate limit is exceeded, **Then** they see a "too many attempts" message and must wait before trying again
5. **Given** an unauthenticated visitor accesses a protected page, **When** they are redirected to the sign-in page and then successfully sign in, **Then** they are sent to the page they originally requested

---

### User Story 3 - Sign Out (Priority: P1)

An authenticated user can sign out, which ends their session and returns them to the sign-in page.

**Why this priority**: Sign-out is a fundamental security requirement; users must be able to end their sessions.

**Independent Test**: Can be fully tested by signing in, then signing out, and verifying the session is invalidated and protected pages are no longer accessible.

**Acceptance Scenarios**:

1. **Given** a signed-in user triggers sign-out, **When** the sign-out is confirmed, **Then** their session is invalidated on the server, the session cookie is cleared, and they are redirected to the sign-in page
2. **Given** a user signs out, **When** they attempt to navigate back to a protected page, **Then** they are redirected to the sign-in page

---

### User Story 4 - Access Protected Pages (Priority: P1)

The application can designate routes as protected. Unauthenticated visitors are redirected to the sign-in page; authenticated users pass through.

**Why this priority**: Route protection is the core value of authentication — enabling secure sections of the application.

**Independent Test**: Can be fully tested by verifying that a protected route redirects anonymous visitors and permits authenticated users.

**Acceptance Scenarios**:

1. **Given** a visitor with no session accesses a protected route, **When** the request is processed, **Then** they are redirected to the sign-in page with the original URL preserved for post-sign-in redirect
2. **Given** an authenticated user accesses a protected route, **When** the request is processed, **Then** they are served the protected content
3. **Given** an authenticated user's session has expired (sessions last 30 days), **When** they access a protected route, **Then** they are redirected to the sign-in page

---

### User Story 5 - Future OAuth Sign-In (Priority: P3)

The system is designed to support OAuth-based sign-in providers (e.g., Google) without requiring architectural changes. This story is a placeholder establishing the extensibility requirement; it does not require implementing a specific provider now.

**Why this priority**: The architecture must accommodate future OAuth flows, but no OAuth provider is being activated in this scope.

**Independent Test**: Can be verified by confirming the auth system supports adding OAuth providers through configuration without structural code changes.

**Acceptance Scenarios**:

1. **Given** the auth system is in place, **When** a future developer adds a supported OAuth provider, **Then** the change requires only configuration, not restructuring of the auth layer

---

### Edge Cases

- **Tampered or invalid session cookie**: The middleware silently clears the bad cookie and redirects the visitor to the sign-in page — no error page is shown, and no information about the failure is revealed.
- **DB temporarily unavailable during sign-in**: better-auth D1 adapter throws; the use case catches it and returns `{ ok: false; kind: 'service_error' }`; the handler shows the sign-in form with a generic "Service unavailable, please try again" message. No session is created.
- **Account deleted while active session exists**: `requireAuth` calls `getSession()` which queries D1; if the user row is gone, better-auth returns `null`; the middleware treats it as unauthenticated and redirects to sign-in (same as expired session).
- **Simultaneous multi-device logins**: Supported — better-auth creates a separate session row per device. Each session is independent; signing out on one device does not invalidate others (no forced global sign-out in this iteration).
- **Security-sensitive error logging**: User-supplied values (email address, User-Agent, IP) are sanitized before logging — newlines stripped via regex, IP validated against allowlist pattern. Passwords are never logged. Session tokens are never logged.

---

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The system MUST allow visitors to create accounts using an email address and password
- **FR-002**: The system MUST allow registered users to sign in with their email and password
- **FR-003**: The system MUST allow authenticated users to sign out, invalidating their session
- **FR-004**: The system MUST protect designated routes, redirecting unauthenticated visitors to the sign-in page (`/auth/sign-in`)
- **FR-005**: The system MUST preserve the originally requested URL and redirect users there after successful sign-in
- **FR-006**: The system MUST enforce rate limiting on sign-in (5 attempts per 15 minutes per IP) and registration (5 attempts per 5 minutes per IP) endpoints to prevent brute-force attacks. The system MUST also enforce per-account rate limiting on sign-in (10 attempts per 60 minutes per email address) to prevent targeted brute-force attacks from distributed IPs.
- **FR-007**: The system MUST return identical error messages for invalid credentials regardless of whether the email exists (preventing email enumeration)
- **FR-008**: The system MUST enforce a minimum password strength of 12 characters and MUST reject passwords that appear in the 100 most common passwords list (same list used in the vance-ts reference implementation)
- **FR-009**: The system MUST invalidate sessions server-side on sign-out (not merely clear the client cookie)
- **FR-010**: The system MUST be extensible to support OAuth providers (e.g., Google) without architectural changes
- **FR-011**: The system MUST apply appropriate security headers to all authentication-related responses
- **FR-012**: The system MUST log security events (failed sign-in attempts, rate limit hits) without recording passwords or sensitive PII
- **FR-013**: Users MUST be able to sign in immediately after registration — no email verification is required in this iteration

### Key Entities

- **User**: A person with an account; identified by email address; associated with a hashed credential and account metadata
- **Session**: A server-side record of an authenticated user's active sign-in; associated with a 30-day expiry and a secure token delivered via cookie
- **Authentication Event**: A record of a sign-in attempt (success or failure) for security auditing

---

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A new user can complete account creation and be signed in within 60 seconds on a standard connection
- **SC-002**: A returning user can sign in and reach protected content within 30 seconds on a standard connection
- **SC-003**: Brute-force attacks are automatically blocked after 5 failed sign-in attempts per IP within 15 minutes, and after 5 registration attempts per IP within 5 minutes, and targeted brute-force against a specific account is blocked after 10 failed sign-in attempts per account within 60 minutes
- **SC-004**: Email enumeration attacks yield no information advantage (identical responses for valid and invalid emails)
- **SC-005**: 100% of protected routes correctly reject unauthenticated requests in automated testing
- **SC-006**: Session invalidation on sign-out is confirmed server-side within the same request
- **SC-007**: The system can have an OAuth provider added via configuration alone (verified by future integration test)

---

## Assumptions

- Email verification is not required — users can sign in immediately after registering
- Password reset via email is out of scope for this iteration (no email delivery infrastructure is needed)
- The application uses cookie-based sessions (not token-based JWT in request headers), consistent with the existing downstream implementation
- Sessions persist across browser restarts and expire after 30 days of inactivity
- Users have a single role (no admin/member distinction in this iteration)
- The application is served over HTTPS, enabling secure cookie flags
- Email uniqueness is enforced at the database level

---

## Clarifications

### Session 2026-02-24

- Q: What password strength criteria must passwords meet? → A: Minimum 12 characters + reject the 100 most common passwords (vance-ts approach)
- Q: What should the session lifetime be? → A: 30 days
- Q: What are the rate limit thresholds for login and registration? → A: Login: 5 attempts per 15 minutes; Registration: 5 attempts per 5 minutes (per IP)
- Q: What happens when a session cookie is tampered with or contains an invalid token? → A: Silently treat as unauthenticated — clear the bad cookie and redirect to login (no error shown)
- Q: What is the canonical terminology for authentication actions? → A: "Sign in / Sign out" for all UI labels and spec text; routes use `/auth/sign-in`, `/auth/sign-out`

## Interview

### Open Questions

_(none — interview complete)_

### Answer Log

1. **Q**: Should users be required to verify their email address before they can sign in?
   **A**: No — users can sign in immediately after registering (2026-02-23)

**INTERVIEW COMPLETE**
