# Feature Specification: Hugo Cloudflare Skills

**Feature Branch**: `004-hugo-skills`
**Created**: 2026-01-14
**Status**: Draft
**Input**: User description: "Create Claude Skills for Hugo + Cloudflare hybrid architecture guidance based on the integration guide patterns"

## Clarifications

### Session 2026-01-14

- Q: How should hugo-templates and html-template-functions skills handle potential overlap in template/DaisyUI content? → A: Strict separation - Hugo templates covers only Go template syntax; TypeScript skill covers only TS. Both reference existing tailwind-daisyui-design skill for component patterns. Rename html-template-functions to typescript-html-templates for clarity.
- Q: What granularity should reference files have (many small vs few large)? → A: Moderate granularity - 2-4 reference files per skill grouped by theme, balancing token efficiency with maintainability.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Discover and Apply Hugo Template Patterns (Priority: P1)

A developer building a Hugo + Cloudflare hybrid site needs to create templates (layouts, partials, shortcodes) that integrate with HTMX for dynamic content and Alpine.js for client-side state. They invoke a skill and receive progressive guidance: a quick decision tree with essential patterns, then detailed references for complex scenarios.

**Why this priority**: Templates are the primary output - developers need patterns for common HTMX/Alpine integration scenarios immediately.

**Independent Test**: Developer creates a blog post template with comment section by following skill patterns, resulting in working HTMX form submission and Alpine.js validation state.

**Acceptance Scenarios**:

1. **Given** a developer creating a Hugo template with HTMX integration, **When** they invoke `/hugo-templates`, **Then** they receive a decision tree showing which partial pattern to use (form, list, search) with minimal examples
2. **Given** a developer needs a contact form shortcode, **When** they follow the skill reference, **Then** the shortcode includes proper `hx-post`, `hx-target`, and Alpine.js form state
3. **Given** a developer is unfamiliar with Hugo's `{{ .Site.Params.api.* }}` pattern, **When** they check the skill, **Then** they learn to configure API endpoints in hugo.toml

---

### User Story 2 - Build TypeScript HTML Response Templates (Priority: P1)

A developer needs to create TypeScript functions that return HTML fragments for HTMX responses. These functions must use proper HTML escaping and return correct headers (HX-Trigger for toast notifications). DaisyUI component patterns are referenced from the existing tailwind-daisyui-design skill.

**Why this priority**: TypeScript HTML templates are the bridge between Clean Architecture use cases and HTTP responses - essential for the hybrid architecture.

**Independent Test**: Developer creates template functions for a comment system (commentItem, commentList) that properly escape user content and return HTML styled per tailwind-daisyui-design patterns.

**Acceptance Scenarios**:

1. **Given** a developer needs HTML response templates, **When** they follow the `/typescript-html-templates` skill, **Then** they create type-safe template functions with proper escaping
2. **Given** a developer returns HTML from a Pages Function, **When** they need toast notifications, **Then** the skill shows the `HX-Trigger` header JSON format
3. **Given** a developer builds error responses, **When** they follow skill patterns, **Then** responses use DaisyUI alert components with proper status codes

---

### User Story 3 - Configure Hugo Project Structure (Priority: P2)

A developer setting up a new Hugo + Cloudflare Pages project needs guidance on directory layout (hugo/, functions/, src/ separation), configuration files, and build pipeline setup.

**Why this priority**: Correct project structure is foundational but typically set up once, so it's slightly lower priority than ongoing template work.

**Independent Test**: Developer scaffolds a new project with proper separation between static content (hugo/), dynamic endpoints (functions/), and shared code (src/).

**Acceptance Scenarios**:

1. **Given** a developer creating a new project, **When** they invoke `/hugo-project-setup`, **Then** they receive the recommended directory structure and file locations
2. **Given** a developer configuring package.json scripts, **When** they follow skill guidance, **Then** they have working dev, build, and deploy commands using npx
3. **Given** a developer needs hugo.toml settings, **When** they check the skill reference, **Then** they configure params.api endpoints, markup settings, and module mounts

---

### User Story 4 - Understand Static-First Routing (Priority: P2)

A developer needs to understand how Cloudflare Pages routes requests: which paths serve static Hugo-generated content from CDN vs. which paths invoke Pages Functions for dynamic responses.

**Why this priority**: Routing knowledge prevents common bugs but is a conceptual understanding rather than direct code production.

**Independent Test**: Developer correctly places functions at /app/\_/\* paths and understands that static content at / serves from CDN.

**Acceptance Scenarios**:

1. **Given** a developer planning URL structure, **When** they consult the `/static-first-routing` skill, **Then** they understand the request flow diagram (CDN vs. function)
2. **Given** a developer has path conflicts between static and dynamic, **When** the skill is applied, **Then** it explains precedence rules and resolution strategies
3. **Given** a developer configures wrangler.toml, **When** they follow skill guidance, **Then** pages_build_output_dir and function paths are correctly set

---

### User Story 5 - Build D1 Search Index from Hugo Content (Priority: P3)

A developer needs to create a build script that parses Hugo markdown content (front matter and body) and outputs JSON for populating a D1 search index.

**Why this priority**: Search indexing is a specialized need - not all sites require it, so it's lower priority than core patterns.

**Independent Test**: Developer runs a build script that generates search-index.json from hugo/content/ markdown files.

**Acceptance Scenarios**:

1. **Given** a developer needs site search, **When** they invoke `/hugo-search-indexing`, **Then** they receive a script pattern for parsing markdown with gray-matter
2. **Given** the build script runs, **When** content includes draft: true, **Then** drafts are excluded from the index
3. **Given** the JSON is generated, **When** deployed, **Then** it can populate the D1 search_index table

---

### Edge Cases

- What happens when Hugo and Pages Functions have conflicting paths? Skill explains CDN-first routing and function directory placement.
- How does the system handle Hugo draft content in templates? Skill shows `{{ if not .Draft }}` patterns.
- What if HTMX requests to dynamic endpoints fail? Skill provides error response HTML patterns with DaisyUI alerts.
- How are environment-specific API URLs handled? Skill shows hugo.toml params.api configuration.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: Skills MUST follow progressive disclosure with SKILL.md under 150 lines containing decision tree and essential examples
- **FR-002**: Skills MUST use consistent YAML frontmatter format (name, description fields) matching existing skills
- **FR-003**: Skills MUST cross-reference related existing skills (htmx-pattern-library, worker-request-handler, d1-repository-implementation, tailwind-daisyui-design)
- **FR-004**: Skills MUST provide copy-paste code examples that compile/lint correctly in project context
- **FR-005**: Skills MUST be discoverable through explicit invocation (/skill-name) and context-based activation
- **FR-006**: Skills MUST include 2-4 reference files in references/ directory, grouped by theme, for detailed patterns exceeding quick examples
- **FR-007**: Skill descriptions MUST focus on "when to use" the skill (numbered list of scenarios)
- **FR-008**: Skills MUST cover: Hugo templates, TypeScript HTML templates, project setup, routing concepts, and search indexing

### Key Entities

- **Skill**: Claude Code guidance module with SKILL.md decision tree (< 150 lines) and references/ directory for detail
- **Reference File**: Detailed implementation guide grouped by theme (< 300 lines each, 2-4 files per skill)
- **Hugo Template**: Go template file (.html) in layouts/ directory generating static HTML with HTMX/Alpine integration points
- **TypeScript HTML Template**: TypeScript function returning HTML string for HTMX responses, with proper escaping (DaisyUI patterns via tailwind-daisyui-design skill)
- **Shortcode**: Reusable Hugo component (layouts/shortcodes/\*.html) for embedding dynamic features in content

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: All SKILL.md files are under 150 lines with clear decision tree structure
- **SC-002**: Each skill includes at least 2 cross-references to related existing skills
- **SC-003**: Code examples in skills pass TypeScript compilation and ESLint when used in project context
- **SC-004**: Skills cover all 5 identified areas: hugo-templates, typescript-html-templates, hugo-project-setup, static-first-routing, hugo-search-indexing
- **SC-005**: Skill descriptions match existing format (numbered "when to use" scenarios in YAML frontmatter)

## Assumptions

- Skills will be used with Claude Code in the turtlebased-ts repository context
- Developers have basic familiarity with Hugo Go templates, TypeScript, and Cloudflare Workers
- Existing skills (htmx-pattern-library, worker-request-handler, d1-repository-implementation, tailwind-daisyui-design) remain applicable and will be cross-referenced
- Hugo Extended version is installed via npm using hugo-bin package
- TailwindCSS 4 and DaisyUI 5 are the styling foundation per the integration guide
- The /app/\_/\* URL namespace is reserved for dynamic Pages Functions endpoints
