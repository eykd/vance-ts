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

## Notes

- Uses `npx hugo` for consistent version (v0.154.5)
- TailwindCSS built via Hugo Pipes with PostCSS
- Build tests verify output structure before deploy
