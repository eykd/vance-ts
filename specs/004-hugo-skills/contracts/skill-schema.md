# Skill Schema Contract

**Date**: 2026-01-14
**Feature**: 004-hugo-skills

## SKILL.md Structure

Every SKILL.md file MUST follow this structure:

```markdown
---
name: { skill-name }
description: 'Use when: (1) {scenario}, (2) {scenario}, (3) {scenario}, (4) {scenario}.'
---

# {Skill Title}

{One-line purpose statement}

## Quick Reference

{Table or bullet list of key patterns}

## Core Concepts

{Essential patterns with minimal code examples}

## Workflow

{Decision tree or numbered steps}

## Detailed References

- [{topic}](references/{file}.md) - {brief description}

## Related Skills

- [{skill-name}](../{skill-name}/SKILL.md) - {how it relates}
```

## YAML Frontmatter Contract

| Field       | Required | Format                   | Example          |
| ----------- | -------- | ------------------------ | ---------------- |
| name        | Yes      | kebab-case               | `hugo-templates` |
| description | Yes      | 'Use when: (1)...(2)...' | See skills       |

**Validation Rules**:

- name: lowercase letters, numbers, hyphens only
- description: MUST start with `'Use when: (`
- description: MUST contain at least 3 numbered scenarios
- description: MUST be single-quoted string

## Line Count Constraints

| File Type      | Target        | Maximum   |
| -------------- | ------------- | --------- |
| SKILL.md       | 80-120 lines  | 150 lines |
| Reference file | 150-250 lines | 300 lines |

## Section Requirements

### Required Sections (SKILL.md)

1. **Quick Reference** - Table or bullets for at-a-glance lookup
2. **Core Concepts** - Essential patterns with code
3. **Detailed References** - Links to reference files
4. **Related Skills** - Cross-references to other skills

### Optional Sections (SKILL.md)

- Workflow (if decision tree helps)
- Anti-Patterns (if common mistakes exist)
- Directory Structure (if file layout matters)

## Reference File Structure

```markdown
# {Reference Title}

{Context paragraph}

## {Pattern Category}

{Code example with explanation}

## {Pattern Category}

{Code example with explanation}

## See Also

- [{related-reference}]({path}) - {description}
```

## Code Example Requirements

All code examples MUST:

- Use TypeScript strict mode patterns (explicit returns, no `any`)
- Include JSDoc for public functions
- Target Cloudflare Workers runtime
- Be copy-paste ready (complete, not fragments)

### TypeScript Example Template

```typescript
/**
 * Brief description of function purpose.
 * @param paramName - Description of parameter
 * @returns Description of return value
 */
export function functionName(paramName: ParamType): ReturnType {
  // Implementation
}
```

### Hugo Template Example Template

```html
{{/* Brief description of template purpose */}} {{ $variable := .Param }}

<div class="component">{{ .Content }}</div>
```

## Cross-Reference Format

**In SKILL.md**:

```markdown
## Related Skills

- [skill-name](../skill-name/SKILL.md) - Brief relationship description
```

**In Reference files**:

```markdown
## See Also

- [Reference in same skill](./other-reference.md)
- [Reference in other skill](../other-skill/references/file.md)
```
