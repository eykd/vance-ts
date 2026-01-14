# Configuration

Hugo and Cloudflare configuration files for the hybrid architecture.

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

**wrangler.toml:**

```toml
name = "my-hugo-app"
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]

# Pages build output
pages_build_output_dir = "dist"

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
  "include": ["src/**/*", "functions/**/*", "tests/**/*"],
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
    "dev": "wrangler pages dev dist --compatibility-flags=nodejs_compat",
    "build": "npm run build:hugo && npm run build:css",
    "build:hugo": "cd hugo && hugo --minify -d ../dist",
    "build:css": "npx @tailwindcss/cli -i hugo/assets/css/main.css -o dist/css/app.css --minify",
    "css:watch": "npx @tailwindcss/cli -i hugo/assets/css/main.css -o hugo/static/css/app.css --watch",
    "test": "vitest",
    "deploy": "npm run build && wrangler pages deploy dist"
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
