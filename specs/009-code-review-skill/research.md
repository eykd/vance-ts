# Research: Code Review Skill and sp:review Command

**Date**: 2026-01-15
**Feature**: 009-code-review-skill

## Summary

Research conducted on existing skill patterns, command structures, and the GitHub Actions workflow to inform the code-review skill design.

---

## Decision 1: Skill Structure Pattern

**Decision**: Follow the established pattern from `security-review` skill with SKILL.md + references/ directory.

**Rationale**:

- Consistent with existing project patterns (security-review uses this structure)
- Progressive disclosure: SKILL.md provides overview, references/ provide depth
- Maintainable: each concern in its own reference file
- Extensible: new reference files can be added without changing SKILL.md

**Alternatives Considered**:

- Single monolithic SKILL.md: Rejected because it would exceed the recommended <150 line limit and reduce maintainability
- Inline all content: Rejected due to token overhead for simple invocations

---

## Decision 2: Review Sections

**Decision**: Preserve and enhance the sections from the existing GitHub Actions workflow:

1. What Changed
2. Does It Work
3. Simplicity & Maintainability
4. Test Quality (when tests present)
5. Security Review (via security-review skill)
6. Recommendations
7. Copy-Paste Prompt for Claude Code

**Rationale**:

- Proven effective in current PR review workflow
- Non-technical stakeholder friendly (user's stated preference)
- Covers all aspects: functionality, quality, security, actionability

**Alternatives Considered**:

- Technical-only review (complexity metrics, lint violations): Rejected as it doesn't match the user's preference for stakeholder-friendly reviews
- Abbreviated format: Rejected to maintain review quality

---

## Decision 3: Scope Parameter Implementation

**Decision**: Use git commands to determine diff scope based on parameter:

- `working` (default): `git diff` (uncommitted changes)
- `staged`: `git diff --cached`
- `head`: `git diff HEAD~1` (last commit)
- `branch`: `git diff <base>..HEAD` (branch changes vs base)
- Custom refs: `git diff <ref1>..<ref2>`

**Rationale**:

- Git is a stated assumption in the spec
- Covers all use cases: pre-commit review, staged review, commit review, branch review
- Works in all environments (local, CI/CD)

**Alternatives Considered**:

- File list input: Rejected as less intuitive than git-based scoping
- Automatic detection only: Rejected as users need explicit control

---

## Decision 4: sp:review Command Integration

**Decision**: Create `/sp:09-review` command that:

1. Invokes code-review skill
2. Parses structured findings from review output
3. Creates beads issues for each finding with appropriate priority
4. Skips duplicates by matching file+line+category

**Rationale**:

- Follows sp: command naming convention (09 is next available number)
- Integrates with beads workflow established in 008-beads-integration
- Automates manual issue creation step

**Alternatives Considered**:

- Separate standalone command (not sp: namespace): Rejected to maintain workflow integration
- Direct skill integration (no separate command): Rejected as skill should remain environment-agnostic

---

## Decision 5: Security Review Integration

**Decision**: Invoke security-review skill from within code-review skill using explicit reference.

**Rationale**:

- Security-review skill already exists and is well-tested
- Avoids duplicating security patterns
- Follows established skill-to-skill chaining pattern

**Alternatives Considered**:

- Inline security checks: Rejected due to duplication
- Make security optional: Rejected as security should be default in all reviews

---

## Decision 6: Test Quality Review Approach

**Decision**: Create a dedicated reference file for test quality evaluation based on:

- Kent Beck's Test Desiderata
- GOOS (Growing Object-Oriented Software) principles
- Project-specific testing standards from constitution

**Rationale**:

- Test quality is explicitly called out in the spec
- Constitution mandates TDD - test quality review reinforces this
- Separating into reference file keeps SKILL.md focused

**Alternatives Considered**:

- Defer to separate test-review skill: Rejected as test quality is integral to code review
- Minimal test checks only: Rejected to maintain review depth

---

## Decision 7: Output Format for Beads Integration

**Decision**: Use structured markdown with parseable sections for beads integration:

```markdown
## Finding: [Title]

- **Severity**: Critical|High|Medium|Low
- **Category**: security|test|quality|architecture|performance
- **File**: path/to/file.ts
- **Line**: 42
- **Description**: What's wrong
- **Fix**: How to fix it
```

**Rationale**:

- Enables sp:review to parse findings programmatically
- Maps directly to beads issue fields (title, priority, description)
- Human-readable as standalone review output

**Alternatives Considered**:

- JSON output: Rejected as less readable for humans
- Unstructured prose: Rejected as unparseable for automation

---

## Decision 8: Large Changeset Handling (1000+ lines)

**Decision**: For changesets exceeding 1000 lines:

1. Provide high-level summary of all changes
2. Focus detailed review on highest-risk files (security-relevant, core logic)
3. Note that full review was not possible due to size
4. Recommend splitting into smaller changesets

**Rationale**:

- Clarification established 1000-line threshold
- Large PRs are inherently harder to review thoroughly
- Guidance to split aligns with best practices

**Alternatives Considered**:

- Full review regardless of size: Rejected due to diminishing returns and potential timeout
- Refuse to review: Rejected as unhelpful

---

## Technology Findings

### Skill File Format

- YAML frontmatter with `name` and `description` fields
- `description` includes "Use when:" with numbered scenarios
- Markdown body with review process, patterns, and output format
- References via relative links to `references/*.md`

### Command File Format

- YAML frontmatter with `description` and optional `handoffs`
- `## User Input` section with `$ARGUMENTS`
- `## Outline` section with numbered steps
- Bash script integration via `.specify/scripts/bash/`
- Error handling at end

### Beads CLI Commands

- `bd create <title> -t <type> -p <priority>` - Create issue
- `bd list --parent <epic-id>` - List issues under epic
- `bd update <id> --status <status>` - Update status
- Priority mapping: P0 (highest) to P3 (lowest)

---

## Open Questions Resolved

All NEEDS CLARIFICATION items from Technical Context have been resolved:

- Large changeset threshold: 1000 lines (from clarification session)
- Duplicate handling: Skip by file+line+category match (from clarification session)
- Skill structure: SKILL.md + references/ pattern
- Output format: Structured markdown for parseability
