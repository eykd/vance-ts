# Implementation Plan: Refactoring Skill for Red-Green-Refactor

**Branch**: `001-refactoring-skill` | **Date**: 2026-01-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-refactoring-skill/spec.md`

## Summary

Create a Claude Code skill for the Refactor step of Red-Green-Refactor, based on Martin Fowler's refactoring catalog. The skill uses progressive disclosure with a concise main SKILL.md containing a code smell decision tree, linking to detailed reference files for each refactoring category.

## Technical Context

**Language/Version**: Markdown (Claude Skill format)
**Primary Dependencies**: None (documentation artifact)
**Storage**: N/A (static markdown files)
**Testing**: Manual validation against success criteria
**Target Platform**: Claude Code CLI (`.claude/skills/` directory)
**Project Type**: Documentation/skill artifact (not runtime code)
**Performance Goals**: Skill lookup < 30 seconds for any code smell
**Constraints**: SKILL.md < 150 lines; follows existing skill conventions
**Scale/Scope**: 22 code smells from Fowler's Chapter 3; 9 reference categories

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                           | Applies     | Status | Notes                                               |
| ----------------------------------- | ----------- | ------ | --------------------------------------------------- |
| I. Test-First Development           | **NO**      | N/A    | Documentation artifact, not code                    |
| II. Type Safety and Static Analysis | **NO**      | N/A    | No TypeScript implementation                        |
| III. Code Quality Standards         | **PARTIAL** | PASS   | JSDoc N/A; naming conventions apply to entity names |
| IV. Pre-commit Quality Gates        | **PARTIAL** | PASS   | Markdown linting applies; no code gates             |
| V. Warning and Deprecation Policy   | **NO**      | N/A    | No runtime dependencies                             |
| VI. Cloudflare Workers Target       | **NO**      | N/A    | Not runtime code                                    |
| VII. Simplicity and Maintainability | **YES**     | PASS   | Progressive disclosure maintains simplicity         |

**Gate Result**: PASS - Documentation artifact with appropriate simplicity constraints.

## Project Structure

### Documentation (this feature)

```text
specs/001-refactoring-skill/
├── plan.md              # This file
├── research.md          # Phase 0: Skill structure research
├── data-model.md        # Phase 1: Code smell → refactoring mappings
├── quickstart.md        # Phase 1: Skill usage guide
└── tasks.md             # Phase 2: Implementation tasks
```

### Source Code (skill artifact)

```text
.claude/skills/refactoring/
├── SKILL.md              # Main skill file with decision tree
└── references/
    ├── extraction.md     # Extract/Inline Function/Variable
    ├── naming.md         # Rename patterns, comments → names
    ├── encapsulation.md  # Encapsulate Variable/Collection/Record
    ├── moving.md         # Move Function/Field/Statements
    ├── data.md           # Split Variable, Loop → Pipeline
    ├── api.md            # Parameter Object, Remove Flag Argument
    ├── polymorphism.md   # Replace Conditional with Polymorphism
    ├── simplification.md # Inline Class, Remove Dead Code
    └── inheritance.md    # Pull Up/Push Down, Replace with Delegate
```

**Structure Decision**: Single skill directory following existing `.claude/skills/` conventions. No monorepo structure needed - this is a documentation artifact.

## Complexity Tracking

No violations requiring justification. The skill structure follows established patterns in this repository.
