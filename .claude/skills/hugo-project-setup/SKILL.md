---
name: hugo-project-setup
description: 'Use when: (1) creating a new Hugo + Cloudflare Pages project, (2) setting up directory structure for static-first routing, (3) configuring hugo.toml with HTMX endpoints, (4) integrating TailwindCSS 4 build pipeline.'
---

# Hugo Project Setup

Scaffold a Hugo + Cloudflare Pages hybrid project with static-first routing architecture.

## Quick Reference

| Component    | Location         | Purpose                           | Reference                                                   |
| ------------ | ---------------- | --------------------------------- | ----------------------------------------------------------- |
| Hugo site    | `hugo/`          | Static content, templates, assets | [directory-structure.md](references/directory-structure.md) |
| Functions    | `functions/`     | Dynamic endpoints (API, comments) | [directory-structure.md](references/directory-structure.md) |
| Domain logic | `src/`           | Shared business logic             | [directory-structure.md](references/directory-structure.md) |
| Hugo config  | `hugo/hugo.toml` | Site settings, API params         | [configuration.md](references/configuration.md)             |
| Build        | `wrangler.toml`  | Cloudflare Pages build            | [build-pipeline.md](references/build-pipeline.md)           |

## Architecture Overview

```
Hugo generates static HTML → Cloudflare Pages CDN
Functions handle dynamic requests → /app/_/* endpoints
```

**Static-First Routing:**

- `/`, `/about`, `/blog/*` → Hugo-generated static HTML (CDN)
- `/app/_/*` → Cloudflare Pages Functions (dynamic)

## Quick Setup

```bash
# Create Hugo site
hugo new site my-site && cd my-site

# Initialize project structure
mkdir -p functions/api src/{domain,application,infrastructure}

# Install dependencies
npm init -y
npm install -D wrangler tailwindcss @tailwindcss/cli

# Download HTMX and Alpine.js
mkdir -p hugo/static/js
curl -o hugo/static/js/htmx.min.js https://unpkg.com/htmx.org@2/dist/htmx.min.js
curl -o hugo/static/js/alpine.min.js https://unpkg.com/alpinejs@3/dist/cdn.min.js
```

## Essential Configuration

**hugo/hugo.toml:**

```toml
[params.api]
  contact = "/app/_/contact"
  comments = "/app/_/comments"
  search = "/app/_/search"
```

**wrangler.toml:**

```toml
name = "my-hugo-app"
compatibility_date = "2024-01-01"
pages_build_output_dir = "dist"
```

## Workflow

1. **New project?** → Follow Quick Setup steps
2. **Adding dynamic endpoint?** → Create in `functions/api/`
3. **Need shared logic?** → Put in `src/domain/` or `src/application/`
4. **Hugo template needs API?** → Configure in `hugo.toml` params.api

## Detailed References

- [Directory Structure](references/directory-structure.md) - Full project layout
- [Configuration](references/configuration.md) - Hugo and Wrangler configs
- [Build Pipeline](references/build-pipeline.md) - Development and deployment

## Related Skills

- [cloudflare-project-scaffolding](../cloudflare-project-scaffolding/SKILL.md) - Pure Workers scaffolding
- [vitest-cloudflare-config](../vitest-cloudflare-config/SKILL.md) - Test setup
- [hugo-templates](../hugo-templates/SKILL.md) - Hugo template patterns
