# Quickstart: Hugo Cloudflare Skills

**Date**: 2026-01-14
**Feature**: 004-hugo-skills

## Overview

This feature creates 5 Claude Code skills for Hugo + Cloudflare hybrid architecture guidance. Skills provide progressive disclosure: SKILL.md gives quick decision trees, reference files provide detailed patterns.

## Implementation Order

1. **hugo-project-setup** - Foundation skill for project structure
2. **static-first-routing** - Conceptual routing model
3. **hugo-templates** - Hugo Go template patterns
4. **typescript-html-templates** - TypeScript HTML response patterns
5. **hugo-search-indexing** - Search index build patterns

## Creating a New Skill

### Step 1: Create Directory Structure

```bash
mkdir -p .claude/skills/{skill-name}/references
```

### Step 2: Create SKILL.md

Start with this template (target 80-120 lines):

```markdown
---
name: { skill-name }
description: 'Use when: (1) first scenario, (2) second scenario, (3) third scenario.'
---

# {Skill Title}

{One-line purpose}

## Quick Reference

| Pattern | When to Use | Example |
| ------- | ----------- | ------- |
| ...     | ...         | ...     |

## Core Concepts

### {Concept 1}

{Brief explanation + code example}

## Detailed References

- [reference-name](references/reference-name.md) - Description

## Related Skills

- [existing-skill](../existing-skill/SKILL.md) - Relationship
```

### Step 3: Create Reference Files

For each theme, create a reference file (target 150-250 lines):

```markdown
# {Reference Title}

{Context}

## {Pattern 1}

{Code + explanation}

## {Pattern 2}

{Code + explanation}
```

### Step 4: Update Skills README

Add entry to `.claude/skills/README.md` in appropriate category.

## Validation Checklist

Before committing each skill:

- [ ] SKILL.md under 150 lines
- [ ] YAML frontmatter has name and description
- [ ] Description starts with "Use when:" and has 3+ scenarios
- [ ] 2-4 reference files in references/
- [ ] Each reference file under 300 lines
- [ ] At least 2 cross-references to existing skills
- [ ] Code examples use strict TypeScript patterns
- [ ] All relative links work

## Testing Skills

1. Invoke skill explicitly: `/hugo-templates`
2. Check Claude loads SKILL.md content
3. Reference a specific pattern to verify reference file loads
4. Verify cross-reference links navigate correctly

## File Count Summary

| Skill                     | SKILL.md | References | Total Files |
| ------------------------- | -------- | ---------- | ----------- |
| hugo-templates            | 1        | 3          | 4           |
| typescript-html-templates | 1        | 3          | 4           |
| hugo-project-setup        | 1        | 3          | 4           |
| static-first-routing      | 1        | 2          | 3           |
| hugo-search-indexing      | 1        | 2          | 3           |
| **Total**                 | **5**    | **13**     | **18**      |
