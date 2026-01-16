# Layouts

Go templates that render content into HTML. Hugo's template lookup order determines which layout renders each page.

## Structure

- `baseof.html` - Base template with blocks for head, main, footer
- `home.html` - Home page layout
- `single.html` - Individual content pages
- `list.html` - Section/taxonomy list pages
- `404.html` - Not found page
- `rss.xml` - RSS feed template
- `_partials/` - Reusable template fragments

## Skills

- `/hugo-templates` - Template syntax and patterns
- `/htmx-alpine-templates` - HTMX/Alpine integration
- `/tailwind-daisyui-design` - DaisyUI component classes

## Conventions

- Use `{{ partial "path/name.html" . }}` for includes
- Template blocks: `{{ block "main" . }}{{ end }}`
- Prefer partials over inline HTML for reusability
