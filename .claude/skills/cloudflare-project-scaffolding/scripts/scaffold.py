#!/usr/bin/env python3
"""
Cloudflare Interactive Web App Project Scaffolding
Generates a project with DDD/Clean Architecture structure using:
- TypeScript Workers
- TailwindCSS 4 + DaisyUI 5
- HTMX + Alpine.js
- Vitest with @cloudflare/vitest-pool-workers
"""

import argparse
import datetime
import json
import os
from pathlib import Path


def create_file(path: Path, content: str):
    """Create a file with the given content."""
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content.strip() + "\n")
    print(f"  ✓ {path}")


def scaffold_project(project_name: str, output_dir: Path, db_name: str = None):
    """Generate the complete project structure."""
    root = output_dir / project_name
    db = db_name or f"{project_name}-db"
    today = datetime.date.today().isoformat()
    
    print(f"\n🚀 Scaffolding Cloudflare project: {project_name}")
    print(f"   Output: {root}\n")
    
    # === Configuration Files ===
    
    create_file(root / "package.json", f'''{{
  "name": "{project_name}",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {{
    "dev": "wrangler dev",
    "deploy": "wrangler deploy",
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:unit": "vitest run --testPathPattern='\\\\.spec\\\\.ts$'",
    "test:integration": "vitest run --testPathPattern='\\\\.integration\\\\.test\\\\.ts$'",
    "test:acceptance": "vitest run --testPathPattern='\\\\.acceptance\\\\.test\\\\.ts$'",
    "types": "wrangler types",
    "db:migrate": "wrangler d1 migrations apply {db}",
    "db:migrate:local": "wrangler d1 migrations apply {db} --local",
    "css:build": "npx @tailwindcss/cli -i ./src/styles/app.css -o ./public/css/app.css --minify",
    "css:watch": "npx @tailwindcss/cli -i ./src/styles/app.css -o ./public/css/app.css --watch"
  }},
  "dependencies": {{
    "hono": "^4.12.0"
  }},
  "devDependencies": {{
    "@cloudflare/vitest-pool-workers": "^0.8.0",
    "@cloudflare/workers-types": "^4.20250109.0",
    "@tailwindcss/cli": "^4.0.0",
    "@tailwindcss/postcss": "^4.0.0",
    "daisyui": "^5.0.0",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.7.0",
    "vitest": "^3.0.0",
    "wrangler": "^3.99.0"
  }}
}}''')

    create_file(root / "wrangler.jsonc", f'''{{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "{project_name}",
  "main": "src/index.ts",
  "compatibility_date": "{today}",
  "compatibility_flags": ["nodejs_compat"],

  "observability": {{
    "enabled": true
  }},

  // Static-first routing: static assets served from CDN, Worker handles dynamic routes
  "assets": {{
    "directory": "./public",
    "binding": "ASSETS",
    "html_handling": "auto-trailing-slash",
    "not_found_handling": "404-page",
    "run_worker_first": ["/api/*", "/app/_/*", "/auth/*", "/webhooks/*"]
  }},

  "d1_databases": [
    {{
      "binding": "DB",
      "database_name": "{db}",
      "database_id": "TODO-run-wrangler-d1-create-{db}"
    }}
  ],

  "kv_namespaces": [
    {{
      "binding": "SESSIONS",
      "id": "TODO-run-wrangler-kv-namespace-create-sessions"
    }}
  ],

  "vars": {{
    "ENVIRONMENT": "development"
  }}
}}''')

    create_file(root / "tsconfig.json", '''{
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
}''')

    create_file(root / "vitest.config.ts", '''import { defineWorkersConfig } from "@cloudflare/vitest-pool-workers/config";

export default defineWorkersConfig({
  test: {
    globals: true,
    include: ["src/**/*.{spec,test}.ts", "tests/**/*.test.ts"],

    poolOptions: {
      workers: {
        wrangler: {
          configPath: "./wrangler.jsonc"
        },
        miniflare: {
          compatibilityDate: "''' + today + '''",
          compatibilityFlags: ["nodejs_compat"]
        }
      }
    },

    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "**/*.spec.ts",
        "**/*.test.ts"
      ]
    }
  }
});''')

    # === TailwindCSS 4 + DaisyUI 5 ===
    
    create_file(root / "src" / "styles" / "app.css", '''@import "tailwindcss";
@plugin "daisyui";

/* Configure DaisyUI themes */
@plugin "daisyui" {
  themes: light --default, dark --prefersdark;
}

/* HTMX loading indicator utilities */
@layer utilities {
  .htmx-indicator {
    opacity: 0;
    transition: opacity 200ms ease-in;
  }

  .htmx-request .htmx-indicator,
  .htmx-request.htmx-indicator {
    opacity: 1;
  }
}''')

    # === Public Assets (Static pages served by Cloudflare Pages) ===

    create_file(root / "public" / "index.html", f'''<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{project_name}</title>
  <link href="/css/app.css" rel="stylesheet">
  <script src="/js/htmx.min.js" defer></script>
  <script src="/js/alpine.min.js" defer></script>
</head>
<body class="min-h-screen bg-base-200">
  <div class="hero min-h-screen">
    <div class="hero-content text-center">
      <div class="max-w-md">
        <h1 class="text-5xl font-bold">Welcome</h1>
        <p class="py-6">This is a static marketing page served by Cloudflare Pages.</p>
        <a href="/app" class="btn btn-primary">Go to App</a>
        <a href="/auth/login" class="btn btn-ghost">Login</a>
      </div>
    </div>
  </div>
</body>
</html>''')

    create_file(root / "public" / "css" / ".gitkeep", "# Compiled CSS output directory")

    create_file(root / "public" / "js" / ".gitkeep", '''# Add HTMX and Alpine.js here:
# - htmx.min.js (from https://unpkg.com/htmx.org)
# - alpine.min.js (from https://unpkg.com/alpinejs)''')

    # === Domain Layer ===
    
    create_file(root / "src" / "domain" / "entities" / ".gitkeep", "# Domain entities (pure business objects)")
    create_file(root / "src" / "domain" / "value-objects" / ".gitkeep", "# Value objects (immutable domain concepts)")
    create_file(root / "src" / "domain" / "services" / ".gitkeep", "# Domain services (business logic)")
    create_file(root / "src" / "domain" / "interfaces" / ".gitkeep", "# Port interfaces (repository contracts)")

    # === Application Layer ===
    
    create_file(root / "src" / "application" / "use-cases" / ".gitkeep", "# Application use cases")
    create_file(root / "src" / "application" / "dto" / ".gitkeep", "# Data transfer objects")

    # === Infrastructure Layer ===
    
    create_file(root / "src" / "infrastructure" / "repositories" / ".gitkeep", "# D1 repository implementations")
    create_file(root / "src" / "infrastructure" / "cache" / ".gitkeep", "# KV cache implementations")
    create_file(root / "src" / "infrastructure" / "services" / ".gitkeep", "# External service adapters")

    # === Presentation Layer ===

    create_file(root / "src" / "presentation" / "handlers" / ".gitkeep", "# HTTP request handlers")
    create_file(root / "src" / "presentation" / "templates" / "layouts" / ".gitkeep", "# Page layouts")
    create_file(root / "src" / "presentation" / "templates" / "app" / ".gitkeep", "# Worker-rendered app pages (/app/*)")
    create_file(root / "src" / "presentation" / "templates" / "app" / "partials" / ".gitkeep", "# HTMX partial templates (/app/_/*)")
    create_file(root / "src" / "presentation" / "middleware" / ".gitkeep", "# Request middleware")

    # === Entry Point & Hono App ===

    create_file(root / "src" / "types" / "env.ts", '''/// <reference types="@cloudflare/workers-types" />

export interface Env {
  readonly DB: D1Database;
  readonly SESSIONS: KVNamespace;
  readonly ASSETS: Fetcher;
  readonly ENVIRONMENT: string;
}
''')

    create_file(root / "src" / "index.ts", '''/**
 * Application entry point — re-exports the Hono Worker app.
 */
export { default } from "./worker";
''')

    create_file(root / "src" / "worker.ts", '''import { Hono } from "hono/tiny";
import type { Env } from "./types/env";

type AppEnv = { Bindings: Env };
const app = new Hono<AppEnv>();

// Security headers middleware for Worker-handled routes
const securityHeaders = async (c, next) => {
  await next();
  c.res.headers.set("X-Content-Type-Options", "nosniff");
  c.res.headers.set("X-Frame-Options", "DENY");
};
app.use("/api/*", securityHeaders);
app.use("/app/_/*", securityHeaders);
app.use("/auth/*", securityHeaders);

// Health check
app.get("/api/health", (c) => c.json({ status: "ok" }));

// Auth routes
app.get("/auth/login", (c) => c.html("Login page - implement auth"));
app.post("/auth/login", (c) => c.redirect("/app", 303)); // TODO: validate CSRF token
app.post("/auth/logout", (c) => c.redirect("/", 303)); // TODO: validate CSRF token

// TODO: add auth guard - redirect to /auth/login if no session
// Application pages (authenticated)
app.get("/app", (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="htmx-config" content='{"selfRequestsOnly":true}'>
  <title>Dashboard</title>
  <link href="/css/app.css" rel="stylesheet">
  <script src="/js/htmx.min.js" defer></script>
  <script src="/js/alpine.min.js" defer></script>
</head>
<body class="min-h-screen bg-base-200">
  <div class="hero min-h-screen">
    <div class="hero-content text-center">
      <div class="max-w-md">
        <h1 class="text-5xl font-bold">Dashboard</h1>
        <p class="py-6">Your app is ready. Start building!</p>
        <a href="/" class="btn btn-ghost mt-4">Back to Home</a>
      </div>
    </div>
  </div>
</body>
</html>`);
});

// HTMX partials (authenticated) - all under /app/_
// app.get("/app/_/items", handleListItems);
// app.post("/app/_/items", handleCreateItem);

// Catch-all for unimplemented routes
app.all("/api/*", (c) => c.json({ error: "Not found" }, 404));
app.all("/app/_/*", (c) => c.json({ error: "Not found" }, 404));

// Static asset fallthrough
app.all("*", (c) => c.env.ASSETS.fetch(c.req.raw));

export default app;
''')

    # === Tests ===
    
    create_file(root / "tests" / "setup.ts", '''// Test setup file
// Add global test utilities here''')
    
    create_file(root / "tests" / "fixtures" / ".gitkeep", "# Test data builders")
    create_file(root / "tests" / "helpers" / ".gitkeep", "# Test utilities")

    # === Migrations ===
    
    create_file(root / "migrations" / ".gitkeep", "# D1 database migrations (0001_initial.sql, etc.)")

    # === Git ===
    
    create_file(root / ".gitignore", '''node_modules/
dist/
.wrangler/
.dev.vars
*.log
.DS_Store
coverage/
public/css/app.css''')

    print(f"\n✅ Project scaffolded successfully!")
    print(f"\nNext steps:")
    print(f"  1. cd {project_name}")
    print(f"  2. npm install")
    print(f"  3. Download HTMX and Alpine.js to public/js/")
    print(f"  4. npm run css:build")
    print(f"  5. wrangler d1 create {db}")
    print(f"  6. Update database_id in wrangler.jsonc")
    print(f"  7. npm run dev")


def main():
    parser = argparse.ArgumentParser(
        description="Scaffold a Cloudflare interactive web app project"
    )
    parser.add_argument("project_name", help="Name of the project")
    parser.add_argument(
        "--output", "-o",
        default=".",
        help="Output directory (default: current directory)"
    )
    parser.add_argument(
        "--db-name",
        help="D1 database name (default: {project_name}-db)"
    )
    
    args = parser.parse_args()
    scaffold_project(args.project_name, Path(args.output), args.db_name)


if __name__ == "__main__":
    main()
