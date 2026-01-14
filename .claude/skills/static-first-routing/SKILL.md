---
name: static-first-routing
description: 'Use when: (1) understanding CDN vs Pages Functions routing, (2) configuring URL structure for Hugo + Workers hybrid, (3) deciding which requests need dynamic handling, (4) implementing /app/_/* endpoint conventions.'
---

# Static-First Routing

Understand and configure routing for Hugo + Cloudflare Pages hybrid architecture.

## Quick Reference

| Request Pattern                | Handled By        | Response              |
| ------------------------------ | ----------------- | --------------------- |
| `/`, `/about`, `/blog/*`       | CDN (Hugo static) | Pre-rendered HTML     |
| `/app/_/*`                     | Pages Functions   | Dynamic HTML partials |
| `/api/*`                       | Pages Functions   | JSON (if needed)      |
| `/css/*`, `/js/*`, `/images/*` | CDN               | Static assets         |

## Core Concept

**Static-First**: Hugo generates all pages at build time. The CDN serves them globally with <50ms latency. Workers only handle requests that require runtime data.

```
Request → CDN
           ├─ /blog/post-1 → Hugo HTML (cached)
           ├─ /app/_/comments → Worker (D1 query)
           └─ /js/htmx.min.js → Static file (cached)
```

## Request Flow

```
User Request
     │
     ▼
Cloudflare Edge Network
     │
     ├─ Is /app/* or /api/*?
     │   └─ YES → Execute Pages Function
     │            ├─ Access D1/KV
     │            └─ Return HTML/JSON
     │
     └─ NO → Serve from CDN
             (Hugo-generated static files)
```

## Path Conventions

### Static Paths (Hugo → CDN)

| Path            | Content                                 |
| --------------- | --------------------------------------- |
| `/`             | Homepage                                |
| `/about`        | About page                              |
| `/blog/`        | Blog listing                            |
| `/blog/my-post` | Individual post                         |
| `/contact`      | Contact page (static form, HTMX action) |

### Dynamic Paths (Pages Functions)

| Path                | Purpose                 |
| ------------------- | ----------------------- |
| `/app/_/contact`    | Contact form submission |
| `/app/_/comments`   | Comment CRUD            |
| `/app/_/search`     | Live search             |
| `/app/_/newsletter` | Newsletter signup       |

**Why `/app/_/`?**

- `/app/` groups all dynamic routes
- `_` indicates "partial" (returns HTML fragment, not full page)
- Clear separation from static content

## Workflow

1. **New page?** → Create in `hugo/content/` (static)
2. **Need runtime data?** → Create Pages Function at `/app/_/*`
3. **HTMX form action?** → Point to `/app/_/endpoint`
4. **Full page from Worker?** → Use `/app/page` (no underscore)

## Detailed References

- [Request Flow](references/request-flow.md) - How requests are routed
- [Path Conventions](references/path-conventions.md) - URL patterns and structure

## Related Skills

- [worker-request-handler](../worker-request-handler/SKILL.md) - Building Pages Function handlers
- [cloudflare-project-scaffolding](../cloudflare-project-scaffolding/SKILL.md) - Project structure
- [hugo-project-setup](../hugo-project-setup/SKILL.md) - Hugo directory layout
