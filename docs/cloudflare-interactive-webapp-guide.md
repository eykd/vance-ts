# Comprehensive Guide: Interactive Web Applications on Cloudflare

**Building Modern Web Applications with Static HTML, TailwindCSS 4, DaisyUI 5, HTMX, Alpine.js, and TypeScript Workers**

_Using Domain-Driven Design, Clean Architecture, and GOOS/TDD Testing Principles_

---

## Table of Contents

1. [Introduction](#introduction)
2. [Architecture Overview](#architecture-overview)
3. [Project Structure](#project-structure)
4. [Setting Up the Development Environment](#setting-up-the-development-environment)
5. [Frontend Stack: HTML, TailwindCSS 4, DaisyUI 5](#frontend-stack)
6. [Client-Side Interactivity: HTMX and Alpine.js](#client-side-interactivity)
7. [Backend: TypeScript Workers](#backend-typescript-workers)
8. [Data Layer: D1 and KV](#data-layer)
9. [Domain-Driven Design and Clean Architecture](#domain-driven-design)
10. [Testing with GOOS/TDD Principles](#testing-with-goos-tdd)
11. [Deployment and Operations](#deployment-and-operations)
12. [Complete Example Application](#complete-example-application)
13. [Best Practices and Patterns](#best-practices-and-patterns)

---

## Introduction

This guide presents a modern, pragmatic approach to building interactive web applications on Cloudflare's edge platform. The stack combines hypermedia-driven development (HTMX) with lightweight client-side reactivity (Alpine.js), styled with TailwindCSS 4 and DaisyUI 5, all powered by TypeScript Workers on the backend.

### Why This Stack?

This architecture embraces several key principles that distinguish it from traditional SPA frameworks:

**Hypermedia as the Engine of Application State (HATEOAS)**: Rather than shipping a heavy JavaScript application that manages state client-side and communicates via JSON APIs, HTMX allows the server to return HTML fragments. The server remains the source of truth for application state, simplifying the mental model and reducing client-side complexity.

**Progressive Enhancement**: The application works with basic HTML, then layers on interactivity. HTMX handles server communication and DOM updates, while Alpine.js provides lightweight client-side state for UI-only concerns like dropdowns, modals, and form validation.

**Edge-First Architecture**: Cloudflare Workers execute at the edge, close to users worldwide. Combined with D1 (SQLite at the edge) and KV (globally distributed key-value storage), this architecture delivers exceptional performance without managing infrastructure.

**Test-Driven Design**: Following GOOS (Growing Object-Oriented Software, Guided by Tests) principles, we write acceptance tests first to define user-visible behavior, then unit tests to drive the design of individual components. This outside-in approach discovers object collaborations naturally.

### Technology Stack Summary

| Layer                | Technology                               | Purpose                                              |
| -------------------- | ---------------------------------------- | ---------------------------------------------------- |
| Styling              | TailwindCSS 4 + DaisyUI 5                | Utility-first CSS with semantic components           |
| Server Communication | HTMX                                     | Hypermedia-driven interactions, partial page updates |
| Client State         | Alpine.js                                | Lightweight reactivity for UI-only state             |
| Backend Runtime      | Cloudflare Workers                       | Edge-based TypeScript execution                      |
| Relational Data      | D1                                       | SQLite database at the edge                          |
| Cache/Sessions       | KV                                       | Distributed key-value storage                        |
| Static Assets        | Cloudflare Pages                         | CDN-backed static file hosting                       |
| Testing              | Vitest + @cloudflare/vitest-pool-workers | Runtime-accurate testing                             |

---

## Architecture Overview

### Static-First Routing Model

This architecture follows the principle: **"Static by default. Dynamic by intent."**

The root domain (`/`) serves static HTML pages (marketing site) directly from Cloudflare Pages, while the Worker handles only explicitly dynamic routes:

- `/app/*` — Authenticated application pages and HTMX partials
- `/auth/*` — Authentication flows (login, logout, OAuth callbacks)
- `/webhooks/*` — External service callbacks (Stripe, Slack, etc.)

```
Static-First Architecture:
┌──────────────────────────────────────────────────────────────┐
│                      Cloudflare Edge                          │
├──────────────────────────────────────────────────────────────┤
│  Request arrives at domain                                    │
│           │                                                   │
│           ▼                                                   │
│  ┌─────────────────┐                                         │
│  │ Route Matching  │                                         │
│  └────────┬────────┘                                         │
│           │                                                   │
│     ┌─────┴─────┐                                            │
│     ▼           ▼                                            │
│ ┌───────┐  ┌────────┐                                        │
│ │Static │  │Dynamic │                                        │
│ │Routes │  │Routes  │                                        │
│ └───┬───┘  └───┬────┘                                        │
│     │          │                                             │
│     ▼          ▼                                             │
│ ┌───────┐  ┌────────────────────────────────────┐           │
│ │Pages  │  │              Worker                 │           │
│ │(HTML) │  │  ┌────────┐  ┌─────┐  ┌────────┐  │           │
│ └───────┘  │  │ /auth  │  │/app │  │/webhooks│  │           │
│            │  │ (open) │  │(auth)│  │(sig)   │  │           │
│            │  └────────┘  └─────┘  └────────┘  │           │
│            └────────────────────────────────────┘           │
└──────────────────────────────────────────────────────────────┘
```

**Route Ownership:**

| Route Pattern                 | Handler | Auth Required | Purpose                    |
| ----------------------------- | ------- | ------------- | -------------------------- |
| `/`, `/about`, `/pricing`     | Pages   | No            | Static marketing pages     |
| `/blog/*`, `/assets/*`        | Pages   | No            | Static content and assets  |
| `/auth/login`, `/auth/logout` | Worker  | No/Session    | Authentication flows       |
| `/app/*`                      | Worker  | Session       | Authenticated application  |
| `/app/_/*`                    | Worker  | Session       | HTMX partial responses     |
| `/webhooks/*`                 | Worker  | Signature     | External service callbacks |

### The Hypermedia Approach

Traditional SPAs separate concerns by placing a JSON API on the server and a JavaScript application on the client. The client fetches data, manages state, renders HTML, and handles user interactions. This creates two parallel codebases that must stay synchronized.

The hypermedia approach returns to the web's original architecture: the server renders HTML, and the browser displays it. HTMX extends HTML with attributes that enable partial page updates without full page reloads. The server returns HTML fragments, not JSON, and the browser swaps them into the DOM.

```
Traditional SPA:
┌──────────────────┐     JSON      ┌──────────────────┐
│   Browser        │ ◄──────────►  │   API Server     │
│   (React/Vue)    │               │   (JSON)         │
│   - State mgmt   │               │   - Serialize    │
│   - Routing      │               │   - Validate     │
│   - Rendering    │               │   - Query        │
└──────────────────┘               └──────────────────┘

Hypermedia (HTMX):
┌──────────────────┐     HTML      ┌──────────────────┐
│   Browser        │ ◄──────────►  │   Server         │
│   (HTMX/Alpine)  │               │   (Workers)      │
│   - Display      │               │   - Render HTML  │
│   - UI state     │               │   - Business     │
└──────────────────┘               │   - Data access  │
                                   └──────────────────┘
```

### When to Use HTMX vs Alpine.js

The key insight is understanding what each tool does best:

**Use HTMX for**:

- Form submissions with server validation
- Data-driven list updates
- Search with server-side filtering
- Navigation and page transitions
- Any interaction requiring server data

**Use Alpine.js for**:

- Dropdowns and accordions
- Modal dialogs (open/close state)
- Client-side form validation feedback
- UI animations and transitions
- Tab switching (client-only)
- Temporary UI state (tooltips, hover effects)

**Combine them when**:

- Loading data with HTMX, then filtering client-side with Alpine
- Using Alpine for optimistic UI updates before HTMX confirms
- Managing complex multi-step forms (Alpine for local state, HTMX for submission)

### Clean Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│   (HTMX/Alpine.js + HTML Templates + TailwindCSS/DaisyUI)   │
├─────────────────────────────────────────────────────────────┤
│                    Application Layer                         │
│   (Workers: Request Handlers, Use Cases, DTOs)              │
├─────────────────────────────────────────────────────────────┤
│                      Domain Layer                            │
│   (Entities, Value Objects, Domain Services, Interfaces)    │
├─────────────────────────────────────────────────────────────┤
│                   Infrastructure Layer                       │
│   (D1 Repositories, KV Cache, External APIs)                │
└─────────────────────────────────────────────────────────────┘
```

#### Authentication Middleware Pattern

Authentication middleware sits in the presentation layer, wrapping all authenticated routes (typically `/app/*`) to ensure consistent session checking:

```typescript
// src/presentation/middleware/auth.ts
export async function requireAuth(
  request: Request,
  env: Env
): Promise<{ user: User; session: Session } | Response> {
  const sessionId = getCookie(request, 'session_id');

  if (!sessionId) {
    // No session - redirect to login
    return new Response(null, {
      status: 303,
      headers: { Location: '/auth/login' },
    });
  }

  // Load session from KV
  const session = await env.SESSIONS.get(sessionId, 'json');

  if (!session || session.expiresAt < Date.now()) {
    // Invalid or expired session
    return new Response(null, {
      status: 303,
      headers: {
        Location: '/auth/login',
        'Set-Cookie': 'session_id=; Max-Age=0; Path=/', // Clear cookie
      },
    });
  }

  // Load user from D1
  const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?')
    .bind(session.userId)
    .first();

  if (!user) {
    // User deleted but session still exists
    return new Response('Forbidden', { status: 403 });
  }

  // Return authenticated context
  return { user, session };
}

// Usage in route handlers
export const onRequest: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);

  // Public routes (marketing pages)
  if (!url.pathname.startsWith('/app')) {
    return await handlePublicRoute(context);
  }

  // All /app/* routes require authentication
  const authResult = await requireAuth(context.request, context.env);

  if (authResult instanceof Response) {
    // Authentication failed - return redirect/error response
    return authResult;
  }

  // Authentication succeeded - pass to app handlers
  return await handleAppRoute(context, authResult.user, authResult.session);
};
```

**Key Points**:

- **Consistent checking**: All `/app/*` routes automatically require authentication
- **HTMX partials included**: HTMX endpoints like `/app/_/task-list` also go through auth
- **Presentation layer concern**: Authentication checking belongs in presentation, not domain
- **Session renewal**: Consider refreshing session expiry on each authenticated request

**Note**: HTMX partial endpoints (e.g., `/app/_/task-list`) **must** also pass through authentication middleware. Without this, attackers could access HTMX endpoints directly, bypassing the full page authentication check.

---

## Project Structure

### Recommended Directory Layout

```
project-root/
├── public/                        # Static marketing site (served by Pages)
│   ├── index.html                # / - Marketing home page
│   ├── about/
│   │   └── index.html            # /about - About page
│   ├── pricing/
│   │   └── index.html            # /pricing - Pricing page
│   ├── blog/                     # /blog/* - Blog content
│   │   └── index.html
│   ├── css/
│   │   └── app.css               # Compiled TailwindCSS
│   ├── js/
│   │   ├── htmx.min.js
│   │   └── alpine.min.js
│   └── images/
│
├── src/
│   ├── domain/                    # Pure business logic (no dependencies)
│   │   ├── entities/
│   │   │   ├── User.ts
│   │   │   ├── User.spec.ts
│   │   │   ├── Task.ts
│   │   │   └── Task.spec.ts
│   │   ├── value-objects/
│   │   │   ├── Email.ts
│   │   │   ├── Email.spec.ts
│   │   │   ├── TaskStatus.ts
│   │   │   └── TaskStatus.spec.ts
│   │   ├── services/
│   │   │   ├── TaskPrioritizer.ts
│   │   │   └── TaskPrioritizer.spec.ts
│   │   └── interfaces/            # Port interfaces (repositories, etc.)
│   │       ├── TaskRepository.ts
│   │       └── UserRepository.ts
│   │
│   ├── application/               # Use cases / application services
│   │   ├── use-cases/
│   │   │   ├── CreateTask.ts
│   │   │   ├── CreateTask.spec.ts
│   │   │   ├── CompleteTask.ts
│   │   │   └── CompleteTask.spec.ts
│   │   └── dto/
│   │       ├── CreateTaskRequest.ts
│   │       └── TaskResponse.ts
│   │
│   ├── infrastructure/            # External concerns (adapters)
│   │   ├── repositories/
│   │   │   ├── D1TaskRepository.ts
│   │   │   └── D1TaskRepository.integration.test.ts
│   │   ├── cache/
│   │   │   ├── KVSessionStore.ts
│   │   │   └── KVSessionStore.integration.test.ts
│   │   └── services/
│   │       └── EmailService.ts
│   │
│   ├── presentation/              # HTTP/Worker layer (dynamic routes only)
│   │   ├── handlers/
│   │   │   ├── TaskHandlers.ts
│   │   │   ├── TaskHandlers.spec.ts
│   │   │   ├── TaskHandlers.acceptance.test.ts
│   │   │   ├── AuthHandlers.ts
│   │   │   └── WebhookHandlers.ts
│   │   ├── templates/
│   │   │   ├── layouts/
│   │   │   │   └── app-base.ts   # Base layout for /app/* pages
│   │   │   ├── app/              # Full pages for /app/* routes
│   │   │   │   ├── dashboard.ts  # /app - Dashboard
│   │   │   │   └── tasks.ts      # /app/tasks - Tasks page
│   │   │   └── partials/         # HTMX fragments for /app/_/* routes
│   │   │       ├── task-list.ts
│   │   │       ├── task-item.ts
│   │   │       └── task-form.ts
│   │   └── middleware/
│   │       ├── auth.ts           # Applied at /app/* boundary
│   │       └── errorHandler.ts
│   │
│   ├── index.ts                   # Worker entry point
│   └── router.ts                  # Route definitions (/app/*, /auth/*, /webhooks/*)
│
├── tests/
│   ├── setup.ts                  # Test configuration
│   ├── fixtures/                 # Test data builders
│   │   ├── TaskBuilder.ts
│   │   └── UserBuilder.ts
│   └── helpers/
│       └── testApp.ts            # Test application factory
│
├── migrations/                    # D1 database migrations
│   ├── 0001_initial.sql
│   └── 0002_add_tasks.sql
│
├── wrangler.jsonc                # Cloudflare configuration
├── vitest.config.ts              # Test configuration
├── tailwind.config.ts            # TailwindCSS configuration (if needed)
├── package.json
└── tsconfig.json
```

### Key Principles of This Structure

1. **Static-First**: The `public/` folder contains marketing pages served directly by Cloudflare Pages. These pages work without JavaScript and don't require the Worker.

2. **Domain Independence**: The `domain/` folder has zero dependencies on external frameworks or infrastructure. It contains pure TypeScript/JavaScript and can be tested without mocking.

3. **Dependency Rule**: Dependencies point inward. Infrastructure depends on Application, which depends on Domain. Never the reverse.

4. **Test Colocation**: Unit tests (`.spec.ts`) live next to their implementation files. Integration tests (`.integration.test.ts`) test adapters with real infrastructure. Acceptance tests (`.acceptance.test.ts`) test complete features.

5. **Template Organization**: HTML templates are organized by route type: `app/` for full pages under `/app/*`, and `partials/` for HTMX fragments returned by `/app/_/*` endpoints.

### Static Site Generators for Marketing Pages

The `public/` directory can be populated manually with HTML files, or more commonly, generated by a Static Site Generator (SSG). Popular choices include:

| SSG              | Language              | Best For                                |
| ---------------- | --------------------- | --------------------------------------- |
| Hugo             | Go templates          | Fast builds, content-heavy sites, blogs |
| Astro            | JavaScript/TypeScript | Component islands, mixed content        |
| 11ty (Eleventy)  | JavaScript            | Flexibility, simple templating          |
| Next.js (export) | React                 | Teams already using React               |

**The SSG's role is limited to marketing pages:**

- Home page (`/`)
- About, pricing, contact pages
- Blog posts and documentation
- Any publicly accessible content

**The Worker handles all dynamic functionality:**

- User authentication (`/auth/*`)
- Application logic (`/app/*`)
- HTMX partial responses (`/app/_/*`)
- Webhook endpoints (`/webhooks/*`)

**Example: Hugo Project Structure**

```
project-root/
├── hugo/                          # Hugo source files
│   ├── content/
│   │   ├── _index.md             # Home page content
│   │   ├── about.md
│   │   └── blog/
│   │       └── first-post.md
│   ├── layouts/
│   │   └── _default/
│   │       └── baseof.html
│   └── hugo.toml
│
├── public/                        # Hugo output (gitignored, built at deploy)
│   ├── index.html
│   ├── about/index.html
│   └── blog/first-post/index.html
│
└── src/                           # Worker source (dynamic routes)
    └── ...
```

**Build Process:**

```bash
# Build static marketing pages
cd hugo && hugo --destination ../public

# Deploy to Cloudflare (Pages serves public/, Worker handles /app/*, /auth/*, /webhooks/*)
wrangler deploy
```

### SSG-Worker Interaction Patterns

Static pages can interact with the Worker through forms and HTMX. This enables progressive enhancement where marketing pages work without JavaScript but gain dynamic features when JS is available.

#### Pattern 1: Contact Form on Static Page

A static marketing page can POST to a Worker endpoint:

```html
<!-- public/contact/index.html (generated by SSG) -->
<form action="/app/_/contact" method="POST">
  <input type="text" name="name" required />
  <input type="email" name="email" required />
  <textarea name="message" required></textarea>
  <button type="submit">Send Message</button>
</form>
```

For enhanced UX with HTMX (no full page reload):

```html
<!-- public/contact/index.html (generated by SSG) -->
<form hx-post="/app/_/contact" hx-target="#form-result" hx-swap="innerHTML">
  <input type="text" name="name" required />
  <input type="email" name="email" required />
  <textarea name="message" required></textarea>
  <button type="submit">
    <span class="htmx-indicator loading loading-spinner"></span>
    Send Message
  </button>
</form>
<div id="form-result"></div>
```

#### Pattern 2: Newsletter Signup

```html
<!-- In SSG template (e.g., Hugo partial) -->
<form hx-post="/app/_/newsletter/subscribe" hx-swap="outerHTML" class="flex gap-2">
  <input
    type="email"
    name="email"
    placeholder="your@email.com"
    required
    class="input input-bordered"
  />
  <button type="submit" class="btn btn-primary">Subscribe</button>
</form>
```

Worker returns HTML fragment:

```typescript
// src/presentation/handlers/NewsletterHandlers.ts
async handleSubscribe(request: Request): Promise<Response> {
  const formData = await request.formData();
  const email = formData.get('email') as string;

  // Process subscription...

  return new Response(
    `<div class="alert alert-success">Thanks for subscribing!</div>`,
    { headers: { 'Content-Type': 'text/html' } }
  );
}
```

#### Pattern 3: Dynamic Content in Static Pages

Load dynamic content into static page sections:

```html
<!-- public/pricing/index.html -->
<section class="pricing-cards">
  <!-- Static pricing info -->
</section>

<section hx-get="/app/_/pricing/current-promotion" hx-trigger="load" hx-swap="innerHTML">
  <!-- Dynamic promotion banner loaded from Worker -->
  <div class="skeleton h-20"></div>
</section>
```

#### Pattern 4: Authentication State in Static Pages

Check auth state and show appropriate UI:

```html
<!-- In SSG layout template -->
<nav>
  <div hx-get="/app/_/auth/status" hx-trigger="load" hx-swap="innerHTML">
    <!-- Auth status loaded dynamically -->
    <a href="/auth/login" class="btn">Login</a>
  </div>
</nav>
```

Worker returns appropriate partial:

```typescript
// src/presentation/handlers/AuthHandlers.ts
async getAuthStatus(request: Request): Promise<Response> {
  const session = await this.getSession(request);

  if (session) {
    return new Response(`
      <span>Welcome, ${escapeHtml(session.user.name)}</span>
      <a href="/app" class="btn btn-primary">Dashboard</a>
      <form hx-post="/auth/logout" hx-swap="none">
        <button type="submit" class="btn btn-ghost">Logout</button>
      </form>
    `, { headers: { 'Content-Type': 'text/html' } });
  }

  return new Response(`
    <a href="/auth/login" class="btn">Login</a>
    <a href="/auth/register" class="btn btn-primary">Sign Up</a>
  `, { headers: { 'Content-Type': 'text/html' } });
}
```

**Key Principles for SSG-Worker Interaction:**

1. **Forms always work**: Use standard `action` and `method` attributes as fallback
2. **HTMX enhances**: Add `hx-*` attributes for better UX when JS is available
3. **Endpoints under `/app/_/`**: All HTMX partials use the `/app/_/` convention
4. **No auth required for public forms**: Contact forms don't need sessions
5. **Auth-required endpoints**: Check session for sensitive operations

---

## Setting Up the Development Environment

### Prerequisites

Ensure you have the following installed:

- Node.js 18+ (LTS recommended)
- npm or pnpm
- Wrangler CLI (`npm install -g wrangler`)

### Project Initialization

```bash
# Create new project with Cloudflare's scaffolding
npm create cloudflare@latest my-app -- --type=hello-world

cd my-app

# Install dependencies
npm install

# Install frontend dependencies
npm install -D tailwindcss @tailwindcss/postcss daisyui

# Install testing dependencies
npm install -D vitest @cloudflare/vitest-pool-workers
```

### Wrangler Configuration

Create or update `wrangler.jsonc`:

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "my-app",
  "main": "src/index.ts",
  "compatibility_date": "2025-01-01",
  "compatibility_flags": ["nodejs_compat"],

  // Enable observability
  "observability": {
    "enabled": true,
  },

  // Static assets configuration
  // Marketing pages in public/ are served directly by Cloudflare Pages
  "assets": {
    "directory": "./public",
    "binding": "ASSETS",
  },

  // Routes: Worker only handles dynamic paths
  // Static content (/, /about, /pricing, etc.) falls through to Pages
  "routes": [
    { "pattern": "example.com/app/*", "zone_name": "example.com" },
    { "pattern": "example.com/auth/*", "zone_name": "example.com" },
    { "pattern": "example.com/webhooks/*", "zone_name": "example.com" },
  ],

  // D1 Database binding
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "my-app-db",
      "database_id": "your-database-id",
    },
  ],

  // KV Namespace binding
  "kv_namespaces": [
    {
      "binding": "SESSIONS",
      "id": "your-kv-namespace-id",
    },
  ],

  // Environment variables
  "vars": {
    "ENVIRONMENT": "development",
  },
}
```

### TypeScript Configuration

Update `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022"],
    "types": ["@cloudflare/workers-types"],
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@domain/*": ["src/domain/*"],
      "@application/*": ["src/application/*"],
      "@infrastructure/*": ["src/infrastructure/*"],
      "@presentation/*": ["src/presentation/*"]
    }
  },
  "include": ["src/**/*", "tests/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Vitest Configuration for Workers

Create `vitest.config.ts`:

```typescript
import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';

export default defineWorkersConfig({
  test: {
    globals: true,
    include: ['src/**/*.{spec,test}.ts', 'tests/**/*.test.ts'],

    poolOptions: {
      workers: {
        wrangler: {
          configPath: './wrangler.jsonc',
        },
        miniflare: {
          compatibilityDate: '2025-01-01',
          compatibilityFlags: ['nodejs_compat'],
        },
      },
    },

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', '**/*.spec.ts', '**/*.test.ts'],
    },
  },
});
```

### Package Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "dev": "wrangler dev",
    "deploy": "wrangler deploy",
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:unit": "vitest run --testPathPattern='\\.spec\\.ts$'",
    "test:integration": "vitest run --testPathPattern='\\.integration\\.test\\.ts$'",
    "test:acceptance": "vitest run --testPathPattern='\\.acceptance\\.test\\.ts$'",
    "types": "wrangler types",
    "db:migrate": "wrangler d1 migrations apply my-app-db",
    "db:migrate:local": "wrangler d1 migrations apply my-app-db --local",
    "css:build": "npx @tailwindcss/cli -i ./src/styles/app.css -o ./public/css/app.css --minify"
  }
}
```

---

## Frontend Stack

### TailwindCSS 4 Setup

TailwindCSS 4 simplifies configuration significantly. Create `src/styles/app.css`:

```css
@import 'tailwindcss';
@plugin "daisyui";

/* Configure DaisyUI themes */
@plugin "daisyui" {
  themes:
    light --default,
    dark --prefersdark,
    corporate;
}

/* Custom utilities if needed */
@layer utilities {
  .htmx-indicator {
    opacity: 0;
    transition: opacity 200ms ease-in;
  }

  .htmx-request .htmx-indicator,
  .htmx-request.htmx-indicator {
    opacity: 1;
  }
}
```

### DaisyUI 5 Component Usage

DaisyUI 5 provides semantic component classes that work with TailwindCSS 4. Key changes from v4:

```html
<!-- Buttons -->
<button class="btn btn-primary">Primary Action</button>
<button class="btn btn-secondary btn-outline">Secondary</button>
<button class="btn btn-ghost btn-sm">Small Ghost</button>

<!-- Form Inputs -->
<input type="text" class="input input-bordered w-full" placeholder="Enter text" />
<select class="select select-bordered w-full">
  <option disabled selected>Choose option</option>
  <option>Option 1</option>
</select>

<!-- Cards -->
<div class="card bg-base-100 shadow-xl">
  <div class="card-body">
    <h2 class="card-title">Card Title</h2>
    <p>Card content goes here.</p>
    <div class="card-actions justify-end">
      <button class="btn btn-primary">Action</button>
    </div>
  </div>
</div>

<!-- Alerts -->
<div class="alert alert-info">
  <span>Information message</span>
</div>

<!-- Menu (note v5 class changes) -->
<ul class="menu w-full bg-base-200 rounded-box">
  <li class="menu-active"><a>Active Item</a></li>
  <li><a>Regular Item</a></li>
  <li class="menu-disabled"><a>Disabled Item</a></li>
</ul>

<!-- Loading States -->
<span class="loading loading-spinner loading-md"></span>
```

### Base HTML Template

Create a TypeScript template function for the base layout:

```typescript
// src/presentation/templates/layouts/base.ts

export interface BaseLayoutProps {
  title: string;
  content: string;
  scripts?: string;
}

export function baseLayout({ title, content, scripts = '' }: BaseLayoutProps): string {
  return `<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  
  <!-- Styles -->
  <link rel="stylesheet" href="/css/app.css">
  
  <!-- HTMX -->
  <script src="/js/htmx.min.js" defer></script>
  
  <!-- Alpine.js -->
  <script defer src="/js/alpine.min.js"></script>
  
  <!-- HTMX Configuration -->
  <meta name="htmx-config" content='{"defaultSwapStyle":"innerHTML"}'>
</head>
<body class="min-h-screen bg-base-200">
  <!-- Navigation -->
  <nav class="navbar bg-base-100 shadow-lg">
    <div class="flex-1">
      <a href="/" class="btn btn-ghost text-xl">My App</a>
    </div>
    <div class="flex-none">
      <ul class="menu menu-horizontal px-1">
        <li><a href="/tasks" hx-boost="true">Tasks</a></li>
        <li><a href="/about" hx-boost="true">About</a></li>
      </ul>
    </div>
  </nav>
  
  <!-- Main Content -->
  <main class="container mx-auto px-4 py-8">
    ${content}
  </main>
  
  <!-- Toast Container for Notifications -->
  <div id="toast-container" 
       class="toast toast-end"
       x-data="{ toasts: [] }"
       @notify.window="toasts.push($event.detail); setTimeout(() => toasts.shift(), 3000)">
    <template x-for="toast in toasts" :key="toast.id">
      <div class="alert" :class="'alert-' + toast.type">
        <span x-text="toast.message"></span>
      </div>
    </template>
  </div>
  
  ${scripts}
</body>
</html>`;
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}
```

---

## Client-Side Interactivity

### HTMX Fundamentals

HTMX extends HTML with attributes that enable AJAX requests and DOM updates without writing JavaScript. The core concept is that any element can make HTTP requests and swap content.

#### Core Attributes

```html
<!-- Basic GET request, swap inner content -->
<button hx-get="/app/_/data" hx-target="#result">Load Data</button>
<div id="result"></div>

<!-- POST form data -->
<form hx-post="/app/_/tasks" hx-target="#task-list" hx-swap="beforeend">
  <input type="text" name="title" required />
  <button type="submit">Add Task</button>
</form>

<!-- DELETE with confirmation -->
<button
  hx-delete="/app/_/tasks/123"
  hx-confirm="Are you sure?"
  hx-target="closest .task-item"
  hx-swap="outerHTML"
>
  Delete
</button>
```

#### Swap Strategies

```html
<!-- innerHTML (default): Replace inner content -->
<div hx-get="/partial" hx-swap="innerHTML">Loading...</div>

<!-- outerHTML: Replace entire element -->
<div hx-get="/partial" hx-swap="outerHTML">Will be replaced</div>

<!-- beforeend: Append to children -->
<ul hx-get="/more-items" hx-swap="beforeend">
  <li>Existing item</li>
  <!-- New items appended here -->
</ul>

<!-- afterbegin: Prepend to children -->
<ul hx-get="/new-item" hx-swap="afterbegin">
  <!-- New items inserted here -->
  <li>Existing item</li>
</ul>

<!-- Out-of-band swaps: Update multiple targets -->
<div hx-get="/update" hx-target="#main">
  <!-- Response can include: -->
  <!-- <div id="sidebar" hx-swap-oob="true">New sidebar</div> -->
</div>
```

#### Triggers and Events

```html
<!-- Trigger on different events -->
<input
  type="search"
  hx-get="/search"
  hx-trigger="keyup changed delay:300ms"
  hx-target="#results"
  name="q"
/>

<!-- Trigger on reveal (lazy loading) -->
<div hx-get="/more-content" hx-trigger="revealed" hx-swap="afterend">
  <span class="loading loading-spinner"></span>
</div>

<!-- Trigger on intersection -->
<div hx-get="/analytics/track" hx-trigger="intersect once" hx-swap="none"></div>

<!-- Poll periodically -->
<div hx-get="/notifications/count" hx-trigger="every 30s" hx-swap="innerHTML">0</div>
```

#### Loading States

```html
<!-- Show spinner during request -->
<button hx-get="/slow-operation" hx-target="#result">
  <span class="htmx-indicator loading loading-spinner loading-sm"></span>
  Load Data
</button>

<!-- Disable button during request -->
<button hx-get="/app/_/action" hx-disabled-elt="this" class="btn btn-primary">Submit</button>

<!-- Add class during request -->
<form hx-post="/app/_/submit" hx-indicator="#form-spinner" class="[&.htmx-request]:opacity-50">
  <!-- Form fields -->
  <span id="form-spinner" class="loading loading-spinner htmx-indicator"></span>
</form>
```

### Alpine.js Fundamentals

Alpine.js provides reactive state management directly in HTML attributes. It's perfect for UI-only interactions that don't require server communication.

#### Core Directives

```html
<!-- Reactive data -->
<div x-data="{ count: 0, message: 'Hello' }">
  <span x-text="message"></span>
  <span x-text="count"></span>
  <button @click="count++">Increment</button>
</div>

<!-- Conditional rendering -->
<div x-data="{ open: false }">
  <button @click="open = !open">Toggle</button>
  <div x-show="open" x-transition>Hidden content</div>
</div>

<!-- Template conditionals (removes from DOM) -->
<template x-if="isLoggedIn">
  <div>Welcome back!</div>
</template>

<!-- Loops -->
<ul x-data="{ items: ['Apple', 'Banana', 'Cherry'] }">
  <template x-for="item in items" :key="item">
    <li x-text="item"></li>
  </template>
</ul>

<!-- Two-way binding -->
<div x-data="{ search: '' }">
  <input type="text" x-model="search" placeholder="Search..." />
  <p>Searching for: <span x-text="search"></span></p>
</div>
```

#### Component Patterns

```html
<!-- Dropdown component -->
<div x-data="{ open: false }" @click.outside="open = false" class="dropdown">
  <button @click="open = !open" class="btn">
    Options
    <svg x-show="!open" class="w-4 h-4"><!-- chevron down --></svg>
    <svg x-show="open" class="w-4 h-4"><!-- chevron up --></svg>
  </button>
  <ul
    x-show="open"
    x-transition:enter="transition ease-out duration-100"
    x-transition:enter-start="opacity-0 scale-95"
    x-transition:enter-end="opacity-100 scale-100"
    x-transition:leave="transition ease-in duration-75"
    x-transition:leave-start="opacity-100 scale-100"
    x-transition:leave-end="opacity-0 scale-95"
    class="menu dropdown-content bg-base-100 rounded-box shadow"
  >
    <li><a @click="selectOption('a')">Option A</a></li>
    <li><a @click="selectOption('b')">Option B</a></li>
  </ul>
</div>

<!-- Modal component -->
<div x-data="{ open: false }">
  <button @click="open = true" class="btn">Open Modal</button>

  <div
    x-show="open"
    x-transition:enter="ease-out duration-300"
    x-transition:enter-start="opacity-0"
    x-transition:enter-end="opacity-100"
    x-transition:leave="ease-in duration-200"
    x-transition:leave-start="opacity-100"
    x-transition:leave-end="opacity-0"
    class="modal modal-open"
    @keydown.escape.window="open = false"
  >
    <div class="modal-box" @click.stop>
      <h3 class="font-bold text-lg">Modal Title</h3>
      <p class="py-4">Modal content here</p>
      <div class="modal-action">
        <button class="btn" @click="open = false">Close</button>
      </div>
    </div>
    <div class="modal-backdrop" @click="open = false"></div>
  </div>
</div>

<!-- Tabs component -->
<div x-data="{ activeTab: 'tab1' }">
  <div class="tabs tabs-boxed">
    <a class="tab" :class="{ 'tab-active': activeTab === 'tab1' }" @click="activeTab = 'tab1'"
      >Tab 1</a
    >
    <a class="tab" :class="{ 'tab-active': activeTab === 'tab2' }" @click="activeTab = 'tab2'"
      >Tab 2</a
    >
    <a class="tab" :class="{ 'tab-active': activeTab === 'tab3' }" @click="activeTab = 'tab3'"
      >Tab 3</a
    >
  </div>

  <div class="py-4">
    <div x-show="activeTab === 'tab1'">Content for Tab 1</div>
    <div x-show="activeTab === 'tab2'">Content for Tab 2</div>
    <div x-show="activeTab === 'tab3'">Content for Tab 3</div>
  </div>
</div>
```

### Combining HTMX and Alpine.js

The real power emerges when combining both libraries. HTMX handles server communication while Alpine manages client-side state.

#### Pattern: Load with HTMX, Filter with Alpine

```html
<!-- Server returns the full list -->
<div x-data="{ filter: '' }" class="space-y-4">
  <input
    type="text"
    x-model="filter"
    placeholder="Filter items..."
    class="input input-bordered w-full"
  />

  <!-- HTMX loads the list -->
  <ul id="item-list" hx-get="/app/_/items" hx-trigger="load" hx-swap="innerHTML">
    <li class="loading loading-spinner"></li>
  </ul>
</div>

<!-- Each item has data attributes for filtering -->
<!-- Partial returned by server: -->
<template x-for="item in items.filter(i => i.name.toLowerCase().includes(filter.toLowerCase()))">
  <li
    x-show="$el.dataset.name.toLowerCase().includes(filter.toLowerCase())"
    :data-name="item.name"
    class="p-2 border-b"
  >
    <span x-text="item.name"></span>
  </li>
</template>
```

#### Pattern: Optimistic UI Updates

```html
<div
  x-data="{ 
  optimisticComplete: false,
  taskId: '123'
}"
>
  <div class="flex items-center gap-2" :class="{ 'opacity-50': optimisticComplete }">
    <input
      type="checkbox"
      class="checkbox"
      :checked="optimisticComplete"
      @click="optimisticComplete = !optimisticComplete"
      hx-patch="/app/_/tasks/123/toggle"
      hx-swap="none"
      @htmx:after-request="if(!event.detail.successful) optimisticComplete = !optimisticComplete"
    />
    <span :class="{ 'line-through': optimisticComplete }">Task title</span>
  </div>
</div>
```

#### Pattern: HTMX Events with Alpine

```html
<!-- Listen to HTMX events in Alpine -->
<div
  x-data="{ loading: false, error: null }"
  @htmx:before-request.window="loading = true; error = null"
  @htmx:after-request.window="loading = false"
  @htmx:response-error.window="error = 'Request failed'"
>
  <!-- Global loading indicator -->
  <div x-show="loading" class="fixed top-0 left-0 w-full">
    <div class="h-1 bg-primary animate-pulse"></div>
  </div>

  <!-- Error display -->
  <div x-show="error" class="alert alert-error">
    <span x-text="error"></span>
    <button @click="error = null">Dismiss</button>
  </div>

  <!-- Content area -->
  <div id="content">
    <!-- HTMX swapped content -->
  </div>
</div>
```

#### Pattern: Form with Client Validation

```html
<form
  hx-post="/app/_/tasks"
  hx-target="#task-list"
  hx-swap="beforeend"
  x-data="{ 
        title: '',
        errors: {},
        validate() {
          this.errors = {};
          if (this.title.length < 3) {
            this.errors.title = 'Title must be at least 3 characters';
          }
          return Object.keys(this.errors).length === 0;
        }
      }"
  @submit="if (!validate()) $event.preventDefault()"
  class="space-y-4"
>
  <div class="form-control">
    <label class="label">
      <span class="label-text">Task Title</span>
    </label>
    <input
      type="text"
      name="title"
      x-model="title"
      class="input input-bordered"
      :class="{ 'input-error': errors.title }"
    />
    <label class="label" x-show="errors.title">
      <span class="label-text-alt text-error" x-text="errors.title"></span>
    </label>
  </div>

  <button type="submit" class="btn btn-primary" :disabled="title.length === 0">Add Task</button>
</form>
```

### Alpine.js Morph Extension for State Preservation

When HTMX swaps content containing Alpine components, state can be lost. The Alpine Morph extension preserves state during swaps:

```html
<head>
  <script src="/js/htmx.min.js"></script>
  <script src="/js/htmx-ext-alpine-morph.js"></script>
  <script defer src="/js/alpine-morph.min.js"></script>
  <script defer src="/js/alpine.min.js"></script>
</head>

<body>
  <!-- Use morph swap to preserve Alpine state -->
  <div hx-get="/app/_/component" hx-trigger="click" hx-swap="morph" hx-ext="alpine-morph">
    <div x-data="{ count: 0 }">
      <p>Count: <span x-text="count"></span></p>
      <button @click="count++">Increment</button>
      <!-- count is preserved across HTMX swaps -->
    </div>
  </div>
</body>
```

---

## Backend: TypeScript Workers

### Worker Entry Point

```typescript
// src/index.ts
import { Router } from './router';
import { errorHandler } from './presentation/middleware/errorHandler';
import { TaskHandlers } from './presentation/handlers/TaskHandlers';
import { D1TaskRepository } from './infrastructure/repositories/D1TaskRepository';
import { CreateTask } from './application/use-cases/CreateTask';

export interface Env {
  DB: D1Database;
  SESSIONS: KVNamespace;
  ASSETS: Fetcher;
  ENVIRONMENT: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      // Create dependencies (in production, use a DI container)
      const taskRepository = new D1TaskRepository(env.DB);
      const createTask = new CreateTask(taskRepository);
      const taskHandlers = new TaskHandlers(createTask, taskRepository);

      const router = new Router(env, taskHandlers);
      return await router.handle(request);
    } catch (error) {
      return errorHandler(error);
    }
  },
};
```

### Simple Router Implementation

```typescript
// src/router.ts
import type { Env } from './index';
import type { TaskHandlers } from './presentation/handlers/TaskHandlers';
import type { AuthHandlers } from './presentation/handlers/AuthHandlers';
import type { WebhookHandlers } from './presentation/handlers/WebhookHandlers';
import type { AuthMiddleware } from './presentation/middleware/auth';

type RouteHandler = (request: Request, params: Record<string, string>) => Promise<Response>;

interface Route {
  method: string;
  pattern: RegExp;
  paramNames: string[];
  handler: RouteHandler;
}

export class Router {
  private routes: Route[] = [];

  constructor(
    private env: Env,
    private taskHandlers: TaskHandlers,
    private authHandlers: AuthHandlers,
    private webhookHandlers: WebhookHandlers,
    private authMiddleware: AuthMiddleware
  ) {
    this.registerRoutes();
  }

  private registerRoutes(): void {
    // Auth routes (public)
    this.get('/auth/login', (req) => this.authHandlers.loginPage(req));
    this.post('/auth/login', (req) => this.authHandlers.login(req));
    this.post('/auth/logout', (req) => this.authHandlers.logout(req));
    this.get('/auth/callback/:provider', (req, p) =>
      this.authHandlers.oauthCallback(req, p.provider)
    );

    // Webhook routes (signature verification, no session auth)
    this.post('/webhooks/stripe', (req) => this.webhookHandlers.stripe(req));
    this.post('/webhooks/slack', (req) => this.webhookHandlers.slack(req));

    // Application pages (authenticated) - all under /app
    this.get('/app', (req) => this.withAuth(req, () => this.taskHandlers.dashboardPage(req)));
    this.get('/app/tasks', (req) => this.withAuth(req, () => this.taskHandlers.tasksPage(req)));

    // HTMX partials (authenticated) - all under /app/_
    this.get('/app/_/tasks', (req) => this.withAuth(req, () => this.taskHandlers.listTasks(req)));
    this.post('/app/_/tasks', (req) => this.withAuth(req, () => this.taskHandlers.createTask(req)));
    this.patch('/app/_/tasks/:id', (req, p) =>
      this.withAuth(req, () => this.taskHandlers.updateTask(req, p.id))
    );
    this.delete('/app/_/tasks/:id', (req, p) =>
      this.withAuth(req, () => this.taskHandlers.deleteTask(req, p.id))
    );

    // Note: Static content (/, /about, /pricing, /blog/*, /assets/*) is served
    // directly by Cloudflare Pages, NOT by this Worker.
  }

  private async withAuth(request: Request, handler: () => Promise<Response>): Promise<Response> {
    const session = await this.authMiddleware.getSession(request);
    if (!session) {
      return new Response(null, {
        status: 302,
        headers: { Location: '/auth/login' },
      });
    }
    return handler();
  }

  private addRoute(method: string, path: string, handler: RouteHandler): void {
    const paramNames: string[] = [];
    const pattern = path
      .replace(/:(\w+)/g, (_, name) => {
        paramNames.push(name);
        return '([^/]+)';
      })
      .replace(/\*/g, '.*');

    this.routes.push({
      method,
      pattern: new RegExp(`^${pattern}$`),
      paramNames,
      handler,
    });
  }

  private get(path: string, handler: RouteHandler): void {
    this.addRoute('GET', path, handler);
  }

  private post(path: string, handler: RouteHandler): void {
    this.addRoute('POST', path, handler);
  }

  private patch(path: string, handler: RouteHandler): void {
    this.addRoute('PATCH', path, handler);
  }

  private delete(path: string, handler: RouteHandler): void {
    this.addRoute('DELETE', path, handler);
  }

  async handle(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const method = request.method;

    for (const route of this.routes) {
      if (route.method !== method) continue;

      const match = url.pathname.match(route.pattern);
      if (!match) continue;

      const params: Record<string, string> = {};
      route.paramNames.forEach((name, i) => {
        params[name] = match[i + 1];
      });

      return route.handler(request, params);
    }

    return new Response('Not found', { status: 404 });
  }
}
```

### Request Handlers

```typescript
// src/presentation/handlers/TaskHandlers.ts
import type { TaskRepository } from '@domain/interfaces/TaskRepository';
import type { CreateTask } from '@application/use-cases/CreateTask';
import { baseLayout } from '../templates/layouts/base';
import { tasksPage } from '../templates/pages/tasks';
import { taskList, taskItem } from '../templates/partials/task-list';

export class TaskHandlers {
  constructor(
    private createTask: CreateTask,
    private taskRepository: TaskRepository
  ) {}

  async homePage(request: Request): Promise<Response> {
    const content = `
      <div class="hero min-h-[60vh]">
        <div class="hero-content text-center">
          <div class="max-w-md">
            <h1 class="text-5xl font-bold">Welcome</h1>
            <p class="py-6">A simple task management app built with HTMX and Alpine.js.</p>
            <a href="/tasks" class="btn btn-primary" hx-boost="true">Get Started</a>
          </div>
        </div>
      </div>
    `;

    return this.htmlResponse(baseLayout({ title: 'Home', content }));
  }

  async tasksPage(request: Request): Promise<Response> {
    const tasks = await this.taskRepository.findAll();
    const content = tasksPage(tasks);
    return this.htmlResponse(baseLayout({ title: 'Tasks', content }));
  }

  async listTasks(request: Request): Promise<Response> {
    const tasks = await this.taskRepository.findAll();
    return this.htmlResponse(taskList(tasks));
  }

  async createTask(request: Request): Promise<Response> {
    const formData = await request.formData();
    const title = formData.get('title') as string;

    if (!title || title.trim().length < 3) {
      return this.htmlResponse(
        `<div class="alert alert-error">Title must be at least 3 characters</div>`,
        400
      );
    }

    const task = await this.createTask.execute({ title: title.trim() });

    // Return just the new task item for HTMX to append
    return this.htmlResponse(taskItem(task), 201, {
      'HX-Trigger': JSON.stringify({
        notify: { message: 'Task created!', type: 'success', id: Date.now() },
      }),
    });
  }

  async updateTask(request: Request, id: string): Promise<Response> {
    const task = await this.taskRepository.findById(id);
    if (!task) {
      return new Response('Not found', { status: 404 });
    }

    const formData = await request.formData();
    const completed = formData.get('completed') === 'true';

    task.setCompleted(completed);
    await this.taskRepository.save(task);

    return this.htmlResponse(taskItem(task));
  }

  async deleteTask(request: Request, id: string): Promise<Response> {
    await this.taskRepository.delete(id);

    // Return empty response - HTMX will remove the element
    return new Response('', {
      status: 200,
      headers: {
        'HX-Trigger': JSON.stringify({
          notify: { message: 'Task deleted', type: 'info', id: Date.now() },
        }),
      },
    });
  }

  private htmlResponse(
    html: string,
    status = 200,
    additionalHeaders: Record<string, string> = {}
  ): Response {
    return new Response(html, {
      status,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        ...additionalHeaders,
      },
    });
  }
}
```

### HTML Templates

```typescript
// src/presentation/templates/pages/tasks.ts
import type { Task } from '@domain/entities/Task';
import { taskList, taskForm } from '../partials/task-list';

export function tasksPage(tasks: Task[]): string {
  return `
    <div class="max-w-2xl mx-auto space-y-8">
      <h1 class="text-3xl font-bold">Tasks</h1>
      
      <!-- Add Task Form -->
      ${taskForm()}
      
      <!-- Task List -->
      <div class="card bg-base-100 shadow">
        <div class="card-body">
          <h2 class="card-title">Your Tasks</h2>
          <ul id="task-list" class="space-y-2">
            ${tasks.map((task) => taskItem(task)).join('')}
          </ul>
          
          <div id="task-list-empty" 
               class="${tasks.length > 0 ? 'hidden' : ''} text-center py-8 text-base-content/60">
            No tasks yet. Add one above!
          </div>
        </div>
      </div>
    </div>
  `;
}

// src/presentation/templates/partials/task-list.ts
import type { Task } from '@domain/entities/Task';
import { escapeHtml } from '../../utils/escape';

export function taskForm(): string {
  return `
    <div class="card bg-base-100 shadow">
      <div class="card-body">
        <form hx-post="/app/_/tasks"
              hx-target="#task-list"
              hx-swap="beforeend"
              hx-on::after-request="if(event.detail.successful) this.reset(); document.getElementById('task-list-empty')?.classList.add('hidden')"
              x-data="{ title: '', submitting: false }"
              @htmx:before-request="submitting = true"
              @htmx:after-request="submitting = false"
              class="flex gap-2">
          <input type="text" 
                 name="title"
                 x-model="title"
                 placeholder="What needs to be done?"
                 class="input input-bordered flex-1"
                 :disabled="submitting"
                 required
                 minlength="3">
          <button type="submit" 
                  class="btn btn-primary"
                  :disabled="title.length < 3 || submitting">
            <span x-show="!submitting">Add</span>
            <span x-show="submitting" class="loading loading-spinner loading-sm"></span>
          </button>
        </form>
      </div>
    </div>
  `;
}

export function taskList(tasks: Task[]): string {
  return tasks.map((task) => taskItem(task)).join('');
}

export function taskItem(task: Task): string {
  const id = escapeHtml(task.id);
  const title = escapeHtml(task.title);
  const completed = task.isCompleted;

  return `
    <li class="task-item flex items-center gap-3 p-3 bg-base-200 rounded-lg"
        x-data="{ deleting: false }">
      <input type="checkbox" 
             class="checkbox checkbox-primary"
             ${completed ? 'checked' : ''}
             hx-patch="/app/_/tasks/${id}"
             hx-target="closest .task-item"
             hx-swap="outerHTML"
             hx-vals='{"completed": "${!completed}"}'>
      <span class="flex-1 ${completed ? 'line-through opacity-60' : ''}">${title}</span>
      <button class="btn btn-ghost btn-sm btn-square text-error"
              @click="deleting = true"
              hx-delete="/app/_/tasks/${id}"
              hx-target="closest .task-item"
              hx-swap="outerHTML"
              hx-confirm="Delete this task?"
              :disabled="deleting">
        <span x-show="!deleting">✕</span>
        <span x-show="deleting" class="loading loading-spinner loading-xs"></span>
      </button>
    </li>
  `;
}
```

---

## Data Layer

### D1 Database (SQLite)

D1 is Cloudflare's managed SQLite database running at the edge. It's ideal for structured data with relational queries.

#### Creating Migrations

```sql
-- migrations/0001_initial.sql
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);

-- migrations/0002_add_tasks.sql
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  completed INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_completed ON tasks(completed);
```

Apply migrations:

```bash
# Local development
wrangler d1 migrations apply my-app-db --local

# Production
wrangler d1 migrations apply my-app-db
```

#### D1 Repository Implementation

```typescript
// src/infrastructure/repositories/D1TaskRepository.ts
import type { TaskRepository } from '@domain/interfaces/TaskRepository';
import { Task } from '@domain/entities/Task';

interface TaskRow {
  id: string;
  user_id: string;
  title: string;
  completed: number;
  created_at: string;
  updated_at: string;
}

export class D1TaskRepository implements TaskRepository {
  constructor(private db: D1Database) {}

  async findById(id: string): Promise<Task | null> {
    const result = await this.db
      .prepare('SELECT * FROM tasks WHERE id = ?')
      .bind(id)
      .first<TaskRow>();

    if (!result) return null;
    return this.toDomain(result);
  }

  async findAll(): Promise<Task[]> {
    const { results } = await this.db
      .prepare('SELECT * FROM tasks ORDER BY created_at DESC')
      .all<TaskRow>();

    return results.map((row) => this.toDomain(row));
  }

  async findByUserId(userId: string): Promise<Task[]> {
    const { results } = await this.db
      .prepare('SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC')
      .bind(userId)
      .all<TaskRow>();

    return results.map((row) => this.toDomain(row));
  }

  async save(task: Task): Promise<void> {
    const now = new Date().toISOString();

    await this.db
      .prepare(
        `
        INSERT INTO tasks (id, user_id, title, completed, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          title = excluded.title,
          completed = excluded.completed,
          updated_at = excluded.updated_at
      `
      )
      .bind(
        task.id,
        task.userId,
        task.title,
        task.isCompleted ? 1 : 0,
        task.createdAt.toISOString(),
        now
      )
      .run();
  }

  async delete(id: string): Promise<void> {
    await this.db.prepare('DELETE FROM tasks WHERE id = ?').bind(id).run();
  }

  private toDomain(row: TaskRow): Task {
    return Task.reconstitute({
      id: row.id,
      userId: row.user_id,
      title: row.title,
      completed: row.completed === 1,
      createdAt: new Date(row.created_at),
    });
  }
}
```

### KV Storage

KV is Cloudflare's globally distributed key-value store. It's optimized for high-read, low-write scenarios like sessions, feature flags, and caching.

#### KV Session Store

```typescript
// src/infrastructure/cache/KVSessionStore.ts
export interface Session {
  userId: string;
  email: string;
  createdAt: number;
  expiresAt: number;
}

export class KVSessionStore {
  private readonly SESSION_PREFIX = 'session:';
  private readonly DEFAULT_TTL = 60 * 60 * 24 * 7; // 7 days in seconds

  constructor(private kv: KVNamespace) {}

  async create(userId: string, email: string): Promise<string> {
    const sessionId = crypto.randomUUID();
    const now = Date.now();

    const session: Session = {
      userId,
      email,
      createdAt: now,
      expiresAt: now + this.DEFAULT_TTL * 1000,
    };

    await this.kv.put(`${this.SESSION_PREFIX}${sessionId}`, JSON.stringify(session), {
      expirationTtl: this.DEFAULT_TTL,
    });

    return sessionId;
  }

  async get(sessionId: string): Promise<Session | null> {
    const data = await this.kv.get(`${this.SESSION_PREFIX}${sessionId}`);
    if (!data) return null;

    const session = JSON.parse(data) as Session;

    // Check if expired (belt and suspenders with KV TTL)
    if (Date.now() > session.expiresAt) {
      await this.delete(sessionId);
      return null;
    }

    return session;
  }

  async delete(sessionId: string): Promise<void> {
    await this.kv.delete(`${this.SESSION_PREFIX}${sessionId}`);
  }

  async refresh(sessionId: string): Promise<boolean> {
    const session = await this.get(sessionId);
    if (!session) return false;

    session.expiresAt = Date.now() + this.DEFAULT_TTL * 1000;

    await this.kv.put(`${this.SESSION_PREFIX}${sessionId}`, JSON.stringify(session), {
      expirationTtl: this.DEFAULT_TTL,
    });

    return true;
  }
}
```

#### Choosing Between D1 and KV

| Use Case                          | D1      | KV  |
| --------------------------------- | ------- | --- |
| Relational data with joins        | ✓       |     |
| Complex queries (WHERE, GROUP BY) | ✓       |     |
| Transactional writes              | ✓       |     |
| Session storage                   |         | ✓   |
| Feature flags                     |         | ✓   |
| Caching (high read, low write)    |         | ✓   |
| Per-user configuration            | ✓ or KV | ✓   |
| Time-series data                  | ✓       |     |
| Simple key lookups                |         | ✓   |

---

## Domain-Driven Design

### Domain Layer (No External Dependencies)

The domain layer contains pure business logic with no dependencies on frameworks, databases, or HTTP concerns.

#### Entities

```typescript
// src/domain/entities/Task.ts
import { TaskId } from '../value-objects/TaskId';
import { TaskStatus } from '../value-objects/TaskStatus';

export interface TaskProps {
  id: string;
  userId: string;
  title: string;
  completed: boolean;
  createdAt: Date;
}

export class Task {
  private readonly _id: TaskId;
  private readonly _userId: string;
  private _title: string;
  private _status: TaskStatus;
  private readonly _createdAt: Date;

  private constructor(props: TaskProps) {
    this._id = new TaskId(props.id);
    this._userId = props.userId;
    this._title = props.title;
    this._status = props.completed ? TaskStatus.completed() : TaskStatus.pending();
    this._createdAt = props.createdAt;
  }

  // Factory method for creating new tasks
  static create(props: { userId: string; title: string }): Task {
    if (!props.title || props.title.trim().length < 3) {
      throw new Error('Task title must be at least 3 characters');
    }

    return new Task({
      id: crypto.randomUUID(),
      userId: props.userId,
      title: props.title.trim(),
      completed: false,
      createdAt: new Date(),
    });
  }

  // Factory method for reconstituting from persistence
  static reconstitute(props: TaskProps): Task {
    return new Task(props);
  }

  get id(): string {
    return this._id.value;
  }

  get userId(): string {
    return this._userId;
  }

  get title(): string {
    return this._title;
  }

  get isCompleted(): boolean {
    return this._status.isCompleted;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  complete(): void {
    if (this._status.isCompleted) {
      throw new Error('Task is already completed');
    }
    this._status = TaskStatus.completed();
  }

  reopen(): void {
    if (!this._status.isCompleted) {
      throw new Error('Task is not completed');
    }
    this._status = TaskStatus.pending();
  }

  setCompleted(completed: boolean): void {
    this._status = completed ? TaskStatus.completed() : TaskStatus.pending();
  }

  rename(newTitle: string): void {
    if (!newTitle || newTitle.trim().length < 3) {
      throw new Error('Task title must be at least 3 characters');
    }
    this._title = newTitle.trim();
  }
}
```

#### Value Objects

```typescript
// src/domain/value-objects/TaskId.ts
export class TaskId {
  constructor(public readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('TaskId cannot be empty');
    }
  }

  equals(other: TaskId): boolean {
    return this.value === other.value;
  }
}

// src/domain/value-objects/TaskStatus.ts
export class TaskStatus {
  private constructor(private readonly _completed: boolean) {}

  static pending(): TaskStatus {
    return new TaskStatus(false);
  }

  static completed(): TaskStatus {
    return new TaskStatus(true);
  }

  get isCompleted(): boolean {
    return this._completed;
  }

  get isPending(): boolean {
    return !this._completed;
  }
}

// src/domain/value-objects/Email.ts
export class Email {
  private readonly _value: string;

  constructor(value: string) {
    const normalized = value.toLowerCase().trim();
    if (!this.isValid(normalized)) {
      throw new Error('Invalid email address');
    }
    this._value = normalized;
  }

  private isValid(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  get value(): string {
    return this._value;
  }

  get domain(): string {
    return this._value.split('@')[1];
  }

  equals(other: Email): boolean {
    return this._value === other._value;
  }
}
```

#### Repository Interfaces (Ports)

```typescript
// src/domain/interfaces/TaskRepository.ts
import type { Task } from '../entities/Task';

export interface TaskRepository {
  findById(id: string): Promise<Task | null>;
  findAll(): Promise<Task[]>;
  findByUserId(userId: string): Promise<Task[]>;
  save(task: Task): Promise<void>;
  delete(id: string): Promise<void>;
}
```

### Application Layer (Use Cases)

Use cases orchestrate domain objects to fulfill a specific application purpose.

```typescript
// src/application/use-cases/CreateTask.ts
import { Task } from '@domain/entities/Task';
import type { TaskRepository } from '@domain/interfaces/TaskRepository';
import type { CreateTaskRequest } from '../dto/CreateTaskRequest';
import type { TaskResponse } from '../dto/TaskResponse';

export class CreateTask {
  constructor(private taskRepository: TaskRepository) {}

  async execute(request: CreateTaskRequest): Promise<TaskResponse> {
    // In a real app, userId would come from authenticated session
    const task = Task.create({
      userId: request.userId || 'anonymous',
      title: request.title,
    });

    await this.taskRepository.save(task);

    return {
      id: task.id,
      title: task.title,
      completed: task.isCompleted,
      createdAt: task.createdAt.toISOString(),
    };
  }
}

// src/application/dto/CreateTaskRequest.ts
export interface CreateTaskRequest {
  title: string;
  userId?: string;
}

// src/application/dto/TaskResponse.ts
export interface TaskResponse {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}
```

---

## Testing with GOOS/TDD

### The GOOS Outside-In Process

Following Growing Object-Oriented Software, Guided by Tests (GOOS), we develop from the outside in:

1. **Write a failing acceptance test** that defines the user-visible behavior
2. **Identify the first missing capability**
3. **Write unit tests** to drive the design of that capability
4. **Implement** the minimum code to pass
5. **Integrate** back up to the acceptance test
6. **Repeat** until the acceptance test passes
7. **Refactor** mercilessly

### Test Pyramid

```
        /\
       /  \     Acceptance Tests (few, slow, comprehensive)
      /----\    - Test complete features through HTTP
     /      \   - Use real D1/KV (locally via Miniflare)
    /--------\
   /          \ Integration Tests (some, medium)
  /------------\- Test adapters with real infrastructure
 /              \- Repository + D1, SessionStore + KV
/________________\ Unit Tests (many, fast, isolated)
                  - Test domain entities and value objects
                  - Test use cases with mocked dependencies
```

### Vitest Configuration with Cloudflare Pool

```typescript
// vitest.config.ts
import { defineWorkersConfig, readD1Migrations } from '@cloudflare/vitest-pool-workers/config';
import path from 'node:path';

export default defineWorkersConfig(async () => {
  const migrationsPath = path.join(__dirname, 'migrations');
  const migrations = await readD1Migrations(migrationsPath);

  return {
    test: {
      globals: true,
      include: ['src/**/*.{spec,test}.ts', 'tests/**/*.test.ts'],
      setupFiles: ['./tests/setup.ts'],

      poolOptions: {
        workers: {
          wrangler: {
            configPath: './wrangler.jsonc',
          },
          miniflare: {
            d1Databases: {
              DB: {
                // Each test gets isolated storage
              },
            },
            kvNamespaces: ['SESSIONS'],
            bindings: {
              MIGRATIONS: migrations,
            },
          },
          isolatedStorage: true, // Critical: isolates D1/KV per test
        },
      },

      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        thresholds: {
          lines: 80,
          functions: 80,
          branches: 80,
          statements: 80,
        },
      },
    },
  };
});
```

### Test Setup

```typescript
// tests/setup.ts
import { env } from 'cloudflare:test';
import { applyD1Migrations } from '@cloudflare/vitest-pool-workers/config';
import { beforeAll, afterEach, vi } from 'vitest';

beforeAll(async () => {
  // Apply migrations before any tests run
  const migrations = env.MIGRATIONS as any[];
  await applyD1Migrations(env.DB, migrations);
});

afterEach(() => {
  vi.clearAllMocks();
});
```

### Acceptance Tests

Acceptance tests verify complete features from the user's perspective.

```typescript
// src/presentation/handlers/TaskHandlers.acceptance.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { env, SELF } from 'cloudflare:test';

describe('Task Management', () => {
  describe('Creating a task', () => {
    it('should create a task and return it as HTML', async () => {
      // Given: A user on the tasks page
      const formData = new FormData();
      formData.append('title', 'Buy groceries');

      // When: They submit the task form
      const response = await SELF.fetch('http://localhost/api/tasks', {
        method: 'POST',
        body: formData,
      });

      // Then: The response contains the new task as HTML
      expect(response.status).toBe(201);
      expect(response.headers.get('Content-Type')).toContain('text/html');

      const html = await response.text();
      expect(html).toContain('Buy groceries');
      expect(html).toContain('task-item');

      // And: A notification is triggered
      const hxTrigger = response.headers.get('HX-Trigger');
      expect(hxTrigger).toBeDefined();
      const trigger = JSON.parse(hxTrigger!);
      expect(trigger.notify.type).toBe('success');
    });

    it('should reject tasks with titles shorter than 3 characters', async () => {
      const formData = new FormData();
      formData.append('title', 'ab');

      const response = await SELF.fetch('http://localhost/api/tasks', {
        method: 'POST',
        body: formData,
      });

      expect(response.status).toBe(400);
      const html = await response.text();
      expect(html).toContain('alert-error');
    });
  });

  describe('Completing a task', () => {
    it('should toggle task completion status', async () => {
      // Given: An existing task
      const createForm = new FormData();
      createForm.append('title', 'Test task');
      const createResponse = await SELF.fetch('http://localhost/api/tasks', {
        method: 'POST',
        body: createForm,
      });

      // Extract task ID from response
      const createHtml = await createResponse.text();
      const idMatch = createHtml.match(/hx-patch="\/api\/tasks\/([^"]+)"/);
      expect(idMatch).toBeDefined();
      const taskId = idMatch![1];

      // When: The user completes the task
      const updateForm = new FormData();
      updateForm.append('completed', 'true');
      const response = await SELF.fetch(`http://localhost/api/tasks/${taskId}`, {
        method: 'PATCH',
        body: updateForm,
      });

      // Then: The task is marked as completed
      expect(response.status).toBe(200);
      const html = await response.text();
      expect(html).toContain('line-through');
      expect(html).toContain('checked');
    });
  });

  describe('Deleting a task', () => {
    it('should remove the task', async () => {
      // Given: An existing task
      const createForm = new FormData();
      createForm.append('title', 'Task to delete');
      const createResponse = await SELF.fetch('http://localhost/api/tasks', {
        method: 'POST',
        body: createForm,
      });

      const createHtml = await createResponse.text();
      const idMatch = createHtml.match(/hx-delete="\/api\/tasks\/([^"]+)"/);
      const taskId = idMatch![1];

      // When: The user deletes the task
      const response = await SELF.fetch(`http://localhost/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      // Then: The task is removed
      expect(response.status).toBe(200);
      expect(await response.text()).toBe('');

      // And: The task no longer exists
      const listResponse = await SELF.fetch('http://localhost/api/tasks');
      const listHtml = await listResponse.text();
      expect(listHtml).not.toContain('Task to delete');
    });
  });
});
```

### Unit Tests

Unit tests drive the design of individual components in isolation.

```typescript
// src/domain/entities/Task.spec.ts
import { describe, it, expect } from 'vitest';
import { Task } from './Task';

describe('Task', () => {
  describe('creation', () => {
    it('should create a task with a title', () => {
      const task = Task.create({ userId: 'user-1', title: 'Buy groceries' });

      expect(task.title).toBe('Buy groceries');
      expect(task.isCompleted).toBe(false);
      expect(task.userId).toBe('user-1');
      expect(task.id).toBeDefined();
    });

    it('should trim the title', () => {
      const task = Task.create({ userId: 'user-1', title: '  Buy groceries  ' });

      expect(task.title).toBe('Buy groceries');
    });

    it('should reject titles shorter than 3 characters', () => {
      expect(() => Task.create({ userId: 'user-1', title: 'ab' })).toThrow(
        'Task title must be at least 3 characters'
      );
    });

    it('should reject empty titles', () => {
      expect(() => Task.create({ userId: 'user-1', title: '' })).toThrow(
        'Task title must be at least 3 characters'
      );
    });
  });

  describe('completion', () => {
    it('should mark a pending task as completed', () => {
      const task = Task.create({ userId: 'user-1', title: 'Test task' });

      task.complete();

      expect(task.isCompleted).toBe(true);
    });

    it('should throw when completing an already completed task', () => {
      const task = Task.create({ userId: 'user-1', title: 'Test task' });
      task.complete();

      expect(() => task.complete()).toThrow('Task is already completed');
    });

    it('should reopen a completed task', () => {
      const task = Task.create({ userId: 'user-1', title: 'Test task' });
      task.complete();

      task.reopen();

      expect(task.isCompleted).toBe(false);
    });
  });

  describe('renaming', () => {
    it('should rename a task', () => {
      const task = Task.create({ userId: 'user-1', title: 'Original' });

      task.rename('Updated title');

      expect(task.title).toBe('Updated title');
    });

    it('should reject invalid new titles', () => {
      const task = Task.create({ userId: 'user-1', title: 'Original' });

      expect(() => task.rename('ab')).toThrow('Task title must be at least 3 characters');
    });
  });
});
```

### Integration Tests

Integration tests verify that adapters work correctly with real infrastructure.

```typescript
// src/infrastructure/repositories/D1TaskRepository.integration.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { env } from 'cloudflare:test';
import { D1TaskRepository } from './D1TaskRepository';
import { Task } from '@domain/entities/Task';

describe('D1TaskRepository', () => {
  let repository: D1TaskRepository;

  beforeEach(() => {
    repository = new D1TaskRepository(env.DB);
  });

  describe('save and findById', () => {
    it('should persist and retrieve a task', async () => {
      const task = Task.create({ userId: 'user-1', title: 'Test task' });

      await repository.save(task);
      const found = await repository.findById(task.id);

      expect(found).not.toBeNull();
      expect(found!.id).toBe(task.id);
      expect(found!.title).toBe('Test task');
      expect(found!.isCompleted).toBe(false);
    });

    it('should return null for non-existent task', async () => {
      const found = await repository.findById('non-existent');

      expect(found).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all tasks ordered by creation date', async () => {
      const task1 = Task.create({ userId: 'user-1', title: 'First task' });
      const task2 = Task.create({ userId: 'user-1', title: 'Second task' });

      await repository.save(task1);
      await repository.save(task2);

      const tasks = await repository.findAll();

      expect(tasks).toHaveLength(2);
      expect(tasks[0].title).toBe('Second task'); // Most recent first
    });
  });

  describe('update', () => {
    it('should update an existing task', async () => {
      const task = Task.create({ userId: 'user-1', title: 'Original' });
      await repository.save(task);

      task.rename('Updated');
      task.complete();
      await repository.save(task);

      const found = await repository.findById(task.id);
      expect(found!.title).toBe('Updated');
      expect(found!.isCompleted).toBe(true);
    });
  });

  describe('delete', () => {
    it('should remove a task', async () => {
      const task = Task.create({ userId: 'user-1', title: 'To delete' });
      await repository.save(task);

      await repository.delete(task.id);

      const found = await repository.findById(task.id);
      expect(found).toBeNull();
    });
  });
});
```

### Use Case Unit Tests

```typescript
// src/application/use-cases/CreateTask.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateTask } from './CreateTask';
import type { TaskRepository } from '@domain/interfaces/TaskRepository';

describe('CreateTask', () => {
  let useCase: CreateTask;
  let mockRepository: TaskRepository;

  beforeEach(() => {
    mockRepository = {
      findById: vi.fn(),
      findAll: vi.fn(),
      findByUserId: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
    };
    useCase = new CreateTask(mockRepository);
  });

  it('should create a task and save it', async () => {
    const result = await useCase.execute({
      title: 'New task',
      userId: 'user-1',
    });

    expect(result.title).toBe('New task');
    expect(result.completed).toBe(false);
    expect(result.id).toBeDefined();
    expect(mockRepository.save).toHaveBeenCalledOnce();
  });

  it('should use anonymous user when userId not provided', async () => {
    const result = await useCase.execute({ title: 'Anonymous task' });

    expect(mockRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ _userId: 'anonymous' })
    );
  });

  it('should propagate domain validation errors', async () => {
    await expect(useCase.execute({ title: 'ab' })).rejects.toThrow(
      'Task title must be at least 3 characters'
    );

    expect(mockRepository.save).not.toHaveBeenCalled();
  });
});
```

### Test Data Builders

```typescript
// tests/fixtures/TaskBuilder.ts
import { Task, TaskProps } from '@domain/entities/Task';

export class TaskBuilder {
  private props: TaskProps = {
    id: crypto.randomUUID(),
    userId: 'test-user',
    title: 'Default task',
    completed: false,
    createdAt: new Date(),
  };

  static aTask(): TaskBuilder {
    return new TaskBuilder();
  }

  withId(id: string): TaskBuilder {
    this.props.id = id;
    return this;
  }

  withTitle(title: string): TaskBuilder {
    this.props.title = title;
    return this;
  }

  withUserId(userId: string): TaskBuilder {
    this.props.userId = userId;
    return this;
  }

  completed(): TaskBuilder {
    this.props.completed = true;
    return this;
  }

  createdAt(date: Date): TaskBuilder {
    this.props.createdAt = date;
    return this;
  }

  build(): Task {
    return Task.reconstitute(this.props);
  }
}

// Usage in tests:
const task = TaskBuilder.aTask().withTitle('Important task').completed().build();
```

### Kent Beck's Test Desiderata Applied

Following the 12 properties of good tests:

1. **Isolated**: Each test uses `isolatedStorage: true` for independent D1/KV state
2. **Composable**: Tests run in any order without affecting each other
3. **Fast**: Unit tests have no I/O; integration tests use local Miniflare
4. **Inspiring**: Clear descriptions explain what's being tested
5. **Writable**: Builder patterns and helpers make tests easy to write
6. **Readable**: Given/When/Then structure clarifies intent
7. **Behavioral**: Tests focus on what the system does, not how
8. **Structure-Insensitive**: Changing internal implementation doesn't break tests
9. **Automated**: All tests run via `npm test`
10. **Specific**: Failures point to exactly what's broken
11. **Deterministic**: No flaky tests; isolated state prevents race conditions
12. **Predictive**: Tests run in the Workers runtime, matching production behavior

---

## Deployment and Operations

### Static-First Build Process

The static-first architecture separates the build into two parts:

1. **Static Site Generation (SSG)**: Marketing pages are pre-built to `public/`
2. **Worker Deployment**: The Worker handles only dynamic routes (`/app/*`, `/auth/*`, `/webhooks/*`)

```bash
# Build static marketing pages (if using an SSG like Hugo or Astro)
npm run build:static   # Outputs to public/

# Deploy Worker and static assets together
npm run deploy         # wrangler deploy
```

The deployment flow:

1. SSG (Hugo, Astro, 11ty) builds marketing pages to `public/`
2. Cloudflare Pages serves static content from `public/` at `/`, `/about`, `/pricing`, etc.
3. Worker receives only requests matching configured routes: `/app/*`, `/auth/*`, `/webhooks/*`

### Deploying to Cloudflare

```bash
# Deploy to production
npm run deploy

# Deploy to a preview environment
wrangler deploy --env preview

# View deployment logs
wrangler tail
```

### Environment Configuration

```jsonc
// wrangler.jsonc
{
  "name": "my-app",
  "main": "src/index.ts",

  // Production environment (default)
  "vars": {
    "ENVIRONMENT": "production",
  },

  // Preview environment
  "env": {
    "preview": {
      "name": "my-app-preview",
      "vars": {
        "ENVIRONMENT": "preview",
      },
      "d1_databases": [
        {
          "binding": "DB",
          "database_name": "my-app-db-preview",
          "database_id": "preview-database-id",
        },
      ],
    },
  },
}
```

### Database Migrations in Production

```bash
# Apply migrations to production
wrangler d1 migrations apply my-app-db --remote

# Check migration status
wrangler d1 migrations list my-app-db --remote
```

### Monitoring and Observability

Workers provide built-in observability when enabled:

```jsonc
{
  "observability": {
    "enabled": true,
  },
}
```

Add custom logging:

```typescript
// src/presentation/middleware/logging.ts
export function logRequest(request: Request): void {
  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      method: request.method,
      url: request.url,
      headers: Object.fromEntries(request.headers),
    })
  );
}

export function logError(error: Error, request: Request): void {
  console.error(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack,
      url: request.url,
    })
  );
}
```

---

## Complete Example Application

This section ties everything together with a complete task management feature.

### Project Files Overview

```
src/
├── domain/
│   ├── entities/Task.ts
│   ├── value-objects/TaskStatus.ts
│   └── interfaces/TaskRepository.ts
├── application/
│   ├── use-cases/CreateTask.ts
│   └── dto/TaskRequest.ts
├── infrastructure/
│   └── repositories/D1TaskRepository.ts
├── presentation/
│   ├── handlers/TaskHandlers.ts
│   └── templates/
│       ├── layouts/base.ts
│       ├── pages/tasks.ts
│       └── partials/task-list.ts
├── index.ts
└── router.ts

public/
├── css/app.css
└── js/
    ├── htmx.min.js
    └── alpine.min.js

migrations/
└── 0001_initial.sql

tests/
├── setup.ts
└── fixtures/TaskBuilder.ts
```

### Running the Application

```bash
# Install dependencies
npm install

# Generate types
npm run types

# Build CSS
npm run css:build

# Apply migrations locally
npm run db:migrate:local

# Start development server
npm run dev

# Run tests
npm test

# Deploy
npm run deploy
```

---

## Best Practices and Patterns

### HTMX Patterns

**1. Use hx-boost for navigation**

```html
<a href="/tasks" hx-boost="true">Tasks</a>
```

Converts links to AJAX requests, swapping just the body.

**2. Out-of-band updates for multiple regions**

```html
<!-- Server response can update multiple areas -->
<div id="main-content">New main content</div>
<div id="sidebar" hx-swap-oob="true">Updated sidebar</div>
<div id="notifications" hx-swap-oob="beforeend">New notification</div>
```

**3. Loading states with htmx-indicator**

```html
<button hx-get="/app/_/data" class="btn">
  <span class="htmx-indicator">Loading...</span>
  <span class="[.htmx-request_&]:hidden">Load Data</span>
</button>
```

**4. Form reset after successful submission**

```html
<form hx-post="/app/_/items" hx-on::after-request="if(event.detail.successful) this.reset()"></form>
```

### Alpine.js Patterns

**1. Extract complex components to Alpine.data()**

```javascript
// In a script tag or separate file
Alpine.data('taskList', () => ({
  tasks: [],
  filter: '',

  get filteredTasks() {
    return this.tasks.filter((t) => t.title.toLowerCase().includes(this.filter.toLowerCase()));
  },

  addTask(task) {
    this.tasks.unshift(task);
  },
}));
```

```html
<div x-data="taskList">
  <input x-model="filter" />
  <template x-for="task in filteredTasks">
    <div x-text="task.title"></div>
  </template>
</div>
```

**2. Use x-init for setup logic**

```html
<div x-data="{ loaded: false }" x-init="$nextTick(() => loaded = true)">
  <div x-show="loaded" x-transition>Content</div>
</div>
```

**3. Custom events for cross-component communication**

```html
<!-- Dispatch -->
<button @click="$dispatch('task-added', { task: newTask })">Add</button>

<!-- Listen -->
<div @task-added.window="handleTaskAdded($event.detail.task)"></div>
```

### Domain-Driven Design Patterns

**1. Keep domain entities pure**

- No framework dependencies
- No async operations
- Validate invariants in constructors

**2. Use value objects for concepts**

```typescript
// Instead of: email: string
// Use:
class Email {
  constructor(value: string) {
    if (!this.isValid(value)) throw new Error('Invalid email');
    this._value = value;
  }
}
```

**3. Repository interface in domain, implementation in infrastructure**

```typescript
// domain/interfaces/TaskRepository.ts
export interface TaskRepository {
  findById(id: string): Promise<Task | null>;
  save(task: Task): Promise<void>;
}

// infrastructure/repositories/D1TaskRepository.ts
export class D1TaskRepository implements TaskRepository {
  // Implementation with D1
}
```

### Testing Patterns

**1. Acceptance tests define done**
Write acceptance tests first to specify the feature's user-visible behavior.

**2. Mock at architectural boundaries**
Mock repositories in use case tests, but use real infrastructure in integration tests.

**3. Use test builders for complex objects**

```typescript
const task = TaskBuilder.aTask().withTitle('Test').completed().build();
```

**4. One assertion per test (when practical)**
Multiple assertions are fine if they're testing one logical concept.

### Performance Patterns

**1. Use KV for frequently read data**

```typescript
// Cache expensive queries
const cached = await env.SESSIONS.get('popular-tasks');
if (cached) return JSON.parse(cached);

const tasks = await repository.findPopular();
await env.SESSIONS.put('popular-tasks', JSON.stringify(tasks), {
  expirationTtl: 300, // 5 minutes
});
```

**2. Return minimal HTML fragments**
Only return the HTML that needs to change, not entire page sections.

**3. Use hx-trigger appropriately**

```html
<!-- Debounce rapid inputs -->
<input hx-get="/search" hx-trigger="keyup changed delay:300ms" />

<!-- Lazy load below-fold content -->
<div hx-get="/more" hx-trigger="revealed"></div>
```

---

## Conclusion

This guide presents a complete approach to building interactive web applications on Cloudflare's edge platform. The combination of HTMX, Alpine.js, TailwindCSS 4, DaisyUI 5, and TypeScript Workers offers a compelling alternative to heavy JavaScript frameworks, with several key advantages:

1. **Simplicity**: Server-rendered HTML with progressive enhancement is easier to reason about than complex client-side state management.

2. **Performance**: Edge execution, minimal JavaScript, and HTML-over-the-wire deliver exceptional user experiences.

3. **Testability**: GOOS/TDD principles guide the design, resulting in well-tested, maintainable code.

4. **Type Safety**: TypeScript throughout provides compile-time guarantees and excellent tooling.

5. **Clean Architecture**: Domain-driven design keeps business logic separate from infrastructure concerns.

The patterns and practices in this guide provide a solid foundation for building production applications. As your application grows, the clean architecture ensures you can evolve individual layers without affecting others, and the comprehensive test suite gives you confidence to refactor.

---

_This guide reflects best practices as of January 2026. For the latest documentation, consult the official Cloudflare, HTMX, Alpine.js, TailwindCSS, and DaisyUI documentation._
