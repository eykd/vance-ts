# Feature Specification: Auth-Static Site Integration

**Feature Branch**: `012-auth-static-integration`
**Created**: 2026-03-13
**Status**: Draft
**Input**: User description: "Integrate dynamic authentication with static Hugo site. Replace Get Started button with Sign In/Sign Up links. Add site-wide client-side auth check. Use HTMX to swap nav to Dashboard when authenticated. Protect /dashboard/ with JS redirect."
**Beads Epic**: `turtlebased-ts-bjd`

**Beads Phase Tasks**:

- clarify: `turtlebased-ts-bjd.1`
- plan: `turtlebased-ts-bjd.2`
- red-team: `turtlebased-ts-bjd.3`
- tasks: `turtlebased-ts-bjd.4`
- analyze: `turtlebased-ts-bjd.5`
- implement: `turtlebased-ts-bjd.6`
- security-review: `turtlebased-ts-bjd.7`
- architecture-review: `turtlebased-ts-bjd.8`
- code-quality-review: `turtlebased-ts-bjd.9`

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Static Auth Links in Navbar (Priority: P1)

A visitor arrives at any page of the static site and sees "Sign In" and "Sign Up" in the navbar where the "Get Started" button currently lives. These links point to the existing `/auth/sign-in` and `/auth/sign-up` endpoints. No JavaScript is required for these links to function — they work as plain HTML anchors.

**Why this priority**: This is the foundational change that connects the static site to the authentication system. Without visible auth entry points, users cannot discover how to sign in or register.

**Independent Test**: Navigate to any page on the static site and verify that "Sign In" and "Sign Up" links appear in the navbar and correctly navigate to `/auth/sign-in` and `/auth/sign-up` respectively.

**Acceptance Scenarios**:

1. **Given** an unauthenticated visitor on any static page, **When** the page loads, **Then** the navbar displays a "Sign In" link and a "Sign Up" button where "Get Started" used to be
2. **Given** a visitor clicks the "Sign In" link, **When** the browser navigates, **Then** the user arrives at `/auth/sign-in`
3. **Given** a visitor clicks the "Sign Up" button, **When** the browser navigates, **Then** the user arrives at `/auth/sign-up`

---

### User Story 2 - Client-Side Auth Status Check (Priority: P1)

The static site includes a site-wide Alpine.js component that checks whether the current user is authenticated by reading a non-HttpOnly indicator cookie set during sign-in. No server round-trip is required — the check is purely client-side. The result is stored in Alpine.js reactive state, making it available to any component on the page that needs to conditionally render based on auth status.

The server sets a non-sensitive indicator cookie (e.g., `auth_status=1`) alongside the HttpOnly session cookie during sign-in, and clears it during sign-out. This cookie contains no secrets — it is merely a UI hint. The server continues to enforce real authentication on protected endpoints.

**Why this priority**: This is the prerequisite for all conditional UI behavior (navbar swap, dashboard protection). Without a client-side auth check, the static site cannot adapt to authenticated vs. unauthenticated users.

**Independent Test**: Sign in, then open browser DevTools on any static page and verify the Alpine.js auth store reflects "authenticated" based on the indicator cookie. Sign out and verify the store reflects "not authenticated".

**Acceptance Scenarios**:

1. **Given** an unauthenticated visitor loads any static page, **When** Alpine.js reads cookies on init, **Then** the auth state reflects "not authenticated" (indicator cookie absent)
2. **Given** an authenticated user loads any static page, **When** Alpine.js reads cookies on init, **Then** the auth state reflects "authenticated" (indicator cookie present)
3. **Given** the indicator cookie is present but the server session has expired, **When** the user attempts a protected action, **Then** the server rejects the request (indicator cookie is a UI hint only, not authoritative)

---

### User Story 3 - Authenticated Navbar Swap (Priority: P2)

When the Alpine.js auth store indicates the user is authenticated (indicator cookie present), the navbar conditionally shows a "Dashboard" button linking to `/dashboard/` instead of the Sign In / Sign Up links. Alpine.js reactivity handles the swap — no server request or HTMX swap needed since the auth state is already known from the cookie.

**Why this priority**: This provides authenticated users with a clear path to their dashboard and removes irrelevant sign-in prompts, improving the experience for returning users.

**Independent Test**: Sign in via `/auth/sign-in`, navigate to any static page, and verify the navbar shows "Dashboard" instead of "Sign In / Sign Up".

**Acceptance Scenarios**:

1. **Given** an authenticated user on any static page, **When** Alpine.js reads the indicator cookie on init, **Then** the navbar displays a "Dashboard" button linking to `/dashboard/` instead of the auth links
2. **Given** an unauthenticated visitor, **When** Alpine.js finds no indicator cookie, **Then** the navbar continues to show "Sign In" and "Sign Up"
3. **Given** an authenticated user clicks the "Dashboard" button, **When** the browser navigates, **Then** the user arrives at `/dashboard/`

---

### User Story 4 - Dashboard Page with Auth Guard (Priority: P2)

A static `/dashboard/` page exists in Hugo. When an authenticated user navigates there, they see the dashboard content. When an unauthenticated user navigates there, client-side JavaScript redirects them to the sign-in page with a redirect-back parameter so they return to `/dashboard/` after signing in.

**Why this priority**: The dashboard is the primary destination for authenticated users. Protecting it ensures unauthenticated users are guided to sign in rather than seeing an empty or broken page.

**Independent Test**: Navigate to `/dashboard/` while unauthenticated and verify redirect to `/auth/sign-in?redirectTo=%2Fdashboard%2F`. Then sign in and verify you land on `/dashboard/` with content visible.

**Acceptance Scenarios**:

1. **Given** an authenticated user navigates to `/dashboard/`, **When** the page loads and auth check completes, **Then** the dashboard content is displayed
2. **Given** an unauthenticated user navigates to `/dashboard/`, **When** the page loads and auth check completes, **Then** the browser redirects to `/auth/sign-in?redirectTo=%2Fdashboard%2F`
3. **Given** a user signs in after being redirected from `/dashboard/`, **When** authentication succeeds, **Then** the user is redirected back to `/dashboard/`

---

### Edge Cases

- What happens if JavaScript is disabled? The "Sign In" and "Sign Up" links remain functional as plain HTML. The navbar swap does not occur. The `/dashboard/` page shows content without client-side auth protection (acceptable since server-side middleware protects actual data endpoints under `/app/*`).
- What happens if the user signs out on another tab? The indicator cookie is cleared, but the current tab's Alpine.js state is stale until the next page load. No real-time sync is required.
- What happens if the indicator cookie exists but the session has expired server-side? The navbar shows "Dashboard" (a stale UI hint), but any protected server action will reject the request and redirect to sign-in. The indicator cookie will be cleared on the next sign-in/sign-out cycle.
- What happens if the indicator cookie is manually deleted but the session is still valid? The navbar shows Sign In / Sign Up, but the user remains authenticated server-side. Clicking Sign In would show them as already logged in, or they can navigate directly to `/dashboard/` where server-side auth still works.
- Is there a flash of content? Alpine.js reads the cookie synchronously on init, so the correct navbar state renders on first paint with no flash.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST display "Sign In" as a text link and "Sign Up" as a primary button in the static site navbar, replacing the current "Get Started" button
- **FR-002**: "Sign In" link MUST navigate to `/auth/sign-in` and "Sign Up" button MUST navigate to `/auth/sign-up`
- **FR-003**: System MUST set a non-HttpOnly, non-sensitive indicator cookie during sign-in to signal authenticated status to client-side code
- **FR-004**: System MUST clear the indicator cookie during sign-out, alongside the session cookie
- **FR-005**: System MUST include a site-wide Alpine.js store that reads the indicator cookie on init and exposes auth status as reactive state (no server round-trip)
- **FR-006**: When the Alpine.js auth store indicates "authenticated", the navbar MUST conditionally display a "Dashboard" button linking to `/dashboard/` instead of the auth links
- **FR-007**: A static `/dashboard/` page MUST exist in the Hugo site
- **FR-008**: The `/dashboard/` page MUST include JavaScript that redirects unauthenticated users (no indicator cookie) to `/auth/sign-in?redirectTo=%2Fdashboard%2F`
- **FR-009**: The indicator cookie MUST NOT contain sensitive data — it is a UI hint only, not an authentication token
- **FR-010**: The Sign In / Sign Up links MUST function without JavaScript as plain HTML anchors (progressive enhancement)
- **FR-011**: Server-side authentication MUST remain the authoritative check for all protected endpoints — the indicator cookie does not grant access

### Key Entities

- **Auth Indicator Cookie**: A non-HttpOnly, non-sensitive cookie set alongside the session cookie to signal authentication status to client-side JavaScript. Contains no secrets — purely a UI hint.
- **Nav Auth Area**: The region of the navbar that conditionally shows either auth links (Sign In / Sign Up) or the authenticated state (Dashboard button).

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Visitors see auth links (Sign In / Sign Up) in the navbar within the initial page render — no JavaScript required for visibility
- **SC-002**: Authenticated users see the navbar update to show "Dashboard" within 1 second of page load on a typical connection
- **SC-003**: Unauthenticated users visiting `/dashboard/` are redirected to sign-in within 1 second of page load
- **SC-004**: The auth status check adds zero additional network requests per page load (cookie-based, client-side only)
- **SC-005**: 100% of navbar interactions work without JavaScript (sign-in link, sign-up link navigate correctly)

## Assumptions

- The existing `/auth/sign-in` and `/auth/sign-up` endpoints will be modified only to set/clear the indicator cookie — their core authentication logic is unchanged
- The indicator cookie shares the same domain and path scope as the session cookie so it is present on all pages
- Alpine.js is already loaded on static pages via `baseof.html` (or will be added as part of this feature)
- The `/dashboard/` page is a static placeholder for now; future features will populate it with dynamic content
- The indicator cookie is acceptable as a non-authoritative UI signal — the server remains the sole authority for access control

## Interview

### Open Questions

_(no open questions — interview complete)_

### Answer Log

- **Q1** (2026-03-13): Auth status endpoint response format — JSON vs HTML fragment vs combined?
  - **A1**: Neither. Use a non-HttpOnly indicator cookie set during sign-in. Alpine.js reads `document.cookie` on init — no server round-trip needed. The cookie is a UI hint only; server-side auth remains authoritative.
- **Q2** (2026-03-13): Should the `/dashboard/` page hide content until auth is confirmed (no flash) or show content immediately and redirect if unauthenticated (brief flash)?
  - **A2**: Brief flash is acceptable. Show dashboard content immediately, redirect unauthenticated users after Alpine.js inits. Simpler approach, negligible flash since cookie read is synchronous.
