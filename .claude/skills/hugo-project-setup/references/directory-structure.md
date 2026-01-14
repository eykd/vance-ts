# Directory Structure

Complete project layout for Hugo + Cloudflare Pages hybrid architecture.

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
├── functions/                     # Cloudflare Pages Functions
│   ├── api/                       # /api/* routes (legacy)
│   └── app/
│       └── _/                     # /app/_/* HTMX endpoints
│           ├── contact.ts         # POST /app/_/contact
│           ├── comments/
│           │   └── [[id]].ts      # GET/POST /app/_/comments
│           ├── search.ts          # GET /app/_/search
│           └── newsletter.ts      # POST /app/_/newsletter
│
├── src/                           # Shared TypeScript source
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
├── dist/                          # Hugo build output (gitignored)
│
├── wrangler.toml                  # Cloudflare configuration
├── vitest.config.ts               # Test configuration
├── tailwind.config.ts             # TailwindCSS configuration
├── package.json
└── tsconfig.json
```

## Key Principles

### 1. Separation of Concerns

- **Hugo** (`hugo/`) → Static content generation
- **Functions** (`functions/`) → Dynamic endpoints
- **Source** (`src/`) → Shared domain logic

### 2. Hugo-First Organization

The `hugo/` directory is a complete Hugo project that can be developed and previewed independently:

```bash
cd hugo && hugo server -D
```

### 3. Functions Mirror URL Structure

Files in `functions/` directly map to URL paths:

| File                                 | URL                                         |
| ------------------------------------ | ------------------------------------------- |
| `functions/app/_/contact.ts`         | `/app/_/contact`                            |
| `functions/app/_/comments/[[id]].ts` | `/app/_/comments` and `/app/_/comments/:id` |
| `functions/api/search.ts`            | `/api/search`                               |

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

| Asset Type                | Location              | Served From       |
| ------------------------- | --------------------- | ----------------- |
| TailwindCSS source        | `hugo/assets/css/`    | Processed by Hugo |
| Compiled CSS              | `dist/css/`           | CDN               |
| JavaScript (HTMX, Alpine) | `hugo/static/js/`     | CDN               |
| Images                    | `hugo/static/images/` | CDN               |

## See Also

- [Configuration](./configuration.md) - Hugo and Wrangler configs
- [Build Pipeline](./build-pipeline.md) - Development and deployment
