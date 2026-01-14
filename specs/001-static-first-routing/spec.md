# Feature Specification: Static-First Routing Architecture

**Feature Branch**: `001-static-first-routing`
**Created**: 2026-01-14
**Status**: Complete
**Input**: User description: "Adapt documentation and skills from dynamic-first (Workers serve /) to static-first (Pages serve /) architecture, where root domain is static-first (marketing site), progressive enhancement is done with HTMX + Alpine.js, and the dynamic application lives under `/app/*`."

## Clarifications

### Session 2026-01-14

- Q: Should docs/skills maintain backward compatibility notes for developers migrating from the old "Worker serves everything" pattern? → A: Clean break - remove all references to old pattern, no migration guidance
- Q: Should the spec enumerate target files or defer to planning phase? → A: Planning discovers - let /sp:04-plan identify affected files via codebase search

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Developer Reads Updated Documentation (Priority: P1)

A developer using the boilerplate reads the Cloudflare Interactive Web App Guide and related documentation. They understand that the root domain serves static HTML pages (marketing site) while the Worker handles only `/app/*`, `/auth/*`, and `/webhooks/*` routes. The documentation clearly explains the "static by default, dynamic by intent" philosophy.

**Why this priority**: Documentation is the entry point for all developers. If the docs reflect the old "Worker serves everything" model, developers will implement incorrect routing patterns from the start.

**Independent Test**: Can be fully tested by reading the documentation and verifying it accurately describes the static-first routing model with `/app` as the dynamic boundary.

**Acceptance Scenarios**:

1. **Given** a developer reads the main Cloudflare guide, **When** they look for routing information, **Then** they see that static pages (/, /pricing, /about, /blog/\*) are served without Worker involvement
2. **Given** a developer reads the Worker responsibilities section, **When** they check what routes the Worker handles, **Then** they see only /app/_, /auth/_, and /webhooks/\* are Worker routes
3. **Given** a developer reads the deployment documentation, **When** they look for the recommended architecture, **Then** they see a single-repo model where static site builds first, outputs to public/, and Worker deploy references that directory

---

### User Story 2 - Developer Uses Skills with Static-First Patterns (Priority: P1)

A developer invokes Claude Code skills (e.g., `/cloudflare-project-scaffolding`, `/worker-request-handler`, `/htmx-alpine-templates`) and receives guidance consistent with static-first routing. Skills generate code and patterns that assume `/app/*` as the dynamic boundary.

**Why this priority**: Skills are the primary means developers interact with Claude Code for implementation. Incorrect skill outputs would directly produce non-compliant code.

**Independent Test**: Can be tested by invoking each relevant skill and verifying its output matches static-first routing expectations.

**Acceptance Scenarios**:

1. **Given** a developer invokes `/cloudflare-project-scaffolding`, **When** the skill generates the project structure, **Then** the wrangler.toml and routing configuration assume static-first with Worker only for /app/_, /auth/_, /webhooks/\*
2. **Given** a developer invokes `/worker-request-handler`, **When** the skill provides routing examples, **Then** routes are prefixed with /app/ for pages and /app/\_/ for HTMX partials
3. **Given** a developer invokes `/htmx-alpine-templates`, **When** the skill generates templates, **Then** HTMX endpoints use the /app/\_/ convention for partial responses

---

### User Story 3 - Developer Creates HTMX Partials Under Correct Convention (Priority: P2)

A developer creating HTMX endpoints follows the `/app/_/` convention for partial responses. The documentation and skills guide them to use this prefix for HTML fragment endpoints that are never linked directly.

**Why this priority**: Consistent HTMX conventions prevent confusion between full pages and partials, making the hypermedia layer explicit and maintainable.

**Independent Test**: Can be tested by following documentation to create an HTMX partial and verifying the route follows `/app/_/[resource]/[action]` pattern.

**Acceptance Scenarios**:

1. **Given** a developer reads HTMX patterns documentation, **When** they look for endpoint conventions, **Then** they see examples using /app/_/ prefix (e.g., /app/_/profile/edit, /app/\_/billing/upgrade)
2. **Given** a developer creates an HTMX partial endpoint, **When** they follow skill guidance, **Then** the generated route is under /app/\_/ and returns HTML fragments only

---

### User Story 4 - Developer Configures Authentication Boundary (Priority: P2)

A developer implementing authentication understands that marketing pages are unauthenticated by default and `/app/*` routes require authentication unless explicitly public. The auth middleware applies only within the Worker's `/app` routing tree.

**Why this priority**: Clear authentication boundaries prevent accidental auth leakage into static content and ensure proper security posture.

**Independent Test**: Can be tested by reviewing auth documentation and verifying it describes the boundary at /app/\* rather than at root.

**Acceptance Scenarios**:

1. **Given** a developer reads authentication documentation, **When** they look for auth boundaries, **Then** they see that /app/\* is the authenticated zone and marketing pages (/, /pricing, /about) are public
2. **Given** a developer uses security-related skills, **When** the skill generates auth middleware, **Then** it applies only to /app/\* routes

---

### User Story 5 - Developer Understands Static Site Generator Role (Priority: P3)

A developer understands that the static site generator (Hugo, Astro, 11ty) is the primary renderer for marketing pages at `/`. They know that static pages can POST forms to Worker endpoints and use HTMX to target `/app/_/*` endpoints, while remaining functional without JavaScript.

**Why this priority**: Understanding the SSG role clarifies the division of responsibility between static and dynamic rendering.

**Independent Test**: Can be tested by reading documentation about the SSG role and verifying it describes the SSG as primary renderer for marketing content.

**Acceptance Scenarios**:

1. **Given** a developer reads the static site generator section, **When** they look for responsibilities, **Then** they see the SSG generates complete, semantic HTML for marketing pages
2. **Given** a developer reads about SSG-Worker interaction, **When** they look for integration patterns, **Then** they see that static forms may POST to Worker endpoints and HTMX may target /app/\_/\* endpoints

---

### Edge Cases

- What happens when a user navigates to a non-existent route under `/app/*`? (Worker returns 404)
- What happens when a user navigates to a non-existent static page? (Static hosting returns 404, not Worker)
- How does the system handle routes that could be both static and dynamic? (Explicit routing rules prevent ambiguity; Worker claims /app/_, /auth/_, /webhooks/\* only)
- What happens if marketing pages need minimal dynamic behavior? (Use HTMX + Alpine.js for progressive enhancement without full Worker involvement)

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: All documentation MUST describe static HTML as the default for root domain (/, /pricing, /about, /blog/\*)
- **FR-002**: All documentation MUST describe the Worker as handling only /app/_, /auth/_, and /webhooks/\* routes
- **FR-003**: All skills MUST generate routing patterns consistent with static-first architecture
- **FR-004**: Skills MUST use /app/\_/ prefix convention for HTMX partial endpoints
- **FR-005**: Documentation MUST describe the "static by default, dynamic by intent" design philosophy
- **FR-006**: Authentication documentation MUST describe /app/\* as the authenticated boundary
- **FR-007**: Documentation MUST describe the SSG as the primary renderer for marketing pages
- **FR-008**: Worker responsibility documentation MUST NOT include rendering marketing pages or acting as catch-all router
- **FR-009**: Deployment documentation MUST describe single-repo model where static site builds to public/ and Worker references that directory
- **FR-010**: Skills MUST generate wrangler.toml configurations that align with static-first routing

### Key Entities

- **Static Routes**: Paths served directly from static assets without Worker involvement (/, /pricing, /about, /blog/_, /assets/_)
- **Dynamic Routes**: Paths explicitly handled by the Worker (/app/_, /auth/_, /webhooks/\*)
- **HTMX Partial Routes**: Subset of dynamic routes returning HTML fragments only (/app/\_/\*)
- **Marketing Pages**: Static HTML pages for the public-facing website, rendered by SSG
- **Application Pages**: Dynamic HTML pages under /app/\*, rendered by Worker

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 100% of documentation files mentioning Worker routing describe /app/\* as the dynamic boundary (not root)
- **SC-002**: 100% of skills generating routing code produce routes under /app/\* for dynamic content
- **SC-003**: All HTMX endpoint examples use the /app/\_/ convention
- **SC-004**: No documentation describes the Worker as rendering marketing pages or as a catch-all router
- **SC-005**: Authentication documentation describes /app/\* as the authenticated zone in all instances
- **SC-006**: Deployment documentation describes static-first build process in all relevant sections

## Scope & Boundaries

### In Scope

- Updating the Cloudflare Interactive Web App Guide
- Updating all Claude Code skills that mention routing, Workers, or page rendering
- Updating deployment and configuration documentation
- Updating authentication boundary documentation
- Adding HTMX partial endpoint convention (/app/\_/) to relevant docs

**Note**: The specific list of affected files will be discovered during the planning phase (`/sp:04-plan`) through codebase analysis rather than enumerated here.

### Out of Scope

- Changing actual source code implementation (this is documentation/skills update only)
- Creating new SSG templates or tooling
- Modifying the core library functionality
- Adding new skills (only updating existing ones)

## Assumptions

- The existing documentation uses a "Worker serves everything" model that needs to be inverted
- Skills exist that generate routing code and need to be updated for static-first patterns
- The /app/\_/ convention for HTMX partials is a new addition (may not exist in current docs)
- The project uses HTMX + Alpine.js for progressive enhancement (no SPA frameworks)
- Single-repo deployment is the recommended model

## Constraints

- **Clean break approach**: All references to the old "Worker serves everything" pattern will be removed entirely; no migration guidance or backward compatibility notes will be provided
