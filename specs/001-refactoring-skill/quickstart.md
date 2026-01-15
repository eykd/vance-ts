# Quickstart: Using the Refactoring Skill

**Feature**: 001-refactoring-skill
**Date**: 2026-01-15

## When to Use This Skill

Use the refactoring skill during the **REFACTOR** step of Red-Green-Refactor:

```
1. RED    → Write failing test
2. GREEN  → Make test pass (minimal code)
3. REFACTOR → Improve code without changing behavior ← USE SKILL HERE
```

**Prerequisite**: Tests MUST be green before refactoring.

## Quick Usage Guide

### Step 1: Identify the Problem

Ask yourself: "What feels wrong about this code?"

| Symptom            | Look at Section                    |
| ------------------ | ---------------------------------- |
| Hard to understand | "Is the code hard to understand?"  |
| Duplicated logic   | "Is there duplication?"            |
| Hard to change     | "Is the code hard to change?"      |
| Overly complex     | "Is there unnecessary complexity?" |
| Data issues        | "Are there data problems?"         |
| Inheritance issues | "Are there inheritance problems?"  |

### Step 2: Find the Code Smell

Use the decision tree in SKILL.md to match your symptom to a specific smell.

Example: "This function is really long" → **Long Function** smell

### Step 3: Apply the Refactoring

1. Click the reference link for your smell
2. Follow the **Steps** section exactly
3. Run tests after each small change
4. Commit when tests pass

## Common Scenarios

### "I want to break up a long function"

1. Smell: Long Function
2. Reference: [extraction.md](../../.claude/skills/refactoring/references/extraction.md)
3. Primary refactoring: **Extract Function**

### "I see the same code in multiple places"

1. Smell: Duplicated Code
2. Reference: [extraction.md](../../.claude/skills/refactoring/references/extraction.md)
3. Primary refactoring: **Extract Function** or **Pull Up Method**

### "This switch statement appears everywhere"

1. Smell: Repeated Switches
2. Reference: [polymorphism.md](../../.claude/skills/refactoring/references/polymorphism.md)
3. Primary refactoring: **Replace Conditional with Polymorphism**

### "I need to pass too many parameters"

1. Smell: Long Parameter List
2. Reference: [api.md](../../.claude/skills/refactoring/references/api.md)
3. Primary refactoring: **Introduce Parameter Object**

### "This method uses more data from another class"

1. Smell: Feature Envy
2. Reference: [moving.md](../../.claude/skills/refactoring/references/moving.md)
3. Primary refactoring: **Move Function**

## Key Rules

1. **Tests must be green** before you start
2. **One smell at a time** - don't combine refactorings
3. **Small steps** - each change should be trivial
4. **Commit frequently** - after each successful refactoring
5. **Run tests after every change**

## Related Skills

- **[prefactoring](../../.claude/skills/prefactoring/SKILL.md)**: Design principles to apply BEFORE writing code
- **[typescript-unit-testing](../../.claude/skills/typescript-unit-testing/SKILL.md)**: Ensure tests are green before refactoring
- **[clean-architecture-validator](../../.claude/skills/clean-architecture-validator/SKILL.md)**: Find layer violations to refactor

## Validation Checklist

After refactoring:

- [ ] All tests still pass
- [ ] Code is easier to understand
- [ ] No new duplication introduced
- [ ] No behavior changed
- [ ] Committed with descriptive message
