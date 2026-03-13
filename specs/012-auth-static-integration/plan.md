# Implementation Plan: Auth-Static Site Integration

**Branch**: `012-auth-static-integration` | **Date**: 2026-03-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/012-auth-static-integration/spec.md`

## Summary

Integrate dynamic authentication with the static Hugo site by replacing the "Get Started" button with Sign In / Sign Up links, adding a non-HttpOnly indicator cookie set during sign-in/sign-out, an Alpine.js auth store that reads the cookie client-side, conditional navbar rendering (Dashboard vs auth links), and a `/dashboard/` page with a client-side auth guard redirect.

## Technical Context

**Language/Version**: TypeScript (ES2022) + Hugo Go templates
**Primary Dependencies**: Hono (HTTP), Alpine.js 3.15.8, DaisyUI 5, better-auth
**Storage**: D1 (sessions via better-auth), indicator cookie (client-side only)
**Testing**: Vitest (workers pool for TypeScript), Hugo build tests (zero warnings)
**Target Platform**: Cloudflare Workers + Hugo static site
**Project Type**: Web (static-first hybrid: Hugo static pages + Workers dynamic endpoints)
**Performance Goals**: Auth status check adds zero network requests (cookie-based); navbar swap within 1 second
**Constraints**: No Node.js APIs; Web Standard APIs only; `__Host-` cookie prefix requires Secure + Path=/
**Scale/Scope**: 4 user stories, ~12 files modified/created

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Test-First Development | PASS | TypeScript: TDD for cookie builder additions and any new utilities. Hugo: build verification tests (zero warnings). |
| II. Type Safety | PASS | Strict types for cookie functions; no `any` types. |
| III. Code Quality | PASS | JSDoc on all new public functions; naming follows conventions. |
| IV. Pre-commit Gates | PASS | All changes pass lint-staged (Prettier, ESLint, TypeScript, Vitest). |
| V. Warning/Deprecation Policy | PASS | No new warnings introduced. |
| VI. Cloudflare Workers Target | PASS | All code uses Web Standard APIs; cookie manipulation via `Set-Cookie` headers. |
| VII. Simplicity | PASS | Cookie-based indicator is simplest approach (no server round-trips, no KV lookups). Alpine.js reactivity replaces HTMX swap (simpler for known-at-init state). |

**Gate Result**: PASS — No violations. Proceed to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/012-auth-static-integration/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── indicator-cookie.md
└── tasks.md             # Phase 2 output (created by /sp:05-tasks)
```

### Source Code (repository root)

```text
# Existing files to modify
src/presentation/utils/cookieBuilder.ts     # Add indicator cookie build/clear/extract
src/presentation/handlers/AuthPageHandlers.ts  # Set/clear indicator cookie on sign-in/sign-out
hugo/config/_default/menus.yaml             # Replace Get Started with Sign In + Sign Up
hugo/layouts/_partials/shared/header.html   # Alpine.js conditional nav rendering
hugo/layouts/baseof.html                    # Load Alpine.js site-wide

# New files to create
hugo/content/dashboard/_index.md            # Dashboard page content
hugo/layouts/dashboard/list.html            # Dashboard layout with auth guard
hugo/static/js/auth-store.js               # Alpine.js auth store (reads indicator cookie)
```

**Structure Decision**: This feature spans both the Workers application (TypeScript) and the Hugo static site. TypeScript changes are limited to the presentation layer (cookie utilities and handlers). Hugo changes include config, layouts, and a new content page. No new application/domain/infrastructure layers needed.

## Implementation Approach

### US1: Static Auth Links in Navbar (P1)

**Changes:**

1. **`hugo/config/_default/menus.yaml`**: Replace the single "Get Started" button entry with two entries:
   - `Sign In` → `/auth/sign-in` (weight: 1)
   - `Sign Up` → `/auth/sign-up` (weight: 2)

2. **`hugo/layouts/_partials/shared/header.html`**: Wrap the buttons menu in Alpine.js conditional rendering:
   - When unauthenticated (`!$store.auth.isAuthenticated`): show Sign In (text link) and Sign Up (primary button)
   - When authenticated (`$store.auth.isAuthenticated`): show Dashboard button
   - Use `x-cloak` with CSS to prevent flash of unauthenticated content for authenticated users
   - The `x-cloak` hides only the auth area until Alpine inits; Sign In / Sign Up remain the default HTML (progressive enhancement)

3. **No JavaScript required** for Sign In / Sign Up links — they are plain HTML anchors. Alpine.js only enhances by swapping to Dashboard when authenticated.

### US2: Client-Side Auth Status Check (P1)

**Changes:**

1. **`src/presentation/utils/cookieBuilder.ts`** (TDD):
   - Add `AUTH_INDICATOR_COOKIE_NAME = 'auth_status'`
   - Add `buildAuthIndicatorCookie()`: Sets `auth_status=1; Secure; SameSite=Lax; Path=/; Max-Age=2592000` (NOT HttpOnly, NOT `__Host-` prefix since it must be readable by JS)
   - Add `clearAuthIndicatorCookie()`: Same attributes with `Max-Age=0`

2. **`src/presentation/handlers/AuthPageHandlers.ts`**:
   - In `handlePostSignIn()`: Append `Set-Cookie: buildAuthIndicatorCookie()` alongside session cookie
   - In `handlePostSignOut()`: Append `Set-Cookie: clearAuthIndicatorCookie()` alongside session cookie clear

3. **`hugo/static/js/auth-store.js`**: Alpine.js store that:
   - Reads `document.cookie` for `auth_status` on init
   - Exposes `isAuthenticated` as reactive boolean
   - No server round-trip — purely client-side cookie check

4. **`hugo/layouts/baseof.html`**: Add Alpine.js and auth-store script tags:
   - `<script defer src="/js/alpine-3.15.8.min.js"></script>`
   - `<script src="/js/auth-store.js"></script>` (before Alpine, so store is registered on init)

### US3: Authenticated Navbar Swap (P2)

**Changes:**

1. **`hugo/layouts/_partials/shared/header.html`**: (covered in US1 above)
   - Authenticated state shows "Dashboard" button linking to `/dashboard/`
   - Uses Alpine.js `x-show` directives bound to `$store.auth.isAuthenticated`

### US4: Dashboard Page with Auth Guard (P2)

**Changes:**

1. **`hugo/content/dashboard/_index.md`**: Minimal dashboard content page with front matter:
   - `title: Dashboard`
   - `layout: list` (uses dashboard-specific list layout)

2. **`hugo/layouts/dashboard/list.html`**: Dashboard layout that:
   - Extends `baseof.html`
   - Includes Alpine.js redirect logic: if `!$store.auth.isAuthenticated`, redirect to `/auth/sign-in?redirectTo=%2Fdashboard%2F`
   - Shows dashboard content when authenticated

### Cookie Design Decisions

- **Cookie name**: `auth_status` (not `__Host-` prefixed because `__Host-` requires `HttpOnly` in practice and we need JS access)
- **Value**: `1` (presence = authenticated, absence = not authenticated)
- **Attributes**: `Secure; SameSite=Lax; Path=/; Max-Age=2592000`
- **NOT HttpOnly**: Must be readable by `document.cookie` in Alpine.js
- **NOT sensitive**: Contains no tokens, session IDs, or user data
- **Lifetime**: Matches session cookie (30 days) — cleared on sign-out

### Progressive Enhancement Strategy

- **Without JavaScript**: Sign In / Sign Up links work as plain HTML anchors. Dashboard page shows content (server-side auth protects actual data endpoints). No navbar swap occurs.
- **With JavaScript**: Alpine.js reads indicator cookie, conditionally shows Dashboard button, redirects unauthenticated users from `/dashboard/`.

## Complexity Tracking

> No violations to justify — all constitutional gates pass.

## Post-Design Constitution Re-Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Test-First | PASS | TDD for cookieBuilder additions; Hugo build tests for template changes |
| II. Type Safety | PASS | New cookie functions have explicit return types |
| III. Code Quality | PASS | JSDoc on new public functions |
| IV. Pre-commit | PASS | All changes pass existing gates |
| V. Warnings | PASS | No new warnings |
| VI. Workers Target | PASS | Cookie manipulation via standard `Set-Cookie` headers |
| VII. Simplicity | PASS | Minimal changes; cookie-based approach avoids new infrastructure |

**Post-Design Gate Result**: PASS
