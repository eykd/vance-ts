# Data Model: Multi-Tenant Boundary Skills

**Date**: 2026-01-14
**Branch**: `005-multi-tenant-skills`

## Overview

This feature creates documentation artifacts (Claude Code skills), not database entities. The "data model" describes the structure of skill files and their relationships.

## Entity: Skill

A Claude Code skill that provides implementation guidance through progressive disclosure.

### Attributes

| Field       | Type   | Required | Description                                       |
| ----------- | ------ | -------- | ------------------------------------------------- |
| name        | string | Yes      | Kebab-case identifier (e.g., `org-authorization`) |
| description | string | Yes      | "Use when:" followed by numbered conditions       |
| directory   | path   | Yes      | `.claude/skills/{name}/`                          |
| skill_file  | path   | Yes      | `SKILL.md` in directory root                      |
| references  | path[] | Yes      | `references/*.md` files (3-4 per skill)           |

### File Structure Invariants

1. `SKILL.md` MUST be under 150 lines
2. `SKILL.md` MUST contain: Overview, Decision Tree, Quick Example, Cross-References, Reference Files
3. Each reference file MUST contain: Purpose, When to Use, Pattern (code)
4. All code examples MUST use strict TypeScript (explicit types, JSDoc)

## Entity: SkillReference

A detailed implementation guide within a skill.

### Attributes

| Field        | Type   | Required | Description                              |
| ------------ | ------ | -------- | ---------------------------------------- |
| filename     | string | Yes      | Kebab-case with `.md` extension          |
| purpose      | string | Yes      | One-sentence description                 |
| pattern      | code   | Yes      | TypeScript implementation (40-150 lines) |
| parent_skill | Skill  | Yes      | The skill this reference belongs to      |

## Entity: SkillChain

A sequence of related skills forming an implementation workflow.

### Attributes

| Field        | Type    | Required | Description                |
| ------------ | ------- | -------- | -------------------------- |
| name         | string  | Yes      | Chain identifier           |
| skills       | Skill[] | Yes      | Ordered list of skills     |
| entry_points | map     | Yes      | Condition → starting skill |

### Multi-Tenant Chain

```
org-authorization → org-isolation → org-data-model → org-membership → org-testing → org-migration
```

### Entry Points

| Condition                 | Start At          |
| ------------------------- | ----------------- |
| Building new app          | org-data-model    |
| Adding authorization      | org-authorization |
| Security audit            | org-isolation     |
| Migrating to multi-tenant | org-migration     |

## Relationships

```
┌─────────────────────────────────────────────────────────────────────┐
│                          SKILL RELATIONSHIPS                         │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────┐     contains      ┌──────────────────┐
│      Skill       │◄─────────────────►│  SkillReference  │
│                  │     1:N           │                  │
│ - name           │                   │ - filename       │
│ - description    │                   │ - purpose        │
│ - directory      │                   │ - pattern        │
└────────┬─────────┘                   └──────────────────┘
         │
         │ cross-references
         │ (N:N)
         ▼
┌──────────────────┐
│   Related Skill  │
│                  │
│ (existing skills │
│  in .claude/)    │
└──────────────────┘

                    ┌──────────────────┐
                    │    SkillChain    │
                    │                  │
                    │ org-authorization│
                    │       ↓          │
                    │ org-isolation    │
                    │       ↓          │
                    │ org-data-model   │
                    │       ↓          │
                    │ org-membership   │
                    │       ↓          │
                    │ org-testing      │
                    │       ↓          │
                    │ org-migration    │
                    └──────────────────┘
```

## Skill Content Summary

### org-authorization

| Reference                | Content Source                                                         |
| ------------------------ | ---------------------------------------------------------------------- |
| core-types.md            | Guide Section 5: Actor, Action, Resource, PolicyContext types          |
| authorization-service.md | Guide Section 5-6: AuthorizationService class                          |
| patterns.md              | Guide Section 7: Ownership, admin override, system actions, delegation |

### org-isolation

| Reference           | Content Source                              |
| ------------------- | ------------------------------------------- |
| tenant-scoped-db.md | Guide Section 10: TenantScopedDb wrapper    |
| audit-checklist.md  | Guide Section 10: Security checklist        |
| testing-patterns.md | Guide Section 8: Cross-tenant test patterns |

### org-data-model

| Reference                 | Content Source                           |
| ------------------------- | ---------------------------------------- |
| stage-1-single-user.md    | Guide Section 3: User owns resources     |
| stage-2-collaborators.md  | Guide Section 3: Resource-level sharing  |
| stage-3-organizations.md  | Guide Section 3: Org memberships         |
| stage-4-resource-perms.md | Guide Section 3: Per-resource within org |

### org-membership

| Reference                | Content Source                                     |
| ------------------------ | -------------------------------------------------- |
| role-hierarchy.md        | Guide Section 3-7: owner > admin > member > viewer |
| privilege-escalation.md  | Guide Section 10: Prevention patterns              |
| membership-management.md | Guide Section 7: Invite, remove, transfer          |

### org-testing

| Reference            | Content Source                                    |
| -------------------- | ------------------------------------------------- |
| policy-unit-tests.md | Guide Section 8: CorePolicy unit tests            |
| integration-tests.md | Guide Section 8: AuthorizationService integration |
| acceptance-tests.md  | Guide Section 8: Tenant isolation acceptance      |

### org-migration

| Reference               | Content Source                            |
| ----------------------- | ----------------------------------------- |
| shadow-organizations.md | Guide Section 9: Personal org per user    |
| feature-flags.md        | Guide Section 9: Gradual rollout          |
| database-backfill.md    | Guide Section 9: Schema migration scripts |

## Validation Rules

### SKILL.md Validation

1. Line count ≤ 150
2. Contains required sections (validated by presence of H2 headings)
3. Decision tree has 3-5 "Need to" questions
4. Quick example is 15-50 lines of TypeScript
5. Cross-references use correct relative path format

### Reference File Validation

1. Starts with H1 heading matching filename (title case)
2. Has "Purpose" line
3. Has "When to Use" section
4. Has "Pattern" section with TypeScript code block
5. Code examples have explicit return types
6. Code examples have JSDoc on public functions
