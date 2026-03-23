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

## Security Considerations

### S1: rm Flag Format Bypass (Critical)

**Attack**: `rm --recursive --force /` and `rm -r -f /` bypass the current pattern
`rm\s+-[a-zA-Z]*(rf|fr)` which only matches combined short flags (`-rf`, `-fr`).
Long-form flags (`--recursive --force`) and separated short flags (`-r -f`) are
completely invisible to the regex.

**Mitigation**: Add two additional rm patterns:

- Long-form: `rm\s+--recursive\s+--force\s+` (order-insensitive — also check `--force\s+--recursive`)
- Separated short: `rm\s+-[a-zA-Z]*r\s+-[a-zA-Z]*f` and `rm\s+-[a-zA-Z]*f\s+-[a-zA-Z]*r`

Alternatively, restructure to detect `rm` + presence of both `-r`/`--recursive` AND `-f`/`--force`
anywhere in the command, then check the target. This is more robust but requires a
two-phase check (flags present → target dangerous).

**Test cases**: `rm --recursive --force /`, `rm -r -f .`, `rm --force --recursive *`,
`rm -r -f node_modules` (must allow).

### S2: rm -rf Target Variations (High)

**Attack**: Common path aliases bypass the literal `.`, `/`, `*` target check:

- `rm -rf ./` — trailing slash on dot (extremely common shell idiom)
- `rm -rf ~/` or `rm -rf ~` — home directory destruction
- `rm -rf ../` — parent directory destruction
- `rm -rf $HOME` — variable expansion targeting home

**Mitigation**: Expand target patterns:

- Dot: `\./?` instead of `\.` (optional trailing slash)
- Root: `/?` already handles `/`, but add `~/` and `~` patterns
- Add `\$HOME` and `\$\{HOME\}` patterns
- Add `\.\./` (parent directory) pattern

**Test cases**: `rm -rf ./`, `rm -rf ~/`, `rm -rf ~`, `rm -rf ../`,
`rm -rf node_modules/` (must allow).

### S3: wrangler d1 execute --file Bypass (High)

**Attack**: `wrangler d1 execute DB --file drop-all.sql` executes arbitrary SQL from
a file. The current patterns only inspect inline `--command` content. A file containing
`DROP TABLE users` is invisible to the hook.

**Mitigation**: Block `wrangler d1 execute` with `--file` flag entirely, since the
hook cannot inspect file contents at runtime (no file I/O per FR-018). The block
message should explain that `--file` execution requires manual human review.

**Pattern**: `wrangler\s+d1\s+execute.*--file`

**Test cases**: `wrangler d1 execute DB --file schema.sql` (blocked),
`wrangler d1 execute DB --command "SELECT 1"` (allowed).

### S4: rm -rf with Quoted Targets (Medium)

**Attack**: `rm -rf "."` or `rm -rf '/'` — the target is inside quotes. Since
rm patterns are in POST_STRIP_RULES, quote stripping removes the target content
before pattern matching, causing a miss.

**Trade-off**: Moving rm to pre-strip would cause false positives from
`echo "rm -rf ."` or commit messages. The current post-strip placement is correct
for the common case.

**Mitigation**: Accept as known limitation. Document that quoted rm targets are
not caught. In practice, Claude never quotes rm targets — `rm -rf .` is always
unquoted. If this becomes a real bypass vector, add rm as a PLATFORM_RULES entry
checked against raw command.

### S5: Shell Interpreter Wrapper Evasion (Critical)

**Attack**: `bash -c "git reset --hard"`, `sh -c "git reset --hard"`, or
`eval "git reset --hard"` — the destructive payload lives inside a quoted
string argument. POST_STRIP_RULES operate on the stripped command, which
becomes `bash -c ""` after quote removal. The dangerous `git reset --hard`
vanishes before pattern matching. PRE_STRIP_RULES don't check for destructive
git operations. Result: **complete bypass** of all post-strip guard rules.

**Mitigation**: Add a PRE_STRIP_RULES entry that blocks shell interpreter
wrappers invoking destructive commands. Since the payload is inside quotes
and must be inspected raw (same rationale as PLATFORM_RULES for D1 SQL),
add these as PLATFORM_RULES checked against the normalized (raw) command:

- `(?:bash|sh|zsh|dash)\s+-c\s+` followed by any blocked pattern inside the string
- `eval\s+` followed by any blocked pattern

Simpler alternative: Block `bash -c`, `sh -c`, and `eval` unconditionally
when followed by `git` or `rm` commands. This is more conservative but
prevents the hook from needing to recursively evaluate quoted payloads.

**Pattern**: `(?:bash|sh|zsh|dash)\s+-c\s+.*(?:git\s+reset\s+--hard|git\s+checkout\s+(--\s+)?\.(\s|$)|rm\s+-[a-zA-Z]*(rf|fr))` (check against raw normalized command)

**Test cases**: `bash -c "git reset --hard"` (blocked), `sh -c "rm -rf /"` (blocked),
`eval "git checkout ."` (blocked), `bash -c "echo hello"` (allowed),
`bash script.sh` (allowed — no `-c` flag).

### S6: Safe Pattern Cross-Contamination in Command Chains (High)

**Attack**: `git checkout -b new && git checkout .` — the safe pattern `-b`
(or regex matching `git\s+checkout\s+(-b|--orphan)`) appears in the first
sub-command of the chain. Since safe patterns are checked against the **full
command string**, the `-b` match causes the `checkout .` rule to be skipped
entirely. The second sub-command `git checkout .` is destructive but allowed.

This is **systematic** — it affects every rule with safe patterns:

- `git restore --staged foo && git restore .` → `--staged` found → `restore .` skipped
- `git clean -n && git clean -f` → `-n` found → `clean -f` skipped
- `git reset --soft HEAD~1; git reset --hard` → not affected (reset --hard has no safe patterns)

**Mitigation**: Split the command string on shell separators (`&&`, `||`, `;`,
`|`) before evaluation, and run each sub-command through the full pipeline
independently. Any sub-command that triggers a block → the entire command is
blocked.

```typescript
function splitCommands(command: string): string[] {
  // Split on &&, ||, ;, | (but not || inside regex or quoted content)
  // Apply after quote stripping to avoid splitting on separators inside strings
  return command.split(/\s*(?:&&|\|\||[;|])\s*/);
}
```

**Caveat**: Splitting must happen AFTER quote stripping to avoid splitting
on separators inside strings (e.g., `echo "a && b"`). The pipeline becomes:
normalize → strip quotes → split on separators → evaluate each sub-command
against all post-strip rules independently.

**Test cases**: `git checkout -b new && git checkout .` (blocked),
`git clean -n && git clean -f` (blocked), `git restore --staged foo && git restore .` (blocked),
`echo "hello && world"` (allowed — separator is inside quotes).

### S7: `git checkout <tree-ish> -- .` Bypasses Pattern (High)

**Attack**: `git checkout HEAD~1 -- .` restores all working tree files from a previous
commit — equally destructive as `git checkout .` — but the current pattern
`git\s+checkout\s+(--\s+)?\.(\s|$)` does NOT match because the tree-ish ref
`HEAD~1 --` sits between `checkout` and the dot target.

Similarly, `git checkout main -- .`, `git checkout stash@{0} -- .`, and
`git checkout HEAD -- .` all bypass the guard.

**Mitigation**: Widen the checkout pattern to catch any tree-ish before `-- .`:
`git\s+checkout\s+.*--\s+\.(\s|$)`. This catches `git checkout <anything> -- .`
while the safe patterns (`-b`, `--orphan`) still fire first to prevent false positives.
The original `git\s+checkout\s+\.(\s|$)` (no `--`) remains as a separate pattern.

**Test cases**: `git checkout HEAD~1 -- .` (blocked), `git checkout main -- .`
(blocked), `git checkout HEAD~1 -- src/file.ts` (allowed — specific file).

### S8: S5 Shell Wrapper — Two-Pass Instead of Compound Regex (Medium)

**Problem**: S5's proposed compound pattern
`(?:bash|sh|zsh|dash)\s+-c\s+.*(?:git\s+reset\s+--hard|...)` combines `.*` with
a multi-branch alternation. Against long benign payloads like
`bash -c "echo aaaa...aaaa"`, the regex engine backtracks through every position
of `.*` for each alternative — quadratic behavior that could violate the 50ms SLA.

**Mitigation**: Replace the compound pattern with a two-pass approach:

1. Detect `(?:bash|sh|zsh|dash)\s+-c\s+` or `eval\s+` prefix (fast regex).
2. If detected, extract the quoted payload and run `evaluateCommand()` recursively
   (depth-1 limit) on the extracted content. This reuses all existing rules with
   zero additional regex complexity.

Add a `maxDepth` parameter to `evaluateCommand()` defaulting to 1. At depth 0,
skip the shell-wrapper check to prevent infinite recursion.

**Test cases**: `bash -c "git reset --hard"` (blocked — recursive eval catches it),
`bash -c "echo hello"` (allowed), `bash -c "bash -c \"git reset --hard\""` (blocked
at depth 1 — inner `bash -c` payload evaluated).

### S9: Backslash Line Continuation Hides Flags Across Lines (Medium)

**Problem**: `git push \` followed by `\n  --force origin main` — the backslash
continuation joins the lines in shell execution, but `.*` in regex does NOT match
`\n` by default. The `--force` on the second line is invisible to the pattern.

Claude Code's Bash tool can generate multi-line commands. The hook receives the
full string including the literal `\\\n` sequence.

**Mitigation**: Add line-continuation normalization as the FIRST step in
`normalizeCommand()`: replace `/\\\n\s*/g` (backslash-newline-optional-whitespace)
with a single space before any other normalization.

```typescript
// First: collapse line continuations
result = command.replace(/\\\n\s*/g, ' ');
// Then: strip leading backslash (separate from continuations)
result = result.replace(/^\\/, '');
```

**Test cases**: `git push \\\n  --force origin main` (blocked),
`git reset \\\n  --hard` (blocked).

## Edge Cases & Error Handling

### E1: Malformed JSON / Missing Fields (High)

**Problem**: The entry point (`pre-tool-use-bash.ts`) reads stdin JSON and extracts
`tool_input.command`. The plan doesn't specify behavior when:

- stdin is not valid JSON
- JSON doesn't contain `tool_input`
- `tool_input.command` is not a string
- stdin is empty or EOF

**Mitigation**: The entry point must handle parse errors gracefully:

- Invalid JSON → exit 0 (allow) with stderr warning. Failing closed (exit 2) on
  parse errors would block ALL tool calls if the hook format changes.
- Missing `tool_input.command` → exit 0 (allow). Not all tool calls have commands.
- Non-string command → exit 0 (allow).

Add a try/catch around JSON.parse and field extraction. Log warnings to stderr
for debugging but never block on infrastructure errors.

**Test cases**: Empty stdin, `{}`, `{"tool_input":{}}`, `{"tool_input":{"command":123}}`,
malformed JSON string.

### E2: Empty / Whitespace Command (Medium)

**Problem**: If `tool_input.command` is an empty string or whitespace-only,
`evaluateCommand("")` will run through all regex patterns against an empty string.
This works correctly (no patterns match empty string → allow) but is wasted work.

**Mitigation**: Early return `{ action: 'allow' }` for empty/whitespace commands
in `evaluateCommand()`. Trivial optimization that also documents the intent.

**Test case**: `evaluateCommand("")` → `{ action: 'allow' }`.

### E3: Heredoc Stripping Robustness (Medium)

**Problem**: The plan references `stripQuotedContent()` but the heredoc regex
`/<<'?[A-Z_]+'?\n[\s\S]*?\n[A-Z_]+/gu` (from the existing hook) has gaps:

- **Custom delimiters with lowercase**: `<<'my_delimiter'` uses lowercase chars.
  The pattern only matches `[A-Z_]+` delimiters. A heredoc with `<<eof` would
  not be stripped, potentially causing false positives.
- **Indented heredocs**: `<<-EOF` (dash variant) allows indented closing
  delimiters. The current pattern requires the delimiter at line start.
- **Mixed-case delimiters**: `<<EOFdata` or `<<End` are valid but unmatched.

**Impact**: If a heredoc is not stripped, its content is visible to POST_STRIP
rules. A commit message inside an unstripped heredoc mentioning `--amend` or
`reset --hard` would trigger a false positive.

**Mitigation**: Widen the heredoc regex to accept any word-character delimiter:
`/<<-?'?\w+'?\n[\s\S]*?\n\s*\w+/gu`. Test with lowercase, mixed-case, and
indented-close heredocs.

**Test cases**: `git commit -m "$(cat <<eof\n--amend discussion\neof)"` (allowed),
`git commit -m "$(cat <<-EOF\n  test\n  EOF)"` (allowed).

### E4: Escaped Quotes in stripQuotedContent (Medium)

**Problem**: The existing double-quote stripping regex `/"(?:[^"\\]|\\.)*"/gu`
correctly handles backslash-escaped quotes within strings (`"he said \"hi\""`).
However, the plan doesn't specify that this regex must be preserved exactly.
If an implementer simplifies it to `/"[^"]*"/gu`, escaped quotes break:

`git commit -m "discussing \"--amend\" approach"` → simplified regex stops at
the first unescaped `"` after `\"`, leaving `--amend\"` visible → false positive.

**Mitigation**: Add an explicit requirement in the implementation approach:
"The double-quote stripping regex MUST handle backslash escapes:
`/"(?:[^"\\]|\\.)*"/gu`. Do not simplify." Add a test case that exercises
escaped quotes.

**Test cases**: `git commit -m "he said \"--amend\" is bad"` (allowed),
`echo "path with \" quote"` (stripped correctly).

### E5: process.exit() May Truncate stderr Messages (Medium)

**Problem**: Node.js `process.exit(2)` terminates immediately without waiting
for pending I/O. If the block message is written with `process.stderr.write()`
(async), the message may be partially or fully lost. Claude Code would see
exit code 2 but no error message, violating FR-016 (actionable error messages)
and SC-006 (AI self-correction guidance).

**Mitigation**: Use `console.error()` for block messages (synchronous for TTY
stderr in Node.js) or set `process.exitCode = 2` and allow natural exit.
The entry point should be structured as:

```typescript
console.error(result.message);
process.exitCode = 2;
// Let event loop drain — no explicit process.exit()
```

**Test cases**: Verify that long block messages (~500 chars) are fully readable
in stderr output after the hook exits.

### E6: Git Alias Evasion — Known Limitation (Low)

**Problem**: `git config alias.nuke "reset --hard" && git nuke` creates a
git alias that performs the destructive operation under a benign name. The hook
cannot resolve git aliases (that would require file I/O to read `.gitconfig`,
violating FR-018).

**Mitigation**: Accept as known limitation. Document in hook comments.
In practice, Claude Code does not create git aliases — it generates full
commands. If alias evasion becomes a real vector, a periodic audit of
`.gitconfig` could be added as a separate tool.

**Note**: This is inherent to any static pattern-matching approach.
Not a design flaw — a category limitation.

### E7: No Blocked Command Observability (Low)

**Problem**: When a command is blocked, the hook writes to stderr and exits.
There is no persistent record of what was blocked, when, or how often. This
makes it impossible to:

- Identify bypass patterns that succeed in production
- Measure hook effectiveness (blocks per day/week)
- Detect systematic evasion attempts

**Mitigation**: Out of scope for this feature (FR-018 prohibits file I/O).
If observability is needed later, a lightweight approach would be to write
a single-line JSON log to a known file path, but this violates the current
performance constraints. Alternative: Add a `--stats` flag that dumps
in-memory counters on demand (no I/O during normal operation).

**Recommendation**: Defer to a future feature. Note as a future enhancement
in the hook's JSDoc.

### E8: GuardResult Discriminated Union — Block Without Message (Medium)

**Problem**: The `GuardResult` type has `action: 'allow' | 'block'` with
`message?: string` optional. If a developer adds a rule and forgets the message,
`{ action: 'block' }` is valid TypeScript but the entry point writes `undefined`
to stderr — violating FR-016 (actionable error messages) and SC-006.

**Mitigation**: Use a discriminated union to make `message` required on block:

```typescript
type GuardResult = { action: 'allow' } | { action: 'block'; message: string };
```

This makes omitting `message` on a block result a compile-time error.

**Test case**: Every blocked command's result must include a non-empty `message` string.

### E9: stdin Read Timeout — Hook Hangs If EOF Never Arrives (Medium)

**Problem**: The entry point uses `readline` to read stdin. If stdin never
closes (e.g., manual invocation without piped input, or a Claude Code version
that leaves stdin open), the readline loop blocks indefinitely. Claude Code's
hook timeout would eventually kill the process, but the wait stalls the session.

**Mitigation**: Wrap the stdin read in a `Promise.race()` with a 5-second timeout
that resolves to exit 0 (allow). This ensures the hook never hangs longer than 5s.

```typescript
const input = await Promise.race([
  readStdin(),
  new Promise<string>((resolve) => setTimeout(() => resolve(''), 5000)),
]);
```

**Test case**: Verify the hook exits within 6 seconds when stdin provides no data.

### E10: `wrangler d1 migrations apply` Consistency With S3 (Medium)

**Problem**: S3 blocks `wrangler d1 execute --file` because the hook cannot
inspect file contents (FR-018). `wrangler d1 migrations apply` executes SQL
from migration files with identical risk profile, but is not addressed.

**Decision**: ALLOW `wrangler d1 migrations apply`. Migration files are
version-controlled, reviewed in PRs, and part of the standard development
workflow. Blocking them would create constant friction with no safety gain.

This is a conscious carve-out from S3's rationale: `--file` takes an arbitrary
path (potentially unreviewed), while `migrations apply` runs only committed
migration files.

**Test case**: `wrangler d1 migrations apply` (allowed), `wrangler d1 migrations apply --local` (allowed).

### E11: `git stash pop` Semantic Equivalence to Drop (Low)

**Problem**: `git stash pop` = `git stash apply` + `git stash drop`. The spec
intentionally allows `stash pop` (it restores work before dropping), but an AI
could use `pop` to circumvent the `stash drop` block.

**Decision**: Accept. `stash pop` restores the stashed changes to the working
tree before removing the entry — this is the safe use case. The guard blocks
`stash drop` (which discards without restoring) and `stash clear` (which
discards all entries). Document this tradeoff so future reviewers understand
the intentional asymmetry.

## Performance Considerations

### P1: Regex Complexity in D1 DELETE Pattern (Low)

**Pattern**: `wrangler\s+d1\s+execute.*DELETE\s+FROM\s+\w+(?!.*WHERE)`

The `.*` before `DELETE` combined with `(?!.*WHERE)` negative lookahead creates
a pattern where the regex engine may attempt multiple backtracking paths. For
typical command lengths (<500 chars), this is negligible. But adversarially
crafted inputs with many `DELETE` false starts could cause slowdowns.

**Mitigation**: No action needed for current scope. If profiling reveals issues,
replace `.*DELETE` with `[^"]*DELETE` (non-greedy within the --command value) or
use a two-step check: first confirm `wrangler d1 execute` prefix, then extract
the SQL string and check it separately.

**Test case**: Verify the 50ms SLA with a 1000-character wrangler command.

### P2: S5 Compound Pattern Backtracking (Medium)

See S8 for the full analysis. The compound shell-wrapper regex in S5 creates
quadratic backtracking risk. The two-pass approach in S8 eliminates this by
decomposing detection (fast prefix check) from evaluation (recursive call
to `evaluateCommand`). No additional regex patterns needed — all existing
rules are reused automatically.

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
