# US Number Mismatch Between Tasks and Acceptance Specs Skips ATDD Binding

**Category**: tooling
**Date**: 2026-03-30
**Feature**: 016-prestoplot-core
**Tags**: ralph, atdd, acceptance-tests, naming, spec-numbering

## Problem

After sp:07-implement completed all 30 implementation tasks for prestoplot-core, the 8 acceptance test files (US16–US23) remained unbound stubs containing `throw new Error("acceptance test not yet bound")`. Ralph processed all US tasks via the unit TDD cycle instead of the ATDD cycle, so acceptance test binding never occurred.

## Root Cause

**Naming mismatch between beads task titles and acceptance spec filenames.**

The sp:05-tasks phase created beads tasks with feature-local numbering:

- `US1: Render a grammar from seed`
- `US2: Selection modes for variety`
- `US3: Scoped deterministic randomness`
- ... through `US8: Grammar includes`

But the acceptance spec files used **global** numbering (continuing from prior features):

- `specs/acceptance-specs/US16-render-grammar.txt`
- `specs/acceptance-specs/US17-selection-modes.txt`
- ... through `specs/acceptance-specs/US23-grammar-includes.txt`

Ralph's `find_spec_for_task()` (ralph.sh:1377) extracts the US number from the task title via `grep -oE 'US[0-9]+'` and then searches for `specs/acceptance-specs/${us_number}-*.txt`. So task `"US1: Render a grammar"` searches for `US1-*.txt`, which doesn't match `US16-render-grammar.txt`.

Because `find_spec_for_task` returns an empty string, ralph falls back to `execute_unit_tdd_cycle` (ralph.sh:1938), which runs pure unit TDD without any acceptance test binding.

## Solution

**Option A (recommended): Align task titles to spec file numbering.** During sp:05-tasks, the task generator should use the same US numbers as the acceptance spec filenames. If specs are US16–US23, tasks should be `US16: Render a grammar from seed`, not `US1`.

**Option B: Make find_spec_for_task smarter.** Instead of exact US-number matching, maintain a mapping from feature-local US numbers to global spec numbers (e.g., in the spec.md or plan.md). ralph could parse this mapping to resolve `US1` → `US16`.

**Option C: Use spec filename in the task description.** Each US task's beads description could include a `Spec-File: specs/acceptance-specs/US16-render-grammar.txt` field. `find_spec_for_task` would check the description first before falling back to title-based matching.

## Prevention

- **sp:05-tasks phase**: When generating US tasks, the task title's US number MUST match the acceptance spec filename's US number. Verify alignment before proceeding to sp:07-implement.
- **sp:06-analyze phase**: Add a pre-flight check that confirms each `US<N>` task title resolves to an acceptance spec file via the same `find_spec_for_task` logic ralph uses.
- **Review checklist**: Before running ralph, manually verify: `for task in US1 US2 ... USN; do ls specs/acceptance-specs/${task}-*.txt; done`.

## Related

- [Ralph ATDD Routing Blocks Acceptance-Spec-Only Tasks](ralph-atdd-routing-blocks-spec-only-tasks.md) — similar issue where task naming affects ATDD routing
- [Spec-Kit Workflow Missing Acceptance Spec Phase](spec-kit-missing-acceptance-spec-phase.md) — related gap in spec-kit workflow
