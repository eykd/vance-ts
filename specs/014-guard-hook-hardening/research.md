# Research: Guard Hook Hardening

**Date**: 2026-03-23 | **Branch**: `014-guard-hook-hardening`

## Unknowns Resolved

### 1. Vitest Configuration for Hook Tests

**Decision**: Use existing `node` vitest project — no config changes needed.

**Rationale**: The vitest config already includes `.claude/**/*.spec.ts` in the
`node` project with Node.js environment. Hook tests at
`.claude/hooks/guard-rules.spec.ts` are automatically discovered.

**Alternatives considered**:

- Separate vitest project for hooks — rejected (over-engineering for 1 test file)
- Shell script test harness — rejected (can't satisfy TDD/coverage requirements)

### 2. Quote Stripping Strategy for New Patterns

**Decision**: Three-phase rule checking with selective quote stripping.

**Rationale**: Different rule categories require different command representations:

- Pre-strip (raw): Existing patterns (regression safety) + platform SQL patterns
  (dangerous content IS inside quotes)
- Post-strip: New patterns where keywords could appear in commit messages or
  heredocs as text, not as flags

**Alternatives considered**:

- Strip all patterns — rejected (would hide SQL in `wrangler d1 execute --command "DROP..."`)
- Never strip — rejected (false positives on commit messages mentioning `--amend`)

### 3. Claude Code Exit Code Semantics

**Decision**: All hook actions use exit 2 (block). No exit 1 (advisory warnings).

**Rationale**: Verified during `/sp:02-clarify` that exit 1 stderr is invisible to
Claude (logged only in verbose mode). Advisory warnings cannot achieve self-correction.
US6 (broad staging warnings) was removed from scope.

**Alternatives considered**:

- Exit 1 for advisory warnings — rejected (Claude can't see the message)
- Exit 2 for broad staging — rejected by user (too common, too benign)

### 4. Testability Architecture

**Decision**: Extract all pattern-matching logic into a pure function module
(`guard-rules.ts`) that takes a command string and returns a result object.

**Rationale**: The current hook is untestable (reads stdin, calls process.exit).
A pure function with no side effects is trivially testable with Vitest. The entry
point becomes a ~20-line I/O wrapper.

**Alternatives considered**:

- Test via shell scripts only — rejected (violates constitution I: TDD mandatory)
- Mock process.stdin/exit — rejected (fragile, couples tests to I/O implementation)

### 5. tsconfig and Build Pipeline

**Decision**: Do NOT add `.claude/hooks/` to tsconfig include. The hook runs via
`npx tsx` (JIT compilation), not the project build pipeline.

**Rationale**: The hook uses Node.js APIs (`readline`, `process`) that are
incompatible with the Workers-targeted tsconfig. Adding `.claude/` to the build
would cause type errors. `npx tsx` handles compilation independently.

**Alternatives considered**:

- Separate tsconfig for hooks — rejected (over-engineering, tsx handles it fine)
- Add to main tsconfig — rejected (Workers type conflicts)
