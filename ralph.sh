#!/usr/bin/env bash
# ralph.sh - Automated feature development loop using Claude CLI and beads
#
# Repeatedly invokes Claude with /sp:next until all tasks under the current
# feature epic are complete. Uses beads as source of truth for task state.

set -euo pipefail

# Script version
readonly VERSION="1.0.0"

# Default configuration
readonly DEFAULT_MAX_ITERATIONS=50
readonly LOCK_FILE=".ralph.lock"

# Retry configuration
readonly MAX_RETRIES=10
readonly MAX_RETRY_DELAY=300  # 5 minutes cap

# Exit codes
readonly EXIT_SUCCESS=0
readonly EXIT_FAILURE=1
readonly EXIT_LIMIT_REACHED=2
readonly EXIT_SIGINT=130

# Runtime configuration (set by argument parsing)
DRY_RUN=false
MAX_ITERATIONS="$DEFAULT_MAX_ITERATIONS"

# Runtime state (used for signal handlers and summary)
CURRENT_ITERATION=0
START_TIME=0

##############################################################################
# Usage and help
##############################################################################

usage() {
    cat <<EOF
Usage: ralph.sh [OPTIONS]

Automated feature development loop using Claude CLI and beads.

Repeatedly invokes Claude with /sp:next until all tasks under the current
feature epic are complete. Uses beads as source of truth for task state.

OPTIONS:
    --dry-run           Show what would be executed without invoking Claude
    --max-iterations N  Maximum loop iterations (default: $DEFAULT_MAX_ITERATIONS)
    --help              Show this help message and exit
    --version           Show version and exit

EXIT CODES:
    0   All tasks completed successfully
    1   Error (prerequisites failed, Claude failures after retries)
    2   Maximum iterations reached
    130 Interrupted by SIGINT (Ctrl+C)

EXAMPLES:
    ralph.sh                    # Run with defaults
    ralph.sh --dry-run          # Preview what would happen
    ralph.sh --max-iterations 10  # Limit to 10 iterations

EOF
}

##############################################################################
# Argument parsing
##############################################################################

parse_args() {
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --dry-run)
                DRY_RUN=true
                shift
                ;;
            --max-iterations)
                if [[ -z "${2:-}" ]] || [[ ! "$2" =~ ^[0-9]+$ ]]; then
                    echo "Error: --max-iterations requires a positive integer" >&2
                    exit "$EXIT_FAILURE"
                fi
                MAX_ITERATIONS="$2"
                shift 2
                ;;
            --help)
                usage
                exit "$EXIT_SUCCESS"
                ;;
            --version)
                echo "ralph.sh version $VERSION"
                exit "$EXIT_SUCCESS"
                ;;
            -*)
                echo "Error: Unknown option: $1" >&2
                usage >&2
                exit "$EXIT_FAILURE"
                ;;
            *)
                echo "Error: Unexpected argument: $1" >&2
                usage >&2
                exit "$EXIT_FAILURE"
                ;;
        esac
    done
}

##############################################################################
# Prerequisite validation
##############################################################################

# Check if Claude CLI is available
check_claude_cli() {
    if ! command -v claude &>/dev/null; then
        echo "Error: Claude CLI not found. Please install and authenticate claude CLI." >&2
        return 1
    fi
    return 0
}

# Check if beads is initialized
check_beads_init() {
    if [[ ! -d ".beads" ]]; then
        echo "Error: Beads not initialized. Run 'npx bd init' to initialize beads." >&2
        return 1
    fi
    return 0
}

# Check if clarify phase is complete for the epic
check_clarify_complete() {
    local epic_id="$1"
    local clarify_task status

    # Find the clarify task for this epic (title contains [sp:02-clarify])
    # Must use --status closed since we're checking for completed phase tasks
    clarify_task=$(npx bd list --parent "$epic_id" --status closed --json 2>/dev/null | \
        jq -c 'first(.[] | select(.title | contains("[sp:02-clarify]"))) | {id, status}')

    if [[ -z "$clarify_task" ]]; then
        echo "Warning: No clarify task found for epic $epic_id. Proceeding..." >&2
        return 0
    fi

    status=$(echo "$clarify_task" | jq -r '.status')

    if [[ "$status" != "closed" ]]; then
        echo "Error: Clarify phase not complete (status: $status)" >&2
        echo "" >&2
        echo "Ralph automates phases 03-09 only. Before running ralph.sh:" >&2
        echo "  1. Run '/sp:01-specify' to create the feature specification" >&2
        echo "  2. Run '/sp:02-clarify' to clarify requirements" >&2
        echo "" >&2
        echo "Once clarify is complete, ralph.sh can automate the rest." >&2
        return 1
    fi

    return 0
}

# Check if task suite has been generated for the epic
check_tasks_generated() {
    local epic_id="$1"
    local tasks_task status

    # Find the tasks phase task for this epic (title contains [sp:05-tasks])
    # Must use --status closed since we're checking for completed phase tasks
    tasks_task=$(npx bd list --parent "$epic_id" --status closed --json 2>/dev/null | \
        jq -c 'first(.[] | select(.title | contains("[sp:05-tasks]"))) | {id, status}')

    if [[ -z "$tasks_task" ]]; then
        echo "Error: No tasks phase found for epic $epic_id" >&2
        echo "" >&2
        echo "The task suite has not been generated yet. Run these phases first:" >&2
        echo "  1. '/sp:03-plan' to create the implementation plan" >&2
        echo "  2. '/sp:04-checklist' to generate the checklist" >&2
        echo "  3. '/sp:05-tasks' to generate beads tasks" >&2
        echo "" >&2
        echo "Once tasks are generated, ralph.sh can automate implementation." >&2
        return 1
    fi

    status=$(echo "$tasks_task" | jq -r '.status')

    if [[ "$status" != "closed" ]]; then
        echo "Error: Task generation not complete (status: $status)" >&2
        echo "" >&2
        echo "Run '/sp:05-tasks' to generate the task suite before running ralph." >&2
        return 1
    fi

    return 0
}

# Run all prerequisite checks
validate_prerequisites() {
    local epic_id="$1"

    echo "[ralph] Validating prerequisites..."

    check_claude_cli || return 1
    check_beads_init || return 1
    check_clarify_complete "$epic_id" || return 1
    check_tasks_generated "$epic_id" || return 1

    echo "[ralph] All prerequisites satisfied"
    return 0
}

##############################################################################
# Lock file management
##############################################################################

# Check if a process with given PID is a running ralph.sh instance
# Validates both PID existence and process identity to handle PID reuse
is_ralph_running() {
    local pid="$1"
    local cmd

    # First check if the process exists
    if ! kill -0 "$pid" 2>/dev/null; then
        return 1
    fi

    # Verify it's actually a ralph.sh process (handles PID reuse)
    cmd=$(ps -p "$pid" -o comm= 2>/dev/null) || return 1
    [[ "$cmd" == "ralph.sh" || "$cmd" == "bash" ]]
}

# Acquire exclusive lock for this branch using atomic file creation
acquire_lock() {
    local branch="$1"
    local lock_content existing_pid existing_branch

    # Prepare lock content: PID, timestamp, branch
    lock_content="$$
$(date -Iseconds)
$branch"

    # Try atomic lock creation first (prevents TOCTOU race condition)
    if ( set -o noclobber; echo "$lock_content" > "$LOCK_FILE" ) 2>/dev/null; then
        echo "[ralph] Acquired lock (PID: $$)"
        return 0
    fi

    # Lock file exists - check if it's stale
    existing_pid=$(head -n1 "$LOCK_FILE" 2>/dev/null || echo "")
    existing_branch=$(sed -n '3p' "$LOCK_FILE" 2>/dev/null || echo "")

    if [[ -n "$existing_pid" ]] && is_ralph_running "$existing_pid"; then
        echo "Error: ralph.sh is already running on branch '$existing_branch' (PID: $existing_pid)" >&2
        echo "If this is stale, remove $LOCK_FILE manually." >&2
        return 1
    fi

    # Stale lock file - remove and retry atomically
    echo "[ralph] Removing stale lock file (PID $existing_pid not running)"
    rm -f "$LOCK_FILE"

    if ( set -o noclobber; echo "$lock_content" > "$LOCK_FILE" ) 2>/dev/null; then
        echo "[ralph] Acquired lock (PID: $$)"
        return 0
    fi

    # Another process acquired the lock between rm and create
    echo "Error: Another ralph.sh instance acquired the lock" >&2
    return 1
}

# Release the lock file
release_lock() {
    if [[ -f "$LOCK_FILE" ]]; then
        local lock_pid
        lock_pid=$(head -n1 "$LOCK_FILE" 2>/dev/null || echo "")

        # Only release if we own the lock
        if [[ "$lock_pid" == "$$" ]]; then
            rm -f "$LOCK_FILE"
            echo "[ralph] Released lock"
        fi
    fi
}

##############################################################################
# Epic detection
##############################################################################

# Get the current git branch name
get_current_branch() {
    git branch --show-current 2>/dev/null || {
        echo "Error: Not in a git repository or HEAD is detached" >&2
        return 1
    }
}

# Extract feature name from branch (strip numeric prefix like "001-")
extract_feature_name() {
    local branch="$1"
    # Remove leading digits and hyphen (e.g., "001-ralph-automation" -> "ralph-automation")
    echo "$branch" | sed 's/^[0-9]*-//'
}

# Find the beads epic ID matching the feature name
find_epic_id() {
    local feature_name="$1"
    local epics_json

    epics_json=$(npx bd list --type epic --status open --json 2>/dev/null) || {
        echo "Error: Failed to query beads for epics" >&2
        return 1
    }

    # Find epic where title contains the feature name
    local epic_id
    epic_id=$(echo "$epics_json" | jq -r --arg name "$feature_name" \
        '.[] | select(.title | ascii_downcase | contains($name | ascii_downcase)) | .id' | head -n1)

    if [[ -z "$epic_id" ]]; then
        echo "Error: No epic found matching feature '$feature_name'" >&2
        return 1
    fi

    echo "$epic_id"
}

# Detect epic from current branch
detect_epic() {
    local branch feature_name epic_id

    branch=$(get_current_branch) || return 1

    if [[ -z "$branch" ]]; then
        echo "Error: Could not determine current branch" >&2
        return 1
    fi

    feature_name=$(extract_feature_name "$branch")
    echo "[ralph] Branch: $branch, Feature: $feature_name" >&2

    epic_id=$(find_epic_id "$feature_name") || return 1
    echo "[ralph] Epic ID: $epic_id" >&2

    echo "$epic_id"
}

##############################################################################
# Task checking
##############################################################################

# Get ready tasks for the epic (returns JSON array)
get_ready_tasks() {
    local epic_id="$1"
    local ready_json

    ready_json=$(npx bd ready --json 2>/dev/null) || {
        echo "Error: Failed to query beads for ready tasks" >&2
        return 1
    }

    # Filter tasks that belong to this epic (ID starts with epic_id)
    echo "$ready_json" | jq --arg epic "$epic_id" \
        '[.[] | select(.id | startswith($epic))]'
}

# Check if there are ready tasks remaining
has_ready_tasks() {
    local epic_id="$1"
    local ready_tasks count

    ready_tasks=$(get_ready_tasks "$epic_id") || return 1
    count=$(echo "$ready_tasks" | jq 'length')

    [[ "$count" -gt 0 ]]
}

# Get the first ready task info
get_next_task() {
    local epic_id="$1"
    local ready_tasks

    ready_tasks=$(get_ready_tasks "$epic_id") || return 1
    echo "$ready_tasks" | jq -r '.[0] // empty'
}

##############################################################################
# Task type detection and prompt generation
##############################################################################

# Check if task involves Hugo templates/content (vs TypeScript code)
is_hugo_task() {
    local task_json="$1"
    local title description

    title=$(echo "$task_json" | jq -r '.title // ""')
    description=$(echo "$task_json" | jq -r '.description // ""')

    # Hugo indicators: directory paths, skills, keywords
    [[ "$title" =~ (hugo|Hugo|template|layout|partial|\.html) ]] || \
    [[ "$description" =~ (hugo/|layouts/|htmx-alpine-templates|hugo-templates|hugo-project-setup) ]]
}

# Generate focused prompt based on task type
generate_focused_prompt() {
    local task_json="$1"
    local task_title task_id task_description task_details comments_json comments_text

    task_title=$(echo "$task_json" | jq -r '.title // "unknown"')
    task_id=$(echo "$task_json" | jq -r '.id // "unknown"')
    task_description=$(echo "$task_json" | jq -r '.description // ""')

    # Fetch full task details including comments
    task_details=$(npx bd show "$task_id" --json 2>/dev/null) || task_details=""

    # Extract and format comments if they exist
    if [[ -n "$task_details" ]]; then
        comments_json=$(echo "$task_details" | jq -r '.comments // []')
        comments_text=$(echo "$comments_json" | jq -r '.[] | "- \(.timestamp // "unknown"): \(.text // "")"' 2>/dev/null)
    else
        comments_text=""
    fi

    # Start with base prompt
    cat <<EOF
/sp:next

## Non-Interactive Mode
You are running in ralph's automation loop (non-interactive).
You CANNOT ask questions or wait for user input.
Communicate status ONLY through beads task management.

## Task Details
Title: $task_title
ID: $task_id

Description:
$task_description
EOF

    # Add comments section if there are any
    if [[ -n "$comments_text" ]]; then
        cat <<EOF

Previous Comments:
$comments_text
EOF
    fi

    cat <<EOF

## Task Focus
Complete ONLY this task described above.
Do NOT explore unrelated code or work on other tasks.

## Bead Lifecycle Management (REQUIRED)
1. Start task: npx bd start $task_id
2. Track progress: npx bd comment $task_id "status update message"
3. Complete task: npx bd close $task_id
4. If blocked: npx bd comment $task_id "BLOCKED: reason" (do NOT close)

CRITICAL: You MUST close the bead when the task is complete.
If you do not close it, ralph will run this task again.
EOF

    # Add testing instructions based on task type
    if is_hugo_task "$task_json"; then
        cat <<EOF

## Hugo Build Testing
After changes to hugo/ files:
1. Run: cd hugo && npm test
2. Fix any build errors before proceeding
EOF
    else
        cat <<EOF

## TDD Practice
Apply strict red-green-refactor:
1. RED: Write failing test first
2. GREEN: Minimal code to pass
3. REFACTOR: Improve while green
Run: npx jest --watch
EOF
    fi

    # Always add commit instructions
    cat <<EOF

## After Task Completion
Follow this EXACT sequence:
1. Commit: Run /commit skill to stage and commit changes
   - Creates conventional commit message
   - Runs pre-commit hooks
   - If hooks fail, fix and retry /commit
   - DO NOT push yet
2. Close bead: npx bd close $task_id
3. Push: git push (pushes both commit and .beads state)

CRITICAL: Close bead AFTER commit but BEFORE push.
This ensures if push fails, bead stays open for retry.
EOF
}

##############################################################################
# Claude CLI invocation
##############################################################################

# Invoke Claude CLI with focused prompt
# Returns the exit code from Claude
invoke_claude() {
    local prompt="$1"
    local exit_code

    echo "[ralph] Invoking Claude with focused prompt"

    if claude -p "$prompt"; then
        exit_code=0
    else
        exit_code=$?
    fi

    echo "[ralph] Claude exited with code: $exit_code"
    return "$exit_code"
}

##############################################################################
# Retry logic with exponential backoff
##############################################################################

# Calculate delay for a given retry attempt (exponential backoff capped at MAX_RETRY_DELAY)
# Delays: 1s, 2s, 4s, 8s, 16s, 32s, 64s, 128s, 256s, 300s (capped)
calculate_delay() {
    local attempt="$1"
    local delay

    # 2^(attempt-1) gives: 1, 2, 4, 8, 16, 32, 64, 128, 256, 512...
    delay=$((1 << (attempt - 1)))

    # Cap at MAX_RETRY_DELAY (300 seconds = 5 minutes)
    if (( delay > MAX_RETRY_DELAY )); then
        delay="$MAX_RETRY_DELAY"
    fi

    echo "$delay"
}

# Invoke Claude with exponential backoff retry
# Returns 0 on success, 1 if all retries exhausted
invoke_claude_with_retry() {
    local prompt="$1"
    local attempt=0
    local delay

    while (( attempt < MAX_RETRIES )); do
        attempt=$((attempt + 1))

        if invoke_claude "$prompt"; then
            return 0
        fi

        if (( attempt >= MAX_RETRIES )); then
            echo "[ralph] All $MAX_RETRIES retry attempts exhausted" >&2
            return 1
        fi

        delay=$(calculate_delay "$attempt")
        echo "[ralph] Retry $attempt/$MAX_RETRIES failed. Waiting ${delay}s before next attempt..."
        sleep "$delay"
    done

    return 1
}

##############################################################################
# Main loop
##############################################################################

run_loop() {
    local epic_id="$1"
    local iteration=0
    local next_task task_id task_title task_type
    local focused_prompt

    echo "[ralph] Starting automation loop (max $MAX_ITERATIONS iterations)"

    while (( iteration < MAX_ITERATIONS )); do
        iteration=$((iteration + 1))
        CURRENT_ITERATION="$iteration"  # Update global for SIGINT handler

        # Check for ready tasks
        if ! has_ready_tasks "$epic_id"; then
            echo "[ralph] No more ready tasks. Feature complete!"
            return "$EXIT_SUCCESS"
        fi

        # Get next task info for logging
        next_task=$(get_next_task "$epic_id")
        task_id=$(echo "$next_task" | jq -r '.id // "unknown"')
        task_title=$(echo "$next_task" | jq -r '.title // "unknown"')

        # Detect task type for logging
        if is_hugo_task "$next_task"; then
            task_type="Hugo"
        else
            task_type="TypeScript"
        fi

        echo "[ralph] Iteration $iteration/$MAX_ITERATIONS: $task_title ($task_id) [$task_type]"

        # Generate focused prompt
        focused_prompt=$(generate_focused_prompt "$next_task")

        if [[ "$DRY_RUN" == "true" ]]; then
            echo "[ralph] DRY RUN: Would invoke Claude with prompt:"
            echo "---"
            echo "$focused_prompt"
            echo "---"
            return "$EXIT_SUCCESS"
        fi

        # Invoke Claude CLI with retry logic
        if invoke_claude_with_retry "$focused_prompt"; then
            echo "[ralph] Claude completed successfully"
        else
            echo "[ralph] Claude failed after $MAX_RETRIES retries"
            return "$EXIT_FAILURE"
        fi
    done

    if (( iteration >= MAX_ITERATIONS )); then
        echo "[ralph] Maximum iterations ($MAX_ITERATIONS) reached"
        return "$EXIT_LIMIT_REACHED"
    fi

    return "$EXIT_SUCCESS"
}

##############################################################################
# Summary and reporting
##############################################################################

# Format duration in human-readable form
format_duration() {
    local seconds="$1"
    local minutes=$((seconds / 60))
    local remaining_seconds=$((seconds % 60))

    if (( minutes > 0 )); then
        echo "${minutes}m ${remaining_seconds}s"
    else
        echo "${remaining_seconds}s"
    fi
}

# Display completion summary
show_summary() {
    local exit_reason="$1"
    local end_time elapsed_seconds elapsed_formatted

    if (( START_TIME > 0 )); then
        end_time=$(date +%s)
        elapsed_seconds=$((end_time - START_TIME))
        elapsed_formatted=$(format_duration "$elapsed_seconds")
    else
        elapsed_formatted="N/A"
    fi

    echo ""
    echo "[ralph] ========================================="
    echo "[ralph] Summary: $exit_reason"
    echo "[ralph] Iterations: $CURRENT_ITERATION"
    echo "[ralph] Elapsed time: $elapsed_formatted"
    echo "[ralph] ========================================="
}

##############################################################################
# Signal handlers
##############################################################################

# Handler for SIGINT (Ctrl+C)
handle_sigint() {
    echo ""
    show_summary "Interrupted by user"
    # EXIT trap will handle lock release
    exit "$EXIT_SIGINT"
}

# Cleanup handler (runs on EXIT)
cleanup() {
    release_lock
}

##############################################################################
# Main entry point
##############################################################################

main() {
    parse_args "$@"

    echo "[ralph] Configuration: dry_run=$DRY_RUN, max_iterations=$MAX_ITERATIONS"

    # Record start time for summary
    START_TIME=$(date +%s)

    # Detect the epic for this branch
    local epic_id branch
    branch=$(get_current_branch) || exit "$EXIT_FAILURE"
    epic_id=$(detect_epic) || exit "$EXIT_FAILURE"

    echo "[ralph] Working on epic: $epic_id"

    # Skip lock and prerequisites in dry-run mode for testing
    if [[ "$DRY_RUN" != "true" ]]; then
        # Acquire lock to prevent concurrent runs
        acquire_lock "$branch" || exit "$EXIT_FAILURE"

        # Set up traps
        trap cleanup EXIT
        trap handle_sigint SIGINT

        # Validate prerequisites
        validate_prerequisites "$epic_id" || exit "$EXIT_FAILURE"
    fi

    # Run the main loop
    local result
    if run_loop "$epic_id"; then
        result=$?
    else
        result=$?
    fi

    # Show summary based on exit reason
    case "$result" in
        "$EXIT_SUCCESS")
            show_summary "All tasks completed successfully"
            ;;
        "$EXIT_LIMIT_REACHED")
            show_summary "Maximum iterations reached"
            ;;
        "$EXIT_FAILURE")
            show_summary "Execution failed"
            ;;
    esac

    exit "$result"
}

main "$@"
