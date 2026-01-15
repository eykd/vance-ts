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

### Git Workflow Rules (Non-Negotiable)

- **NEVER amend commits** - Always create new commits for changes
- **NEVER squash-merge** - Preserve full commit history when merging PRs
- **NEVER force-push** - Except when explicitly requested by the user

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

## Claude Code Skills

This project includes comprehensive Claude Code skills for implementation guidance. Skills provide progressive disclosure through decision trees and detailed reference files.

### Logging & Tracing Skills

**Structured Logging** (`/structured-logging`)

- **Use when:** Adding structured logging to Cloudflare Workers with request correlation and environment-aware redaction
- **Provides:** SafeLogger class, AsyncLocalStorage context patterns, BaseLogFields schema, event naming, logger factory

**Log Categorization** (`/log-categorization`)

- **Use when:** Determining whether logs belong to domain, application, or infrastructure layers
- **Provides:** Decision matrix, category-specific logging patterns, required fields by category

**PII Redaction** (`/pii-redaction`)

- **Use when:** Implementing systematic PII and secret redaction for defense-in-depth data protection
- **Provides:** Sensitive pattern regex, field detection, redaction functions, URL sanitization

**Sentry Integration** (`/sentry-integration`)

- **Use when:** Integrating Sentry for rich error tracking with breadcrumbs and context
- **Provides:** withSentry wrapper configuration, context management, breadcrumb patterns, error capture

**Testing Observability** (`/testing-observability`)

- **Use when:** Writing tests for logging implementation including logger behavior and redaction correctness
- **Provides:** Logger unit test patterns, redaction validation tests, Miniflare integration tests

### Other Available Skills

See `.claude/skills/README.md` for complete skill catalog including:

- **Observability**: cloudflare-observability (SLOs, metrics, health checks)
- **Testing**: typescript-unit-testing, vitest-cloudflare-config, vitest-integration-testing
- **DDD**: ddd-domain-modeling, clean-architecture-validator
- **Workers**: worker-request-handler, d1-repository-implementation, kv-session-management, portable-datetime
- **UI**: htmx-pattern-library, htmx-alpine-templates, tailwind-daisyui-design
- **Security**: security-review, latent-features

### Skill Invocation Patterns

**Explicit Invocation:**

```
"Use /structured-logging to add a logger to this Worker"
"Apply /pii-redaction patterns to this log statement"
"Use /log-categorization to determine where this log belongs"
```

**Context-Based Activation:**
Claude automatically detects when skills are relevant based on your task.

**Skill Chains:**
Skills often reference related skills, creating implementation chains:

- Logging: structured-logging → log-categorization → pii-redaction → sentry-integration → testing-observability
- DDD: ddd-domain-modeling → cloudflare-use-case-creator → d1-repository-implementation → clean-architecture-validator

### Required Skill Usage

**ALWAYS use the `/latent-features` skill** when defining specifications or planning new features. This skill provides progressive disclosure of comprehensive guides covering:

- Security-critical patterns (authentication, session management, CSRF/XSS protection)
- Architectural best practices for Cloudflare Workers
- OWASP-compliant implementations (as of January 2026)
- Domain-driven design patterns

**Required usage during**:

- `/sp:02-specify` - Feature specification phase
- `/sp:04-plan` - Planning phase
- Implementation of security-sensitive features

## Active Technologies

- Markdown, shell scripts (no application code) + None (skeleton structure only, no runtime deps) (006-self-organizing-skeleton)
- N/A (file system structure only) (006-self-organizing-skeleton)

- Markdown documentation with TypeScript code examples (ES2022, NodeNext modules) + N/A (skills are documentation, not executable code) (005-multi-tenant-skills)
- N/A (documentation files) (005-multi-tenant-skills)

- TypeScript (ES2022, NodeNext modules) + Cloudflare Workers runtime, AsyncLocalStorage (nodejs_als), @sentry/cloudflare (003-logging-tracing-skills)
- N/A (skills are documentation, not code) (003-logging-tracing-skills)

- TypeScript (ES2022, NodeNext modules) + Cloudflare Workers runtime, Analytics Engine, D1, KV (002-observability-skills)
- N/A (skill is documentation, not code) (002-observability-skills)

- Markdown documentation, TypeScript code examples + N/A (documentation update only) (001-static-first-routing)

## Recent Changes

- 001-static-first-routing: Added Markdown documentation, TypeScript code examples + N/A (documentation update only)
