# Hugo Static Site

Static site built with Hugo, TailwindCSS 4, and DaisyUI 5. Serves as the static-first layer of the Cloudflare Pages application.

## Commands

```bash
just hugo-dev      # Dev server at localhost:1313
just hugo-build    # Production build to public/
cd hugo && npm test  # Build verification tests
```

## Skills

- `/hugo-project-setup` - Project structure and configuration
- `/hugo-templates` - Layouts, partials, shortcodes
- `/hugo-search-indexing` - FTS5 search integration
- `/tailwind-daisyui-design` - Accessible UI components
- `/static-first-routing` - CDN vs Workers routing

## Structure

- `assets/` - Source files processed by Hugo Pipes (CSS)
- `config/` - Hugo configuration (menus, params)
- `content/` - Markdown content files
- `data/` - YAML/JSON data for templates
- `layouts/` - Go templates for rendering
- `static/` - Files copied as-is to output
- `public/` - Build output (gitignored)

## Security Architecture

### CSP and Inline Scripts

This static site uses `unsafe-inline` in the Content Security Policy for both scripts and styles. This is an **intentional architectural decision** appropriate for this context:

**Why this is acceptable:**

1. **Static content only** - No server-side user input processing or database
2. **Controlled template environment** - All inline scripts generated from trusted Hugo templates
3. **Limited attack surface** - No user-generated content or dynamic data rendering
4. **Third-party requirements** - Kit.com form embed and analytics require inline scripts
5. **Static site constraints** - Hugo templates generate inline styles for DaisyUI theme system

**Current inline script usage:**

- `cta-button.html:37` - Fathom goal tracking with hardcoded goal IDs (no user input)
- `kit-form.html` - Kit.com embed event listener (external service requirement)
- `scroll-tracking.js` - Analytics tracking (no user data in script context)

**Risk assessment:**

- **XSS risk**: VERY LOW - All dynamic values are hardcoded strings in templates, validated at build time
- **Goal ID interpolation**: Safe because values come from Hugo params/frontmatter (validated at build), never user input
- **Third-party scripts**: Allowlisted domains in CSP (usefathom.com, kit-user.ck.page)

**If requirements change:**

- User-generated content → Migrate to CSP nonces or hashes
- Dynamic goal IDs from external sources → Use data attributes + event delegation
- Stricter security requirements → Pre-render all analytics events server-side

### Testing Strategy

Use the `/web-browser` skill to verify front-end functionality:

- Kit.com form submission and tracking
- Fathom analytics goal firing
- Scroll depth tracking events
- CTA button click tracking

See `docs/testing/web-browser-tests.md` for test procedures.

### Visual Design Review with web-browser

To review the visual design, contrast, or styling of the Hugo site:

1. **Start Hugo dev server first:**

   ```bash
   just hugo-dev
   # WATCH OUTPUT for actual port: "Web Server is available at http://localhost:XXXX/"
   # Hugo uses 1314, 1315, etc. if 1313 is already in use by another server!
   ```

2. **Use web-browser skill** to navigate and capture screenshots:

   ```bash
   cd .claude/skills/web-browser
   ./scripts/nav.js http://localhost:XXXX/path/  # Use actual port from step 1
   ./scripts/eval.js 'document.title'  # Verify you're on the right site
   ./scripts/screenshot.js
   ```

3. **Inspect computed styles:**
   ```bash
   ./scripts/eval.js 'window.getComputedStyle(document.querySelector(".alert-warning"))'
   ```

**Important:**

- Always use `just hugo-dev` rather than serving `public/` with a static server
- **CHECK THE PORT** in the server output - multiple Hugo servers pick different ports
- Verify with `document.title` that you're testing the right site, not a different project
- The Hugo dev server provides proper routing, asset processing, and live reload

## Notes

- Uses `npx hugo` for consistent version (v0.154.5)
- TailwindCSS built via Hugo Pipes with PostCSS
- Build tests verify output structure before deploy
