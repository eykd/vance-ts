---
name: hugo-search-indexing
description: 'Use when: (1) building search from Hugo markdown content, (2) populating D1 search tables, (3) implementing FTS5 full-text search, (4) creating build scripts for search index generation.'
---

# Hugo Search Indexing

Build a search index from Hugo markdown content and populate D1 for live search.

## Quick Reference

| Component       | Purpose                       | Reference                                       |
| --------------- | ----------------------------- | ----------------------------------------------- |
| Build script    | Extract content from markdown | [build-script.md](references/build-script.md)   |
| D1 schema       | Store search index            | [d1-population.md](references/d1-population.md) |
| FTS5            | Full-text search              | [d1-population.md](references/d1-population.md) |
| Search endpoint | Query and return results      | [d1-population.md](references/d1-population.md) |

## Architecture

```
Hugo Content (markdown)
        │
        ▼ [build script]
   JSON index file
        │
        ▼ [D1 migration/seed]
   D1 search_index table
        │
        ▼ [FTS5 triggers]
   search_fts virtual table
        │
        ▼ [search endpoint]
   HTML results (HTMX partial)
```

## Quick Setup

**1. Create D1 migration:**

```sql
CREATE TABLE search_index (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  excerpt TEXT,
  content TEXT,
  date TEXT
);

CREATE VIRTUAL TABLE search_fts USING fts5(
  title, content, content='search_index', content_rowid='rowid'
);
```

**2. Create build script:**

```javascript
// scripts/build-search-index.mjs
import { readdir, readFile, writeFile } from 'fs/promises';
import matter from 'gray-matter';

const index = [];
// ... parse markdown, extract front matter
await writeFile('./dist/search-index.json', JSON.stringify(index));
```

**3. Add npm script:**

```json
{
  "scripts": {
    "build:search-index": "node scripts/build-search-index.mjs"
  }
}
```

## Workflow

1. **Need search?** → Create D1 schema with FTS5
2. **Build time** → Run `npm run build:search-index`
3. **Deploy** → Seed D1 with JSON index
4. **Runtime** → Query FTS5 from search endpoint

## Detailed References

- [Build Script](references/build-script.md) - Markdown parsing, index generation
- [D1 Population](references/d1-population.md) - Schema, FTS5, seeding, querying

## Related Skills

- [d1-repository-implementation](../d1-repository-implementation/SKILL.md) - D1 patterns
- [cloudflare-migrations](../cloudflare-migrations/SKILL.md) - Migration files
- [typescript-html-templates](../typescript-html-templates/SKILL.md) - Search results HTML
