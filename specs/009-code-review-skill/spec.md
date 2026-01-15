# Feature Specification: Code Review Skill and sp:review Command

**Feature Branch**: `009-code-review-skill`
**Created**: 2026-01-15
**Status**: Draft
**Beads Epic**: `workspace-053`
**Input**: User description: "Generalize the Claude PR Review workflow to a code-review skill that is not specific to GitHub Actions. The skill can be used by the PR review workflow or locally. Add a new sp: namespace command to do code review and create beads issues under the current epic."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Local Code Review (Priority: P1)

A developer wants to review code changes in their local working directory before committing or creating a pull request. They invoke the code-review skill to get feedback on their changes, identifying issues early in the development cycle.

**Why this priority**: This is the core functionality that enables code review independent of any CI/CD environment. It provides immediate value to developers working locally and forms the foundation for all other use cases.

**Independent Test**: Can be fully tested by making local code changes and running `/code-review` to receive structured feedback on code quality, security, and maintainability.

**Acceptance Scenarios**:

1. **Given** a developer has uncommitted changes in their working directory, **When** they invoke the code-review skill, **Then** they receive a structured review covering what changed, whether it works, simplicity/maintainability, and recommendations.

2. **Given** a developer has staged changes ready for commit, **When** they invoke the code-review skill with a scope parameter targeting staged changes, **Then** the review focuses only on the staged changes.

3. **Given** a developer has changes across multiple files, **When** they invoke the code-review skill, **Then** the review covers all changed files and identifies cross-file concerns.

---

### User Story 2 - GitHub Actions Integration (Priority: P2)

The existing Claude Code Review GitHub Action workflow uses the new code-review skill to perform reviews. This maintains backward compatibility while centralizing the review logic in a reusable skill.

**Why this priority**: Ensures the existing GitHub Actions workflow continues to function while benefiting from the centralized skill. This is important for CI/CD integration but builds on the core local review capability.

**Independent Test**: Can be tested by creating a pull request and verifying the GitHub Action invokes the code-review skill and posts the review as a PR comment.

**Acceptance Scenarios**:

1. **Given** a pull request is opened or updated, **When** the Claude Code Review action runs, **Then** it uses the code-review skill to generate the review and posts the result as a PR comment.

2. **Given** the code-review skill is invoked from GitHub Actions context, **When** PR information is available, **Then** the review can reference PR-specific context (PR number, author, description) in its output.

---

### User Story 3 - Review with Beads Issue Creation (Priority: P2)

A developer working on a feature wants to review their changes and automatically create beads issues for any findings. They use the `/sp:review` command which combines code review with issue creation under the current feature's epic.

**Why this priority**: This integrates code review into the spec-kit workflow, enabling systematic tracking of review findings. It depends on the core code-review skill being available.

**Independent Test**: Can be tested by running `/sp:review` on a feature branch and verifying that review findings are converted to beads issues linked to the feature's epic.

**Acceptance Scenarios**:

1. **Given** a developer is on a feature branch with an associated beads epic, **When** they run `/sp:review`, **Then** the code is reviewed and issues are created in beads for each finding.

2. **Given** a developer is on a feature branch without a beads epic, **When** they run `/sp:review`, **Then** they are prompted to create an epic first or the command creates one automatically.

3. **Given** the code review identifies multiple issues with different severities, **When** issues are created, **Then** each issue includes the finding's severity as a priority and links back to the specific file/line location.

---

### User Story 4 - Test Quality Review (Priority: P3)

When reviewing code that includes test files, the code-review skill provides dedicated feedback on test quality using established testing principles (Kent Beck's Test Desiderata, GOOS patterns).

**Why this priority**: Test quality is important but secondary to the core code review functionality. This enhances reviews when tests are present.

**Independent Test**: Can be tested by reviewing changes that include test files and verifying dedicated test quality feedback is provided.

**Acceptance Scenarios**:

1. **Given** changes include test files, **When** code-review runs, **Then** it provides a dedicated "Test Quality" section evaluating test classification, properties, mocking appropriateness, and anti-patterns.

2. **Given** changes include only production code without tests, **When** code-review runs, **Then** it notes the absence of tests and recommends adding them where appropriate.

---

### User Story 5 - Security Review Integration (Priority: P3)

The code-review skill invokes the existing security-review skill to identify security vulnerabilities in the changes, categorizing them by criticality.

**Why this priority**: Security review is a specialized concern that leverages the existing security-review skill. It enhances the code review but is not the primary focus.

**Independent Test**: Can be tested by reviewing code with known security issues and verifying the security-review skill is invoked and findings are included.

**Acceptance Scenarios**:

1. **Given** code changes include security-relevant code (authentication, user input handling, data access), **When** code-review runs, **Then** it includes a "Security Review" section with findings categorized by criticality (Critical, High, Medium, Low).

2. **Given** security issues are found, **When** the review is generated, **Then** each issue includes file location, vulnerability description, risk explanation, and suggested fix.

---

### Edge Cases

- What happens when there are no changes to review? The skill reports "No changes detected" and exits gracefully without error.
- How does the system handle very large changesets (1000+ lines changed)? The skill processes changes in manageable chunks and summarizes findings rather than providing exhaustive detail.
- What happens when the skill is invoked outside a git repository? The skill reports an error explaining that it requires a git repository context to identify changes.
- How does the skill handle binary files? Binary file changes are noted but not analyzed; the skill focuses on text-based source files.
- What happens when /sp:review cannot determine the current epic? The skill prompts the user to specify an epic or creates one based on the current branch name.
- What happens when /sp:review finds issues that already exist in beads? The command skips creating duplicate issues by matching on file+line+category, and reports which findings were skipped.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The code-review skill MUST analyze code changes and provide structured feedback covering: what changed, whether it works, simplicity/maintainability, and recommendations.

- **FR-002**: The code-review skill MUST be environment-agnostic, working in local development environments, CI/CD pipelines, and remote sessions without GitHub-specific dependencies in its core logic.

- **FR-003**: The code-review skill MUST accept a scope parameter to target specific changes (working directory, staged, committed, or diff between refs).

- **FR-004**: The code-review skill MUST integrate with the security-review skill to identify and categorize security vulnerabilities.

- **FR-005**: The code-review skill MUST evaluate test quality when test files are included in the changes, applying established testing principles.

- **FR-006**: The code-review skill MUST generate actionable recommendations with specific file and line references where applicable.

- **FR-007**: The code-review skill MUST provide a "Copy-Paste Prompt" section when recommendations exist, enabling users to implement fixes directly.

- **FR-008**: The /sp:review command MUST invoke the code-review skill and convert findings into beads issues under the current feature's epic.

- **FR-009**: The /sp:review command MUST determine the current feature's epic from the branch name or spec.md metadata.

- **FR-010**: The /sp:review command MUST assign appropriate priorities to created issues based on finding severity (Critical=P0, High=P1, Medium=P2, Low=P3).

- **FR-011**: The GitHub Actions workflow MUST be updated to use the code-review skill rather than embedding review logic directly in the workflow file.

- **FR-012**: The /sp:review command MUST skip creating issues for findings that match existing open beads issues (matched by file+line+category) and report skipped findings to the user.

### Key Entities

- **Review Finding**: Represents a single issue or observation from the code review. Includes severity, category (security/test/code quality/etc.), file location, description, and suggested fix.

- **Review Scope**: Defines what code changes to analyze. Can target working directory changes, staged changes, specific commits, or arbitrary git diffs.

- **Review Output**: The structured result of a code review, containing sections for different concern areas (what changed, does it work, simplicity, test quality, security, recommendations).

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Developers can complete a local code review in under 2 minutes for typical changesets (under 500 lines changed).

- **SC-002**: 100% of review findings include specific file and line references when applicable.

- **SC-003**: Reviews run in GitHub Actions produce identical quality findings as local reviews for the same changes.

- **SC-004**: 90% of security issues identified by the security-review skill are surfaced in the code review output.

- **SC-005**: Developers using /sp:review have all review findings tracked as beads issues without manual issue creation.

- **SC-006**: The existing GitHub Actions PR review workflow functions correctly after migration to use the code-review skill.

## Clarifications

### Session 2026-01-15

- Q: What threshold defines a "very large changeset" that triggers summarized review behavior? → A: 1000 lines changed
- Q: How should /sp:review handle findings that match existing open beads issues? → A: Skip - do not create duplicates (match by file+line+category)

## Assumptions

- The repository uses git for version control and changes are identifiable via git diff.
- The security-review skill is available and can be invoked from within the code-review skill.
- Beads is initialized in the repository for /sp:review functionality.
- The spec.md file contains a "Beads Epic" field when a feature has an associated epic.
- Review scope defaults to working directory changes (uncommitted) when not explicitly specified.
