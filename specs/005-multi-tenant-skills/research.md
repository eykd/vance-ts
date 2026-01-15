# Research: Multi-Tenant Boundary Skills

**Date**: 2026-01-14
**Branch**: `005-multi-tenant-skills`

## Skill Structure Patterns

### Decision: Follow existing skill template structure

**Rationale**: Analysis of 8 existing skills shows consistent patterns that ensure compatibility with the Claude Code skill system.

**Alternatives considered**:

- Custom structure optimized for multi-tenant content → Rejected: would break consistency with existing skills

### SKILL.md Structure (75-126 lines target)

```markdown
---
name: skill-name
description: 'Use when: (1) condition, (2) condition...'
---

# Skill Title

[1-2 paragraph overview]

## Decision Tree

### Need to [action]?

**When**: [trigger context]
**Go to**: [references/file.md](./references/file.md)

[Repeat 3-5 questions]

## Quick Example

[15-50 line TypeScript example]

## Cross-References

- **[related-skill](../related-skill/SKILL.md)**: Relationship description

## Reference Files

- [references/file.md](./references/file.md): Description
```

### Reference File Structure

```markdown
# Pattern Name

**Purpose**: One-sentence description

## When to Use

[Context paragraph]

## Pattern

[TypeScript code 40-150 lines]

## Additional Considerations

[Edge cases, variations]
```

## Content Extraction from Guide

### Decision: Extract patterns directly from multi-tenant-boundaries-guide.md

**Rationale**: The guide contains production-ready code examples and decision frameworks that can be adapted to skill format.

**Source sections to extract**:

| Guide Section                       | Target Skill      | Content Type                         |
| ----------------------------------- | ----------------- | ------------------------------------ |
| Section 5: Policy Abstraction       | org-authorization | Types + AuthorizationService         |
| Section 6: Implementing in Workers  | org-authorization | Handler integration patterns         |
| Section 10: Security Considerations | org-isolation     | TenantScopedDb, audit logging        |
| Section 3: Data Model Evolution     | org-data-model    | Stage 1-4 schemas                    |
| Section 7: Common Patterns          | org-membership    | Role hierarchy, privilege escalation |
| Section 8: Testing Authorization    | org-testing       | Unit, integration, acceptance        |
| Section 9: Migration Strategies     | org-migration     | Shadow orgs, feature flags, backfill |

## Skill Chain Design

### Decision: Linear chain with entry points at each skill

**Rationale**: Developers may enter at any stage depending on their needs.

**Chain**: `org-authorization` → `org-isolation` → `org-data-model` → `org-membership` → `org-testing` → `org-migration`

**Entry point guidance**:

- New app? Start at `org-data-model` to choose appropriate stage
- Adding authorization? Start at `org-authorization`
- Security audit? Start at `org-isolation`
- Migrating existing app? Start at `org-migration`

## Cross-References to Existing Skills

### Decision: Link to relevant existing skills

| New Skill         | Links To                     | Relationship                      |
| ----------------- | ---------------------------- | --------------------------------- |
| org-authorization | security-review              | Security audit of authorization   |
| org-authorization | ddd-domain-modeling          | Actor/Resource as domain entities |
| org-isolation     | d1-repository-implementation | Repository scoping patterns       |
| org-data-model    | cloudflare-migrations        | Schema migration patterns         |
| org-testing       | typescript-unit-testing      | Policy unit test patterns         |
| org-testing       | vitest-integration-testing   | Integration test patterns         |

## Code Example Adaptation

### Decision: Adapt guide examples to strict TypeScript

**Rationale**: Constitution requires explicit return types, no `any`, strict boolean expressions.

**Modifications needed**:

1. Add explicit return types to all functions
2. Add JSDoc to public functions
3. Use `unknown` with type guards instead of `any`
4. Ensure examples compile standalone

**Example transformation**:

```typescript
// Guide original (implicit types)
async function can(actor, action, resource) {
  if (actor.type === 'system') return true;
  // ...
}

// Skill version (strict types)
/**
 * Check if actor can perform action on resource.
 */
async function can(actor: Actor, action: Action, resource: Resource): Promise<AuthorizationResult> {
  if (actor.type === 'system') {
    return { allowed: true, reason: `System: ${actor.reason}` };
  }
  // ...
}
```

## Reference File Count

### Decision: 3-4 reference files per skill

**Rationale**: Existing skills average 3-5 reference files. More granularity aids progressive disclosure.

| Skill             | Reference Files                                                |
| ----------------- | -------------------------------------------------------------- |
| org-authorization | 3: core-types, authorization-service, patterns                 |
| org-isolation     | 3: tenant-scoped-db, audit-checklist, testing-patterns         |
| org-data-model    | 4: stage-1, stage-2, stage-3, stage-4                          |
| org-membership    | 3: role-hierarchy, privilege-escalation, membership-management |
| org-testing       | 3: policy-unit-tests, integration-tests, acceptance-tests      |
| org-migration     | 3: shadow-organizations, feature-flags, database-backfill      |

**Total**: 6 SKILL.md files + 19 reference files = 25 markdown files
