# Solution Index

Solutions are organized by category. Each entry links to a detailed solution document.

## Categories

| Category              | Description                                           |
| --------------------- | ----------------------------------------------------- |
| `cloudflare-workers/` | Runtime issues, D1/KV/R2 bindings, environment config |
| `test-coverage/`      | 100% coverage patterns, mocking, istanbul ignores     |
| `clean-architecture/` | Layer violations, dependency direction, DDD patterns  |
| `hugo-build/`         | Template issues, zero-warning policy, asset pipeline  |
| `type-safety/`        | Strict TS, ESLint rules, noUncheckedIndexedAccess     |
| `security/`           | Auth, headers, CSP, input validation                  |
| `performance/`        | Caching, query optimization, bundle size              |
| `tooling/`            | Build tools, pre-commit hooks, dependency conflicts   |

## Solutions

### tooling

- [ralph.sh Epic Detection Fails When Branch Uses Hyphens but Epic Title Uses Spaces](tooling/ralph-epic-detection-hyphens-vs-spaces.md) — `gsub("-"; " ")` normalizes branch hyphens before jq title match (2026-03-03)
- [Two Kinds of Remediation Tasks: Design Constraints vs Pre-Existing Code Fixes](tooling/remediation-task-classification.md) — findings for unwritten code belong in US story descriptions, not standalone tasks (2026-03-03)
- [Ralph ATDD Routing Blocks Acceptance-Spec-Only Tasks](tooling/ralph-atdd-routing-blocks-spec-only-tasks.md) — drop `US` prefix from spec-writing tasks so ralph doesn't route them to ATDD cycle (2026-03-27)
- [Spec-Kit Workflow Missing Acceptance Spec Phase](tooling/spec-kit-missing-acceptance-spec-phase.md) — sp:05-tasks must create acceptance spec files from GWT scenarios before implementation begins (2026-03-27)
- [US Number Mismatch Between Tasks and Specs Skips ATDD Binding](tooling/us-number-mismatch-skips-atdd-binding.md) — task titles used feature-local US numbers (US1–US8) but spec files used global numbers (US16–US23), so ralph couldn't find specs and fell back to unit TDD (2026-03-30)
- [Stale eslint-disable Directives Fail CI With max-warnings: 0](tooling/stale-eslint-disable-directives-fail-ci.md) — lint-staged only checks staged files; stale disable comments in untouched files drift undetected until CI lints the full tree (2026-03-30)
- [Background Agent Sandbox Blocks ralph.sh](tooling/background-agent-sandbox-blocks-ralph.md) — Haiku subagents default to sandboxed Bash; ralph.sh needs explicit `dangerouslyDisableSandbox: true` instruction in the agent prompt (2026-03-30)
