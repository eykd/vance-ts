# D1 Population

Schema, FTS5 setup, and querying for search functionality.

## D1 Schema

**migrations/0001_search_index.sql:**

```sql
-- Main search index table
CREATE TABLE IF NOT EXISTS search_index (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  excerpt TEXT,
  content TEXT,
  date TEXT,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_search_title ON search_index(title);
CREATE INDEX idx_search_date ON search_index(date);

-- Full-text search (SQLite FTS5)
CREATE VIRTUAL TABLE IF NOT EXISTS search_fts USING fts5(
  title,
  content,
  content='search_index',
  content_rowid='rowid'
);

-- Triggers to keep FTS in sync
CREATE TRIGGER search_ai AFTER INSERT ON search_index BEGIN
  INSERT INTO search_fts(rowid, title, content)
  VALUES (new.rowid, new.title, new.content);
END;

CREATE TRIGGER search_ad AFTER DELETE ON search_index BEGIN
  INSERT INTO search_fts(search_fts, rowid, title, content)
  VALUES('delete', old.rowid, old.title, old.content);
END;

CREATE TRIGGER search_au AFTER UPDATE ON search_index BEGIN
  INSERT INTO search_fts(search_fts, rowid, title, content)
  VALUES('delete', old.rowid, old.title, old.content);
  INSERT INTO search_fts(rowid, title, content)
  VALUES (new.rowid, new.title, new.content);
END;
```

## Seeding D1 from JSON

**⚠️ Security Note:** This string concatenation approach is safe only for trusted build-time content generated from your own markdown files. Never use this pattern with user-provided data. For dynamic seeding, use Cloudflare D1's parameterized queries via `env.DB.prepare().bind()`.

**scripts/seed-search.mjs:**

```javascript
import { readFile, writeFile } from 'fs/promises';

const index = JSON.parse(await readFile('./dist/search-index.json', 'utf-8'));

const sql = index
  .map(
    (entry) => `
INSERT OR REPLACE INTO search_index (id, title, url, excerpt, content, date)
VALUES (
  '${entry.id.replace(/'/g, "''")}',
  '${entry.title.replace(/'/g, "''")}',
  '${entry.url.replace(/'/g, "''")}',
  '${(entry.excerpt || '').replace(/'/g, "''")}',
  '${(entry.content || '').replace(/'/g, "''")}',
  ${entry.date ? `'${entry.date}'` : 'NULL'}
);
`
  )
  .join('\n');

await writeFile('./dist/search-index.sql', sql);
console.log(`Generated SQL for ${index.length} entries`);
```

**Alternative: Parameterized Seeding via Workers Script**

For dynamic data or extra safety, use prepared statements:

```typescript
// scripts/seed-search.ts (run with wrangler)
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const index: SearchEntry[] = await request.json();

    const stmt = env.DB.prepare(`
      INSERT OR REPLACE INTO search_index (id, title, url, excerpt, content, date)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const batch = index.map((entry) =>
      stmt.bind(entry.id, entry.title, entry.url, entry.excerpt, entry.content, entry.date)
    );

    await env.DB.batch(batch);

    return new Response(`Seeded ${index.length} entries`);
  },
};
```

Run with: `curl -X POST http://localhost:8787 -d @dist/search-index.json`

## Querying with FTS5

**Simple LIKE query (basic):**

```typescript
const { results } = await env.DB.prepare(
  `
  SELECT title, url, excerpt, date
  FROM search_index
  WHERE title LIKE ? OR content LIKE ?
  ORDER BY date DESC
  LIMIT 10
`
)
  .bind(`%${query}%`, `%${query}%`)
  .all<SearchResult>();
```

**FTS5 query (better):**

```typescript
const { results } = await env.DB.prepare(
  `
  SELECT s.title, s.url, s.excerpt, s.date
  FROM search_index s
  JOIN search_fts f ON s.rowid = f.rowid
  WHERE search_fts MATCH ?
  ORDER BY rank
  LIMIT 10
`
)
  .bind(query)
  .all<SearchResult>();
```

## Search Handler

**functions/app/\_/search.ts:**

```typescript
interface SearchResult {
  title: string;
  url: string;
  excerpt: string;
  date: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  const query = url.searchParams.get('q')?.trim();

  if (!query || query.length < 2) {
    return new Response('', {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  const { results } = await context.env.DB.prepare(
    `
    SELECT s.title, s.url, s.excerpt, s.date
    FROM search_index s
    JOIN search_fts f ON s.rowid = f.rowid
    WHERE search_fts MATCH ?
    ORDER BY rank
    LIMIT 10
  `
  )
    .bind(query)
    .all<SearchResult>();

  if (results.length === 0) {
    return htmlResponse(
      `<div class="p-4 text-center text-base-content/60">
        No results for "${escapeHtml(query)}"
      </div>`
    );
  }

  const html = `
    <ul class="divide-y divide-base-200">
      ${results
        .map(
          (r) => `
        <li>
          <a href="${escapeHtml(r.url)}"
             class="block p-4 hover:bg-base-200">
            <h4 class="font-medium">${highlightQuery(r.title, query)}</h4>
            <p class="text-sm opacity-70">${highlightQuery(r.excerpt, query)}</p>
          </a>
        </li>
      `
        )
        .join('')}
    </ul>
  `;

  return htmlResponse(html);
};

function highlightQuery(text: string, query: string): string {
  const escaped = escapeHtml(text);
  const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
  return escaped.replace(regex, '<mark class="bg-warning/30">$1</mark>');
}
```

## Deployment Commands

```bash
# Apply migrations
wrangler d1 migrations apply my-db

# Seed search data
wrangler d1 execute my-db --file=./dist/search-index.sql
```

## See Also

- [Build Script](./build-script.md) - Generating the index
