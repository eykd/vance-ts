# Path Conventions

URL structure and naming patterns for static-first routing.

## URL Hierarchy

```
/                           # Homepage (Hugo)
├── /about                  # Static page (Hugo)
├── /blog/                  # Blog listing (Hugo)
│   └── /blog/my-post       # Blog post (Hugo)
├── /contact                # Contact page (Hugo, form posts to /app/_/)
│
├── /app/                   # Dynamic application routes (Worker)
│   ├── /app/dashboard      # Full page (Worker-rendered)
│   └── /app/_/             # HTMX partials (Worker)
│       ├── /app/_/contact  # Form handler
│       ├── /app/_/comments # Comment CRUD
│       └── /app/_/search   # Search endpoint
│
└── /api/                   # JSON API (Worker, if needed)
    └── /api/webhook        # Webhook handler
```

## Path Pattern Meanings

| Pattern    | Meaning        | Response Type  |
| ---------- | -------------- | -------------- |
| `/*`       | Static content | Full HTML page |
| `/app/*`   | Dynamic pages  | Full HTML page |
| `/app/_/*` | HTMX partials  | HTML fragment  |
| `/api/*`   | Data endpoints | JSON           |

## Hugo Content Paths

Hugo's `content/` directory maps directly to URLs:

| Content File              | URL             |
| ------------------------- | --------------- |
| `content/_index.md`       | `/`             |
| `content/about.md`        | `/about`        |
| `content/blog/_index.md`  | `/blog/`        |
| `content/blog/my-post.md` | `/blog/my-post` |

## API Endpoint Configuration

Configure HTMX endpoints in `hugo.toml`:

```toml
[params.api]
  contact = "/app/_/contact"
  comments = "/app/_/comments"
  search = "/app/_/search"
  newsletter = "/app/_/newsletter"
```

Access in templates:

```html
<form hx-post="{{ .Site.Params.api.contact }}"></form>
```

## HTMX Partial Naming

The `_` prefix indicates "partial" - these routes return HTML fragments for HTMX swaps, not full pages.

**Partial Response:**

```html
<!-- Just the content to swap -->
<div class="alert alert-success">
  <span>Message sent successfully!</span>
</div>
```

**Full Page Response:**

```html
<!DOCTYPE html>
<html>
  <head>
    ...
  </head>
  <body>
    <nav>...</nav>
    <main>...</main>
    <footer>...</footer>
  </body>
</html>
```

## HTTP Methods by Route

| Route                 | GET    | POST        | PUT    | DELETE |
| --------------------- | ------ | ----------- | ------ | ------ |
| `/app/_/contact`      | —      | Submit form | —      | —      |
| `/app/_/comments`     | List   | Create      | —      | —      |
| `/app/_/comments/:id` | Single | —           | Update | Delete |
| `/app/_/search`       | Query  | —           | —      | —      |

## Worker Route Patterns

Routes are registered in `src/worker.ts` using Hono:

```typescript
// src/worker.ts - Hono route registration
app.post('/app/_/contact', handleContactPost);
app.get('/app/_/comments', handleCommentsList);
app.post('/app/_/comments', handleCommentsCreate);
app.get('/app/_/comments/:id', handleCommentsGet);
app.put('/app/_/comments/:id', handleCommentsUpdate);
app.delete('/app/_/comments/:id', handleCommentsDelete);
app.get('/app/_/search', handleSearch);
```

## Static Asset Paths

Assets served directly from CDN:

| Path                | Content              |
| ------------------- | -------------------- |
| `/css/app.css`      | Compiled TailwindCSS |
| `/js/htmx.min.js`   | HTMX library         |
| `/js/alpine.min.js` | Alpine.js            |
| `/images/*`         | Image files          |
| `/favicon.ico`      | Favicon              |

## See Also

- [Request Flow](./request-flow.md) - How routing works
