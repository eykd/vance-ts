# Directory Structure

Complete project layout for Hugo + Cloudflare Workers Static Assets architecture.

## Full Project Structure

```
my-hugo-site/
├── hugo/                          # Hugo site root
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
│   │   │   ├── header.html
│   │   │   ├── footer.html
│   │   │   └── toast-container.html
│   │   └── shortcodes/
│   │       ├── contact-form.html
│   │       └── comment-section.html
│   ├── static/                    # Static files copied as-is
│   │   ├── js/
│   │   │   ├── htmx.min.js
│   │   │   └── alpine.min.js
│   │   └── images/
│   └── hugo.toml                  # Hugo configuration
│
├── src/                           # TypeScript source
│   ├── worker.ts                  # Hono Worker entry point (routes /api/*, /app/_/*)
│   ├── domain/                    # Pure business logic
│   │   ├── entities/
│   │   │   └── Comment.ts
│   │   ├── value-objects/
│   │   │   └── Email.ts
│   │   └── interfaces/            # Repository contracts
│   │       └── CommentRepository.ts
│   ├── application/               # Use cases
│   │   ├── use-cases/
│   │   │   ├── CreateComment.ts
│   │   │   └── SearchContent.ts
│   │   └── dto/
│   │       └── CommentDTO.ts
│   └── infrastructure/            # External adapters
│       └── repositories/
│           └── D1CommentRepository.ts
│
├── tests/                         # Test files
│   ├── unit/
│   ├── integration/
│   └── acceptance/
│
├── wrangler.toml                  # Cloudflare Workers config (generated at deploy, not checked in)
├── vitest.config.ts               # Test configuration
├── tailwind.config.ts             # TailwindCSS configuration
├── package.json
└── tsconfig.json
```

## Key Principles

### 1. Separation of Concerns

- **Hugo** (`hugo/`) → Static content generation (served via Workers Static Assets)
- **Worker** (`src/worker.ts`) → Hono route handlers for dynamic endpoints
- **Source** (`src/`) → Domain logic, application use cases, infrastructure

### 2. Hugo-First Organization

The `hugo/` directory is a complete Hugo project that can be developed and previewed independently:

```bash
cd hugo && hugo server -D
```

### 3. Hono Route Handlers in Worker

Dynamic routes are defined in `src/worker.ts` using Hono, configured via `run_worker_first` in `wrangler.toml`:

| Hono route definition                  | URL                                         |
| -------------------------------------- | ------------------------------------------- |
| `app.post('/app/_/contact', ...)`      | `/app/_/contact`                            |
| `app.all('/app/_/comments/:id?', ...)` | `/app/_/comments` and `/app/_/comments/:id` |
| `app.get('/api/search', ...)`          | `/api/search`                               |

### 4. Domain Independence

The `src/domain/` folder has zero dependencies on Cloudflare, Hugo, or any framework. It contains pure TypeScript business logic.

## HTMX Endpoint Convention

All HTMX partial endpoints use `/app/_/` prefix:

```
/app/_/contact     - Contact form submission
/app/_/comments    - Comment CRUD
/app/_/search      - Live search
/app/_/newsletter  - Newsletter signup
```

The `_` indicates "partial" - these return HTML fragments, not full pages.

## Assets Strategy

| Asset Type                | Location              | Served From           |
| ------------------------- | --------------------- | --------------------- |
| TailwindCSS source        | `hugo/assets/css/`    | Processed by Hugo     |
| Compiled CSS              | `hugo/public/css/`    | Workers Static Assets |
| JavaScript (HTMX, Alpine) | `hugo/static/js/`     | Workers Static Assets |
| Images                    | `hugo/static/images/` | Workers Static Assets |

## See Also

- [Configuration](./configuration.md) - Hugo and Wrangler configs
- [Build Pipeline](./build-pipeline.md) - Development and deployment
