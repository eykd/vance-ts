# Implementation Tasks: Code Review Skill and sp:review Command

**Feature**: 009-code-review-skill
**Epic ID**: `workspace-053`
**Date Generated**: 2026-01-15
**Total Tasks**: 17 (7 user stories/phases + 10 sub-tasks)

## Task Summary

| Phase  | Task                             | Priority | Beads ID        | Status   |
| ------ | -------------------------------- | -------- | --------------- | -------- |
| Setup  | Create skill directory structure | P1       | workspace-053.1 | Complete |
| US1    | Local Code Review - Core skill   | P1       | workspace-053.2 | Complete |
| US2    | GitHub Actions Integration       | P2       | workspace-053.3 | Complete |
| US3    | sp:review Command                | P2       | workspace-053.4 | Complete |
| US4    | Test Quality Review Enhancement  | P3       | workspace-053.5 | Complete |
| US5    | Security Review Integration      | P3       | workspace-053.6 | Complete |
| Polish | Documentation finalization       | P4       | workspace-053.7 | Complete |

---

## Phase 1: Setup

**Goal**: Create the directory structure for the code-review skill.

### Tasks

- [x] **workspace-053.1**: Setup: Create code-review skill directory structure
  - [x] **workspace-053.1.1**: Create `.claude/skills/code-review/` directory
  - [x] **workspace-053.1.2**: Create `.claude/skills/code-review/references/` directory

**Completion Criteria**: Directory structure exists and is committed.

---

## Phase 2: User Story 1 - Local Code Review (P1)

**Goal**: Implement the core code-review skill that enables local code review independent of CI/CD.

**Independent Test**: Make local code changes and run `/code-review` to receive structured feedback.

### Tasks

- [x] **workspace-053.2**: US1: Local Code Review - Core skill implementation
  - [x] **workspace-053.2.1**: Write SKILL.md with frontmatter and review process
    - File: `.claude/skills/code-review/SKILL.md`
    - Content: YAML frontmatter (name: code-review, description with use-when), review process steps, scope parameter handling, output format overview
    - Constraint: <150 lines
  - [x] **workspace-053.2.2**: Write review-sections.md reference
    - File: `.claude/skills/code-review/references/review-sections.md`
    - Content: Detailed guidance for What Changed, Does It Work, Simplicity & Maintainability, Recommendations, Copy-Paste Prompt sections
  - [x] **workspace-053.2.3**: Write output-format.md reference
    - File: `.claude/skills/code-review/references/output-format.md`
    - Content: Structured output format specification with finding format for parseability

**Dependencies**: Setup (workspace-053.1)
**Completion Criteria**: `/code-review` can be invoked locally and produces structured review output.

---

## Phase 3: User Story 2 - GitHub Actions Integration (P2)

**Goal**: Update GitHub Actions workflow to use the code-review skill.

**Independent Test**: Create a PR and verify the action uses the skill and posts a comment.

### Tasks

- [x] **workspace-053.3**: US2: GitHub Actions Integration
  - [x] **workspace-053.3.1**: Update claude-code-review.yml to invoke /code-review skill
    - File: `.github/workflows/claude-code-review.yml`
    - Change: Replace embedded prompt with `/code-review` skill invocation
    - Preserve: PR comment posting behavior via `gh pr comment`

**Dependencies**: US1 (workspace-053.2)
**Completion Criteria**: GitHub Action workflow uses skill and posts review as PR comment.

---

## Phase 4: User Story 3 - Review with Beads Issue Creation (P2)

**Goal**: Create the `/sp:review` command for automatic beads issue creation.

**Independent Test**: Run `/sp:review` on a feature branch and verify issues are created in beads.

### Tasks

- [x] **workspace-053.4**: US3: Review with Beads Issue Creation (sp:review)
  - [x] **workspace-053.4.1**: Write sp:09-review.md command
    - File: `.claude/commands/sp/09-review.md`
    - Content: Command definition with epic detection, code-review skill invocation, finding parsing, beads issue creation, duplicate checking (file+line+category)
    - Priority mapping: Critical=P0, High=P1, Medium=P2, Low=P3

**Dependencies**: US1 (workspace-053.2)
**Completion Criteria**: `/sp:review` creates beads issues from findings and skips duplicates.

---

## Phase 5: User Story 4 - Test Quality Review Enhancement (P3)

**Goal**: Add dedicated test quality evaluation when test files are in changes.

**Independent Test**: Review changes with test files and verify Test Quality section appears.

### Tasks

- [x] **workspace-053.5**: US4: Test Quality Review Enhancement
  - [x] **workspace-053.5.1**: Write test-quality.md reference
    - File: `.claude/skills/code-review/references/test-quality.md`
    - Content: Kent Beck Test Desiderata, GOOS principles, test classification, properties, mocking patterns, anti-patterns
  - [x] **workspace-053.5.2**: Add test quality section to SKILL.md
    - File: `.claude/skills/code-review/SKILL.md`
    - Change: Add conditional Test Quality section triggered by test file detection

**Dependencies**: US1 (workspace-053.2)
**Completion Criteria**: Reviews include Test Quality section when test files are present.

---

## Phase 6: User Story 5 - Security Review Integration (P3)

**Goal**: Integrate security-review skill for automated vulnerability detection.

**Independent Test**: Review code with security issues and verify security findings appear.

### Tasks

- [x] **workspace-053.6**: US5: Security Review Integration
  - [x] **workspace-053.6.1**: Add security-review skill invocation to SKILL.md
    - File: `.claude/skills/code-review/SKILL.md`
    - Change: Add Security Review section that invokes `/security-review` skill
    - Include: Severity levels (Critical, High, Medium, Low)

**Dependencies**: US1 (workspace-053.2)
**Completion Criteria**: Reviews include Security Review section with categorized findings.

---

## Phase 7: Polish & Documentation

**Goal**: Update documentation and finalize the feature.

### Tasks

- [x] **workspace-053.7**: Polish: Update README and finalize documentation
  - [x] **workspace-053.7.1**: Add code-review entry to skills README
    - File: `.claude/skills/README.md`
    - Change: Add code-review skill entry with description and use-when
  - [x] **workspace-053.7.2**: Add sp:09-review entry to sp commands README
    - File: `.claude/commands/sp/README.md`
    - Change: Add sp:review command to the command table

**Dependencies**: US2, US3, US4, US5 (workspace-053.3, .4, .5, .6)
**Completion Criteria**: All documentation updated and feature is complete.

---

## Dependency Graph

```
Setup (workspace-053.1)
    │
    └──▶ US1: Core Skill (workspace-053.2)
              │
              ├──▶ US2: GitHub Actions (workspace-053.3) ──┐
              │                                            │
              ├──▶ US3: sp:review (workspace-053.4) ───────┼──▶ Polish (workspace-053.7)
              │                                            │
              ├──▶ US4: Test Quality (workspace-053.5) ────┤
              │                                            │
              └──▶ US5: Security (workspace-053.6) ────────┘
```

## Parallel Execution Opportunities

After US1 completes, the following can run in parallel:

- **[P]** US2: GitHub Actions Integration
- **[P]** US3: sp:review Command
- **[P]** US4: Test Quality Review Enhancement
- **[P]** US5: Security Review Integration

---

## Implementation Strategy

### MVP Scope (Recommended)

- **Phase 1**: Setup
- **Phase 2**: US1 - Local Code Review

This delivers core `/code-review` functionality that works locally.

### Full Feature Scope

Complete all phases in order, leveraging parallel execution after US1.

---

## Beads Commands Reference

```bash
# View ready tasks (unblocked)
npx bd ready

# Start working on a task
npx bd update <task-id> --status in-progress

# Complete a task
npx bd close <task-id>

# View dependency tree
npx bd dep tree workspace-053

# View all tasks for this feature
npx bd list --parent workspace-053
```

---

## Files to Create

| File                                                       | Phase | Beads ID          |
| ---------------------------------------------------------- | ----- | ----------------- |
| `.claude/skills/code-review/SKILL.md`                      | US1   | workspace-053.2.1 |
| `.claude/skills/code-review/references/review-sections.md` | US1   | workspace-053.2.2 |
| `.claude/skills/code-review/references/output-format.md`   | US1   | workspace-053.2.3 |
| `.claude/skills/code-review/references/test-quality.md`    | US4   | workspace-053.5.1 |
| `.claude/commands/sp/09-review.md`                         | US3   | workspace-053.4.1 |

## Files to Modify

| File                                       | Phase  | Beads ID          |
| ------------------------------------------ | ------ | ----------------- |
| `.github/workflows/claude-code-review.yml` | US2    | workspace-053.3.1 |
| `.claude/skills/README.md`                 | Polish | workspace-053.7.1 |
| `.claude/commands/sp/README.md`            | Polish | workspace-053.7.2 |
