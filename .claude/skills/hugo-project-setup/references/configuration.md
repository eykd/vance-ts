# Configuration

Hugo and Cloudflare Workers configuration files for the hybrid architecture.

## Hugo Configuration

**hugo/hugo.toml:**

```toml
baseURL = 'https://example.com/'
languageCode = 'en-us'
title = 'My Hugo Site'

# API endpoint configuration for HTMX
[params.api]
  contact = "/app/_/contact"
  comments = "/app/_/comments"
  search = "/app/_/search"
  newsletter = "/app/_/newsletter"

# Menu configuration
[menus]
  [[menus.main]]
    name = 'Home'
    pageRef = '/'
    weight = 10
  [[menus.main]]
    name = 'Blog'
    pageRef = '/blog'
    weight = 20
  [[menus.main]]
    name = 'About'
    pageRef = '/about'
    weight = 30

# Build configuration
[build]
  writeStats = true

# Minification
[minify]
  minifyOutput = true
```

## Wrangler Configuration

**wrangler.toml** (generated at deploy time, not checked in):

```toml
name = "my-hugo-app"
main = "src/worker.ts"
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]

# Workers Static Assets - serves Hugo output
[assets]
directory = "./hugo/public/"
binding = "ASSETS"

[assets.routing]
run_worker_first = ["/api/*", "/app/_/*"]

# D1 Database
[[d1_databases]]
  binding = "DB"
  database_name = "my-hugo-app-db"
  database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

# KV Namespace (for sessions/cache)
[[kv_namespaces]]
  binding = "KV"
  id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

# Environment variables
[vars]
  ENVIRONMENT = "development"

# Cron triggers (Workers supports this directly, unlike Pages)
[triggers]
crons = ["0 6 * * *"]  # Daily at 6 AM UTC
```

## TypeScript Configuration

**tsconfig.json:**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "types": ["@cloudflare/workers-types"],
    "paths": {
      "@domain/*": ["src/domain/*"],
      "@application/*": ["src/application/*"],
      "@infrastructure/*": ["src/infrastructure/*"]
    }
  },
  "include": ["src/**/*", "tests/**/*"],
  "exclude": ["node_modules", "dist", "hugo"]
}
```

## TailwindCSS Configuration

**tailwind.config.ts:**

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

## Package.json Scripts

```json
{
  "scripts": {
    "dev": "wrangler dev",
    "build": "npm run build:hugo && npm run build:css",
    "build:hugo": "cd hugo && hugo --minify",
    "build:css": "npx @tailwindcss/cli -i hugo/assets/css/main.css -o hugo/public/css/app.css --minify",
    "css:watch": "npx @tailwindcss/cli -i hugo/assets/css/main.css -o hugo/static/css/app.css --watch",
    "test": "vitest",
    "deploy": "npm run build && wrangler deploy"
  }
}
```

## Environment Types

**src/env.d.ts:**

```typescript
interface Env {
  DB: D1Database;
  KV: KVNamespace;
  ENVIRONMENT: string;
}
```

## See Also

- [Directory Structure](./directory-structure.md) - Project layout
- [Build Pipeline](./build-pipeline.md) - Development and deployment
