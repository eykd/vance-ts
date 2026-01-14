# SKILL.md Template

**Purpose**: Template for creating SKILL.md files following progressive disclosure pattern
**Target**: <150 lines per SC-001
**Location**: `.claude/skills/{skill-name}/SKILL.md`

---

# {Skill Title}

**Use when:** {One-line description starting with action verb describing when to invoke this skill}

## Overview

{2-3 sentence summary of what this skill provides and why it matters}

## Decision Tree

{Present 3-5 decision points that route developers to appropriate reference files}

### {Decision Point 1}

**When**: {Describe the condition or need}
**Go to**: [references/{filename}.md](./references/{filename}.md)

### {Decision Point 2}

**When**: {Describe the condition or need}
**Go to**: [references/{filename}.md](./references/{filename}.md)

{Continue for remaining decision points}

## Quick Example

{Provide 10-20 line copy-paste ready code example showing most common usage}

```typescript
// {Brief example description}
{
  code;
}
```

## Cross-References

{List related skills with specific context for when to use them}

- **[{related-skill}](../{related-skill}/SKILL.md)**: {Specific context - what it provides}
- **[{related-skill}](../{related-skill}/SKILL.md)**: {Specific context - what it provides}

## Reference Files

{List all reference files with one-line descriptions}

- [references/{file}.md](./references/{file}.md) - {One-line description}
- [references/{file}.md](./references/{file}.md) - {One-line description}

---

## Template Validation Checklist

Before finalizing SKILL.md, verify:

- [ ] File is under 150 lines (SC-001)
- [ ] Description starts with "Use when:" (SC-002)
- [ ] Decision tree has 3-5 clear decision points
- [ ] Quick example is complete and compilable (SC-003)
- [ ] Cross-references are specific, not generic
- [ ] All reference files are listed with descriptions
- [ ] No duplication of content from other skills (FR-011)

## Writing Guidelines

**Do**:

- Keep decision points mutually exclusive when possible
- Use specific, actionable language ("When you need X" not "If you might want X")
- Provide complete, compilable code in examples
- Include imports and exports in code examples
- Use consistent formatting across all skills

**Don't**:

- Include implementation details that belong in references
- Create overlapping decision points
- Use vague language ("robust", "better", "improved")
- Link to external docs unless absolutely necessary
- Duplicate content available in other skills
