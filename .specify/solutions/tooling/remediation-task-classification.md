# Two Kinds of Remediation Tasks: Design Constraints vs Pre-Existing Code Fixes

**Category**: tooling
**Date**: 2026-03-03
**Feature**: 012-clawtask-vertical-slice
**Tags**: ralph, beads, remediation, sp:06-analyze, sp:08-security-review, sp:09-architecture-review, sp:10-code-quality-review

## Problem

Ralph automation processed review findings (from sp:06/08/09/10) as independent tasks with no dependency constraints. It implemented two of them — `requireWorkspace` middleware and `WorkspaceProvisioningService` — before the US story tasks that were supposed to own that code. The implementations had to be reverted and the untracked stubs deleted. 16+ additional tasks were left floating with no dependency ordering, creating a "build wrong, then fix" cycle.

## Root Cause

The review phases created tasks for **all** findings uniformly, without distinguishing between two fundamentally different kinds:

1. **Design constraints on fresh code** — findings that tell the implementer _how to write something correctly from the start_ (e.g., "use .bind()", "add optimistic lock", "validate Content-Type"). These have no independent existence: the code doesn't exist yet, so there's nothing to fix. Implementing them as separate tasks forces a build-wrong-then-fix cycle.

2. **Fixes to pre-existing code** — findings that modify files that already existed _before_ this feature branch (e.g., `requireAuth.ts`, `worker.ts`). These are genuinely independent: the code exists, the fix is bounded, ralph can process them at any time.

The `sp:06-analyze` and review skills did not classify findings before emitting tasks.

## Solution

**For design-constraint findings**: merge them into the US story description as an `## Implementation Constraints` section. Close the standalone task with reason `"Merged into US<N> (<id>) as implementation constraints"`. The implementer reads the US story description and builds correctly the first time.

**For pre-existing code findings**: leave as independent beads tasks. No parent dependency needed. Ralph can pick them up whenever they become ready.

**Triage heuristic**: Ask "Does the target file exist on this branch yet?" If no → design constraint (merge). If yes → independent fix (leave).

**Reverting premature code**:

```bash
# Revert newest commit first, then older
git revert --no-edit <newer-sha>
git revert --no-edit <older-sha>
# Each revert creates its own commit — do NOT squash or amend
```

**Deleting untracked stubs** (git revert won't touch untracked files):

```bash
rm <untracked-stub-file> ...
npx bd update <task-id> --status=open   # reset task if it was prematurely in_progress
```

**Merging findings into a US story**:

```bash
npx bd update <us-story-id> --description="<existing description>

---
## Implementation Constraints (merged from remediation tasks)

**[Severity] Short title** (task-id)
Problem: ...
Fix: ..."

npx bd close <task1> <task2> ... --reason="Merged into US<N> (<us-story-id>) as implementation constraints"
```

## Prevention

**During sp:06-analyze, sp:08, sp:09, sp:10**: Before emitting a remediation task for a finding, classify it:

- If the target file does not yet exist on this branch → append to the parent US story description as an implementation constraint and do NOT create a separate task.
- If the target file already exists → create a normal remediation task.

**During sp:05-tasks**: US story descriptions should pre-emptively carry an `## Implementation Constraints` section summarizing all known design requirements, so there's no gap for ralph to fill with separate tasks.

**During sp:07-implement**: Read the full US story description before writing any code. All constraints are there.

## Related

- [ralph.sh Epic Detection Fails When Branch Uses Hyphens but Epic Title Uses Spaces](ralph-epic-detection-hyphens-vs-spaces.md)
