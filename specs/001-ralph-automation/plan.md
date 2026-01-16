# Implementation Plan: Ralph Automation Loop

**Branch**: `001-ralph-automation` | **Date**: 2026-01-16 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-ralph-automation/spec.md`

## Summary

Create a `ralph.sh` bash script that orchestrates automated feature development by repeatedly invoking Claude CLI with `/sp:next` prompts. The script uses beads as the source of truth for task completion, implementing exponential backoff retry logic, safeguards against runaway loops, and prerequisite validation to ensure interactive phases (01-02) are complete before automation begins.

## Technical Context

**Language/Version**: Bash 5.x (GNU bash)
**Primary Dependencies**: Claude CLI (`claude`), Beads CLI (`bd` v0.47+), Git, standard POSIX utilities
**Storage**: N/A (stateless script; beads handles persistence)
**Testing**: Bash script testing via BATS (Bash Automated Testing System) or manual integration tests
**Target Platform**: Linux/macOS with bash 5.x, Claude CLI authenticated
**Project Type**: Single script with supporting utilities
**Performance Goals**: N/A (orchestration script, not performance-critical)
**Constraints**: Must handle SIGINT gracefully; max 5-minute retry delay; default 50 iteration limit
**Scale/Scope**: Single bash script (~200-400 lines), used for features with up to ~50 implementation tasks

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                     | Applies? | Status | Notes                                                                                                               |
| ----------------------------- | -------- | ------ | ------------------------------------------------------------------------------------------------------------------- |
| I. Test-First Development     | Partial  | ⚠️     | Bash scripts typically use integration tests rather than unit TDD. Will use BATS for test coverage where practical. |
| II. Type Safety               | No       | ✅ N/A | Bash is untyped; will use `set -euo pipefail` for strict error handling                                             |
| III. Code Quality Standards   | Yes      | ✅     | Will follow shellcheck linting, clear naming, comments for "why"                                                    |
| IV. Pre-commit Quality Gates  | Yes      | ✅     | Script will be linted via shellcheck in pre-commit                                                                  |
| V. Warning/Deprecation Policy | Yes      | ✅     | All shellcheck warnings will be addressed                                                                           |
| VI. Cloudflare Workers Target | No       | ✅ N/A | This is a development tool, not production code                                                                     |
| VII. Simplicity               | Yes      | ✅     | Single script, no over-engineering, clear control flow                                                              |

**Gate Status**: ✅ PASS - Bash scripts have different testing patterns than TypeScript; BATS integration tests satisfy the spirit of test-first for shell scripts.

## Project Structure

### Documentation (this feature)

```text
specs/001-ralph-automation/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0: Research findings
├── data-model.md        # Phase 1: State machine and data flows
├── quickstart.md        # Phase 1: Usage guide
└── checklists/
    └── requirements.md  # Quality checklist
```

### Source Code (repository root)

```text
ralph.sh                 # Main automation script (repository root)
```

**Structure Decision**: Single script at repository root. No subdirectories needed - this is a standalone bash utility that orchestrates existing tools (Claude CLI, beads CLI). The script is self-contained with no external bash library dependencies.

## Complexity Tracking

> No constitution violations requiring justification. The Bash testing deviation is documented above and accepted.

## Implementation Approach

### Core Algorithm

```
1. Parse arguments (--dry-run, --max-iterations N)
2. Validate prerequisites:
   - Check Claude CLI available
   - Check beads initialized
   - Detect current branch → find matching epic
   - Verify sp:02-clarify task is closed
3. Create lock file (exit if already exists)
4. Main loop:
   while iterations < max_iterations:
     ready_tasks = bd ready --parent $epic_id --json
     if no ready tasks:
       break (success)
     log iteration start
     invoke claude --print "/sp:next"
     if claude fails:
       retry with exponential backoff (max 10 retries, max 5min delay)
       if still fails: exit 1
     iterations++
5. Cleanup lock file
6. Report summary and exit
```

### Key Design Decisions

1. **Beads as source of truth**: No output parsing or state diffing. Simply check `bd ready` each iteration.

2. **Exponential backoff**: Delays: 1s, 2s, 4s, 8s, 16s, 32s, 64s, 128s, 256s, 300s (capped at 5 min)

3. **Lock file location**: `.ralph.lock` in repository root, contains PID and start timestamp

4. **Epic detection**: Parse branch name (e.g., `001-ralph-automation`) → search beads for epic with matching title pattern

5. **Claude invocation**: `claude --print "/sp:next"` - the `--print` flag ensures output is visible for logging

## Dependencies on Existing Systems

- **sp:next skill**: Must correctly identify and execute the next ready phase task
- **Phase skills (03-09)**: Each must close its beads task on completion via `bd close`
- **Beads dependency chain**: Must be correctly set up by sp:01-specify so phases execute in order
