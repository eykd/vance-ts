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
  "compatibility_date": "2025-01-01",
  "compatibility_flags": ["nodejs_compat"],

  "observability": {{
    "enabled": true
  }},

  "assets": {{
    "directory": "./public",
    "binding": "ASSETS"
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
          compatibilityDate: "2025-01-01",
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

    # === Public Assets ===
    
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
    create_file(root / "src" / "presentation" / "templates" / "pages" / ".gitkeep", "# Full page templates")
    create_file(root / "src" / "presentation" / "templates" / "partials" / ".gitkeep", "# HTMX partial templates")
    create_file(root / "src" / "presentation" / "middleware" / ".gitkeep", "# Request middleware")

    # === Entry Point & Router ===
    
    create_file(root / "src" / "index.ts", '''import { Router } from "./router";

export interface Env {
  DB: D1Database;
  SESSIONS: KVNamespace;
  ASSETS: Fetcher;
  ENVIRONMENT: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      const router = new Router(env);
      return await router.handle(request);
    } catch (error) {
      console.error("Unhandled error:", error);
      return new Response("Internal Server Error", { status: 500 });
    }
  }
};''')

    create_file(root / "src" / "router.ts", '''import type { Env } from "./index";

type RouteHandler = (request: Request, params: Record<string, string>) => Promise<Response>;

interface Route {
  method: string;
  pattern: RegExp;
  paramNames: string[];
  handler: RouteHandler;
}

export class Router {
  private routes: Route[] = [];

  constructor(private env: Env) {
    this.registerRoutes();
  }

  private registerRoutes(): void {
    // Pages
    this.get("/", (req) => this.homePage(req));

    // API endpoints (return HTML partials for HTMX)
    // this.get("/api/items", (req) => this.listItems(req));
    // this.post("/api/items", (req) => this.createItem(req));

    // Static assets fallback
    this.get("/*", async (req) => {
      const response = await this.env.ASSETS.fetch(req);
      if (response.status === 404) {
        return new Response("Not found", { status: 404 });
      }
      return response;
    });
  }

  private async homePage(request: Request): Promise<Response> {
    const html = `<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome</title>
  <link href="/css/app.css" rel="stylesheet">
  <script src="/js/htmx.min.js" defer></script>
  <script src="/js/alpine.min.js" defer></script>
</head>
<body class="min-h-screen bg-base-200">
  <div class="hero min-h-screen">
    <div class="hero-content text-center">
      <div class="max-w-md">
        <h1 class="text-5xl font-bold">Hello!</h1>
        <p class="py-6">Your Cloudflare project is ready. Start building!</p>
        <div x-data="{ count: 0 }" class="space-y-4">
          <p>Alpine.js counter: <span x-text="count" class="font-bold"></span></p>
          <button @click="count++" class="btn btn-primary">Increment</button>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
    return new Response(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" }
    });
  }

  private addRoute(method: string, path: string, handler: RouteHandler): void {
    const paramNames: string[] = [];
    const pattern = path.replace(/:(\w+)/g, (_, name) => {
      paramNames.push(name);
      return "([^/]+)";
    }).replace(/[*]/g, ".*");

    this.routes.push({
      method,
      pattern: new RegExp(`^${pattern}$`),
      paramNames,
      handler
    });
  }

  private get(path: string, handler: RouteHandler): void {
    this.addRoute("GET", path, handler);
  }

  private post(path: string, handler: RouteHandler): void {
    this.addRoute("POST", path, handler);
  }

  private patch(path: string, handler: RouteHandler): void {
    this.addRoute("PATCH", path, handler);
  }

  private delete(path: string, handler: RouteHandler): void {
    this.addRoute("DELETE", path, handler);
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

    return new Response("Not found", { status: 404 });
  }
}''')

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
