# Reference File Template

**Purpose**: Template for creating reference files with focused implementation patterns
**Target**: 50-150 lines per file (guideline, not hard limit)
**Location**: `.claude/skills/{skill-name}/references/{topic}.md`

---

# {Topic Title}

**Purpose**: {One-sentence description of what this reference covers}

## When to Use

{2-3 sentences describing when developer needs this reference}

## Pattern

{Core implementation pattern with complete, compilable TypeScript code}

```typescript
// {Pattern description}
import { /* imports */ } from '...';

export interface {InterfaceName} {
  // {Field descriptions}
}

export class {ClassName} {
  // {Implementation with explicit return types}
  public {methodName}(): {ReturnType} {
    // Implementation
  }
}
```

## Decision Matrix

{Optional: Include if pattern has multiple variants}

| Condition | Pattern Variant | Use When            |
| --------- | --------------- | ------------------- |
| {cond1}   | {variant1}      | {specific use case} |
| {cond2}   | {variant2}      | {specific use case} |

## Example Usage

{Complete example showing pattern in realistic context}

```typescript
// {Example scenario description}
import { {ClassName} } from './path';

const example = new {ClassName}(/* config */);

// {Usage steps}
```

## Edge Cases

{List 2-4 edge cases with handling strategies}

### {Edge Case 1}

**Scenario**: {Describe the edge case}
**Solution**: {How to handle it}

```typescript
// {Example of edge case handling}
```

## Common Mistakes

{List 2-3 common mistakes developers make}

### ❌ Mistake: {Description}

{Why it's wrong}

```typescript
// Bad example
```

### ✅ Correct: {Description}

{Why it's right}

```typescript
// Good example
```

## Testing

{Brief guidance on how to test this pattern}

```typescript
// {Test example}
describe('{PatternName}', () => {
  it('should {expected behavior}', () => {
    // Test implementation
  });
});
```

{Optional: Cross-reference to testing-observability skill if detailed}

## Related References

{Optional: Link to related references within same or different skills}

- [{Reference Name}](./{filename}.md) - {What it provides}
- [{Skill Name}: {Reference}](../../{skill-name}/references/{filename}.md) - {What it provides}

---

## Template Validation Checklist

Before finalizing reference file, verify:

- [ ] File focuses on single topic (not multiple concerns)
- [ ] All code examples are complete with imports/exports
- [ ] All code examples compile with strict TypeScript (SC-003)
- [ ] Pattern provides sufficient detail for implementation (SC-004)
- [ ] Edge cases are realistic, not hypothetical
- [ ] Examples use explicit return types (Constitution II)
- [ ] No `any` types used (Constitution II)
- [ ] Testing guidance included where appropriate

## Writing Guidelines

**Content Mix Target**:

- 30-40% code examples (copy-paste ready)
- 30-40% decision matrices/checklists (actionable guidance)
- 20-30% explanatory text (why, not what)

**Do**:

- Provide complete, compilable code with types
- Include realistic edge cases
- Show both correct and incorrect patterns
- Cross-reference related content
- Use consistent naming conventions

**Don't**:

- Include pseudo-code or partial examples
- Assume reader knowledge of internal patterns
- Use vague adjectives without quantification
- Create circular references between files
- Duplicate content from other references
