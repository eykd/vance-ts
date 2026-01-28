---
name: ralph
description: Launch ralph.sh automation to process beads tasks using /sp:next. Use when automating feature development workflow. Runs in background with Haiku model.
---

# Ralph Automation Loop

Automatically process beads tasks by running ralph.sh in the background with the Haiku model for cost-effective automation.

## Quick Usage

```bash
/ralph                    # Run with defaults
/ralph dry run            # Preview what would happen
/ralph max 10 iterations  # Limit iterations
```

## How It Works

1. **Parse arguments** - Convert natural language to script flags
2. **Launch background agent** - Uses Haiku model for cost efficiency
3. **Run ralph.sh** - Agent executes script via Bash
4. **Monitor progress** - Track via .ralph.log output
5. **Present summary** - Bulleted list of tasks processed

## Natural Language Arguments

Ralph accepts these patterns:

| You Say                          | Script Flag          |
| -------------------------------- | -------------------- |
| "dry run", "preview", "test"     | `--dry-run`          |
| "max 10 iterations", "limit 5"   | `--max-iterations N` |
| "just 3 rounds", "only 2 cycles" | `--max-iterations N` |

Numbers are extracted automatically from phrases like "max 10 iterations".

## What Ralph Does

Ralph automates the feature development loop:

1. Queries beads for ready tasks under the current epic
2. For each task, invokes `/sp:next` with focused prompt
3. Monitors task completion via beads state
4. Creates commits after each task
5. Continues until all tasks complete or max iterations reached

## Prerequisites

Ralph validates these before running:

- ✅ Claude CLI installed and authenticated
- ✅ Beads initialized (`.beads/` directory exists)
- ✅ Git repository
- ✅ Current branch has matching epic
- ✅ For spec-kit workflow: clarify and tasks phases complete
- ✅ No ralph.sh already running (lock file check)

## Output Format

Ralph provides a bulleted summary of tasks processed:

```
Tasks Processed:
- workspace-abc-t1: Implement authentication (completed)
- workspace-abc-t2: Add login tests (completed)
- workspace-abc-t3: Update documentation (completed)

Summary: 3 tasks completed in 2 iterations
Elapsed: 15m 30s
```

## Edge Cases

### No Ready Tasks

If no ready tasks are found, Ralph checks for:

**Blocked tasks** - Tasks waiting on dependencies:

```
Blocked tasks:
- workspace-abc-t5: Deploy staging (blocked by t6)
- workspace-abc-t6: Fix deploy script (in-progress)
```

**Orphaned tasks** - Tasks created outside the epic:

```
Orphaned tasks (no epic):
- workspace-xyz-t1: Standalone task
```

**Suggestions**:

- Complete in-progress tasks to unblock others
- Check dependencies: `npx bd dep tree <epic-id>`
- Manually address orphaned tasks

### P3 Tasks Remaining

Ralph stops if only low-priority (P3) tasks remain:

```
No ready tasks, but 2 open task(s) remain (possibly P3 or blocked tasks)

These tasks may be:
- Low priority (P3) tasks waiting to be started
- Tasks blocked by dependencies
- Tasks that need manual intervention

Please review and either close, unblock, or complete manually.
```

## Error Diagnosis

Ralph diagnoses common issues:

### Lock File Exists

```
Error: ralph.sh is already running (PID: 12345)
If this is stale, remove .ralph.lock manually.
```

**Fix**: Check if ralph is actually running. If not, remove lock:

```bash
rm .ralph.lock
```

### Beads Not Initialized

```
Error: Beads not initialized. Run 'npx bd init' to initialize beads.
```

**Fix**:

```bash
npx bd init
```

### No Epic Found

```
Error: No epic found matching feature 'my-feature'
```

**Fix**: Create an epic or check branch name matches epic title

### Not a Git Repository

```
Error: Not in a git repository or HEAD is detached
```

**Fix**: Run from within a git repository with a checked-out branch

### Authentication Failure (Exit 130)

```
Error: Claude CLI authentication issue (exit code 130)
```

**Fix**: Re-authenticate Claude CLI:

```bash
claude auth
```

### Clarify Phase Not Complete (Spec-Kit Mode)

```
Error: Clarify phase not complete

Ralph automates phases 03-09 only. Before running ralph.sh:
1. Run '/sp:01-specify' to create the feature specification
2. Run '/sp:02-clarify' to clarify requirements

Once clarify is complete, ralph.sh can automate the rest.
```

**Fix**: Complete the prerequisite phases before running ralph

### Tasks Not Generated (Spec-Kit Mode)

```
Error: Task generation not complete

Run '/sp:05-tasks' to generate the task suite before running ralph.
```

**Fix**: Generate tasks via the spec workflow

## Operational Modes

Ralph detects the workflow mode automatically:

### Spec-Kit Mode

When your epic contains `[sp:NN-*]` phase tasks, Ralph operates in spec-kit mode:

- Validates prerequisite phases (clarify, tasks generation)
- Processes tasks from sp:\* workflow
- Skips phase tasks, focuses on implementation tasks

### Generic Mode

When your epic has regular tasks (no sp:\* phases):

- No prerequisite validation (other than epic having tasks)
- Processes all tasks under the epic
- Works with any beads task structure

## Background Execution

Ralph runs as a background task, allowing you to:

- Continue working in the main chat
- Monitor progress via periodic checks
- Stop if needed

The background agent uses the Haiku model for cost-effective automation.

## Workflow Integration

Ralph is designed to work with:

- **Spec-kit workflow** (`/sp:*` commands) - Automates phases 03-09
- **Generic task workflow** - Processes any beads tasks under an epic
- **Beads task management** - Uses beads as source of truth for state
- **Git commits** - Creates commits via `/commit` skill after each task

## Safety Features

Ralph enforces safety checks:

- ✅ **Never skip hooks** - Pre-commit hooks always run
- ✅ **Never amend** - Creates new commits, never rewrites history
- ✅ **Lock file** - Prevents concurrent runs
- ✅ **Iteration limit** - Defaults to 50, prevents infinite loops
- ✅ **Timeout** - 30-minute max per Claude invocation
- ✅ **Retry logic** - Exponential backoff for transient failures

## Logs

Detailed logs are written to `.ralph.log`:

- Session start/end timestamps
- Configuration settings
- Task details for each iteration
- Claude prompts and outputs
- Error messages and diagnostics

Use these logs to debug issues or audit what Ralph did.

## Examples

### Basic Usage

```bash
# Run ralph on current branch
/ralph
```

### Preview Mode

```bash
# See what ralph would do without invoking Claude
/ralph dry run
```

### Limited Iterations

```bash
# Process up to 5 tasks
/ralph max 5 iterations
```

### Common Workflow

```bash
# After creating spec and generating tasks:
/ralph

# Let it run in background
# Continue working in main chat
# Ralph will report when done
```

## When to Use Ralph

Use ralph when you want to:

- ✅ Automate implementation of multiple tasks
- ✅ Let Claude work through a task backlog
- ✅ Run unattended automation overnight
- ✅ Process tasks after planning is complete

Don't use ralph for:

- ❌ Interactive work requiring decisions
- ❌ Tasks needing user input
- ❌ Exploratory coding or prototyping
- ❌ Single tasks (just work on them directly)

## Integration with Review

After ralph completes:

1. **Review changes** - Check what was implemented
2. **Run code review** - Use `/code-review` skill
3. **Address findings** - Fix issues found in review
4. **Push to remote** - When ready for PR

Ralph creates a series of commits that preserve the full history of what was done.
