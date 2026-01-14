# Research: Hugo Cloudflare Skills

**Date**: 2026-01-14
**Feature**: 004-hugo-skills

## Existing Skill Pattern Analysis

### Decision: SKILL.md Line Limits

**Choice**: Target 80-120 lines for SKILL.md files
**Rationale**: Analysis of existing skills shows:

- Most skills: 74-125 lines (optimal range)
- Some larger skills: 139-201 lines (acceptable for complex topics)
- Outliers: 245-457 lines (latent-features, portable-datetime have unique needs)

New Hugo skills should stay in the 80-120 range for consistency with well-structured skills like ddd-domain-modeling (125 lines) and htmx-pattern-library (98 lines).

**Alternatives considered**:

- Strict 100-line limit: Too restrictive for skills needing decision trees + examples
- 150-line limit from spec: Upper bound, not target - aim lower for token efficiency

### Decision: YAML Frontmatter Format

**Choice**: Use exact format from existing skills

```yaml
---
name: skill-name
description: 'Use when: (1) scenario one, (2) scenario two, (3) scenario three.'
---
```

**Rationale**: All existing skills use this exact format. Description uses numbered list in single quotes for Claude skill matching.

**Alternatives considered**:

- Extended frontmatter with cross-references: Not used in existing skills
- Multiple description fields: Would break skill discovery

### Decision: Reference File Organization

**Choice**: 2-4 thematic reference files per skill
**Rationale**:

- ddd-domain-modeling: 4 files (entities, value-objects, repositories, domain-services)
- htmx-pattern-library: 5 files (forms, loading, search, oob, ui-components)
- worker-request-handler: 3 files (request-extraction, htmx-responses, middleware)

Theme grouping works better than pattern-per-file granularity.

**Alternatives considered**:

- Single comprehensive reference: Would exceed 300-line guideline
- One file per pattern: Too many files, navigation overhead

### Decision: Cross-Reference Style

**Choice**: Inline markdown links within SKILL.md

```markdown
## Related Skills

- [htmx-pattern-library](../htmx-pattern-library/SKILL.md) - HTMX attribute patterns
- [tailwind-daisyui-design](../tailwind-daisyui-design/SKILL.md) - Component styling
```

**Rationale**: Existing skills use relative markdown links. Keeps SKILL.md self-contained while enabling navigation.

**Alternatives considered**:

- External cross-reference file: Not used in existing structure
- YAML frontmatter cross-refs: Would complicate skill discovery

## Hugo-Specific Research

### Decision: Hugo Template Syntax Documentation

**Choice**: Focus on HTMX/Alpine integration points, not general Hugo syntax
**Rationale**:

- Hugo documentation is comprehensive externally
- Skills should add value for hybrid architecture patterns
- Focus on: `{{ .Site.Params.api.* }}`, `hx-*` attributes in templates, `x-data` integration

**Alternatives considered**:

- Comprehensive Hugo tutorial: Outside skill scope, available elsewhere
- Only HTMX patterns: Misses important config and shortcode guidance

### Decision: TypeScript HTML Template Pattern

**Choice**: Simple template literal functions with escapeHtml utility

```typescript
export function commentItem(comment: CommentResponse): string {
  return `<div class="card">${escapeHtml(comment.name)}</div>`;
}
```

**Rationale**:

- Matches existing patterns in worker-request-handler
- No external templating library needed
- Type-safe with explicit return types

**Alternatives considered**:

- Template engine (Handlebars, EJS): Adds dependency, not Workers-idiomatic
- JSX/TSX: Build complexity, not standard in existing patterns

### Decision: Static-First Routing Documentation

**Choice**: Conceptual diagram + path convention rules
**Rationale**:

- Developers need mental model of CDN vs function routing
- /app/\_/\* convention is project-specific, needs documentation
- wrangler.toml configuration patterns are practical output

**Alternatives considered**:

- Code-only documentation: Misses conceptual understanding
- Exhaustive routing rules: Too detailed for skill scope

### Decision: Search Index Build Pattern

**Choice**: Node.js script with gray-matter parsing
**Rationale**:

- gray-matter is standard for Hugo front matter
- Build script runs at deploy time, not Workers runtime
- JSON output → D1 population is clear pipeline

**Alternatives considered**:

- Hugo's built-in JSON output: Less control over format
- Workers-based indexing: Unnecessary complexity for build-time task

## Skill Dependency Graph

```
hugo-project-setup (foundation)
       ↓
hugo-templates ←→ typescript-html-templates
       ↓                    ↓
static-first-routing    (uses existing skills)
       ↓                    ↓
hugo-search-indexing   tailwind-daisyui-design
                       worker-request-handler
                       htmx-pattern-library
```

**Implementation order**: hugo-project-setup → static-first-routing → hugo-templates → typescript-html-templates → hugo-search-indexing

## No Unresolved Clarifications

All technical decisions resolved. Ready for Phase 1 design.
