# Quickstart: Hugo Project Setup

**Feature**: 007-hugo-project-setup
**Date**: 2026-01-15

## Prerequisites

- **Hugo** 0.147.8 or higher (extended version recommended)
- **Node.js** 18+ and npm
- **Git** for version control

### Verify Hugo Installation

```bash
hugo version
# Should show: hugo v0.147.8 or higher
```

If Hugo is not installed or version is too old:
```bash
# macOS with Homebrew
brew install hugo

# Or download from https://gohugo.io/installation/
```

## Quick Setup

### 1. Navigate to Hugo Directory

```bash
cd hugo/
```

### 2. Install Dependencies

```bash
npm install
```

This installs:
- TailwindCSS 4
- DaisyUI 5
- @tailwindcss/typography
- Prettier with Hugo/Tailwind plugins

### 3. Start Development Server

```bash
hugo server
```

The site will be available at `http://localhost:1313/`

### 4. Production Build

```bash
hugo --minify
```

Output will be in `hugo/public/` directory.

## Project Structure Overview

```
hugo/
├── hugo.yaml              # Hugo configuration
├── package.json           # npm dependencies
├── tailwind.config.js     # TailwindCSS config
├── assets/css/styles.css  # CSS entry point
├── config/_default/       # Site configuration
│   ├── params.yaml        # Site parameters
│   └── menus.yaml         # Navigation menus
├── content/               # Markdown content
├── data/home/             # Homepage data
├── layouts/               # Templates
│   ├── baseof.html        # Base layout
│   ├── home.html          # Homepage
│   ├── single.html        # Content pages
│   ├── list.html          # Section pages
│   ├── 404.html           # Error page
│   └── _partials/         # Reusable components
└── static/                # Static files
```

## Common Tasks

### Add a New Page

1. Create markdown file in `content/`:
```bash
hugo new posts/my-first-post.md
```

2. Edit the front matter and content:
```markdown
---
title: "My First Post"
description: "A brief description"
date: 2026-01-15
---

Your content here...
```

3. View at `http://localhost:1313/posts/my-first-post/`

### Customize the Theme

Edit `assets/css/styles.css` to modify the DaisyUI theme:

```css
@plugin "daisyui/theme" {
  name: "lemonade";
  --color-primary: oklch(58.92% 0.199 134.6);
  /* Add or modify colors */
}
```

### Add Navigation Links

Edit `config/_default/menus.yaml`:

```yaml
main:
  - name: "About"
    url: "/about/"
    weight: 1
  - name: "Blog"
    url: "/posts/"
    weight: 2
```

### Configure SEO

Edit `config/_default/params.yaml`:

```yaml
title: "Your Site Title"
description: "Your site description for SEO"
googleAnalytics: "G-XXXXXXXXXX"  # Optional
```

### Add Homepage Sections

Edit files in `data/home/`:

- `hero.yaml` - Hero section with title, subtitle, CTA
- `services.yaml` - Feature/service cards
- `sections.yaml` - Content sections with images
- `cta.yaml` - Call-to-action block

## Troubleshooting

### Hugo server fails to start

1. Verify Hugo version: `hugo version` (needs 0.147.8+)
2. Verify npm install completed: Check for `node_modules/`
3. Check for YAML syntax errors in config files

### Styles not loading

1. Verify `hugo_stats.json` exists (created on first build)
2. Check `tailwind.config.js` points to correct content source
3. Restart Hugo server after config changes

### CSS changes not reflecting

1. Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+R)
2. Check if class is used in a template (TailwindCSS purges unused)
3. Verify cache-buster config in `hugo.yaml`

## Development Workflow

1. **Start server**: `hugo server` (auto-reloads on changes)
2. **Edit templates**: Changes in `layouts/` reflect immediately
3. **Edit content**: Changes in `content/` reflect immediately
4. **Edit styles**: Changes in `assets/css/` trigger rebuild
5. **Build for production**: `hugo --minify` creates optimized output

## Next Steps

- [ ] Customize theme colors in `assets/css/styles.css`
- [ ] Update site parameters in `config/_default/params.yaml`
- [ ] Add navigation in `config/_default/menus.yaml`
- [ ] Create content pages in `content/`
- [ ] Configure homepage sections in `data/home/`
- [ ] Add favicon to `static/` directory
- [ ] Set up Google Analytics (optional)
