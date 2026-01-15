# Hugo Static Site

Modern static website built with Hugo, TailwindCSS 4, and DaisyUI 5.

## Quick Start

### Prerequisites

- **Node.js** 18+ and npm (Hugo is installed via npm as a project dependency)

### Installation

From the project root:

```bash
just hugo-install
```

Or manually:

```bash
cd hugo
npm install
```

### Development

Start the development server:

```bash
just hugo-dev
```

Or manually:

```bash
cd hugo
npx hugo server
```

The site will be available at **http://localhost:1313/** with hot-reload enabled.

### Production Build

Build the site for production:

```bash
just hugo-build
```

Or manually:

```bash
cd hugo
npx hugo --minify
```

Output will be in `hugo/public/` directory.

## Available Just Commands

From the project root, you can use these commands:

- `just hugo-install` - Install Hugo dependencies
- `just hugo-dev` - Start development server
- `just hugo-build` - Build for production
- `just hugo-clean` - Clean build artifacts
- `just hugo-rebuild` - Clean and rebuild
- `just hugo-check` - Verify Hugo installation

## Project Structure

```
hugo/
├── assets/css/          # TailwindCSS styles
├── config/_default/     # Site configuration
│   ├── params.yaml      # Site parameters
│   └── menus.yaml       # Navigation menus
├── content/             # Markdown content
├── data/                # Data files (YAML)
├── layouts/             # HTML templates
│   ├── baseof.html      # Base layout
│   ├── home.html        # Homepage
│   ├── single.html      # Single pages
│   ├── list.html        # List pages
│   ├── 404.html         # Error page
│   └── _partials/       # Reusable components
└── static/              # Static files
```

## Tech Stack

- **Hugo** 0.154.5 (extended) - Static site generator (installed via npm)
- **TailwindCSS** 4 - Utility-first CSS framework
- **DaisyUI** 5 - Component library (theme: "lemonade")
- **@tailwindcss/typography** - Prose styling for content

## Configuration

### Site Parameters

Edit `config/_default/params.yaml` to customize:

- Site title and description
- SEO settings
- Social media links
- Google Analytics (optional)

### Navigation

Edit `config/_default/menus.yaml` to customize:

- Main navigation
- Button CTAs
- Footer links

### Theme Colors

Edit `assets/css/styles.css` to customize the DaisyUI theme colors (OKLCH color space).

## Adding Content

### Create a New Page

```bash
cd hugo
npx hugo new posts/my-new-post.md
```

### Front Matter Example

```yaml
---
title: "My New Post"
description: "A brief description"
date: 2026-01-15
draft: false
featured_image: "/images/hero.jpg"
tags: ["example", "hugo"]
---

Your content here...
```

## Troubleshooting

### Hugo Server Won't Start

1. Verify Hugo is installed: `cd hugo && npx hugo version` (should be 0.154.5)
2. Verify dependencies: `cd hugo && npm install`
3. Check for syntax errors in `hugo.yaml`

### Styles Not Loading

1. Hard refresh browser (Cmd+Shift+R)
2. Verify `hugo_stats.json` exists (created on first build)
3. Check TailwindCSS config points to `hugo_stats.json`
4. Restart Hugo server after config changes

### Changes Not Reflecting

1. Hugo uses fast render mode - try `npx hugo server --disableFastRender`
2. Check if the changed file is being watched (see console output)
3. Clear browser cache

## Important Notes

### Hugo Version

This project uses **Hugo installed via npm** (`hugo-extended` package) to ensure consistent versions across all environments. Hugo v0.154.5 is automatically installed when you run `npm install`.

To verify your Hugo installation:

```bash
cd hugo
npx hugo version
```

Should show: `hugo v0.154.5`

### Dependencies

The project requires native modules (TailwindCSS, @parcel/watcher) that must be compiled for your platform. If you encounter issues:

```bash
cd hugo
rm -rf node_modules package-lock.json
npm install
```

## Production Deployment

The `hugo/public/` directory contains the production-ready static site. Deploy to:

- **Cloudflare Pages**
- **Netlify**
- **Vercel**
- **GitHub Pages**
- Any static hosting service

### Build Command

```bash
npx hugo --minify
```

### Output Directory

```
public/
```

## Performance

- **Build time**: ~300ms for full site
- **Hot reload**: < 100ms for changes
- **CSS size**: Optimized via TailwindCSS purging
- **HTML**: Minified in production builds

## Documentation

- [Hugo Documentation](https://gohugo.io/documentation/)
- [TailwindCSS v4 Docs](https://tailwindcss.com/)
- [DaisyUI Components](https://daisyui.com/)
- [Project Quickstart](../specs/007-hugo-project-setup/quickstart.md)

## License

See root project LICENSE file.
