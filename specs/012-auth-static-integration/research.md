# Research: Auth-Static Site Integration

**Feature**: 012-auth-static-integration | **Date**: 2026-03-13

## Research Tasks

### R1: Indicator Cookie Design

**Decision**: Use a simple `auth_status=1` cookie with `Secure; SameSite=Lax; Path=/` attributes (no HttpOnly, no `__Host-` prefix).

**Rationale**:
- Must be readable by `document.cookie` → cannot be HttpOnly
- `__Host-` prefix requires HttpOnly in practice (browsers reject `__Host-` cookies without HttpOnly) → use unprefixed name
- `SameSite=Lax` matches session cookie policy (allows top-level navigations)
- `Secure` ensures HTTPS-only transmission
- Value is `1` (truthy) or absent — no sensitive data

**Alternatives considered**:
- **`__Secure-` prefix**: Valid option (requires only `Secure` flag). Rejected because `auth_status` is a UI hint, not a security token — the simpler unprefixed name is sufficient and avoids confusion with security-critical cookies.
- **JWT-based indicator**: Would allow embedding user info (name, email) for client-side rendering. Rejected because it adds complexity (signing, parsing) and the spec explicitly states the cookie is a UI hint only.
- **Server-side auth check endpoint**: Would be authoritative but adds a network round-trip per page load. Rejected per FR-005 (no server round-trip) and SC-004 (zero additional network requests).

### R2: Alpine.js Store for Auth State

**Decision**: Use `Alpine.store('auth', { isAuthenticated })` initialized by reading `document.cookie` synchronously.

**Rationale**:
- Alpine.js is already bundled in static assets (`/js/alpine-3.15.8.min.js`)
- `Alpine.store()` provides reactive state accessible from any component via `$store.auth`
- Cookie read is synchronous → no flash of incorrect state
- Store registered before `Alpine.start()` via script ordering

**Alternatives considered**:
- **Alpine.js `x-data` on `<body>`**: Would work but pollutes global scope; `Alpine.store()` is the idiomatic approach for cross-component state.
- **HTMX server swap**: Original spec mentioned HTMX. Rejected because auth state is known at page load (from cookie) — no server request needed. Alpine.js conditional rendering is simpler and faster.
- **Custom event system**: Overly complex for a boolean state check.

### R3: Alpine.js Loading in Hugo

**Decision**: Add Alpine.js script tag to `baseof.html` with `defer` attribute. Add auth-store script (without `defer`) before Alpine.

**Rationale**:
- Alpine.js is currently only loaded in the Workers auth layout (`authLayout.ts`), not in Hugo's baseof
- The static file already exists at `/js/alpine-3.15.8.min.js`
- Script ordering: auth-store.js must execute before Alpine initializes to register the store
- `defer` on Alpine ensures DOM is ready; auth-store.js runs inline (small, synchronous)

**Alternatives considered**:
- **Hugo Pipes processing**: Unnecessary — Alpine.js is a pre-built library, not a source file.
- **CDN loading**: Rejected for self-hosting (already have local copy), performance, and CSP control.

### R4: Dashboard Page Auth Guard

**Decision**: Use Alpine.js `x-init` directive to check auth state and redirect via `window.location.replace()`.

**Rationale**:
- Simple, client-side only approach
- `window.location.replace()` prevents back-button returning to protected page
- Redirect URL includes `?redirectTo=%2Fdashboard%2F` for post-login return
- The existing `requireAuth` middleware handles `/app/*` routes but `/dashboard/` is a static Hugo page served by the ASSETS binding — no Workers middleware runs for it

**Alternatives considered**:
- **Workers middleware for `/dashboard/`**: Would require routing `/dashboard/` through Workers instead of static assets. Rejected because it adds complexity and latency for what is currently a static placeholder page.
- **`x-show` to hide content**: Would leave content in DOM (viewable via View Source). Acceptable per spec (server protects actual data), but redirect provides better UX.

### R5: Navbar Progressive Enhancement

**Decision**: Render Sign In / Sign Up as default HTML. Use Alpine.js `x-show` to conditionally swap to Dashboard button when authenticated.

**Rationale**:
- Progressive enhancement: links work without JS (FR-010)
- `x-cloak` + CSS hides auth area briefly until Alpine inits (prevents flash for authenticated users)
- Default state is unauthenticated (safest assumption)
- Authenticated state revealed by Alpine after cookie check

**Alternatives considered**:
- **Two separate partials toggled by Hugo param**: Would require build-time auth knowledge (impossible for static sites).
- **CSS-only toggle**: No way to read cookies from CSS.

### R6: Cookie Naming and `__Host-` Prefix Compatibility

**Decision**: Use plain `auth_status` name without any cookie prefix.

**Rationale**:
- Researched `__Host-` and `__Secure-` cookie prefixes
- `__Host-` requires: `Secure`, `Path=/`, and is treated as `HttpOnly` by spec intent — browsers may reject non-HttpOnly `__Host-` cookies
- `__Secure-` requires only `Secure` — viable but unnecessary for a non-sensitive UI hint
- The indicator cookie is explicitly non-sensitive (FR-009) and non-authoritative (FR-011)
- Simple name reduces confusion in cookie jar alongside `__Host-better-auth.session_token` and `__Host-csrf`

**Alternatives considered**:
- **`__Secure-auth_status`**: Valid but adds false sense of security importance to a UI hint cookie.
