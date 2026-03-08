#!/usr/bin/env bash
# ralph.sh - Automated feature development loop using Claude CLI and beads
#
# Repeatedly invokes Claude with /sp:next until all tasks under the current
# feature epic are complete. Uses beads as source of truth for task state.

set -euo pipefail

# Script version
readonly VERSION="2.0.0"

# Default configuration
readonly DEFAULT_MAX_ITERATIONS=50
readonly LOCK_FILE=".ralph.lock"
readonly LOG_FILE=".ralph.log"
readonly LOG_MAX_SIZE=$((10 * 1024 * 1024))  # 10MB max log size

# Retry configuration
readonly MAX_RETRIES=10
readonly MAX_RETRY_DELAY=300  # 5 minutes cap

# Claude CLI timeout
readonly CLAUDE_TIMEOUT=3600  # 60 minutes max per invocation

# Heartbeat interval during Claude invocations
readonly HEARTBEAT_INTERVAL=30  # seconds between progress updates

# ATDD workflow configuration
readonly STEP_BIND="BIND"
readonly STEP_RED="RED"
readonly STEP_GREEN="GREEN"
readonly STEP_REFACTOR="REFACTOR"
readonly STEP_REVIEW="REVIEW"
readonly TDD_STEP_RETRIES=7
readonly TDD_STEP_RETRY_BASE_DELAY=1   # base seconds for Claude invocation backoff
readonly TDD_STEP_RETRY_MAX_DELAY=60   # cap for Claude invocation backoff
readonly TDD_MAX_CYCLES=5         # max R-G-R-Review cycles per task
readonly ATDD_MAX_INNER_CYCLES=15
readonly ACCEPTANCE_OUTPUT_FILE=".ralph-acceptance.json"

# Exit codes
readonly EXIT_SUCCESS=0
readonly EXIT_FAILURE=1
readonly EXIT_LIMIT_REACHED=2
readonly EXIT_SIGINT=130

# Colors (disabled if stderr is not a terminal)
if [[ -t 2 ]]; then
    readonly CLR_RESET=$'\033[0m'
    readonly CLR_INFO=$'\033[0;36m'     # cyan
    readonly CLR_WARN=$'\033[0;33m'     # yellow
    readonly CLR_ERROR=$'\033[0;31m'    # red
    readonly CLR_BOLD=$'\033[1m'        # bold
else
    readonly CLR_RESET="" CLR_INFO="" CLR_WARN="" CLR_ERROR="" CLR_BOLD=""
fi

# Runtime configuration (set by argument parsing)
DRY_RUN=false
MAX_ITERATIONS="$DEFAULT_MAX_ITERATIONS"
EXPLICIT_EPIC_ID=""  # Epic ID provided via --epic argument
EPIC_ID=""  # Set by run_loop(); used by find_leaf_task() safety net

# Runtime state (used for signal handlers and summary)
CURRENT_ITERATION=0
START_TIME=0
CLAUDE_PID=""
HEARTBEAT_PID=""
LAST_CLAUDE_OUTPUT=""
LAST_STEP_OUTPUT=""
LAST_RALPH_SIGNAL=""  # Parsed JSON from RALPH_SIGNAL line

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
        echo "Configuration: dry_run=$DRY_RUN, max_iterations=$MAX_ITERATIONS, explicit_epic=$EXPLICIT_EPIC_ID"
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
    local timestamp short_ts
    timestamp=$(date -Iseconds)
    short_ts=$(date +%T)

    # Write to log file
    echo "[$timestamp] [$level] $message" >> "$LOG_FILE"

    # Also write to console for INFO/WARN/ERROR (always to stderr to avoid capture in command substitution)
    case "$level" in
        INFO)
            echo "${CLR_INFO}[ralph]${CLR_RESET} $short_ts $message" >&2
            ;;
        WARN)
            echo "${CLR_WARN}[ralph] $short_ts WARNING: $message${CLR_RESET}" >&2
            ;;
        ERROR)
            echo "${CLR_ERROR}[ralph] $short_ts ERROR: $message${CLR_RESET}" >&2
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
# RALPH_SIGNAL parsing
##############################################################################

# Extract RALPH_SIGNAL JSON from Claude's output
# Sets LAST_RALPH_SIGNAL global. Returns 0 if found, 1 if not.
parse_ralph_signal() {
    local output="$1"
    LAST_RALPH_SIGNAL=""
    local signal_line
    signal_line=$(echo "$output" | grep -o 'RALPH_SIGNAL:{[^}]*}' | tail -1) || true
    if [[ -n "$signal_line" ]]; then
        local json_part="${signal_line#RALPH_SIGNAL:}"
        # Try as-is first
        if echo "$json_part" | jq empty 2>/dev/null; then
            LAST_RALPH_SIGNAL="$json_part"
            log DEBUG "Parsed RALPH_SIGNAL: $LAST_RALPH_SIGNAL"
            return 0
        fi
        # Fallback: unescape JSON string escapes (when signal comes from raw JSON envelope)
        local unescaped
        unescaped=$(echo "$json_part" | sed 's/\\"/"/g; s/\\\\/\\/g')
        if echo "$unescaped" | jq empty 2>/dev/null; then
            LAST_RALPH_SIGNAL="$unescaped"
            log DEBUG "Parsed RALPH_SIGNAL (unescaped): $LAST_RALPH_SIGNAL"
            return 0
        fi
    fi
    return 1
}

# Read a field from LAST_RALPH_SIGNAL
# Usage: get_signal field [default]
get_signal() {
    local field="$1" default="${2:-}"
    if [[ -z "$LAST_RALPH_SIGNAL" ]]; then
        echo "$default"; return
    fi
    local val
    val=$(echo "$LAST_RALPH_SIGNAL" | jq -r ".$field // empty" 2>/dev/null) || true
    echo "${val:-$default}"
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
    --epic <epic-id>    Explicitly specify epic ID (overrides branch-based detection)
    --max-iterations N  Maximum loop iterations (default: $DEFAULT_MAX_ITERATIONS)
    --help              Show this help message and exit
    --version           Show version and exit

EXIT CODES:
    0   All tasks completed successfully
    1   Error (prerequisites failed, Claude failures after retries, invalid epic)
    2   Maximum iterations reached
    130 Interrupted by SIGINT (Ctrl+C)

EXAMPLES:
    ralph.sh                    # Run with defaults (branch-based detection)
    ralph.sh --dry-run          # Preview what would happen
    ralph.sh --epic workspace-whatever13  # Use explicit epic ID
    ralph.sh --max-iterations 10  # Limit to 10 iterations
    ralph.sh --epic workspace-abc --dry-run  # Combine options

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
            --epic)
                if [[ -z "${2:-}" ]]; then
                    echo "Error: --epic requires an epic ID argument" >&2
                    exit "$EXIT_FAILURE"
                fi
                EXPLICIT_EPIC_ID="$2"
                shift 2
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

# Detect whether epic uses spec-kit workflow or generic task workflow
# Returns "spec-kit" if any [sp:NN-*] phase tasks exist, "generic" otherwise
detect_task_source() {
    local epic_id="$1"
    local all_tasks phase_tasks phase_count

    log DEBUG "Detecting task source mode for epic $epic_id..."

    # Query all tasks under the epic
    all_tasks=$(npx bd list --parent "$epic_id" --all --json 2>/dev/null) || {
        log DEBUG "Failed to query tasks, defaulting to generic mode"
        echo "generic"
        return 0
    }

    # Search for sp:NN- pattern in task titles
    phase_tasks=$(echo "$all_tasks" | jq '[.[] | select(.title | test("\\[sp:[0-9]{2}-"))]' 2>/dev/null) || {
        log DEBUG "Failed to parse tasks, defaulting to generic mode"
        echo "generic"
        return 0
    }

    phase_count=$(echo "$phase_tasks" | jq 'length' 2>/dev/null || echo "0")

    if [[ "$phase_count" -gt 0 ]]; then
        log INFO "Detected spec-kit workflow mode ($phase_count phase task(s) found)"
        echo "spec-kit"
    else
        log INFO "Detected generic task workflow mode (no sp:* phase tasks found)"
        echo "generic"
    fi

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
        log DEBUG "No clarify task found for epic $epic_id"
        return 2
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
        log DEBUG "No tasks phase found for epic $epic_id"
        return 2
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
    local task_source clarify_result tasks_result all_tasks task_count

    log INFO "Validating prerequisites..."
    log_section "PREREQUISITE VALIDATION"

    # Always check infrastructure
    check_claude_cli || return 1
    check_beads_init || return 1

    # Detect task source mode
    task_source=$(detect_task_source "$epic_id")

    if [[ "$task_source" == "spec-kit" ]]; then
        log INFO "Validating spec-kit workflow prerequisites..."

        # Check clarify phase
        clarify_result=0
        check_clarify_complete "$epic_id" || clarify_result=$?

        if [[ "$clarify_result" -eq 1 ]]; then
            log ERROR "Clarify phase not complete"
            echo "" >&2
            echo "Ralph automates phases 03-09 only. Before running ralph.sh:" >&2
            echo "  1. Run '/sp:01-specify' to create the feature specification" >&2
            echo "  2. Run '/sp:02-clarify' to clarify requirements" >&2
            echo "" >&2
            echo "Once clarify is complete, ralph.sh can automate the rest." >&2
            return 1
        fi

        # Check tasks generation phase
        tasks_result=0
        check_tasks_generated "$epic_id" || tasks_result=$?

        if [[ "$tasks_result" -eq 1 ]]; then
            log ERROR "Task generation not complete"
            echo "" >&2
            echo "The task suite has not been generated yet. Run these phases first:" >&2
            echo "  1. '/sp:03-plan' to create the implementation plan" >&2
            echo "  2. '/sp:04-checklist' to generate the checklist" >&2
            echo "  3. '/sp:05-tasks' to generate beads tasks" >&2
            echo "" >&2
            echo "Once tasks are generated, ralph.sh can automate implementation." >&2
            return 1
        fi

        log INFO "Spec-kit workflow prerequisites satisfied"
    else
        log INFO "Validating generic task workflow prerequisites..."

        # For generic mode, just verify epic has at least one task
        all_tasks=$(npx bd list --parent "$epic_id" --json 2>/dev/null) || {
            log ERROR "Failed to query tasks for epic $epic_id"
            return 1
        }

        # Exclude the epic itself and event tasks
        task_count=$(echo "$all_tasks" | jq '[.[] | select(.id != "'"$epic_id"'" and .issue_type != "event")] | length' 2>/dev/null || echo "0")

        if [[ "$task_count" -eq 0 ]]; then
            log ERROR "The epic has no tasks to process"
            echo "" >&2
            echo "[ralph] ERROR: Epic $epic_id has no tasks." >&2
            echo "" >&2
            echo "Please create tasks under this epic before running ralph." >&2
            return 1
        fi

        log INFO "Generic task workflow prerequisites satisfied ($task_count task(s) found)"
    fi

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
    # Normalize hyphens to spaces so "linemark-mvp" matches "Linemark MVP"
    local epic_id
    epic_id=$(echo "$epics_json" | jq -r --arg name "$feature_name" \
        '.[] | select(.title | ascii_downcase | gsub("-"; " ") | contains($name | ascii_downcase | gsub("-"; " "))) | .id' | head -n1)

    if [[ -z "$epic_id" ]]; then
        echo "Error: No epic found matching feature '$feature_name'" >&2
        return 1
    fi

    echo "$epic_id"
}

# Validate that an epic exists and is open
# Arguments: epic_id
# Returns: 0 if valid and open, 1 if not found/closed
validate_epic_exists() {
    local epic_id="$1"
    local epic_data status

    log DEBUG "Validating epic: $epic_id"

    # Query beads for this epic ID
    epic_data=$(npx bd list --type epic --json 2>/dev/null | \
        jq -r --arg id "$epic_id" '.[] | select(.id == $id)') || {
        log ERROR "Failed to query beads for epics"
        return 1
    }

    if [[ -z "$epic_data" ]]; then
        log ERROR "Epic not found: $epic_id"
        echo "Error: Epic '$epic_id' not found in beads" >&2
        return 1
    fi

    # Check if epic is open
    status=$(echo "$epic_data" | jq -r '.status // "unknown"')

    if [[ "$status" != "open" ]]; then
        log ERROR "Epic is not open: $epic_id (status: $status)"
        echo "Error: Epic '$epic_id' is not open (status: $status)" >&2
        return 1
    fi

    log DEBUG "Epic validated successfully: $epic_id (status: $status)"
    return 0
}

# Detect epic from explicit argument or current branch
# If EXPLICIT_EPIC_ID is set, validate and return it
# Otherwise, fall back to branch-based detection
detect_epic() {
    local epic_id

    # If --epic argument was provided, use and validate it
    if [[ -n "$EXPLICIT_EPIC_ID" ]]; then
        log DEBUG "Using explicit epic ID: $EXPLICIT_EPIC_ID"

        if ! validate_epic_exists "$EXPLICIT_EPIC_ID"; then
            return 1
        fi

        echo "$EXPLICIT_EPIC_ID"
        return 0
    fi

    # Fall back to branch-based detection
    log DEBUG "Detecting epic from current branch..."

    local branch feature_name

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

    in_progress_json=$(npx bd list --status=in_progress --json 2>/dev/null | \
        jq --arg prefix "$epic_id." '[.[] | select(.id | startswith($prefix))]') || {
        echo "Error: Failed to query beads for in-progress tasks" >&2
        return 1
    }

    # Filter out the epic itself and event tasks
    echo "$in_progress_json" | jq --arg epic "$epic_id" \
        '[.[] | select(.id != $epic and .issue_type != "event")]'
}

# Check if a task has any active (open or in-progress) children
task_has_active_children() {
    local task_id="$1"
    local open_count in_progress_count

    open_count=$(npx bd list --status=open --parent "$task_id" --json 2>/dev/null | \
        jq '[.[] | select(.issue_type != "event")] | length' 2>/dev/null || echo "0")
    in_progress_count=$(npx bd list --status=in_progress --parent "$task_id" --json 2>/dev/null | \
        jq '[.[] | select(.issue_type != "event")] | length' 2>/dev/null || echo "0")

    [[ "$((open_count + in_progress_count))" -gt 0 ]]
}

# Check if a task has children (is a parent container)
task_has_children() {
    local task_id="$1"
    local child_count
    child_count=$(npx bd list --parent "$task_id" --limit 1 --json 2>/dev/null | jq 'length' 2>/dev/null) || return 1
    [[ "$child_count" -gt 0 ]]
}

# Check if all direct children of a task are closed
all_children_closed() {
    local task_id="$1"
    local non_closed_count
    non_closed_count=$(npx bd list --parent "$task_id" --json 2>/dev/null | \
        jq '[.[] | select(.status != "closed")] | length' 2>/dev/null) || return 1
    [[ "$non_closed_count" -eq 0 ]]
}

# Auto-close parent container tasks when all their children are completed.
# Walks up from the given task ID, closing ancestors bottom-up.
auto_close_completed_parents() {
    local task_id="$1"
    local epic_id="$2"
    local current_id="$task_id"

    while true; do
        # Remove last ID segment to get parent
        local parent_id="${current_id%.*}"

        # Stop if we can't go higher or reached the epic
        [[ "$parent_id" == "$current_id" ]] && break
        [[ "$parent_id" == "$epic_id" ]] && break

        # Check if parent has children and all are closed
        if task_has_children "$parent_id" && all_children_closed "$parent_id"; then
            log INFO "Auto-closing completed parent task: $parent_id"
            npx bd close "$parent_id" 2>/dev/null || {
                log WARN "Failed to auto-close parent task: $parent_id"
                break
            }
        else
            break  # If this parent can't close, no ancestor can either
        fi

        current_id="$parent_id"
    done
}

# Sweep all open tasks under the epic, closing any parent-container tasks
# whose children are all closed. Handles cases where auto_close_completed_parents
# missed stale parents (it only walks one branch of the tree).
sweep_completed_parents() {
    local epic_id="$1"
    local closed_any=false
    local open_tasks

    open_tasks=$(npx bd list --status open --json 2>/dev/null | \
        jq --arg prefix "$epic_id." --arg epic "$epic_id" \
        '[.[] | select(.id | startswith($prefix)) | select(.id != $epic and .issue_type != "event")]') || return 1

    local task_count
    task_count=$(echo "$open_tasks" | jq 'length')
    [[ "$task_count" -eq 0 ]] && return 1

    local task_id
    while read -r task_id; do
        if task_has_children "$task_id" && all_children_closed "$task_id"; then
            log INFO "Sweep: auto-closing completed parent: $task_id"
            if npx bd close "$task_id" 2>/dev/null; then
                closed_any=true
            fi
        fi
    done < <(echo "$open_tasks" | jq -r '.[].id')

    [[ "$closed_any" == "true" ]]
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

# Check if a task has children (is a parent container)
task_has_children() {
    local task_id="$1"
    local child_count
    child_count=$(npx bd list --parent "$task_id" --limit 1 --json 2>/dev/null | jq 'length' 2>/dev/null) || return 1
    [[ "$child_count" -gt 0 ]]
}

# Check if all direct children of a task are closed
all_children_closed() {
    local task_id="$1"
    local open_count
    open_count=$(npx bd list --parent "$task_id" --status open --json 2>/dev/null | jq 'length' 2>/dev/null) || return 1
    [[ "$open_count" -eq 0 ]]
}

# Auto-close parent container tasks when all their children are completed.
# Walks up from the given task ID, closing ancestors bottom-up.
auto_close_completed_parents() {
    local task_id="$1"
    local epic_id="$2"
    local current_id="$task_id"

    while true; do
        # Remove last ID segment to get parent
        local parent_id="${current_id%.*}"

        # Stop if we can't go higher or reached the epic
        [[ "$parent_id" == "$current_id" ]] && break
        [[ "$parent_id" == "$epic_id" ]] && break

        # Check if parent has children and all are closed
        if task_has_children "$parent_id" && all_children_closed "$parent_id"; then
            log INFO "Auto-closing completed parent task: $parent_id"
            npx bd close "$parent_id" 2>/dev/null || {
                log WARN "Failed to auto-close parent task: $parent_id"
                break
            }
        else
            break  # If this parent can't close, no ancestor can either
        fi

        current_id="$parent_id"
    done
}

# Get ready tasks for the epic (returns JSON array)
get_ready_tasks() {
    local epic_id="$1"
    local ready_json

    ready_json=$(npx bd ready --limit 1000 --json 2>/dev/null | \
        jq --arg prefix "$epic_id." '[.[] | select(.id | startswith($prefix))]') || {
        echo "Error: Failed to query beads for ready tasks" >&2
        return 1
    }

    # Filter out the epic itself and event tasks
    local filtered
    filtered=$(echo "$ready_json" | jq --arg epic "$epic_id" \
        '[.[] | select(.id != $epic and .issue_type != "event")]')

    # Filter out parent container tasks (tasks that have children).
    # Parent tasks are not work items; ralph processes their children individually.
    local leaf_ids=()
    local task_id
    while IFS= read -r task_id; do
        [[ -z "$task_id" ]] && continue
        if task_has_children "$task_id"; then
            log DEBUG "Skipping parent container task: $task_id"
        else
            leaf_ids+=("$task_id")
        fi
    done < <(echo "$filtered" | jq -r '.[].id')

    if [[ ${#leaf_ids[@]} -eq 0 ]]; then
        echo "[]"
        return 0
    fi

    # Rebuild JSON array with only leaf tasks
    local id_array
    id_array=$(printf '"%s",' "${leaf_ids[@]}")
    id_array="[${id_array%,}]"

    echo "$filtered" | jq --argjson ids "$id_array" \
        '[.[] | select(.id | IN($ids[]))]'
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

# Find the deepest workable leaf task under the given parent.
# Drills down through parent tasks that have active children, returning
# only tasks that can be directly worked on (no pending child tasks).
# Outputs the task JSON object on stdout. Returns 1 if no task found.
find_leaf_task() {
    local parent_id="$1"

    # First: check for in-progress tasks at this level (prefer resuming)
    local in_progress_json
    in_progress_json=$(npx bd list --status=in_progress --parent "$parent_id" --json 2>/dev/null | \
        jq --arg p "$parent_id" '[.[] | select(.id != $p and .issue_type != "event")]')

    local count
    count=$(echo "$in_progress_json" | jq 'length')
    if [[ "$count" -gt 0 ]]; then
        local task_id
        task_id=$(echo "$in_progress_json" | jq -r '.[0].id')
        if task_has_active_children "$task_id"; then
            # Try to find a leaf among children; fall back to returning this task
            if ! find_leaf_task "$task_id"; then
                echo "$in_progress_json" | jq '.[0]'
            fi
            return 0
        else
            echo "$in_progress_json" | jq '.[0]'
            return 0
        fi
    fi

    # Second: check for ready tasks at this level
    local ready_json
    ready_json=$(npx bd ready --parent "$parent_id" --limit 1000 --json 2>/dev/null | \
        jq --arg p "$parent_id" '[.[] | select(.id != $p and .issue_type != "event")]')

    count=$(echo "$ready_json" | jq 'length')
    if [[ "$count" -gt 0 ]]; then
        local task_id
        task_id=$(echo "$ready_json" | jq -r '.[0].id')
        if task_has_active_children "$task_id"; then
            # Try to find a leaf among children; fall back to returning this task
            if ! find_leaf_task "$task_id"; then
                echo "$ready_json" | jq '.[0]'
            fi
            return 0
        else
            echo "$ready_json" | jq '.[0]'
            return 0
        fi
    fi

    # Safety net: orphaned prerequisites not in the epic hierarchy
    # Only fires at the top level (parent_id == EPIC_ID) to avoid infinite recursion,
    # and only when the epic still has open tasks (meaning something is blocking progress,
    # not that the epic is simply complete).
    if [[ "$parent_id" == "$EPIC_ID" ]] && has_open_tasks "$EPIC_ID"; then
        local orphan_ready
        orphan_ready=$(npx bd ready --json 2>/dev/null | \
            jq --arg p "$EPIC_ID" \
               '[.[] | select(.id != $p and .issue_type != "event" and ((.priority // 4) | tonumber) <= 2)]')
        local orphan_count
        orphan_count=$(echo "$orphan_ready" | jq 'length')
        if [[ "$orphan_count" -gt 0 ]]; then
            log_warn "Found $orphan_count globally-ready task(s) outside epic — likely orphaned prerequisites"
            echo "$orphan_ready" | jq '.[0]'
            return 0
        fi
    fi

    # No workable tasks found
    return 1
}

# Get all open tasks for the epic (returns JSON array)
get_open_tasks() {
    local epic_id="$1"
    local open_json

    open_json=$(npx bd list --status open --json 2>/dev/null | \
        jq --arg prefix "$epic_id." '[.[] | select(.id | startswith($prefix))]') || {
        echo "Error: Failed to query beads for open tasks" >&2
        return 1
    }

    # Filter out the epic itself and event tasks
    echo "$open_json" | jq --arg epic "$epic_id" \
        '[.[] | select(.id != $epic and .issue_type != "event")]'
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

    # Fetch parent US story constraints if this is a sub-task
    local parent_constraints=""
    local parent_id="${task_id%.*}"
    if [[ "$parent_id" != "$task_id" ]]; then
        local parent_desc
        parent_desc=$(npx bd show "$parent_id" --json 2>/dev/null | \
            jq -r '(if type == "array" then .[0] else . end) | .description // ""')
        # Extract the ## Implementation Constraints section
        parent_constraints=$(echo "$parent_desc" | awk \
            '/^## Implementation Constraints/{found=1; next} found && /^## /{exit} found{print}')
        # Discard if it's only the auto-generated placeholder line
        if echo "$parent_constraints" | grep -qE '^\s*_\(Review findings'; then
            parent_constraints=""
        fi
    fi

    # Start with base prompt (no /sp:next — ralph already resolved the task)
    cat <<EOF
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

    # Add parent US story constraints if this task is a sub-task
    if [[ -n "$parent_constraints" ]]; then
        cat <<EOF

## Parent US Story — Implementation Constraints
These constraints must be applied when implementing this task. Do NOT implement the code first and fix it later — apply them from the start:
$parent_constraints
EOF
    fi

    cat <<EOF

## Task Focus
Complete ONLY this task described above.
Do NOT explore unrelated code or work on other tasks.
Before searching for a spec or existing feature, check specs/readme.md first.

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
Run: npx vitest run src/
EOF
    fi

    # Always add commit instructions
    cat <<EOF

## After Task Completion - COMMITTING IS MANDATORY

YOU MUST COMMIT YOUR WORK. This is NON-NEGOTIABLE.

### Why Committing Is Critical

Without a successful commit:
- Your work will be LOST if the next task modifies the same files
- Ralph will repeat this task thinking it wasn't completed
- The .beads state won't be saved, causing task tracking failures
- Pre-commit hooks won't validate your changes

### Exact Commit Sequence (REQUIRED)

1. **Close bead FIRST**: \`npx bd close $task_id\`
   - This updates .beads state which MUST be included in the commit
   - Marks task as complete in beads tracking

2. **Commit ALL changes**: Run \`/commit\` skill
   - Stages ALL modified files (.beads state + your code changes)
   - Creates conventional commit message
   - Runs pre-commit hooks (prettier, ESLint, type-check, tests)
   - **PRE-COMMIT HOOKS MUST PASS - NO EXCEPTIONS**

3. **If pre-commit hooks FAIL**:
   - READ the error message carefully
   - FIX the issues (formatting, linting, type errors, test failures)
   - Run \`/commit\` again
   - REPEAT until commit succeeds

4. **Verify commit succeeded**:
   - You should see "committed successfully" message
   - If not, the task is NOT complete - keep fixing and retrying

### Critical Rules

✅ REQUIRED:
- Create a commit for EVERY completed task
- Fix ALL pre-commit hook failures
- Include .beads state changes in commit
- Verify commit succeeded before moving on

❌ FORBIDDEN:
- Skipping commit after completing task
- Using --no-verify, --no-hooks, or similar flags
- Leaving task closed but changes uncommitted
- Moving to next iteration without successful commit

### Success Criteria

The task is ONLY complete when:
1. ✓ Bead is closed (\`npx bd close $task_id\`)
2. ✓ All changes are committed (including .beads/)
3. ✓ Pre-commit hooks passed (100% tests, no lint errors, type-check passed)
4. ✓ Commit succeeded (you saw success message)

If ANY of these are false, the task is INCOMPLETE - keep working until all pass.

Ralph will create a series of commits across iterations.
Ralph pushes to the remote after each commit for durability.
EOF
}


##############################################################################
# ATDD: Acceptance Test-Driven Development infrastructure
##############################################################################

# Read a skill's SKILL.md content
# Usage: load_skill_content skill_name
# Returns: the content of .claude/skills/<skill_name>/SKILL.md, or empty string
load_skill_content() {
    local skill_name="$1"
    local skill_path=".claude/skills/${skill_name}/SKILL.md"
    if [[ -f "$skill_path" ]]; then
        cat "$skill_path"
    else
        echo ""
    fi
}

# Find the spec file for a task whose title contains US<N>
# Usage: find_spec_for_task task_json
# Returns: path to the spec file, or empty string if not found
find_spec_for_task() {
    local task_json="$1"
    local task_title
    task_title=$(echo "$task_json" | jq -r '.title // ""')

    # Extract US<N> from title (e.g. "US03: View the list" → "US03")
    local us_number
    us_number=$(echo "$task_title" | grep -oE 'US[0-9]+' | head -1)
    if [[ -z "$us_number" ]]; then
        echo ""
        return
    fi

    # Find matching spec file in specs/acceptance-specs/
    local spec_file
    spec_file=$(find specs/acceptance-specs -name "${us_number}-*.txt" 2>/dev/null | head -1)
    echo "$spec_file"
}

# Run the acceptance pipeline and check if tests pass
# Usage: run_acceptance_check spec_file
# Returns: 0 if tests pass, 1 if tests fail
run_acceptance_check() {
    local spec_file="$1"
    log DEBUG "Running acceptance check for spec: $spec_file"

    # Parse and generate for this spec only (full pipeline)
    if npx tsx acceptance/pipeline.ts --action=run >> "$LOG_FILE" 2>&1; then
        log INFO "Acceptance tests PASSED"
        return 0
    else
        log INFO "Acceptance tests did not pass yet"
        return 1
    fi
}

# Check that baseline unit tests (src/) still pass
# Usage: check_baseline_tests
# Returns: 0 if tests pass, 1 otherwise
check_baseline_tests() {
    log DEBUG "Running baseline unit tests..."
    if npx vitest run src/ >> "$LOG_FILE" 2>&1; then
        log INFO "Baseline tests PASSED"
        return 0
    else
        log WARN "Baseline tests FAILED"
        return 1
    fi
}

# Attempt to fix baseline test failures by invoking Claude
# Usage: attempt_baseline_fix task_json cycle
# Returns: 0 if fixed, 1 otherwise
attempt_baseline_fix() {
    local task_json="$1"
    local cycle="$2"
    local task_id
    task_id=$(echo "$task_json" | jq -r '.id // "unknown"')

    log INFO "Attempting baseline fix (cycle $cycle)"

    local fix_prompt
    fix_prompt=$(cat <<PROMPT
## Fix Failing Baseline Tests

You are in ralph's ATDD automation loop.
Task: $(echo "$task_json" | jq -r '.title // "unknown"') ($task_id)
ATDD Inner Cycle: $cycle

The baseline unit tests in src/ are now failing after your last change.
This is a regression — fix it before continuing.

## Your Task

1. Run: npx vitest run src/
2. Read the failure output carefully
3. Fix the failing tests (write code, not just test changes)
4. Run npx vitest run src/ again to confirm all pass
5. Do NOT close the bead — this is a fix step, not task completion

## Rules
- Fix actual code bugs, not just tests
- Maintain 100% coverage
- Do NOT touch generated-acceptance-tests/
PROMPT
)
    invoke_claude_with_retry "$fix_prompt"
}

# Generate the BIND step prompt
# Usage: generate_bind_prompt task_json cycle spec_file retry_context
generate_bind_prompt() {
    local task_json="$1"
    local cycle="$2"
    local spec_file="$3"
    local retry_context="$4"

    local task_title task_id task_description
    task_title=$(echo "$task_json" | jq -r '.title // "unknown"')
    task_id=$(echo "$task_json" | jq -r '.id // "unknown"')
    task_description=$(echo "$task_json" | jq -r '.description // ""')

    local acceptance_skill
    acceptance_skill=$(load_skill_content "acceptance-tests")

    cat <<PROMPT
## ATDD BIND Step

You are in ralph's ATDD automation loop.
Task: $task_title ($task_id)
ATDD Cycle: $cycle

### Spec File
$spec_file

Read the spec file content, then bind the generated acceptance test stubs.

### Instructions

1. Read the spec file: cat $spec_file

2. Run the acceptance pipeline to generate stubs:
   npx tsx acceptance/pipeline.ts --action=run

3. Read the generated stub file in generated-acceptance-tests/
   (its name matches the spec file's US<N>-* prefix)

4. For each stub that contains:
   throw new Error("acceptance test not yet bound")
   
   Replace the entire it() block body with real SELF.fetch() test code:
   
   Pattern:
   \`\`\`typescript
   it("Scenario description.", async () => {
     // GIVEN setup — use env.DB.exec(...) for D1 state, or other setup
     
     // WHEN action — use SELF.fetch(new Request("https://example.com/..."))
     const res = await SELF.fetch(new Request("https://example.com/api/..."));
     
     // THEN assertions — assert on HTTP response
     expect(res.status).toBe(200);
     const body = await res.json() as { ... };
     expect(body...).toBe(...);
   });
   \`\`\`

5. Bind all stubs. Do NOT run the tests yet (they will fail — that's expected).

6. Do NOT close the bead — binding is not task completion.

${retry_context:+### Retry Context
$retry_context
}
### Acceptance Tests Skill Reference
$acceptance_skill

### Task Description
$task_description

IMPORTANT: As your very last line of output, you MUST emit a structured signal.
If all stubs were already bound (no unbound stubs found), output:
RALPH_SIGNAL:{"already_bound":true,"stubs_modified":0}
If you bound N stubs, output:
RALPH_SIGNAL:{"already_bound":false,"stubs_modified":N}
replacing N with the actual number. This line must appear exactly once, as your final line.
PROMPT
}

# Generate a TDD step prompt (RED, GREEN, REFACTOR, or REVIEW)
# Usage: generate_tdd_step_prompt step task_json cycle remaining_items retry_context
generate_tdd_step_prompt() {
    local step="$1"
    local task_json="$2"
    local cycle="$3"
    local remaining_items="$4"
    local retry_context="$5"
    local prev_step_output="${6:-}"

    local task_title task_id task_description
    task_title=$(echo "$task_json" | jq -r '.title // "unknown"')
    task_id=$(echo "$task_json" | jq -r '.id // "unknown"')
    task_description=$(echo "$task_json" | jq -r '.description // ""')

    case "$step" in
        "$STEP_RED")
            cat <<PROMPT
## ATDD Inner Cycle — RED Step

You are in ralph's ATDD automation loop.
Task: $task_title ($task_id)
ATDD Inner Cycle: $cycle

${remaining_items:+### Remaining Acceptance Items
$remaining_items
}
### Instructions

Write the SMALLEST failing unit test that moves toward passing the acceptance tests.

1. Identify the next smallest piece of functionality needed
2. Write ONE failing unit test in the appropriate src/**/*.spec.ts file
3. Run: npx vitest run src/
4. Confirm the new test fails (RED) and existing tests still pass
5. Do NOT write implementation code yet
6. Do NOT close the bead

${retry_context:+### Retry Context
$retry_context
}
### Task Description
$task_description

IMPORTANT: As your very last line of output, you MUST emit a structured signal.
If the feature is fully implemented and you cannot write a meaningful failing test, output:
RALPH_SIGNAL:{"already_implemented":true,"test_written":false}
If you wrote a new failing test, output:
RALPH_SIGNAL:{"already_implemented":false,"test_written":true}
This line must appear exactly once, as your final line.
PROMPT
            ;;
        "$STEP_GREEN")
            cat <<PROMPT
## ATDD Inner Cycle — GREEN Step

You are in ralph's ATDD automation loop.
Task: $task_title ($task_id)
ATDD Inner Cycle: $cycle

${prev_step_output:+### Previous Step Output
$prev_step_output
}
### Instructions

Write MINIMAL code to make the failing test pass.

1. Write just enough code to make the failing unit test pass
2. Run: npx vitest run src/
3. All tests should now pass (GREEN)
4. Coverage must remain at 100%
5. Do NOT refactor yet
6. Do NOT close the bead

${retry_context:+### Retry Context
$retry_context
}
### Task Description
$task_description

IMPORTANT: As your very last line of output, you MUST emit a structured signal.
If all tests pass after your changes, output:
RALPH_SIGNAL:{"tests_passing":true}
If tests are still failing, output:
RALPH_SIGNAL:{"tests_passing":false}
This line must appear exactly once, as your final line.
PROMPT
            ;;
        "$STEP_REFACTOR")
            cat <<PROMPT
## ATDD Inner Cycle — REFACTOR Step

You are in ralph's ATDD automation loop.
Task: $task_title ($task_id)
ATDD Inner Cycle: $cycle

${prev_step_output:+### Previous Step Output
$prev_step_output
}
### Instructions

Improve the code without changing behavior.

1. Look for duplication, unclear names, missing abstractions
2. Apply refactoring while keeping all tests GREEN
3. Run: npx vitest run src/
4. All tests should still pass after refactoring
5. Coverage must remain at 100%
6. Do NOT close the bead — acceptance tests may not pass yet

${retry_context:+### Retry Context
$retry_context
}
### Task Description
$task_description

IMPORTANT: As your very last line of output, you MUST emit a structured signal.
If all tests pass after your changes, output:
RALPH_SIGNAL:{"tests_passing":true}
If tests are still failing, output:
RALPH_SIGNAL:{"tests_passing":false}
This line must appear exactly once, as your final line.
PROMPT
            ;;
        "$STEP_REVIEW")
            cat <<PROMPT
## ATDD Inner Cycle — REVIEW Step

You are in ralph's ATDD automation loop.
Task: $task_title ($task_id)
ATDD Inner Cycle: $cycle

${prev_step_output:+### Previous Step Output
$prev_step_output
}
### Instructions

Review the work done so far in this inner cycle.

1. Run: npx vitest run src/
2. Check: does the implementation look complete for this cycle's goal?
3. Check: are there obvious improvements needed before the next cycle?
4. Apply any small improvements
5. Do NOT close the bead

${retry_context:+### Retry Context
$retry_context
}
### Task Description
$task_description

IMPORTANT: As your very last line of output, you MUST emit a structured signal.
If all tests pass after your changes, output:
RALPH_SIGNAL:{"tests_passing":true}
If tests are still failing, output:
RALPH_SIGNAL:{"tests_passing":false}
This line must appear exactly once, as your final line.
PROMPT
            ;;
    esac
}

# Execute one TDD step with retries
# Usage: execute_tdd_step step task_json cycle remaining_items spec_file [prev_step_output]
# Returns: 0 on success, 1 on failure
execute_tdd_step() {
    local step="$1"
    local task_json="$2"
    local cycle="$3"
    local remaining_items="$4"
    local spec_file="$5"
    local prev_step_output="${6:-}"
    local retry_count=0
    local retry_context=""
    local red_no_fail_count=0

    log INFO "Executing TDD step: $step (cycle $cycle)"

    while (( retry_count < TDD_STEP_RETRIES )); do
        retry_count=$((retry_count + 1))
        log DEBUG "TDD step $step attempt $retry_count/$TDD_STEP_RETRIES"

        local prompt
        if [[ "$step" == "$STEP_BIND" ]]; then
            prompt=$(generate_bind_prompt "$task_json" "$cycle" "$spec_file" "$retry_context")
        else
            prompt=$(generate_tdd_step_prompt "$step" "$task_json" "$cycle" "$remaining_items" "$retry_context" "$prev_step_output")
        fi

        if ! invoke_claude_with_retry "$prompt"; then
            log WARN "Claude invocation failed for step $step attempt $retry_count"
            retry_context="Previous attempt failed due to Claude invocation error."
            local backoff=$(( TDD_STEP_RETRY_BASE_DELAY * (2 ** (retry_count - 1)) ))
            (( backoff > TDD_STEP_RETRY_MAX_DELAY )) && backoff=$TDD_STEP_RETRY_MAX_DELAY
            log DEBUG "Backing off ${backoff}s before retry"
            sleep "$backoff"
            continue
        fi

        # After BIND, skip test verification (tests are expected to fail)
        if [[ "$step" == "$STEP_BIND" ]]; then
            local already_bound
            already_bound=$(get_signal "already_bound" "false")
            if [[ "$already_bound" == "true" ]]; then
                log INFO "BIND step: Claude signals all stubs already bound"
            fi
            log INFO "BIND step complete — tests expected to fail at this point"
            LAST_STEP_OUTPUT="$LAST_CLAUDE_OUTPUT"
            return 0
        fi

        # After RED, confirm at least one test is failing (that's the goal)
        if [[ "$step" == "$STEP_RED" ]]; then
            # Check structured signal FIRST
            local already_implemented
            already_implemented=$(get_signal "already_implemented" "false")
            if [[ "$already_implemented" == "true" ]]; then
                log WARN "RED step: Claude signals feature already implemented"
                return 2  # Circuit breaker on FIRST attempt
            fi

            # Existing test-based verification as fallback
            if ! check_baseline_tests; then
                log INFO "RED step complete — new failing test confirmed"
                LAST_STEP_OUTPUT="$LAST_CLAUDE_OUTPUT"
                return 0
            fi
            red_no_fail_count=$((red_no_fail_count + 1))
            if (( red_no_fail_count >= 2 )); then
                log WARN "RED circuit-breaker: all tests passed on $red_no_fail_count consecutive attempts — feature may already be implemented"
                return 2
            fi
            log WARN "RED step produced no failing test (attempt $retry_count/$TDD_STEP_RETRIES), retrying..."
            retry_context="After the RED step, all tests passed. Write a test that fails for the right reason."
            continue
        fi

        # After GREEN/REFACTOR/REVIEW, verify all tests pass
        if check_baseline_tests; then
            log INFO "TDD step $step completed successfully"
            LAST_STEP_OUTPUT="$LAST_CLAUDE_OUTPUT"
            return 0
        else
            log WARN "Baseline tests failing after $step step (attempt $retry_count/$TDD_STEP_RETRIES), retrying..."
            retry_context="After the $step step, baseline tests are still failing. Fix the issues."
        fi
    done

    log ERROR "TDD step $step failed after $TDD_STEP_RETRIES retries"
    return 1
}

# Execute the unit TDD cycle only (no acceptance wrapper)
# Used as fallback when no spec file exists for a task
# Usage: execute_unit_tdd_cycle task_json epic_id
execute_unit_tdd_cycle() {
    local task_json="$1"
    local epic_id="$2"
    local task_id task_title
    task_id=$(echo "$task_json" | jq -r '.id // "unknown"')
    task_title=$(echo "$task_json" | jq -r '.title // "task"')

    log INFO "Executing unit TDD cycle for task $task_id (no spec found)"

    for (( cycle=1; cycle <= TDD_MAX_CYCLES; cycle++ )); do
        log INFO "Unit TDD cycle $cycle/$TDD_MAX_CYCLES"

        # RED step with circuit-breaker handling (no previous output — RED starts fresh)
        local red_exit=0
        execute_tdd_step "$STEP_RED" "$task_json" "$cycle" "" "" "" || red_exit=$?
        local prev_output="${LAST_STEP_OUTPUT:0:2000}"
        if (( red_exit == 2 )); then
            log WARN "RED circuit-breaker: all unit tests pass and no spec to check — closing task as complete"
            npx bd comment "$task_id" "Circuit-breaker: all unit tests pass and no failing test could be written after 2 consecutive attempts. Feature appears complete." 2>/dev/null || true
            npx bd close "$task_id" 2>/dev/null || true
            return 0
        elif (( red_exit != 0 )); then
            log ERROR "TDD step $STEP_RED failed in unit cycle $cycle"
            npx bd comment "$task_id" "BLOCKED: TDD step $STEP_RED failed after retries in unit cycle $cycle" 2>/dev/null || true
            return 1
        fi

        # GREEN step with fallback commit check (receives RED output)
        local head_before
        head_before=$(git rev-parse HEAD 2>/dev/null)
        if ! execute_tdd_step "$STEP_GREEN" "$task_json" "$cycle" "" "" "$prev_output"; then
            log ERROR "TDD step $STEP_GREEN failed in unit cycle $cycle"
            npx bd comment "$task_id" "BLOCKED: TDD step $STEP_GREEN failed after retries in unit cycle $cycle" 2>/dev/null || true
            return 1
        fi
        prev_output="${LAST_STEP_OUTPUT:0:2000}"
        local head_after
        head_after=$(git rev-parse HEAD 2>/dev/null)
        if [[ "$head_before" == "$head_after" ]]; then
            log WARN "GREEN step did not commit - invoking /commit skill as fallback"
            local fallback_commit_prompt
            fallback_commit_prompt=$(cat <<PROMPT
/commit

## Context
GREEN step completed for task: $task_title
Unit TDD cycle: $cycle

### Previous step output (GREEN)
${prev_output:-(no output captured)}

## Instructions
Stage and commit all changes from the GREEN step. Include .beads state if changed.
PROMPT
)
            if ! invoke_claude_with_retry "$fallback_commit_prompt"; then
                log WARN "Fallback /commit skill failed — attempting raw commit"
                git add -A 2>/dev/null || true
                git commit -m "feat: implement $task_title (GREEN step - fallback commit)

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>" 2>/dev/null || {
                    log WARN "Raw fallback commit also failed (possibly no changes)"
                }
            fi
        fi
        git push origin "$(git branch --show-current)" 2>/dev/null || log WARN "Push failed - will retry on next commit"

        # REFACTOR step (receives GREEN output)
        if ! execute_tdd_step "$STEP_REFACTOR" "$task_json" "$cycle" "" "" "$prev_output"; then
            log ERROR "TDD step $STEP_REFACTOR failed in unit cycle $cycle"
            npx bd comment "$task_id" "BLOCKED: TDD step $STEP_REFACTOR failed after retries in unit cycle $cycle" 2>/dev/null || true
            return 1
        fi
        prev_output="${LAST_STEP_OUTPUT:0:2000}"

        # REVIEW step (receives REFACTOR output)
        if ! execute_tdd_step "$STEP_REVIEW" "$task_json" "$cycle" "" "" "$prev_output"; then
            log ERROR "TDD step $STEP_REVIEW failed in unit cycle $cycle"
            npx bd comment "$task_id" "BLOCKED: TDD step $STEP_REVIEW failed after retries in unit cycle $cycle" 2>/dev/null || true
            return 1
        fi

        # Check if task appears complete after REVIEW
        # Use generate_focused_prompt path as the decision maker — invoke /sp:next to close if done
        local check_prompt
        check_prompt=$(cat <<PROMPT
/sp:next

## Non-Interactive Mode
You are in ralph's automation loop. You CANNOT ask questions.

## Task
$(echo "$task_json" | jq -r '.title // "unknown"') ($(echo "$task_json" | jq -r '.id // "unknown"'))

## Check Completion

After $cycle unit TDD cycle(s), check if this task is complete:
1. Run: npx vitest run src/
2. Run: npx vitest run --coverage 2>&1 | tail -20
3. If all tests pass with 100% coverage AND the implementation satisfies the task description:
   - Close the bead: npx bd close $task_id
   - Run /commit
4. If NOT complete, add a comment explaining what remains: npx bd comment $task_id "Cycle $cycle complete. Remaining: ..."
   Do NOT close the bead.
PROMPT
)
        if invoke_claude_with_retry "$check_prompt"; then
            # Check if task was closed
            local task_status
            task_status=$(npx bd show "$task_id" --json 2>/dev/null | jq -r '(if type == "array" then .[0] else . end) | .status // "unknown"')
            if [[ "$task_status" == "completed" ]] || [[ "$task_status" == "closed" ]]; then
                log INFO "Task $task_id completed after $cycle unit TDD cycles"
                return 0
            fi
        fi
    done

    log WARN "Unit TDD cycle limit reached for task $task_id"
    npx bd comment "$task_id" "BLOCKED: Unit TDD cycle limit ($TDD_MAX_CYCLES) reached without task completion" 2>/dev/null || true
    return 1
}

# Execute the full ATDD cycle for a user story task
# Usage: execute_atdd_cycle task_json epic_id
execute_atdd_cycle() {
    local task_json="$1"
    local epic_id="$2"
    local task_id
    task_id=$(echo "$task_json" | jq -r '.id // "unknown"')

    log INFO "Starting ATDD cycle for task $task_id"
    log_section "ATDD CYCLE: $task_id"

    # Mark task as in-progress
    npx bd update "$task_id" --status=in_progress 2>/dev/null || true

    # Step 1: Find spec file
    local spec_file
    spec_file=$(find_spec_for_task "$task_json")

    if [[ -z "$spec_file" ]]; then
        log INFO "No spec file found for task $task_id — falling back to unit TDD cycle"
        execute_unit_tdd_cycle "$task_json" "$epic_id"
        return $?
    fi

    log INFO "Found spec file: $spec_file"

    # Step 2: Check if acceptance tests already pass
    if run_acceptance_check "$spec_file"; then
        log INFO "Acceptance tests already pass for $task_id — closing task"
        npx bd close "$task_id" 2>/dev/null || true
        # Invoke Claude to commit
        local commit_prompt
        commit_prompt=$(cat <<PROMPT
/commit

Commit message: feat: complete $(echo "$task_json" | jq -r '.title // "task"')

The acceptance tests for this user story already pass. Close the bead and commit.
- npx bd close $task_id (if not already closed)
- Run /commit
PROMPT
)
        invoke_claude_with_retry "$commit_prompt" || true
        return 0
    fi

    # Step 3: BIND step — write acceptance test implementations (no previous output)
    # Pre-flight check: skip BIND if stubs are already bound
    local stub_file
    stub_file=$(find generated-acceptance-tests/ -name "$(basename "$spec_file" .txt)*" -type f 2>/dev/null | head -1) || true
    if [[ -n "$stub_file" ]] && ! grep -q 'acceptance test not yet bound' "$stub_file" 2>/dev/null; then
        log INFO "Acceptance test stubs already bound — skipping BIND step"
    else
        if ! execute_tdd_step "$STEP_BIND" "$task_json" 1 "" "$spec_file" ""; then
            log ERROR "BIND step failed for task $task_id"
            npx bd comment "$task_id" "BLOCKED: BIND step failed" 2>/dev/null || true
            return 1
        fi
    fi

    # Step 4: Inner TDD loop
    for (( cycle=1; cycle <= ATDD_MAX_INNER_CYCLES; cycle++ )); do
        log INFO "ATDD inner cycle $cycle/$ATDD_MAX_INNER_CYCLES"

        # RED step with circuit-breaker handling (no previous output — RED starts fresh)
        local red_exit=0
        execute_tdd_step "$STEP_RED" "$task_json" "$cycle" "" "$spec_file" "" || red_exit=$?
        local prev_output="${LAST_STEP_OUTPUT:0:2000}"
        if (( red_exit == 2 )); then
            log WARN "RED circuit-breaker triggered in ATDD cycle $cycle — checking acceptance tests"
            if run_acceptance_check "$spec_file"; then
                log INFO "Feature complete — acceptance tests pass. Closing task $task_id"
                npx bd close "$task_id" 2>/dev/null || true
                local commit_prompt
                commit_prompt=$(cat <<PROMPT
/commit

Commit message: feat: complete $(echo "$task_json" | jq -r '.title // "task"')

The feature was already implemented. RED circuit-breaker detected all unit tests passing. Acceptance tests confirm feature complete.
- npx bd close $task_id (if not already closed)
- Run /commit
PROMPT
)
                invoke_claude_with_retry "$commit_prompt" || true
                return 0
            else
                log ERROR "RED circuit-breaker: unit tests pass but acceptance tests still fail — task needs human review"
                npx bd comment "$task_id" "BLOCKED: RED circuit-breaker triggered in cycle $cycle. All unit tests pass but no failing test could be written, AND acceptance tests still fail. Feature may be partially implemented. Needs human review." 2>/dev/null || true
                return 1
            fi
        elif (( red_exit != 0 )); then
            log ERROR "TDD step $STEP_RED failed in ATDD cycle $cycle for task $task_id"
            npx bd comment "$task_id" "BLOCKED: TDD step $STEP_RED failed in ATDD cycle $cycle" 2>/dev/null || true
            return 1
        fi

        # GREEN step with fallback commit check (receives RED output)
        local head_before
        head_before=$(git rev-parse HEAD 2>/dev/null)
        if ! execute_tdd_step "$STEP_GREEN" "$task_json" "$cycle" "" "$spec_file" "$prev_output"; then
            log ERROR "TDD step $STEP_GREEN failed in ATDD cycle $cycle for task $task_id"
            npx bd comment "$task_id" "BLOCKED: TDD step $STEP_GREEN failed in ATDD cycle $cycle" 2>/dev/null || true
            return 1
        fi
        prev_output="${LAST_STEP_OUTPUT:0:2000}"
        local head_after
        head_after=$(git rev-parse HEAD 2>/dev/null)
        if [[ "$head_before" == "$head_after" ]]; then
            log WARN "GREEN step did not commit - invoking /commit skill as fallback"
            local atdd_task_title
            atdd_task_title=$(echo "$task_json" | jq -r '.title // "task"')
            local fallback_commit_prompt
            fallback_commit_prompt=$(cat <<PROMPT
/commit

## Context
GREEN step completed for task: $atdd_task_title ($task_id)
ATDD inner cycle: $cycle

### Previous step output (GREEN)
${prev_output:-(no output captured)}

## Instructions
Stage and commit all changes from the GREEN step. Include .beads state if changed.
PROMPT
)
            if ! invoke_claude_with_retry "$fallback_commit_prompt"; then
                log WARN "Fallback /commit skill failed — attempting raw commit"
                git add -A 2>/dev/null || true
                git commit -m "feat: implement $atdd_task_title (GREEN step - fallback commit)

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>" 2>/dev/null || {
                    log WARN "Raw fallback commit also failed (possibly no changes)"
                }
            fi
        fi
        git push origin "$(git branch --show-current)" 2>/dev/null || log WARN "Push failed - will retry on next commit"

        # REFACTOR step (receives GREEN output)
        if ! execute_tdd_step "$STEP_REFACTOR" "$task_json" "$cycle" "" "$spec_file" "$prev_output"; then
            log ERROR "TDD step $STEP_REFACTOR failed in ATDD cycle $cycle for task $task_id"
            npx bd comment "$task_id" "BLOCKED: TDD step $STEP_REFACTOR failed in ATDD cycle $cycle" 2>/dev/null || true
            return 1
        fi

        # Check if acceptance tests now pass
        if run_acceptance_check "$spec_file"; then
            log INFO "Acceptance tests PASS after ATDD cycle $cycle — task $task_id complete"
            npx bd close "$task_id" 2>/dev/null || true
            # Commit
            local commit_prompt
            commit_prompt=$(cat <<PROMPT
/commit

Task complete: $(echo "$task_json" | jq -r '.title // "task"') ($task_id)

The acceptance tests now pass after $cycle ATDD inner cycle(s).

Steps:
1. npx bd close $task_id (if not already closed)
2. Run /commit to commit all changes including .beads state
PROMPT
)
            invoke_claude_with_retry "$commit_prompt" || true
            return 0
        fi

        log INFO "Acceptance tests still failing after cycle $cycle — continuing"
    done

    # All cycles exhausted
    log WARN "ATDD inner cycle limit ($ATDD_MAX_INNER_CYCLES) reached for task $task_id"
    npx bd comment "$task_id" "BLOCKED: ATDD cycle limit ($ATDD_MAX_INNER_CYCLES) reached without acceptance tests passing" 2>/dev/null || true
    return 1
}

# Stop the heartbeat background process
stop_heartbeat() {
    kill "$HEARTBEAT_PID" 2>/dev/null || true
    HEARTBEAT_PID=""
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

    local prompt_lines
    prompt_lines=$(echo "$prompt" | wc -l)
    log INFO "Invoking Claude with focused prompt (${prompt_lines} lines)"
    # Show first 20 lines of prompt on stderr for visibility
    echo "[ralph] ── Prompt preview (${prompt_lines} lines) ──" >&2
    echo "$prompt" | head -20 >&2
    if (( prompt_lines > 20 )); then
        echo "[ralph] ... ($(( prompt_lines - 20 )) more lines)" >&2
    fi
    echo "[ralph] ── End preview ──" >&2
    log_section "CLAUDE INVOCATION - $(date -Iseconds)"
    log_block "Prompt" "$prompt"

    # Capture Claude output to a temp file for logging
    local temp_output
    temp_output=$(mktemp)

    # Write prompt to a temp file to avoid shell quoting issues with script -c
    local prompt_file
    prompt_file=$(mktemp)
    printf '%s' "$prompt" > "$prompt_file"

    # Use script(1) to provide a PTY — claude -p hangs when stdout is not a
    # terminal because its tool-execution framework requires a TTY.  Wrapping
    # with `script -qc` gives claude a pseudo-terminal while still capturing
    # output to a file.  We strip ANSI escape sequences afterwards.
    #
    # timeout -k 10: send SIGKILL 10s after SIGTERM if process ignores it.
    timeout -k 10 "$CLAUDE_TIMEOUT" \
        script -qc "claude -p \"\$(cat '$prompt_file')\" --output-format json" "$temp_output" > /dev/null &
    CLAUDE_PID=$!

    # Clean up prompt file when no longer needed (after claude reads it)
    ( sleep 5; rm -f "$prompt_file" ) &

    # Launch heartbeat: prints elapsed-time every HEARTBEAT_INTERVAL seconds
    local invocation_start heartbeat_pid
    invocation_start=$(date +%s)
    (
        while true; do
            sleep "$HEARTBEAT_INTERVAL"
            elapsed=$(( $(date +%s) - invocation_start ))
            mins=$(( elapsed / 60 ))
            secs=$(( elapsed % 60 ))
            if (( mins > 0 )); then
                echo "[ralph] $(date +%H:%M:%S) Claude running... (${mins}m ${secs}s elapsed)" >&2
            else
                echo "[ralph] $(date +%H:%M:%S) Claude running... (${secs}s elapsed)" >&2
            fi
        done
    ) &
    heartbeat_pid=$!
    HEARTBEAT_PID="$heartbeat_pid"

    # Wait for the background process to complete
    if wait "$CLAUDE_PID"; then
        exit_code=0
        stop_heartbeat
        local invocation_elapsed invocation_elapsed_fmt
        invocation_elapsed=$(( $(date +%s) - invocation_start ))
        invocation_elapsed_fmt=$(format_duration "$invocation_elapsed")
        log INFO "Claude completed successfully in $invocation_elapsed_fmt"
    else
        exit_code=$?
        stop_heartbeat
        if [[ "$exit_code" -eq 124 ]]; then
            log ERROR "Claude timed out after ${CLAUDE_TIMEOUT}s"
        elif [[ "$exit_code" -eq 130 ]]; then
            log INFO "Claude interrupted by SIGINT"
            # Don't log output on interrupt - user is stopping the process
            rm -f "$temp_output"
            CLAUDE_PID=""
            return "$exit_code"
        else
            log ERROR "Claude failed with exit code: $exit_code"
        fi
    fi

    CLAUDE_PID=""

    # Log the output (strip ANSI/terminal escapes and script(1) header/footer)
    claude_output=$(sed -e 's/\x1b\[[0-9;?]*[a-zA-Z]//g' \
                        -e 's/\x1b\[[<=>?][0-9;?]*[a-zA-Z]//g' \
                        -e 's/\x1b\][^\x1b]*\x07//g' \
                        -e 's/\x1b\][0-9;]*[^\a]*//g' \
                        -e 's/\x1b(B//g' \
                        -e 's/\x07//g' \
                        -e 's/\r//g' \
                        -e '/^Script started on/d' \
                        -e '/^Script done on/d' \
                        -e '/^\[COMMAND/d' \
                        "$temp_output")
    log_block "Claude Output" "$claude_output"
    LAST_CLAUDE_OUTPUT="$claude_output"

    # Extract .result from JSON envelope if present
    # Note: jq may return non-zero exit (code 5) when trailing garbage exists
    # in the output (e.g. partial ANSI escapes like "[<u"), but still produces
    # correct output. So we capture first, then check if non-empty.
    local result_text
    result_text=$(echo "$claude_output" | jq -r '.result // empty' 2>/dev/null) || true
    if [[ -n "$result_text" ]]; then
        LAST_CLAUDE_OUTPUT="$result_text"
        # Display formatted output to console
        echo "" >&2
        echo "[ralph] -------- Claude Response --------" >&2
        echo "$result_text" >&2
        echo "[ralph] -------- End Response --------" >&2
        echo "" >&2
    fi

    # Parse RALPH_SIGNAL if present
    parse_ralph_signal "$LAST_CLAUDE_OUTPUT" || true

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
# Triage blocked tasks
##############################################################################

# Generate a diagnostic prompt for Claude to triage a blocked task
generate_triage_prompt() {
    local task_json="$1"
    local epic_id="$2"
    local task_id task_title task_description

    task_id=$(echo "$task_json" | jq -r '.id // "unknown"')
    task_title=$(echo "$task_json" | jq -r '.title // "unknown"')
    task_description=$(echo "$task_json" | jq -r '.description // ""')

    # Fetch BLOCKED comments from task
    local task_details blocked_comments
    task_details=$(npx bd show "$task_id" --json 2>/dev/null) || task_details=""
    if [[ -n "$task_details" ]]; then
        blocked_comments=$(echo "$task_details" | jq -r \
            '(if type == "array" then .[0] else . end) | .comments // [] | .[] | select(.text | startswith("BLOCKED:")) | "- \(.timestamp // "unknown"): \(.text)"' 2>/dev/null) || blocked_comments=""
    else
        blocked_comments=""
    fi

    # Recent git log for context
    local recent_git
    recent_git=$(git log --oneline -10 2>/dev/null) || recent_git="(unavailable)"

    # Epic open task count
    local open_count
    open_count=$(npx bd list --status=open --json 2>/dev/null | \
        jq --arg prefix "$epic_id." '[.[] | select(.id | startswith($prefix))] | length' 2>/dev/null) || open_count="unknown"

    cat <<EOF
You are triaging a BLOCKED task in ralph's automation loop.

## Task
- ID: $task_id
- Title: $task_title
- Description: $task_description

## BLOCKED Comments (failure history)
${blocked_comments:-"(none)"}

## Recent Git Log
$recent_git

## Epic Context
- Epic ID: $epic_id
- Open tasks remaining: $open_count

## Your Job

Analyze the failure pattern and choose ONE action:

| Action | When to use |
|--------|------------|
| close | The feature is actually complete — the circuit-breaker was a false positive |
| decompose | The task is too big or blocked on a missing prerequisite — create a new sibling task |
| defer | Stuck and needs time or human input |

Emit your decision as a RALPH_SIGNAL on a single line:

RALPH_SIGNAL:{"action":"<close|decompose|defer>","reason":"<brief explanation>","title":"<new task title, only for decompose>","description":"<new task description, only for decompose>","defer_duration":"<e.g. +1d or +4h, only for defer>"}

Rules:
- Choose exactly ONE action
- For decompose: provide title and description for the new sibling task
- For defer: provide defer_duration (default +1d if unsure)
- For close: just provide the reason
- Do NOT run any tests or tools — this is analysis only
EOF
}

# Triage a blocked task by invoking Claude for diagnostic analysis
# Always returns 0 — triage is best-effort
triage_blocked_task() {
    local task_json="$1"
    local epic_id="$2"
    local task_id

    task_id=$(echo "$task_json" | jq -r '.id // "unknown"')
    log INFO "Triaging blocked task $task_id"

    # Generate triage prompt
    local triage_prompt
    triage_prompt=$(generate_triage_prompt "$task_json" "$epic_id")

    # Invoke Claude
    if ! invoke_claude_with_retry "$triage_prompt"; then
        log WARN "Triage invocation failed for $task_id — falling back to defer +1d"
        npx bd update "$task_id" --status=open --defer=+1d 2>/dev/null || true
        npx bd comment "$task_id" "BLOCKED: Triage invocation failed, auto-deferred +1d" 2>/dev/null || true
        return 0
    fi

    # Parse RALPH_SIGNAL from Claude output
    if ! parse_ralph_signal "$LAST_CLAUDE_OUTPUT"; then
        log WARN "No RALPH_SIGNAL in triage output for $task_id — falling back to defer +1d"
        npx bd update "$task_id" --status=open --defer=+1d 2>/dev/null || true
        npx bd comment "$task_id" "BLOCKED: Triage produced no signal, auto-deferred +1d" 2>/dev/null || true
        return 0
    fi

    local action reason
    action=$(get_signal "action" "defer")
    reason=$(get_signal "reason" "no reason provided")

    log INFO "Triage decision for $task_id: action=$action reason=$reason"

    case "$action" in
        close)
            log INFO "Triage closing task $task_id: $reason"
            npx bd comment "$task_id" "TRIAGE: Closing — $reason" 2>/dev/null || true
            npx bd close "$task_id" 2>/dev/null || true
            auto_close_completed_parents "$task_id" "$epic_id"
            ;;
        decompose)
            local new_title new_description parent_id
            new_title=$(get_signal "title" "Follow-up for $task_id")
            new_description=$(get_signal "description" "Decomposed from blocked task $task_id")
            # Create sibling under the same parent (implement task)
            parent_id="${task_id%.*}"
            log INFO "Triage decomposing: creating sibling task under $parent_id"
            npx bd create "$new_title" --parent "$parent_id" --description "$new_description" 2>/dev/null || true
            npx bd comment "$task_id" "TRIAGE: Decomposed — $reason. New sibling task created under $parent_id" 2>/dev/null || true
            npx bd update "$task_id" --status=open --defer=+1d 2>/dev/null || true
            ;;
        *)
            # defer (explicit or unknown action fallback)
            local duration
            duration=$(get_signal "defer_duration" "+1d")
            log INFO "Triage deferring task $task_id for $duration: $reason"
            npx bd comment "$task_id" "TRIAGE: Deferring $duration — $reason" 2>/dev/null || true
            npx bd update "$task_id" --status=open --defer="$duration" 2>/dev/null || true
            ;;
    esac

    return 0
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
    local task_source

    EPIC_ID="$epic_id"  # Set global for find_leaf_task safety net

    log INFO "Starting automation loop (max $MAX_ITERATIONS iterations)"
    log_section "AUTOMATION LOOP START"

    # Detect and log operational mode
    task_source=$(detect_task_source "$epic_id")
    if [[ "$task_source" == "spec-kit" ]]; then
        log INFO "Operating in spec-kit workflow mode"
        log INFO "Ralph will process tasks from the sp:* workflow phases"
    else
        log INFO "Operating in generic task workflow mode"
        log INFO "Ralph will process all tasks under the epic (no phase prerequisites)"
    fi

    while (( iteration < MAX_ITERATIONS )); do
        iteration=$((iteration + 1))
        CURRENT_ITERATION="$iteration"  # Update global for SIGINT handler

        log_section "ITERATION $iteration/$MAX_ITERATIONS"

        # Find the next leaf task to work on (drills down through parent tasks)
        log DEBUG "Finding next workable leaf task..."
        if ! next_task=$(find_leaf_task "$epic_id"); then
            log DEBUG "No leaf tasks found. Checking for remaining open tasks..."
            if has_open_tasks "$epic_id"; then
                log INFO "Attempting to sweep completed parent tasks..."
                if sweep_completed_parents "$epic_id"; then
                    log INFO "Sweep closed parent tasks -- retrying iteration"
                    iteration=$((iteration - 1))
                    continue
                fi
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

        # Determine resuming state from the leaf task's status
        local leaf_status
        leaf_status=$(echo "$next_task" | jq -r '.status // "open"')
        if [[ "$leaf_status" == "in_progress" ]]; then
            is_resuming=true
            log INFO "Resuming interrupted task"
        else
            is_resuming=false
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
            log INFO "Iteration $iteration/$MAX_ITERATIONS"
            log INFO "Epic: $epic_id | Task: $task_id | [RESUMING] $task_title"
        else
            log INFO "Iteration $iteration/$MAX_ITERATIONS"
            log INFO "Epic: $epic_id | Task: $task_id | $task_title"
        fi

        # Show first line of description as context (up to 120 chars)
        local desc_preview
        desc_preview="${task_description%%$'\n'*}"
        # Strip ANSI escape sequences to prevent terminal injection
        # 1. CSI sequences: ESC [ + params + any letter (e.g. color, cursor movement)
        # 2. OSC sequences terminated by BEL (e.g. terminal title, hyperlinks)
        # 3. OSC sequences terminated by ST (ESC \)
        desc_preview=$(printf '%s' "$desc_preview" | sed 's/\x1b\[[0-9;]*[A-Za-z]//g; s/\x1b][^\x07]*\x07//g; s/\x1b][^\x1b]*\x1b\\//g')
        desc_preview="${desc_preview:0:120}"
        if [[ -n "$desc_preview" && "${desc_preview,,}" != "no description" ]]; then
            log INFO "  → $desc_preview"
        fi

        log_block "Task Details" "ID: $task_id
Title: $task_title
Type: $task_type
Status: $(if [[ "$is_resuming" == "true" ]]; then echo "RESUMING IN-PROGRESS"; else echo "STARTING NEW"; fi)

Description:
$task_description"

        # Route US<N> tasks to ATDD cycle; all others use /sp:next
        if echo "$task_title" | grep -qP 'US\d+'; then
            log INFO "Routing task $task_id to ATDD cycle (US<N> task detected)"

            if [[ "$DRY_RUN" == "true" ]]; then
                log INFO "DRY RUN: Would execute ATDD cycle for $task_id"
                echo "--- DRY RUN: ATDD cycle for $task_id ---"
                return "$EXIT_SUCCESS"
            fi

            if execute_atdd_cycle "$next_task" "$epic_id"; then
                log INFO "ATDD cycle completed for task $task_id"
                auto_close_completed_parents "$task_id" "$epic_id"
            else
                triage_blocked_task "$next_task" "$epic_id"
            fi
        else
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
                auto_close_completed_parents "$task_id" "$epic_id"
            else
                log ERROR "Task processing failed after $MAX_RETRIES retries"
                return "$EXIT_FAILURE"
            fi
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
    echo "${CLR_BOLD}[ralph] =========================================${CLR_RESET}"
    echo "${CLR_BOLD}[ralph] Summary:${CLR_RESET} $exit_reason"
    echo "${CLR_BOLD}[ralph] Iterations:${CLR_RESET} $CURRENT_ITERATION"
    echo "${CLR_BOLD}[ralph] Elapsed time:${CLR_RESET} $elapsed_formatted"
    echo "${CLR_BOLD}[ralph] Log file:${CLR_RESET} $LOG_FILE"
    echo "${CLR_BOLD}[ralph] =========================================${CLR_RESET}"
}

##############################################################################
# Signal handlers
##############################################################################

# Handler for SIGINT (Ctrl+C)
handle_sigint() {
    echo ""
    log INFO "Received SIGINT, cleaning up..."

    # Kill the entire process group rooted at CLAUDE_PID (script -> claude -> node)
    if [[ -n "$CLAUDE_PID" ]] && kill -0 "$CLAUDE_PID" 2>/dev/null; then
        log INFO "Terminating Claude subprocess (PID: $CLAUDE_PID)"
        # Kill the process group (negative PID) to catch script + all children
        kill -TERM -- -"$CLAUDE_PID" 2>/dev/null || kill -TERM "$CLAUDE_PID" 2>/dev/null || true
        # Give it a moment to terminate gracefully
        sleep 1
        # Force kill if still running
        if kill -0 "$CLAUDE_PID" 2>/dev/null; then
            log WARN "Force killing Claude subprocess"
            kill -KILL -- -"$CLAUDE_PID" 2>/dev/null || kill -KILL "$CLAUDE_PID" 2>/dev/null || true
        fi
    fi

    # Kill heartbeat if running
    if [[ -n "$HEARTBEAT_PID" ]] && kill -0 "$HEARTBEAT_PID" 2>/dev/null; then
        stop_heartbeat
    fi

    show_summary "Interrupted by user"
    # EXIT trap will handle lock release
    exit "$EXIT_SIGINT"
}

# Cleanup handler (runs on EXIT)
cleanup() {
    stop_heartbeat
    release_lock
}

##############################################################################
# Main entry point
##############################################################################

main() {
    parse_args "$@"

    # Initialize logging infrastructure
    init_log

    log INFO "Configuration: dry_run=$DRY_RUN, max_iterations=$MAX_ITERATIONS, explicit_epic=$EXPLICIT_EPIC_ID"
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
