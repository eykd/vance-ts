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

The static site includes a site-wide Alpine.js component that checks whether the current user is authenticated. On page load, it makes a lightweight request to an auth status endpoint. The result is stored in Alpine.js reactive state, making it available to any component on the page that needs to conditionally render based on auth status.

**Why this priority**: This is the prerequisite for all conditional UI behavior (navbar swap, dashboard protection). Without a client-side auth check, the static site cannot adapt to authenticated vs. unauthenticated users.

**Independent Test**: Open browser DevTools, check that an auth status request fires on page load, and verify the Alpine.js store reflects the correct authentication state for both logged-in and logged-out users.

**Acceptance Scenarios**:

1. **Given** an unauthenticated visitor loads any static page, **When** the auth check completes, **Then** the Alpine.js auth state reflects "not authenticated"
2. **Given** an authenticated user loads any static page, **When** the auth check completes, **Then** the Alpine.js auth state reflects "authenticated"
3. **Given** the auth status endpoint is unreachable, **When** the auth check fails, **Then** the system treats the user as unauthenticated (fail-closed)

---

### User Story 3 - Authenticated Navbar Swap (Priority: P2)

When the auth check determines the user is authenticated, HTMX replaces the "Sign In / Sign Up" links with a "Dashboard" button that links to `/dashboard/`. This swap happens seamlessly after page load without a full page refresh.

**Why this priority**: This provides authenticated users with a clear path to their dashboard and removes irrelevant sign-in prompts, improving the experience for returning users.

**Independent Test**: Sign in via `/auth/sign-in`, navigate to any static page, and verify the navbar shows "Dashboard" instead of "Sign In / Sign Up".

**Acceptance Scenarios**:

1. **Given** an authenticated user on any static page, **When** the auth check completes successfully, **Then** HTMX swaps the auth links area to display a "Dashboard" button linking to `/dashboard/`
2. **Given** an unauthenticated visitor, **When** the auth check completes, **Then** the navbar continues to show "Sign In" and "Sign Up" (no swap occurs)
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

- What happens if the auth status endpoint responds slowly? The static navbar (Sign In / Sign Up) remains visible until the check completes — no flash of incorrect state.
- What happens if JavaScript is disabled? The "Sign In" and "Sign Up" links remain functional as plain HTML. The navbar swap does not occur. The `/dashboard/` page shows content without client-side auth protection (acceptable since server-side middleware protects actual data endpoints under `/app/*`).
- What happens if the user signs out on another tab? The auth state on the current tab remains stale until the next page load or auth check. No real-time sync is required.
- What happens during the brief moment between page load and auth check completion? The default state (Sign In / Sign Up) is shown. No loading spinner or skeleton is displayed — the static content is the default.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST display "Sign In" as a text link and "Sign Up" as a primary button in the static site navbar, replacing the current "Get Started" button
- **FR-002**: "Sign In" link MUST navigate to `/auth/sign-in` and "Sign Up" button MUST navigate to `/auth/sign-up`
- **FR-003**: System MUST provide a lightweight auth status endpoint that returns whether the current user is authenticated, based on existing session cookies
- **FR-004**: System MUST include a site-wide Alpine.js store that checks auth status on page load and exposes the result as reactive state
- **FR-005**: When the user is authenticated, system MUST use HTMX to replace the Sign In / Sign Up area with a "Dashboard" button linking to `/dashboard/`
- **FR-006**: The auth status endpoint MUST return an HTML fragment suitable for HTMX swap when the user is authenticated (the "Dashboard" button markup)
- **FR-007**: A static `/dashboard/` page MUST exist in the Hugo site
- **FR-008**: The `/dashboard/` page MUST include JavaScript that redirects unauthenticated users to `/auth/sign-in?redirectTo=%2Fdashboard%2F`
- **FR-009**: Auth status check failures (network errors, timeouts) MUST be treated as "not authenticated" (fail-closed)
- **FR-010**: The Sign In / Sign Up links MUST function without JavaScript as plain HTML anchors (progressive enhancement)

### Key Entities

- **Auth Status**: Represents the current user's authentication state as seen by the client. Includes at minimum whether the user is authenticated.
- **Nav Auth Area**: The region of the navbar that conditionally shows either auth links (Sign In / Sign Up) or the authenticated state (Dashboard button).

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Visitors see auth links (Sign In / Sign Up) in the navbar within the initial page render — no JavaScript required for visibility
- **SC-002**: Authenticated users see the navbar update to show "Dashboard" within 1 second of page load on a typical connection
- **SC-003**: Unauthenticated users visiting `/dashboard/` are redirected to sign-in within 1 second of page load
- **SC-004**: The auth status check adds no more than one additional network request per page load
- **SC-005**: 100% of navbar interactions work without JavaScript (sign-in link, sign-up link navigate correctly)

## Assumptions

- The existing `/auth/sign-in` and `/auth/sign-up` endpoints will continue to function as-is; this feature does not modify them
- The existing session cookie (`__Host-better-auth.session_token`) is sent with requests to the auth status endpoint (same-origin)
- Alpine.js and HTMX are already loaded on static pages via `baseof.html` (or will be added as part of this feature)
- The `/dashboard/` page is a static placeholder for now; future features will populate it with dynamic content
- The auth status endpoint will be a new Worker route (e.g., `/app/_/auth/status`) protected by existing CORS/CSP policies

## Interview

### Open Questions

1. **NEXT QUESTION:** The auth status endpoint could return either (a) a simple JSON response that Alpine.js interprets to decide whether to trigger an HTMX swap, or (b) an HTML fragment directly that HTMX swaps in (combining the check and the swap into one request). Option (b) is more aligned with hypermedia principles — the server decides what the client displays. Which approach do you prefer, or do you have a different pattern in mind?

### Answer Log

_(no answers yet)_
