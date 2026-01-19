# Implementation Plan: Template Builder

**Branch**: `001-template-builder` | **Date**: 2026-01-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-template-builder/spec.md`

## Summary

Build a Bash-based tooling system that packages the turtlebased-ts repository into a single-file tmplr template for project scaffolding. The system consists of two scripts: (1) a build script that assembles repository files into the txtar-inspired `.tmplr` format with exclusions and variable placeholders, and (2) an installation script that downloads and verifies the tmplr binary for template instantiation.

## Technical Context

**Language/Version**: Bash 5.x (GNU bash), portable POSIX shell constructs
**Primary Dependencies**: tmplr binary (GitHub releases), sha256sum/shasum for checksum verification, tar/find for file operations
**Storage**: N/A (file-based output to `dist/template.tmplr`)
**Testing**: Manual integration testing via `just build-template` and instantiation verification
**Target Platform**: Apple Silicon macOS, x64 Linux, arm64 Linux (Unix-like systems)
**Project Type**: Single project (build tooling scripts at repository root)
**Performance Goals**: Template build completes in <30 seconds for repositories under 100MB (SC-001)
**Constraints**: No runtime dependencies beyond Bash and standard Unix utilities; tmplr binary must be self-contained
**Scale/Scope**: Single repository template generation; one variable (`app_name`) initially

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                           | Status        | Notes                                                                                                                                                                                                                                                                                              |
| ----------------------------------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| I. Test-First Development           | ⚠️ N/A (Bash) | Constitution mandates TDD for "all code changes" - interpreted as TypeScript/application code. Bash scripts will have manual integration tests documented in quickstart.md. Justification: Bash lacks Jest-compatible testing framework; shellspec/bats would add complexity beyond project scope. |
| II. Type Safety and Static Analysis | ⚠️ N/A (Bash) | No TypeScript in this feature. Scripts will use `set -euo pipefail` for error handling and `shellcheck` for static analysis if available.                                                                                                                                                          |
| III. Code Quality Standards         | ✅ Pass       | Scripts will follow consistent naming, include header comments explaining purpose, and use descriptive variable names.                                                                                                                                                                             |
| IV. Pre-commit Quality Gates        | ✅ Pass       | Bash scripts can be added to lint-staged with shellcheck. Commit messages will follow conventional commits.                                                                                                                                                                                        |
| V. Warning and Deprecation Policy   | ✅ Pass       | Will address any shellcheck warnings immediately.                                                                                                                                                                                                                                                  |
| VI. Cloudflare Workers Target       | ⚠️ N/A        | Build tooling runs locally, not in Workers runtime. Output template is consumed by tmplr, which runs locally.                                                                                                                                                                                      |
| VII. Simplicity and Maintainability | ✅ Pass       | Simple Bash scripts with clear single responsibilities. No over-engineering.                                                                                                                                                                                                                       |

**Gate Status**: PASS with justified N/A items. Bash build tooling is outside TypeScript TDD scope but adheres to quality principles where applicable.

**Post-Design Re-evaluation** (2026-01-19): Confirmed. Design artifacts (data-model.md, contracts/, quickstart.md) align with constitution principles. No new violations introduced.

## Project Structure

### Documentation (this feature)

```text
specs/001-template-builder/
├── plan.md              # This file
├── research.md          # Phase 0: tmplr research and decisions
├── data-model.md        # Phase 1: Template file format specification
├── quickstart.md        # Phase 1: Usage and testing instructions
└── contracts/           # Phase 1: N/A (no API contracts for CLI tooling)
```

### Source Code (repository root)

```text
# Build tooling scripts (new files)
scripts/
├── build-template.sh    # Main build script (FR-001 through FR-013, FR-017, FR-019)
├── install-tmplr.sh     # tmplr installer with checksum verification (FR-014 through FR-016, FR-018, FR-020)
└── wrangler.toml.tmpl   # Template for generated wrangler.toml (FR-008 through FR-010)

# Output directory (already in .gitignore)
dist/
└── template.tmplr       # Built template output (FR-002)

# Justfile additions
justfile                 # Add build-template and install-tmplr commands
```

**Structure Decision**: Scripts live in `scripts/` directory at repository root. This follows Unix conventions and keeps build tooling separate from application source code (`src/`). The `dist/` directory is already gitignored and is the natural output location.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations requiring justification. All N/A items are explained in Constitution Check notes.
