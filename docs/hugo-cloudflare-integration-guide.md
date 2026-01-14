# Comprehensive Guide: Hugo Static Sites with Dynamic Cloudflare Workers

**Building Modern Hybrid Applications with Hugo, Cloudflare Pages, and TypeScript Workers**

_Combining Static Site Generation with Edge-Powered Dynamic Endpoints Using Domain-Driven Design, Clean Architecture, and GOOS/TDD Testing Principles_

---

## Table of Contents

1. [Introduction](#introduction)
2. [Architecture Overview](#architecture-overview)
3. [Project Structure](#project-structure)
4. [Setting Up the Development Environment](#setting-up-the-development-environment)
5. [Hugo Configuration and Content](#hugo-configuration-and-content)
6. [Frontend Interactivity: HTMX and Alpine.js](#frontend-interactivity)
7. [Cloudflare Pages Functions](#cloudflare-pages-functions)
8. [Data Layer: D1 and KV](#data-layer)
9. [Domain-Driven Design and Clean Architecture](#domain-driven-design)
10. [Testing with GOOS/TDD Principles](#testing-with-goos-tdd)
11. [Deployment and Operations](#deployment-and-operations)
12. [Complete Example Application](#complete-example-application)
13. [Best Practices and Patterns](#best-practices-and-patterns)

---

## Introduction

This guide presents a modern approach to building hybrid web applications that combine Hugo's powerful static site generation with Cloudflare's edge computing platform. The result is a site that delivers static content at CDN speeds while supporting dynamic functionality through serverless Workers.

### Why Hugo + Cloudflare Pages + Workers?

This architecture offers compelling advantages over both traditional server-rendered applications and pure JavaScript SPAs:

**Static-First Performance**: Hugo pre-renders pages at build time, resulting in instant page loads from Cloudflare's global CDN. Static HTML requires no server processing and caches indefinitely at edge locations worldwide.

**Dynamic When Needed**: Cloudflare Pages Functions (built on Workers) run at the edge to handle forms, API calls, authentication, and any server-side logic. You get the benefits of static sites without sacrificing interactivity.

**Content Management Excellence**: Hugo's content-centric architecture with Markdown files, front matter, taxonomies, and templating provides an exceptional authoring experience. Content lives in version control, enabling collaborative workflows.

**Progressive Enhancement**: HTMX and Alpine.js layer interactivity onto static HTML without heavy JavaScript bundles. The site works without JavaScript, then enhances progressively.

**Edge-First Architecture**: Both static assets and dynamic functions run at the edge. D1 (SQLite at the edge) and KV (distributed key-value storage) complete the picture for data persistence.

### Technology Stack Summary

| Layer                | Technology                               | Purpose                                    |
| -------------------- | ---------------------------------------- | ------------------------------------------ |
| Static Generation    | Hugo                                     | Fast, flexible static site generator       |
| Styling              | TailwindCSS 4 + DaisyUI 5                | Utility-first CSS with semantic components |
| Server Communication | HTMX                                     | Hypermedia-driven interactions             |
| Client State         | Alpine.js                                | Lightweight reactivity for UI-only state   |
| Dynamic Endpoints    | Cloudflare Pages Functions               | Edge-based TypeScript execution            |
| Relational Data      | D1                                       | SQLite database at the edge                |
| Cache/Sessions       | KV                                       | Distributed key-value storage              |
| Static Hosting       | Cloudflare Pages                         | CDN-backed static file hosting             |
| Testing              | Vitest + @cloudflare/vitest-pool-workers | Runtime-accurate testing                   |

### When to Choose This Architecture

This stack excels for:

- Marketing sites with forms, search, and personalization
- Documentation sites with user authentication and feedback
- Blogs with comments, likes, and user-generated content
- E-commerce product catalogs with dynamic cart and checkout
- Portfolio sites with contact forms and analytics
- Any content-heavy site requiring selective dynamic functionality

---

## Quick Start

This guide shows how to build hybrid applications combining Hugo's static site generation with Cloudflare's edge computing. You'll learn to configure Hugo with TailwindCSS 4 and DaisyUI 5, layer HTMX and Alpine.js for progressive enhancement, implement Cloudflare Pages Functions for dynamic endpoints, integrate D1 and KV for data persistence, and apply Domain-Driven Design with Clean Architecture for maintainable TypeScript backends—all while following GOOS/TDD testing principles for confidence in edge deployments.

### Minimal Example: Hugo Site with Dynamic Form

```bash
# Create Hugo site with Cloudflare Pages Functions
hugo new site my-site && cd my-site
mkdir -p functions/api

# Static page with form (content/contact.md)
---
title: Contact Us
---
<form hx-post="/api/contact" hx-target="#result">
  <input type="email" name="email" required>
  <textarea name="message" required></textarea>
  <button type="submit">Send</button>
</form>
<div id="result"></div>

# Dynamic endpoint (functions/api/contact.ts)
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const formData = await context.request.formData();
  const email = formData.get('email') as string;

  // Store in D1
  await context.env.DB.prepare(
    'INSERT INTO messages (email, message, created_at) VALUES (?, ?, ?)'
  ).bind(email, formData.get('message'), new Date().toISOString()).run();

  return new Response('<div class="alert success">Message received!</div>', {
    headers: { 'Content-Type': 'text/html' }
  });
};
```

**Learn more**:

- [Hugo Configuration and Content](#hugo-configuration-and-content) - Setting up static generation
- [Frontend Interactivity](#frontend-interactivity) - HTMX and Alpine.js patterns
- [Cloudflare Pages Functions](#cloudflare-pages-functions) - TypeScript edge endpoints
- [Domain-Driven Design](#domain-driven-design) - Clean Architecture for complex logic

---

## Architecture Overview

### The Hybrid Model

Traditional static sites are limited to pre-rendered content. SPAs ship heavy JavaScript bundles and require complex state management. This hybrid approach takes the best of both:

```
Static Content (Hugo → Cloudflare Pages CDN):
┌─────────────────────────────────────────────────────────────────┐
│  • HTML pages pre-rendered at build time                        │
│  • CSS, JS, images served from global CDN                       │
│  • Instant load times, SEO-friendly, works offline              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTMX requests for dynamic features
                              ▼
Dynamic Endpoints (Cloudflare Pages Functions):
┌─────────────────────────────────────────────────────────────────┐
│  • Form submissions and validation                               │
│  • Search and filtering                                          │
│  • User authentication and sessions                              │
│  • Comments, likes, user-generated content                       │
│  • API integrations (payments, email, etc.)                     │
└─────────────────────────────────────────────────────────────────┘
```

### Request Flow

```
User Request
     │
     ▼
┌─────────────────────────────────────────┐
│         Cloudflare Edge Network          │
├─────────────────────────────────────────┤
│                                          │
│  Is this a /functions/* route?           │
│  ├─ YES → Execute Pages Function         │
│  │        (TypeScript Worker)            │
│  │        ├─ Access D1 database          │
│  │        ├─ Access KV storage           │
│  │        └─ Return HTML fragment/JSON   │
│  │                                       │
│  └─ NO → Serve static asset from CDN     │
│          (Hugo-generated HTML/CSS/JS)    │
│                                          │
└─────────────────────────────────────────┘
     │
     ▼
User receives response (typically <50ms globally)
```

### Clean Architecture Layers

Even in a hybrid static/dynamic architecture, Clean Architecture principles apply to the dynamic portions:

```
┌─────────────────────────────────────────────────────────────────┐
│                    Presentation Layer                            │
│   Static: Hugo templates with HTMX/Alpine.js integration        │
│   Dynamic: Pages Functions returning HTML partials              │
├─────────────────────────────────────────────────────────────────┤
│                    Application Layer                             │
│   Use Cases, DTOs, Request/Response mapping                     │
├─────────────────────────────────────────────────────────────────┤
│                      Domain Layer                                │
│   Entities, Value Objects, Domain Services, Interfaces          │
├─────────────────────────────────────────────────────────────────┤
│                   Infrastructure Layer                           │
│   D1 Repositories, KV Cache, External API clients               │
└─────────────────────────────────────────────────────────────────┘
```

---

## Project Structure

### Recommended Directory Layout

```
project-root/
├── hugo/                          # Hugo static site source
│   ├── archetypes/                # Content templates
│   ├── assets/                    # Assets processed by Hugo
│   │   └── css/
│   │       └── main.css           # TailwindCSS source
│   ├── content/                   # Markdown content
│   │   ├── _index.md
│   │   ├── blog/
│   │   │   ├── _index.md
│   │   │   └── first-post.md
│   │   └── about.md
│   ├── data/                      # Data files (YAML, JSON, TOML)
│   ├── layouts/                   # Hugo templates
│   │   ├── _default/
│   │   │   ├── baseof.html
│   │   │   ├── list.html
│   │   │   └── single.html
│   │   ├── partials/
│   │   │   ├── head.html
│   │   │   ├── header.html
│   │   │   ├── footer.html
│   │   │   ├── htmx/              # HTMX-specific partials
│   │   │   │   ├── contact-form.html
│   │   │   │   ├── comment-list.html
│   │   │   │   └── search-results.html
│   │   │   └── alpine/            # Alpine.js components
│   │   │       ├── dropdown.html
│   │   │       └── modal.html
│   │   ├── blog/
│   │   │   ├── list.html
│   │   │   └── single.html
│   │   └── shortcodes/
│   │       ├── contact-form.html
│   │       └── comment-section.html
│   ├── static/                    # Static files (copied as-is)
│   │   ├── js/
│   │   │   ├── htmx.min.js
│   │   │   └── alpine.min.js
│   │   └── images/
│   └── hugo.toml                  # Hugo configuration
│
├── functions/                     # Cloudflare Pages Functions
│   ├── api/                       # /api/* routes
│   │   ├── contact.ts             # POST /api/contact
│   │   ├── comments/
│   │   │   ├── index.ts           # GET/POST /api/comments
│   │   │   └── [id].ts            # GET/DELETE /api/comments/:id
│   │   ├── search.ts              # GET /api/search
│   │   └── newsletter.ts          # POST /api/newsletter
│   └── _middleware.ts             # Middleware for all routes
│
├── src/                           # Shared TypeScript source
│   ├── domain/                    # Pure business logic
│   │   ├── entities/
│   │   │   ├── Comment.ts
│   │   │   └── Comment.spec.ts
│   │   ├── value-objects/
│   │   │   ├── Email.ts
│   │   │   └── Email.spec.ts
│   │   └── interfaces/
│   │       └── CommentRepository.ts
│   │
│   ├── application/               # Use cases
│   │   ├── use-cases/
│   │   │   ├── SubmitComment.ts
│   │   │   └── SubmitComment.spec.ts
│   │   └── dto/
│   │       ├── CommentRequest.ts
│   │       └── CommentResponse.ts
│   │
│   ├── infrastructure/            # External concerns
│   │   ├── repositories/
│   │   │   ├── D1CommentRepository.ts
│   │   │   └── D1CommentRepository.integration.test.ts
│   │   ├── cache/
│   │   │   └── KVSessionStore.ts
│   │   └── templates/             # HTML templates for partials
│   │       ├── comment-item.ts
│   │       └── contact-success.ts
│   │
│   └── shared/                    # Shared utilities
│       ├── escape.ts
│       └── validation.ts
│
├── tests/
│   ├── setup.ts
│   ├── fixtures/
│   │   └── CommentBuilder.ts
│   └── acceptance/
│       └── comments.acceptance.test.ts
│
├── migrations/                    # D1 database migrations
│   ├── 0001_initial.sql
│   └── 0002_add_comments.sql
│
├── dist/                          # Hugo build output (gitignored)
│
├── wrangler.toml                  # Cloudflare configuration
├── vitest.config.ts               # Test configuration
├── tailwind.config.ts             # TailwindCSS configuration
├── package.json
└── tsconfig.json
```

### Key Principles of This Structure

1. **Separation of Concerns**: Hugo handles static content generation; `functions/` handles dynamic endpoints; `src/` contains shared domain logic.

2. **Hugo-First Organization**: The `hugo/` directory is a complete Hugo project that can be developed and previewed independently.

3. **Functions Mirror URL Structure**: Files in `functions/` directly map to URL paths, following Cloudflare Pages conventions.

4. **Domain Independence**: The `src/domain/` folder has zero dependencies on Cloudflare, Hugo, or any framework.

5. **Test Colocation**: Unit tests live next to implementation files; integration and acceptance tests have dedicated directories.

---

## Setting Up the Development Environment

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm or pnpm

All other dependencies, including Hugo, Wrangler, and build tools, are installed via npm as project dependencies.

### Project Initialization

```bash
# Create project directory
mkdir my-hugo-app && cd my-hugo-app

# Initialize npm project
npm init -y

# Install Hugo via npm (extended version for TailwindCSS support)
npm install -D hugo-bin

# Install Cloudflare and testing dependencies
npm install -D wrangler @cloudflare/workers-types vitest @cloudflare/vitest-pool-workers

# Install frontend build dependencies
npm install -D tailwindcss @tailwindcss/cli daisyui

# Install TypeScript
npm install -D typescript
```

### Configure Hugo Extended Version

Add the following to your `package.json` to ensure Hugo uses the extended version (required for TailwindCSS/PostCSS support):

```json
{
  "hugo-bin": {
    "buildTags": "extended"
  }
}
```

### Create Hugo Site Structure

```bash
# Create Hugo site
npx hugo new site hugo --format toml

# Download HTMX and Alpine.js
mkdir -p hugo/static/js
curl -o hugo/static/js/htmx.min.js https://unpkg.com/htmx.org@2.0/dist/htmx.min.js
curl -o hugo/static/js/alpine.min.js https://unpkg.com/alpinejs@3/dist/cdn.min.js
```

### Wrangler Configuration

Create `wrangler.toml`:

```toml
name = "my-hugo-app"
compatibility_date = "2025-01-01"
compatibility_flags = ["nodejs_compat"]

# Pages configuration
pages_build_output_dir = "dist"

# Enable observability
[observability]
enabled = true

# D1 Database binding
[[d1_databases]]
binding = "DB"
database_name = "my-hugo-app-db"
database_id = "your-database-id"

# KV Namespace binding
[[kv_namespaces]]
binding = "SESSIONS"
id = "your-kv-namespace-id"

# Environment variables
[vars]
ENVIRONMENT = "development"
```

### TypeScript Configuration

Create `tsconfig.json`:

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
      "@infrastructure/*": ["src/infrastructure/*"]
    }
  },
  "include": ["src/**/*", "functions/**/*", "tests/**/*"],
  "exclude": ["node_modules", "dist", "hugo"]
}
```

### Hugo Configuration

Update `hugo/hugo.toml`:

```toml
baseURL = 'https://example.com/'
languageCode = 'en-us'
title = 'My Hugo App'

# Build settings
[build]
  writeStats = true

# Asset processing
[module]
  [[module.mounts]]
    source = "assets"
    target = "assets"
  [[module.mounts]]
    source = "static"
    target = "static"

# Markup settings
[markup]
  [markup.goldmark]
    [markup.goldmark.renderer]
      unsafe = true  # Allow raw HTML in markdown

# Custom parameters
[params]
  description = "A Hugo site with dynamic Cloudflare Workers endpoints"

  # Dynamic endpoints for HTMX (served by Worker under /app/_/)
  [params.api]
    contact = "/app/_/contact"
    comments = "/app/_/comments"
    search = "/app/_/search"
    newsletter = "/app/_/newsletter"
```

### Package Scripts

Add to `package.json`:

```json
{
  "hugo-bin": {
    "buildTags": "extended"
  },
  "scripts": {
    "dev": "npm run dev:all",
    "dev:hugo": "cd hugo && npx hugo server --buildDrafts",
    "dev:functions": "npx wrangler pages dev dist --live-reload",
    "dev:all": "npm run build:hugo && npx wrangler pages dev dist --live-reload",
    "build": "npm run build:css && npm run build:hugo",
    "build:hugo": "cd hugo && npx hugo --minify -d ../dist",
    "build:css": "npx @tailwindcss/cli -i ./hugo/assets/css/main.css -o ./hugo/static/css/app.css --minify",
    "deploy": "npm run build && npx wrangler pages deploy dist",
    "test": "vitest",
    "test:run": "vitest run",
    "test:unit": "vitest run --testPathPattern='\\.spec\\.ts$'",
    "test:integration": "vitest run --testPathPattern='\\.integration\\.test\\.ts$'",
    "test:acceptance": "vitest run --testPathPattern='\\.acceptance\\.test\\.ts$'",
    "types": "npx wrangler types",
    "db:create": "npx wrangler d1 create my-hugo-app-db",
    "db:migrate": "npx wrangler d1 migrations apply my-hugo-app-db",
    "db:migrate:local": "npx wrangler d1 migrations apply my-hugo-app-db --local"
  }
}
```

> **Note:** Using `npx` ensures commands use the locally installed versions from `node_modules`, making the project self-contained and reproducible across different machines.

### TailwindCSS Configuration

Create `hugo/assets/css/main.css`:

```css
@import 'tailwindcss';
@plugin "daisyui";

/* Configure DaisyUI themes */
@plugin "daisyui" {
  themes:
    light --default,
    dark --prefersdark;
}

/* HTMX loading indicators */
@layer utilities {
  .htmx-indicator {
    opacity: 0;
    transition: opacity 200ms ease-in;
  }

  .htmx-request .htmx-indicator,
  .htmx-request.htmx-indicator {
    opacity: 1;
  }

  .htmx-request.htmx-indicator ~ * {
    opacity: 0.5;
  }
}
```

Create `tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss';
import daisyui from 'daisyui';

export default {
  content: ['./hugo/layouts/**/*.html', './hugo/content/**/*.md', './src/**/*.ts'],
  theme: {
    extend: {},
  },
  plugins: [daisyui],
  daisyui: {
    themes: ['light', 'dark'],
  },
} satisfies Config;
```

---

## Hugo Configuration and Content

### Base Template with HTMX and Alpine.js

Create `hugo/layouts/_default/baseof.html`:

```html
<!DOCTYPE html>
<html lang="{{ .Site.LanguageCode }}" data-theme="light">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{{ block "title" . }}{{ .Title }} | {{ .Site.Title }}{{ end }}</title>
    <meta
      name="description"
      content="{{ with .Description }}{{ . }}{{ else }}{{ .Site.Params.description }}{{ end }}"
    />

    <!-- Styles -->
    <link rel="stylesheet" href="/css/app.css" />

    <!-- HTMX -->
    <script src="/js/htmx.min.js" defer></script>

    <!-- Alpine.js -->
    <script defer src="/js/alpine.min.js"></script>

    <!-- HTMX Configuration -->
    <meta
      name="htmx-config"
      content='{"defaultSwapStyle":"innerHTML","globalViewTransitions":true}'
    />

    {{ block "head" . }}{{ end }}
  </head>
  <body class="min-h-screen bg-base-200" hx-boost="true" hx-ext="loading-states">
    {{ partial "header.html" . }}

    <main class="container mx-auto px-4 py-8">{{ block "main" . }}{{ end }}</main>

    {{ partial "footer.html" . }}

    <!-- Toast notifications container -->
    {{ partial "toast-container.html" . }} {{ block "scripts" . }}{{ end }}
  </body>
</html>
```

### Header Partial

Create `hugo/layouts/partials/header.html`:

```html
<nav class="navbar bg-base-100 shadow-lg sticky top-0 z-50">
  <div class="container mx-auto">
    <div class="flex-1">
      <a href="/" class="btn btn-ghost text-xl">{{ .Site.Title }}</a>
    </div>
    <div class="flex-none">
      <ul class="menu menu-horizontal px-1">
        {{ range .Site.Menus.main }}
        <li>
          <a href="{{ .URL }}" class="{{ if $.IsMenuCurrent `main` . }}active{{ end }}">
            {{ .Name }}
          </a>
        </li>
        {{ end }}
      </ul>

      <!-- Search button with Alpine.js modal -->
      <div x-data="{ open: false }">
        <button @click="open = true" class="btn btn-ghost btn-circle">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>

        <!-- Search modal -->
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
            <h3 class="font-bold text-lg mb-4">Search</h3>
            <input
              type="search"
              name="q"
              placeholder="Search..."
              class="input input-bordered w-full"
              hx-get="{{ .Site.Params.api.search }}"
              hx-trigger="keyup changed delay:300ms"
              hx-target="#search-results"
              autofocus
            />
            <div id="search-results" class="mt-4">
              <!-- Results loaded via HTMX -->
            </div>
            <div class="modal-action">
              <button class="btn" @click="open = false">Close</button>
            </div>
          </div>
          <div class="modal-backdrop" @click="open = false"></div>
        </div>
      </div>
    </div>
  </div>
</nav>
```

### Toast Container for Notifications

Create `hugo/layouts/partials/toast-container.html`:

```html
<div
  id="toast-container"
  class="toast toast-end z-50"
  x-data="{ 
       toasts: [],
       addToast(message, type = 'info') {
         const id = Date.now();
         this.toasts.push({ id, message, type });
         setTimeout(() => {
           this.toasts = this.toasts.filter(t => t.id !== id);
         }, 5000);
       }
     }"
  @notify.window="addToast($event.detail.message, $event.detail.type)"
  @htmx:after-request.window="
       if ($event.detail.xhr.getResponseHeader('HX-Trigger')) {
         try {
           const trigger = JSON.parse($event.detail.xhr.getResponseHeader('HX-Trigger'));
           if (trigger.notify) addToast(trigger.notify.message, trigger.notify.type);
         } catch(e) {}
       }
     "
>
  <template x-for="toast in toasts" :key="toast.id">
    <div
      class="alert"
      :class="{
           'alert-success': toast.type === 'success',
           'alert-error': toast.type === 'error',
           'alert-warning': toast.type === 'warning',
           'alert-info': toast.type === 'info'
         }"
      x-transition:enter="transition ease-out duration-300"
      x-transition:enter-start="opacity-0 translate-x-8"
      x-transition:enter-end="opacity-100 translate-x-0"
      x-transition:leave="transition ease-in duration-200"
      x-transition:leave-start="opacity-100"
      x-transition:leave-end="opacity-0"
    >
      <span x-text="toast.message"></span>
      <button class="btn btn-ghost btn-xs" @click="toasts = toasts.filter(t => t.id !== toast.id)">
        ✕
      </button>
    </div>
  </template>
</div>
```

### Blog Single Template with Comments

Create `hugo/layouts/blog/single.html`:

```html
{{ define "main" }}
<article class="prose prose-lg max-w-4xl mx-auto">
  <header class="mb-8">
    <h1 class="text-4xl font-bold mb-2">{{ .Title }}</h1>
    <div class="flex gap-4 text-base-content/70">
      <time datetime="{{ .Date.Format "2006-01-02" }}">
        {{ .Date.Format "January 2, 2006" }}
      </time>
      <span>·</span>
      <span>{{ .ReadingTime }} min read</span>
    </div>
    {{ with .Params.tags }}
    <div class="flex gap-2 mt-4">
      {{ range . }}
      <a href="/tags/{{ . | urlize }}" class="badge badge-primary">{{ . }}</a>
      {{ end }}
    </div>
    {{ end }}
  </header>

  <div class="content">
    {{ .Content }}
  </div>
</article>

<!-- Comments Section -->
<section class="max-w-4xl mx-auto mt-16">
  <h2 class="text-2xl font-bold mb-8">Comments</h2>

  <!-- Comment Form -->
  <div class="card bg-base-100 shadow mb-8">
    <div class="card-body">
      <form hx-post="{{ .Site.Params.api.comments }}"
            hx-target="#comment-list"
            hx-swap="afterbegin"
            hx-on::after-request="if(event.detail.successful) this.reset()"
            x-data="{
              name: '',
              email: '',
              content: '',
              submitting: false,
              errors: {}
            }"
            @htmx:before-request="submitting = true; errors = {}"
            @htmx:after-request="submitting = false"
            class="space-y-4">

        <!-- Hidden post ID -->
        <input type="hidden" name="postId" value="{{ .File.UniqueID }}">

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">Name</span>
            </label>
            <input type="text"
                   name="name"
                   x-model="name"
                   class="input input-bordered"
                   :class="{ 'input-error': errors.name }"
                   required
                   minlength="2"
                   :disabled="submitting">
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">Email</span>
            </label>
            <input type="email"
                   name="email"
                   x-model="email"
                   class="input input-bordered"
                   :class="{ 'input-error': errors.email }"
                   required
                   :disabled="submitting">
          </div>
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text">Comment</span>
          </label>
          <textarea name="content"
                    x-model="content"
                    class="textarea textarea-bordered h-32"
                    :class="{ 'input-error': errors.content }"
                    required
                    minlength="10"
                    :disabled="submitting"></textarea>
        </div>

        <button type="submit"
                class="btn btn-primary"
                :disabled="submitting || !name || !email || content.length < 10">
          <span x-show="!submitting">Post Comment</span>
          <span x-show="submitting" class="loading loading-spinner loading-sm"></span>
        </button>
      </form>
    </div>
  </div>

  <!-- Comment List (loaded via HTMX on page load) -->
  <div id="comment-list"
       hx-get="{{ .Site.Params.api.comments }}?postId={{ .File.UniqueID }}"
       hx-trigger="load"
       hx-swap="innerHTML">
    <div class="flex justify-center py-8">
      <span class="loading loading-spinner loading-lg"></span>
    </div>
  </div>
</section>
{{ end }}
```

### Contact Form Shortcode

Create `hugo/layouts/shortcodes/contact-form.html`:

```html
<div class="card bg-base-100 shadow-xl max-w-2xl mx-auto">
  <div class="card-body">
    <h2 class="card-title text-2xl mb-4">Get in Touch</h2>

    <form
      hx-post="{{ .Site.Params.api.contact }}"
      hx-target="#contact-response"
      hx-swap="innerHTML"
      hx-indicator="#contact-spinner"
      x-data="{ 
            form: { name: '', email: '', subject: '', message: '' },
            submitting: false,
            validate() {
              return this.form.name.length >= 2 && 
                     this.form.email.includes('@') && 
                     this.form.message.length >= 10;
            }
          }"
      @htmx:before-request="submitting = true"
      @htmx:after-request="submitting = false; if(event.detail.successful) form = { name: '', email: '', subject: '', message: '' }"
      class="space-y-4"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="form-control">
          <label class="label">
            <span class="label-text">Your Name *</span>
          </label>
          <input
            type="text"
            name="name"
            x-model="form.name"
            placeholder="John Doe"
            class="input input-bordered"
            required
            minlength="2"
            :disabled="submitting"
          />
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text">Email Address *</span>
          </label>
          <input
            type="email"
            name="email"
            x-model="form.email"
            placeholder="john@example.com"
            class="input input-bordered"
            required
            :disabled="submitting"
          />
        </div>
      </div>

      <div class="form-control">
        <label class="label">
          <span class="label-text">Subject</span>
        </label>
        <input
          type="text"
          name="subject"
          x-model="form.subject"
          placeholder="How can we help?"
          class="input input-bordered"
          :disabled="submitting"
        />
      </div>

      <div class="form-control">
        <label class="label">
          <span class="label-text">Message *</span>
        </label>
        <textarea
          name="message"
          x-model="form.message"
          placeholder="Tell us more..."
          class="textarea textarea-bordered h-40"
          required
          minlength="10"
          :disabled="submitting"
        ></textarea>
        <label class="label">
          <span
            class="label-text-alt"
            x-text="form.message.length + '/10 characters minimum'"
          ></span>
        </label>
      </div>

      <div class="flex items-center gap-4">
        <button type="submit" class="btn btn-primary" :disabled="submitting || !validate()">
          <span x-show="!submitting">Send Message</span>
          <span x-show="submitting" class="loading loading-spinner loading-sm"></span>
        </button>
        <span id="contact-spinner" class="loading loading-spinner htmx-indicator"></span>
      </div>
    </form>

    <!-- Response container -->
    <div id="contact-response" class="mt-4"></div>
  </div>
</div>
```

### Newsletter Signup Partial

Create `hugo/layouts/partials/newsletter.html`:

```html
<div class="bg-primary text-primary-content py-12">
  <div class="container mx-auto px-4">
    <div class="max-w-2xl mx-auto text-center">
      <h2 class="text-3xl font-bold mb-4">Subscribe to Our Newsletter</h2>
      <p class="mb-6 opacity-90">Get the latest updates delivered to your inbox.</p>

      <form
        hx-post="{{ .Site.Params.api.newsletter }}"
        hx-target="#newsletter-response"
        hx-swap="innerHTML"
        x-data="{ email: '', submitting: false, subscribed: false }"
        @htmx:before-request="submitting = true"
        @htmx:after-request="submitting = false"
        @htmx:after-swap="if($event.detail.successful) { subscribed = true; email = '' }"
        class="flex flex-col sm:flex-row gap-4 justify-center"
        x-show="!subscribed"
      >
        <input
          type="email"
          name="email"
          x-model="email"
          placeholder="your@email.com"
          class="input input-bordered flex-1 max-w-md"
          required
          :disabled="submitting"
        />

        <button
          type="submit"
          class="btn btn-secondary"
          :disabled="submitting || !email.includes('@')"
        >
          <span x-show="!submitting">Subscribe</span>
          <span x-show="submitting" class="loading loading-spinner loading-sm"></span>
        </button>
      </form>

      <div id="newsletter-response" class="mt-4"></div>

      <div x-show="subscribed" x-transition class="alert alert-success max-w-md mx-auto">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="stroke-current shrink-0 h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>Thanks for subscribing!</span>
      </div>
    </div>
  </div>
</div>
```

---

## Frontend Interactivity

### HTMX Patterns for Hugo Sites

#### Pattern 1: Infinite Scroll for Blog Lists

In `hugo/layouts/blog/list.html`:

```html
{{ define "main" }}
<div class="max-w-4xl mx-auto">
  <h1 class="text-4xl font-bold mb-8">{{ .Title }}</h1>

  <div id="post-list" class="space-y-8">
    {{ range first 10 .Pages }} {{ partial "blog/card.html" . }} {{ end }}
  </div>

  {{ if gt (len .Pages) 10 }}
  <div id="load-more" class="py-8 text-center">
    <button
      hx-get="/api/posts?page=2"
      hx-target="#post-list"
      hx-swap="beforeend"
      hx-indicator="#load-spinner"
      class="btn btn-outline"
    >
      Load More
      <span id="load-spinner" class="loading loading-spinner loading-sm htmx-indicator"></span>
    </button>
  </div>
  {{ end }}
</div>
{{ end }}
```

#### Pattern 2: Live Search

```html
<div x-data="{ query: '', hasResults: false }" class="relative">
  <input
    type="search"
    x-model="query"
    name="q"
    placeholder="Search articles..."
    class="input input-bordered w-full"
    hx-get="{{ .Site.Params.api.search }}"
    hx-trigger="keyup changed delay:300ms, search"
    hx-target="#search-results"
    hx-indicator="#search-spinner"
    @htmx:after-swap="hasResults = document.querySelector('#search-results').innerHTML.trim().length > 0"
  />

  <span
    id="search-spinner"
    class="loading loading-spinner loading-sm absolute right-3 top-3 htmx-indicator"
  ></span>

  <div
    id="search-results"
    x-show="query.length > 0 && hasResults"
    x-transition
    class="absolute top-full left-0 right-0 mt-2 bg-base-100 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto"
  >
    <!-- Results injected by HTMX -->
  </div>
</div>
```

#### Pattern 3: Like/Vote Buttons

```html
<div
  x-data="{ liked: false, count: {{ .Params.likes | default 0 }} }"
  class="flex items-center gap-2"
>
  <button
    @click="liked = !liked; count += liked ? 1 : -1"
    hx-post="/app/_/posts/{{ .File.UniqueID }}/like"
    hx-swap="none"
    class="btn btn-ghost btn-circle"
    :class="{ 'text-red-500': liked }"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-6 w-6"
      :fill="liked ? 'currentColor' : 'none'"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      />
    </svg>
  </button>
  <span x-text="count" class="font-medium"></span>
</div>
```

### Alpine.js Component Patterns

#### Pattern 1: Table of Contents with Active Section Tracking

```html
<aside
  x-data="{ 
  activeSection: '',
  init() {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.activeSection = entry.target.id;
          }
        });
      },
      { rootMargin: '-100px 0px -66%' }
    );
    
    document.querySelectorAll('article h2[id], article h3[id]').forEach(h => {
      observer.observe(h);
    });
  }
}"
  class="sticky top-24"
>
  <h4 class="font-bold mb-4">On This Page</h4>
  <nav>{{ .TableOfContents }}</nav>

  <style>
    /* Style active link based on Alpine state */
    [x-data] nav a {
      @apply block py-1 text-base-content/70 hover:text-base-content transition-colors;
    }
    [x-data] nav a.active {
      @apply text-primary font-medium;
    }
  </style>

  <script>
    // Add active class based on Alpine state
    document.addEventListener('alpine:init', () => {
      Alpine.effect(() => {
        const active = Alpine.store('activeSection');
        document.querySelectorAll('aside nav a').forEach((a) => {
          a.classList.toggle('active', a.getAttribute('href') === '#' + active);
        });
      });
    });
  </script>
</aside>
```

#### Pattern 2: Dark Mode Toggle

```html
<div
  x-data="{ 
  dark: localStorage.getItem('theme') === 'dark',
  toggle() {
    this.dark = !this.dark;
    localStorage.setItem('theme', this.dark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', this.dark ? 'dark' : 'light');
  }
}"
  x-init="document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')"
>
  <button @click="toggle()" class="btn btn-ghost btn-circle">
    <svg x-show="!dark" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
      />
    </svg>
    <svg x-show="dark" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  </button>
</div>
```

#### Pattern 3: Reading Progress Indicator

```html
<div
  x-data="{ progress: 0 }"
  x-init="
       window.addEventListener('scroll', () => {
         const article = document.querySelector('article');
         if (!article) return;
         const rect = article.getBoundingClientRect();
         const scrolled = -rect.top;
         const total = rect.height - window.innerHeight;
         progress = Math.min(100, Math.max(0, (scrolled / total) * 100));
       })
     "
  class="fixed top-0 left-0 right-0 h-1 bg-base-200 z-50"
>
  <div
    class="h-full bg-primary transition-all duration-150"
    :style="{ width: progress + '%' }"
  ></div>
</div>
```

---

## Cloudflare Pages Functions

### Environment Types

Create `functions/types.ts`:

```typescript
export interface Env {
  DB: D1Database;
  SESSIONS: KVNamespace;
  ENVIRONMENT: string;
}

export type PagesFunction<E = Env> = (
  context: EventContext<E, string, unknown>
) => Response | Promise<Response>;
```

### Middleware

Create `functions/_middleware.ts`:

```typescript
import type { Env, PagesFunction } from './types';

// CORS headers for development
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, HX-Request, HX-Current-URL',
};

// Security headers
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

export const onRequest: PagesFunction[] = [
  // CORS handling
  async ({ request, next }) => {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const response = await next();

    // Add headers to response
    Object.entries({ ...corsHeaders, ...securityHeaders }).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  },

  // Error handling
  async ({ next }) => {
    try {
      return await next();
    } catch (error) {
      console.error('Unhandled error:', error);

      const message = error instanceof Error ? error.message : 'Internal server error';

      return new Response(
        `<div class="alert alert-error"><span>${escapeHtml(message)}</span></div>`,
        {
          status: 500,
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        }
      );
    }
  },

  // Request logging
  async ({ request, next }) => {
    const start = Date.now();
    const response = await next();
    const duration = Date.now() - start;

    console.log(
      JSON.stringify({
        method: request.method,
        url: request.url,
        status: response.status,
        duration,
        htmx: request.headers.get('HX-Request') === 'true',
      })
    );

    return response;
  },
];

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

### Contact Form Handler

Create `functions/app/_/contact.ts`:

```typescript
import type { Env, PagesFunction } from '../../types';
import { Email } from '@domain/value-objects/Email';

interface ContactFormData {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const formData = await request.formData();

  const data: ContactFormData = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    subject: (formData.get('subject') as string) || 'No subject',
    message: formData.get('message') as string,
  };

  // Validation
  const errors: string[] = [];

  if (!data.name || data.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  }

  try {
    new Email(data.email);
  } catch {
    errors.push('Please enter a valid email address');
  }

  if (!data.message || data.message.trim().length < 10) {
    errors.push('Message must be at least 10 characters');
  }

  if (errors.length > 0) {
    return new Response(
      `<div class="alert alert-error">
        <ul class="list-disc list-inside">
          ${errors.map((e) => `<li>${escapeHtml(e)}</li>`).join('')}
        </ul>
      </div>`,
      {
        status: 400,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      }
    );
  }

  // Store in D1 (or send via external email service)
  await env.DB.prepare(
    `INSERT INTO contact_submissions (name, email, subject, message, created_at)
     VALUES (?, ?, ?, ?, datetime('now'))`
  )
    .bind(data.name, data.email, data.subject, data.message)
    .run();

  // Return success message
  return new Response(
    `<div class="alert alert-success">
      <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>Thank you, ${escapeHtml(data.name)}! We'll be in touch soon.</span>
    </div>`,
    {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'HX-Trigger': JSON.stringify({
          notify: { message: 'Message sent successfully!', type: 'success' },
        }),
      },
    }
  );
};

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

### Comments Handler

Create `functions/app/_/comments/index.ts`:

```typescript
import type { Env, PagesFunction } from '../../../types';
import { Comment } from '@domain/entities/Comment';
import { D1CommentRepository } from '@infrastructure/repositories/D1CommentRepository';
import { SubmitComment } from '@application/use-cases/SubmitComment';
import { commentItem, commentList } from '@infrastructure/templates/comment-item';

// GET /app/_/comments?postId=xxx
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const postId = url.searchParams.get('postId');

  if (!postId) {
    return new Response('Missing postId', { status: 400 });
  }

  const repository = new D1CommentRepository(env.DB);
  const comments = await repository.findByPostId(postId);

  if (comments.length === 0) {
    return new Response(
      `<div class="text-center py-8 text-base-content/60">
        <p>No comments yet. Be the first to share your thoughts!</p>
      </div>`,
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }

  return new Response(commentList(comments), {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
};

// POST /app/_/comments
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const formData = await request.formData();

  const data = {
    postId: formData.get('postId') as string,
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    content: formData.get('content') as string,
  };

  // Validation
  const errors: string[] = [];

  if (!data.postId) errors.push('Post ID is required');
  if (!data.name || data.name.length < 2) errors.push('Name must be at least 2 characters');
  if (!data.email || !data.email.includes('@')) errors.push('Valid email is required');
  if (!data.content || data.content.length < 10)
    errors.push('Comment must be at least 10 characters');

  if (errors.length > 0) {
    return new Response(
      `<div class="alert alert-error mb-4">
        <ul class="list-disc list-inside">
          ${errors.map((e) => `<li>${e}</li>`).join('')}
        </ul>
      </div>`,
      {
        status: 400,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      }
    );
  }

  const repository = new D1CommentRepository(env.DB);
  const useCase = new SubmitComment(repository);

  try {
    const comment = await useCase.execute(data);

    return new Response(commentItem(comment), {
      status: 201,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'HX-Trigger': JSON.stringify({
          notify: { message: 'Comment posted!', type: 'success' },
        }),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to post comment';
    return new Response(`<div class="alert alert-error mb-4">${message}</div>`, {
      status: 400,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }
};
```

### Search Handler

Create `functions/app/_/search.ts`:

```typescript
import type { Env, PagesFunction } from '../../types';

interface SearchResult {
  title: string;
  url: string;
  excerpt: string;
  date: string;
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const query = url.searchParams.get('q')?.trim().toLowerCase();

  if (!query || query.length < 2) {
    return new Response('', {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  // Search in D1 (assuming you have a search index table)
  const { results } = await env.DB.prepare(
    `
    SELECT title, url, excerpt, date 
    FROM search_index 
    WHERE title LIKE ? OR content LIKE ?
    ORDER BY date DESC
    LIMIT 10
  `
  )
    .bind(`%${query}%`, `%${query}%`)
    .all<SearchResult>();

  if (results.length === 0) {
    return new Response(
      `<div class="p-4 text-center text-base-content/60">
        No results found for "${escapeHtml(query)}"
      </div>`,
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }

  const html = `
    <ul class="divide-y divide-base-200">
      ${results
        .map(
          (result) => `
        <li>
          <a href="${escapeHtml(result.url)}" 
             class="block p-4 hover:bg-base-200 transition-colors">
            <h4 class="font-medium">${highlightQuery(result.title, query)}</h4>
            <p class="text-sm text-base-content/70 mt-1">
              ${highlightQuery(result.excerpt, query)}
            </p>
            <time class="text-xs text-base-content/50">${result.date}</time>
          </a>
        </li>
      `
        )
        .join('')}
    </ul>
  `;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
};

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

function highlightQuery(text: string, query: string): string {
  const escaped = escapeHtml(text);
  const regex = new RegExp(`(${query})`, 'gi');
  return escaped.replace(regex, '<mark class="bg-warning/30">$1</mark>');
}
```

### Newsletter Handler

Create `functions/app/_/newsletter.ts`:

```typescript
import type { Env, PagesFunction } from '../../types';
import { Email } from '@domain/value-objects/Email';

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const formData = await request.formData();
  const emailStr = formData.get('email') as string;

  // Validate email
  let email: Email;
  try {
    email = new Email(emailStr);
  } catch {
    return new Response(
      `<div class="alert alert-error max-w-md mx-auto">Please enter a valid email address.</div>`,
      {
        status: 400,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      }
    );
  }

  // Check for existing subscription
  const existing = await env.DB.prepare('SELECT id FROM newsletter_subscribers WHERE email = ?')
    .bind(email.value)
    .first();

  if (existing) {
    return new Response(
      `<div class="alert alert-info max-w-md mx-auto">You're already subscribed!</div>`,
      {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      }
    );
  }

  // Add subscriber
  await env.DB.prepare(
    `INSERT INTO newsletter_subscribers (email, subscribed_at)
     VALUES (?, datetime('now'))`
  )
    .bind(email.value)
    .run();

  return new Response(
    `<div class="alert alert-success max-w-md mx-auto">
      <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>Welcome aboard! Check your inbox for a confirmation.</span>
    </div>`,
    {
      status: 201,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'HX-Trigger': JSON.stringify({
          notify: { message: 'Successfully subscribed!', type: 'success' },
        }),
      },
    }
  );
};
```

---

## Data Layer

### D1 Database Schema

Create `migrations/0001_initial.sql`:

```sql
-- Contact form submissions
CREATE TABLE IF NOT EXISTS contact_submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  created_at TEXT NOT NULL,
  processed INTEGER DEFAULT 0
);

CREATE INDEX idx_contact_created ON contact_submissions(created_at);

-- Newsletter subscribers
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  subscribed_at TEXT NOT NULL,
  confirmed INTEGER DEFAULT 0,
  unsubscribed_at TEXT
);

CREATE INDEX idx_newsletter_email ON newsletter_subscribers(email);

-- Search index (populated during build)
CREATE TABLE IF NOT EXISTS search_index (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  excerpt TEXT,
  content TEXT,
  date TEXT,
  updated_at TEXT
);

CREATE INDEX idx_search_title ON search_index(title);
CREATE INDEX idx_search_date ON search_index(date);

-- Full-text search (SQLite FTS5)
CREATE VIRTUAL TABLE IF NOT EXISTS search_fts USING fts5(
  title,
  content,
  content='search_index',
  content_rowid='rowid'
);

-- Triggers to keep FTS in sync
CREATE TRIGGER search_ai AFTER INSERT ON search_index BEGIN
  INSERT INTO search_fts(rowid, title, content) VALUES (new.rowid, new.title, new.content);
END;

CREATE TRIGGER search_ad AFTER DELETE ON search_index BEGIN
  INSERT INTO search_fts(search_fts, rowid, title, content) VALUES('delete', old.rowid, old.title, old.content);
END;

CREATE TRIGGER search_au AFTER UPDATE ON search_index BEGIN
  INSERT INTO search_fts(search_fts, rowid, title, content) VALUES('delete', old.rowid, old.title, old.content);
  INSERT INTO search_fts(rowid, title, content) VALUES (new.rowid, new.title, new.content);
END;
```

Create `migrations/0002_add_comments.sql`:

```sql
-- Comments
CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  content TEXT NOT NULL,
  approved INTEGER DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE INDEX idx_comments_post ON comments(post_id);
CREATE INDEX idx_comments_approved ON comments(approved);
CREATE INDEX idx_comments_created ON comments(created_at);

-- Post likes
CREATE TABLE IF NOT EXISTS post_likes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id TEXT NOT NULL,
  ip_hash TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE(post_id, ip_hash)
);

CREATE INDEX idx_likes_post ON post_likes(post_id);
```

### Comment Repository

Create `src/infrastructure/repositories/D1CommentRepository.ts`:

```typescript
import type { CommentRepository } from '@domain/interfaces/CommentRepository';
import { Comment } from '@domain/entities/Comment';

interface CommentRow {
  id: string;
  post_id: string;
  name: string;
  email: string;
  content: string;
  approved: number;
  created_at: string;
}

export class D1CommentRepository implements CommentRepository {
  constructor(private db: D1Database) {}

  async findByPostId(postId: string): Promise<Comment[]> {
    const { results } = await this.db
      .prepare(
        `SELECT * FROM comments 
         WHERE post_id = ? AND approved = 1 
         ORDER BY created_at DESC`
      )
      .bind(postId)
      .all<CommentRow>();

    return results.map((row) => this.toDomain(row));
  }

  async findById(id: string): Promise<Comment | null> {
    const result = await this.db
      .prepare('SELECT * FROM comments WHERE id = ?')
      .bind(id)
      .first<CommentRow>();

    if (!result) return null;
    return this.toDomain(result);
  }

  async save(comment: Comment): Promise<void> {
    await this.db
      .prepare(
        `INSERT INTO comments (id, post_id, name, email, content, approved, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           content = excluded.content,
           approved = excluded.approved`
      )
      .bind(
        comment.id,
        comment.postId,
        comment.name,
        comment.email,
        comment.content,
        comment.isApproved ? 1 : 0,
        comment.createdAt.toISOString()
      )
      .run();
  }

  async delete(id: string): Promise<void> {
    await this.db.prepare('DELETE FROM comments WHERE id = ?').bind(id).run();
  }

  async countByPostId(postId: string): Promise<number> {
    const result = await this.db
      .prepare('SELECT COUNT(*) as count FROM comments WHERE post_id = ? AND approved = 1')
      .bind(postId)
      .first<{ count: number }>();

    return result?.count ?? 0;
  }

  private toDomain(row: CommentRow): Comment {
    return Comment.reconstitute({
      id: row.id,
      postId: row.post_id,
      name: row.name,
      email: row.email,
      content: row.content,
      approved: row.approved === 1,
      createdAt: new Date(row.created_at),
    });
  }
}
```

### KV for Sessions and Caching

Create `src/infrastructure/cache/KVCache.ts`:

```typescript
export class KVCache {
  constructor(private kv: KVNamespace) {}

  async get<T>(key: string): Promise<T | null> {
    const data = await this.kv.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const options = ttlSeconds ? { expirationTtl: ttlSeconds } : undefined;
    await this.kv.put(key, JSON.stringify(value), options);
  }

  async delete(key: string): Promise<void> {
    await this.kv.delete(key);
  }

  async getOrSet<T>(key: string, factory: () => Promise<T>, ttlSeconds?: number): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;

    const value = await factory();
    await this.set(key, value, ttlSeconds);
    return value;
  }
}

// Usage example in a handler:
// const cache = new KVCache(env.SESSIONS);
// const popularPosts = await cache.getOrSet(
//   'popular-posts',
//   () => repository.findPopular(),
//   300 // 5 minutes
// );
```

---

## Domain-Driven Design

### Comment Entity

Create `src/domain/entities/Comment.ts`:

```typescript
import { Email } from '../value-objects/Email';

export interface CommentProps {
  id: string;
  postId: string;
  name: string;
  email: string;
  content: string;
  approved: boolean;
  createdAt: Date;
}

export class Comment {
  private readonly _id: string;
  private readonly _postId: string;
  private readonly _name: string;
  private readonly _email: Email;
  private _content: string;
  private _approved: boolean;
  private readonly _createdAt: Date;

  private constructor(props: CommentProps) {
    this._id = props.id;
    this._postId = props.postId;
    this._name = props.name;
    this._email = new Email(props.email);
    this._content = props.content;
    this._approved = props.approved;
    this._createdAt = props.createdAt;
  }

  static create(props: { postId: string; name: string; email: string; content: string }): Comment {
    if (!props.name || props.name.trim().length < 2) {
      throw new Error('Name must be at least 2 characters');
    }

    if (!props.content || props.content.trim().length < 10) {
      throw new Error('Comment must be at least 10 characters');
    }

    return new Comment({
      id: crypto.randomUUID(),
      postId: props.postId,
      name: props.name.trim(),
      email: props.email,
      content: props.content.trim(),
      approved: false, // Comments require moderation by default
      createdAt: new Date(),
    });
  }

  static reconstitute(props: CommentProps): Comment {
    return new Comment(props);
  }

  get id(): string {
    return this._id;
  }

  get postId(): string {
    return this._postId;
  }

  get name(): string {
    return this._name;
  }

  get email(): string {
    return this._email.value;
  }

  get content(): string {
    return this._content;
  }

  get isApproved(): boolean {
    return this._approved;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  approve(): void {
    this._approved = true;
  }

  reject(): void {
    this._approved = false;
  }

  editContent(newContent: string): void {
    if (!newContent || newContent.trim().length < 10) {
      throw new Error('Comment must be at least 10 characters');
    }
    this._content = newContent.trim();
  }
}
```

### Email Value Object

Create `src/domain/value-objects/Email.ts`:

```typescript
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

### Repository Interface

Create `src/domain/interfaces/CommentRepository.ts`:

```typescript
import type { Comment } from '../entities/Comment';

export interface CommentRepository {
  findById(id: string): Promise<Comment | null>;
  findByPostId(postId: string): Promise<Comment[]>;
  save(comment: Comment): Promise<void>;
  delete(id: string): Promise<void>;
  countByPostId(postId: string): Promise<number>;
}
```

### Use Case

Create `src/application/use-cases/SubmitComment.ts`:

```typescript
import { Comment } from '@domain/entities/Comment';
import type { CommentRepository } from '@domain/interfaces/CommentRepository';

export interface SubmitCommentRequest {
  postId: string;
  name: string;
  email: string;
  content: string;
}

export interface CommentResponse {
  id: string;
  postId: string;
  name: string;
  content: string;
  createdAt: string;
}

export class SubmitComment {
  constructor(private commentRepository: CommentRepository) {}

  async execute(request: SubmitCommentRequest): Promise<CommentResponse> {
    const comment = Comment.create({
      postId: request.postId,
      name: request.name,
      email: request.email,
      content: request.content,
    });

    // Auto-approve for now (in production, implement moderation)
    comment.approve();

    await this.commentRepository.save(comment);

    return {
      id: comment.id,
      postId: comment.postId,
      name: comment.name,
      content: comment.content,
      createdAt: comment.createdAt.toISOString(),
    };
  }
}
```

---

## Testing with GOOS/TDD

### Vitest Configuration

Create `vitest.config.ts`:

```typescript
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
            configPath: './wrangler.toml',
          },
          miniflare: {
            d1Databases: {
              DB: {},
            },
            kvNamespaces: ['SESSIONS'],
            bindings: {
              MIGRATIONS: migrations,
            },
          },
          isolatedStorage: true,
        },
      },

      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        exclude: ['node_modules/', 'hugo/', '**/*.spec.ts', '**/*.test.ts'],
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

Create `tests/setup.ts`:

```typescript
import { env } from 'cloudflare:test';
import { applyD1Migrations } from '@cloudflare/vitest-pool-workers/config';
import { beforeAll, afterEach, vi } from 'vitest';

beforeAll(async () => {
  const migrations = env.MIGRATIONS as any[];
  await applyD1Migrations(env.DB, migrations);
});

afterEach(() => {
  vi.clearAllMocks();
});
```

### Domain Unit Tests

Create `src/domain/entities/Comment.spec.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { Comment } from './Comment';

describe('Comment', () => {
  describe('creation', () => {
    it('should create a comment with valid data', () => {
      const comment = Comment.create({
        postId: 'post-123',
        name: 'John Doe',
        email: 'john@example.com',
        content: 'This is a test comment with enough characters.',
      });

      expect(comment.name).toBe('John Doe');
      expect(comment.email).toBe('john@example.com');
      expect(comment.content).toBe('This is a test comment with enough characters.');
      expect(comment.isApproved).toBe(false);
      expect(comment.id).toBeDefined();
    });

    it('should trim name and content', () => {
      const comment = Comment.create({
        postId: 'post-123',
        name: '  John Doe  ',
        email: 'john@example.com',
        content: '  This is a trimmed comment.  ',
      });

      expect(comment.name).toBe('John Doe');
      expect(comment.content).toBe('This is a trimmed comment.');
    });

    it('should reject names shorter than 2 characters', () => {
      expect(() =>
        Comment.create({
          postId: 'post-123',
          name: 'J',
          email: 'john@example.com',
          content: 'Valid comment content here.',
        })
      ).toThrow('Name must be at least 2 characters');
    });

    it('should reject content shorter than 10 characters', () => {
      expect(() =>
        Comment.create({
          postId: 'post-123',
          name: 'John',
          email: 'john@example.com',
          content: 'Short',
        })
      ).toThrow('Comment must be at least 10 characters');
    });

    it('should reject invalid email', () => {
      expect(() =>
        Comment.create({
          postId: 'post-123',
          name: 'John',
          email: 'invalid-email',
          content: 'Valid comment content here.',
        })
      ).toThrow('Invalid email address');
    });
  });

  describe('moderation', () => {
    it('should approve a comment', () => {
      const comment = Comment.create({
        postId: 'post-123',
        name: 'John',
        email: 'john@example.com',
        content: 'Valid comment content.',
      });

      expect(comment.isApproved).toBe(false);
      comment.approve();
      expect(comment.isApproved).toBe(true);
    });

    it('should reject a comment', () => {
      const comment = Comment.create({
        postId: 'post-123',
        name: 'John',
        email: 'john@example.com',
        content: 'Valid comment content.',
      });

      comment.approve();
      comment.reject();
      expect(comment.isApproved).toBe(false);
    });
  });
});
```

### Integration Tests

Create `src/infrastructure/repositories/D1CommentRepository.integration.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { env } from 'cloudflare:test';
import { D1CommentRepository } from './D1CommentRepository';
import { Comment } from '@domain/entities/Comment';

describe('D1CommentRepository', () => {
  let repository: D1CommentRepository;

  beforeEach(() => {
    repository = new D1CommentRepository(env.DB);
  });

  describe('save and findById', () => {
    it('should persist and retrieve a comment', async () => {
      const comment = Comment.create({
        postId: 'post-123',
        name: 'John Doe',
        email: 'john@example.com',
        content: 'This is a test comment.',
      });
      comment.approve();

      await repository.save(comment);
      const found = await repository.findById(comment.id);

      expect(found).not.toBeNull();
      expect(found!.id).toBe(comment.id);
      expect(found!.name).toBe('John Doe');
      expect(found!.content).toBe('This is a test comment.');
      expect(found!.isApproved).toBe(true);
    });
  });

  describe('findByPostId', () => {
    it('should return only approved comments for a post', async () => {
      const approved = Comment.create({
        postId: 'post-123',
        name: 'Approved User',
        email: 'approved@example.com',
        content: 'This comment is approved.',
      });
      approved.approve();

      const pending = Comment.create({
        postId: 'post-123',
        name: 'Pending User',
        email: 'pending@example.com',
        content: 'This comment is pending.',
      });

      await repository.save(approved);
      await repository.save(pending);

      const comments = await repository.findByPostId('post-123');

      expect(comments).toHaveLength(1);
      expect(comments[0].name).toBe('Approved User');
    });
  });

  describe('countByPostId', () => {
    it('should count approved comments', async () => {
      const comment1 = Comment.create({
        postId: 'post-456',
        name: 'User 1',
        email: 'user1@example.com',
        content: 'First comment here.',
      });
      comment1.approve();

      const comment2 = Comment.create({
        postId: 'post-456',
        name: 'User 2',
        email: 'user2@example.com',
        content: 'Second comment here.',
      });
      comment2.approve();

      await repository.save(comment1);
      await repository.save(comment2);

      const count = await repository.countByPostId('post-456');
      expect(count).toBe(2);
    });
  });
});
```

### Acceptance Tests

Create `tests/acceptance/comments.acceptance.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { SELF } from 'cloudflare:test';

describe('Comments Feature', () => {
  describe('Posting a comment', () => {
    it('should create a comment and return HTML', async () => {
      const formData = new FormData();
      formData.append('postId', 'test-post-1');
      formData.append('name', 'Test User');
      formData.append('email', 'test@example.com');
      formData.append('content', 'This is a test comment with enough content.');

      const response = await SELF.fetch('http://localhost/api/comments', {
        method: 'POST',
        body: formData,
      });

      expect(response.status).toBe(201);
      expect(response.headers.get('Content-Type')).toContain('text/html');

      const html = await response.text();
      expect(html).toContain('Test User');
      expect(html).toContain('This is a test comment');

      // Check for notification trigger
      const hxTrigger = response.headers.get('HX-Trigger');
      expect(hxTrigger).toBeDefined();
      const trigger = JSON.parse(hxTrigger!);
      expect(trigger.notify.type).toBe('success');
    });

    it('should reject invalid comments', async () => {
      const formData = new FormData();
      formData.append('postId', 'test-post-1');
      formData.append('name', 'X'); // Too short
      formData.append('email', 'invalid'); // Invalid email
      formData.append('content', 'Short'); // Too short

      const response = await SELF.fetch('http://localhost/api/comments', {
        method: 'POST',
        body: formData,
      });

      expect(response.status).toBe(400);
      const html = await response.text();
      expect(html).toContain('alert-error');
    });
  });

  describe('Listing comments', () => {
    it('should return comments for a post', async () => {
      // First, create a comment
      const formData = new FormData();
      formData.append('postId', 'list-test-post');
      formData.append('name', 'List Test User');
      formData.append('email', 'list@example.com');
      formData.append('content', 'Comment for listing test.');

      await SELF.fetch('http://localhost/api/comments', {
        method: 'POST',
        body: formData,
      });

      // Then, list comments
      const response = await SELF.fetch('http://localhost/api/comments?postId=list-test-post');

      expect(response.status).toBe(200);
      const html = await response.text();
      expect(html).toContain('List Test User');
    });

    it('should show empty state when no comments', async () => {
      const response = await SELF.fetch('http://localhost/api/comments?postId=empty-post');

      expect(response.status).toBe(200);
      const html = await response.text();
      expect(html).toContain('No comments yet');
    });
  });
});
```

---

## Deployment and Operations

### Build and Deploy

```bash
# Full build and deploy
npm run deploy

# Or step by step:
npm run build:css      # Compile TailwindCSS
npm run build:hugo     # Build Hugo site
wrangler pages deploy dist
```

### CI/CD with GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci
      - run: npm run test:run

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci
      - run: npm run build

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: pages deploy dist --project-name=my-hugo-app
```

> **Note:** Hugo is installed automatically via `npm ci` since it's included as a dev dependency via `hugo-bin`. No separate Hugo installation step is needed.

### Database Migrations in Production

```bash
# Create database (first time)
wrangler d1 create my-hugo-app-db

# Apply migrations to production
wrangler d1 migrations apply my-hugo-app-db --remote

# Check migration status
wrangler d1 migrations list my-hugo-app-db --remote

# Query production database
wrangler d1 execute my-hugo-app-db --remote --command "SELECT COUNT(*) FROM comments"
```

### Environment Configuration

Update `wrangler.toml` for multiple environments:

```toml
name = "my-hugo-app"
compatibility_date = "2025-01-01"
compatibility_flags = ["nodejs_compat"]
pages_build_output_dir = "dist"

[observability]
enabled = true

# Production bindings
[[d1_databases]]
binding = "DB"
database_name = "my-hugo-app-db"
database_id = "prod-database-id"

[[kv_namespaces]]
binding = "SESSIONS"
id = "prod-kv-id"

[vars]
ENVIRONMENT = "production"

# Preview environment
[env.preview]
name = "my-hugo-app-preview"

[[env.preview.d1_databases]]
binding = "DB"
database_name = "my-hugo-app-db-preview"
database_id = "preview-database-id"

[[env.preview.kv_namespaces]]
binding = "SESSIONS"
id = "preview-kv-id"

[env.preview.vars]
ENVIRONMENT = "preview"
```

### Populating the Search Index

Create a build script to populate the search index from Hugo content. Add to `package.json`:

```json
{
  "scripts": {
    "build:search-index": "node scripts/build-search-index.mjs"
  }
}
```

Create `scripts/build-search-index.mjs`:

```javascript
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import matter from 'gray-matter';

const CONTENT_DIR = './hugo/content';
const OUTPUT_FILE = './dist/search-index.json';

async function getMarkdownFiles(dir) {
  const files = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await getMarkdownFiles(path)));
    } else if (entry.name.endsWith('.md')) {
      files.push(path);
    }
  }

  return files;
}

async function buildIndex() {
  const files = await getMarkdownFiles(CONTENT_DIR);
  const index = [];

  for (const file of files) {
    const content = await readFile(file, 'utf-8');
    const { data, content: body } = matter(content);

    if (data.draft) continue;

    const url = file
      .replace(CONTENT_DIR, '')
      .replace(/\.md$/, '/')
      .replace(/\/_index$/, '/');

    index.push({
      id: file,
      title: data.title || '',
      url,
      excerpt: body.slice(0, 200).replace(/[#*`]/g, ''),
      content: body.replace(/[#*`]/g, ''),
      date: data.date ? new Date(data.date).toISOString() : null,
    });
  }

  console.log(`Built search index with ${index.length} entries`);

  // Output can be used to populate D1 during deployment
  await writeFile(OUTPUT_FILE, JSON.stringify(index, null, 2));
}

buildIndex().catch(console.error);
```

---

## Complete Example Application

### File Overview

```
project-root/
├── hugo/
│   ├── content/
│   │   ├── _index.md
│   │   ├── about.md
│   │   ├── contact.md
│   │   └── blog/
│   │       ├── _index.md
│   │       └── hello-world.md
│   ├── layouts/
│   │   ├── _default/
│   │   │   ├── baseof.html
│   │   │   ├── list.html
│   │   │   └── single.html
│   │   ├── blog/
│   │   │   ├── list.html
│   │   │   └── single.html
│   │   ├── partials/
│   │   │   ├── header.html
│   │   │   ├── footer.html
│   │   │   └── toast-container.html
│   │   └── shortcodes/
│   │       └── contact-form.html
│   ├── static/
│   │   └── js/
│   │       ├── htmx.min.js
│   │       └── alpine.min.js
│   └── hugo.toml
├── functions/
│   ├── api/
│   │   ├── contact.ts
│   │   ├── comments/
│   │   │   └── index.ts
│   │   └── search.ts
│   └── _middleware.ts
├── src/
│   ├── domain/
│   │   ├── entities/
│   │   │   └── Comment.ts
│   │   ├── value-objects/
│   │   │   └── Email.ts
│   │   └── interfaces/
│   │       └── CommentRepository.ts
│   ├── application/
│   │   └── use-cases/
│   │       └── SubmitComment.ts
│   └── infrastructure/
│       ├── repositories/
│       │   └── D1CommentRepository.ts
│       └── templates/
│           └── comment-item.ts
├── migrations/
│   ├── 0001_initial.sql
│   └── 0002_add_comments.sql
├── tests/
│   ├── setup.ts
│   └── acceptance/
│       └── comments.acceptance.test.ts
├── wrangler.toml
├── vitest.config.ts
├── package.json
└── tsconfig.json
```

### Running the Application

```bash
# Install dependencies
npm install

# Build CSS
npm run build:css

# Apply migrations locally
npm run db:migrate:local

# Start development server with hot reload
npm run dev

# Run tests
npm test

# Deploy to production
npm run deploy
```

---

## Best Practices and Patterns

### Hugo Patterns

**1. Use data files for configuration**

```yaml
# hugo/data/api.yaml
contact: /api/contact
comments: /api/comments
search: /api/search
newsletter: /api/newsletter
```

Access in templates: `{{ .Site.Data.api.contact }}`

**2. Create reusable partials for HTMX patterns**

```html
<!-- hugo/layouts/partials/htmx/loading-button.html -->
{{ $text := .text }} {{ $loadingText := .loadingText | default "Loading..." }}

<button type="submit" class="btn btn-primary">
  <span class="htmx-indicator">{{ $loadingText }}</span>
  <span class="[.htmx-request_&]:hidden">{{ $text }}</span>
</button>
```

**3. Use Hugo's built-in asset pipeline**

```html
{{ $styles := resources.Get "css/main.css" | resources.PostCSS | resources.Minify |
resources.Fingerprint }}
<link rel="stylesheet" href="{{ $styles.RelPermalink }}" integrity="{{ $styles.Data.Integrity }}" />
```

### HTMX + Hugo Patterns

**1. Progressive enhancement for forms**

```html
<form
  action="{{ .Site.Params.api.contact }}"
  method="POST"
  hx-post="{{ .Site.Params.api.contact }}"
  hx-target="#response"
  hx-swap="innerHTML"
>
  <!-- Form works with and without JavaScript -->
</form>
```

**2. Lazy loading for below-fold content**

```html
<section
  hx-get="/api/related-posts?id={{ .File.UniqueID }}"
  hx-trigger="revealed"
  hx-swap="innerHTML"
>
  <div class="skeleton h-32"></div>
</section>
```

**3. Boost navigation for SPA-like experience**

```html
<body hx-boost="true">
  <!-- All internal links become AJAX requests -->
</body>
```

### Performance Patterns

**1. Cache static API responses in KV**

```typescript
const cached = await env.SESSIONS.get(`search:${query}`);
if (cached) {
  return new Response(cached, {
    headers: { 'Content-Type': 'text/html', 'X-Cache': 'HIT' },
  });
}

const html = await generateSearchResults(query);
await env.SESSIONS.put(`search:${query}`, html, { expirationTtl: 300 });
```

**2. Use streaming responses for large content**

```typescript
const { readable, writable } = new TransformStream();
const writer = writable.getWriter();

// Stream results as they're generated
for await (const result of generateResults()) {
  await writer.write(new TextEncoder().encode(renderResult(result)));
}
await writer.close();

return new Response(readable, {
  headers: { 'Content-Type': 'text/html' },
});
```

**3. Preload critical resources**

```html
<head>
  <link rel="preload" href="/js/htmx.min.js" as="script" />
  <link rel="preload" href="/css/app.css" as="style" />
  <link rel="prefetch" href="/api/popular-posts" />
</head>
```

### Testing Patterns

**1. Use test builders for complex objects**

```typescript
const comment = CommentBuilder.aComment()
  .forPost('post-123')
  .byAuthor('John Doe', 'john@example.com')
  .withContent('Test comment content')
  .approved()
  .build();
```

**2. Test HTMX responses specifically**

```typescript
it('should return correct HTMX headers', async () => {
  const response = await submitComment(validData);

  expect(response.headers.get('HX-Trigger')).toBeDefined();
  expect(response.headers.get('Content-Type')).toContain('text/html');
});
```

**3. Separate unit, integration, and acceptance tests**

```
tests/
├── unit/           # Fast, no I/O, test business logic
├── integration/    # Test adapters with real infrastructure
└── acceptance/     # Test complete features through HTTP
```

---

## Conclusion

This guide presents a comprehensive approach to building hybrid web applications that combine Hugo's static site generation with Cloudflare's edge computing platform. The architecture delivers the best of both worlds: instant static content delivery with dynamic functionality where needed.

Key takeaways:

1. **Hugo generates static content** that serves instantly from Cloudflare's global CDN, providing excellent performance and SEO.

2. **Pages Functions handle dynamic features** like forms, comments, and search, running at the edge close to users.

3. **HTMX and Alpine.js provide interactivity** without heavy JavaScript bundles, following progressive enhancement principles.

4. **Domain-Driven Design** keeps business logic clean and testable, independent of infrastructure concerns.

5. **GOOS/TDD testing principles** ensure reliable, maintainable code with comprehensive test coverage.

6. **The edge-first architecture** with D1 and KV provides data persistence without managing traditional server infrastructure.

This stack is ideal for content-driven sites that need selective dynamic functionality: blogs with comments, documentation with search and feedback, marketing sites with forms and personalization, or any application where most content is static but some features require server-side processing.

---

_This guide reflects best practices as of January 2026. For the latest documentation, consult the official Hugo, Cloudflare Pages, HTMX, and Alpine.js documentation._
