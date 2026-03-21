# Contracts: Design Skill Interface

**Branch**: `013-import-design-skills` | **Date**: 2026-03-21

## Overview

No REST/GraphQL API contracts for this feature — all artifacts are static markdown skill files. This document defines the **structural contracts** that each imported skill must satisfy.

## Contract 1: Skill File Structure

Every imported skill MUST follow this structure:

```
.claude/skills/design-{name}/
├── SKILL.md          # Required: skill definition
└── references/       # Optional: supporting documentation
    └── *.md
```

## Contract 2: SKILL.md Attribution Header

Every imported SKILL.md MUST begin with this attribution block:

```markdown
<!--
  Original source: https://github.com/pbakaus/impeccable
  Original skill: {original-skill-name}
  Original author: Paul Bakaus
  License: Apache License 2.0
  Adapted: 2026-03-21 — Modified for TailwindCSS 4 + DaisyUI 5 + Hugo + Alpine.js 3 + HTMX stack
-->
```

## Contract 3: NOTICE File Format

`.claude/skills/NOTICE` MUST contain:

```
Impeccable Design Skills
Copyright (c) Paul Bakaus
Licensed under the Apache License, Version 2.0

Source: https://github.com/pbakaus/impeccable
License: https://www.apache.org/licenses/LICENSE-2.0

The following files were adapted from the above source:

  .claude/skills/design-frontend/SKILL.md (from: frontend-design)
  .claude/skills/design-frontend/references/*.md (from: frontend-design/reference/)
  .claude/skills/design-polish/SKILL.md (from: polish)
  .claude/skills/design-arrange/SKILL.md (from: arrange)
  ... [all 18 imported skills listed]

Modifications:
- All skills adapted for TailwindCSS 4 + DaisyUI 5 + Hugo + Alpine.js 3 + HTMX
- React/Vue/generic framework references replaced with project-specific equivalents
- Template placeholders ({{model}}, {{config_file}}) resolved to Claude Code values
- Cross-references added to existing project skills
- "Mandatory Preparation" blocks updated to reference design-frontend and design-interview
```

## Contract 4: Zero Forbidden References

After adaptation, no imported skill file may contain:

| Forbidden                 | Replacement                       |
| ------------------------- | --------------------------------- |
| `React`                   | Hugo templates / Alpine.js        |
| `Vue`                     | Hugo templates / Alpine.js        |
| `Angular`                 | Hugo templates / Alpine.js        |
| `JSX`                     | Hugo Go templates                 |
| `styled-components`       | TailwindCSS 4 utilities           |
| `CSS-in-JS`               | TailwindCSS 4 utilities           |
| `CSS modules`             | TailwindCSS 4 utilities           |
| `useState`                | `x-data` (Alpine.js)              |
| `useEffect`               | `x-init` / `x-effect` (Alpine.js) |
| `useMemo` / `useCallback` | N/A (not applicable to Hugo)      |
| `next/router`             | Hugo page routing                 |
| `{{model}}`               | `Claude`                          |
| `{{config_file}}`         | `CLAUDE.md`                       |
| `{{ask_instruction}}`     | (removed)                         |
| `.impeccable.md`          | `design-interview`                |
| `teach-impeccable`        | `design-interview`                |

**Exception**: References to React/Vue in the context of "this skill replaces React-specific patterns with..." are permitted for documentation clarity.

## Contract 5: Cross-Reference Format

When a skill references another skill, it MUST use the format:

```markdown
**Related skill**: `/design-{name}` — {one-line description of when to use it instead}
```

Or for existing skills:

```markdown
**Related skill**: `/tailwind-daisyui-design` — {one-line description of complementary use}
```

## Contract 6: Orchestrator Phase Transition

Each phase transition in `design-interview` MUST provide:

```markdown
### Next: {Phase Name}

**Recommended skill**: `/design-{name}`

**Templated prompt**:

> {Pre-filled prompt text with context from current phase}
```
