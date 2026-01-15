# Implementation Plan: Beads Integration for Spec-Kit Workflow

**Branch**: `008-beads-integration` | **Date**: 2026-01-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/008-beads-integration/spec.md`

## Summary

Integrate the beads git-backed graph issue tracker into the spec-kit workflow by creating a parallel `/bd:*` command namespace that uses beads for task tracking instead of markdown files. The implementation follows a bootstrapping-safe approach: build `/bd:*` commands alongside existing `/sp:*`, validate, then swap namespaces as the final step.

## Technical Context

**Language/Version**: Markdown (Claude command format) + Bash scripts
**Primary Dependencies**: `@beads/bd` npm package (beads CLI)
**Storage**: Git-backed `.beads/` directory (JSONL format with SQLite cache)
**Testing**: Manual workflow validation + acceptance scenario verification
**Target Platform**: Claude Code CLI environment (cross-platform: Linux, macOS, Windows)
**Project Type**: Single project (command files + helper scripts)
**Performance Goals**: N/A (developer workflow tooling)
**Constraints**: Must work within Claude Code command execution context; beads CLI must be available in PATH after npm install
**Scale/Scope**: 9 command files mirroring existing `/sp:*` structure

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                           | Status  | Notes                                                                                            |
| ----------------------------------- | ------- | ------------------------------------------------------------------------------------------------ |
| I. Test-First Development           | PARTIAL | Commands are markdown prompts, not executable code. Validation via acceptance scenarios in spec. |
| II. Type Safety                     | N/A     | No TypeScript code in this feature (markdown command files only).                                |
| III. Code Quality Standards         | PASS    | Commands will follow existing sp:\* structure and naming conventions.                            |
| IV. Pre-commit Quality Gates        | PASS    | Standard git workflow applies to command files.                                                  |
| V. Warning/Deprecation Policy       | PASS    | Will address any npm warnings from @beads/bd installation.                                       |
| VI. Cloudflare Workers Target       | N/A     | This feature is developer tooling, not runtime code.                                             |
| VII. Simplicity and Maintainability | PASS    | Parallel namespace approach is simplest migration path.                                          |

**Gate Status**: PASS (no violations requiring justification)

## Project Structure

### Documentation (this feature)

```text
specs/008-beads-integration/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (beads entity mapping)
├── quickstart.md        # Phase 1 output (workflow examples)
├── contracts/           # Phase 1 output (beads CLI interface)
└── tasks.md             # Phase 2 output (/sp:06-tasks)
```

### Source Code (repository root)

```text
.claude/commands/
├── sp/                  # Existing commands (preserved unchanged)
│   ├── 01-constitution.md
│   ├── 02-specify.md
│   ├── 03-clarify.md
│   ├── 04-plan.md
│   ├── 05-checklist.md
│   ├── 06-tasks.md
│   ├── 07-implement.md
│   ├── 08-analyze.md
│   ├── 09-taskstoissues.md
│   └── README.md
│
└── bd/                  # NEW: Beads-integrated commands
    ├── 00-constitution.md
    ├── 01-specify.md
    ├── 02-clarify.md
    ├── 03-plan.md
    ├── 04-checklist.md
    ├── 05-tasks.md
    ├── 06-implement.md
    ├── 07-analyze.md
    ├── 08-taskstoissues.md
    └── README.md

.beads/                  # Created by `bd init` (git-tracked)
└── [beads internal files]

package.json             # Updated with @beads/bd devDependency
```

**Structure Decision**: Single project with parallel command namespaces. The `/bd:*` commands mirror `/sp:*` with beads integration. Final step swaps bd→sp.

## Complexity Tracking

No violations to justify. The parallel namespace approach is the simplest migration path that avoids bootstrapping issues.

## Implementation Phases

### Phase 0: Research (beads CLI integration)

Research the beads CLI commands and JSON output format to understand how to:

1. Initialize beads in a repository
2. Create epics and map them to feature specifications
3. Create tasks with parent-child relationships
4. Set task dependencies
5. Query ready tasks
6. Update task status

### Phase 1: Design

1. **Data Model**: Map spec-kit entities (spec, user story, task) to beads entities (epic, task, sub-task)
2. **Contracts**: Document beads CLI commands used by each /bd:\* command
3. **Quickstart**: Create workflow examples showing the new beads-integrated process

### Phase 2: Task Generation

Use `/sp:06-tasks` to generate implementation tasks organized by user story.
