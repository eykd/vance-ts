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
hugo/config/_default/menus.yaml             # Remove buttons menu (auth links hardcoded in header)
hugo/assets/css/styles.css                 # Add x-cloak CSS rule
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

1. **`hugo/config/_default/menus.yaml`**: Remove the `buttons` menu section entirely. The "Get Started" entry is no longer needed — the header template will hardcode the auth links and Dashboard button directly (not driven by menu data), because the Alpine.js conditional rendering requires explicit HTML structure that can't be expressed through Hugo's menu range loop.

2. **`hugo/layouts/_partials/shared/header.html`**: Replace the `{{ range }}` buttons loop with two Alpine.js-guarded sections. The existing loop iterates `site.Menus.buttons` with index-based styling (primary vs outline); this is replaced with explicit HTML for each auth state:

   ```html
   {{/* Auth-aware navbar buttons — Alpine.js swaps between states */}}
   <div x-data>
     {{/* Unauthenticated: visible by default (progressive enhancement for no-JS) */}}
     <ul class="menu menu-horizontal" x-show="!$store.auth.isAuthenticated">
       <li class="text-center">
         <a class="link link-hover" href="/auth/sign-in">Sign In</a>
       </li>
       <li class="text-center">
         {{ partial "components/button/primary" (dict "label" "Sign Up" "href" "/auth/sign-up") }}
       </li>
     </ul>
     {{/* Authenticated: hidden until Alpine confirms auth (x-cloak prevents FOUC) */}}
     <ul class="menu menu-horizontal" x-cloak x-show="$store.auth.isAuthenticated">
       <li class="text-center">
         {{ partial "components/button/primary" (dict "label" "Dashboard" "href" "/dashboard/") }}
       </li>
     </ul>
   </div>
   ```

   **Alpine.js `x-data` scope requirement**: The wrapping `<div x-data>` is mandatory — Alpine.js 3 only processes directives (`x-show`, `x-cloak`, `$store`) on elements that are inside an `x-data` component scope. Without it, Alpine ignores the `x-show` directives entirely and both sections remain visible. The bare `x-data` attribute (no value) creates a minimal component with no local state, since we only need access to the global `$store`.

   **Structure decision**: Two separate `<ul>` elements inside a single `x-data` wrapper rather than a single loop — removes the need for Hugo menu entries to carry auth-awareness, keeps the Alpine conditional at the container level, and preserves the existing button partial reuse.

   **Progressive enhancement behavior** (requires `x-data` wrapper for Alpine to process directives):
   - **Without JavaScript**: Sign In / Sign Up visible (no `x-cloak`), Dashboard hidden (`x-cloak` CSS keeps it hidden forever), `<div x-data>` is inert — correct default state.
   - **With JS, unauthenticated**: Alpine scans `x-data` scope, processes `x-show`, Sign In / Sign Up stays visible, Dashboard stays hidden — correct.
   - **With JS, authenticated**: Alpine hides Sign In / Sign Up via `x-show="false"`, removes `x-cloak` and shows Dashboard via `x-show="true"` — correct. Brief flash of Sign In / Sign Up is acceptable per spec Q2 resolution.

3. **`x-cloak` CSS rule**: Add to `hugo/assets/css/styles.css` (the TailwindCSS source processed by Hugo Pipes):

   ```css
   [x-cloak] { display: none !important; }
   ```

   This must be in the render-blocking stylesheet (not a deferred script) to prevent the Dashboard button from appearing before Alpine.js initializes. The `!important` ensures it overrides any DaisyUI display utilities. Only the authenticated section uses `x-cloak` — the unauthenticated section is visible by default for progressive enhancement.

4. **No JavaScript required** for Sign In / Sign Up links — they are plain HTML anchors. Alpine.js only enhances by swapping to Dashboard when authenticated.

### US2: Client-Side Auth Status Check (P1)

**Changes:**

1. **`src/presentation/utils/cookieBuilder.ts`** (TDD):
   - Add `AUTH_INDICATOR_COOKIE_NAME = 'auth_status'`
   - Add `AUTH_INDICATOR_COOKIE_ATTRIBUTES = 'Secure; SameSite=Lax; Path=/'` (NOT HttpOnly, NOT `__Host-` prefix since it must be readable by JS)
   - Add `buildAuthIndicatorCookie()`: Returns `'auth_status=1; Secure; SameSite=Lax; Path=/; Max-Age=2592000'`
   - Add `clearAuthIndicatorCookie()`: Returns `'auth_status=; Secure; SameSite=Lax; Path=/; Max-Age=0'`
   - Follow the exact same pattern as existing `buildSessionCookie`/`clearSessionCookie` (constant name + attributes, function returns the full Set-Cookie value)

   **TDD test cases** (add to `cookieBuilder.spec.ts`, following the existing describe-per-function pattern):

   ```
   describe('buildAuthIndicatorCookie', () => {
     it('should start with auth_status=1')
     it('should include Secure flag')
     it('should include SameSite=Lax')
     it('should include Path=/')
     it('should include Max-Age=2592000')
     it('should NOT include HttpOnly flag')
   })

   describe('clearAuthIndicatorCookie', () => {
     it('should start with auth_status=')
     it('should include Secure flag')
     it('should include SameSite=Lax')
     it('should include Path=/')
     it('should include Max-Age=0')
     it('should NOT include HttpOnly flag')
   })
   ```

   The "NOT HttpOnly" assertions are unique to the indicator cookie — all other cookies in `cookieBuilder.ts` use HttpOnly. These tests document that the indicator cookie is intentionally JS-readable.

2. **`src/presentation/handlers/AuthPageHandlers.ts`**:

   In `handlePostSignIn()` success branch (line 194–199), add one `headers.append` call:

   ```typescript
   if (result.ok) {
     const headers = new Headers();
     headers.set('Location', redirectTo);
     headers.append('Set-Cookie', buildSessionCookie(result.sessionToken));
     headers.append('Set-Cookie', clearCsrfCookie());
     headers.append('Set-Cookie', buildAuthIndicatorCookie()); // NEW
     return new Response(null, { status: 303, headers });
   }
   ```

   In `handlePostSignOut()` success branch (line 319–325), add one `headers.append` call:

   ```typescript
   if (result.ok) {
     const headers = new Headers();
     headers.set('Location', '/auth/sign-in');
     headers.append('Set-Cookie', clearSessionCookie());
     headers.append('Set-Cookie', clearCsrfCookie());
     headers.append('Set-Cookie', clearAuthIndicatorCookie()); // NEW
     return new Response(null, { status: 303, headers });
   }
   ```

   **Note**: `Headers.append()` is the correct method — it adds multiple `Set-Cookie` headers without overwriting. This is the same pattern already used for session + CSRF cookies (see lines 197–198). The import must add `buildAuthIndicatorCookie` and `clearAuthIndicatorCookie` to the existing import from `cookieBuilder.js`.

   **Sign-up flow (no indicator cookie)**: `handlePostSignUp()` does NOT set the indicator cookie. On successful registration, it redirects to `/auth/sign-in?registered=true` — the user must sign in to create a session, at which point `handlePostSignIn()` sets both the session cookie and the indicator cookie. This is correct by design: no session exists after registration, so no auth indicator should be present.

   **Test updates for `AuthPageHandlers.spec.ts`**: The existing test file (1,093 lines) uses `res.headers.get('Set-Cookie')` with `.toContain()` assertions to verify Set-Cookie headers. Two existing test sections need indicator cookie assertions added:

   - **`handlePostSignIn` → "successful sign-in"** (around lines 401–408): Add assertion `expect(setCookies).toContain('auth_status=1')` alongside the existing session cookie assertion.
   - **`handlePostSignOut` → "successful sign-out"** (around lines 1047–1058): Add assertion `expect(setCookies).toContain('auth_status=')` and `expect(setCookies).toContain('Max-Age=0')` for the cleared indicator cookie, alongside the existing session/CSRF clear assertions.
   - **`handlePostSignUp`**: No changes needed — sign-up does not set any cookies (verified: line 259 uses only a Location header redirect).

3. **`hugo/static/js/auth-store.js`**: Alpine.js store — a single self-contained file:

   ```javascript
   document.addEventListener('alpine:init', () => {
     Alpine.store('auth', {
       isAuthenticated: document.cookie
         .split(';')
         .some(c => c.trim().startsWith('auth_status='))
     });
   });
   ```

   Uses `alpine:init` event (fires before Alpine processes `x-show`/`x-cloak`) to register the store. The cookie read is synchronous — no network request, no async.

4. **`hugo/layouts/baseof.html`**: Add two script tags inside `<head>`, immediately before the closing `</head>` tag (currently line 82). Insert between the Tailwind CSS `{{ end }}` (line 81) and `</head>` (line 82):

   ```html
   <!-- Auth store (must register before Alpine initializes) -->
   <script src="/js/auth-store.js"></script>
   <!-- Alpine.js (defer ensures DOM ready; alpine:init fires before processing) -->
   <script defer src="/js/alpine-3.15.8.min.js"></script>
   ```

   **Prerequisite verified**: `hugo/static/js/alpine-3.15.8.min.js` already exists in the repo (self-hosted, same file used by the Workers auth layout at path `/js/alpine-3.15.8.min.js`). No file copy or download needed.

   **Script ordering rationale**: `auth-store.js` loads without `defer` so it executes immediately and registers the `alpine:init` event listener. Alpine.js loads with `defer` so it runs after DOM parsing. When Alpine initializes, it fires the `alpine:init` event, which triggers the store registration, then Alpine processes `x-show`/`x-cloak` directives with the store already populated.

   **Note**: This adds Alpine.js site-wide to all Hugo pages. Currently Alpine.js is only loaded on Workers-rendered auth pages (`authLayout.ts`). After this change, both static Hugo pages and Workers auth pages will have Alpine.js available. The auth pages will continue to use their own `authLayout.ts` Alpine.js loading (separate request path).

### US3: Authenticated Navbar Swap (P2)

**Changes:**

1. **`hugo/layouts/_partials/shared/header.html`**: (covered in US1 above)
   - Authenticated state shows "Dashboard" button linking to `/dashboard/`
   - Uses Alpine.js `x-show` directives bound to `$store.auth.isAuthenticated`

### US4: Dashboard Page with Auth Guard (P2)

**Changes:**

1. **`hugo/content/dashboard/_index.md`**: Minimal dashboard content page:

   ```markdown
   ---
   title: Dashboard
   layout: list
   ---
   ```

   Uses Hugo's template lookup: `layouts/dashboard/list.html` (section-specific list layout).

2. **`hugo/layouts/dashboard/list.html`**: Dashboard layout with client-side auth guard:

   ```html
   {{ define "main" }}
   <div
     x-data
     x-init="if (!$store.auth.isAuthenticated) window.location.replace('/auth/sign-in?redirectTo=%2Fdashboard%2F')"
   >
     <div class="container mx-auto p-8" x-show="$store.auth.isAuthenticated" x-cloak>
       <h1 class="text-3xl font-bold">{{ .Title }}</h1>
       {{ .Content }}
     </div>
   </div>
   {{ end }}
   ```

   **Behavior**:
   - `x-init` fires on Alpine init — if no `auth_status` cookie, redirects to sign-in with `redirectTo` param
   - `window.location.replace()` (not `assign`) prevents back-button returning to protected page
   - `x-show` + `x-cloak` hides content until Alpine confirms auth — prevents brief content flash
   - The `redirectTo=%2Fdashboard%2F` is a URL-encoded literal (`/dashboard/`) hardcoded in the template — no runtime encoding needed since it's a static value
   - **Without JavaScript**: Dashboard content is visible (no auth guard). This is acceptable because the dashboard is a static placeholder — actual data endpoints behind `/app/*` are protected by server-side `requireAuth` middleware

### Cookie Design Decisions

- **Cookie name**: `auth_status` (not `__Host-` prefixed — while `__Host-` only technically requires `Secure` + `Path=/` + no `Domain`, the prefix convention signals a security-critical cookie; the indicator cookie is a non-sensitive UI hint and does not warrant that signal)
- **Value**: `1` (presence = authenticated, absence = not authenticated)
- **Attributes**: `Secure; SameSite=Lax; Path=/; Max-Age=2592000`
- **NOT HttpOnly**: Must be readable by `document.cookie` in Alpine.js
- **NOT sensitive**: Contains no tokens, session IDs, or user data
- **Lifetime**: Matches session cookie (30 days) — cleared on sign-out
- **Desynchronization by design**: The indicator cookie is a UI hint, not an auth mechanism. If the server-side session is invalidated (e.g., admin revocation, database reset) while the indicator cookie persists, the user sees Dashboard in the navbar and can navigate to `/dashboard/`. This is acceptable because: (1) the dashboard page is a static placeholder with no sensitive data, (2) actual data endpoints behind `/app/*` are protected by server-side `requireAuth` middleware that checks the real session, and (3) when the user eventually hits a server-side endpoint, the failed auth will redirect them to sign-in, at which point the new sign-in flow sets a fresh indicator cookie. The indicator cookie will naturally expire at the same time as the session cookie (both Max-Age=2592000).

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

## Applied Learnings

1. **Cookie builder pattern** (from `cookieBuilder.ts`): The existing session/CSRF cookie functions use a consistent pattern — constant name + constant attributes + function returning the full `Set-Cookie` value. The indicator cookie functions follow this exact pattern for consistency and discoverability.

2. **Headers.append() for multiple Set-Cookie** (from `AuthPageHandlers.ts`): The existing sign-in/sign-out handlers already use `Headers.append('Set-Cookie', ...)` to set multiple cookies in a single response. This is the correct Web Standard API approach — `append` adds without overwriting, unlike `set`.

3. **Alpine.js CSP compatibility** (from `securityHeaders.ts`): The existing CSP includes `style-src 'self' 'unsafe-inline'` specifically to support Alpine.js's `x-show` directive, which manipulates `element.style.display`. No CSP changes needed for this feature.

4. **Script ordering precedent** (from `authLayout.ts`): The Workers auth layout already loads Alpine.js with `defer`. The `alpine:init` event pattern ensures store registration before directive processing, regardless of script load order.

5. **Hugo button partials** (from `components/button/`): Both `primary.html` and `outline.html` accept `label` and `href` dict params. The navbar refactoring reuses these existing partials rather than introducing new ones.
