# Data Model: Hugo Cloudflare Skills

**Date**: 2026-01-14
**Feature**: 004-hugo-skills

## Entities

### Skill

A Claude Code guidance module providing progressive disclosure for a specific topic.

| Field       | Type        | Description                                       |
| ----------- | ----------- | ------------------------------------------------- |
| name        | string      | Kebab-case identifier (e.g., "hugo-templates")    |
| description | string      | "Use when:" numbered scenarios for skill matching |
| skillFile   | SKILL.md    | Decision tree document (<150 lines)               |
| references  | Reference[] | 2-4 detailed implementation guides                |

**Constraints**:

- name must be unique across all skills
- description must start with "Use when:" and contain numbered scenarios
- skillFile must be under 150 lines
- references must contain 2-4 files

### Reference

A detailed implementation guide for a specific pattern within a skill.

| Field     | Type   | Description                                          |
| --------- | ------ | ---------------------------------------------------- |
| filename  | string | Kebab-case .md file in references/                   |
| theme     | string | Grouping category (e.g., "layouts", "configuration") |
| lineCount | number | Target <300 lines                                    |

**Constraints**:

- filename must end with .md
- file must be in skill's references/ subdirectory
- lineCount should not exceed 300

## Skill Instances

### hugo-templates

| Property    | Value                                                                                                                                                                                      |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| name        | hugo-templates                                                                                                                                                                             |
| description | 'Use when: (1) creating Hugo layouts with HTMX integration, (2) building partials for dynamic content, (3) writing shortcodes with Alpine.js state, (4) configuring params.api endpoints.' |
| references  | layouts-partials.md, shortcodes.md, htmx-integration.md                                                                                                                                    |

**Cross-references**: htmx-pattern-library, tailwind-daisyui-design

### typescript-html-templates

| Property    | Value                                                                                                                                                                                                        |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| name        | typescript-html-templates                                                                                                                                                                                    |
| description | 'Use when: (1) creating TypeScript functions returning HTML strings, (2) implementing HTML escaping for user content, (3) building HTMX response partials, (4) adding HX-Trigger headers for notifications.' |
| references  | template-functions.md, response-patterns.md, error-responses.md                                                                                                                                              |

**Cross-references**: worker-request-handler, tailwind-daisyui-design

### hugo-project-setup

| Property    | Value                                                                                                                                                                                                           |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| name        | hugo-project-setup                                                                                                                                                                                              |
| description | 'Use when: (1) scaffolding a new Hugo + Cloudflare Pages project, (2) configuring hugo.toml for HTMX endpoints, (3) setting up package.json build scripts, (4) organizing hugo/, functions/, src/ directories.' |
| references  | directory-structure.md, configuration.md, build-pipeline.md                                                                                                                                                     |

**Cross-references**: cloudflare-project-scaffolding, vitest-cloudflare-config

### static-first-routing

| Property    | Value                                                                                                                                                                                                   |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| name        | static-first-routing                                                                                                                                                                                    |
| description | 'Use when: (1) understanding CDN vs Pages Functions routing, (2) resolving path conflicts between static and dynamic, (3) configuring /app/\_/\* endpoint namespace, (4) setting wrangler.toml routes.' |
| references  | request-flow.md, path-conventions.md                                                                                                                                                                    |

**Cross-references**: worker-request-handler, cloudflare-project-scaffolding

### hugo-search-indexing

| Property    | Value                                                                                                                                                                                      |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| name        | hugo-search-indexing                                                                                                                                                                       |
| description | 'Use when: (1) building D1 search index from Hugo content, (2) parsing markdown front matter with gray-matter, (3) excluding draft content from index, (4) populating search_index table.' |
| references  | build-script.md, d1-population.md                                                                                                                                                          |

**Cross-references**: d1-repository-implementation, cloudflare-migrations

## File Structure Summary

```
.claude/skills/
├── hugo-templates/
│   ├── SKILL.md
│   └── references/
│       ├── layouts-partials.md
│       ├── shortcodes.md
│       └── htmx-integration.md
│
├── typescript-html-templates/
│   ├── SKILL.md
│   └── references/
│       ├── template-functions.md
│       ├── response-patterns.md
│       └── error-responses.md
│
├── hugo-project-setup/
│   ├── SKILL.md
│   └── references/
│       ├── directory-structure.md
│       ├── configuration.md
│       └── build-pipeline.md
│
├── static-first-routing/
│   ├── SKILL.md
│   └── references/
│       ├── request-flow.md
│       └── path-conventions.md
│
└── hugo-search-indexing/
    ├── SKILL.md
    └── references/
        ├── build-script.md
        └── d1-population.md
```

**Totals**: 5 skills, 5 SKILL.md files, 13 reference files
