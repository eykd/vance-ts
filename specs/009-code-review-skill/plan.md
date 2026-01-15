# Implementation Plan: Code Review Skill and sp:review Command

**Branch**: `009-code-review-skill` | **Date**: 2026-01-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/009-code-review-skill/spec.md`

## Summary

Create a generalized `code-review` Claude Code skill that provides structured code review feedback independent of execution environment (local, CI/CD, remote). The skill analyzes git diffs, invokes security-review and test quality checks, and generates actionable recommendations. Additionally, create an `/sp:review` command that leverages this skill to generate review findings and automatically create beads issues under the current feature's epic.

## Technical Context

**Language/Version**: Markdown (Claude Skill format) + Bash scripts for integration
**Primary Dependencies**: Git (for diff generation), beads CLI (`@beads/bd`), existing `security-review` skill
**Storage**: N/A (stateless skill, beads handles persistence)
**Testing**: Manual validation (skills are prompt-based, not executable code)
**Target Platform**: Claude Code CLI (cross-platform: macOS, Linux, Windows via WSL)
**Project Type**: Documentation artifact (Claude skills are markdown files)
**Performance Goals**: Reviews complete in under 2 minutes for changesets under 500 lines
**Constraints**: Must work without network access in core logic; GitHub integration is optional overlay
**Scale/Scope**: Single skill file with references; single sp: command file

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                       | Status | Notes                                                       |
| ------------------------------- | ------ | ----------------------------------------------------------- |
| I. Test-First Development       | N/A    | Skills are markdown prompts, not executable code            |
| II. Type Safety                 | N/A    | No TypeScript code in this feature                          |
| III. Code Quality Standards     | PASS   | Skill follows established patterns from security-review     |
| IV. Pre-commit Quality Gates    | PASS   | Markdown files pass lint-staged                             |
| V. Warning/Deprecation Policy   | PASS   | No warnings introduced                                      |
| VI. Cloudflare Workers Target   | N/A    | Skill is environment-agnostic                               |
| VII. Simplicity/Maintainability | PASS   | Single skill file with references; reuses existing patterns |

**Gate Status**: PASS - No violations requiring justification.

## Project Structure

### Documentation (this feature)

```text
specs/009-code-review-skill/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (review output format specification)
└── checklists/          # Quality validation checklists
    └── requirements.md
```

### Source Code (repository root)

```text
.claude/
├── skills/
│   └── code-review/
│       ├── SKILL.md           # Main skill file (<150 lines)
│       └── references/
│           ├── review-sections.md    # Detailed review section guidance
│           ├── test-quality.md       # Test quality evaluation patterns
│           └── output-format.md      # Structured output format
└── commands/
    └── sp/
        └── 09-review.md       # New sp:review command

.github/
└── workflows/
    └── claude-code-review.yml # Updated to use code-review skill
```

**Structure Decision**: Follows established skill pattern from `security-review` skill. Command follows sp: namespace convention in `.claude/commands/sp/`.

## Complexity Tracking

> No constitution violations - table not required.

---

## Post-Design Constitution Re-Check

| Principle                       | Status | Notes                                                         |
| ------------------------------- | ------ | ------------------------------------------------------------- |
| I. Test-First Development       | N/A    | Skills are markdown prompts, no executable code to test       |
| II. Type Safety                 | N/A    | No TypeScript code; data model is conceptual                  |
| III. Code Quality Standards     | PASS   | Follows security-review skill patterns; consistent naming     |
| IV. Pre-commit Quality Gates    | PASS   | All artifacts are markdown, pass lint-staged                  |
| V. Warning/Deprecation Policy   | PASS   | No warnings; uses current beads CLI patterns                  |
| VI. Cloudflare Workers Target   | N/A    | Skill is environment-agnostic                                 |
| VII. Simplicity/Maintainability | PASS   | Single skill with 3 reference files; reuses existing patterns |

**Post-Design Gate Status**: PASS

---

## Generated Artifacts

| Artifact            | Path                                                            | Description                       |
| ------------------- | --------------------------------------------------------------- | --------------------------------- |
| Implementation Plan | `specs/009-code-review-skill/plan.md`                           | This file                         |
| Research            | `specs/009-code-review-skill/research.md`                       | Technology decisions and patterns |
| Data Model          | `specs/009-code-review-skill/data-model.md`                     | Conceptual entity model           |
| Output Contract     | `specs/009-code-review-skill/contracts/review-output-format.md` | Structured output specification   |
| Invocation Contract | `specs/009-code-review-skill/contracts/skill-invocation.md`     | How to invoke the skill           |
| Quickstart          | `specs/009-code-review-skill/quickstart.md`                     | Getting started guide             |

---

## Implementation Deliverables

### Files to Create

| File                                                       | Purpose                            |
| ---------------------------------------------------------- | ---------------------------------- |
| `.claude/skills/code-review/SKILL.md`                      | Main skill definition (<150 lines) |
| `.claude/skills/code-review/references/review-sections.md` | Detailed review section guidance   |
| `.claude/skills/code-review/references/test-quality.md`    | Test quality evaluation patterns   |
| `.claude/skills/code-review/references/output-format.md`   | Output format reference            |
| `.claude/commands/sp/09-review.md`                         | sp:review command definition       |

### Files to Modify

| File                                       | Change                             |
| ------------------------------------------ | ---------------------------------- |
| `.github/workflows/claude-code-review.yml` | Update to invoke code-review skill |
| `.claude/skills/README.md`                 | Add code-review skill entry        |

---

## Next Steps

Run `/sp:05-tasks` to generate implementation tasks from this plan.
