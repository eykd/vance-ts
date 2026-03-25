# Specification: Pre-Tool-Use Bash Guard Hook

**Date:** 2026-03-22
**Status:** Draft
**Component:** `.claude/hooks/pre-tool-use-bash.ts`
**Config:** `.claude/settings.json` → `hooks.PreToolUse[matcher=Bash]`

## Purpose

A Claude Code `PreToolUse` hook that intercepts every Bash tool call, inspects
the command string, and blocks commands that violate project safety invariants.
The hook acts as a last line of defense — even if Claude's system prompt says
"never force-push," a prompt injection, context loss, or model error could
still produce the command. The hook makes the prohibition mechanically
enforceable rather than advisory.

---

## Design Principles

1. **Deny by pattern, not by allowlist.** The hook blocks known-dangerous
   patterns and allows everything else. A blanket allowlist would break normal
   development flow.

2. **Strip quoted content before matching.** Commit messages, heredocs, and
   string literals may contain forbidden keywords (e.g., a commit message
   discussing `--no-verify`). The hook must not false-positive on these.

3. **Exit 2 to block, exit 0 to allow.** Claude Code's hook contract:
   exit 2 sends stderr to Claude as an error and prevents execution.
   Exit 0 allows the command. Exit 1 is a non-blocking error (logged only).

4. **Actionable error messages.** Every block message must explain what was
   wrong, why it's dangerous, and what to do instead. Claude reads the error
   and self-corrects.

5. **No false sense of security.** The hook inspects the literal command
   string. It cannot follow shell indirection (`eval`, `source`, `xargs`),
   environment variable expansion, or piped-in scripts. It is a guardrail,
   not a sandbox.

---

## Hook Contract

### Input

Claude Code pipes JSON to stdin:

```json
{
  "session_id": "string",
  "cwd": "/absolute/path",
  "hook_event_name": "PreToolUse",
  "tool_name": "Bash",
  "tool_input": {
    "command": "git push --force origin main",
    "description": "Force push to main",
    "timeout": 120000
  },
  "tool_use_id": "toolu_01ABC..."
}
```

The hook reads `tool_input.command` (string). All other fields are ignored.

### Output

| Exit Code | Meaning            | Behavior                                        |
| --------- | ------------------ | ----------------------------------------------- |
| 0         | Allow              | Command executes normally                       |
| 1         | Non-blocking error | Logged; command still executes                  |
| 2         | Block              | stderr sent to Claude; command does NOT execute |

On exit 2, stderr must contain a human-readable explanation. Claude receives
this as tool output and must adjust its approach.

---

## Blocked Patterns

### Category 1: Git Hook Bypass

**Invariant:** Pre-commit and commit-msg hooks are the project's quality gate.
Bypassing them defeats type-checking, linting, formatting, coverage, and
commitlint — all of which run on every commit.

| Pattern                  | Regex                               | Rationale                             |
| ------------------------ | ----------------------------------- | ------------------------------------- |
| `git commit --no-verify` | `git.*(--no-verify\|--no-gpg-sign)` | Skips pre-commit + commit-msg hooks   |
| `git push --no-verify`   | (same)                              | Skips pre-push hooks                  |
| `git merge --no-verify`  | (same)                              | Skips merge hooks                     |
| `git rebase --no-verify` | (same)                              | Skips rebase hooks                    |
| `--no-gpg-sign`          | (same)                              | Bypasses signing policy if configured |

**Error guidance:** "Fix the linting/formatting/type errors the hook found.
Fix the root problem rather than bypassing the safety mechanism."

### Category 2: Force Push

**Invariant:** The project preserves full commit history (no squash-merge,
no amend, no force-push). Force pushing can destroy shared history and
is irreversible once the remote ref advances.

| Pattern                       | Regex                                                      | Rationale                                       |
| ----------------------------- | ---------------------------------------------------------- | ----------------------------------------------- |
| `git push --force`            | `git\s+push.*(--force([^-]\|$)\|-f\s\|--force-with-lease)` | Overwrites remote history                       |
| `git push -f`                 | (same)                                                     | Short flag for --force                          |
| `git push --force-with-lease` | (same)                                                     | Still rewrites; not safe enough for default use |

**Note:** `--force-with-lease` is included because it still rewrites history
and the project convention is to never need it. If genuinely required, the
user must run the command manually.

**Error guidance:** "Force push usually indicates a workflow problem. Create
a new commit instead of rewriting history."

### Category 3: Destructive Git Operations

**Invariant:** Work in progress should never be silently discarded. These
commands destroy uncommitted or unpushed changes with no recovery path.

| Pattern             | Regex                      | Rationale                             |
| ------------------- | -------------------------- | ------------------------------------- |
| `git reset --hard`  | `git\s+reset\s+--hard`     | Discards all uncommitted changes      |
| `git checkout .`    | `git\s+checkout\s+\.`      | Discards all unstaged changes in tree |
| `git checkout -- .` | `git\s+checkout\s+--\s+\.` | Same, explicit pathspec form          |
| `git restore .`     | `git\s+restore\s+\.`       | Discards all unstaged changes         |
| `git clean -f`      | `git\s+clean\s+.*-f`       | Deletes untracked files irreversibly  |
| `git stash drop`    | `git\s+stash\s+drop`       | Destroys stashed work                 |
| `git branch -D`     | `git\s+branch\s+-D`        | Deletes branch even if unmerged       |

**Error guidance:** "Investigate the unexpected state before discarding.
Check `git status` and `git stash list` first. If you need to discard
specific files, name them explicitly rather than using `.` (dot)."

### Category 4: Destructive File Operations

**Invariant:** Broad recursive deletion can destroy project state, node_modules
recovery is slow, and data directories may contain irreplaceable state.

| Pattern    | Regex                                           | Rationale                        |
| ---------- | ----------------------------------------------- | -------------------------------- |
| `rm -rf /` | `rm\s+-[a-zA-Z]*r[a-zA-Z]*f[a-zA-Z]*\s+/(?!\S)` | System-destroying                |
| `rm -rf .` | `rm\s+-[a-zA-Z]*r[a-zA-Z]*f[a-zA-Z]*\s+\.\s`    | Deletes entire working directory |
| `rm -rf *` | `rm\s+-[a-zA-Z]*r[a-zA-Z]*f[a-zA-Z]*\s+\*`      | Glob-deletes everything          |

**Note:** `rm -rf node_modules` and `rm -rf dist` are intentionally
**allowed** — these are normal cleanup operations with well-understood
recovery (`npm install`, `npm run build`). The hook blocks only
catastrophically broad targets.

**Error guidance:** "Specify the exact directory to remove. Never use
`rm -rf` with `/`, `.`, or `*` as the target."

### Category 5: Legacy Tool Enforcement

**Invariant:** The project migrated from `bd` (beads npm) to `br`
(beads_rust). Legacy commands must not be used.

| Pattern               | Regex                                                  | Rationale                              |
| --------------------- | ------------------------------------------------------ | -------------------------------------- |
| `bd <subcommand>`     | `(?:^\|&&\|\\\|\\\|\|[;(\|])\s*(?:npx\s+)?bd(?:\s\|$)` | Legacy tool; use `br`                  |
| `npx bd <subcommand>` | (same)                                                 | Explicit npx invocation of legacy tool |
| `br init --force`     | `\bbr\s+init\b.*(-f\b\|--force\b)`                     | Destroys all beads issue history       |

**Error guidance:** "Use `br` (beads_rust) instead of `bd`. Run
`br init --force` only if you genuinely need to destroy all issue history,
and have the user run it manually."

---

## Quoted Content Stripping

Before checking categories 4 and 5, the hook must remove quoted content
to prevent false positives:

```
Step 1: Remove heredocs     <<'EOF' ... EOF     → ''
Step 2: Remove double-quoted strings  "..."     → ""
Step 3: Remove single-quoted strings  '...'     → ''
```

**Order matters.** Heredocs must be stripped first because they may contain
quotes. Categories 1-3 (git flags) are checked on the raw command because
the prohibited flags cannot legitimately appear inside quoted strings that
form part of a git command.

**Example false positive prevented:**

```bash
git commit -m "$(cat <<'EOF'
fix: resolve --no-verify false positive in hook

The hook was incorrectly blocking commit messages that mentioned
--no-verify as a keyword.
EOF
)"
```

Without stripping, `--no-verify` in the heredoc body would trigger a block.

---

## Implementation Requirements

### Language & Runtime

- TypeScript (`.ts`), executed via `npx tsx`
- Node.js APIs allowed (readline, process) — this runs outside Workers
- Must handle malformed JSON gracefully (exit 1, not crash)
- Must handle missing `tool_input.command` gracefully (exit 0 — allow)

### Performance

- Hook runs on **every** Bash tool call. Must complete in < 50ms.
- No file I/O, no network calls, no child processes.
- Regex compilation is acceptable (V8 caches compiled patterns).

### Testing Strategy

The hook is a shell-invoked TypeScript script, not a Vitest-testable module.
Testing approaches:

1. **Manual smoke tests:** Pipe sample JSON to the script and assert exit
   codes and stderr output.

   ```bash
   echo '{"tool_input":{"command":"git push --force origin main"}}' | \
     npx tsx .claude/hooks/pre-tool-use-bash.ts
   echo $?  # expect 2
   ```

2. **Regression table:** Maintain a set of command strings with expected
   outcomes (allow/block) as a test fixture. Run them in CI as a shell
   script that asserts exit codes.

3. **False positive tests:** Include commands that mention blocked keywords
   in safe contexts (commit messages, echo statements, comments) and assert
   they are allowed.

### Test Cases

#### Must Block (exit 2)

| Command                                   | Category                       |
| ----------------------------------------- | ------------------------------ |
| `git commit --no-verify -m "fix"`         | Hook bypass                    |
| `git push --no-verify`                    | Hook bypass                    |
| `git commit -c commit.gpgsign=false`      | Hook bypass (if pattern added) |
| `git push --force origin main`            | Force push                     |
| `git push -f origin feature`              | Force push                     |
| `git push --force-with-lease origin main` | Force push                     |
| `git reset --hard HEAD~3`                 | Destructive git                |
| `git reset --hard origin/main`            | Destructive git                |
| `git checkout .`                          | Destructive git                |
| `git checkout -- .`                       | Destructive git                |
| `git restore .`                           | Destructive git                |
| `git clean -fd`                           | Destructive git                |
| `git clean -xfd`                          | Destructive git                |
| `git stash drop`                          | Destructive git                |
| `git branch -D feature-branch`            | Destructive git                |
| `rm -rf /`                                | Destructive file               |
| `rm -rf .`                                | Destructive file               |
| `rm -rf *`                                | Destructive file               |
| `bd list`                                 | Legacy tool                    |
| `npx bd sync`                             | Legacy tool                    |
| `br init --force`                         | Beads history destroy          |
| `br init -f`                              | Beads history destroy          |

#### Must Allow (exit 0)

| Command                               | Why                            |
| ------------------------------------- | ------------------------------ |
| `git commit -m "fix: something"`      | Normal commit                  |
| `git push origin feature`             | Normal push                    |
| `git push -u origin feature`          | Normal push with tracking      |
| `git reset --soft HEAD~1`             | Soft reset (preserves changes) |
| `git reset HEAD file.ts`              | Unstage single file            |
| `git checkout feature-branch`         | Switch branch                  |
| `git checkout -b new-branch`          | Create branch                  |
| `git restore --staged file.ts`        | Unstage single file            |
| `git clean -n`                        | Dry run (no deletion)          |
| `git stash`                           | Stash (preserves work)         |
| `git stash pop`                       | Restore stash                  |
| `git branch -d feature-branch`        | Safe delete (only if merged)   |
| `rm -rf node_modules`                 | Normal cleanup                 |
| `rm -rf dist`                         | Normal cleanup                 |
| `rm -rf coverage`                     | Normal cleanup                 |
| `rm file.ts`                          | Single file delete             |
| `br list --status open`               | Normal beads command           |
| `br close task-id`                    | Normal beads command           |
| `br init`                             | Init without --force           |
| `echo "git push --force"`             | Keyword in echo (quoted)       |
| `git commit -m "discuss --no-verify"` | Keyword in commit message      |

---

## Current State vs. This Spec

### Already Implemented

| Category                                           | Status | Notes                            |
| -------------------------------------------------- | ------ | -------------------------------- |
| Git hook bypass (`--no-verify`, `--no-gpg-sign`)   | Done   | Regex covers all git subcommands |
| Force push (`--force`, `-f`, `--force-with-lease`) | Done   | Scoped to `git push` only        |
| Legacy `bd` commands                               | Done   | Includes `npx bd` variant        |
| `br init --force`                                  | Done   | Covers `-f` short flag           |
| Quoted content stripping                           | Done   | Heredocs, single, double quotes  |

### Not Yet Implemented

| Category                               | Priority | Rationale                           |
| -------------------------------------- | -------- | ----------------------------------- |
| `git reset --hard`                     | **P1**   | Destroys uncommitted work silently  |
| `git checkout .` / `git checkout -- .` | **P1**   | Discards all unstaged changes       |
| `git restore .`                        | **P1**   | Same as checkout .                  |
| `git clean -f`                         | **P1**   | Deletes untracked files permanently |
| `git stash drop`                       | **P2**   | Destroys stashed work               |
| `git branch -D`                        | **P2**   | Deletes unmerged branches           |
| `rm -rf /` / `rm -rf .` / `rm -rf *`   | **P1**   | Catastrophic data loss              |

### Implementation Order

**Phase 1 (P1):** Add destructive git operations and catastrophic `rm -rf`.
These are the highest-risk commands with no recovery path.

**Phase 2 (P2):** Add `git stash drop` and `git branch -D`. Lower risk
because stashes and unmerged branches are less commonly critical, but still
worth guarding.

---

## Error Message Template

Every block message follows this structure:

```
BLOCKED: {one-line summary of what was detected}

{explanation of why this is dangerous — 1-2 sentences}

Instead:
- {safe alternative 1}
- {safe alternative 2}
- {escape hatch: "have the user run this manually if genuinely needed"}
```

The "Instead" section is critical — Claude reads it and uses it to
self-correct. Without it, Claude may retry the same blocked command
or give up entirely.

---

## Configuration

No changes needed to `.claude/settings.json`. The existing hook entry
already routes all Bash tool calls through the script:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "cd $CLAUDE_PROJECT_DIR/.claude/hooks && cat | npx tsx pre-tool-use-bash.ts"
          }
        ]
      }
    ]
  }
}
```

Adding new patterns requires only modifying `pre-tool-use-bash.ts`.

---

## Limitations

1. **Shell indirection is invisible.** `eval "git push --force"`,
   `bash -c "git reset --hard"`, and `cat script.sh | bash` bypass
   all pattern matching. The hook cannot follow these.

2. **Aliases and functions are invisible.** If a user's shell defines
   `alias gpf="git push --force"`, the hook sees `gpf`, not the expansion.

3. **Environment variable expansion is invisible.** `git push $FORCE_FLAG`
   where `FORCE_FLAG=--force` bypasses detection.

4. **Multi-line commands with line continuations.** The hook receives the
   full command string including `\` continuations, but complex multi-line
   pipelines may obscure patterns.

5. **The hook is advisory, not a security boundary.** A malicious actor
   with shell access can bypass it trivially. Its purpose is to catch
   accidental or model-generated dangerous commands, not to enforce
   security against an adversary.
