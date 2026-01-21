---
name: web-browser
description: 'Remote control Chrome/Chromium via CDP for web automation: navigate pages, take screenshots, execute JavaScript, inspect elements. Use for testing UIs, scraping dynamic content, or capturing page states.'
license: Stolen from Mario
---

# Web Browser Skill

Chrome automation via CDP (Chrome DevTools Protocol). Works on macOS and Linux.

## Start Chrome (if not running)

```bash
./scripts/start.js                          # Auto-detects headless mode
./scripts/start.js --headless --no-sandbox  # Container/CI
```

Chrome starts on `:9222`. Browser stays open for reuse—no need to restart between operations.

**First time?** See [SETUP.md](references/SETUP.md) for installation.

## Core Operations

**Navigate:**

```bash
./scripts/nav.js https://example.com
./scripts/nav.js https://example.com --new  # Open new tab
```

**Screenshot:**

```bash
./scripts/screenshot.js  # Returns: /tmp/screenshot-*.png
```

**Execute JavaScript:**

```bash
./scripts/eval.js 'document.title'
./scripts/eval.js 'document.querySelectorAll("a").length'
```

**Pick elements** (GUI only, not headless):

```bash
./scripts/pick.js "Click the submit button"
```

## Common Patterns

**Capture localhost page:**

```bash
./scripts/start.js --headless
./scripts/nav.js http://localhost:3000
./scripts/screenshot.js
```

**Extract link data:**

```bash
./scripts/eval.js 'JSON.stringify(Array.from(document.querySelectorAll("a")).map(a => ({text: a.textContent.trim(), href: a.href})))'
```

**Restart if needed:**

```bash
pkill -f "chrome.*9222" && ./scripts/start.js
```

## Working with Hugo Sites

When testing Hugo static sites, **always use the Hugo dev server** instead of serving built files:

```bash
# From project root
just hugo-dev
# WATCH OUTPUT: "Web Server is available at http://localhost:XXXX/"
# Hugo uses a different port if 1313 is already in use!

# Navigate to the ACTUAL port shown in output
./scripts/nav.js http://localhost:XXXX

# Verify you're on the right site
./scripts/eval.js 'document.title'
```

**Why use Hugo dev server:**

- Live reload on content changes
- Proper URL routing and redirects
- Asset processing with Hugo Pipes
- Serves drafts with `--buildDrafts` flag

**Critical:** If you have multiple Hugo servers running (different projects), Hugo will auto-select an available port (1313, 1314, 1315, etc.). Always check the output and verify with `document.title` that you're testing the right site.

**Don't** serve the `public/` directory with Python/static servers - Hugo's dev server provides the complete development experience.

## Tips

- Browser persists between operations for efficiency
- Use single quotes in `eval.js` to avoid shell escaping issues
- Screenshots are saved to `/tmp/` with timestamps
- `pick.js` requires visible browser (won't work in headless mode)
