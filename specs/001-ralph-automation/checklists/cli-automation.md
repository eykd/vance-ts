# CLI Automation Checklist: Ralph Automation Loop

**Purpose**: Validate requirements quality for the ralph.sh bash automation script
**Created**: 2026-01-16
**Feature**: [spec.md](../spec.md)

## Requirement Completeness

- [ ] CHK001 - Are all CLI arguments (--dry-run, --max-iterations, --help) fully specified with expected behavior? [Completeness, Spec §FR-010, FR-011]
- [ ] CHK002 - Are all exit codes (0, 1, 2, 130) documented with clear triggering conditions? [Completeness, Spec §FR-012]
- [ ] CHK003 - Is the lock file format and location explicitly specified? [Completeness, Spec §FR-013]
- [ ] CHK004 - Are all prerequisite checks documented (Claude CLI, beads, git, clarify complete)? [Completeness, Spec §FR-014]
- [ ] CHK005 - Is the exact Claude CLI invocation command specified? [Gap]
- [ ] CHK006 - Are environment requirements (bash version, dependencies) documented? [Gap, Assumptions]

## Requirement Clarity

- [ ] CHK007 - Is "exponential backoff" quantified with specific delay values (1s, 2s, 4s...)? [Clarity, Clarifications]
- [ ] CHK008 - Is "max 5-minute delay" clear that it's the cap, not the starting delay? [Clarity, Clarifications]
- [ ] CHK009 - Is the iteration count tracking clearly defined (1-based vs 0-based)? [Clarity, Spec §FR-005]
- [ ] CHK010 - Is "graceful termination" defined with specific behaviors (lock cleanup, status report)? [Clarity, Spec §FR-006]
- [ ] CHK011 - Is the log output format specified (prefix, timestamp, structure)? [Clarity, Spec §FR-007]
- [ ] CHK012 - Is "matching epic" detection logic clearly specified (branch name parsing rules)? [Clarity, Spec §FR-008]

## Requirement Consistency

- [ ] CHK013 - Are retry requirements consistent between FR-016 (retry logic) and Clarifications (10 retries, backoff)? [Consistency]
- [ ] CHK014 - Is the phase automation scope (03-09) consistent between FR-015 and User Story 1? [Consistency]
- [ ] CHK015 - Are exit code semantics consistent with error handling behaviors described? [Consistency, Spec §FR-012]
- [ ] CHK016 - Is "iteration" definition consistent across all usage contexts? [Consistency, Key Entities]

## Acceptance Criteria Quality

- [ ] CHK017 - Can SC-001 "zero manual intervention" be objectively measured? [Measurability, Spec §SC-001]
- [ ] CHK018 - Is SC-003 "within one additional iteration" testable and unambiguous? [Measurability, Spec §SC-003]
- [ ] CHK019 - Can SC-004 "within 5 seconds" be reliably measured in different environments? [Measurability, Spec §SC-004]
- [ ] CHK020 - Is SC-005 "90% of simple features" defined with clear criteria for "simple"? [Ambiguity, Spec §SC-005]
- [ ] CHK021 - Can SC-006 "within 2 seconds" account for terminal buffering variations? [Measurability, Spec §SC-006]

## Scenario Coverage

- [ ] CHK022 - Are requirements defined for when beads daemon is slow/unavailable? [Coverage, Gap]
- [ ] CHK023 - Are requirements specified for when git is in detached HEAD state? [Coverage, Edge Case]
- [ ] CHK024 - Are requirements defined for when multiple epics match the branch pattern? [Coverage, Edge Case]
- [ ] CHK025 - Are requirements specified for when Claude CLI exits with unexpected codes? [Coverage, Exception Flow]
- [ ] CHK026 - Are requirements defined for disk full scenarios (lock file, beads writes)? [Coverage, Edge Case]

## Edge Case Coverage

- [ ] CHK027 - Is behavior specified when `bd ready` returns empty but epic has open tasks (orphaned)? [Edge Case, Spec §Edge Cases]
- [ ] CHK028 - Is behavior specified for stale lock file detection (process no longer running)? [Edge Case, Gap]
- [ ] CHK029 - Are requirements defined for when sp:next skill fails but Claude exits 0? [Edge Case, Gap]
- [ ] CHK030 - Is behavior specified when interrupted during Claude invocation vs between iterations? [Edge Case, Spec §FR-006]
- [ ] CHK031 - Are requirements defined for when branch name doesn't match expected pattern? [Edge Case, Gap]

## Error Handling Requirements

- [ ] CHK032 - Are all failure modes enumerated with expected behaviors? [Completeness, Gap]
- [ ] CHK033 - Is retry exhaustion behavior clearly specified (what gets logged, cleanup actions)? [Clarity, Spec §FR-016]
- [ ] CHK034 - Are network failure vs process failure distinguished in retry logic? [Clarity, Gap]
- [ ] CHK035 - Is partial failure recovery defined (e.g., Claude ran but beads update failed)? [Coverage, Gap]

## Non-Functional Requirements

- [ ] CHK036 - Are resource constraints specified (memory, CPU during long runs)? [Gap]
- [ ] CHK037 - Are logging verbosity levels defined or configurable? [Gap]
- [ ] CHK038 - Is the script's compatibility with different bash versions specified? [Gap, Assumptions]
- [ ] CHK039 - Are timeout values for external command invocations specified? [Gap]

## Dependencies & Assumptions

- [ ] CHK040 - Is the assumption "Claude CLI authenticated" validated at startup? [Assumption, Spec §Assumptions]
- [ ] CHK041 - Is the assumption "beads initialized" validated at startup? [Assumption, Spec §Assumptions]
- [ ] CHK042 - Is dependency on `jq` explicitly documented? [Dependency, Gap]
- [ ] CHK043 - Are sp:\* skill behaviors (closing beads tasks) validated or assumed? [Assumption, Spec §Assumptions]

## Notes

- Focus: CLI automation, error handling, state management
- Depth: Standard (PR review level)
- 43 items covering requirements quality across all dimensions
- Key gaps identified: exact CLI invocation, failure mode enumeration, resource constraints
