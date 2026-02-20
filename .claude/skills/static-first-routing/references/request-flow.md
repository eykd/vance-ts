# Request Flow

How requests are routed in the Hugo + Cloudflare Workers Static Assets hybrid architecture.

## Edge Network Routing

Workers Static Assets serves static files first by default. The Worker only handles requests that do not match a static asset.

```
User Request
     │
     ▼
┌─────────────────────────────────────────┐
│         Cloudflare Edge Network          │
├─────────────────────────────────────────┤
│                                          │
│  1. Check for static file                │
│     (/*, /blog/*, /css/*, etc.)          │
│     ├─ Found → Serve from CDN cache      │
│     │          └─ <50ms globally         │
│     │                                    │
│     └─ Not found → Continue to step 2   │
│                                          │
│  2. Execute Worker (Hono)                │
│     (/app/*, /api/*, custom routes)      │
│     ├─ Route matched → Return response   │
│     │                  └─ Dynamic HTML/  │
│     │                     JSON           │
│     │                                    │
│     └─ No route matched → 404 page       │
│                                          │
└─────────────────────────────────────────┘
```

## Response Timing

| Route Type    | Typical Latency | Cache           |
| ------------- | --------------- | --------------- |
| Static HTML   | 5-50ms          | Edge (global)   |
| Static assets | 5-20ms          | Edge (long TTL) |
| Worker (Hono) | 50-200ms        | None (dynamic)  |
| D1 query      | +10-50ms        | Optional        |

## HTMX Request Pattern

**Initial Page Load (Static):**

```
GET /blog/my-post → CDN → Hugo HTML (200ms total)
                          └─ Includes HTMX form
```

**Form Submission (Dynamic):**

```
POST /app/_/comments → Worker (Hono) → D1 → HTML partial (100ms)
     └─ HTMX replaces #comments div
```

## Static vs Dynamic Decision

| Characteristic         | Use Static | Use Dynamic |
| ---------------------- | ---------- | ----------- |
| Content changes rarely | ✓          |             |
| Same for all users     | ✓          |             |
| SEO important          | ✓          |             |
| Needs user data        |            | ✓           |
| Writes to database     |            | ✓           |
| Real-time data         |            | ✓           |
| Personalized           |            | ✓           |

## Example Flow: Blog with Comments

**1. User visits `/blog/my-post` (Static)**

```
Browser → CDN → hugo/content/blog/my-post.md → Rendered HTML
                                              └─ <div hx-get="/app/_/comments?postId=123"
                                                      hx-trigger="load">
```

**2. HTMX loads comments (Dynamic)**

```
Browser → Worker (Hono) → D1 query → HTML partial
          │
          └─ app.get('/app/_/comments', handleCommentsList)
```

**3. User posts comment (Dynamic)**

```
Browser → Worker (Hono) → Validate → D1 insert → HTML partial
          │                                     └─ New comment HTML
          └─ HX-Trigger: { notify: { message: "Comment posted!" } }
```

## Worker Route Handling

Routes are registered in `src/worker.ts` using Hono:

```typescript
// src/worker.ts - Hono route registration
import { Hono } from 'hono';
import type { Env } from './types/env';
import { handleContactPost } from './presentation/handlers/contactHandler';
import { handleCommentsList, handleCommentsCreate } from './presentation/handlers/commentsHandler';
import { handleSearch } from './presentation/handlers/searchHandler';

const app = new Hono<{ Bindings: Env }>();

// HTMX partials
app.post('/app/_/contact', handleContactPost);
app.get('/app/_/comments', handleCommentsList);
app.post('/app/_/comments', handleCommentsCreate);
app.get('/app/_/search', handleSearch);

export default app;
```

**Hono handler signature:**

```typescript
// src/presentation/handlers/contactHandler.ts
import type { Context } from 'hono';
import type { Env } from '../../types/env';

type AppContext = Context<{ Bindings: Env }>;

export async function handleContactPost(c: AppContext): Promise<Response> {
  const formData = await c.req.formData();
  // Handle form...
  return c.html(html);
}
```

## See Also

- [Path Conventions](./path-conventions.md) - URL patterns
