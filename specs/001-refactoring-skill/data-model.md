# Data Model: Code Smell → Refactoring Mappings

**Feature**: 001-refactoring-skill
**Date**: 2026-01-15

## Entities

### Code Smell

A symptom in code indicating a potential design problem.

| Attribute    | Type          | Description                                  |
| ------------ | ------------- | -------------------------------------------- |
| name         | string        | Canonical smell name (e.g., "Long Function") |
| category     | enum          | Symptom category (see below)                 |
| symptoms     | string[]      | Observable characteristics                   |
| refactorings | Refactoring[] | Recommended fixes                            |

**Categories**:

- `understanding` - Code is hard to understand
- `duplication` - Same logic appears multiple times
- `change` - Code is hard to modify
- `complexity` - Unnecessary abstractions/indirection
- `data` - Data structure problems
- `inheritance` - Class hierarchy issues

### Refactoring Technique

A behavior-preserving code transformation.

| Attribute | Type        | Description                                         |
| --------- | ----------- | --------------------------------------------------- |
| name      | string      | Canonical technique name (e.g., "Extract Function") |
| category  | string      | Reference file category                             |
| when      | string      | Applicability guidance                              |
| steps     | string[]    | Ordered transformation steps                        |
| example   | CodeExample | Before/after TypeScript                             |

### Reference File

A grouping of related refactorings.

| Attribute    | Type          | Description                 |
| ------------ | ------------- | --------------------------- |
| filename     | string        | e.g., "extraction.md"       |
| refactorings | Refactoring[] | Contained techniques        |
| path         | string        | Relative path from SKILL.md |

## Code Smell Catalog (22 Smells)

### Understanding Category

| Smell               | Primary Refactorings                                                  | Reference        |
| ------------------- | --------------------------------------------------------------------- | ---------------- |
| Mysterious Name     | Change Function Declaration, Rename Variable, Rename Field            | naming.md        |
| Long Function       | Extract Function, Replace Temp with Query, Introduce Parameter Object | extraction.md    |
| Comments            | Extract Function, Change Function Declaration, Introduce Assertion    | naming.md        |
| Primitive Obsession | Replace Primitive with Object, Replace Type Code with Subclasses      | encapsulation.md |

### Duplication Category

| Smell             | Primary Refactorings                                             | Reference        |
| ----------------- | ---------------------------------------------------------------- | ---------------- |
| Duplicated Code   | Extract Function, Slide Statements, Pull Up Method               | extraction.md    |
| Data Clumps       | Extract Class, Introduce Parameter Object, Preserve Whole Object | encapsulation.md |
| Repeated Switches | Replace Conditional with Polymorphism                            | polymorphism.md  |

### Change Category

| Smell            | Primary Refactorings                                        | Reference        |
| ---------------- | ----------------------------------------------------------- | ---------------- |
| Divergent Change | Split Phase, Move Function, Extract Function, Extract Class | moving.md        |
| Shotgun Surgery  | Move Function, Move Field, Combine Functions into Class     | moving.md        |
| Feature Envy     | Move Function, Extract Function                             | moving.md        |
| Message Chains   | Hide Delegate, Extract Function, Move Function              | encapsulation.md |

### Complexity Category

| Smell                  | Primary Refactorings                                                            | Reference         |
| ---------------------- | ------------------------------------------------------------------------------- | ----------------- |
| Long Parameter List    | Replace Parameter with Query, Preserve Whole Object, Introduce Parameter Object | api.md            |
| Speculative Generality | Collapse Hierarchy, Inline Function, Inline Class, Remove Dead Code             | simplification.md |
| Lazy Element           | Inline Function, Inline Class, Collapse Hierarchy                               | simplification.md |
| Middle Man             | Remove Middle Man, Inline Function                                              | simplification.md |
| Dead Code              | Remove Dead Code                                                                | simplification.md |
| Loops                  | Replace Loop with Pipeline                                                      | data.md           |

### Data Category

| Smell           | Primary Refactorings                                               | Reference        |
| --------------- | ------------------------------------------------------------------ | ---------------- |
| Global Data     | Encapsulate Variable                                               | encapsulation.md |
| Mutable Data    | Encapsulate Variable, Split Variable, Separate Query from Modifier | data.md          |
| Temporary Field | Extract Class, Move Function, Introduce Special Case               | encapsulation.md |

### Inheritance Category

| Smell                                         | Primary Refactorings                                                 | Reference        |
| --------------------------------------------- | -------------------------------------------------------------------- | ---------------- |
| Large Class                                   | Extract Class, Extract Superclass, Replace Type Code with Subclasses | inheritance.md   |
| Refused Bequest                               | Push Down Method, Push Down Field, Replace Subclass with Delegate    | inheritance.md   |
| Insider Trading                               | Move Function, Move Field, Hide Delegate                             | encapsulation.md |
| Alternative Classes with Different Interfaces | Change Function Declaration, Move Function, Extract Superclass       | inheritance.md   |
| Data Class                                    | Encapsulate Record, Remove Setting Method, Move Function             | encapsulation.md |

## Reference File → Refactoring Mapping

| Reference File    | Refactorings                                                                                                                                                                                                                                                                                      |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| extraction.md     | Extract Function, Inline Function, Extract Variable, Inline Variable, Replace Temp with Query                                                                                                                                                                                                     |
| naming.md         | Change Function Declaration, Rename Variable, Rename Field                                                                                                                                                                                                                                        |
| encapsulation.md  | Encapsulate Variable, Encapsulate Record, Encapsulate Collection, Replace Primitive with Object, Hide Delegate, Introduce Special Case                                                                                                                                                            |
| moving.md         | Move Function, Move Field, Move Statements into Function, Move Statements to Callers, Slide Statements, Split Loop, Replace Inline Code with Function Call                                                                                                                                        |
| data.md           | Split Variable, Replace Derived Variable with Query, Change Reference to Value, Change Value to Reference, Replace Loop with Pipeline                                                                                                                                                             |
| api.md            | Introduce Parameter Object, Remove Flag Argument, Preserve Whole Object, Replace Parameter with Query, Replace Query with Parameter, Remove Setting Method, Separate Query from Modifier, Replace Constructor with Factory Function, Replace Function with Command, Replace Command with Function |
| polymorphism.md   | Decompose Conditional, Consolidate Conditional Expression, Replace Nested Conditional with Guard Clauses, Replace Conditional with Polymorphism, Introduce Special Case, Introduce Assertion                                                                                                      |
| simplification.md | Inline Function, Inline Class, Remove Dead Code, Collapse Hierarchy, Remove Middle Man, Substitute Algorithm                                                                                                                                                                                      |
| inheritance.md    | Pull Up Method, Pull Up Field, Pull Up Constructor Body, Push Down Method, Push Down Field, Replace Type Code with Subclasses, Remove Subclass, Extract Superclass, Replace Subclass with Delegate, Replace Superclass with Delegate                                                              |

## Validation Rules

1. Every smell in Fowler's Chapter 3 MUST have at least one refactoring mapped
2. Every refactoring MUST have a reference file assignment
3. No refactoring appears in more than one reference file
4. SKILL.md links MUST resolve to existing reference files
