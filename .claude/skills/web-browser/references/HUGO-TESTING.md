# Testing Hugo Sites with web-browser

## Quick Start

```bash
# 1. Start Hugo dev server (from project root)
just hugo-dev
# IMPORTANT: Check the output for the actual port!
# Hugo will use a different port if 1313 is already in use

# 2. Verify which port was used
# Look for: "Web Server is available at http://localhost:XXXX/"

# 3. Navigate with web-browser (from skill directory)
cd .claude/skills/web-browser
./scripts/start.js --headless --no-sandbox
./scripts/nav.js http://localhost:XXXX  # Use actual port from step 2!
./scripts/screenshot.js

# 4. Verify you're on the right site
./scripts/eval.js 'document.title'  # Should match expected site title
```

## Why Use Hugo Dev Server

**Always use `just hugo-dev`** instead of:

- ❌ Serving `public/` with Python HTTP server
- ❌ Manual `npx hugo server` commands (use `just` for consistency)
- ❌ Opening `public/index.html` directly in browser

**Reasons:**

1. **Proper routing** - Hugo dev server handles redirects and URL structure
2. **Live reload** - Changes to content/templates update automatically
3. **Asset processing** - TailwindCSS compilation, Hugo Pipes work correctly
4. **Draft content** - Can include drafts with `--buildDrafts` flag
5. **Base URL** - Correctly resolves relative paths and assets

## Common Workflows

### Visual Design Review

Review colors, contrast, spacing, typography:

```bash
# Start server
just hugo-dev

# Navigate to page
./scripts/nav.js http://localhost:1313/path/

# Capture screenshot
./scripts/screenshot.js

# Inspect element styles
./scripts/eval.js '(function() {
  var el = document.querySelector(".alert-warning");
  var styles = window.getComputedStyle(el);
  return JSON.stringify({
    bg: styles.backgroundColor,
    color: styles.color,
    padding: styles.padding
  });
})()'

# Scroll to element
./scripts/eval.js 'document.querySelector(".alert-warning").scrollIntoView({block: "center"})'
./scripts/screenshot.js
```

### Contrast Analysis

Check WCAG compliance for color combinations:

```bash
# Get computed OKLCH values
./scripts/eval.js '(function() {
  var el = document.querySelector(".target-element");
  var styles = window.getComputedStyle(el);
  return JSON.stringify({
    background: styles.backgroundColor,
    text: styles.color
  });
})()'
```

### Form Testing

Test Kit.com forms, analytics tracking:

```bash
# Navigate to page with form
./scripts/nav.js http://localhost:1313/

# Check if form loaded
./scripts/eval.js 'document.querySelector("#kit-waitlist-form") !== null'

# Wait for external script to load
./scripts/eval.js 'new Promise(resolve => setTimeout(resolve, 2000)).then(() => "done")'

# Capture final state
./scripts/screenshot.js
```

### Link Navigation Testing

Follow multi-page flows (e.g., MPPS sequence):

```bash
# Start at root
./scripts/nav.js http://localhost:1313/

# Get CTA link
./scripts/eval.js 'document.querySelector("a[href*=system]").href'

# Navigate to next page
./scripts/nav.js http://localhost:1313/system/

# Repeat for each page in sequence
```

## Troubleshooting

### Hugo Server Not Running

**Symptom:** `net::ERR_CONNECTION_REFUSED at http://localhost:1313`

**Solution:**

```bash
# Check if server is running
curl -I http://localhost:1313

# Start if not running
just hugo-dev

# Wait a few seconds, then try again
```

### Wrong Hugo Server Running

**Symptom:** Getting 404 for pages that should exist, or seeing content from a different project

**Cause:** Multiple Hugo servers running on different ports. When port 1313 is already in use, Hugo automatically picks the next available port (e.g., 1314, 1315, etc.).

**Critical Check:**

```bash
# Check which Hugo servers are running
ps aux | grep "hugo server" | grep -v grep

# Look for output like:
# sprite  12345 ... hugo server --bind 0.0.0.0 --port 1313
# sprite  67890 ... hugo server --bind 0.0.0.0 --port 1314

# This shows TWO servers - one on 1313, one on 1314!
```

**Solution:**

```bash
# Option 1: Kill old servers and start fresh
pkill -f "hugo server"
just hugo-dev
# Watch output: "Web Server is available at http://localhost:XXXX/"
# Use THAT port number!

# Option 2: Identify which port is YOUR project
curl http://localhost:1313 | grep "<title>"
curl http://localhost:1314 | grep "<title>"
# Compare titles to find the right server

# Option 3: Check working directory of running servers
ps aux | grep "hugo server" | grep -v grep
lsof -p <PID> | grep cwd
# This shows which directory each server is serving
```

**Prevention:**
Always check the `just hugo-dev` output for the actual port:

```
Web Server is available at http://localhost:1314/ (bind address 0.0.0.0)
```

Use port **1314** in this example, not the default 1313!

### Styles Not Applying

**Symptom:** Page looks unstyled or has default browser styles

**Cause:** Serving static files instead of using Hugo dev server

**Solution:**

```bash
# Don't do this:
cd hugo/public && python3 -m http.server 8080

# Do this instead:
just hugo-dev
```

### JavaScript Evaluation Errors

**Symptom:** `SyntaxError` when running `eval.js`

**Common issues:**

1. Using `const`/`let` - wrap in IIFE: `(function() { ... })()`
2. Shell quote issues - use single quotes for outer: `./scripts/eval.js '...'`
3. Unescaped special characters - especially `!` in bash

**Example:**

```bash
# Bad: const causes SyntaxError
./scripts/eval.js 'const x = 5; x'

# Good: IIFE wrapping
./scripts/eval.js '(function() { var x = 5; return x; })()'
```

## Best Practices

1. **Always start Hugo dev server first** before using web-browser
2. **Use `just hugo-dev`** instead of manual commands for consistency
3. **CHECK THE PORT in the output** - Hugo picks a different port if 1313 is busy
4. **Verify you're on the right site** - check `document.title` after navigating
5. **Check for multiple servers** with `ps aux | grep "hugo server"` if something seems wrong
6. **Check server is running** with `curl -I` before navigating
7. **Wait for page load** after navigation (3-5 seconds) before screenshots
8. **Use IIFEs** for complex JavaScript in `eval.js`
9. **Scroll elements into view** before screenshots for better framing
10. **Clean up background processes** - Hugo dev server can be left running, but be aware of port conflicts

## Reference

- Main skill docs: `../SKILL.md`
- Hugo commands: `../../hugo/CLAUDE.md`
- Setup instructions: `./SETUP.md`
