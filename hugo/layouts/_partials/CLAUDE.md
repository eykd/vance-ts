# Partials

Reusable Go template fragments included via `{{ partial "path/name.html" . }}`.

## Structure

- `blocks/` - Page section blocks (hero, features)
- `components/` - UI components (buttons, cards)
- `seo/` - SEO tags (OpenGraph, Schema.org, Twitter Cards)
- `shared/` - Site-wide elements (header, footer, pagination)

## Skills

- `/hugo-templates` - Partial patterns
- `/htmx-pattern-library` - HTMX interaction patterns
- `/tailwind-daisyui-design` - Component styling

## Conventions

- Organize by function: blocks for page sections, components for UI elements
- Pass context explicitly: `{{ partial "component.html" (dict "title" .Title) }}`
- Keep partials focused and composable
