# Data Model: Import Impeccable Design Skills

**Branch**: `013-import-design-skills` | **Date**: 2026-03-21

## Entities

This feature has no database entities or runtime data models. All artifacts are static markdown files in the skill system. This document captures the **skill inventory** as the equivalent of a data model.

### Entity: Skill File

A skill definition consumed by Claude Code's skill loader.

| Field              | Type       | Description                                           |
| ------------------ | ---------- | ----------------------------------------------------- |
| Path               | `string`   | `.claude/skills/{name}/SKILL.md`                      |
| Name               | `string`   | Skill name matching directory name                    |
| Description        | `string`   | One-line trigger description in YAML frontmatter      |
| References         | `string[]` | Optional `references/*.md` subdirectory               |
| Attribution Header | `string`   | Apache 2.0 modification notice (imported skills only) |

### Entity: NOTICE File

Apache 2.0 attribution record.

| Field           | Type       | Description                             |
| --------------- | ---------- | --------------------------------------- |
| Path            | `string`   | `.claude/skills/NOTICE`                 |
| Source URL      | `string`   | `https://github.com/pbakaus/impeccable` |
| Original Author | `string`   | Paul Bakaus                             |
| License         | `string`   | Apache License 2.0                      |
| Adapted Files   | `string[]` | List of all imported/adapted files      |

## Complete Skill Inventory

### Imported Skills (18 new `design-*` directories)

| #   | Import As          | Source                     | Category         | Has References |
| --- | ------------------ | -------------------------- | ---------------- | -------------- |
| 1   | `design-frontend`  | impeccable/frontend-design | Orchestrator/Hub | Yes (7 docs)   |
| 2   | `design-polish`    | impeccable/polish          | Review           | No             |
| 3   | `design-arrange`   | impeccable/arrange         | Refine           | No             |
| 4   | `design-colorize`  | impeccable/colorize        | Refine           | No             |
| 5   | `design-typeset`   | impeccable/typeset         | Refine           | No             |
| 6   | `design-animate`   | impeccable/animate         | Refine           | No             |
| 7   | `design-delight`   | impeccable/delight         | Refine           | No             |
| 8   | `design-critique`  | impeccable/critique        | Review           | No             |
| 9   | `design-audit`     | impeccable/audit           | Review           | No             |
| 10  | `design-clarify`   | impeccable/clarify         | Review           | No             |
| 11  | `design-bolder`    | impeccable/bolder          | Refine           | No             |
| 12  | `design-quieter`   | impeccable/quieter         | Refine           | No             |
| 13  | `design-harden`    | impeccable/harden          | Harden           | No             |
| 14  | `design-adapt`     | impeccable/adapt           | Harden           | No             |
| 15  | `design-normalize` | impeccable/normalize       | Harden           | No             |
| 16  | `design-onboard`   | impeccable/onboard         | Harden           | No             |
| 17  | `design-overdrive` | impeccable/overdrive       | Refine           | No             |
| 18  | `design-distill`   | impeccable/distill         | Refine           | No             |

### Renamed/Expanded Skill (1 existing skill modified)

| #   | New Name           | Previous Name     | Changes                                                                                     |
| --- | ------------------ | ----------------- | ------------------------------------------------------------------------------------------- |
| 1   | `design-interview` | `frontend-design` | Renamed + expanded into 7-phase orchestrator + teach-impeccable context-gathering folded in |

### Excluded Skills (3)

| #   | Source           | Reason                                       |
| --- | ---------------- | -------------------------------------------- |
| 1   | teach-impeccable | Folded into `design-interview`               |
| 2   | optimize         | React-specific (memo, useMemo, useCallback)  |
| 3   | extract          | Covered by `daisyui-design-system-generator` |

### Existing Skills Requiring Cross-Reference Updates (5)

| #   | Skill                             | New Cross-References                                  |
| --- | --------------------------------- | ----------------------------------------------------- |
| 1   | `tailwind-daisyui-design`         | `design-colorize`, `design-typeset`, `design-arrange` |
| 2   | `daisyui-design-system-generator` | `design-colorize`, `design-normalize`                 |
| 3   | `hugo-copywriting`                | `design-clarify`                                      |
| 4   | `htmx-pattern-library`            | `design-animate`                                      |
| 5   | `ui-design-language`              | `design-frontend` (anti-patterns reference)           |

## Orchestrator Phase Model

```
┌─────────────────────────────────────────────────┐
│                design-interview                  │
│            (7-Phase Orchestrator)                │
├─────────┬──────────┬───────────┬────────────────┤
│ Phase   │ Action   │ Skills    │ Output         │
├─────────┼──────────┼───────────┼────────────────┤
│ 1.Inter │ Gather   │ self      │ Design context │
│ 2.Theme │ Colors   │ daisyui-  │ OKLCH theme    │
│         │          │ design-   │                │
│         │          │ system-   │                │
│         │          │ generator │                │
│ 3.Comps │ Patterns │ tailwind- │ Component      │
│         │          │ daisyui-  │ decisions      │
│         │          │ design    │                │
│ 4.Impl  │ Build    │ hugo-*,   │ Templates      │
│         │          │ htmx-*    │                │
│ 5.Refin │ Adjust   │ design-   │ Aesthetic      │
│         │          │ bolder/   │ refinement     │
│         │          │ quieter/  │                │
│         │          │ colorize/ │                │
│         │          │ typeset/  │                │
│         │          │ arrange/  │                │
│         │          │ animate/  │                │
│         │          │ delight   │                │
│ 6.Revie │ Evaluate │ design-   │ Quality report │
│         │          │ critique/ │                │
│         │          │ audit/    │                │
│         │          │ polish/   │                │
│         │          │ clarify   │                │
│ 7.Harde │ Ship     │ design-   │ Production-    │
│         │          │ harden/   │ ready UI       │
│         │          │ adapt/    │                │
│         │          │ normalize/│                │
│         │          │ onboard   │                │
└─────────┴──────────┴───────────┴────────────────┘
```
