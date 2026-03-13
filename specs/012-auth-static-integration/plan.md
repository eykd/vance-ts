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
   <div x-data aria-live="polite">
     {{/* Unauthenticated: visible by default (progressive enhancement for no-JS) */}}
     <ul class="menu menu-horizontal" x-show="!$store.auth.isAuthenticated" aria-label="Account">
       <li class="text-center">
         <a class="link link-hover link-primary" href="/auth/sign-in">Sign In</a>
       </li>
       <li class="text-center">
         {{ partial "components/button/primary" (dict "label" "Sign Up" "href" "/auth/sign-up") }}
       </li>
     </ul>
     {{/* Authenticated: hidden until Alpine confirms auth (x-cloak prevents FOUC) */}}
     <ul class="menu menu-horizontal" x-cloak x-show="$store.auth.isAuthenticated" aria-label="Account">
       <li class="text-center">
         {{ partial "components/button/primary" (dict "label" "Dashboard" "href" "/dashboard/") }}
       </li>
     </ul>
   </div>
   ```

   **Alpine.js `x-data` scope requirement**: The wrapping `<div x-data aria-live="polite">` is mandatory — Alpine.js 3 only processes directives (`x-show`, `x-cloak`, `$store`) on elements that are inside an `x-data` component scope. Without it, Alpine ignores the `x-show` directives entirely and both sections remain visible. The bare `x-data` attribute (no value) creates a minimal component with no local state, since we only need access to the global `$store`. The `aria-live="polite"` ensures screen readers announce the content change when Alpine swaps between auth states (WCAG 4.1.3 Status Messages, Level AA). The `aria-label="Account"` on both `<ul>` elements distinguishes the auth area from the main navigation list. The `link-primary` class on the Sign In link ensures visible keyboard focus (WCAG 2.4.7 Focus Visible, Level AA).

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
         .some(c => c.trim() === 'auth_status=1')
     });
   });
   ```

   Uses `alpine:init` event (fires before Alpine processes `x-show`/`x-cloak`) to register the store. The cookie read is synchronous — no network request, no async.

   **Exact match rationale**: Uses `=== 'auth_status=1'` instead of `.startsWith('auth_status=')` to: (1) reject the empty-value form `auth_status=` that briefly exists when `clearAuthIndicatorCookie()` sets `Max-Age=0`, preventing a transient false positive; (2) prevent client-side cookie injection (`document.cookie = 'auth_status=pwned'`) from triggering the authenticated UI state; (3) future-proof against cookies with similar prefixes (e.g., `auth_status_v2`).

4. **`hugo/layouts/baseof.html`**: Add two script tags inside `<head>`, immediately before the closing `</head>` tag (currently line 82). Insert between the Tailwind CSS `{{ end }}` (line 81) and `</head>` (line 82):

   ```html
   <!-- Auth store (must register before Alpine initializes) -->
   <script defer src="/js/auth-store.js"></script>
   <!-- Alpine.js (defer ensures DOM ready; alpine:init fires before processing) -->
   <script defer src="/js/alpine-3.15.8.min.js"></script>
   ```

   **Prerequisite verified**: `hugo/static/js/alpine-3.15.8.min.js` already exists in the repo (self-hosted, same file used by the Workers auth layout at path `/js/alpine-3.15.8.min.js`). No file copy or download needed.

   **Script ordering rationale**: Both scripts use `defer`, which guarantees execution in document order after DOM parsing: `auth-store.js` executes first (appears first in DOM), then `alpine-3.15.8.min.js`. When Alpine initializes, it fires the `alpine:init` event, which triggers the store registration from `auth-store.js`, then Alpine processes `x-show`/`x-cloak` directives with the store already populated. Using `defer` for both avoids a render-blocking network request on every page load.

   **Note**: This adds Alpine.js site-wide to all Hugo pages. Currently Alpine.js is only loaded on Workers-rendered auth pages (`authLayout.ts`). After this change, both static Hugo pages and Workers auth pages will have Alpine.js available. The auth pages will continue to use their own `authLayout.ts` Alpine.js loading (separate request path).

### US3: Authenticated Navbar Swap (P2)

**Changes:**

1. **`hugo/layouts/_partials/shared/header.html`**: (covered in US1 above)
   - Authenticated state shows "Dashboard" button linking to `/dashboard/`
   - Uses Alpine.js `x-show` directives bound to `$store.auth.isAuthenticated`

### US4: Dashboard Page with Auth Guard (P2)

**Prerequisites:**

- **Redirect allowlist update**: Add `'dashboard'` to `ALLOWED_FIRST_SEGMENTS` in `src/presentation/utils/redirectValidator.ts`. Without this, `validateRedirectTo('/dashboard/')` returns `'/'` and the post-login redirect back to `/dashboard/` silently fails — the user lands on the homepage instead of the dashboard after signing in from the auth guard redirect. Add a TDD test case in `redirectValidator.spec.ts`: `it('should accept /dashboard/ as a valid redirect destination')`.

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
     x-init="if (!$store.auth.isAuthenticated) { $el.querySelector('[role=status]').textContent = 'Redirecting to sign in...'; window.location.replace('/auth/sign-in?redirectTo=%2Fdashboard%2F'); }"
   >
     {{/* Screen reader announcement for redirect */}}
     <p role="status" class="sr-only"></p>
     <div class="container mx-auto p-8" x-show="$store.auth.isAuthenticated">
       <h1 class="text-3xl font-bold">{{ .Title }}</h1>
       {{ .Content }}
     </div>
     <noscript>
       <div class="container mx-auto p-8">
         <h1 class="text-3xl font-bold">{{ .Title }}</h1>
         <p>JavaScript is required to access the dashboard. Please <a href="/auth/sign-in">sign in</a>.</p>
       </div>
     </noscript>
   </div>
   {{ end }}
   ```

   **Behavior**:
   - `x-init` fires on Alpine init — if no `auth_status` cookie, announces redirect to screen readers via `role="status"`, then redirects to sign-in with `redirectTo` param
   - `window.location.replace()` (not `assign`) prevents back-button returning to protected page
   - `x-show` hides content until Alpine confirms auth — no `x-cloak` because the dashboard content should be visible as a fallback when JS fails to load (per progressive enhancement), and `x-show` defaults to hidden only after Alpine initializes. The brief flash for authenticated users is acceptable per spec Q2
   - The `redirectTo=%2Fdashboard%2F` is a URL-encoded literal (`/dashboard/`) hardcoded in the template — update if this page moves. For future protected pages, consider a Hugo partial using `{{ .RelPermalink | urlquery }}`
   - `<noscript>` block provides a navigation path when JavaScript is disabled or fails to load, instead of showing an empty page
   - **Without JavaScript**: `<noscript>` block shows sign-in link. This is acceptable because the dashboard is a static placeholder — actual data endpoints behind `/app/*` are protected by server-side `requireAuth` middleware

### Cookie Design Decisions

- **Cookie name**: `auth_status` (not `__Host-` prefixed — while `__Host-` only technically requires `Secure` + `Path=/` + no `Domain`, the prefix convention signals a security-critical cookie; the indicator cookie is a non-sensitive UI hint and does not warrant that signal)
- **Value**: `1` (presence = authenticated, absence = not authenticated)
- **Attributes**: `Secure; SameSite=Lax; Path=/; Max-Age=2592000`
- **NOT HttpOnly**: Must be readable by `document.cookie` in Alpine.js
- **NOT sensitive**: Contains no tokens, session IDs, or user data
- **Lifetime**: Matches session cookie (30 days) — cleared on sign-out
- **Desynchronization by design**: The indicator cookie is a UI hint, not an auth mechanism. If the server-side session is invalidated (e.g., admin revocation, database reset) while the indicator cookie persists, the user sees Dashboard in the navbar and can navigate to `/dashboard/`. This is acceptable because: (1) the dashboard page is a static placeholder with no sensitive data, (2) actual data endpoints behind `/app/*` are protected by server-side `requireAuth` middleware that checks the real session, and (3) when the user eventually hits a server-side endpoint, the failed auth will redirect them to sign-in, at which point the new sign-in flow sets a fresh indicator cookie. The indicator cookie will naturally expire at the same time as the session cookie (both Max-Age=2592000).
- **Sign-out error paths**: In `handlePostSignOut()`, clear the indicator cookie in ALL response branches (success, no-session early return, and service_error fallback), not just the success path. If the session cookie is deleted by browser privacy settings but the indicator cookie survives, the user sees "Dashboard" in the navbar but cannot sign out because the no-session early return does not clear the indicator cookie. Always clearing the indicator cookie on sign-out attempt ensures consistent UI state regardless of server-side outcome.
- **Login CSRF awareness**: The indicator cookie amplifies the impact of any hypothetical login CSRF attack — the victim would see the authenticated navbar state, making it less likely they notice they are in the attacker's account. The existing double-submit CSRF protection on `/auth/sign-in` mitigates this. Do not weaken or remove CSRF protection on the sign-in endpoint.

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

## Security Considerations

### Input Validation

- **Redirect allowlist** (Critical): The `redirectTo` parameter in the dashboard auth guard must pass through `validateRedirectTo()` in the sign-in handler. The `ALLOWED_FIRST_SEGMENTS` set must include `'dashboard'` — without it, post-login redirect silently falls back to `/` and US4 acceptance scenario 3 fails.
- **Cookie value validation**: The client-side auth check uses exact match (`=== 'auth_status=1'`) to reject unexpected values. This prevents: (a) the empty-value `auth_status=` from a cleared cookie registering as authenticated, (b) client-side cookie injection from triggering authenticated UI, (c) prefix collisions with future cookies.

### Data Protection

- **Dashboard content safety**: Since `/dashboard/` is a static Hugo page served without server-side auth, its HTML source is always visible (View Source, curl, JavaScript disabled). Never put sensitive content, personalized data, or internal URLs in the Hugo dashboard template. Dynamic dashboard content must be loaded via authenticated `/app/*` endpoints after the page renders. Add `<meta name="robots" content="noindex">` to the dashboard layout to prevent search engine indexing.

### CSP Awareness

- **Static site CSP and indicator cookie**: The Hugo `_headers` file permits `script-src 'unsafe-inline'`, while Workers auth pages use strict `script-src 'self'`. The indicator cookie is JS-readable by design, and `unsafe-inline` means any HTML injection on static pages could read or manipulate it. This is acceptable today (no user-generated content on static pages). Prioritize CSP migration away from `unsafe-inline` if user-generated content is added.

## Edge Cases & Error Handling

### Sign-Out Error Paths

- **No-session early return**: When `handlePostSignOut()` detects no session cookie, always clear the indicator cookie in the redirect response. If the session cookie was deleted by browser privacy settings but the indicator cookie survived, this prevents the user from being stuck with a stale "Dashboard" navbar.
- **Service error fallback**: When the sign-out use case returns a service error, always clear the indicator cookie in the redirect response. This ensures consistent UI state even when server-side session invalidation fails.

### Cookie Behavior

- **Secure cookie on localhost**: The `Secure` attribute on `auth_status` causes browsers to reject the cookie on `http://localhost`. Chrome makes an exception for localhost, but Firefox and Safari may not. Developers should use Chrome for local testing, or set up HTTPS localhost via `mkcert`. Document this in quickstart.md.
- **Safari ITP**: The `auth_status` cookie is set server-side via `Set-Cookie` header, so it is not subject to Safari ITP's 7-day client-cookie cap. The 30-day Max-Age is respected. If future features set cookies via JavaScript, monitor for ITP reclassification.

### JavaScript Failure

- **Alpine.js load failure**: If Alpine.js fails to load (network error, content blocker), `x-cloak` permanently hides the Dashboard button (correct progressive enhancement). On `/dashboard/`, the `<noscript>` block provides a sign-in link instead of showing an empty page. The `x-init` redirect does not fire, so the page content is accessible but unguarded (acceptable — server-side auth protects data endpoints).

## Performance Considerations

### Script Loading

- **Non-blocking auth-store.js**: Both `auth-store.js` and Alpine.js load with `defer` to avoid render-blocking. The `defer` attribute guarantees document-order execution, so the `alpine:init` listener in `auth-store.js` is always registered before Alpine fires the event.
- **No double-loading risk**: `authLayout.ts` renders Workers-served auth pages (`/auth/sign-in`, `/auth/sign-up`), while `baseof.html` renders Hugo-generated static pages. These are disjoint page sets, so no page loads both layouts. The auth pages do not need `auth-store.js` because they are the sign-in/sign-up forms themselves.

### Layout Stability

- **CLS during navbar swap**: The `x-show` toggle between Sign In/Sign Up (two items) and Dashboard (one item) changes the flex container width, causing a Cumulative Layout Shift. Mitigate by setting a consistent `min-w` on the `<div x-data>` wrapper, sized to the wider state (Sign In + Sign Up). This prevents reflowing adjacent navbar content.

### Bundle Size

- **Alpine.js site-wide**: Loading Alpine.js (~17KB gzipped) on all pages adds modest transfer cost to content-only pages (blog posts, about, privacy). This is an acceptable trade-off: (1) the navbar auth swap is present on every page, so every page genuinely uses Alpine; (2) the file is cached after first load; (3) conditional loading would add template complexity without meaningful performance gain.

## Accessibility Requirements

### Screen Reader Support

- **Navbar auth swap announcement**: The `<div x-data aria-live="polite">` wrapper ensures screen readers announce the content change when Alpine swaps between auth states (WCAG 4.1.3 Status Messages, Level AA). The `polite` value ensures the announcement waits until the screen reader finishes current output.
- **Dashboard redirect feedback**: The dashboard template includes a `<p role="status" class="sr-only">` element that is populated with "Redirecting to sign in..." before the redirect fires, giving screen reader users context for the navigation change.
- **x-cloak timing**: During the window between HTML parse and Alpine initialization, screen readers only see Sign In / Sign Up regardless of auth state. This is by design — showing Dashboard before confirming authentication would be worse. On typical connections with cached assets, this window is imperceptible (<100ms).

### Keyboard Navigation

- **Sign In focus visibility**: The Sign In link uses `link-primary` class (in addition to `link link-hover`) to ensure the primary color provides visible focus contrast against the `bg-base-100` navbar background (WCAG 2.4.7 Focus Visible, Level AA).

### Semantic HTML

- **Navigation landmark**: As part of the header.html refactoring, ensure the navbar container uses `<nav aria-label="Main navigation">` (or is wrapped in one) to provide a navigation landmark for screen readers. This distinguishes the navbar from other page content (WCAG 1.3.1 Info and Relationships, Level A). This is a pre-existing gap that should be fixed in the same change.
- **Auth area list labeling**: Both `<ul>` elements in the auth area use `aria-label="Account"` to distinguish them from the main navigation list. Only one is visible at a time, so using the same label is correct.

## Applied Learnings

1. **Cookie builder pattern** (from `cookieBuilder.ts`): The existing session/CSRF cookie functions use a consistent pattern — constant name + constant attributes + function returning the full `Set-Cookie` value. The indicator cookie functions follow this exact pattern for consistency and discoverability.

2. **Headers.append() for multiple Set-Cookie** (from `AuthPageHandlers.ts`): The existing sign-in/sign-out handlers already use `Headers.append('Set-Cookie', ...)` to set multiple cookies in a single response. This is the correct Web Standard API approach — `append` adds without overwriting, unlike `set`.

3. **Alpine.js CSP compatibility** (from `securityHeaders.ts`): The existing CSP includes `style-src 'self' 'unsafe-inline'` specifically to support Alpine.js's `x-show` directive, which manipulates `element.style.display`. No CSP changes needed for this feature.

4. **Script ordering precedent** (from `authLayout.ts`): The Workers auth layout already loads Alpine.js with `defer`. The `alpine:init` event pattern ensures store registration before directive processing, regardless of script load order.

5. **Hugo button partials** (from `components/button/`): Both `primary.html` and `outline.html` accept `label` and `href` dict params. The navbar refactoring reuses these existing partials rather than introducing new ones.
