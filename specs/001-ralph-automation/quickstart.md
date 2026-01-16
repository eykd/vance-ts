# Quickstart: Ralph Automation Loop

**Date**: 2026-01-16
**Feature**: 001-ralph-automation

## Overview

`ralph.sh` automates feature development by repeatedly invoking Claude with `/sp:next` until all tasks are complete. It handles phases 03-09 of the sp:\* workflow automatically.

## Prerequisites

Before running ralph.sh:

1. **Complete interactive phases**:

   ```bash
   # Define the feature
   /sp:01-specify "Your feature description"

   # Clarify requirements (interactive)
   /sp:02-clarify
   ```

2. **Verify prerequisites are ready**:
   ```bash
   # Check that clarify task is closed
   npx bd list --parent <epic-id> --json | jq '.[] | select(.title | contains("clarify")) | .status'
   # Should output: "closed"
   ```

## Basic Usage

```bash
# Start automated feature development
./ralph.sh
```

Ralph will:

1. Detect the current branch and find the matching epic
2. Verify sp:02-clarify is complete
3. Loop through phases: plan → checklist → tasks → implement → review
4. Exit when all tasks are complete

## Command Line Options

```bash
./ralph.sh [OPTIONS]

Options:
  --dry-run              Show what would be executed without running Claude
  --max-iterations N     Override default iteration limit (default: 50)
  --help                 Show help message
```

### Examples

```bash
# Dry run to see what would happen
./ralph.sh --dry-run

# Run with higher iteration limit for complex features
./ralph.sh --max-iterations 100

# Combine options
./ralph.sh --dry-run --max-iterations 20
```

## Monitoring Progress

While ralph.sh is running, it outputs:

```
[ralph] Starting automation for epic workspace-9w6
[ralph] Iteration 1: Processing [sp:03-plan] Create implementation plan...
[ralph] Claude invocation complete (exit 0)
[ralph] Iteration 2: Processing [sp:04-checklist] Generate requirements checklist...
...
[ralph] Complete! 12 iterations, 6 tasks completed in 45m 23s
```

## Interrupting and Resuming

**To interrupt**: Press `Ctrl+C`

```
^C
[ralph] Interrupted. Completed 5 iterations.
```

**To resume**: Just run ralph.sh again

```bash
./ralph.sh
# Resumes from the last completed task
```

Beads tracks task completion, so ralph.sh picks up where it left off.

## Error Handling

### Retry Behavior

If Claude fails (network error, timeout, etc.):

- Ralph retries up to 10 times
- Exponential backoff: 1s, 2s, 4s, 8s... up to 5 minutes
- After 10 failures, exits with error

### Common Errors

| Error                         | Cause                       | Solution                                                 |
| ----------------------------- | --------------------------- | -------------------------------------------------------- |
| "sp:02-clarify not complete"  | Interactive phases not done | Run `/sp:02-clarify` first                               |
| "Another ralph.sh is running" | Lock file exists            | Wait for other instance or remove `.ralph.lock` if stale |
| "Epic not found for branch"   | No matching beads epic      | Run `/sp:01-specify` first                               |
| "Max iterations reached"      | Feature too complex         | Increase limit or check for stuck tasks                  |

## Exit Codes

| Code | Meaning                                          |
| ---- | ------------------------------------------------ |
| 0    | Success - all tasks complete                     |
| 1    | Error - prerequisites missing or Claude failures |
| 2    | Limit - max iterations reached                   |
| 130  | Interrupted - Ctrl+C                             |

## Workflow Example

Complete workflow from feature idea to implementation:

```bash
# 1. Start feature (interactive)
claude
> /sp:01-specify "Add user preferences page with theme selection"

# 2. Clarify requirements (interactive)
> /sp:02-clarify

# 3. Start automation (can walk away)
./ralph.sh

# 4. Come back later to find:
#    - plan.md created
#    - checklist generated
#    - tasks broken down
#    - code implemented
#    - review complete
```

## Troubleshooting

### Check beads status

```bash
# See all tasks under epic
npx bd list --parent workspace-9w6

# See dependency tree
npx bd dep tree workspace-9w6

# See what's ready
npx bd ready
```

### Remove stale lock

If ralph.sh crashed without cleanup:

```bash
# Check if process is actually running
cat .ralph.lock  # Shows PID
ps -p <PID>      # Check if running

# If not running, safe to remove
rm .ralph.lock
```

### View Claude output

Ralph logs all Claude output to stdout. To save for debugging:

```bash
./ralph.sh 2>&1 | tee ralph.log
```
