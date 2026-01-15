# Data Model: Hugo Project Setup

**Feature**: 007-hugo-project-setup
**Date**: 2026-01-15

## Overview

This feature creates a file-based Hugo project structure. Unlike database-driven applications, Hugo uses files as its data model. This document describes the file entities, their structure, and relationships.

## File Entities

### 1. Hugo Configuration (`hugo.yaml`)

**Purpose**: Main Hugo configuration file defining build behavior, module mounts, and output settings.

**Fields**:
| Field | Type | Required | Description |
| ----- | ---- | -------- | ----------- |
| languageCode | string | Yes | Site language (e.g., "en-us") |
| build.buildStats.enable | boolean | Yes | Enable CSS class tracking |
| build.cachebusters | array | Yes | Cache invalidation rules |
| module.hugo_version.min | string | Yes | Minimum Hugo version |
| module.mounts | array | Yes | File system mounts |
| taxonomies | object | No | Content taxonomies (tags, series) |
| outputs | object | Yes | Output formats per page type |

**Relationships**:
- References `hugo_stats.json` via module mount
- Affects all layout templates via build configuration

### 2. TailwindCSS Configuration (`tailwind.config.js`)

**Purpose**: TailwindCSS configuration defining content sources, plugins, and theme extensions.

**Fields**:
| Field | Type | Required | Description |
| ----- | ---- | -------- | ----------- |
| content | array | Yes | Files to scan for CSS classes |
| plugins | array | Yes | TailwindCSS plugins to load |
| darkMode | string | No | Dark mode strategy |
| theme.extend | object | No | Theme customizations |

**Relationships**:
- Reads from `hugo_stats.json` for CSS purging
- Loaded by Hugo's `css.TailwindCSS` pipe

### 3. CSS Entry Point (`assets/css/styles.css`)

**Purpose**: Main CSS file importing TailwindCSS and defining theme.

**Sections**:
| Section | Purpose |
| ------- | ------- |
| @import 'tailwindcss' | Load TailwindCSS base |
| @plugin directives | Load typography, DaisyUI |
| @theme block | Custom font families |
| @plugin "daisyui/theme" | Theme color definitions |
| Custom styles | Additional CSS rules |

**Relationships**:
- Imported by `baseof.html` layout
- References `tailwind.config.js` for configuration

### 4. Site Parameters (`config/_default/params.yaml`)

**Purpose**: Site-wide configuration parameters accessible in templates.

**Fields**:
| Field | Type | Required | Description |
| ----- | ---- | -------- | ----------- |
| title | string | Yes | Site title |
| description | string | Yes | Site description for SEO |
| images | array | No | Default social sharing images |
| social | object | No | Social media URLs |
| location | array | No | Physical location lines |
| copyright | string | No | Copyright notice |
| googleAnalytics | string | No | GA4 measurement ID |

**Relationships**:
- Used by SEO partials for meta tags
- Used by footer partial for copyright

### 5. Navigation Menus (`config/_default/menus.yaml`)

**Purpose**: Define site navigation structure.

**Structure**:
```yaml
main:
  - name: "Link Name"
    url: "/path/"
    weight: 1

buttons:
  - name: "CTA Text"
    url: "/action/"

footer:
  - name: "Footer Link"
    url: "/page/"
```

**Relationships**:
- Used by header partial for main navigation
- Used by footer partial for footer links

### 6. Content Files (`content/**/*.md`)

**Purpose**: Markdown content with front matter metadata.

**Front Matter Fields**:
| Field | Type | Required | Description |
| ----- | ---- | -------- | ----------- |
| title | string | Yes | Page title |
| description | string | No | Page description |
| date | datetime | No | Publication date |
| draft | boolean | No | Draft status |
| featured_image | string | No | Hero image path |
| toc | boolean | No | Show table of contents |
| tags | array | No | Content tags |
| series | array | No | Content series |

**Relationships**:
- Rendered by layout templates (single.html, list.html)
- Metadata used by SEO partials

### 7. Homepage Data (`data/home/*.yaml`)

**Purpose**: Structured data for homepage sections.

**Data Files**:
| File | Purpose |
| ---- | ------- |
| hero.yaml | Hero section content |
| services.yaml | Services/features grid |
| sections.yaml | Content sections |
| cta.yaml | Call-to-action block |

**Relationships**:
- Accessed via `site.Data.home.*` in templates
- Rendered by homepage partials

## Layout Templates

### Template Hierarchy

```
baseof.html
├── Defines: <!DOCTYPE html>, <html>, <head>, <body>
├── Blocks: page-styles, main
├── Includes: SEO partials, header, footer
└── Loads: TailwindCSS via css.TailwindCSS pipe

home.html (extends baseof.html)
├── Defines: main block
├── Renders: hero, services, sections, CTA from data/home/
└── Optional: page-styles block for hero background

single.html (extends baseof.html)
├── Defines: main block
├── Renders: article with featured image, title, content
├── Optional: table of contents sidebar
└── Uses: @tailwindcss/typography for prose styling

list.html (extends baseof.html)
├── Defines: main block
├── Renders: section title, paginated card grid
└── Links: to child pages

404.html (extends baseof.html)
├── Defines: main block
└── Renders: error message with navigation link
```

## Partial Templates

### Shared Partials (`_partials/shared/`)

| Partial | Purpose | Inputs |
| ------- | ------- | ------ |
| header.html | Site navigation | site.Menus.main, site.Menus.buttons |
| footer.html | Site footer | site.Params.*, site.Menus.footer |

### SEO Partials (`_partials/seo/`)

| Partial | Purpose | Inputs |
| ------- | ------- | ------ |
| opengraph.html | Open Graph meta tags | .Title, .Description, .Permalink |
| twitter_cards.html | Twitter Card meta tags | .Title, .Description, .Params.images |
| schema.html | JSON-LD structured data | .Title, .Description, .IsHome |
| google_analytics.html | GA4 script | site.Params.googleAnalytics |

### Component Partials (`_partials/components/`)

| Partial | Purpose | Inputs |
| ------- | ------- | ------ |
| button/primary.html | Primary CTA button | label, href |
| button/outline.html | Secondary button | label, href |

## State Transitions

Hugo is a static site generator with no runtime state. However, content has lifecycle states:

| State | Description | Indicator |
| ----- | ----------- | --------- |
| Draft | Not published | `draft: true` in front matter |
| Published | Visible on site | `draft: false` or omitted |
| Scheduled | Future publish date | `date` in future |

## Validation Rules

### Configuration Files
- `hugo.yaml`: Must have valid YAML syntax, buildStats enabled
- `tailwind.config.js`: Must export valid config object
- `params.yaml`: Must have title and description

### Content Files
- Must have valid front matter (YAML between `---` markers)
- Title required for all non-index pages
- Date format: ISO 8601

### Layout Templates
- Must use valid Go template syntax
- All partials must exist before reference
- Block names must match baseof.html definitions
