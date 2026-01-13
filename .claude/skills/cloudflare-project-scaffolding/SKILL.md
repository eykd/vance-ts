---
name: cloudflare-project-scaffolding
description: Scaffold Cloudflare interactive web app projects with DDD/Clean Architecture structure. Use when users want to (1) create a new Cloudflare Workers project, (2) set up HTMX + Alpine.js + TailwindCSS 4 + DaisyUI 5 stack, (3) initialize a project with domain/application/infrastructure/presentation layers, (4) configure Vitest with @cloudflare/vitest-pool-workers, or (5) start a hypermedia-driven web application on Cloudflare's edge platform.
---

# Cloudflare Project Scaffolding

Generates a complete Cloudflare Workers project with:

- **Architecture**: Domain/Application/Infrastructure/Presentation layers (Clean Architecture)
- **Frontend**: TailwindCSS 4 + DaisyUI 5, HTMX, Alpine.js
- **Backend**: TypeScript Workers with D1 and KV bindings
- **Testing**: Vitest + @cloudflare/vitest-pool-workers

## Quick Start

Run the scaffolding script:

```bash
python3 scripts/scaffold.py <project-name> --output <directory>
```

Example:

```bash
python3 scripts/scaffold.py my-app --output /home/claude
```

## Generated Structure

```
project-name/
├── src/
│   ├── domain/           # Pure business logic (no dependencies)
│   │   ├── entities/
│   │   ├── value-objects/
│   │   ├── services/
│   │   └── interfaces/   # Repository contracts
│   ├── application/      # Use cases and DTOs
│   │   ├── use-cases/
│   │   └── dto/
│   ├── infrastructure/   # External adapters
│   │   ├── repositories/ # D1 implementations
│   │   ├── cache/        # KV implementations
│   │   └── services/
│   ├── presentation/     # HTTP layer
│   │   ├── handlers/
│   │   ├── templates/
│   │   │   ├── layouts/
│   │   │   ├── pages/
│   │   │   └── partials/ # HTMX fragments
│   │   └── middleware/
│   ├── styles/
│   │   └── app.css       # TailwindCSS 4 source
│   ├── index.ts          # Worker entry point
│   └── router.ts         # Route definitions
├── public/
│   ├── css/              # Compiled CSS output
│   └── js/               # HTMX + Alpine.js
├── tests/
├── migrations/           # D1 SQL migrations
├── package.json
├── wrangler.jsonc
├── tsconfig.json
└── vitest.config.ts
```

## Post-Scaffold Steps

1. `cd <project-name> && npm install`
2. Download frontend libs to `public/js/`:
   - `curl -o public/js/htmx.min.js https://unpkg.com/htmx.org@2/dist/htmx.min.js`
   - `curl -o public/js/alpine.min.js https://unpkg.com/alpinejs@3/dist/cdn.min.js`
3. `npm run css:build`
4. Create D1 database: `wrangler d1 create <db-name>`
5. Update `database_id` in `wrangler.jsonc`
6. `npm run dev`

## Key Patterns

### Test Colocation

- `.spec.ts` - Unit tests (colocated with source)
- `.integration.test.ts` - Infrastructure tests
- `.acceptance.test.ts` - Feature tests

### HTMX Endpoints

API routes return HTML partials, not JSON:

```typescript
this.post('/api/items', (req) => this.createItem(req));
// Returns: <li class="...">New item</li>
```

### TailwindCSS 4 + DaisyUI 5

Source CSS uses new import syntax:

```css
@import 'tailwindcss';
@plugin "daisyui";
```

Build: `npm run css:build` or `npm run css:watch`
