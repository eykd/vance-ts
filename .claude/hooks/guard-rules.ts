/**
 * Result of evaluating a command against guard rules.
 *
 * Discriminated union: 'allow' has no message, 'block' includes a message.
 */
export type GuardResult =
  | { action: 'allow'; message?: undefined }
  | { action: 'block'; message: string };

/**
 * A named pattern defining a blocked command.
 *
 * Includes category, regex pattern, optional safe-pattern whitelist,
 * and an error message template.
 */
export interface GuardRule {
  /** Human-readable rule name. */
  name: string;
  /** Category grouping (e.g., 'destructive-git', 'platform-ops'). */
  category: string;
  /** Regex that triggers a block when matched. */
  pattern: RegExp;
  /** Whitelist regexes checked before the destructive pattern. */
  safePatterns?: RegExp[];
  /** Error message displayed when the command is blocked. */
  message: string;
}

/** Rules checked against the raw command (before quote stripping). */
export const PRE_STRIP_RULES: readonly GuardRule[] = [
  {
    name: 'hook-bypass',
    category: 'hook-bypass',
    pattern: /git.*(--no-verify|--no-gpg-sign)/,
    message: `BLOCKED: Hook bypass flags detected.

Prohibited flags: --no-verify, --no-gpg-sign

Instead of bypassing safety checks:
- If pre-commit hook fails: Fix the linting/formatting/type errors it found
- If commit-msg fails: Write a proper conventional commit message
- If pre-push fails: Fix the issues preventing push

Fix the root problem rather than bypassing the safety mechanism.
Only use these flags when explicitly requested by the user.`,
  },
  {
    name: 'force-push',
    category: 'destructive-git',
    pattern: /git\s+push.*(--force([^-]|$)|-f\s|--force-with-lease)/,
    message: `BLOCKED: Force push detected.

Prohibited flags: --force, -f, --force-with-lease

Force pushing rewrites remote history and can destroy teammates' work.
If force push is needed, this usually indicates a workflow problem.
Only use these flags when explicitly requested by the user.`,
  },
];

/** Rules checked against the quote-stripped command. */
export const POST_STRIP_RULES: readonly GuardRule[] = [
  {
    name: 'reset-hard',
    category: 'destructive-git',
    pattern: /git\s+reset\s+--hard/,
    message: `BLOCKED: git reset --hard detected.

This command discards all uncommitted changes with no recovery path.

Instead:
- Use \`git stash\` to save changes temporarily
- Use \`git reset --soft HEAD~1\` to undo a commit but keep changes
- Use \`git checkout -- <file>\` to discard changes in a specific file`,
  },
  {
    name: 'checkout-dot',
    category: 'destructive-git',
    pattern: /git\s+checkout\s+(--\s+)?\.(\s|$)/,
    safePatterns: [/git\s+checkout\s+-b\s/, /git\s+checkout\s+--orphan\s/],
    message: `BLOCKED: git checkout . detected (discard all changes).

This command discards all uncommitted changes across every file.

Instead:
- Use \`git checkout -- <file>\` to discard changes in a specific file
- Use \`git stash\` to save changes temporarily
- Use \`git diff\` to review changes before discarding`,
  },
  {
    name: 'checkout-treeish-dot',
    category: 'destructive-git',
    pattern: /git\s+checkout\s+.*--\s+\.(\s|$)/,
    safePatterns: [/git\s+checkout\s+-b\s/, /git\s+checkout\s+--orphan\s/],
    message: `BLOCKED: git checkout <tree-ish> -- . detected (overwrite all files).

This command overwrites all working tree files from another commit.

Instead:
- Use \`git checkout <tree-ish> -- <file>\` to restore a specific file
- Use \`git diff <tree-ish>\` to review differences first
- Use \`git stash\` to save current changes before restoring`,
  },
  {
    name: 'restore-dot',
    category: 'destructive-git',
    pattern: /git\s+restore\s+\.(\s|$)/,
    safePatterns: [/git\s+restore\s+--staged/, /git\s+restore\s+-S/],
    message: `BLOCKED: git restore . detected (discard all changes).

This command discards all uncommitted changes across every file.

Instead:
- Use \`git restore <file>\` to discard changes in a specific file
- Use \`git restore --staged <file>\` to unstage specific files
- Use \`git stash\` to save changes temporarily`,
  },
  {
    name: 'clean-force',
    category: 'destructive-git',
    pattern: /git\s+clean\s+.*-[a-zA-Z]*f/,
    safePatterns: [/git\s+clean\s+.*-[a-zA-Z]*n/, /git\s+clean\s+.*--dry-run/],
    message: `BLOCKED: git clean -f detected (delete untracked files).

This command permanently deletes untracked files with no recovery path.

Instead:
- Use \`git clean -n\` to preview what would be deleted (dry run)
- Use \`git clean --dry-run\` for the same preview
- Manually remove specific files you no longer need`,
  },
  {
    name: 'legacy-bd',
    category: 'platform-ops',
    pattern: /(?:^|&&|\|\||[;(|])\s*(?:npx\s+)?bd(?:\s|$)/mu,
    message: `BLOCKED: \`bd\` (legacy beads) is not permitted. Use \`br\` (beads_rust) instead.

This project has migrated from @beads/bd to beads_rust.

Replace:
  npx bd <subcommand>
  bd <subcommand>

With:
  br <subcommand>`,
  },
  {
    name: 'br-init-force',
    category: 'platform-ops',
    pattern: /\bbr\s+init\b.*(-f\b|--force\b)/u,
    message: `BLOCKED: br init --force is not permitted.

Reinitializing the beads database would destroy all issue history.

If you genuinely need to reset beads, have the user run this manually.`,
  },
  {
    name: 'commit-amend',
    category: 'destructive-git',
    pattern: /git\s+commit\s+.*--amend/,
    message: `BLOCKED: git commit --amend detected (amending commits is prohibited).

CLAUDE.md explicitly states "NEVER amend commits" — create a new commit instead.
Amending after a failed pre-commit hook can destroy the previous commit's changes.

Instead:
- Always create a new commit for changes
- Use \`git reset --soft HEAD~1\` to undo a commit without losing changes
- Have the user run interactive rebase manually if reorganizing history is needed`,
  },
  {
    name: 'merge-squash',
    category: 'destructive-git',
    pattern: /git\s+merge\s+.*--squash/,
    message: `BLOCKED: git merge --squash detected (squash-merging is prohibited).

CLAUDE.md explicitly states "NEVER squash-merge" — preserve full commit history.
Squash-merging destroys PR commit history and makes debugging harder.

Instead:
- Use normal \`git merge\` to preserve commit history
- Use \`git merge --no-ff\` to ensure a merge commit is created
- Have the user perform interactive rebase manually if needed`,
  },
  {
    name: 'stash-drop',
    category: 'destructive-git',
    pattern: /git\s+stash\s+drop(?:\s|$)/,
    message: `BLOCKED: git stash drop detected.

This command permanently deletes a stash entry with no recovery path.

Instead:
- Use \`git stash list\` to review stashes before dropping
- Use \`git stash apply\` to apply without removing the stash
- Use \`git stash pop\` to apply and remove only after confirming the stash contents`,
  },
  {
    name: 'stash-clear',
    category: 'destructive-git',
    pattern: /git\s+stash\s+clear(?:\s|$)/,
    message: `BLOCKED: git stash clear detected.

This command permanently deletes all stash entries with no recovery path.

Instead:
- Use \`git stash list\` to review stashes before clearing
- Use \`git stash drop stash@{N}\` to remove specific stashes one at a time
- Use \`git stash apply\` to recover work from a stash before removing it`,
  },
  {
    name: 'branch-force-delete',
    category: 'destructive-git',
    pattern: /git\s+branch\s+-D(?:\s|$)/,
    message: `BLOCKED: git branch -D detected (force-delete unmerged branch).

This command deletes a branch even if it has unmerged changes, potentially losing work.

Instead:
- Use \`git branch -d <branch>\` to safely delete only fully-merged branches
- Use \`git log <branch>\` to review commits before deleting
- Use \`git merge <branch>\` to merge changes before deleting`,
  },
  {
    name: 'catastrophic-rm',
    category: 'catastrophic-file-deletion',
    pattern:
      /rm\s+(?:-[a-zA-Z]*(?:rf|fr)[a-zA-Z]*|-[a-zA-Z]*r\s+-[a-zA-Z]*f|-[a-zA-Z]*f\s+-[a-zA-Z]*r|--recursive\s+--force|--force\s+--recursive)\s+(?:\$\{HOME\}|\$HOME|\.\.\/|\.\/|~\/|\/|~|\.|\*)(?:\s|$)/,
    message: `BLOCKED: Catastrophic rm detected — targets system-critical path.

This command would recursively force-delete a critical path (root, home, current directory, or all files) with no recovery.

Instead:
- Use \`rm -rf <specific-directory>\` to remove a known directory (e.g., node_modules, dist)
- Use \`ls <path>\` to verify what would be affected first
- Never use rm -rf with /, ., ~, ../, *, $HOME, or similar broad targets`,
  },
];

/**
 * Strips quoted content from a command to prevent false positives.
 *
 * Removes heredocs, double-quoted strings, and single-quoted strings,
 * replacing them with empty placeholders.
 *
 * @param command - The raw command string.
 * @returns The command with quoted content replaced.
 */
export function stripQuotedContent(command: string): string {
  return command
    .replace(/<<-?'?\w+'?\n[\s\S]*?\n\s*\w+/gu, '') // heredocs
    .replace(/"(?:[^"\\]|\\.)*"/gu, '""')
    .replace(/'[^']*'/gu, "''"); // single-quoted strings
}

/**
 * Splits a command string on shell separators after quote stripping.
 *
 * Splits on &&, ||, ;, and | so each sub-command can be evaluated
 * independently, preventing safe-pattern cross-contamination (S6).
 *
 * @param command - The quote-stripped command string.
 * @returns An array of sub-command strings.
 */
export function splitCommands(command: string): string[] {
  return command.split(/\s*(?:&&|\|\||[;|])\s*/).filter((s) => s.length > 0);
}

/**
 * Evaluates a command string against all guard rules.
 *
 * Checks PRE_STRIP_RULES against the raw command, then strips quoted
 * content, splits on shell separators, and checks POST_STRIP_RULES
 * against each sub-command independently.
 *
 * @param command - The raw command string from tool_input.command.
 * @returns A GuardResult indicating whether the command is allowed or blocked.
 */
export function evaluateCommand(command: string): GuardResult {
  for (const rule of PRE_STRIP_RULES) {
    if (rule.safePatterns?.some((sp) => sp.test(command)) === true) {
      continue;
    }
    if (rule.pattern.test(command)) {
      return { action: 'block', message: rule.message };
    }
  }

  const stripped = stripQuotedContent(command);
  const subCommands = splitCommands(stripped);

  for (const sub of subCommands) {
    for (const rule of POST_STRIP_RULES) {
      if (rule.safePatterns?.some((sp) => sp.test(sub)) === true) {
        continue;
      }
      if (rule.pattern.test(sub)) {
        return { action: 'block', message: rule.message };
      }
    }
  }

  return { action: 'allow' };
}
