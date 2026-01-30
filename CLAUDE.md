# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/claude-code) when working with code in this repository.

## Project Overview

A static-first Typescript web application targeting the Cloudflare Pages & Workers environment, using Hugo for building the static pages.

## Runtime Environment

**Cloudflare Workers** - NOT Node.js. Web Standard APIs only.

**Forbidden:**

- Node.js imports (`fs`, `path`, `process`, `crypto`, `http`, `buffer`, `stream`, etc.)
- `process.env` → Use `env` parameter in fetch handler
- `__dirname`, `__filename`, `require()` → No file system
- `@types/node` types → Use `@cloudflare/workers-types`

**Required:**

- Environment: `env` parameter in `fetch(request, env, ctx)`
- APIs: `fetch`, `Request`, `Response`, `Headers`, `URL`, `crypto.subtle`
- Storage: D1 (SQL), KV (key-value), R2 (objects), Durable Objects (stateful)
- Types: `@cloudflare/workers-types` with `lib: ["ES2022", "WebWorker"]`

All code changes must be tested:

- **TypeScript/JavaScript**: Strict red-green-refactor TDD practice (**100% coverage - non-negotiable**)
  - Jest enforces 100% threshold for branches, functions, lines, statements
  - Pre-commit hooks will fail on less than 100% coverage
  - Use istanbul ignore comments ONLY for truly untestable edge cases (see typescript-unit-testing skill)
  - Run `npx jest --coverage` to verify before committing
- **Hugo static site**: Build verification tests (zero errors, zero warnings)

## Getting Started

New users deploying this project for the first time should type `start` to begin the guided deployment process.

**Note**: When a user types just `start` (without a slash), treat it as equivalent to `/start` and invoke the start skill. This workaround addresses a known issue with slash commands in Claude Code for the Web.

## Communication Guidelines for Non-Technical Users

Many users of this project are non-technical professionals (corporate managers, business owners, founders) who are comfortable with technology but don't have programming backgrounds. When communicating with users, follow these guidelines:

### Core Principles

1. **Use plain language**: Target a 6th-grade reading level
   - Avoid technical jargon whenever possible
   - When technical terms are necessary, define them immediately in simple terms
   - Example: "Worker" → "Your application code running on Cloudflare's global network"

2. **Ask one question at a time**: CRITICAL
   - Never bundle multiple questions in a single message
   - Wait for the answer before asking the next question
   - Prevents overwhelm and ensures understanding

3. **Explain the "why," not just the "what"**:
   - Provide context for actions and decisions
   - Help users understand purpose and implications
   - Example: "We need your Cloudflare API token so I can deploy the application on your behalf"

4. **Be encouraging and patient**:
   - Normalize confusion ("This can feel complex at first")
   - Celebrate progress ("Great! Your Worker is now live")
   - Offer escape hatches ("If you're stuck, I can help troubleshoot")

5. **Validate understanding**:
   - Ask "Did that work? What do you see?"
   - Confirm completion before moving to next step
   - Check for confusion signals

6. **Go step by step**:
   - Don't overwhelm with information
   - Focus on current phase, not entire workflow
   - Break complex tasks into smaller diagnostic steps

### Security Rules

- **NEVER ask users to paste secrets** (API keys, tokens, passwords, DSNs) in the chat
- **ALWAYS guide them** to set environment variables or use secure configuration
- **EXPLAIN why**: "For security, we set this as an environment variable rather than pasting it in chat"

### Examples and References

For excellent examples of non-technical communication, see:

- `.claude/skills/deploy-your-app/SKILL.md` (comprehensive guidance)
- `.claude/commands/start.md` (deployment workflow)

These files demonstrate proper audience awareness, plain language, and step-by-step guidance.

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
- Fail on build warnings (zero-warning policy, matching TypeScript strictness)
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

#### Architecture Boundary Enforcement

ESLint enforces Clean Architecture layer boundaries (once enabled in `eslint.config.mjs`):

- **Domain layer** (`src/domain/`) cannot import from:
  - `application/` - Domain is innermost layer
  - `infrastructure/` - Domain defines interfaces, infrastructure implements
  - `presentation/` - Domain has no knowledge of HTTP or UI
- **Application layer** (`src/application/`) cannot import from:
  - `infrastructure/` - Application depends on domain interfaces only
  - `presentation/` - Application has no knowledge of HTTP or UI
- **Infrastructure layer** (`src/infrastructure/`) cannot import from:
  - `presentation/` - Infrastructure implements domain interfaces, not presentation concerns

**To enable**: Uncomment the architecture rules in `eslint.config.mjs` once you've created the proper directory structure (`src/domain/`, `src/application/`, `src/infrastructure/`, `src/presentation/`).

**Violations**: Pre-commit hooks will fail if layer boundaries are violated.

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

### Beads Task Management

- **ALWAYS include `--description`** when creating beads tasks with `npx bd create`
- Descriptions should explain the task's purpose, not just repeat the title

### Warnings and Deprecations

**Address immediately** - Never ignore or defer:

- Compiler warnings (TypeScript, ESLint)
- Deprecation warnings (dependencies, runtime)
- Security advisories (`npm audit`)
- Test warnings or flaky tests

When you encounter a warning or deprecation, fix it before proceeding with other work.

## TDD Workflow

### TypeScript/JavaScript Code

This project **requires strict red-green-refactor TDD** for all TypeScript/JavaScript code:

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
   - Run `npx jest --coverage` to verify
   - All four metrics must show 100%: branches, functions, lines, statements
   - If stuck below 100%, ask: "Can I mock the dependency?" before using istanbul ignore
   - See `/typescript-unit-testing` skill for guidance on achieving 100%

### Hugo Static Site

Build verification is required for all Hugo changes:

1. Make changes to templates, content, or configuration
2. Run `cd hugo && npm test` to verify build succeeds
3. Build must complete with zero errors and zero warnings
4. Required output files must exist with correct structure

### Required Skill Usage

**ALWAYS use the `/latent-features` skill** when defining specifications or planning new features. **Required usage during**:

- `/sp:01-specify` - Feature specification phase
- `/sp:03-plan` - Planning phase

**ALWAYS use the `/prefactoring` skill** during design and implementation. **Required usage during**:

- **Design Phase**: Creating modules, defining boundaries, choosing architectures
- **Type Design**: Creating classes/types, wrapping primitives, grouping related data
- **Implementation**: Naming things, structuring logic, implementing business rules
- **API Design**: Defining contracts, validation, error handling strategies

**ALWAYS use the `/error-handling-patterns` skill** when working with error handling. **Required usage during**:

- **Use Case Implementation**: All use cases must return Result types
- **Error Class Design**: Creating domain errors, validation errors, infrastructure errors
- **HTTP Handler Implementation**: Mapping errors to safe HTTP responses
- **Code Review**: Checking for error disclosure vulnerabilities and inconsistent error handling

**ALWAYS use the `/portable-datetime` skill** when working with dates and times. **Required usage during**:

- **Database Schema Design**: Defining timestamp columns (always TEXT with UTC)
- **Entity/Value Object Creation**: Storing timestamps as ISO strings
- **Business Logic**: Calculating future dates, scheduling
- **Testing**: Writing timezone-independent tests with fixed UTC values
- **Display Logic**: Converting UTC to user timezone only at presentation boundary

**ALWAYS use the `/glossary` skill** when working with domain terminology. **Required usage during**:

- **Naming**: Before creating classes, types, functions in domain/application layers
- **Code Review**: Checking naming quality and consistency
- **Specification**: Identifying and clarifying domain terms (sp:01-specify)
- **Planning**: Ensuring architecture uses canonical terminology (sp:03-plan)
- **Quality Review**: Validating naming matches glossary (sp:10-code-quality-review)

## Active Technologies

Do not track active technologies in CLAUDE.md.

## Recent Changes

Do not track recent changes in CLAUDE.md.
