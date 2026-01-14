# Build Script

Generate a search index from Hugo markdown content at build time.

## Complete Build Script

**scripts/build-search-index.mjs:**

```javascript
import { readdir, readFile, writeFile } from 'fs/promises';
import { join, relative } from 'path';
import matter from 'gray-matter';

const CONTENT_DIR = './hugo/content';
const OUTPUT_FILE = './dist/search-index.json';

/**
 * Recursively get all markdown files
 */
async function getMarkdownFiles(dir) {
  const files = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await getMarkdownFiles(fullPath)));
    } else if (entry.name.endsWith('.md')) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Convert file path to URL
 */
function pathToUrl(filePath) {
  let url = relative(CONTENT_DIR, filePath)
    .replace(/\.md$/, '')
    .replace(/\/_index$/, '')
    .replace(/\/index$/, '');

  return url === '' ? '/' : '/' + url;
}

/**
 * Create excerpt from content
 */
function createExcerpt(content, maxLength = 200) {
  const plainText = content
    .replace(/[#*`\[\]]/g, '')
    .replace(/\n+/g, ' ')
    .trim();

  if (plainText.length <= maxLength) {
    return plainText;
  }

  return plainText.slice(0, maxLength).trim() + '...';
}

/**
 * Build the search index
 */
async function buildIndex() {
  const files = await getMarkdownFiles(CONTENT_DIR);
  const index = [];

  for (const file of files) {
    const content = await readFile(file, 'utf-8');
    const { data, content: body } = matter(content);

    // Skip drafts
    if (data.draft === true) {
      continue;
    }

    const url = pathToUrl(file);

    index.push({
      id: url.replace(/\//g, '-').slice(1) || 'home',
      title: data.title || 'Untitled',
      url: url,
      excerpt: data.description || createExcerpt(body),
      content: body.replace(/[#*`]/g, ''),
      date: data.date ? new Date(data.date).toISOString() : null,
    });
  }

  console.log(`Built search index with ${index.length} entries`);

  await writeFile(OUTPUT_FILE, JSON.stringify(index, null, 2));
}

buildIndex().catch(console.error);
```

## Index Entry Schema

```typescript
interface SearchEntry {
  id: string; // Unique ID derived from URL
  title: string; // Front matter title
  url: string; // Page URL
  excerpt: string; // Description or auto-generated excerpt
  content: string; // Full body text (for FTS)
  date: string; // ISO date string
}
```

## Package.json Scripts

```json
{
  "scripts": {
    "build": "npm run build:hugo && npm run build:css && npm run build:search-index",
    "build:search-index": "node scripts/build-search-index.mjs"
  },
  "devDependencies": {
    "gray-matter": "^4.0.3"
  }
}
```

## Handling Front Matter

The script uses `gray-matter` to parse Hugo front matter:

```markdown
---
title: My Blog Post
description: A great post about something
date: 2024-01-15
draft: false
tags: [hugo, search]
---

Post content here...
```

## Output Format

**dist/search-index.json:**

```json
[
  {
    "id": "blog-my-post",
    "title": "My Blog Post",
    "url": "/blog/my-post",
    "excerpt": "A great post about something",
    "content": "Post content here...",
    "date": "2024-01-15T00:00:00.000Z"
  }
]
```

## Integration with CI/CD

```yaml
# .github/workflows/deploy.yml
- name: Build Hugo
  run: npm run build:hugo

- name: Build Search Index
  run: npm run build:search-index

- name: Seed D1
  run: wrangler d1 execute $DB_NAME --file=./dist/search-index.sql
```

## See Also

- [D1 Population](./d1-population.md) - Loading index into D1
