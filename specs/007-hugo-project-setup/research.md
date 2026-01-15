# Research: Hugo Project Setup with TailwindCSS and DaisyUI

**Feature**: 007-hugo-project-setup
**Date**: 2026-01-15

## Research Tasks Completed

### 1. Hugo + TailwindCSS 4 Integration Pattern

**Decision**: Use Hugo's native `css.TailwindCSS` pipe with `hugo_stats.json` for CSS purging

**Rationale**:
- Hugo 0.147.8+ includes native TailwindCSS processing via the `css.TailwindCSS` function
- The `hugo_stats.json` file tracks all HTML classes used across templates, enabling accurate CSS purging
- This approach requires no external build step (no PostCSS CLI, no separate npm scripts for CSS)
- The exemplar project successfully uses this pattern

**Alternatives Considered**:
- PostCSS CLI with separate build step: Rejected - adds complexity, requires coordinating Hugo and npm builds
- Hugo Pipes with PostCSS: Rejected - older approach, TailwindCSS 4 has native Hugo support
- Separate CSS build with watch mode: Rejected - more moving parts, harder to maintain

### 2. TailwindCSS 4 Configuration for Hugo

**Decision**: Use `hugo_stats.json` as the sole content source in `tailwind.config.js`

**Rationale**:
- Hugo automatically generates `hugo_stats.json` containing all CSS classes found in templates
- This file is the most accurate source for purging - it reflects actual template usage
- Configuring Tailwind to scan template files directly would duplicate Hugo's built-in analysis

**Configuration Pattern**:
```javascript
module.exports = {
  content: ["./hugo_stats.json"],
  plugins: [typography, require("daisyui")],
  // ...
}
```

### 3. DaisyUI 5 Theme Configuration

**Decision**: Configure theme using `@plugin "daisyui/theme"` syntax in CSS with OKLCH colors

**Rationale**:
- DaisyUI 5 uses a new theming approach with `@plugin` directives
- OKLCH color space provides perceptually uniform color manipulation
- The "lemonade" theme from the exemplar uses green-based palette suitable for many projects
- Theme can be customized by modifying CSS variables without changing configuration files

**Theme Structure**:
- Base colors: base-100, base-200, base-300, base-content
- Semantic colors: primary, secondary, accent, neutral
- State colors: info, success, warning, error
- Design tokens: radius-selector, radius-field, radius-box, border, depth, noise

### 4. Hugo Build Stats Configuration

**Decision**: Enable `buildStats` in `hugo.yaml` with cache-buster configuration

**Rationale**:
- Build stats tracks CSS class usage across all templates
- Module mount makes `hugo_stats.json` available to TailwindCSS
- Cache-busters ensure CSS regenerates when Tailwind config changes
- `disableWatch` on stats file prevents infinite rebuild loops

**Configuration Pattern**:
```yaml
build:
  buildStats:
    enable: true
  cachebusters:
    - source: "assets/notwatching/hugo_stats\\.json"
      target: "css"
    - source: "(postcss|tailwind)\\.config\\.js"
      target: 'css'

module:
  mounts:
    - source: 'hugo_stats.json'
      target: 'assets/notwatching/hugo_stats.json'
      disableWatch: true
```

### 5. SEO Partials Best Practices

**Decision**: Implement separate partials for each SEO concern with configurable parameters

**Rationale**:
- Separation of concerns: each partial handles one aspect (OG, Twitter, schema, analytics)
- Parameters from `config/_default/params.yaml` provide site-wide defaults
- Page-level overrides via front matter enable per-page customization
- Conditional rendering (check for required params before outputting tags)

**Partials Structure**:
- `opengraph.html`: og:title, og:description, og:image, og:url, og:type
- `twitter_cards.html`: twitter:card, twitter:site, twitter:title, twitter:description, twitter:image
- `schema.html`: WebSite, Article, BreadcrumbList JSON-LD
- `google_analytics.html`: GA4 script with configurable measurement ID

### 6. CSS Entry Point Structure

**Decision**: Use CSS imports with `@plugin` directives for TailwindCSS 4

**Rationale**:
- TailwindCSS 4 uses `@import 'tailwindcss'` instead of `@tailwind` directives
- Plugins are loaded via `@plugin` directive
- Custom theme variables defined in `@theme` block
- Allows modular CSS organization with separate files for components

**Entry Point Pattern**:
```css
@import 'tailwindcss';
@plugin "@tailwindcss/typography";
@plugin "daisyui";

@theme {
  --font-sans: Inter, sans-serif;
  --font-serif: Georgia, serif;
}

@plugin "daisyui/theme" {
  name: "lemonade";
  /* theme colors */
}
```

### 7. Layout Template Architecture

**Decision**: Use Hugo's block-based template inheritance with `baseof.html`

**Rationale**:
- `baseof.html` provides consistent HTML structure across all pages
- Named blocks (`main`, `page-styles`) enable page-specific content injection
- Partials for reusable components (header, footer, SEO tags)
- Deferred template execution for TailwindCSS ensures all classes are collected

**Template Hierarchy**:
```
baseof.html (defines: html, head, body structure)
├── home.html (defines: main block for homepage)
├── single.html (defines: main block for content pages)
├── list.html (defines: main block for section pages)
└── 404.html (defines: main block for error page)
```

## Unknowns Resolved

All technical unknowns from the specification have been resolved through analysis of:
- The exemplar project (herbalmedicinegarden.com)
- Hugo documentation for TailwindCSS integration
- TailwindCSS 4 and DaisyUI 5 documentation

## Dependencies Verified

| Dependency | Version | Purpose |
| ---------- | ------- | ------- |
| Hugo | 0.147.8+ | Static site generator with TailwindCSS pipe |
| TailwindCSS | ^4.1 | Utility-first CSS framework |
| DaisyUI | ^5.0 | Component library for TailwindCSS |
| @tailwindcss/typography | ^0.5 | Prose styling for content |
| prettier | ^3.0 | Code formatting |
| prettier-plugin-go-template | ^0.0.15 | Hugo template formatting |
| prettier-plugin-tailwindcss | ^0.5 | TailwindCSS class sorting |

## Next Steps

Proceed to Phase 1: Design & Contracts
- Generate data-model.md (file/directory structure)
- Generate quickstart.md (setup instructions)
- Contracts N/A (static site, no API)
