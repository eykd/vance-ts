# Research: Refactoring Skill

**Feature**: 001-refactoring-skill
**Date**: 2026-01-15

## Research Tasks

### 1. Skill Structure Conventions

**Decision**: Follow existing `.claude/skills/` patterns with SKILL.md + references/ directory.

**Rationale**:

- Consistent with 20+ existing skills in the repository
- Progressive disclosure: main file is scannable, references provide depth
- Frontmatter format (`name`, `description`) required for skill discovery

**Alternatives Considered**:

- Single monolithic file: Rejected - would exceed 150 line constraint for 22 smells + 40+ refactorings
- Flat structure (no subdirectory): Rejected - reference files would clutter skill root

### 2. Code Smell Organization

**Decision**: Organize decision tree by symptom category (hard to understand, duplication, hard to change, etc.).

**Rationale**:

- Developers approach refactoring with symptoms ("something feels wrong") not smell names
- Matches Martin Fowler's Chapter 3 organization
- Faster lookup than alphabetical smell listing

**Alternatives Considered**:

- Alphabetical by smell name: Rejected - requires knowing terminology
- By refactoring technique: Rejected - many refactorings fix multiple smells

### 3. Reference File Grouping

**Decision**: Group refactorings by transformation type (extraction, naming, encapsulation, moving, etc.).

**Rationale**:

- Related refactorings share mechanics (e.g., all extraction refactorings follow extract→replace pattern)
- Reduces duplication in explanations
- Maps to Fowler's chapter structure (6-12)

**Reference Categories**:
| Category | Refactorings Included |
|----------|----------------------|
| extraction.md | Extract/Inline Function, Extract/Inline Variable, Replace Temp with Query |
| naming.md | Change Function Declaration, Rename Variable/Field |
| encapsulation.md | Encapsulate Variable/Collection/Record, Replace Primitive with Object, Hide Delegate, Introduce Special Case |
| moving.md | Move Function/Field, Move Statements into/to Function, Slide Statements, Split Loop |
| data.md | Split Variable, Replace Derived Variable with Query, Change Reference/Value, Replace Loop with Pipeline |
| api.md | Introduce Parameter Object, Remove Flag Argument, Preserve Whole Object, Replace Parameter/Query with Query/Parameter, Remove Setting Method, Separate Query from Modifier |
| polymorphism.md | Replace Conditional with Polymorphism, Decompose Conditional, Replace Type Code with Subclasses, Introduce Assertion |
| simplification.md | Inline Function/Class, Remove Dead Code, Collapse Hierarchy, Remove Middle Man, Substitute Algorithm |
| inheritance.md | Pull Up/Push Down Method/Field, Pull Up Constructor Body, Extract Superclass, Replace Subclass/Superclass with Delegate |

### 4. TDD Integration

**Decision**: Skill explicitly requires green tests before use.

**Rationale**:

- Constitution Principle I mandates TDD
- Refactoring by definition preserves behavior; tests verify this
- Skill cross-references `typescript-unit-testing` skill

**Alternatives Considered**:

- Allow exploratory refactoring without tests: Rejected - violates TDD discipline

### 5. Example Code Language

**Decision**: Use TypeScript for all code examples.

**Rationale**:

- Project targets TypeScript/Cloudflare Workers
- Consistent with other skills in repository
- Examples show type-safe patterns

**Alternatives Considered**:

- Language-agnostic pseudocode: Rejected - less actionable for TypeScript projects
- Multiple languages: Rejected - increases maintenance burden

## Resolved Questions

All technical context items were clear. No outstanding NEEDS CLARIFICATION markers.

## Next Steps

Proceed to Phase 1: Design & Contracts (data-model.md, quickstart.md).
