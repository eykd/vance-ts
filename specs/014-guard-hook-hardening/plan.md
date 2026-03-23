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

| Rule               | Pattern                                                   | Safe Patterns     | Notes                                          |
| ------------------ | --------------------------------------------------------- | ----------------- | ---------------------------------------------- |
| reset --hard       | `git\s+reset\s+--hard`                                    | —                 | Any trailing args blocked                      |
| checkout .         | `git\s+checkout\s+(--\s+)?\.(\s\|$)`                      | `-b`, `--orphan`  | Destructive pattern is self-limiting (no FP)   |
| restore .          | `git\s+restore\s+\.(\s\|$)`                               | `--staged`, `-S`  | Dot must be the pathspec target                |
| clean -f           | `git\s+clean\s+.*-f`                                      | `-n`, `--dry-run` | Safe patterns checked first                    |
| commit --amend     | `git\s+commit\s+.*--amend`                                | —                 | Post-strip prevents commit-msg false positives |
| merge --squash     | `git\s+merge\s+.*--squash`                                | —                 | Post-strip prevents msg false positives        |
| stash drop         | `git\s+stash\s+drop(?:\s\|$)`                             | —                 | Word boundary prevents matching `dropdown`     |
| stash clear        | `git\s+stash\s+clear(?:\s\|$)`                            | —                 | Word boundary prevents matching `clearfix`     |
| branch -D          | `git\s+branch\s+-D(?:\s\|$)`                              | —                 | Flag-position only; prevents branch name FP    |
| rm -rf /           | `rm\s+-[a-zA-Z]*(rf\|fr)[a-zA-Z]*\s+/(?:\s\|$)`           | —                 | `(rf\|fr)` handles both flag orderings         |
| rm -rf .           | `rm\s+-[a-zA-Z]*(rf\|fr)[a-zA-Z]*\s+\.(?:\s\|$)`          | —                 | `(rf\|fr)` handles both flag orderings         |
| rm -rf \*          | `rm\s+-[a-zA-Z]*(rf\|fr)[a-zA-Z]*\s+\*`                   | —                 | `(rf\|fr)` handles both flag orderings         |
| gh repo delete     | `gh\s+repo\s+delete`                                      | —                 | Any repo target blocked                        |
| wrangler delete    | `wrangler\s+delete`                                       | —                 | Worker deletion blocked                        |
| d1 DROP            | `wrangler\s+d1\s+execute.*DROP`                           | —                 | MUST use `i` flag for case-insensitive SQL     |
| d1 TRUNCATE        | `wrangler\s+d1\s+execute.*TRUNCATE`                       | —                 | MUST use `i` flag for case-insensitive SQL     |
| d1 DELETE no WHERE | `wrangler\s+d1\s+execute.*DELETE\s+FROM\s+\w+(?!.*WHERE)` | —                 | MUST use `i` flag — `where` is often lowercase |

### Command Normalization

**Critical detail**: Sequential `.replace()` calls fail for chained wrappers.
`sudo env command git reset --hard` → strips `sudo`, then `env`, but `command`
remains because the `(sudo|command)` replace already ran. Must use an iterative
loop that re-applies all stripping rules until the string stabilizes.

```typescript
function normalizeCommand(command: string): string {
  let result = command.replace(/^\\/, ''); // strip leading backslash once
  let prev: string;
  do {
    prev = result;
    result = result
      .replace(/^(sudo|command)\s+/, '') // strip sudo or command prefix
      .replace(/^env\s+(\w+=\S+\s+)*/, ''); // strip env with optional VAR=val
  } while (result !== prev);
  return result;
}
```

**Verified edge cases**:

- `sudo env command git reset --hard` → loop 1: strip `sudo` → loop 2: strip `env` → loop 3: strip `command` → `git reset --hard` ✓
- `sudo sudo git reset --hard` → loop 1: strip first `sudo` → loop 2: strip second `sudo` → `git reset --hard` ✓
- `env VAR=1 VAR2=2 git push` → strip `env VAR=1 VAR2=2 ` → `git push` ✓
- `\git checkout .` → strip backslash → `git checkout .` ✓

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

## Deepened Sections (2026-03-23)

Three regex failures identified and fixed during `/deepen-plan`:

### Fix 1: Command Normalization — Iterative Loop (HIGH severity)

**Problem**: Sequential `.replace()` calls are single-pass. For `sudo env command git reset --hard`,
only `sudo` and `env` are stripped; `command` remains because the `(sudo|command)` replace already ran.

**Fix**: Replace sequential replaces with a `do...while` loop that re-applies all stripping rules
until the string stabilizes. See updated Command Normalization section above.

**Test cases to add**: `sudo env command git reset --hard`, `sudo sudo git reset --hard`.

### Fix 2: rm -rf Anchoring — Command Chains (HIGH severity)

**Problem**: End-of-string anchor `$` prevents matching in command chains.
`rm -rf . && git status` is NOT blocked because `$` requires `.` at end of string.

**Fix**: Replace `\s*$` with `(?:\s|$)` (whitespace-or-end) to match both end-of-string
and mid-chain positions. Also replaced `.*` between flags and target with `[a-zA-Z]*`
(letter-only) to prevent overly greedy matching. See updated Pattern Design table.

**Test cases to add**: `rm -rf . && echo done`, `rm -rf /; ls`.

### Fix 3: D1 SQL Case Sensitivity (HIGH severity)

**Problem**: SQL keyword regexes (`DROP`, `TRUNCATE`, `WHERE`) are case-sensitive by default.
`DELETE FROM users where id = 1` (lowercase `where`) falsely blocks because the negative
lookahead `(?!.*WHERE)` doesn't find uppercase `WHERE`, so it thinks there's no WHERE clause.

**Fix**: All three D1 SQL patterns MUST use the `i` (case-insensitive) flag:
`/wrangler\s+d1\s+execute.*DROP/i`, etc. See updated Pattern Design table.

**Test cases to add**: `DELETE FROM users where id = 1` (lowercase), `drop table users` (lowercase).

### Fix 4: branch -D False Positive on Branch Names (HIGH severity)

**Problem**: Pattern `git\s+branch\s+.*-D` matches `-D` anywhere in the command, including
within branch names. `git branch -d feature-D-thing` incorrectly triggers because `.*`
consumes `-d feature-` and then `-D` matches the uppercase D in the branch name.

**Fix**: Use `git\s+branch\s+-D(?:\s|$)` — requires `-D` as a flag immediately after
`git branch`, not embedded in a branch name. See updated Pattern Design table.

**Test cases to add**: `git branch -d feature-D-thing` (must allow), `git branch -d my-Dev-branch` (must allow).

### Fix 5: rm -fr Flag Ordering Not Caught (HIGH severity)

**Problem**: Pattern `rm\s+-[a-zA-Z]*r[a-zA-Z]*f[a-zA-Z]*` requires `r` before `f` in flags.
`rm -fr .` (common alternative to `rm -rf`) is NOT caught because `f` precedes `r`.

**Fix**: Use `(rf|fr)` alternation instead of `r[a-zA-Z]*f` to handle both orderings.
See updated Pattern Design table.

**Test cases to add**: `rm -fr .`, `rm -fr /`, `rm -frd .`.

### Fix 6: stash/drop Word Boundaries (LOW severity)

**Problem**: Patterns `git\s+stash\s+drop` and `git\s+stash\s+clear` lack word boundaries.
Hypothetical `git stash dropdown` or `git stash clearfix` would false-positive (though neither
is a real git command).

**Fix**: Add `(?:\s|$)` boundary. Trivial fix for regex hygiene.

### Validated Patterns (no changes needed)

- **git clean combined flags** (`-xfn`, `-nfd`, `-fn`): Safe pattern `.*-n` correctly finds
  `-n` within combined flag strings. No failure.
- **checkout .gitignore**: Pattern `\.(\s|$)` correctly requires dot followed by whitespace
  or end-of-string. `.gitignore` has `g` after `.`, so no false positive. No failure.
- **checkout safe patterns**: Destructive pattern `\.(\s|$)` is self-limiting — `git checkout feature-branch`
  naturally doesn't match. Safe patterns (`-b`, `--orphan`) are defense-in-depth, not strictly required.
- **wrangler delete vs wrangler d1 delete**: `wrangler\s+delete` requires `delete` immediately
  after `wrangler`. `wrangler d1 delete` does not match (correct — not a real command).

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
