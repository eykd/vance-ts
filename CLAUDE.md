## Project Overview

A static-first Typescript web application targeting the Cloudflare Workers environment, using Hugo for building the static pages.

## Directory Structure

```
src/                          → TypeScript source (see src/CLAUDE.md)
  application/                → Use cases, DTOs (see src/application/CLAUDE.md)
  di/                         → Dependency injection (see src/di/CLAUDE.md)
  domain/                     → Entities, value objects, interfaces (see src/domain/CLAUDE.md)
  infrastructure/             → D1/KV implementations (see src/infrastructure/CLAUDE.md)
  presentation/               → HTTP handlers, templates (see src/presentation/CLAUDE.md)
  shared/                     → Cross-cutting utilities (see src/shared/CLAUDE.md)
hugo/                         → Static site (see hugo/CLAUDE.md)
specs/                        → Feature specs and acceptance criteria
acceptance/                   → Acceptance test pipeline
generated-acceptance-tests/   → Generated GWT test files
migrations/                   → D1 database migrations (see migrations/CLAUDE.md)
scripts/                      → Build and automation scripts
docs/                         → Architecture documentation
tests/                        → Test helpers and fixtures (see tests/CLAUDE.md)
.claude/skills/               → On-demand skill definitions
```

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

## Testing Mandate (Non-Negotiable)

- **TypeScript**: Strict TDD, 100% coverage. See `/test-driven-development` and `/typescript-unit-testing` skills.
- **Hugo**: Zero errors, zero warnings. See `hugo/CLAUDE.md`.

## Getting Started

New users deploying this project for the first time should type `start` to begin the guided deployment process.

**Note**: When a user types just `start` (without a slash), treat it as equivalent to `/start` and invoke the start skill. This workaround addresses a known issue with slash commands in Claude Code for the Web.

## Communication

Many users are non-technical professionals. Use the `/non-technical-communication` skill for guidelines. **NEVER ask users to paste secrets** in chat — always guide them to use environment variables.

## Essential Commands

### Development Workflow

```bash
npx vitest run src/path/to/file.spec.ts  # Run a single test file
npx vitest                                 # Watch mode for TDD
npm run check                              # type-check + lint + test
npm run fix                                # Auto-fix formatting and linting
npm run build                              # Build
```

### Using Just (Alternative Task Runner)

```bash
just test          # Run all tests
just test-watch    # TDD watch mode
just check         # type-check + lint + test
just fix           # format + lint-fix
just ci            # Full CI pipeline locally
just acceptance    # Full acceptance pipeline: parse specs → generate → run
just test-all      # Unit tests + acceptance tests
```

Hugo commands: see `hugo/CLAUDE.md`.

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

Architecture boundary enforcement: see `src/CLAUDE.md`.

### Testing Requirements

- **100% coverage threshold** (branches, functions, lines, statements)
- Tests use `.spec.ts` or `.test.ts` suffix
- Vitest enforces comprehensive coverage
- **Exception**: Workers source code (`src/`) is tested via the `workers` vitest project
  but cannot contribute to v8 coverage reports — the Workers runtime does not support
  `node:inspector`. The 100% threshold enforced by `test:coverage` applies to
  `acceptance/**/*.ts` (Node.js pipeline code) only. This is a runtime constraint,
  not an oversight (see `vitest.config.ts` for details).

### Pre-commit Validation

Husky + lint-staged enforces:

- Prettier formatting
- ESLint (max-warnings: 0)
- TypeScript type checking
- Vitest tests for changed files

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
- When creating beads tasks ad hoc (during planning, reviews, or mid-implementation discovery),
  check `npx bd list --status=in_progress --type=epic` for the active epic. If one exists, always pass
  `--parent <implement-task-id>` (the `[sp:07-implement]` child of the epic, not the epic root
  itself). Orphaned tasks are invisible to `ralph` automation.

### Warnings and Deprecations

**Address immediately** - Never ignore or defer:

- Compiler warnings (TypeScript, ESLint)
- Deprecation warnings (dependencies, runtime)
- Security advisories (`npm audit`)
- Test warnings or flaky tests

When you encounter a warning or deprecation, fix it before proceeding with other work.

## Required Skills

Always use these skills when working in their domains:

- `/latent-features` — during `/sp:01-specify` and `/sp:03-plan`
- `/prefactoring` — during design and implementation (see layer CLAUDE.md files)
- `/error-handling-patterns` — when implementing error handling (see layer CLAUDE.md files)
- `/portable-datetime` — when working with dates/times (see layer CLAUDE.md files)
- `/glossary` — when naming or reviewing domain terminology

## TDD Workflow

Strict red-green-refactor TDD for all TypeScript code. See `/test-driven-development` skill for the full process. Run `npx vitest run --coverage` to verify 100% coverage before committing.

## ATDD Workflow

User story tasks (`US<N>` prefix) use Acceptance Test-Driven Development. Acceptance tests define done. See `/atdd` skill for workflow details, `/acceptance-tests` for writing specs. Specs live in `specs/acceptance-specs/`.

## Specs

Before implementing any feature, read `specs/readme.md` first. It lists all specs with keywords that bridge search terms to spec paths — preventing hallucination when your first search misses.

---

Always use subagents liberally and aggressively to conserve the main context window.

## Active Technologies
- TypeScript/ES2022 targeting Cloudflare Workers V8 isolate + Hono 4.x, better-auth, Drizzle ORM (sqlite-core + D1 adapter), Vitest 2.x + `@cloudflare/vitest-pool-workers` (012-clawtask-vertical-slice)
- Cloudflare D1 (SQLite); D1 batch API for atomic multi-entity mutations (012-clawtask-vertical-slice)

## Recent Changes
- 012-clawtask-vertical-slice: Added TypeScript/ES2022 targeting Cloudflare Workers V8 isolate + Hono 4.x, better-auth, Drizzle ORM (sqlite-core + D1 adapter), Vitest 2.x + `@cloudflare/vitest-pool-workers`
