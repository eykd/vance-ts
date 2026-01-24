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
readonly LOG_FILE=".ralph.log"
readonly LOG_MAX_SIZE=$((10 * 1024 * 1024))  # 10MB max log size

# Retry configuration
readonly MAX_RETRIES=10
readonly MAX_RETRY_DELAY=300  # 5 minutes cap

# Claude CLI timeout
readonly CLAUDE_TIMEOUT=1800  # 30 minutes max per invocation

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
# Logging infrastructure
##############################################################################

# Rotate log file if it exceeds MAX_SIZE
rotate_log() {
    if [[ -f "$LOG_FILE" ]] && [[ $(stat -f%z "$LOG_FILE" 2>/dev/null || stat -c%s "$LOG_FILE" 2>/dev/null || echo 0) -gt "$LOG_MAX_SIZE" ]]; then
        local timestamp
        timestamp=$(date +%Y%m%d-%H%M%S)
        mv "$LOG_FILE" "${LOG_FILE}.${timestamp}"
        echo "[ralph] Rotated log file to ${LOG_FILE}.${timestamp}"
    fi
}

# Initialize log file with session header
init_log() {
    rotate_log
    {
        echo "========================================================================"
        echo "Ralph Automation Session"
        echo "Started: $(date -Iseconds)"
        echo "Version: $VERSION"
        echo "Configuration: dry_run=$DRY_RUN, max_iterations=$MAX_ITERATIONS"
        echo "========================================================================"
        echo ""
    } >> "$LOG_FILE"
}

# Log a message with timestamp and level
# Usage: log LEVEL MESSAGE
# Levels: INFO, WARN, ERROR, DEBUG
log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp
    timestamp=$(date -Iseconds)

    # Write to log file
    echo "[$timestamp] [$level] $message" >> "$LOG_FILE"

    # Also write to console for INFO/WARN/ERROR (always to stderr to avoid capture in command substitution)
    case "$level" in
        INFO)
            echo "[ralph] $message" >&2
            ;;
        WARN)
            echo "[ralph] WARNING: $message" >&2
            ;;
        ERROR)
            echo "[ralph] ERROR: $message" >&2
            ;;
    esac
}

# Log a separator for major sections
log_section() {
    local title="$1"
    {
        echo ""
        echo "========================================================================"
        echo "$title"
        echo "========================================================================"
        echo ""
    } >> "$LOG_FILE"
}

# Log the full content of a prompt or output
log_block() {
    local label="$1"
    local content="$2"
    {
        echo ""
        echo "-------- $label --------"
        echo "$content"
        echo "-------- End $label --------"
        echo ""
    } >> "$LOG_FILE"
}

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
    log DEBUG "Checking for Claude CLI..."
    if ! command -v claude &>/dev/null; then
        log ERROR "Claude CLI not found. Please install and authenticate claude CLI."
        return 1
    fi
    log DEBUG "Claude CLI found"
    return 0
}

# Check if beads is initialized
check_beads_init() {
    log DEBUG "Checking for beads initialization..."
    if [[ ! -d ".beads" ]]; then
        log ERROR "Beads not initialized. Run 'npx bd init' to initialize beads."
        return 1
    fi
    log DEBUG "Beads initialized"
    return 0
}

# Check if clarify phase is complete for the epic
check_clarify_complete() {
    local epic_id="$1"
    local clarify_task status

    log DEBUG "Checking clarify phase completion for epic $epic_id..."

    # Find the clarify task for this epic (title contains [sp:02-clarify])
    # Must use --status closed since we're checking for completed phase tasks
    clarify_task=$(npx bd list --parent "$epic_id" --status closed --json 2>/dev/null | \
        jq -c 'first(.[] | select(.title | contains("[sp:02-clarify]"))) | {id, status}')

    if [[ -z "$clarify_task" ]]; then
        log WARN "No clarify task found for epic $epic_id. Proceeding..."
        return 0
    fi

    status=$(echo "$clarify_task" | jq -r '.status')
    log DEBUG "Clarify task status: $status"

    if [[ "$status" != "closed" ]]; then
        log ERROR "Clarify phase not complete (status: $status)"
        echo "" >&2
        echo "Ralph automates phases 03-09 only. Before running ralph.sh:" >&2
        echo "  1. Run '/sp:01-specify' to create the feature specification" >&2
        echo "  2. Run '/sp:02-clarify' to clarify requirements" >&2
        echo "" >&2
        echo "Once clarify is complete, ralph.sh can automate the rest." >&2
        return 1
    fi

    log DEBUG "Clarify phase complete"
    return 0
}

# Check if task suite has been generated for the epic
check_tasks_generated() {
    local epic_id="$1"
    local tasks_task status

    log DEBUG "Checking task generation for epic $epic_id..."

    # Find the tasks phase task for this epic (title contains [sp:05-tasks])
    # Must use --status closed since we're checking for completed phase tasks
    tasks_task=$(npx bd list --parent "$epic_id" --status closed --json 2>/dev/null | \
        jq -c 'first(.[] | select(.title | contains("[sp:05-tasks]"))) | {id, status}')

    if [[ -z "$tasks_task" ]]; then
        log ERROR "No tasks phase found for epic $epic_id"
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
    log DEBUG "Tasks phase status: $status"

    if [[ "$status" != "closed" ]]; then
        log ERROR "Task generation not complete (status: $status)"
        echo "" >&2
        echo "Run '/sp:05-tasks' to generate the task suite before running ralph." >&2
        return 1
    fi

    log DEBUG "Task generation complete"
    return 0
}

# Run all prerequisite checks
validate_prerequisites() {
    local epic_id="$1"

    log INFO "Validating prerequisites..."
    log_section "PREREQUISITE VALIDATION"

    check_claude_cli || return 1
    check_beads_init || return 1
    check_clarify_complete "$epic_id" || return 1
    check_tasks_generated "$epic_id" || return 1

    log INFO "All prerequisites satisfied"
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

    log DEBUG "Attempting to acquire lock for branch: $branch"

    # Prepare lock content: PID, timestamp, branch
    lock_content="$$
$(date -Iseconds)
$branch"

    # Try atomic lock creation first (prevents TOCTOU race condition)
    if ( set -o noclobber; echo "$lock_content" > "$LOCK_FILE" ) 2>/dev/null; then
        log INFO "Acquired lock (PID: $$)"
        return 0
    fi

    # Lock file exists - check if it's stale
    existing_pid=$(head -n1 "$LOCK_FILE" 2>/dev/null || echo "")
    existing_branch=$(sed -n '3p' "$LOCK_FILE" 2>/dev/null || echo "")

    log DEBUG "Lock file exists: PID=$existing_pid, branch=$existing_branch"

    if [[ -n "$existing_pid" ]] && is_ralph_running "$existing_pid"; then
        log ERROR "ralph.sh is already running on branch '$existing_branch' (PID: $existing_pid)"
        echo "If this is stale, remove $LOCK_FILE manually." >&2
        return 1
    fi

    # Stale lock file - remove and retry atomically
    log INFO "Removing stale lock file (PID $existing_pid not running)"
    rm -f "$LOCK_FILE"

    if ( set -o noclobber; echo "$lock_content" > "$LOCK_FILE" ) 2>/dev/null; then
        log INFO "Acquired lock (PID: $$)"
        return 0
    fi

    # Another process acquired the lock between rm and create
    log ERROR "Another ralph.sh instance acquired the lock"
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
            log INFO "Released lock"
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

    log DEBUG "Detecting epic from current branch..."

    branch=$(get_current_branch) || return 1

    if [[ -z "$branch" ]]; then
        log ERROR "Could not determine current branch"
        return 1
    fi

    feature_name=$(extract_feature_name "$branch")
    log INFO "Branch: $branch, Feature: $feature_name"

    epic_id=$(find_epic_id "$feature_name") || return 1
    log INFO "Epic ID: $epic_id"

    echo "$epic_id"
}

##############################################################################
# Task checking
##############################################################################

# Get in-progress tasks for the epic (returns JSON array)
get_in_progress_tasks() {
    local epic_id="$1"
    local in_progress_json

    in_progress_json=$(npx bd list --status in-progress --json 2>/dev/null) || {
        echo "Error: Failed to query beads for in-progress tasks" >&2
        return 1
    }

    # Filter tasks that belong to this epic (ID starts with epic_id)
    echo "$in_progress_json" | jq --arg epic "$epic_id" \
        '[.[] | select(.id | startswith($epic))]'
}

# Check if there are in-progress tasks
has_in_progress_tasks() {
    local epic_id="$1"
    local in_progress_tasks count

    in_progress_tasks=$(get_in_progress_tasks "$epic_id") || return 1
    count=$(echo "$in_progress_tasks" | jq 'length')

    [[ "$count" -gt 0 ]]
}

# Get the first in-progress task info
get_in_progress_task() {
    local epic_id="$1"
    local in_progress_tasks

    in_progress_tasks=$(get_in_progress_tasks "$epic_id") || return 1
    echo "$in_progress_tasks" | jq -r '.[0] // empty'
}

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

# Get all open tasks for the epic (returns JSON array)
get_open_tasks() {
    local epic_id="$1"
    local open_json

    open_json=$(npx bd list --status open --json 2>/dev/null) || {
        echo "Error: Failed to query beads for open tasks" >&2
        return 1
    }

    # Filter tasks that belong to this epic (ID starts with epic_id)
    echo "$open_json" | jq --arg epic "$epic_id" \
        '[.[] | select(.id | startswith($epic))]'
}

# Check if there are any open tasks remaining
has_open_tasks() {
    local epic_id="$1"
    local open_tasks count

    open_tasks=$(get_open_tasks "$epic_id") || return 1
    count=$(echo "$open_tasks" | jq 'length')

    [[ "$count" -gt 0 ]]
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
    local task_title task_id task_description task_details comments_json comments_text task_status

    task_title=$(echo "$task_json" | jq -r '.title // "unknown"')
    task_id=$(echo "$task_json" | jq -r '.id // "unknown"')
    task_description=$(echo "$task_json" | jq -r '.description // ""')
    task_status=$(echo "$task_json" | jq -r '.status // "unknown"')

    # Fetch full task details including comments
    task_details=$(npx bd show "$task_id" --json 2>/dev/null) || task_details=""

    # Extract and format comments if they exist
    if [[ -n "$task_details" ]]; then
        # Normalize to object (handle both array and object responses from bd show)
        comments_json=$(echo "$task_details" | jq -r '(if type == "array" then .[0] else . end) | .comments // []')
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
Status: $task_status
EOF

    # Add resumption notice if task is in-progress
    if [[ "$task_status" == "in-progress" ]]; then
        cat <<EOF

**RESUMING INTERRUPTED TASK**
This task was previously started but not completed.
Review previous comments below for context on what was done.
Continue from where you left off.
EOF
    fi

    cat <<EOF

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
1. Close bead: npx bd close $task_id
   - This updates .beads state which needs to be committed
2. Commit: Run /commit skill to stage and commit changes
   - Creates conventional commit message
   - Includes .beads state changes from step 1
   - Runs pre-commit hooks (NEVER skip with --no-verify)
   - If hooks fail, you MUST fix the issues (format, lint, tests)
   - Retry /commit after fixing

CRITICAL: Close bead BEFORE commit to include .beads state.
Ralph will create a series of commits across iterations.
User will push manually when ready.

FORBIDDEN: NEVER use --no-verify, --no-hooks, or similar flags.
Pre-commit hooks enforce code quality and MUST pass.
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
    local claude_output

    log INFO "Invoking Claude with focused prompt"
    log_section "CLAUDE INVOCATION - $(date -Iseconds)"
    log_block "Prompt" "$prompt"

    # Capture Claude output to a temp file for logging
    local temp_output
    temp_output=$(mktemp)

    # Use timeout to prevent indefinite hangs (exit code 124 = timeout)
    if timeout "$CLAUDE_TIMEOUT" claude -p "$prompt" 2>&1 | tee "$temp_output"; then
        exit_code=0
        log INFO "Claude completed successfully"
    else
        exit_code=$?
        if [[ "$exit_code" -eq 124 ]]; then
            log ERROR "Claude timed out after ${CLAUDE_TIMEOUT}s"
        else
            log ERROR "Claude failed with exit code: $exit_code"
        fi
    fi

    # Log the output
    claude_output=$(cat "$temp_output")
    log_block "Claude Output" "$claude_output"
    rm -f "$temp_output"

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
        log DEBUG "Claude invocation attempt $attempt/$MAX_RETRIES"

        if invoke_claude "$prompt"; then
            if (( attempt > 1 )); then
                log INFO "Claude succeeded after $attempt attempts"
            fi
            return 0
        fi

        if (( attempt >= MAX_RETRIES )); then
            log ERROR "All $MAX_RETRIES retry attempts exhausted"
            return 1
        fi

        delay=$(calculate_delay "$attempt")
        log WARN "Retry $attempt/$MAX_RETRIES failed. Waiting ${delay}s before next attempt..."
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
    local next_task task_id task_title task_description task_type
    local focused_prompt
    local is_resuming=false

    log INFO "Starting automation loop (max $MAX_ITERATIONS iterations)"
    log_section "AUTOMATION LOOP START"

    while (( iteration < MAX_ITERATIONS )); do
        iteration=$((iteration + 1))
        CURRENT_ITERATION="$iteration"  # Update global for SIGINT handler

        log_section "ITERATION $iteration/$MAX_ITERATIONS"

        # Check for in-progress tasks first (resume interrupted work)
        log DEBUG "Checking for in-progress tasks..."
        if has_in_progress_tasks "$epic_id"; then
            is_resuming=true
            next_task=$(get_in_progress_task "$epic_id")
            log INFO "Resuming interrupted task"
        else
            # No in-progress tasks, check for ready tasks
            is_resuming=false
            log DEBUG "Checking for ready tasks..."
            if ! has_ready_tasks "$epic_id"; then
                # No ready tasks, but check if there are still open tasks (e.g., P3 tasks)
                log DEBUG "No ready tasks found. Checking for remaining open tasks..."
                if has_open_tasks "$epic_id"; then
                    local open_tasks open_count
                    open_tasks=$(get_open_tasks "$epic_id")
                    open_count=$(echo "$open_tasks" | jq 'length')
                    log WARN "No ready tasks, but $open_count open task(s) remain (possibly P3 or blocked tasks)"
                    log_block "Remaining Open Tasks" "$(echo "$open_tasks" | jq -r '.[] | "\(.id): \(.title) [priority: \(.priority // "none")]"')"
                    log ERROR "Cannot complete epic with open tasks remaining"
                    echo "" >&2
                    echo "[ralph] ERROR: Epic has $open_count open task(s) that are not ready:" >&2
                    echo "$open_tasks" | jq -r '.[] | "  - \(.id): \(.title) [priority: \(.priority // "none"), status: \(.status)]"' >&2
                    echo "" >&2
                    echo "These tasks may be:" >&2
                    echo "  - Low priority (P3) tasks waiting to be started" >&2
                    echo "  - Tasks blocked by dependencies" >&2
                    echo "  - Tasks that need manual intervention" >&2
                    echo "" >&2
                    echo "Please review these tasks and either:" >&2
                    echo "  - Close them if they're no longer needed" >&2
                    echo "  - Unblock them and let ralph continue" >&2
                    echo "  - Complete them manually" >&2
                    return "$EXIT_FAILURE"
                fi
                log INFO "No more ready tasks and no open tasks. Feature complete!"
                return "$EXIT_SUCCESS"
            fi
            next_task=$(get_next_task "$epic_id")
        fi

        # Extract task info for logging
        task_id=$(echo "$next_task" | jq -r '.id // "unknown"')
        task_title=$(echo "$next_task" | jq -r '.title // "unknown"')
        task_description=$(echo "$next_task" | jq -r '.description // "no description"')

        # Detect task type for logging
        if is_hugo_task "$next_task"; then
            task_type="Hugo"
        else
            task_type="TypeScript"
        fi

        if [[ "$is_resuming" == "true" ]]; then
            log INFO "Iteration $iteration/$MAX_ITERATIONS: [RESUMING] $task_title ($task_id) [$task_type]"
        else
            log INFO "Iteration $iteration/$MAX_ITERATIONS: $task_title ($task_id) [$task_type]"
        fi

        log_block "Task Details" "ID: $task_id
Title: $task_title
Type: $task_type
Status: $(if [[ "$is_resuming" == "true" ]]; then echo "RESUMING IN-PROGRESS"; else echo "STARTING NEW"; fi)

Description:
$task_description"

        # Generate focused prompt
        log DEBUG "Generating focused prompt..."
        focused_prompt=$(generate_focused_prompt "$next_task")

        if [[ "$DRY_RUN" == "true" ]]; then
            log INFO "DRY RUN: Would invoke Claude with prompt"
            log_block "Dry Run Prompt" "$focused_prompt"
            echo "---"
            echo "$focused_prompt"
            echo "---"
            return "$EXIT_SUCCESS"
        fi

        # Invoke Claude CLI with retry logic
        if invoke_claude_with_retry "$focused_prompt"; then
            log INFO "Task processing completed successfully"
        else
            log ERROR "Task processing failed after $MAX_RETRIES retries"
            return "$EXIT_FAILURE"
        fi
    done

    if (( iteration >= MAX_ITERATIONS )); then
        log WARN "Maximum iterations ($MAX_ITERATIONS) reached"
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

    # Log to file
    log_section "SESSION SUMMARY"
    {
        echo "Exit reason: $exit_reason"
        echo "Iterations completed: $CURRENT_ITERATION"
        echo "Elapsed time: $elapsed_formatted"
        echo "Ended: $(date -Iseconds)"
    } >> "$LOG_FILE"

    # Display to console
    echo ""
    echo "[ralph] ========================================="
    echo "[ralph] Summary: $exit_reason"
    echo "[ralph] Iterations: $CURRENT_ITERATION"
    echo "[ralph] Elapsed time: $elapsed_formatted"
    echo "[ralph] Log file: $LOG_FILE"
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

    # Initialize logging infrastructure
    init_log

    log INFO "Configuration: dry_run=$DRY_RUN, max_iterations=$MAX_ITERATIONS"
    log INFO "Log file: $LOG_FILE"

    # Record start time for summary
    START_TIME=$(date +%s)

    # Detect the epic for this branch
    local epic_id branch
    branch=$(get_current_branch) || exit "$EXIT_FAILURE"
    epic_id=$(detect_epic) || exit "$EXIT_FAILURE"

    log INFO "Working on epic: $epic_id"

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
