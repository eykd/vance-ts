# Background Agent Sandbox Blocks ralph.sh

**Category**: tooling
**Date**: 2026-03-30
**Feature**: 016-prestoplot-core
**Tags**: ralph, subagent, sandbox, background-agent

## Problem

Launching ralph.sh via a background Haiku subagent fails immediately with:

```
bwrap: Unexpected capabilities but not setuid, old file caps config?
```

The script never executes. No tasks are processed.

## Root Cause

Background agents inherit the default sandbox. ralph.sh needs network access (for `git`, `gh`, `claude` CLI, and `br` commands) and writes to paths outside the sandbox allowlist (`.ralph.lock`, `.ralph.log`). The sandbox's bubblewrap wrapper blocks all of these.

The first launch attempt used `run_in_background: true` on the Bash tool inside the subagent, but the subagent itself ran Bash in sandboxed mode. The Haiku model didn't infer that `dangerouslyDisableSandbox: true` was needed.

## Solution

When launching a background agent that runs ralph.sh (or any script needing network/git access):

1. **Explicitly instruct the subagent** to use `dangerouslyDisableSandbox: true` on its Bash calls.
2. **Use `mode: "bypassPermissions"`** on the Agent call so the subagent can disable the sandbox without prompting.
3. **Set a long timeout** (600000ms) since ralph processes multiple tasks sequentially.

The prompt to the subagent must contain an explicit instruction like:

> "You MUST run this command with dangerouslyDisableSandbox set to true, because ralph.sh needs network access for git and the Claude CLI."

Without this, cost-optimized models (Haiku) will default to sandboxed execution.

## Prevention

- When writing Agent prompts for scripts that touch the network or git, always include an explicit `dangerouslyDisableSandbox: true` instruction in the prompt text.
- When reviewing `/ralph` skill invocations, verify the subagent prompt mentions sandbox bypass.
- Consider this pattern for any background agent running shell scripts that need `git`, `gh`, `claude`, `br`, or `npm` commands.

## Related

- [ralph.sh Epic Detection Fails When Branch Uses Hyphens but Epic Title Uses Spaces](ralph-epic-detection-hyphens-vs-spaces.md)
- [Ralph ATDD Routing Blocks Acceptance-Spec-Only Tasks](ralph-atdd-routing-blocks-spec-only-tasks.md)
