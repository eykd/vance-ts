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
    .replace(/<<'?[A-Z_]+'?\n[\s\S]*?\n[A-Z_]+/gu, '') // heredocs
    .replace(/"(?:[^"\\]|\\.)*"/gu, '""')
    .replace(/'[^']*'/gu, "''"); // single-quoted strings
}

/**
 * Evaluates a command string against all guard rules.
 *
 * Checks PRE_STRIP_RULES against the raw command, then strips quoted
 * content and checks POST_STRIP_RULES against the stripped command.
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

  for (const rule of POST_STRIP_RULES) {
    if (rule.safePatterns?.some((sp) => sp.test(stripped)) === true) {
      continue;
    }
    if (rule.pattern.test(stripped)) {
      return { action: 'block', message: rule.message };
    }
  }

  return { action: 'allow' };
}
