# Research: Cloudflare Observability Skill

**Feature**: 002-observability-skills
**Date**: 2026-01-14

## Research Topics

### 1. Existing Skill Patterns in Repository

**Decision**: Follow `typescript-unit-testing` skill pattern

**Rationale**:

- SKILL.md at 109 lines is well under 150-line limit
- Uses decision tables and quick reference sections effectively
- Progressive disclosure via 5 reference files (11K-19K chars each)
- Clear "Detailed References" section linking to reference files

**Alternatives Considered**:

- `d1-repository-implementation` pattern: More code-heavy, less decision-tree oriented
- `latent-features` pattern: Uses PATTERN.md with architecture/ subdirectory - more complex than needed

### 2. SKILL.md Decision-Tree Structure

**Decision**: Use four main sections: Quick Decision, Pattern Selection Table, Minimal Examples, References

**Rationale**:

- "Quick Decision" answers "Do I need this skill?" immediately
- Pattern Selection Table maps problem → solution → reference
- Minimal code snippets show shape of solution without overwhelming
- References section provides clear navigation to depth

**Structure Template**:

```markdown
---
name: cloudflare-observability
description: 'Use when: ...'
---

# Cloudflare Observability

## Quick Decision: Do You Need This?

[Decision flowchart/criteria]

## Pattern Selection

| I need to... | Use pattern | Reference |
| ------------ | ----------- | --------- |

## Minimal Examples

[3-5 line snippets for most common patterns]

## Detailed References

[Links to all 6 reference files]
```

### 3. Reference File Organization

**Decision**: One file per topic area, each self-contained with complete code examples

**Rationale**:

- Matches spec clarification: slo-tracking.md, request-timing.md, error-tracking.md, health-endpoints.md, analytics-engine.md, testing-observability.md
- Self-contained files can be loaded independently when needed
- Existing skills average 10K-20K chars per reference file

**Content Depth per File**:
| File | Primary Content | Estimated Lines |
|------|-----------------|-----------------|
| slo-tracking.md | SLI/SLO definitions, error budgets, burn rates, SLOTracker class | ~300 |
| request-timing.md | RequestTimer class, phases, Server-Timing header | ~250 |
| error-tracking.md | ErrorTracker, categorization, countsAgainstSLO | ~200 |
| health-endpoints.md | HealthChecker, dependency checks, endpoint handlers | ~350 |
| analytics-engine.md | AnalyticsEngineAdapter, SQL queries | ~200 |
| testing-observability.md | Test patterns, mocking timers, middleware tests | ~250 |

### 4. Cross-Reference Strategy

**Decision**: Reference existing skills by name, don't duplicate content

**Rationale**:

- FR-004 requires cross-referencing typescript-unit-testing, vitest-cloudflare-config
- FR-010 prohibits duplicating d1-repository-implementation content
- Links should be relative: `See [typescript-unit-testing](../typescript-unit-testing/SKILL.md)`

**Cross-Reference Points**:

- testing-observability.md → typescript-unit-testing (general TDD patterns)
- testing-observability.md → vitest-cloudflare-config (Workers test setup)
- health-endpoints.md → d1-repository-implementation (D1 patterns, don't repeat)

### 5. Code Example Standards

**Decision**: All examples use strict TypeScript with explicit return types and JSDoc

**Rationale**:

- Constitution Principle II requires strict type safety
- Examples should compile in Cloudflare Workers environment
- JSDoc enables IDE hover documentation

**Example Template**:

```typescript
/**
 * Brief description of purpose.
 */
export function exampleFunction(param: ParamType): ReturnType {
  // Implementation
}
```

### 6. Skill Description Format

**Decision**: Single-line description starting with "Use when:" followed by numbered triggers

**Rationale**:

- SC-002 requires description fits one line, starts with "Use when:"
- Existing skills use format: `'Use when: (1) trigger, (2) trigger, ...'`

**Proposed Description**:

```
'Use when: (1) defining SLOs for Cloudflare Workers, (2) adding request timing/metrics, (3) implementing health endpoints, (4) tracking errors by category, (5) integrating with Analytics Engine, (6) writing observability tests.'
```

## Resolved Clarifications

All technical context items resolved. No NEEDS CLARIFICATION markers remain.

## Next Steps

Proceed to Phase 1: Generate data-model.md and contracts/
