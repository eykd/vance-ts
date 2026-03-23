# Implementation Plan: Guard Hook Hardening

**Branch**: `014-guard-hook-hardening` | **Date**: 2026-03-23 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/014-guard-hook-hardening/spec.md`

## Summary

Harden the existing `PreToolUse` bash guard hook by adding blocked patterns for
destructive git operations, catastrophic file deletion, CLAUDE.md rule enforcement,
platform-specific operations, and command normalization. Refactor the hook into a
testable pure-function architecture to enable TDD compliance.

## Technical Context

**Language/Version**: TypeScript (ES2022), executed via `npx tsx` in Node.js
**Primary Dependencies**: Node.js `readline`, `process` (built-in — hook runs outside Workers)
**Storage**: N/A (stateless — regex matching only, no persistence)
**Testing**: Vitest (`node` project — already includes `.claude/**/*.spec.ts`)
**Target Platform**: Node.js (local CLI hook, NOT Cloudflare Workers)
**Project Type**: single (modification to existing hook script)
**Performance Goals**: < 50ms per invocation, no file I/O, no network, no child processes
**Constraints**: Must maintain backward compatibility with all existing blocked patterns (SC-005)
**Scale/Scope**: ~15 guard rules, ~50 test cases, 2 source files + 1 test file

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                     | Status                       | Notes                                                                                                                                                                         |
| ----------------------------- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| I. Test-First Development     | **VIOLATION (pre-existing)** | Current hook has zero tests. This plan fixes it by extracting testable logic.                                                                                                 |
| II. Type Safety               | Pass                         | Strict TS. Hook uses Node.js types (correct for this runtime).                                                                                                                |
| III. Code Quality             | Pass                         | JSDoc required on all exported functions.                                                                                                                                     |
| IV. Pre-commit Quality Gates  | Pass                         | Hook code must pass lint-staged.                                                                                                                                              |
| V. Warning/Deprecation Policy | Pass                         | Will address any warnings during implementation.                                                                                                                              |
| VI. Cloudflare Workers        | **Exception**                | Hook runs in Node.js via `npx tsx`, not in Workers. This is inherent to what a hook IS — it intercepts tool calls locally. Node.js APIs (`readline`, `process`) are required. |
| VII. Simplicity               | Pass                         | Flat rule array with linear scan. No over-engineering.                                                                                                                        |

**Gate result**: PASS. The pre-existing test violation is resolved by this plan.
The Workers exception is inherent and documented.

## Architecture

### Design Decision: Extract Testable Pure Function

The current hook has all logic in a single `main()` function that reads stdin,
checks patterns, and calls `process.exit()`. This is untestable with Vitest.

**Solution**: Split into two files:

1. **`guard-rules.ts`** — Pure module exporting `evaluateCommand(command: string): GuardResult`.
   Contains all rules, normalization, quote stripping, and pattern matching.
   Zero side effects. Fully testable.

2. **`pre-tool-use-bash.ts`** — Thin entry point. Reads stdin JSON, extracts
   `tool_input.command`, calls `evaluateCommand()`, writes stderr, exits.
   ~20 lines. Not unit-tested (I/O wrapper).

### Processing Pipeline

```
Input: raw command string from tool_input.command
  │
  ├─ Step 1: normalizeCommand()
  │    Strip leading wrappers: sudo, env, command, backslash
  │    Result: normalizedCommand
  │
  ├─ Step 2: Check PRE-STRIP rules against normalizedCommand
  │    Category 1: Git hook bypass (--no-verify, --no-gpg-sign)  [EXISTING]
  │    Category 2: Force push (--force, -f, --force-with-lease)  [EXISTING]
  │    → First match = BLOCK (exit 2)
  │
  ├─ Step 3: stripQuotedContent(normalizedCommand)
  │    Remove heredocs → double-quoted strings → single-quoted strings
  │    Result: strippedCommand
  │
  ├─ Step 4: Check POST-STRIP rules against strippedCommand
  │    Category 3: CLAUDE.md rules (--amend, --squash)           [NEW]
  │    Category 4: Destructive git (reset --hard, checkout .,
  │                restore ., clean -f)                          [NEW]
  │    Category 5: Lower-risk git (stash drop/clear, branch -D)  [NEW]
  │    Category 6: Catastrophic rm (rm -rf /, ., *)              [NEW]
  │    Category 7: Legacy tools (bd, br init --force)            [EXISTING]
  │    → For each rule: check safePatterns first, then destructive
  │    → First match = BLOCK (exit 2)
  │
  ├─ Step 5: Check PLATFORM rules against normalizedCommand (raw)
  │    Category 8: Platform ops (gh repo delete, wrangler delete) [NEW]
  │    Category 9: D1 SQL (wrangler d1 execute + DROP/TRUNCATE/
  │                DELETE-without-WHERE)                          [NEW]
  │    → Must check raw because SQL is INSIDE quoted --command arg
  │    → First match = BLOCK (exit 2)
  │
  └─ Step 6: No match → ALLOW (exit 0)
```

**Why pre-strip vs post-strip matters**:

- Pre-strip (Categories 1-2): Existing behavior preserved for regression safety (SC-005).
  Git flags like `--no-verify` are structural and rarely appear in quoted args.
- Post-strip (Categories 3-7): New patterns where keywords COULD appear in commit
  messages, heredocs, or echo statements. Stripping prevents false positives.
  E.g., `git commit -m "discussing --amend"` → stripped to `git commit -m ""`
  → `--amend` removed → no false positive.
- Raw for platform (Categories 8-9): The dangerous SQL content IS inside quotes
  (`--command "DROP TABLE users"`). Stripping would hide it.

### Guard Rule Data Structure

```typescript
interface GuardResult {
  action: 'allow' | 'block';
  message?: string;
}

interface GuardRule {
  name: string;
  category: string;
  pattern: RegExp;
  safePatterns?: RegExp[];
  message: string;
}

// Rules are grouped into three arrays by check phase:
// PRE_STRIP_RULES  — checked against normalized (raw) command
// POST_STRIP_RULES — checked against stripped command
// PLATFORM_RULES   — checked against normalized (raw) command
```

### Pattern Design (Key Rules)

| Rule               | Pattern                                                   | Safe Patterns                              | Notes                                          |
| ------------------ | --------------------------------------------------------- | ------------------------------------------ | ---------------------------------------------- |
| reset --hard       | `git\s+reset\s+--hard`                                    | —                                          | Any trailing args blocked                      |
| checkout .         | `git\s+checkout\s+(--\s+)?\.(\s\|$)`                      | `-b`, `--orphan`, word-char after checkout | Dot must be the pathspec target                |
| restore .          | `git\s+restore\s+\.(\s\|$)`                               | `--staged`, `-S`                           | Dot must be the pathspec target                |
| clean -f           | `git\s+clean\s+.*-f`                                      | `-n`, `--dry-run`                          | Safe patterns checked first                    |
| commit --amend     | `git\s+commit\s+.*--amend`                                | —                                          | Post-strip prevents commit-msg false positives |
| merge --squash     | `git\s+merge\s+.*--squash`                                | —                                          | Post-strip prevents msg false positives        |
| stash drop         | `git\s+stash\s+drop`                                      | —                                          | Subcommand, no flag confusion                  |
| stash clear        | `git\s+stash\s+clear`                                     | —                                          | Subcommand, no flag confusion                  |
| branch -D          | `git\s+branch\s+.*-D`                                     | —                                          | Uppercase only; lowercase `-d` is safe         |
| rm -rf /           | `rm\s+-[a-zA-Z]*r[a-zA-Z]*f.*\s+/\s*$`                    | —                                          | Only root target                               |
| rm -rf .           | `rm\s+-[a-zA-Z]*r[a-zA-Z]*f.*\s+\.\s*$`                   | —                                          | Only dot target                                |
| rm -rf \*          | `rm\s+-[a-zA-Z]*r[a-zA-Z]*f.*\s+\*`                       | —                                          | Only glob target                               |
| gh repo delete     | `gh\s+repo\s+delete`                                      | —                                          | Any repo target blocked                        |
| wrangler delete    | `wrangler\s+delete`                                       | —                                          | Worker deletion blocked                        |
| d1 DROP            | `wrangler\s+d1\s+execute.*DROP`                           | —                                          | Case-insensitive SQL keyword                   |
| d1 TRUNCATE        | `wrangler\s+d1\s+execute.*TRUNCATE`                       | —                                          | Case-insensitive SQL keyword                   |
| d1 DELETE no WHERE | `wrangler\s+d1\s+execute.*DELETE\s+FROM\s+\w+(?!.*WHERE)` | —                                          | Negative lookahead for WHERE                   |

### Command Normalization

```typescript
function normalizeCommand(command: string): string {
  // Strip leading wrappers iteratively:
  // sudo, env (with optional VAR=val args), command, backslash prefix
  // Handle chained: "sudo env command git reset --hard"
  return command
    .replace(/^\\/, '') // leading backslash
    .replace(/^(sudo|command)\s+/g, '') // sudo, command
    .replace(/^env\s+(\w+=\S+\s+)*/g, ''); // env with optional VAR=val
}
```

### Error Message Template

Every block message follows this structure (FR-016):

```
BLOCKED: {one-line summary}

{1-2 sentence danger explanation}

Instead:
- {safe alternative 1}
- {safe alternative 2}
- {escape hatch: "have the user run this manually if genuinely needed"}
```

## Project Structure

### Documentation (this feature)

```text
specs/014-guard-hook-hardening/
├── plan.md              # This file
├── research.md          # Phase 0 output (minimal — no unknowns)
├── quickstart.md        # How to run/test the hook
└── tasks.md             # Phase 2 output (not created by /sp:03-plan)
```

### Source Code (repository root)

```text
.claude/hooks/
├── pre-tool-use-bash.ts      # Entry point (thin: stdin → evaluateCommand → exit)
├── pre-tool-use-bash.sh      # DEPRECATED (existing, not modified)
├── guard-rules.ts             # Pure module: all rules + evaluateCommand()
└── guard-rules.spec.ts        # Vitest tests (~50 test cases)
```

**Structure Decision**: Minimal two-file split. The pure module (`guard-rules.ts`)
contains all pattern-matching logic. The entry point (`pre-tool-use-bash.ts`) is a
thin I/O wrapper. No additional directories, no abstractions, no config files.

## Implementation Approach

### TDD Workflow

1. **Create `guard-rules.ts`** with empty `evaluateCommand()` returning `{ action: 'allow' }`
2. **Write regression tests** for all existing patterns (hook bypass, force push, legacy bd, br init --force) — tests fail (red)
3. **Move existing logic** into `evaluateCommand()` — tests pass (green)
4. **Refactor** `pre-tool-use-bash.ts` to import and call `evaluateCommand()`
5. **Write tests for P1 patterns** (destructive git, catastrophic rm, CLAUDE.md rules, safe whitelists) — tests fail (red)
6. **Implement P1 patterns** — tests pass (green)
7. **Write tests for P2 patterns** (stash drop/clear, branch -D, platform ops) — tests fail (red)
8. **Implement P2 patterns** — tests pass (green)
9. **Write tests for P3** (command normalization) — tests fail (red)
10. **Implement normalization** — tests pass (green)
11. **Refactor** rule organization if needed

### Test Organization

```typescript
describe('evaluateCommand', () => {
  describe('existing patterns (regression)', () => {
    // ~10 tests: --no-verify, --force, bd, br init --force
  });

  describe('Category: Destructive Git Operations', () => {
    // ~8 tests: reset --hard, checkout ., restore ., clean -f
  });

  describe('Category: Safe Pattern Whitelisting', () => {
    // ~8 tests: checkout -b, restore --staged, clean -n, reset --soft, branch -d
  });

  describe('Category: CLAUDE.md Rule Enforcement', () => {
    // ~3 tests: --amend, --squash, normal commit allowed
  });

  describe('Category: Catastrophic File Deletion', () => {
    // ~5 tests: rm -rf /, ., *, node_modules allowed, dist allowed
  });

  describe('Category: Lower-Risk Destructive Git', () => {
    // ~5 tests: stash drop, stash clear, branch -D, stash allowed, stash pop allowed
  });

  describe('Category: Platform Operations', () => {
    // ~8 tests: gh repo delete, wrangler delete, d1 DROP/TRUNCATE/DELETE, safe variants
  });

  describe('Category: Command Normalization', () => {
    // ~4 tests: sudo, env, command, backslash prefix
  });

  describe('Edge Cases', () => {
    // ~6 tests: quoted content, commit messages, chained commands
  });

  describe('error messages', () => {
    // ~3 tests: message structure validation (summary, explanation, alternatives)
  });
});
```

## Complexity Tracking

No complexity violations to justify. The implementation is:

- 2 source files (pure module + thin wrapper)
- 1 test file
- ~15 regex rules in a flat array
- Linear scan with early return

## Constitution Re-check (Post-Design)

| Principle                 | Status   | Notes                                                |
| ------------------------- | -------- | ---------------------------------------------------- |
| I. Test-First Development | **Pass** | TDD workflow defined. ~50 test cases planned.        |
| II. Type Safety           | Pass     | Strict types: `GuardResult`, `GuardRule` interfaces. |
| III. Code Quality         | Pass     | JSDoc on all exports. Descriptive rule names.        |
| IV. Pre-commit Gates      | Pass     | Tests run via `npx vitest run --project=node`.       |
| V. Warnings               | Pass     | Will address during implementation.                  |
| VI. Workers Exception     | Pass     | Documented. Hook requires Node.js APIs.              |
| VII. Simplicity           | Pass     | Flat rule array, linear scan, no abstractions.       |
