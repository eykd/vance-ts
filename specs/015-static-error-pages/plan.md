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
│   ├── _default/
│   │   └── single.html                   # (existing, unchanged)
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
        <button onclick="history.back()" class="btn btn-outline">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Go Back
        </button>
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

Create `hugo/layouts/_default/500.html`:

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
        },
      });
    }
  } catch {
    // Fall through to inline fallback
  }

  // FR-008: Fallback if error page itself fails
  return new Response(fallbackErrorHtml(statusCode), {
    status: statusCode,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

/** Minimal inline HTML fallback when ASSETS is unavailable. */
function fallbackErrorHtml(statusCode: number): string {
  const title = statusCode >= 500 ? 'Server Error' : 'Not Found';
  const message =
    statusCode >= 500
      ? 'Something went wrong. Please try again later.'
      : 'The page you requested could not be found.';
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title></head><body><h1>${statusCode} ${title}</h1><p>${message}</p><p><a href="/">Go Home</a></p></body></html>`;
}
```

#### 2c. Global Error Handler in worker.ts

Add `app.onError()` before route definitions:

```typescript
app.onError(async (err, c) => {
  // Log the error for observability
  console.error('Unhandled error:', err);

  if (isApiRoute(c.req.path)) {
    return c.json({ error: 'Internal server error' }, 500);
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
