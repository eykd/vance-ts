# Quickstart: Cloudflare Observability Skill

**Feature**: 002-observability-skills
**Date**: 2026-01-14

## Prerequisites

- Understanding of Claude Code skills structure
- Access to `/workspace/.claude/skills/` directory
- Familiarity with existing skill patterns (e.g., `typescript-unit-testing`)

## Quick Setup

### Step 1: Create Skill Directory

```bash
mkdir -p .claude/skills/cloudflare-observability/references
```

### Step 2: Create SKILL.md

Create `.claude/skills/cloudflare-observability/SKILL.md` using the template from `contracts/skill-template.md`.

Key constraints:

- Must be under 150 lines
- Description must start with "Use when:"
- Must include Pattern Selection table
- Must link all 6 reference files

### Step 3: Create Reference Files

Create the following files in `references/`:

| File                     | Primary Source                             | Est. Lines |
| ------------------------ | ------------------------------------------ | ---------- |
| slo-tracking.md          | Guide sections: Philosophy, SLO Patterns   | ~300       |
| request-timing.md        | Guide sections: Request Timing Metrics     | ~250       |
| error-tracking.md        | Guide sections: Error Rate Tracking        | ~200       |
| health-endpoints.md      | Guide sections: Health Endpoints           | ~350       |
| analytics-engine.md      | Guide sections: Infrastructure Integration | ~200       |
| testing-observability.md | Guide sections: Testing Observability Code | ~250       |

### Step 4: Validate

Run validation checks:

```bash
# Check SKILL.md line count
wc -l .claude/skills/cloudflare-observability/SKILL.md
# Should be < 150

# Verify all links resolve
# Check each reference file exists
ls .claude/skills/cloudflare-observability/references/
```

## Implementation Order

Recommended order for creating reference files:

1. **slo-tracking.md** (P1) - Foundation for all observability
2. **request-timing.md** (P1) - Core timing infrastructure
3. **error-tracking.md** (P2) - Depends on SLO understanding
4. **health-endpoints.md** (P2) - Builds on timing and error concepts
5. **analytics-engine.md** (P3) - Integration layer
6. **testing-observability.md** (P3) - Testing patterns for above

## Content Sources

Primary source: `/workspace/docs/cloudflare-metrics-healthchecks-guide.md`

| Reference File           | Guide Sections                                                            |
| ------------------------ | ------------------------------------------------------------------------- |
| slo-tracking.md          | Philosophy (lines 125-180), SLO Implementation Patterns (lines 2093-2542) |
| request-timing.md        | Request Timing Metrics (lines 287-916)                                    |
| error-tracking.md        | Error Rate Tracking (lines 918-1380)                                      |
| health-endpoints.md      | Health Endpoints (lines 1382-2090)                                        |
| analytics-engine.md      | Infrastructure Integration (lines 2646-2904)                              |
| testing-observability.md | Testing Observability Code (lines 2906-3175)                              |

## Validation Checklist

Before marking complete:

- [ ] SKILL.md is under 150 lines
- [ ] SKILL.md description starts with "Use when:"
- [ ] All 6 reference files created
- [ ] All code examples use explicit TypeScript return types
- [ ] No `any` types in code examples
- [ ] Cross-references to typescript-unit-testing added
- [ ] Cross-references to vitest-cloudflare-config added
- [ ] No content duplicated from d1-repository-implementation
- [ ] All code examples are Workers-compatible
