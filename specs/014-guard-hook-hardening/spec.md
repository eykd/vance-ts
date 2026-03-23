# Feature Specification: Guard Hook Hardening

**Feature Branch**: `014-guard-hook-hardening`
**Created**: 2026-03-23
**Status**: Draft
**Beads Epic**: `turtlebased-ts-hr3`
**Input**: User description: "Improve our blocking game based on the gap analysis in docs/pre-tool-use-hook-spec.md, borrowing ideas that make sense for this project from https://github.com/Dicklesworthstone/destructive_command_guard"

**Beads Phase Tasks**:

- clarify: `turtlebased-ts-hr3.1`
- plan: `turtlebased-ts-hr3.2`
- red-team: `turtlebased-ts-hr3.3`
- tasks: `turtlebased-ts-hr3.4`
- analyze: `turtlebased-ts-hr3.5`
- implement: `turtlebased-ts-hr3.6`
- security-review: `turtlebased-ts-hr3.7`
- architecture-review: `turtlebased-ts-hr3.8`
- code-quality-review: `turtlebased-ts-hr3.9`

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Block Destructive Git Operations (Priority: P1)

Claude Code generates a destructive git command (`git reset --hard`, `git checkout .`,
`git restore .`, or `git clean -f`) during an automated workflow. The hook intercepts
the command, blocks execution, and returns an actionable error message explaining the
danger and what to do instead. Claude reads the error and self-corrects.

**Why this priority**: These commands destroy uncommitted work with no recovery path.
They are the most common dangerous commands an AI assistant might generate, especially
after encountering unexpected state (merge conflicts, dirty working tree).

**Independent Test**: Pipe JSON with each destructive command to the hook script and
verify exit code 2 and appropriate stderr output.

**Acceptance Scenarios**:

1. **Given** the hook is active, **When** Claude runs `git reset --hard HEAD~3`, **Then** the command is blocked (exit 2) and stderr contains "reset --hard" and a safe alternative
2. **Given** the hook is active, **When** Claude runs `git checkout .`, **Then** the command is blocked (exit 2) and stderr explains how to discard specific files instead
3. **Given** the hook is active, **When** Claude runs `git restore .`, **Then** the command is blocked (exit 2) and stderr suggests `git restore --staged` or naming specific files
4. **Given** the hook is active, **When** Claude runs `git clean -fd`, **Then** the command is blocked (exit 2) and stderr suggests `git clean -n` (dry run) first

---

### User Story 2 - Block Catastrophic File Deletion (Priority: P1)

Claude Code generates a broad `rm -rf` command targeting `/`, `.`, or `*`. The hook
blocks the command. Specific-directory deletions like `rm -rf node_modules` or
`rm -rf dist` remain allowed since they are normal cleanup operations.

**Why this priority**: These commands can destroy the entire project, home directory,
or system. Recovery is impossible without backups.

**Independent Test**: Pipe JSON with catastrophic rm targets and verify exit 2. Pipe
JSON with safe rm targets (node_modules, dist, coverage) and verify exit 0.

**Acceptance Scenarios**:

1. **Given** the hook is active, **When** Claude runs `rm -rf /`, **Then** the command is blocked (exit 2)
2. **Given** the hook is active, **When** Claude runs `rm -rf .`, **Then** the command is blocked (exit 2)
3. **Given** the hook is active, **When** Claude runs `rm -rf *`, **Then** the command is blocked (exit 2)
4. **Given** the hook is active, **When** Claude runs `rm -rf node_modules`, **Then** the command is allowed (exit 0)
5. **Given** the hook is active, **When** Claude runs `rm -rf dist`, **Then** the command is allowed (exit 0)

---

### User Story 3 - Enforce CLAUDE.md Git Workflow Rules (Priority: P1)

CLAUDE.md states "NEVER amend commits" and "NEVER squash-merge." These rules are
currently advisory only. The hook mechanically enforces them by blocking
`git commit --amend` and `git merge --squash`, turning advisory rules into
enforceable invariants.

**Why this priority**: These rules protect commit history integrity. Amending after a
failed pre-commit hook can destroy the previous commit's changes. Squash-merging
destroys PR commit history. Both are explicitly prohibited.

**Independent Test**: Pipe JSON with `git commit --amend` and `git merge --squash` and
verify exit 2 with error messages citing the CLAUDE.md rule.

**Acceptance Scenarios**:

1. **Given** the hook is active, **When** Claude runs `git commit --amend -m "fix"`, **Then** the command is blocked (exit 2) and stderr explains "NEVER amend — create a new commit instead"
2. **Given** the hook is active, **When** Claude runs `git merge --squash feature`, **Then** the command is blocked (exit 2) and stderr explains "NEVER squash-merge — preserve full commit history"
3. **Given** the hook is active, **When** Claude runs `git commit -m "fix: something"`, **Then** the command is allowed (exit 0) — normal commits are not affected

---

### User Story 4 - Safe Pattern Whitelisting (Priority: P1)

Commands that contain destructive keywords but are actually safe must not trigger
false positives. `git checkout -b new-branch`, `git restore --staged file.ts`, and
`git clean -n` all pass through without being blocked.

**Why this priority**: False positives erode trust in the hook and slow down
development. Without whitelisting, every `git checkout` would be scrutinized
against the `git checkout .` pattern, creating friction.

**Independent Test**: Pipe JSON with each safe variant and verify exit 0. Then pipe
the destructive variant and verify exit 2.

**Acceptance Scenarios**:

1. **Given** the hook is active, **When** Claude runs `git checkout -b new-feature`, **Then** the command is allowed (exit 0)
2. **Given** the hook is active, **When** Claude runs `git checkout --orphan initial`, **Then** the command is allowed (exit 0)
3. **Given** the hook is active, **When** Claude runs `git checkout feature-branch`, **Then** the command is allowed (exit 0)
4. **Given** the hook is active, **When** Claude runs `git restore --staged file.ts`, **Then** the command is allowed (exit 0)
5. **Given** the hook is active, **When** Claude runs `git clean -n`, **Then** the command is allowed (exit 0)
6. **Given** the hook is active, **When** Claude runs `git clean --dry-run`, **Then** the command is allowed (exit 0)
7. **Given** the hook is active, **When** Claude runs `git reset --soft HEAD~1`, **Then** the command is allowed (exit 0)
8. **Given** the hook is active, **When** Claude runs `git branch -d merged-branch`, **Then** the command is allowed (exit 0)

---

### User Story 5 - Block Lower-Risk Destructive Git Operations (Priority: P2)

`git stash drop`, `git stash clear`, and `git branch -D` are blocked. These are
destructive but lower risk than P1 operations because stashes and unmerged branches
are less commonly critical.

**Why this priority**: Lower frequency of use and lower blast radius than P1
operations, but still destroy work that may not be recoverable.

**Independent Test**: Pipe JSON with each command and verify exit 2.

**Acceptance Scenarios**:

1. **Given** the hook is active, **When** Claude runs `git stash drop`, **Then** the command is blocked (exit 2)
2. **Given** the hook is active, **When** Claude runs `git stash clear`, **Then** the command is blocked (exit 2)
3. **Given** the hook is active, **When** Claude runs `git branch -D unmerged`, **Then** the command is blocked (exit 2)
4. **Given** the hook is active, **When** Claude runs `git stash`, **Then** the command is allowed (exit 0)
5. **Given** the hook is active, **When** Claude runs `git stash pop`, **Then** the command is allowed (exit 0)

---

### User Story 6 - Warn on Broad Staging Commands (Priority: P2)

`git add .`, `git add -A`, and `git add --all` trigger an advisory warning (exit 1)
recommending specific file staging. The command still executes because CLAUDE.md says
"prefer" specific files, not "NEVER" use broad staging.

**Why this priority**: Broad staging risks accidentally committing secrets (.env),
credentials, or large binaries. An advisory warning reminds Claude to be deliberate
without blocking legitimate use.

**Independent Test**: Pipe JSON with each broad staging command and verify exit 1
with stderr warning. Verify `git add src/file.ts` produces exit 0 with no warning.

**Acceptance Scenarios**:

1. **Given** the hook is active, **When** Claude runs `git add .`, **Then** the command executes but stderr contains a warning about staging specific files (exit 1)
2. **Given** the hook is active, **When** Claude runs `git add -A`, **Then** the command executes with the same advisory warning (exit 1)
3. **Given** the hook is active, **When** Claude runs `git add --all`, **Then** the command executes with the same advisory warning (exit 1)
4. **Given** the hook is active, **When** Claude runs `git add src/file.ts`, **Then** the command executes with no warning (exit 0)

---

### User Story 7 - Block Destructive Platform Operations (Priority: P2)

Platform-specific catastrophic operations are blocked: `gh repo delete` (destroys
the GitHub repository), `wrangler delete` (deletes the Cloudflare Worker), and
`wrangler d1 execute` with DROP/TRUNCATE/DELETE-without-WHERE (destroys D1 data).

**Why this priority**: These are platform-specific and less likely to be generated
by Claude than git commands, but their blast radius is extreme — entire repositories,
workers, or databases destroyed in one command.

**Independent Test**: Pipe JSON with each destructive platform command and verify
exit 2. Pipe safe variants and verify exit 0.

**Acceptance Scenarios**:

1. **Given** the hook is active, **When** Claude runs `gh repo delete owner/repo`, **Then** the command is blocked (exit 2)
2. **Given** the hook is active, **When** Claude runs `wrangler delete`, **Then** the command is blocked (exit 2)
3. **Given** the hook is active, **When** Claude runs `wrangler d1 execute DB --command "DROP TABLE users"`, **Then** the command is blocked (exit 2)
4. **Given** the hook is active, **When** Claude runs `wrangler d1 execute DB --command "TRUNCATE TABLE sessions"`, **Then** the command is blocked (exit 2)
5. **Given** the hook is active, **When** Claude runs `wrangler d1 execute DB --command "DELETE FROM users"` (no WHERE clause), **Then** the command is blocked (exit 2)
6. **Given** the hook is active, **When** Claude runs `wrangler d1 execute DB --command "SELECT * FROM users"`, **Then** the command is allowed (exit 0)
7. **Given** the hook is active, **When** Claude runs `wrangler d1 execute DB --command "DELETE FROM users WHERE id = '123'"`, **Then** the command is allowed (exit 0)
8. **Given** the hook is active, **When** Claude runs `gh pr create --title "feat"`, **Then** the command is allowed (exit 0)

---

### User Story 8 - Command Normalization (Priority: P3)

Leading command wrappers (`sudo`, `env`, `command`, backslash) are stripped before
pattern matching so that `sudo git reset --hard` is caught just as reliably as
`git reset --hard`.

**Why this priority**: These wrappers are uncommon in Claude Code output but cost
nearly nothing to handle and close an evasion gap. Lower priority because the
attack surface is small — Claude rarely generates `sudo` commands.

**Independent Test**: Pipe JSON with wrapper-prefixed destructive commands and
verify exit 2.

**Acceptance Scenarios**:

1. **Given** the hook is active, **When** Claude runs `sudo git reset --hard`, **Then** the command is blocked (exit 2)
2. **Given** the hook is active, **When** Claude runs `env git push --force origin main`, **Then** the command is blocked (exit 2)
3. **Given** the hook is active, **When** Claude runs `command git clean -f`, **Then** the command is blocked (exit 2)
4. **Given** the hook is active, **When** Claude runs `\git checkout .`, **Then** the command is blocked (exit 2)

---

### Edge Cases

- What happens when a commit message mentions `--amend`? Quoted content stripping removes heredoc and quoted string content before pattern matching, preventing false positives.
- What happens when `git checkout feature-branch` is run? Safe pattern whitelist allows it — the destructive pattern only fires on `.` (dot) target.
- What happens when `rm -rf some-directory/` is run? Allowed — only `/`, `.`, and `*` targets are blocked.
- What happens when `git clean -fn` (dry-run with force flag) is run? Safe pattern whitelist catches `-n` / `--dry-run` before the destructive pattern fires.
- What happens when `wrangler d1 execute --command "SELECT * FROM users"` is run? Allowed — only DROP/TRUNCATE/DELETE-without-WHERE are blocked.
- What happens when `git add src/specific-file.ts` is run? No warning — the advisory only fires on `.`, `-A`, or `--all`.
- What happens when a command matches both WARN and BLOCK patterns? BLOCK takes priority — all BLOCK patterns are evaluated before WARN patterns.
- What happens when `sudo rm -rf .` is run? Command normalization strips `sudo` first, then the destructive pattern matches — blocked.

## Requirements _(mandatory)_

### Functional Requirements

**Destructive Git Operations (Block):**

- **FR-001**: Hook MUST block `git reset --hard` with any trailing arguments
- **FR-002**: Hook MUST block `git checkout .` and `git checkout -- .` but NOT `git checkout -b`, `git checkout --orphan`, or `git checkout <branch-name>`
- **FR-003**: Hook MUST block `git restore .` but NOT `git restore --staged`, `git restore -S`, or `git restore <specific-file>`
- **FR-004**: Hook MUST block `git clean` with `-f` flag but NOT `git clean -n` or `git clean --dry-run`

**Catastrophic File Deletion (Block):**

- **FR-005**: Hook MUST block `rm -rf` with `/`, `.`, or `*` as the target but allow specific directory targets like `node_modules`, `dist`, `coverage`

**CLAUDE.md Rule Enforcement (Block):**

- **FR-006**: Hook MUST block `git commit --amend`
- **FR-007**: Hook MUST block `git merge --squash`

**Lower-Risk Destructive Operations (Block):**

- **FR-008**: Hook MUST block `git stash drop` and `git stash clear`
- **FR-009**: Hook MUST block `git branch -D`

**Advisory Warnings (Warn):**

- **FR-010**: Hook MUST emit an advisory warning (exit 1) for `git add .`, `git add -A`, `git add --all` but allow the command to execute

**Platform-Specific Operations (Block):**

- **FR-011**: Hook MUST block `gh repo delete`
- **FR-012**: Hook MUST block `wrangler delete` (worker deletion)
- **FR-013**: Hook MUST block `wrangler d1 execute` containing DROP, TRUNCATE, or DELETE-without-WHERE

**Infrastructure:**

- **FR-014**: Hook MUST normalize commands by stripping `sudo`, `env`, `command`, and leading backslash prefixes before pattern matching
- **FR-015**: Hook MUST check safe pattern whitelists before destructive patterns to prevent false positives on known-safe command variants
- **FR-016**: Every BLOCK message MUST include a one-line summary, danger explanation, and safe alternatives section
- **FR-017**: Quoted content stripping (heredocs, single-quoted strings, double-quoted strings) MUST apply to all new pattern categories where false positives from quoted content are plausible
- **FR-018**: Hook MUST complete in under 50ms per invocation with no file I/O, no network calls, and no child process spawning

### Key Entities

- **Guard Rule**: A named pattern defining a blocked or warned command — includes category, regex, exit code (1 or 2), and error message template
- **Safe Pattern**: A whitelist regex checked before destructive patterns to allow known-safe command variants (e.g., `git checkout -b` before the `git checkout .` check)
- **Command Normalizer**: A preprocessing pipeline that strips wrappers (sudo, env, command, backslash) before any pattern matching occurs

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 100% of commands in the "Must Block" test table are blocked (exit 2) when piped to the hook — zero false negatives
- **SC-002**: 100% of commands in the "Must Allow" test table pass through (exit 0) when piped to the hook — zero false positives
- **SC-003**: 100% of commands in the "Must Warn" test table produce exit 1 with appropriate stderr message
- **SC-004**: Hook completes in under 50ms for all test cases
- **SC-005**: All existing blocked patterns (hook bypass, force push, legacy bd, br init --force) continue to function identically — zero regressions
- **SC-006**: Every block and warn message contains actionable guidance that an AI assistant can use to self-correct without human intervention
