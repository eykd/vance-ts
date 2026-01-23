#!/usr/bin/env bash
# Hook: PreToolUse:Bash
# Validates git commands to prevent bypassing safety hooks

# Read the hook input JSON from stdin
HOOK_INPUT=$(cat)

# Extract the tool_input.command field from JSON using jq
BASH_COMMAND=$(printf '%s' "$HOOK_INPUT" | jq -r '.tool_input.command // ""')

# Check for prohibited git flags using grep
if printf '%s' "$BASH_COMMAND" | grep -qE 'git.*(--no-verify|--no-gpg-sign)|git[[:space:]]+push.*(--force([^-]|$)|-f[[:space:]]|--force-with-lease)'; then
  # Write error message to stderr and exit with failure
  printf 'BLOCKED: Hook bypass or force flags detected.

Prohibited flags: --no-verify, --no-gpg-sign, --force, -f, --force-with-lease

Instead of bypassing safety checks:
- If pre-commit hook fails: Fix the linting/formatting/type errors it found
- If commit-msg fails: Write a proper conventional commit message
- If pre-push fails: Fix the issues preventing push
- If force push needed: This usually indicates a workflow problem

Fix the root problem rather than bypassing the safety mechanism.
Only use these flags when explicitly requested by the user.\n' >&2
  exit 1
fi

# Allow the command to proceed
exit 0
