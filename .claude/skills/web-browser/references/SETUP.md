# Setup Guide

## Installation

### 1. Install Skill Dependencies

```bash
cd scripts && npm install
```

This installs puppeteer-core and other Node.js dependencies needed by the scripts.

### 2. Install Playwright Chromium (Recommended)

```bash
npm install -g playwright
npx playwright install chromium --with-deps
```

This installs Chromium to `~/.cache/ms-playwright/chromium-1200/chrome-linux64/chrome` with all required system dependencies (fonts, libraries, rendering engines, etc.).

## Why Playwright?

The skill is standardized on Playwright Chromium for consistency:

- ✓ **Same Chrome version everywhere**: Dev, CI, production all use Chrome 143.0.7499.4
- ✓ **Works in headless servers**: No X11/DISPLAY required
- ✓ **No system dependencies**: Doesn't require Chrome/Chromium to be installed system-wide
- ✓ **Automatic dependency management**: `--with-deps` installs fonts, libraries, etc.
- ✓ **Small footprint**: Only ~165MB total
- ✓ **Isolated**: Won't interfere with system Chrome installation

The skill will fall back to system Chrome if Playwright isn't installed, but Playwright is preferred.

## Platform Behavior

The `start.js` script auto-detects the environment:

- **macOS**: GUI mode by default, use `--headless` to force headless
- **Linux with DISPLAY**: GUI mode
- **Linux without DISPLAY**: Headless mode auto-detected
- **Containers/CI**: Use `--headless --no-sandbox`

## Troubleshooting

### Chrome won't start

1. Check if Chrome is already running on port 9222:

   ```bash
   curl http://localhost:9222/json/version
   ```

2. If it's running but unresponsive, kill and restart:
   ```bash
   pkill -f "chrome.*remote-debugging-port=9222"
   ./scripts/start.js
   ```

### "Failed to connect to Chrome"

- **If you see this error**, Chrome started but puppeteer couldn't connect
- Try increasing the connection timeout or check firewall settings
- In containers, ensure `--no-sandbox` flag is used

### Playwright not found

If you get "Chrome/Chromium not found":

```bash
# Install Playwright globally
npm install -g playwright

# Install Chromium with dependencies
npx playwright install chromium --with-deps
```

### Permission errors in containers

When running as root in Docker/containers, you must use `--no-sandbox`:

```bash
./scripts/start.js --headless --no-sandbox
```

## Alternative: System Chrome

If you prefer to use system Chrome instead of Playwright:

**macOS:**

```bash
# Install from https://www.google.com/chrome/
```

**Linux:**

```bash
# Debian/Ubuntu
apt install google-chrome-stable

# Or Chromium
apt install chromium-browser
```

The skill will automatically detect and use system Chrome if Playwright Chromium isn't found.
