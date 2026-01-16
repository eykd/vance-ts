# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/claude-code) when working with code in this repository.

## Project Overview

A static-first Typescript web application targeting the Cloudflare Pages & Workers environment, using Hugo for building the static pages.

All code changes must be implemented with **strict red-green-refactor TDD practice**.

## Getting Started

New users deploying this project for the first time should type `start` to begin the guided deployment process.

**Note**: When a user types just `start` (without a slash), treat it as equivalent to `/start` and invoke the start skill. This workaround addresses a known issue with slash commands in Claude Code for the Web.

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

### Hugo Static Site Commands

```bash
just hugo-dev      # Start Hugo dev server (http://localhost:1313)
just hugo-build    # Build for production (output in hugo/public/)
just hugo-clean    # Clean build artifacts
just hugo-rebuild  # Clean and rebuild
just hugo-check    # Verify Hugo installation and dependencies
just hugo-install  # Install Hugo npm dependencies

# Hugo build verification tests
cd hugo && npm test  # Run build verification (builds site and checks output)
```

**Note**: Hugo commands use `npx hugo` to run the npm-installed Hugo v0.154.5 (from `hugo-extended` package). This ensures consistent versions across all environments.

**Hugo Build Tests**: The Hugo site has build verification tests (`hugo/test-build.js`) that:

- Build the site with `npx hugo --minify`
- Verify required files exist (index.html, CSS files, 404.html)
- Check build output structure is correct
- Run via `cd hugo && npm test`

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

### Git Workflow Rules (Non-Negotiable)

- **NEVER amend commits** - Always create new commits for changes
- **NEVER squash-merge** - Preserve full commit history when merging PRs
- **NEVER force-push** - Except when explicitly requested by the user

`git` and `gh` commands must be run outside the sandbox due to network restrictions.

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

### Required Skill Usage

**ALWAYS use the `/latent-features` skill** when defining specifications or planning new features. **Required usage during**:

- `/sp:01-specify` - Feature specification phase
- `/sp:03-plan` - Planning phase

**ALWAYS use the `/prefactoring` skill** during design and implementation. **Required usage during**:

- **Design Phase**: Creating modules, defining boundaries, choosing architectures
- **Type Design**: Creating classes/types, wrapping primitives, grouping related data
- **Implementation**: Naming things, structuring logic, implementing business rules
- **API Design**: Defining contracts, validation, error handling strategies

## Active Technologies

- Markdown (Claude Skill format) + Bash scripts for integration + Git (for diff generation), beads CLI (`@beads/bd`), existing `security-review` skill (009-code-review-skill)
- N/A (stateless skill, beads handles persistence) (009-code-review-skill)

- Markdown (Claude command format) + Bash scripts + `@beads/bd` npm package (beads CLI) (008-beads-integration)
- Git-backed `.beads/` directory (JSONL format with SQLite cache) (008-beads-integration)

- Hugo 0.147.8+, Go templates, CSS (TailwindCSS 4) + TailwindCSS 4, DaisyUI 5, @tailwindcss/typography (007-hugo-project-setup)
- N/A (static site generator) (007-hugo-project-setup)

- Markdown (Claude Skill format) + None (documentation artifact) (001-refactoring-skill)
- N/A (static markdown files) (001-refactoring-skill)

## Recent Changes

- 001-refactoring-skill: Added Markdown (Claude Skill format) + None (documentation artifact)
