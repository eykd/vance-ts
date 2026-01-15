# Feature Specification: Hugo Project Setup with TailwindCSS and DaisyUI

**Feature Branch**: `007-hugo-project-setup`
**Created**: 2026-01-15
**Status**: Draft
**Input**: User description: "Create a new Hugo installation with TailwindCSS 4 and DaisyUI 5 theme setup"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Developer Creates New Hugo Site (Priority: P1)

A developer wants to create a new static website using Hugo with modern styling capabilities. They need a fully configured Hugo installation with TailwindCSS 4 and DaisyUI 5 integrated so they can immediately start building styled pages.

**Why this priority**: This is the foundational capability - without a working Hugo installation with the CSS framework properly configured, no other features can be built.

**Independent Test**: Can be fully tested by running `npm install && hugo server` and viewing a styled default page in the browser. Delivers immediate value as a working development environment.

**Acceptance Scenarios**:

1. **Given** a fresh workspace, **When** the developer runs `npm install && hugo server`, **Then** a development server starts without errors and serves a styled page
2. **Given** the development server is running, **When** the developer views the homepage, **Then** they see a page styled with DaisyUI components and TailwindCSS utilities
3. **Given** the Hugo installation, **When** the developer modifies a template file with TailwindCSS classes, **Then** the changes are reflected immediately via hot reload

---

### User Story 2 - Developer Uses Base Layout Template (Priority: P2)

A developer needs a base layout template (`baseof.html`) that properly loads TailwindCSS styles, includes standard HTML boilerplate, and provides extensible blocks for page-specific content.

**Why this priority**: The base layout is the foundation for all pages - it enables consistent structure and proper CSS loading across the entire site.

**Independent Test**: Can be tested by creating a simple content page and verifying it inherits the base layout structure, has proper meta tags, and displays TailwindCSS styles.

**Acceptance Scenarios**:

1. **Given** a new content page, **When** Hugo renders it, **Then** the page includes proper HTML5 doctype, meta viewport, and charset declarations
2. **Given** the base layout, **When** a page is rendered, **Then** TailwindCSS styles are properly loaded and applied
3. **Given** the base layout with DaisyUI theme, **When** a page is rendered, **Then** the page uses the configured DaisyUI color scheme

---

### User Story 3 - Developer Builds Production Assets (Priority: P3)

A developer needs to build optimized, production-ready assets including minified CSS with only the used TailwindCSS classes and cache-busted file names.

**Why this priority**: Production builds are essential for deployment but not needed during initial development.

**Independent Test**: Can be tested by running `hugo --minify` and verifying output contains fingerprinted CSS files with purged unused styles.

**Acceptance Scenarios**:

1. **Given** a Hugo site with content, **When** the developer runs `hugo --minify`, **Then** production-ready files are generated in the `public` directory
2. **Given** a production build, **When** examining the CSS output, **Then** unused TailwindCSS classes are purged and the file is minified
3. **Given** a production build, **When** examining asset URLs, **Then** CSS files have fingerprinted names for cache-busting

---

### User Story 4 - Developer Creates Standard Page Layouts (Priority: P4)

A developer needs pre-built layout templates for common page types: homepage, single content pages, and list/section pages.

**Why this priority**: These layouts provide immediate productivity but can be incrementally added after core setup is working.

**Independent Test**: Can be tested by creating content files and verifying each layout type renders appropriately with proper styling.

**Acceptance Scenarios**:

1. **Given** a markdown file in `content/`, **When** Hugo renders it, **Then** the single page layout displays the content with typography styling
2. **Given** a section with multiple pages, **When** Hugo renders the section index, **Then** the list layout displays a styled grid of content cards
3. **Given** the homepage, **When** Hugo renders it, **Then** a customizable hero section and content blocks are displayed

---

### Edge Cases

- What happens when no content files exist? The site should still build and display a default homepage
- How does the system handle missing favicon files? The site builds without errors; favicon links are omitted
- What happens when TailwindCSS compilation fails? Hugo build should fail with clear error message indicating CSS issue
- How does the system handle content without front matter? Pages render with default layout and no title displayed

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST initialize a valid Hugo project structure with `hugo.yaml` configuration
- **FR-002**: System MUST configure Hugo module mounts for `hugo_stats.json` to enable TailwindCSS purging
- **FR-003**: System MUST provide a self-contained `hugo/package.json` with TailwindCSS 4, DaisyUI 5, and required build dependencies
- **FR-004**: System MUST provide a `tailwind.config.js` configured to use `hugo_stats.json` for content scanning
- **FR-005**: System MUST provide CSS entry point (`assets/css/styles.css`) importing TailwindCSS and DaisyUI plugins
- **FR-006**: System MUST provide a `baseof.html` layout with TailwindCSS processing via Hugo's `css.TailwindCSS` pipe
- **FR-007**: System MUST configure Hugo build stats to track used CSS classes for purging
- **FR-008**: System MUST provide cache-buster configuration for CSS when Tailwind config changes
- **FR-009**: System MUST provide a working `home.html` layout template
- **FR-010**: System MUST provide a working `single.html` layout template for content pages
- **FR-011**: System MUST provide a working `list.html` layout template for section pages
- **FR-012**: System MUST provide header and footer partials using DaisyUI components
- **FR-013**: System MUST configure a DaisyUI theme with customizable color scheme
- **FR-014**: System MUST provide a `404.html` error page template
- **FR-015**: System MUST provide Open Graph meta tag partial for social sharing
- **FR-016**: System MUST provide Twitter Cards meta tag partial
- **FR-017**: System MUST provide schema.org JSON-LD partial for structured data
- **FR-018**: System MUST provide Google Analytics integration partial with configurable tracking ID

### Key Entities

- **Hugo Configuration** (`hugo.yaml`): Build settings, module mounts, taxonomies, and output configurations
- **TailwindCSS Configuration** (`tailwind.config.js`): Content sources, plugins, theme extensions
- **CSS Entry Point** (`assets/css/styles.css`): TailwindCSS imports, plugin declarations, custom theme variables
- **Base Layout** (`layouts/baseof.html`): HTML structure, CSS loading, page blocks
- **Partials** (`layouts/_partials/`): Reusable template components (header, footer, utilities)
- **Page Layouts** (`layouts/*.html`): Templates for different content types

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Developer can start a new project and see a styled page within 5 minutes of initial setup
- **SC-002**: All DaisyUI components render correctly with the configured theme
- **SC-003**: Production CSS bundle size is under 50KB (after purging unused styles)
- **SC-004**: Development server hot-reloads CSS changes within 2 seconds
- **SC-005**: Hugo build completes without warnings or errors when all dependencies are installed
- **SC-006**: All provided layouts pass HTML validation (no structural errors)

## Clarifications

### Session 2026-01-15

- Q: Where should the Hugo installation be created? → A: In a new `hugo/` subdirectory within the existing workspace
- Q: How should npm dependencies be managed for the Hugo subdirectory? → A: Separate `hugo/package.json` with its own dependencies (isolated, portable)
- Q: Should the setup include SEO-related partials? → A: Include SEO partials (Open Graph, Twitter Cards, schema.org) plus Google Analytics integration partial

## Assumptions

- Hugo installation will be created in the `hugo/` subdirectory, separate from but co-located with the existing TypeScript project
- Hugo version 0.147.8 or higher is available (required for `css.TailwindCSS` pipe)
- Node.js and npm are installed for managing TailwindCSS dependencies
- The project structure follows Hugo conventions with `content/`, `layouts/`, and `assets/` directories
- TailwindCSS 4 and DaisyUI 5 are the target versions (matching the exemplar project)
- The default DaisyUI theme will be "lemonade" (can be customized after setup)
- Standard fonts (system fonts) will be used unless custom fonts are specified
