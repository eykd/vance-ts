# Feature Specification: Refactoring Skill for Red-Green-Refactor

**Feature Branch**: `001-refactoring-skill`
**Created**: 2026-01-15
**Status**: Draft
**Input**: User description: "Create a Claude Skill for the Refactor step of Red-Green-Refactor based on Martin Fowler's refactoring principles"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Identify Code Smells During Refactor Phase (Priority: P1)

A developer has just made their tests pass (green) and wants to improve the code structure without changing behavior. They need guidance on which code smells to look for and which refactorings address each smell.

**Why this priority**: This is the core use case - the refactor step happens after every green test in TDD. Developers need quick, actionable guidance at this frequent decision point.

**Independent Test**: Can be fully tested by presenting code with a specific smell and verifying the skill recommends appropriate refactorings with clear steps.

**Acceptance Scenarios**:

1. **Given** tests are green and code contains a Long Function smell, **When** developer consults the refactoring skill, **Then** the skill identifies Extract Function as the primary solution with step-by-step guidance.

2. **Given** tests are green and code contains duplicated logic, **When** developer consults the refactoring skill, **Then** the skill recommends appropriate extraction refactorings to eliminate duplication.

3. **Given** tests are failing (red), **When** developer attempts to use the refactoring skill, **Then** the skill reminds them that tests must be green before refactoring.

---

### User Story 2 - Access Detailed Refactoring Patterns (Priority: P2)

A developer has identified a code smell and needs detailed, step-by-step instructions for a specific refactoring technique, including code examples.

**Why this priority**: Once a smell is identified, developers need actionable details. Progressive disclosure keeps the main skill concise while detailed references provide depth when needed.

**Independent Test**: Can be fully tested by requesting a specific refactoring pattern and verifying complete step-by-step instructions with before/after code examples are provided.

**Acceptance Scenarios**:

1. **Given** developer needs to perform Extract Function, **When** they access the extraction reference, **Then** they receive numbered steps, when-to-use guidance, and TypeScript examples.

2. **Given** developer needs to perform Replace Conditional with Polymorphism, **When** they access the polymorphism reference, **Then** they receive complete class hierarchy transformation examples.

---

### User Story 3 - Navigate Code Smell Decision Tree (Priority: P3)

A developer sees problematic code but isn't sure which smell it represents. They need a decision tree to diagnose the issue based on symptoms.

**Why this priority**: Not all developers are fluent in code smell terminology. The decision tree bridges the gap between "something feels wrong" and "here's the specific refactoring to apply."

**Independent Test**: Can be fully tested by presenting symptoms (e.g., "code is hard to change") and verifying the skill narrows down to specific smells and refactorings.

**Acceptance Scenarios**:

1. **Given** code is hard to understand, **When** developer consults the decision tree, **Then** the skill presents options like Mysterious Name, Long Function, or Primitive Obsession with distinguishing characteristics.

2. **Given** a single change requires modifications across many files, **When** developer consults the decision tree, **Then** the skill identifies Shotgun Surgery and recommends Move Function/Field consolidation.

---

### Edge Cases

- What happens when multiple code smells are present? The skill should recommend addressing one smell at a time, prioritizing the most impactful.
- How does the system handle code that doesn't exhibit any recognized smells? The skill should confirm the code is clean and no refactoring is needed.
- What if a developer tries to refactor before tests are green? The skill reinforces the TDD discipline by reminding them to make tests pass first.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: Skill MUST be invoked during the Refactor step of Red-Green-Refactor when tests are green
- **FR-002**: Skill MUST provide a code smell decision tree organized by symptom categories (hard to understand, duplication, hard to change, unnecessary complexity, data problems, inheritance problems)
- **FR-003**: Skill MUST link each code smell to specific refactoring techniques with reference documentation
- **FR-004**: Skill MUST use progressive disclosure - concise main skill file with detailed reference files for each refactoring category
- **FR-005**: Skill MUST include TypeScript code examples in reference files showing before/after transformations
- **FR-006**: Skill MUST cross-reference related skills (prefactoring, typescript-unit-testing, clean-architecture-validator)
- **FR-007**: Skill MUST remind developers that tests must be green before refactoring begins
- **FR-008**: Skill MUST provide quick-reference tables mapping common goals ("I want to...") to appropriate refactorings
- **FR-009**: Reference files MUST include step-by-step mechanics for each refactoring technique
- **FR-010**: Skill structure MUST follow existing project skill conventions (SKILL.md with frontmatter, references/ directory)

### Key Entities

- **Code Smell**: A symptom in code that may indicate a deeper problem; includes recognition patterns and recommended refactorings
- **Refactoring Technique**: A behavior-preserving transformation with defined steps, applicability criteria, and examples
- **Reference File**: A detailed document containing multiple related refactoring techniques with full examples

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Developers can identify appropriate refactoring for any of the 22 code smells defined in Chapter 3 within 30 seconds using the decision tree
- **SC-002**: Each refactoring reference file contains complete step-by-step instructions that a developer can follow without external resources
- **SC-003**: Skill main file (SKILL.md) remains under 150 lines to ensure quick scanning during the refactor phase
- **SC-004**: 100% of code smells from Martin Fowler's catalog are covered with at least one recommended refactoring
- **SC-005**: Skill integrates seamlessly with existing TDD workflow - developer consults skill only after achieving green tests

## Assumptions

- Developers using this skill are familiar with basic TDD concepts (Red-Green-Refactor cycle)
- The target language is TypeScript, consistent with the project's technology stack
- Developers have access to IDE refactoring tools for mechanical transformations
- The skill is consulted manually by developers, not automatically triggered
