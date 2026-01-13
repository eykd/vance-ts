# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/claude-code) when working with code in this repository.

## Project Overview

TypeScript library targeting the Cloudflare Workers environment. All code changes must be implemented with **strict red-green-refactor TDD practice**.

## Essential Commands

### Development Workflow

```bash
# Run a single test file
npx jest src/path/to/file.spec.ts

# Watch mode for TDD
npx jest --watch

# Full validation before commit
npm run check  # type-check + lint + test

# Auto-fix formatting and linting
npm run fix

# Build
npm run build
```

### Using Just (Alternative Task Runner)

```bash
just test          # Run all tests
just test-watch    # TDD watch mode
just check         # type-check + lint + test
just fix           # format + lint-fix
just ci            # Full CI pipeline locally
```

## Code Quality Standards

### TypeScript Configuration

- Target: ES2022, NodeNext modules
- **Extremely strict** type checking enabled:
  - All strict flags enabled
  - `noUncheckedIndexedAccess`, `noImplicitOverride`, `noPropertyAccessFromIndexSignature`
  - No unused locals/parameters, no implicit returns

### ESLint Rules (Non-Negotiable)

- **Explicit return types required** on all functions
- **No `any` types** allowed
- **Strict boolean expressions**: no truthy/falsy checks on strings, numbers, nullable objects
- **Type imports**: Use `type` keyword for type-only imports
- **Naming conventions**:
  - Interfaces: PascalCase (no `I` prefix)
  - Type aliases: PascalCase
  - Enums: PascalCase with UPPER_CASE members
- **JSDoc required** for all public functions, methods, classes, interfaces, types, enums
- **Import order**: builtin → external → internal → parent → sibling → index (alphabetized)

### Testing Requirements

- **100% coverage threshold** (branches, functions, lines, statements)
- Tests use `.spec.ts` or `.test.ts` suffix
- Jest configuration enforces comprehensive coverage

### Pre-commit Validation

Husky + lint-staged enforces:

- Prettier formatting
- ESLint (max-warnings: 0)
- TypeScript type checking
- Jest tests for changed files

### Commit Message Format

Conventional commits enforced via commitlint:

- Types: feat, fix, docs, style, refactor, perf, test, chore, revert
- Format: `type: lowercase subject` (no period, max 100 chars)

### Warnings and Deprecations

**Address immediately** - Never ignore or defer:

- Compiler warnings (TypeScript, ESLint)
- Deprecation warnings (dependencies, runtime)
- Security advisories (`npm audit`)
- Test warnings or flaky tests

When you encounter a warning or deprecation, fix it before proceeding with other work.

## TDD Workflow

This project **requires strict red-green-refactor TDD**:

1. **Red**: Write failing test first
2. **Green**: Write minimal code to pass
3. **Refactor**: Improve code while maintaining green tests
4. **Never write implementation before tests**

When adding new functionality:

1. Create `.spec.ts` file first
2. Write test cases covering all paths
3. Run `npx jest --watch` or `just test-watch`
4. Implement code to pass tests
5. Ensure 100% coverage maintained
