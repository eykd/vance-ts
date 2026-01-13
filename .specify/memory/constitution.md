# turtlebased-ts Constitution

<!--
Sync Impact Report:
- Version: (none) → 1.0.0 (MAJOR - Initial ratification)
- Modified principles: Initial establishment of 7 core principles
- Added sections: Complete constitution structure established
- Removed sections: None (initial version)
- Templates requiring updates:
  ✅ plan-template.md - Constitution Check section aligns with principles
  ✅ spec-template.md - User story prioritization aligns with Test-First principle
  ✅ tasks-template.md - Task organization by user story aligns with principles
- Follow-up TODOs: None
-->

## Core Principles

### I. Test-First Development (NON-NEGOTIABLE)

Test-Driven Development is MANDATORY for all code changes. No exceptions.

- Tests MUST be written BEFORE implementation code
- Red-Green-Refactor cycle MUST be strictly followed:
  1. **Red**: Write failing test first
  2. **Green**: Write minimal code to pass
  3. **Refactor**: Improve code while maintaining green tests
- 100% test coverage threshold MUST be maintained (branches, functions, lines, statements)
- Tests use `.spec.ts` or `.test.ts` suffix
- Watch mode (`npx jest --watch`) MUST be used during development

**Rationale**: Pre-written tests ensure code correctness, prevent regressions, and serve as living documentation. The strict red-green-refactor discipline prevents implementation drift and maintains high quality standards.

### II. Type Safety and Static Analysis

Extremely strict type checking and linting standards MUST be enforced at all times.

- TypeScript strict mode with ALL strict flags enabled
- Additional strict checks: `noUncheckedIndexedAccess`, `noImplicitOverride`, `noPropertyAccessFromIndexSignature`
- No unused locals/parameters, no implicit returns
- **Explicit return types required** on ALL functions
- **No `any` types** allowed (use `unknown` with type guards)
- **Strict boolean expressions**: no truthy/falsy checks on strings, numbers, nullable objects
- **Type imports**: Use `type` keyword for type-only imports
- ESLint max-warnings: 0 (zero tolerance for warnings)

**Rationale**: Strict type safety catches bugs at compile time, improves IDE intelligence, and makes refactoring safer. Zero-warning policy prevents gradual quality degradation.

### III. Code Quality Standards

Consistent code style, documentation, and naming conventions MUST be maintained.

- **JSDoc required** for all public functions, methods, classes, interfaces, types, enums
- **Naming conventions**:
  - Interfaces: PascalCase (no `I` prefix)
  - Type aliases: PascalCase
  - Enums: PascalCase with UPPER_CASE members
- **Import order**: builtin → external → internal → parent → sibling → index (alphabetized)
- Prettier formatting enforced automatically
- All code MUST pass lint-staged checks before commit

**Rationale**: Consistent style reduces cognitive load, improves maintainability, and enables effective code review. JSDoc documentation ensures APIs are self-documenting.

### IV. Pre-commit Quality Gates

Automated quality gates MUST pass before ANY commit is accepted.

- Husky + lint-staged enforce:
  - Prettier formatting
  - ESLint (max-warnings: 0)
  - TypeScript type checking
  - Jest tests for changed files
- ALL quality checks MUST pass (no bypassing)
- Commit messages MUST follow conventional commits format:
  - Types: feat, fix, docs, style, refactor, perf, test, chore, revert
  - Format: `type: lowercase subject` (no period, max 100 chars)

**Rationale**: Pre-commit gates catch issues before they enter the repository, maintaining a consistently high-quality codebase. Conventional commits enable automated changelog generation and semantic versioning.

### V. Warning and Deprecation Policy

ALL warnings and deprecations MUST be addressed immediately. No deferral allowed.

- Compiler warnings (TypeScript, ESLint) MUST be fixed before proceeding
- Deprecation warnings (dependencies, runtime) MUST be addressed
- Security advisories (`npm audit`) MUST be resolved
- Test warnings or flaky tests MUST be fixed
- Never ignore or defer warnings

**Rationale**: Warnings are early indicators of problems. Addressing them immediately prevents technical debt accumulation and avoids compounding issues that become harder to fix later.

### VI. Cloudflare Workers Target Environment

Code MUST be compatible with Cloudflare Workers runtime constraints.

- Target: ES2022, NodeNext modules
- No Node.js-specific APIs unless polyfilled
- Respect Workers runtime limits (CPU time, memory, size)
- Code MUST work in the Workers V8 isolate environment

**Rationale**: Cloudflare Workers has specific runtime constraints different from Node.js. Code that doesn't respect these constraints will fail in production.

### VII. Simplicity and Maintainability

Start simple, build only what's needed, maintain clarity over cleverness.

- YAGNI (You Aren't Gonna Need It) - no speculative features
- KISS (Keep It Simple, Stupid) - prefer simplicity over complexity
- DRY (Don't Repeat Yourself) - abstract common functionality
- Clear, descriptive names over terse abbreviations
- Comments explain "why", not "what" (code should be self-documenting)

**Rationale**: Simple code is easier to understand, maintain, test, and debug. Premature optimization and feature speculation create unnecessary complexity and technical debt.

## Development Workflow

### Essential Commands

- `npm run check` - Full validation (type-check + lint + test)
- `npm run fix` - Auto-fix formatting and linting
- `npm run test` - Run all tests
- `npm run test:watch` - TDD watch mode
- `npm run build` - Build TypeScript to JavaScript
- `npm run validate` - Comprehensive pre-release validation

Alternative using Just:

- `just check` - Full validation
- `just fix` - Auto-fix formatting and linting
- `just test-watch` - TDD watch mode
- `just ci` - Full CI pipeline locally

### Implementation Pattern

1. Write failing test(s) in `.spec.ts` file
2. Run `npm run test:watch` or `just test-watch`
3. Implement minimal code to pass tests
4. Refactor while keeping tests green
5. Ensure 100% coverage maintained
6. Run `npm run check` before commit
7. Commit follows conventional commit format

### Code Review Checklist

All PRs MUST verify:

- [ ] Tests written BEFORE implementation
- [ ] 100% test coverage maintained
- [ ] All type checking passes with strict mode
- [ ] Zero ESLint warnings
- [ ] JSDoc present on all public APIs
- [ ] Conventional commit messages used
- [ ] All quality gates pass
- [ ] No warnings or deprecations introduced
- [ ] Code compatible with Cloudflare Workers

## Governance

### Amendment Procedure

1. Propose amendment with clear rationale
2. Identify affected templates and code
3. Create migration plan for existing code if needed
4. Update constitution with version bump
5. Propagate changes to all dependent templates
6. Update CLAUDE.md if runtime guidance affected
7. Commit with message: `docs: amend constitution to vX.Y.Z (summary)`

### Versioning Policy

Constitution follows semantic versioning:

- **MAJOR**: Backward incompatible governance/principle removals or redefinitions
- **MINOR**: New principle/section added or materially expanded guidance
- **PATCH**: Clarifications, wording, typo fixes, non-semantic refinements

### Compliance Review

- Constitution supersedes all other practices and documentation
- All PRs/reviews MUST verify compliance with constitution
- Any complexity introduced MUST be justified (see plan-template.md Complexity Tracking)
- Violations require either fix or constitutional amendment
- Use CLAUDE.md for runtime development guidance to Claude Code

**Version**: 1.0.0 | **Ratified**: 2026-01-13 | **Last Amended**: 2026-01-13
