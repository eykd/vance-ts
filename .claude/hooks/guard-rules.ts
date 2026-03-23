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

/**
 * Evaluates a command string against all guard rules.
 *
 * @param _command - The raw command string from tool_input.command.
 * @returns A GuardResult indicating whether the command is allowed or blocked.
 */
export function evaluateCommand(_command: string): GuardResult {
  return { action: 'allow' };
}
