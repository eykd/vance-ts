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

| Principle | Status | Notes |
| --- | --- | --- |
| I. Test-First Development | PASS | Worker error handler tested via Vitest; Hugo pages validated by build verification |
| II. Type Safety | PASS | All new TypeScript follows strict mode; error handler uses typed Hono Context |
| III. Code Quality | PASS | JSDoc on public functions; consistent naming |
| IV. Pre-commit Quality Gates | PASS | All hooks apply to changed files |
| V. Warning/Deprecation Policy | PASS | No new warnings introduced |
| VI. Cloudflare Workers Target | PASS | Uses ASSETS.fetch() — no Node.js APIs |
| VII. Simplicity | PASS | Pre-built static pages served via existing ASSETS binding — minimal new code |

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

**Security headers**: The `withSecurityHeaders` middleware (`app.use('*', ...)`) runs on ALL routes including `app.onError()` responses, so error pages automatically receive security headers (CSP, X-Frame-Options, etc.).

#### Scope of `app.onError()` — Worker-Routed Paths Only

**Important**: `wrangler.toml` `run_worker_first` only routes `/api/*`, `/app/*`, `/auth/*`, `/dashboard`, and `/dashboard/*` to the Worker. All other requests go directly to the ASSETS binding (Cloudflare static asset serving) and never reach the Worker. Therefore:

- `app.onError()` can only catch exceptions on **Worker-handled routes**
- Static content paths (`/`, `/about`, `/blog/*`, etc.) never reach the Worker, so they cannot trigger `app.onError()`
- If ASSETS itself encounters an error on a static path, Cloudflare returns its own error response — the Worker has no opportunity to intercept it

This is correct behavior: static asset serving has no application code that can throw. The 500 error page is specifically for failures in Worker handler/middleware code (auth, rate limiting, D1 queries, etc.).

### Error Response Strategy by Route Type

| Route Pattern | 404 Behavior | 500 Behavior |
| --- | --- | --- |
| `/api/*` | JSON `{"error": "Not found"}` (existing) | JSON `{"error": "Internal server error"}` (new) |
| `/app/_/*` | JSON (existing) | HTML 500 page (new via onError) |
| `/auth/*` | authLayout (existing) | HTML 500 page (new via onError) |
| Everything else | Hugo 404.html via ASSETS (existing) | HTML 500 page (new via onError) |

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
          .alertClass (string), .iconPath (string - SVG path d attribute)

  CSP NOTE: Worker-served error pages use strict CSP (style-src 'self',
  script-src 'self') which blocks inline styles and onclick handlers.
  This partial must NOT use <noscript><style>, onclick=, or any inline
  script/style attributes. The "Go Home" link is the sole navigation
  action — it works without JavaScript on all CSP configurations.
*/}}
<div class="hero min-h-[60vh]">
  <div class="hero-content text-center">
    <div class="max-w-md">
      <div class="alert {{ .alertClass }} mb-8">
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="{{ .iconPath }}" />
        </svg>
        <span>{{ .title }}</span>
      </div>
      <h1 class="text-7xl font-bold text-primary mb-4">{{ .code }}</h1>
      <p class="text-xl text-base-content/70 mb-8">{{ .message }}</p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <a href="/" class="btn btn-primary">
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

#### 1b. Refactor 404.html

Update `hugo/layouts/404.html` to use the shared partial:

```html
{{ define "main" }}
  {{ partial "errors/error-hero.html" (dict
    "code" "404"
    "title" "Page Not Found"
    "message" "Sorry, the page you're looking for doesn't exist or has been moved."
    "alertClass" "alert-warning"
    "iconPath" "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
  ) }}
{{ end }}
```

#### 1c. Create 500 Error Page

Create `hugo/content/500.md`:

```markdown
---
title: "Server Error"
layout: "500"
url: "/500/"
build:
  list: never
  render: always
sitemap:
  disable: true
---
```

Create `hugo/layouts/500.html` (root of layouts — no `_default/` directory exists in this project):

```html
{{ define "main" }}
  {{ partial "errors/error-hero.html" (dict
    "code" "500"
    "title" "Something Went Wrong"
    "message" "We're having trouble processing your request. Please try again in a few moments."
    "alertClass" "alert-error"
    "iconPath" "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
  ) }}
{{ end }}
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
 */
export async function serveErrorPage(
  assets: Fetcher,
  requestUrl: string,
  statusCode: number,
): Promise<Response> {
  // Map status codes to Hugo-generated error page paths
  const errorPagePath = statusCode >= 500 ? '/500/' : '/404.html';

  try {
    const origin = new URL(requestUrl).origin;
    const errorPageResponse = await assets.fetch(
      new Request(`${origin}${errorPagePath}`),
    );

    if (errorPageResponse.ok) {
      return new Response(errorPageResponse.body, {
        status: statusCode,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-store, no-cache',
        },
      });
    }
  } catch {
    // Fall through to inline fallback
  }

  // FR-008: Fallback if error page itself fails
  return new Response(fallbackErrorHtml(statusCode), {
    status: statusCode,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store, no-cache' },
  });
}

/** Minimal inline HTML fallback when ASSETS is unavailable. */
function fallbackErrorHtml(statusCode: number): string {
  const title = statusCode >= 500 ? 'Server Error' : 'Not Found';
  const message =
    statusCode >= 500
      ? 'Something went wrong. Please try again later.'
      : 'The page you requested could not be found.';
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head><body><h1>${statusCode} ${title}</h1><p>${message}</p><p><a href="/">Go Home</a></p></body></html>`;
}
```

#### 2c. Global Error Handler in worker.ts

Add `app.onError()` before route definitions:

```typescript
app.onError(async (err, c) => {
  // Logger accepts (message, cause?) — embed request context in the message string
  getServiceFactory(c.env).logger.error(
    `unhandled error on ${c.req.method} ${c.req.path}`,
    err,
  );

  if (isApiRoute(c.req.path)) {
    return c.json({ error: 'Internal server error' }, 500);
  }

  // HTMX partials expect fragments, not full HTML documents.
  // Include a recovery link so the user can reload without manual refresh.
  if (c.req.header('HX-Request') === 'true') {
    return c.html(
      '<div class="alert alert-error"><span>Something went wrong.</span><a href="" class="link link-neutral underline" hx-boost="false">Reload page</a></div>',
      500,
    );
  }

  return serveErrorPage(c.env.ASSETS, c.req.url, 500);
});
```

### Phase 3: Testing Strategy

#### Worker Tests (Vitest + Workers pool)

- **Global error handler**: Verify non-API routes get HTML 500 response
- **Global error handler**: Verify API routes get JSON 500 response
- **serveErrorPage()**: Verify correct status code, content-type, and fallback behavior
- **isApiRoute()**: Verify path classification

#### Hugo Build Verification

- Verify `hugo/public/500/index.html` exists after build
- Verify `hugo/public/404.html` still exists (no regression)
- Verify zero warnings, zero errors
- **Blocking CI gate**: Both error pages MUST exist in build output before deployment. If Hugo build is incomplete, the Worker falls back to bare inline HTML for all errors.

```bash
# Deployment gate — add to CI or build verification script
test -f hugo/public/404.html || { echo "FATAL: 404.html missing"; exit 1; }
test -f hugo/public/500/index.html || { echo "FATAL: 500/index.html missing"; exit 1; }
```

### Existing Error Handling — Preserved (No Changes)

| Component | Current Behavior | Change |
| --- | --- | --- |
| `apiNotFound()` | JSON 404 for `/api/*` | None |
| `appPartialNotFound()` | JSON 404 for `/app/_/*` | None |
| `authErrorPage()` | HTML auth error page | None |
| `rateLimitPage()` | HTML 429 page | None |
| `staticAssetFallthrough()` | ASSETS.fetch() with Hugo 404 | None |
| Rate limit middleware | JSON 429 for API auth | None |
| `requireAuth` middleware | 503 on D1 error | None |

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

### Cache-Control on Error Responses

Both `serveErrorPage()` and `fallbackErrorHtml()` responses MUST set `Cache-Control: no-store, no-cache` to prevent CDN edges, shared proxies, or browsers from caching error responses. This is consistent with existing auth error handler behavior and prevents transient 500 errors from being served to subsequent visitors via cached responses.

### No Information Leakage (FR-005)

Error pages use pre-built static HTML with generic messages. The `app.onError()` handler logs the error server-side via structured logging but never includes error details in the response. The inline fallback HTML is equally generic.

## Edge Cases & Error Handling

### HTMX Partial Route 500s

When `app.onError()` catches an exception on an `/app/_/*` route, HTMX partial routes expect HTML **fragments**, not full documents. Injecting a full `<html>...</html>` page into an HTMX swap target produces broken markup. The error handler checks for the `HX-Request` header and returns a styled error fragment instead of a full page.

**Recovery path**: The HTMX error fragment should include an actionable recovery mechanism, not just a message. Add a reload link so the user can recover without manually refreshing:

```html
<div class="alert alert-error">
  <span>Something went wrong.</span>
  <a href="" class="link link-neutral underline" hx-boost="false">Reload page</a>
</div>
```

The empty `href=""` reloads the current page. `hx-boost="false"` prevents HTMX from intercepting the navigation (since the error likely came from a boosted request in the first place).

### Worker-Routed vs Static Paths

`app.onError()` only fires for Worker-handled routes (`/api/*`, `/app/*`, `/auth/*`, `/dashboard/*`). Static content paths never reach the Worker. If ASSETS itself encounters an error on a static path, Cloudflare returns its own error response — the Worker cannot intercept it.

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

| # | Severity | Category | Finding | Resolution |
|---|----------|----------|---------|------------|
| 1 | Critical | Security | **Dual CSP conflict**: Worker CSP (`style-src 'self'`, `script-src 'self'`) blocks the `<noscript><style>` and `onclick` patterns proposed in Round 1. Hugo static `_headers` allows `unsafe-inline` but Worker-served 500 pages get the strict CSP. Round 1's fix was itself broken. | Removed "Go Back" button entirely from shared error partial. Documented CSP constraint for future implementers. Only "Go Home" link remains — works on all CSP configs without JS. |
| 2 | High | ErrorHandling | **Logger interface mismatch**: `Logger.error(message, cause?)` accepts 2 args but `app.onError()` code passed 3 args (`err, { path, method }`). Request context silently dropped. | Changed to `logger.error(\`unhandled error on ${method} ${path}\`, err)` — context in message string. |
| 3 | High | ErrorHandling | **HTMX error fragment has no recovery action**: Original fragment was a dead-end message with no way to recover. Users stuck in broken UI state. | Added `<a href="" hx-boost="false">Reload page</a>` to fragment. |
| 4 | Medium | Accessibility | **Fallback HTML unstyled and un-styleable**: Inline fallback cannot use `<style>` (blocked by Worker CSP). Fallback will be plain unstyled HTML. | Documented as acceptable for last-resort fallback. Added note to Accessibility section. |
| 5 | Medium | EdgeCase | **500.html layout path wrong**: Plan referenced `hugo/layouts/_default/500.html` but no `_default/` directory exists. Project uses root-level layouts (e.g., `layouts/single.html`). | Corrected to `hugo/layouts/500.html`. |
