# Build Pipeline

Development workflow and deployment for Hugo + Cloudflare Pages.

## Development Workflow

### Terminal 1: Hugo Server (Content Development)

```bash
cd hugo && hugo server -D --bind 0.0.0.0 --port 1313
```

- Live reload for content and template changes
- Drafts visible with `-D` flag
- Access at `http://localhost:1313`

### Terminal 2: TailwindCSS Watch

```bash
npm run css:watch
```

Or directly:

```bash
npx @tailwindcss/cli -i hugo/assets/css/main.css -o hugo/static/css/app.css --watch
```

### Terminal 3: Wrangler Dev (Full Stack)

```bash
npm run dev
```

Or directly:

```bash
wrangler pages dev dist --compatibility-flags=nodejs_compat
```

- Full stack with Pages Functions
- D1 and KV bindings available
- Access at `http://localhost:8788`

## Build Commands

### Local Development Build

```bash
# Build Hugo site
cd hugo && hugo -D -d ../dist

# Build CSS
npx @tailwindcss/cli -i hugo/assets/css/main.css -o dist/css/app.css
```

### Production Build

```bash
npm run build
```

This runs:

1. `hugo --minify -d ../dist` - Minified Hugo build
2. `@tailwindcss/cli ... --minify` - Minified CSS

## Deployment

### Cloudflare Pages Deployment

```bash
npm run deploy
```

Or directly:

```bash
wrangler pages deploy dist
```

### Git-Based Deployment

Configure in Cloudflare Dashboard:

- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Root directory:** `/` (project root)

### Environment Variables

Set in Cloudflare Dashboard or `wrangler.toml`:

```toml
[vars]
  ENVIRONMENT = "production"
```

Secrets (API keys, etc.):

```bash
wrangler secret put API_KEY
```

## Database Setup

### Create D1 Database

```bash
wrangler d1 create my-hugo-app-db
```

Copy the `database_id` to `wrangler.toml`.

### Run Migrations

```bash
wrangler d1 migrations apply my-hugo-app-db
```

### Local D1 for Development

Wrangler automatically uses local SQLite for development:

```bash
wrangler pages dev dist --d1 DB=my-hugo-app-db
```

## Test Commands

```bash
# Run all tests
npm test

# Watch mode for TDD
npm run test:watch

# Run specific test file
npx vitest run tests/unit/domain/Comment.spec.ts
```

## CI/CD Pipeline

**GitHub Actions Example:**

```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Setup Hugo
        uses: peaceiris/actions-hugo@v3
        with:
          hugo-version: 'latest'
          extended: true

      - name: Install Dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Run Tests
        run: npm test

      - name: Deploy
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          command: pages deploy dist --project-name=my-hugo-app
```

## Common Issues

### Hugo Not Finding Templates

Ensure you're running Hugo from the `hugo/` directory:

```bash
cd hugo && hugo server
```

### Functions Not Working

Check that `pages_build_output_dir` in `wrangler.toml` matches Hugo's output directory.

### TailwindCSS Not Updating

Ensure content paths in `tailwind.config.ts` include all template files:

```typescript
content: [
  './hugo/layouts/**/*.html',
  './hugo/content/**/*.md',
  './src/**/*.ts',
],
```

## See Also

- [Directory Structure](./directory-structure.md) - Project layout
- [Configuration](./configuration.md) - Config files
