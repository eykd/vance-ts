---
name: web-browser
description: 'Allows to interact with web pages by performing actions such as clicking buttons, filling out forms, and navigating links. It works by remote controlling Google Chrome or Chromium browsers using the Chrome DevTools Protocol (CDP). When Claude needs to browse the web, it can use this skill to do so.'
license: Stolen from Mario
---

# Web Browser Skill

Minimal CDP tools for collaborative site exploration. Works on macOS and Linux.

## Start Chrome

```bash
./scripts/start.js                   # Fresh profile (GUI on macOS, headless on Linux)
./scripts/start.js --profile         # Copy your profile (cookies, logins)
./scripts/start.js --headless        # Force headless mode
./scripts/start.js --no-sandbox      # For containers/root (use with --headless)
```

Start Chrome on `:9222` with remote debugging.

**Platform behavior:**

- **macOS**: GUI mode by default, use `--headless` for headless
- **Linux with DISPLAY**: GUI mode
- **Linux without DISPLAY**: Headless mode auto-detected

**Container/CI usage:**

```bash
./scripts/start.js --headless --no-sandbox
```

**Note:** The browser is designed to stay open for reuse across multiple operations. There is no close/stop script—simply leave the browser running between tasks for efficiency. If you need to restart it, manually kill the Chrome process with `pkill -f "chrome.*remote-debugging-port=9222"` then run start.js again.

## Navigate

```bash
./scripts/nav.js https://example.com
./scripts/nav.js https://example.com --new
```

Navigate current tab or open new tab.

## Evaluate JavaScript

```bash
./scripts/eval.js 'document.title'
./scripts/eval.js 'document.querySelectorAll("a").length'
./scripts/eval.js 'JSON.stringify(Array.from(document.querySelectorAll("a")).map(a => ({ text: a.textContent.trim(), href: a.href })).filter(link => !link.href.startsWith("https://")))'
```

Execute JavaScript in active tab (async context). Be careful with string escaping, best to use single quotes.

## Screenshot

```bash
./scripts/screenshot.js
```

Screenshot current viewport, returns temp file path

## Pick Elements

```bash
./scripts/pick.js "Click the submit button"
```

Interactive element picker. Click to select, Cmd/Ctrl+Click for multi-select, Enter to finish.

**Note:** `pick.js` requires a visible browser window (GUI mode). It will not work in headless mode.
