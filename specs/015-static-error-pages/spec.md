# Feature Specification: Static Error Pages

**Feature Branch**: `015-static-error-pages`
**Created**: 2026-03-25
**Status**: Draft
**Input**: User description: "Right now, 404s, 500s, and other errors present a JSON response. We should develop static error pages in Hugo and serve these for regular (non-API) routes that error out."
**Beads Epic**: `turtlebased-ts-o2yv`

**Beads Phase Tasks**:

- clarify: `turtlebased-ts-o2yv.1`
- plan: `turtlebased-ts-o2yv.2`
- red-team: `turtlebased-ts-o2yv.3`
- tasks: `turtlebased-ts-o2yv.4`
- analyze: `turtlebased-ts-o2yv.5`
- implement: `turtlebased-ts-o2yv.6`
- security-review: `turtlebased-ts-o2yv.7`
- architecture-review: `turtlebased-ts-o2yv.8`
- code-quality-review: `turtlebased-ts-o2yv.9`

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Friendly 404 Page for Missing Pages (Priority: P1)

A visitor navigates to a non-existent page on the site (e.g., a mistyped URL or a broken link). Instead of seeing a raw JSON response or a blank page, they see a well-designed, branded 404 page that helps them find their way back.

**Why this priority**: 404 is the most commonly encountered error. A friendly 404 page directly impacts user experience and brand perception. The Hugo 404 template already exists but the Worker may bypass it for certain routes.

**Independent Test**: Navigate to any non-existent non-API path (e.g., `/nonexistent-page`) and verify a styled HTML error page is returned with a 404 status code and navigation options.

**Acceptance Scenarios**:

1. **Given** a visitor on the site, **When** they navigate to a URL that does not match any page or route (e.g., `/this-does-not-exist`), **Then** they see a branded 404 error page with a message explaining the page was not found, a link to the home page, and a button to go back.
2. **Given** a visitor on the site, **When** they navigate to a non-existent page, **Then** the HTTP response has status code 404 and Content-Type `text/html`.
3. **Given** a search engine crawler, **When** it requests a non-existent page, **Then** it receives a 404 status code (not a 200 with error content).

---

### User Story 2 - Friendly 500 Page for Server Errors (Priority: P1)

A visitor triggers an unexpected server error on a non-API route. Instead of seeing a JSON error or a cryptic message, they see a friendly error page that acknowledges the problem and suggests they try again later.

**Why this priority**: 500 errors, while less frequent than 404s, are critical for user trust. A professional error page prevents users from losing confidence in the site.

**Independent Test**: Trigger a server error on a non-API route and verify a styled HTML 500 page is returned.

**Acceptance Scenarios**:

1. **Given** a visitor on the site, **When** an unexpected error occurs while processing their request on a non-API route, **Then** they see a branded 500 error page with a message acknowledging the issue and suggesting they try again later.
2. **Given** a visitor on the site, **When** a server error occurs, **Then** the HTTP response has status code 500 and Content-Type `text/html`.
3. **Given** a server error on a non-API route, **When** the error page is displayed, **Then** no internal error details, stack traces, or system information are exposed to the visitor.

---

### User Story 3 - API Routes Continue Returning JSON Errors (Priority: P1)

API consumers (JavaScript clients, third-party integrations) that call `/api/*` endpoints continue to receive structured JSON error responses, unaffected by the new static error pages.

**Why this priority**: API clients depend on machine-readable JSON responses. Breaking this contract would cause integration failures.

**Independent Test**: Send a request to a non-existent API endpoint (e.g., `/api/nonexistent`) and verify a JSON error response is returned, not HTML.

**Acceptance Scenarios**:

1. **Given** a client calling an API endpoint, **When** the endpoint returns a 404, **Then** the response body is JSON (e.g., `{"error": "Not found"}`) with Content-Type `application/json`.
2. **Given** a client calling an API endpoint, **When** the endpoint returns a 500, **Then** the response body is JSON with Content-Type `application/json`.

---

### User Story 4 - Consistent Error Page Design (Priority: P2)

All error pages share a consistent visual design that matches the site's branding, using the same layout, colors, and typography as the rest of the site.

**Why this priority**: Consistent branding maintains professionalism. Less critical than having error pages at all.

**Independent Test**: Compare the 404 and 500 error pages side by side and verify they use the same layout structure, color scheme, and navigation elements.

**Acceptance Scenarios**:

1. **Given** the 404 and 500 error pages, **When** they are viewed side by side, **Then** they share the same base layout, header, footer, and visual styling.
2. **Given** any error page, **When** a visitor views it, **Then** the page includes the site's standard navigation so the visitor can navigate elsewhere.

---

### Edge Cases

- What happens when a visitor requests a non-existent path under `/app/*` or `/dashboard/*` (authenticated routes)? They should see an appropriate error page consistent with their authentication state.
- What happens when the error page template itself fails to render? The Worker should fall back to a minimal plain-text or inline HTML response.
- What happens when a visitor requests a non-existent static asset (e.g., `/images/missing.png`)? Static asset 404s should continue returning the Hugo 404 page (current behavior).

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST serve branded HTML error pages for 404 responses on non-API routes.
- **FR-002**: System MUST serve branded HTML error pages for 500 responses on non-API routes.
- **FR-003**: System MUST continue serving JSON error responses for all `/api/*` routes.
- **FR-004**: Error pages MUST include the site's standard navigation (header, footer).
- **FR-005**: Error pages MUST NOT expose internal error details, stack traces, or system information.
- **FR-006**: Error pages MUST return the correct HTTP status code (404, 500, etc.) — not 200.
- **FR-007**: The Worker MUST include a global error handler that catches unhandled exceptions on non-API routes and serves the 500 error page.
- **FR-008**: If the error page itself fails to render, the system MUST fall back to a minimal inline HTML response with the appropriate status code.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 100% of non-API 404 responses serve a branded HTML page instead of JSON.
- **SC-002**: 100% of non-API unhandled errors serve a branded HTML 500 page instead of JSON or raw text.
- **SC-003**: 100% of API error responses remain JSON — zero regressions.
- **SC-004**: Error pages load with no additional network requests beyond what the page's CSS/JS already requires (no external API calls).
- **SC-005**: Error pages are accessible and readable without JavaScript enabled.

## Clarifications

### Session 2026-03-25

- No critical ambiguities detected. All taxonomy categories assessed as Clear. Proceeding to planning.

## Interview

### Open Questions

_(none — no critical ambiguities remain)_

### Answer Log

_(no questions needed — spec passed full coverage scan)_
