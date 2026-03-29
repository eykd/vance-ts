# Implementation Plan: Static Error Pages

**Branch**: `015-static-error-pages` | **Date**: 2026-03-25 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/015-static-error-pages/spec.md`

## Summary

Replace JSON error responses on non-API routes with branded HTML error pages. Hugo generates static 404 and 500 error pages at build time; the Worker serves these via ASSETS for errors on Worker-handled routes and adds a global error handler (`app.onError()`) for unhandled exceptions. API routes (`/api/*`) continue returning JSON.

## Technical Context

**Language/Version**: TypeScript (ES2022) + Hugo Go templates
**Primary Dependencies**: Hono (HTTP framework), DaisyUI 5, Tailwind CSS 4, Hugo
**Storage**: N/A (no persistence — static pages only)
**Testing**: Vitest with `@cloudflare/vitest-pool-workers` (Worker tests), Hugo build verification
**Target Platform**: Cloudflare Workers + ASSETS binding (static site)
**Project Type**: Web (static-first with Worker overlay)
**Performance Goals**: Error pages must render from pre-built static assets — zero compute beyond ASSETS.fetch()
**Constraints**: Error pages must work without JavaScript (SC-005); no external API calls (SC-004)
**Scale/Scope**: 2 error page templates (404, 500), 1 global error handler, ~4 modified files

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                     | Status | Notes                                                                              |
| ----------------------------- | ------ | ---------------------------------------------------------------------------------- |
| I. Test-First Development     | PASS   | Worker error handler tested via Vitest; Hugo pages validated by build verification |
| II. Type Safety               | PASS   | All new TypeScript follows strict mode; error handler uses typed Hono Context      |
| III. Code Quality             | PASS   | JSDoc on public functions; consistent naming                                       |
| IV. Pre-commit Quality Gates  | PASS   | All hooks apply to changed files                                                   |
| V. Warning/Deprecation Policy | PASS   | No new warnings introduced                                                         |
| VI. Cloudflare Workers Target | PASS   | Uses ASSETS.fetch() — no Node.js APIs                                              |
| VII. Simplicity               | PASS   | Pre-built static pages served via existing ASSETS binding — minimal new code       |

No violations. No complexity tracking needed.

## Architecture

### Design Decision: Pre-built Static Pages via Hugo + ASSETS

**Decision**: Generate error pages as static HTML via Hugo templates at build time. The Worker fetches these from ASSETS when it needs to serve an error response.

**Rationale**:

- Hugo already builds `404.html` at the site root via `layouts/404.html`
- Error pages share the site's baseof.html layout (header, footer, nav) automatically
- No runtime template rendering needed — ASSETS.fetch() serves pre-built HTML
- Consistent with the static-first architecture

**Alternatives considered**:

- TypeScript template functions (like authError.ts): Rejected — would duplicate Hugo's layout structure and go out of sync with site design changes
- Cloudflare custom error pages (Enterprise only): Not available on current plan

### Request Flow for Errors

```
Request → Worker
  ├─ /api/* → JSON error (existing behavior, unchanged)
  ├─ /app/_/* → JSON error (HTMX partials, existing behavior, unchanged)
  ├─ /auth/* → authLayout error pages (existing behavior, unchanged)
  ├─ Worker-handled route throws → app.onError()
  │   ├─ /api/* path → JSON 500
  │   └─ other path → fetch /500/ from ASSETS (fallback: inline HTML)
  └─ Static fallthrough → ASSETS.fetch()
      ├─ Found → serve static page
      └─ Not found → ASSETS returns Hugo's 404.html (existing behavior)
```

**Key behavior: ASSETS.fetch() does NOT throw on 404** — it returns a 404 Response with Hugo's pre-built 404.html content. This means `app.onError()` only catches unhandled exceptions from handler code, not missing static assets. This is the correct behavior: static 404s are already served as branded HTML by Hugo.

**Security headers**: The `withSecurityHeaders` middleware (`app.use('*', ...)`) is a post-processing middleware (`await next(); c.header(...)`) — whether its post-`next()` code runs after `app.onError()` handles an exception depends on Hono's internal compose-chain error propagation. As defense-in-depth, `serveErrorPage()` must explicitly call `applySecurityHeaders()` on the Response headers (matching the `AuthPageHandlers.buildRateLimitedResponse()` pattern). The HTMX fragment path uses `c.html()` which flows through Hono's context — middleware should apply there, but `serveErrorPage()` returns a raw `Response` that bypasses the context.

#### Scope of `app.onError()` — Worker-Routed Paths Only

**Important**: `wrangler.toml` `run_worker_first` only routes `/api/*`, `/app/*`, `/auth/*`, `/dashboard`, and `/dashboard/*` to the Worker. All other requests go directly to the ASSETS binding (Cloudflare static asset serving) and never reach the Worker. Therefore:

- `app.onError()` can only catch exceptions on **Worker-handled routes**
- Static content paths (`/`, `/about`, `/blog/*`, etc.) never reach the Worker, so they cannot trigger `app.onError()`
- If ASSETS itself encounters an error on a static path, Cloudflare returns its own error response — the Worker has no opportunity to intercept it

This is correct behavior: static asset serving has no application code that can throw. The 500 error page is specifically for failures in Worker handler/middleware code (auth, rate limiting, D1 queries, etc.).

### Error Response Strategy by Route Type

| Route Pattern   | 404 Behavior                             | 500 Behavior                                    |
| --------------- | ---------------------------------------- | ----------------------------------------------- |
| `/api/*`        | JSON `{"error": "Not found"}` (existing) | JSON `{"error": "Internal server error"}` (new) |
| `/app/_/*`      | JSON (existing)                          | HTML 500 page (new via onError)                 |
| `/auth/*`       | authLayout (existing)                    | HTML 500 page (new via onError)                 |
| Everything else | Hugo 404.html via ASSETS (existing)      | HTML 500 page (new via onError)                 |

**Clarification**: The 404 column describes **route catch-all handlers** (`apiNotFound`, `appPartialNotFound`, `staticAssetFallthrough`), NOT `app.onError()`. `app.onError()` is ONLY called for **thrown exceptions** in handler/middleware code, not for missing routes. Missing routes fall through to explicit catch-all handlers. Consequence: `serveErrorPage()` will only ever be called with `statusCode=500` from `app.onError()`. The function's status code parameter is reserved for future callers.

## Project Structure

### Documentation (this feature)

```text
specs/015-static-error-pages/
├── spec.md
├── plan.md              # This file
├── research.md          # Phase 0 output
└── checklists/
    └── requirements.md
```

### Source Code Changes

```text
hugo/
├── layouts/
│   ├── 404.html                          # MODIFY: extract shared error partial
│   └── _partials/
│       └── errors/
│           └── error-hero.html           # NEW: shared error page partial
├── content/
│   └── 500.md                            # NEW: 500 error page content

src/
├── worker.ts                             # MODIFY: add app.onError() handler
├── presentation/
│   ├── handlers/
│   │   └── ErrorPageHandlers.ts          # NEW: error page response helpers
│   └── utils/
│       └── isApiRoute.ts                 # NEW: route classification utility
```

**Structure Decision**: Extends existing Hugo + Worker architecture. No new layers or patterns — error pages are static Hugo content; Worker changes are a single error handler addition.

## Implementation Details

### Phase 1: Hugo Error Page Templates

#### 1a. Shared Error Partial

Create `hugo/layouts/_partials/errors/error-hero.html` extracting the common pattern from the existing 404.html:

```html
{{/*
  Shared error page hero component.
  Params: .code (string), .title (string), .message (string),
          .alertClass (string), .iconPath (string - SVG path d attribute),
          .baseURL (string - site base URL, defaults to "/")

  CSP NOTE: Worker-served error pages use strict CSP (style-src 'self',
  script-src 'self') which blocks inline styles and onclick handlers.
  This partial must NOT use <noscript><style>, onclick=, or any inline
  script/style attributes. The "Go Home" link is the sole navigation
  action — it works without JavaScript on all CSP configurations.
*/}}
<div class="hero min-h-[60vh]">
  <div class="hero-content text-center">
    <div class="max-w-md">
      <div class="alert {{ .alertClass }} mb-8" role="alert">
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="{{ .iconPath }}" />
        </svg>
        <span>{{ .title }}</span>
      </div>
      <h1 class="text-7xl font-bold text-primary mb-4" aria-label="{{ .code }} — {{ .title }}">{{ .code }}</h1>
      <p class="text-xl text-base-content/70 mb-8">{{ .message }}</p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <a href="{{ .baseURL | default "/" }}" class="btn btn-primary">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Go Home
        </a>
      </div>
    </div>
  </div>
</div>
```

**Home Link URL**: The partial accepts `baseURL` via the dict context, defaulting to `"/"`. Callers MUST pass `$.Site.BaseURL` to ensure the home link works in both development (localhost:1313) and production. This preserves the existing `404.html` convention which uses `{{ .Site.BaseURL }}`.

#### 1b. Refactor 404.html

Update `hugo/layouts/404.html` to use the shared partial:

```html
{{ define "main" }} {{ partial "errors/error-hero.html" (dict "code" "404" "title" "Page Not Found"
"message" "Sorry, the page you're looking for doesn't exist or has been moved." "alertClass"
"alert-warning" "iconPath" "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732
4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" "baseURL" $.Site.BaseURL ) }} {{
end }}
```

#### 1c. Create 500 Error Page

Create `hugo/content/500.md`:

```markdown
---
title: 'Server Error'
layout: '500'
url: '/500/'
robots: 'noindex, nofollow'
build:
  list: never
  render: always
sitemap:
  disable: true
---
```

Create `hugo/layouts/500.html` (root of layouts — no `_default/` directory exists in this project):

```html
{{ define "main" }} {{ partial "errors/error-hero.html" (dict "code" "500" "title" "Something Went
Wrong" "message" "We're having trouble processing your request. Please try again in a few moments."
"alertClass" "alert-error" "iconPath" "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0
0118 0z" "baseURL" $.Site.BaseURL ) }} {{ end }}
```

Hugo builds this to `hugo/public/500/index.html` — accessible via ASSETS at `/500/`.

### Phase 2: Worker Error Handling

#### 2a. Route Classification Utility

Create `src/presentation/utils/isApiRoute.ts`:

```typescript
/** Determine if a request path should receive JSON error responses. */
export function isApiRoute(path: string): boolean {
  return path.startsWith('/api/');
}
```

#### 2b. Error Page Handlers

Create `src/presentation/handlers/ErrorPageHandlers.ts`:

```typescript
/**
 * Fetch a pre-built error page from ASSETS and return it with the given status.
 * Falls back to minimal inline HTML if ASSETS fetch fails.
 *
 * @remarks Only status code 500 is currently supported. The path mapping
 * (`>= 500 → /500/`, `< 500 → /404.html`) is semantically correct only for
 * 404 and 5xx. Future callers requiring 403, 429, etc. should extend the
 * mapping to a lookup table.
 */
export async function serveErrorPage(assets: Fetcher, statusCode: number): Promise<Response> {
  // Map status codes to Hugo-generated error page paths
  const errorPagePath = statusCode >= 500 ? '/500/' : '/404.html';

  try {
    // Use a stable synthetic origin — ASSETS routes by path, not origin.
    // This avoids coupling to the failing request's URL and prevents
    // new URL(requestUrl) from throwing on malformed URLs.
    const errorPageResponse = await assets.fetch(
      new Request(`https://worker.internal${errorPagePath}`, {
        headers: { Accept: 'text/html' },
      })
    );

    if (errorPageResponse.ok) {
      const headers = new Headers({
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store, no-cache',
      });
      applySecurityHeaders(headers);
      return new Response(errorPageResponse.body, {
        status: statusCode,
        headers,
      });
    }
  } catch {
    // Fall through to inline fallback
  }

  // ASSETS 304 note: The Request above is constructed fresh with only
  // Accept: text/html — no If-Modified-Since or If-None-Match headers.
  // This prevents ASSETS from returning 304 Not Modified when the original
  // client request carried cache-validation headers.

  // FR-008: Fallback if error page itself fails
  const fallbackHeaders = new Headers({
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-store, no-cache',
  });
  applySecurityHeaders(fallbackHeaders);
  return new Response(fallbackErrorHtml(statusCode), {
    status: statusCode,
    headers: fallbackHeaders,
  });
}

/**
 * HTMX error fragment for partial request failures.
 * Extracted as a template function (consistent with authErrorPage/rateLimitPage pattern)
 * to enable unit testing and centralize error fragment markup.
 */
export function htmxErrorFragment(): string {
  return '<div class="alert alert-error"><span>Something went wrong.</span><a href="" class="link link-neutral underline" hx-boost="false">Reload page</a></div>';
}

/** Minimal inline HTML fallback when ASSETS is unavailable. */
function fallbackErrorHtml(statusCode: number): string {
  const title = statusCode >= 500 ? 'Server Error' : 'Not Found';
  const message =
    statusCode >= 500
      ? 'Something went wrong. Please try again later.'
      : 'The page you requested could not be found.';
  const safeCode = String(Math.floor(statusCode));
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head><body><h1>${safeCode} ${title}</h1><p>${message}</p><p><a href="/">Go Home</a></p></body></html>`;
}
```

#### 2c. Global Error Handler in worker.ts

Add `app.onError()` before route definitions:

```typescript
app.onError(async (err, c) => {
  // Logger accepts (message, cause?) — embed request context in the message string
  getServiceFactory(c.env).logger.error(`unhandled error on ${c.req.method} ${c.req.path}`, err);

  if (isApiRoute(c.req.path)) {
    return c.json({ error: 'Internal server error' }, 500);
  }

  // HTMX partial requests (not boosted navigations) expect HTML fragments,
  // not full documents. HX-Boosted navigations are full-page loads and should
  // receive the full 500 error page instead.
  const isHtmxPartial =
    c.req.header('HX-Request') === 'true' && c.req.header('HX-Boosted') !== 'true';

  if (isHtmxPartial) {
    // HX-Retarget + HX-Reswap ensure the fragment is visible even if the
    // original swap target no longer exists (e.g., form element removed).
    return c.html(htmxErrorFragment(), 500, {
      'HX-Retarget': '#main-content',
      'HX-Reswap': 'innerHTML',
    });
  }

  return serveErrorPage(c.env.ASSETS, 500);
});
```

### Phase 3: Testing Strategy

#### Worker Tests (Vitest + Workers pool)

- **Global error handler**: Verify non-API routes get HTML 500 response
- **Global error handler**: Verify API routes get JSON 500 response
- **Global error handler (HTMX partial)**: Verify requests with `HX-Request: true` (no `HX-Boosted`) get an HTML fragment with `HX-Retarget` and `HX-Reswap` headers
- **Global error handler (HTMX boosted)**: Verify requests with both `HX-Request: true` and `HX-Boosted: true` get the full 500 error page (not fragment)
- **serveErrorPage()**: Verify correct status code, content-type, and security headers
- **serveErrorPage() fallback**: When ASSETS.fetch() throws, verify inline HTML fallback with correct status, Content-Type, security headers, and sanitized status code
- **htmxErrorFragment()**: Verify fragment HTML content and structure
- **isApiRoute()**: Verify path classification

#### Hugo Build Verification

- Verify `hugo/public/500/index.html` exists after build
- Verify `hugo/public/404.html` still exists (no regression)
- Verify zero warnings, zero errors
- **Blocking CI gate**: Both error pages MUST exist in build output before deployment. If Hugo build is incomplete, the Worker falls back to bare inline HTML for all errors.

```bash
# Deployment gate — integrate into `just ci` / `npm run check` as a post-Hugo-build step
test -f hugo/public/404.html || { echo "FATAL: 404.html missing"; exit 1; }
test -f hugo/public/500/index.html || { echo "FATAL: 500/index.html missing"; exit 1; }
```

**Integration point**: Add these checks to the `justfile` `ci` recipe (or `scripts/` build verification) immediately after `just hugo-build`. Do not rely on implementers remembering to add them — the task that implements Hugo templates must also wire up the gate.

### Existing Error Handling — Preserved (No Changes)

| Component                  | Current Behavior             | Change |
| -------------------------- | ---------------------------- | ------ |
| `apiNotFound()`            | JSON 404 for `/api/*`        | None   |
| `appPartialNotFound()`     | JSON 404 for `/app/_/*`      | None   |
| `authErrorPage()`          | HTML auth error page         | None   |
| `rateLimitPage()`          | HTML 429 page                | None   |
| `staticAssetFallthrough()` | ASSETS.fetch() with Hugo 404 | None   |
| Rate limit middleware      | JSON 429 for API auth        | None   |
| `requireAuth` middleware   | 503 on D1 error              | None   |

## Security Considerations

### CSP Conflict: Worker vs Static Headers (CRITICAL)

The project has **two different CSPs** that apply depending on how a page is served:

- **Hugo static pages** (`hugo/static/_headers`): `style-src 'self' 'unsafe-inline'` and `script-src 'self' 'unsafe-inline' ...` — allows inline styles and scripts
- **Worker-served pages** (`src/presentation/utils/securityHeaders.ts`): `style-src 'self'` and `script-src 'self'` — **blocks all inline styles and scripts**

**Impact on error pages**: The 500 error page is served through `app.onError()` → `serveErrorPage()`, which goes through the Worker's `withSecurityHeaders` middleware. Therefore:

1. **`<noscript><style>` blocks are silently ignored** — the Worker's strict CSP blocks inline `<style>` tags. The proposed `.js-only` CSS class will never be applied, leaving the non-functional "Go Back" button visible when JS is disabled (violates SC-005).
2. **`onclick="history.back()"` inline handlers are blocked** — the Worker's `script-src 'self'` blocks inline event handlers. The "Go Back" button will not work at all on Worker-served error pages.

**Mitigation**: Error page templates must not rely on inline styles or inline event handlers. Instead:

- Use a CSS class defined in the Tailwind stylesheet (e.g., a `hidden` class on the button by default, removed by Alpine.js `x-data`/`x-bind:class`) to handle no-JS degradation. This is the pattern already used elsewhere in the project (see `securityHeaders.ts` comment lines 1-5).
- Replace `onclick="history.back()"` with an Alpine.js `@click` directive or an external script, consistent with the project's CSP-safe patterns.
- Alternatively, since the "Go Home" link works without JS and provides adequate navigation, simply **omit the "Go Back" button from Worker-served error pages** (simplest approach).

**Note**: The existing `hugo/layouts/404.html` also has `onclick="history.back()"` which works on static paths (permissive `_headers` CSP) but would be blocked if the 404 page were ever served through the Worker. Currently this is not an issue because static 404s bypass the Worker, but it is a latent inconsistency to be aware of.

### 404.html Go Back Button: A Documented Tradeoff

The shared `error-hero.html` partial omits the "Go Back" button to ensure compatibility with the Worker's strict CSP (which applies to 500 error pages). However, `404.html` is served directly by ASSETS under the permissive `_headers` CSP (`unsafe-inline`), so the `onclick="history.back()"` button **would actually work** on 404 pages.

**Decision**: Accept the UX regression on 404 to maintain a single shared partial. The "Go Home" link is adequate for recovery on both error pages. If "Go Back" is desired on 404, it must be added to the 404-specific layout rather than the shared partial, since the partial must be safe under the Worker's strict CSP.

Known tradeoff: **404 loses "Go Back"; 500 never had it.** The shared partial is simpler than maintaining two variants.

### Cache-Control on Error Responses

Both `serveErrorPage()` and `fallbackErrorHtml()` responses MUST set `Cache-Control: no-store, no-cache` to prevent CDN edges, shared proxies, or browsers from caching error responses. This is consistent with existing auth error handler behavior and prevents transient 500 errors from being served to subsequent visitors via cached responses.

### Direct Access to `/500/` Returns 200 Status

The Hugo-generated 500 page at `/500/` is served by ASSETS with a 200 OK status on direct navigation. While the page is not linked from anywhere and `build: list: never` + `sitemap: disable: true` prevent Hugo from listing it, search crawlers could still discover it via URL enumeration and index it as a real page.

**Mitigation**: Add `<meta name="robots" content="noindex, nofollow">` to the 500 page. This can be done via Hugo frontmatter in `hugo/content/500.md`:

```markdown
---
_build:
  list: never
  render: always
robots: 'noindex, nofollow'
---
```

Then reference `{{ with .Params.robots }}<meta name="robots" content="{{ . }}">{{ end }}` in baseof.html's `<head>`, or add it directly in the 500 layout template. The 404.html should also include this tag since Hugo's default 404 page is served with a 404 status (which crawlers respect), but defense-in-depth is prudent.

### No Information Leakage (FR-005)

Error pages use pre-built static HTML with generic messages. The `app.onError()` handler logs the error server-side via structured logging but never includes error details in the response. The inline fallback HTML is equally generic.

## Edge Cases & Error Handling

### HTMX Partial Route 500s

When `app.onError()` catches an exception on an `/app/_/*` route, HTMX partial routes expect HTML **fragments**, not full documents. Injecting a full `<html>...</html>` page into an HTMX swap target produces broken markup. The error handler checks for the `HX-Request` header and returns a styled error fragment instead of a full page.

**Boosted vs partial distinction**: The `HX-Request` header is present on ALL HTMX requests — both partial fetches and boosted full-page navigations. Boosted navigations (`HX-Boosted: true`) to routes like `/auth/sign-in` or `/dashboard` expect a full HTML document response, not a fragment. The error handler MUST check `HX-Boosted` to distinguish:

- `HX-Request: true` + `HX-Boosted: true` → Full 500 error page (boosted navigation)
- `HX-Request: true` + no `HX-Boosted` → Error fragment (partial request)

**Retargeting headers**: When returning an HTMX error fragment, the original request's swap target may no longer exist (e.g., a form element was removed, or the target ID is absent). Without retargeting, HTMX silently discards the error — the user sees nothing. The response MUST include `HX-Retarget` and `HX-Reswap` headers to guarantee the fragment is visible:

```html
<!-- Response headers: HX-Retarget: #main-content, HX-Reswap: innerHTML -->
<div class="alert alert-error">
  <span>Something went wrong.</span>
  <a href="" class="link link-neutral underline" hx-boost="false">Reload page</a>
</div>
```

The empty `href=""` reloads the current page. `hx-boost="false"` prevents HTMX from intercepting the navigation (since the error likely came from a boosted request in the first place).

**Reload loop on persistent errors**: If the error was caused by a persistent condition (D1 down, auth infrastructure failure), clicking "Reload page" resubmits the same failing request, immediately returning the same error fragment. This is acceptable because: (1) the HTMX path requires JS, so `href=""` works as expected, (2) the user sees the same error message — not a blank page, and (3) transient errors (the common case) recover on reload. For persistent outages, the error message itself suggests the site is having trouble. No code change needed — document as known behavior.

### Worker-Routed vs Static Paths

`app.onError()` only fires for Worker-handled routes (`/api/*`, `/app/*`, `/auth/*`, `/dashboard/*`). Static content paths never reach the Worker. If ASSETS itself encounters an error on a static path, Cloudflare returns its own error response — the Worker cannot intercept it.

### `serveErrorPage` Status Code Mapping

The current mapping `statusCode >= 500 ? '/500/' : '/404.html'` is binary: all 5xx errors get the 500 page, and everything else gets the 404 page. This is semantically incorrect for non-404 client errors (e.g., a 403 Forbidden would display "Page Not Found" content).

**Current scope**: The spec only requires 404 and 500 pages, and `serveErrorPage` is only called from `app.onError()` with status 500. The function signature accepts any status code for extensibility, but callers should be aware of the mapping limitation.

**Mitigation**: Add a code comment documenting that the function currently only maps 404 and 5xx correctly. If future error pages are needed (403, 429, etc.), the mapping should be extended to a lookup table rather than a binary condition.

### Auth-Aware Navigation on Error Pages

The Hugo baseof.html includes the shared header partial, which uses `$store.auth.isAuthenticated` (Alpine.js) to conditionally show signed-in/signed-out navigation. When a 500 error is caused by auth infrastructure failure (D1 down, auth handler crash), `auth-store.js` may fail to determine auth state. The `x-cloak` directive hides the auth menu section until Alpine initializes — if Alpine or auth-store fails, auth navigation is invisible. Users still have the main nav links (Home, Posts, About) and the error page's "Go Home" link.

**Mitigation**: This is acceptable for error pages. Auth navigation is best-effort; the primary recovery action is the "Go Home" link in the error hero. No code change needed — document as known behavior.

**Inverse scenario — Alpine succeeds but auth infrastructure is down**: When a 500 is caused by auth/D1 infrastructure failure, `auth-store.js` may still succeed (it reads the indicator cookie client-side, not the server). An authenticated user sees the "Dashboard" link in the header, clicks it, and gets another 500. This is acceptable — the error page cannot know _why_ the 500 occurred. Error pages show best-effort navigation; links may lead to further errors during infrastructure outages. The "Go Home" action is the recommended recovery path.

### Subrequest Budget on Error Path

When `app.onError()` calls `serveErrorPage()`, it makes an `ASSETS.fetch()` subrequest. Cloudflare Workers limit each invocation to 50 subrequests ([docs](https://developers.cloudflare.com/workers/platform/limits/)). If the handler that threw had already consumed many subrequests (multiple D1 queries, KV lookups, external fetches), the error page fetch could exceed the limit, throwing `TooManyRequestsException`. The try-catch in `serveErrorPage` catches this and falls back to inline HTML.

**Mitigation**: The inline fallback is the correct behavior for this edge case. Add a code comment in `serveErrorPage` noting the subrequest budget concern so future developers understand why the fallback exists beyond just "ASSETS unavailable."

### Fallback When Error Page Missing

If ASSETS.fetch() for `/500/` or `/404.html` fails (e.g., incomplete Hugo build), the system falls back to minimal inline HTML (FR-008). Hugo build verification is a blocking CI gate to prevent this scenario.

### Structured Error Logging

Use the ServiceFactory logger (consistent with existing auth handler pattern) instead of raw `console.error`.

**Logger Interface Constraint**: The `Logger` interface (`src/application/ports/Logger.ts`) accepts only two arguments: `error(message: string, cause?: unknown): void`. The plan's proposed call `logger.error('unhandled error', err, { path, method })` passes **three arguments** — the request context object will be silently dropped at runtime and may cause a TypeScript strict-mode compilation error.

**Mitigation**: Embed request context in the message string or the cause object:

```typescript
// Option A: Context in message string
logger.error(`unhandled error on ${c.req.method} ${c.req.path}`, err);

// Option B: Wrap error with context (preserves structured cause)
logger.error('unhandled error', { cause: err, path: c.req.path, method: c.req.method });
```

Option A is simpler and sufficient for debugging. Option B is better if the logger implementation supports structured cause objects.

## Accessibility Requirements

### No-JS Degradation (SC-005)

The "Go Back" button uses `onclick="history.back()"` which requires JavaScript. On Worker-served error pages, the Worker's strict CSP (`script-src 'self'`) blocks inline `onclick` handlers entirely — the button will not function regardless of JS availability (see Security Considerations > CSP Conflict).

**Required approach**: Do NOT use `<noscript><style>` (blocked by Worker CSP `style-src 'self'`) or `onclick` handlers. Instead:

- **Simplest (recommended)**: Omit the "Go Back" button from the shared error partial entirely. The "Go Home" link provides adequate navigation and works without JavaScript on all CSP configurations. This is the safest approach given the dual-CSP environment.
- **If "Go Back" is desired**: Use Alpine.js `x-data` with `x-show` replaced by `x-bind:class` toggling Tailwind's `hidden` class (matching the project's established CSP-safe pattern per `securityHeaders.ts` lines 1-5). The button starts hidden via `class="hidden"` and Alpine removes `hidden` on init.

### Screen Reader Semantics

The error hero partial's `<h1>` must not contain only a bare status code number ("404", "500"). Screen readers announce the heading first — "heading level 1: four zero four" conveys no meaning. The heading must include descriptive text via `aria-label` (e.g., `aria-label="404 — Page Not Found"`) so screen readers announce a meaningful heading while the visual display retains the large status code number.

The alert component must include `role="alert"` so screen readers announce the error message automatically when the page loads. The decorative SVG icon must include `aria-hidden="true"` to prevent screen readers from attempting to describe it.

### Page Title for Error Pages

The `<title>` element is announced by screen readers when focus shifts to the page. Verify Hugo generates sensible titles for both error pages:

- **500 page**: frontmatter `title: "Server Error"` → baseof.html generates `Server Error | SiteName` — correct.
- **404 page**: Hugo's `404.html` is a special-cased layout with no corresponding content file. Hugo's default `.Title` for 404 pages varies by theme/config and may be empty or a URL path. Verify with `just hugo-build` that the actual `<title>` in `404.html` is human-readable. If the title is empty or a URL, add a content file at `hugo/content/404.md` with `title: "Page Not Found"` to provide an explicit title.

### Fallback HTML Completeness

The inline fallback HTML includes `lang="en"` for screen readers and `<meta name="viewport">` for mobile rendering, matching the standards of the main Hugo templates. The fallback will be unstyled (no CSS) since inline `<style>` tags are blocked by the Worker's CSP — this is acceptable for a last-resort fallback.

## Red Team Review

### Round 1

**Reviewed**: 2026-03-25 | **Findings**: 0 Critical, 1 High, 5 Medium, 2 Low

Key enhancements made to this plan:

- Added Cache-Control headers to prevent error response caching
- Clarified `app.onError()` scope (Worker-routed paths only)
- Fixed "Go Back" button no-JS violation (SC-005)
- Added HTMX fragment handling for partial route errors
- Switched to structured logging with request context
- Added Hugo build verification as blocking CI gate
- Improved fallback HTML with lang and viewport attributes

### Round 2

**Reviewed**: 2026-03-25 | **Findings**: 1 Critical, 2 High, 2 Medium, 0 Low

Round 2 performed deeper adversarial analysis grounded in actual codebase inspection (reading `securityHeaders.ts`, `Logger.ts`, `_headers`, `hugo.yaml`, and layout directories).

| #   | Severity | Category      | Finding                                                                                                                                                                                                                                                                               | Resolution                                                                                                                                                                         |
| --- | -------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Critical | Security      | **Dual CSP conflict**: Worker CSP (`style-src 'self'`, `script-src 'self'`) blocks the `<noscript><style>` and `onclick` patterns proposed in Round 1. Hugo static `_headers` allows `unsafe-inline` but Worker-served 500 pages get the strict CSP. Round 1's fix was itself broken. | Removed "Go Back" button entirely from shared error partial. Documented CSP constraint for future implementers. Only "Go Home" link remains — works on all CSP configs without JS. |
| 2   | High     | ErrorHandling | **Logger interface mismatch**: `Logger.error(message, cause?)` accepts 2 args but `app.onError()` code passed 3 args (`err, { path, method }`). Request context silently dropped.                                                                                                     | Changed to `logger.error(\`unhandled error on ${method} ${path}\`, err)` — context in message string.                                                                              |
| 3   | High     | ErrorHandling | **HTMX error fragment has no recovery action**: Original fragment was a dead-end message with no way to recover. Users stuck in broken UI state.                                                                                                                                      | Added `<a href="" hx-boost="false">Reload page</a>` to fragment.                                                                                                                   |
| 4   | Medium   | Accessibility | **Fallback HTML unstyled and un-styleable**: Inline fallback cannot use `<style>` (blocked by Worker CSP). Fallback will be plain unstyled HTML.                                                                                                                                      | Documented as acceptable for last-resort fallback. Added note to Accessibility section.                                                                                            |
| 5   | Medium   | EdgeCase      | **500.html layout path wrong**: Plan referenced `hugo/layouts/_default/500.html` but no `_default/` directory exists. Project uses root-level layouts (e.g., `layouts/single.html`).                                                                                                  | Corrected to `hugo/layouts/500.html`.                                                                                                                                              |

### Round 3

**Reviewed**: 2026-03-25 | **Findings**: 0 Critical, 2 High, 2 Medium, 1 Low

Round 3 focused on HTMX interaction semantics and runtime behavior by inspecting the actual Worker route handlers (`worker.ts` lines 137–212), HTMX header conventions, and the `serveErrorPage` function contract.

| #   | Severity | Category | Finding                                                                                                                                                                                                                                                                                                                                     | Resolution                                                                                                                                                                                         |
| --- | -------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | High     | EdgeCase | **HTMX boosted requests get fragment instead of full page**: `HX-Request` header check doesn't distinguish partial requests from boosted full-page navigations. Boosted requests to `/auth/*` or `/dashboard/*` include `HX-Request: true` but expect full document responses. Serving a bare `<div>` fragment strips header/footer/layout. | Added `HX-Boosted` header check: `HX-Request: true` + `HX-Boosted: true` → full 500 page; `HX-Request: true` without `HX-Boosted` → fragment. Updated `app.onError()` code and Edge Cases section. |
| 2   | High     | EdgeCase | **HTMX error fragment invisible without retargeting headers**: When `app.onError()` returns an HTMX fragment, HTMX swaps into the original request's target element. If that target doesn't exist (e.g., form removed, target ID absent), the error is silently discarded — user sees nothing.                                              | Added `HX-Retarget: #main-content` and `HX-Reswap: innerHTML` headers to the HTMX fragment response. Documented in Edge Cases section.                                                             |
| 3   | Medium   | Security | **`/500/` directly accessible with 200 status**: Hugo-generated 500 page served by ASSETS with 200 OK on direct navigation. Crawlers could index error page content as a real page despite `build: list: never` and `sitemap: disable: true`.                                                                                               | Added `<meta name="robots" content="noindex, nofollow">` requirement to Security Considerations.                                                                                                   |
| 4   | Medium   | EdgeCase | **`serveErrorPage` binary status mapping semantically wrong for non-404/500**: `statusCode >= 500 ? '/500/' : '/404.html'` maps all 4xx to "Page Not Found" content. A 403 Forbidden would misleadingly show "not found" message.                                                                                                           | Documented as known limitation in Edge Cases. Current scope only calls with 500; added code comment requirement for future extensibility.                                                          |
| 5   | Low      | Testing  | **HTMX error fragment path lacks explicit test coverage**: Testing strategy mentioned API vs non-API but not the `HX-Request`/`HX-Boosted` branches.                                                                                                                                                                                        | Added two explicit test cases: HTMX partial (fragment + headers) and HTMX boosted (full page).                                                                                                     |

### Round 4

**Reviewed**: 2026-03-25 | **Findings**: 0 Critical, 1 High, 3 Medium, 1 Low

Round 4 focused on defense-in-depth for security headers on error responses, screen reader accessibility of error page markup, and Cloudflare runtime constraints (subrequest limits). Verified by inspecting `withSecurityHeaders` middleware pattern, `applySecurityHeaders` utility, `baseof.html` Alpine.js integration, and `AuthPageHandlers.buildRateLimitedResponse` as the reference pattern for raw Response construction.

| #   | Severity | Category      | Finding                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Resolution                                                                                                                                                                                                                                                                     |
| --- | -------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | High     | Security      | **`serveErrorPage` raw Response bypasses middleware security headers**: `serveErrorPage()` returns `new Response(...)` directly, not via Hono context methods. The `withSecurityHeaders` middleware uses post-processing (`await next(); c.header(...)`) — whether this applies to `app.onError()` responses depends on Hono's internal error propagation in compose. Raw Responses bypass `c.header()` regardless. Error pages could lack CSP, X-Frame-Options, HSTS, and all other security headers. | Added explicit `applySecurityHeaders(headers)` calls in both the ASSETS-fetched and inline-fallback code paths of `serveErrorPage()`, matching the `AuthPageHandlers.buildRateLimitedResponse()` pattern. Updated Architecture section to document the middleware uncertainty. |
| 2   | Medium   | Accessibility | **Error page `<h1>` contains only status code number**: Screen readers announce "heading level 1: four zero four" — meaningless without visual context. The descriptive "Page Not Found" text is in a separate alert element announced after the heading.                                                                                                                                                                                                                                              | Added `aria-label="{{ .code }} — {{ .title }}"` to the `<h1>` element in the error-hero partial. Visual display unchanged; screen readers get the full context.                                                                                                                |
| 3   | Medium   | Accessibility | **Alert component missing `role="alert"` and icon missing `aria-hidden`**: The error alert `<div>` lacks `role="alert"`, so screen readers don't auto-announce the error message on page load. The decorative SVG icon lacks `aria-hidden="true"`, causing screen readers to attempt to describe the path data.                                                                                                                                                                                        | Added `role="alert"` to the alert div and `aria-hidden="true"` to the SVG icon in the error-hero partial. Documented in Accessibility Requirements section.                                                                                                                    |
| 4   | Medium   | EdgeCase      | **ASSETS.fetch subrequest counts against 50-subrequest limit**: If the handler that threw had already consumed many subrequests (D1 queries, KV lookups, external fetches), the error page ASSETS.fetch could exceed Cloudflare's 50-subrequest limit, throwing `TooManyRequestsException`.                                                                                                                                                                                                            | Documented in Edge Cases section. The existing try-catch falls back to inline HTML correctly. Added code comment requirement to explain subrequest budget concern.                                                                                                             |
| 5   | Low      | EdgeCase      | **Auth-aware navigation may show incorrect state on error pages**: The header partial uses `$store.auth.isAuthenticated` (Alpine.js). When a 500 is caused by auth infrastructure failure, auth-store.js may fail, leaving the auth nav section hidden via `x-cloak`. Users lose auth navigation but retain main nav links and the "Go Home" error action.                                                                                                                                             | Documented as acceptable known behavior in Edge Cases. Primary recovery action is the "Go Home" link, which is always visible.                                                                                                                                                 |

### Round 5

**Reviewed**: 2026-03-25 | **Findings**: 0 Critical, 2 High, 4 Medium, 2 Low

Round 5 focused on Hugo template idiom correctness, ASSETS runtime behavior (304 responses, URL construction), HTMX reload semantics, and screen reader `<title>` element handling. Verified by cross-referencing existing `404.html` conventions, Cloudflare ASSETS binding behavior, and Hugo's special-cased 404 layout processing.

| #   | Severity | Category      | Finding                                                                                                                                                                                                                                                                                                        | Resolution                                                                                                                                                                          |
| --- | -------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | High     | Security      | **404.html "Go Back" button silently dropped without documenting tradeoff**: Shared partial omits `onclick="history.back()"` for Worker CSP safety, but 404.html is served by ASSETS under permissive `_headers` CSP where the button works. The plan silently degrades 404 UX to simplify the shared partial. | Documented as explicit tradeoff in Security Considerations: "404 loses Go Back; 500 never had it." If desired on 404, must be added to 404-specific layout, not the shared partial. |
| 2   | High     | EdgeCase      | **Hardcoded `href="/"` breaks Hugo dev mode**: Existing `404.html` uses `{{ .Site.BaseURL }}` for the Go Home link — correct Hugo idiom for dev (localhost:1313) and production. Shared partial hardcoded `/`, silently regressing.                                                                            | Added `baseURL` parameter to error-hero partial dict context. Callers pass `$.Site.BaseURL`; partial defaults to `"/"`.                                                             |
| 3   | Medium   | Security      | **Error response table conflates route catch-alls with `onError`**: 404 column describes explicit catch-all handlers, not `app.onError()`. Missing distinction between "missing routes" and "thrown exceptions" could mislead future developers.                                                               | Added clarification note below the table: `onError` → always 500; route catch-alls → explicit status codes.                                                                         |
| 4   | Medium   | Performance   | **ASSETS may return 304 if cache headers forwarded**: Original request's `If-Modified-Since`/`If-None-Match` headers could cause ASSETS to return 304 (not `ok`), falling through to inline fallback unnecessarily.                                                                                            | Changed `serveErrorPage` to construct a clean GET request with only `Accept: text/html` — no cache-validation headers forwarded.                                                    |
| 5   | Medium   | Misuse        | **HTMX reload loop on persistent errors**: `href=""` resubmits the same failing request during infrastructure outages.                                                                                                                                                                                         | Documented as acceptable known behavior — HTMX path requires JS, user sees same error message (not blank page), transient errors recover on reload.                                 |
| 6   | Medium   | Accessibility | **404 page `<title>` may be empty or non-descriptive**: Hugo's `404.html` has no content file, so `.Title` depends on theme/config defaults. Screen readers announce the title on page load.                                                                                                                   | Added verification step: check `<title>` in built 404.html. If empty, add `hugo/content/404.md` with `title: "Page Not Found"`.                                                     |
| 7   | Low      | ErrorHandling | **`serveErrorPage` ASSETS URL coupled to attacker-controlled request origin**: `new URL(requestUrl).origin` ties ASSETS fetch to the failing request. Malformed URLs cause `new URL()` to throw before `assets.fetch`.                                                                                         | Replaced with stable synthetic origin `https://worker.internal`. ASSETS routes by path, not origin. Also removed unused `requestUrl` parameter from function signature.             |
| 8   | Low      | EdgeCase      | **Authenticated users on 500 page see Dashboard link to broken infrastructure**: When auth infra is down but Alpine succeeds (reads indicator cookie), Dashboard link leads to another 500.                                                                                                                    | Documented as acceptable known behavior in Auth-Aware Navigation section. Error pages show best-effort navigation; "Go Home" is the recommended recovery path.                      |

### Round 6

**Reviewed**: 2026-03-25 | **Findings**: 0 Critical, 1 High, 3 Medium, 2 Low

Round 6 focused on internal plan consistency (cross-referencing code examples against stated requirements), testing completeness for error fallback paths, and architectural alignment with established project patterns for HTML template functions.

| #   | Severity | Category      | Finding                                                                                                                                                                                                                                                                                                                                                                                                                               | Resolution                                                                                                                                                                                                                                                             |
| --- | -------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | High     | ErrorHandling | **HTMX error fragment is inline HTML, not a template function**: `app.onError()` hardcodes `<div class="alert alert-error">...` directly in the handler. This violates the project pattern where all HTML responses use template functions (`authErrorPage()`, `rateLimitPage()`, `authLayout()`). Inline HTML is harder to test, duplicates styling concerns, and drifts from the DaisyUI component library if alert markup changes. | Extract to `htmxErrorFragment()` function in `ErrorPageHandlers.ts`. Template function returns the HTML string; handler calls it. Enables unit testing of fragment content and keeps `app.onError()` focused on routing logic. Updated Phase 2 implementation details. |
| 2   | Medium   | Testing       | **Fallback HTML path lacks explicit test case**: Testing strategy lists `serveErrorPage()` tests but doesn't specify a test for when `assets.fetch()` throws. The fallback is the last line of defense (FR-008) — if it breaks, users see a raw error.                                                                                                                                                                                | Added explicit test case: "serveErrorPage fallback: when ASSETS.fetch() throws, returns inline HTML with correct status, Content-Type, and security headers." Updated Phase 3 testing strategy.                                                                        |
| 3   | Medium   | Testing       | **Hugo build verification gate has no integration point**: Plan documents `test -f hugo/public/500/index.html` check (Phase 3) but doesn't specify where it runs — not in `package.json`, not in CI config, not in `justfile`. Risk: the check is documented but never wired up.                                                                                                                                                      | Added explicit integration point: add to `just ci` / `npm run check` pipeline as a post-build verification step.                                                                                                                                                       |
| 4   | Medium   | Security      | **500.md frontmatter example missing `robots` directive**: Security Considerations section (line 427) requires `<meta name="robots" content="noindex, nofollow">` via frontmatter, but the 500.md content example in Phase 1c (line 199) omits `robots: "noindex, nofollow"`. Implementers following the Phase 1c example will miss the security requirement.                                                                         | Updated 500.md frontmatter example in Phase 1c to include `robots: "noindex, nofollow"`.                                                                                                                                                                               |
| 5   | Low      | ErrorHandling | **`serveErrorPage` accepts `statusCode: number` but only `500` is valid**: Function signature suggests generality but the path mapping (`>= 500 ? '/500/' : '/404.html'`) is semantically wrong for 403, 429, etc. Single caller always passes 500. Misleading API surface.                                                                                                                                                           | Added JSDoc `@remarks` noting that only 500 is currently supported. Code comment at the mapping line documents the limitation. Future callers requiring other codes should extend the mapping.                                                                         |
| 6   | Low      | ErrorHandling | **`fallbackErrorHtml` injects `statusCode` into template literal without type narrowing**: While `statusCode` is typed as `number` (safe from XSS), TypeScript's `number` type doesn't prevent `NaN` or `Infinity` which would produce nonsensical HTML like `<h1>NaN Server Error</h1>`.                                                                                                                                             | Added defensive `String(Math.floor(statusCode))` in the template literal. Minimal cost, prevents edge case nonsense.                                                                                                                                                   |
