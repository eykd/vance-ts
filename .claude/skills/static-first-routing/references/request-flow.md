# Request Flow

How requests are routed in the Hugo + Cloudflare Pages hybrid architecture.

## Edge Network Routing

```
User Request
     │
     ▼
┌─────────────────────────────────────────┐
│         Cloudflare Edge Network          │
├─────────────────────────────────────────┤
│                                          │
│  1. Check for Pages Function match       │
│     (/app/*, /api/*, custom routes)      │
│     ├─ YES → Execute Worker              │
│     │        └─ Return dynamic response  │
│     │                                    │
│     └─ NO → Continue to step 2           │
│                                          │
│  2. Check for static file                │
│     (/*, /blog/*, /css/*, etc.)          │
│     ├─ Found → Serve from CDN cache      │
│     │          └─ <50ms globally         │
│     │                                    │
│     └─ Not found → 404 page              │
│                                          │
└─────────────────────────────────────────┘
```

## Response Timing

| Route Type     | Typical Latency | Cache           |
| -------------- | --------------- | --------------- |
| Static HTML    | 5-50ms          | Edge (global)   |
| Static assets  | 5-20ms          | Edge (long TTL) |
| Pages Function | 50-200ms        | None (dynamic)  |
| D1 query       | +10-50ms        | Optional        |

## HTMX Request Pattern

**Initial Page Load (Static):**

```
GET /blog/my-post → CDN → Hugo HTML (200ms total)
                          └─ Includes HTMX form
```

**Form Submission (Dynamic):**

```
POST /app/_/comments → Worker → D1 → HTML partial (100ms)
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
Browser → Worker → D1 query → HTML partial
          │
          └─ functions/app/_/comments/[[id]].ts
```

**3. User posts comment (Dynamic)**

```
Browser → Worker → Validate → D1 insert → HTML partial
          │                              └─ New comment HTML
          └─ HX-Trigger: { notify: { message: "Comment posted!" } }
```

## Functions Directory Mapping

Files in `functions/` map directly to URLs:

| File                                 | URL                                         |
| ------------------------------------ | ------------------------------------------- |
| `functions/app/_/contact.ts`         | `/app/_/contact`                            |
| `functions/app/_/comments/[[id]].ts` | `/app/_/comments` and `/app/_/comments/:id` |
| `functions/api/search.ts`            | `/api/search`                               |

**Cloudflare Pages Function signature:**

```typescript
// functions/app/_/contact.ts
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const formData = await context.request.formData();
  // Handle form...
  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
};
```

## See Also

- [Path Conventions](./path-conventions.md) - URL patterns
