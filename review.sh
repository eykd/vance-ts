#!/usr/bin/env bash
# review.sh - Automated code quality review using Claude CLI skills
#
# Processes TypeScript files through three review skills in parallel:
# - /security-review - OWASP vulnerabilities, authentication, data security
# - /clean-architecture-validator - Dependency violations, layer boundaries
# - /quality-review - Correctness, test quality, simplicity, code standards
#
# Creates beads tasks under the current feature epic for all findings.

set -euo pipefail

# Script version
readonly VERSION="1.0.0"

# Lock and log files
readonly LOCK_FILE=".review.lock"
readonly LOG_FILE=".review.log"
readonly LOG_MAX_SIZE=$((10 * 1024 * 1024))  # 10MB max log size

# Retry configuration
readonly MAX_RETRIES=10
readonly MAX_RETRY_DELAY=300  # 5 minutes cap

# Claude CLI timeout
readonly CLAUDE_TIMEOUT=1800  # 30 minutes max per invocation

# Parallel execution
readonly MAX_CONCURRENT=3

# Exit codes
readonly EXIT_SUCCESS=0
readonly EXIT_FAILURE=1
readonly EXIT_SIGINT=130

# Valid skills
readonly VALID_SKILLS=(
    "security-review"
    "clean-architecture-validator"
    "quality-review"
)

# Runtime configuration (set by argument parsing)
DRY_RUN=false
SKILLS=("${VALID_SKILLS[@]}")  # Default to all skills
FILES_TO_REVIEW=()
CLAUDE_FLAGS=()  # Additional flags to pass to claude command

# Runtime state
START_TIME=0
EPIC_ID=""

##############################################################################
# Logging infrastructure (from ralph.sh)
##############################################################################

rotate_log() {
    if [[ -f "$LOG_FILE" ]] && [[ $(stat -f%z "$LOG_FILE" 2>/dev/null || stat -c%s "$LOG_FILE" 2>/dev/null || echo 0) -gt "$LOG_MAX_SIZE" ]]; then
        local timestamp
        timestamp=$(date +%Y%m%d-%H%M%S)
        mv "$LOG_FILE" "${LOG_FILE}.${timestamp}"
        echo "[review] Rotated log file to ${LOG_FILE}.${timestamp}"
    fi
}

init_log() {
    rotate_log
    {
        echo "========================================================================"
        echo "Review.sh Code Review Session"
        echo "Started: $(date -Iseconds)"
        echo "Version: $VERSION"
        echo "Configuration: dry_run=$DRY_RUN, skills=${SKILLS[*]}"
        echo "========================================================================"
        echo ""
    } >> "$LOG_FILE"
}

log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp
    timestamp=$(date -Iseconds)

    echo "[$timestamp] [$level] $message" >> "$LOG_FILE"

    case "$level" in
        INFO)
            echo "[review] $message" >&2
            ;;
        WARN)
            echo "[review] WARNING: $message" >&2
            ;;
        ERROR)
            echo "[review] ERROR: $message" >&2
            ;;
    esac
}

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
Usage: review.sh [OPTIONS]

Automated code quality review using Claude CLI skills.

Processes TypeScript files through three review skills:
  - security-review: OWASP vulnerabilities, authentication, data security
  - clean-architecture-validator: Dependency violations, layer boundaries
  - quality-review: Correctness, test quality, simplicity, code standards

Creates beads tasks under the current feature epic for all findings.

OPTIONS:
    --dry-run                 Preview without invoking Claude
    --skills SKILL1,SKILL2    Filter skills (comma-separated, no spaces)
                              Valid: ${VALID_SKILLS[*]}
                              Default: all skills
    --files FILE1 FILE2 ...   Review specific files instead of auto-discovery
    --claude-flags "FLAGS"    Additional flags to pass to claude command
                              Example: --claude-flags "--model haiku --no-session-persistence"
    --help                    Show this help message and exit
    --version                 Show version and exit

EXAMPLES:
    review.sh                                    # Review all TypeScript files with all skills
    review.sh --dry-run                          # Preview what would be reviewed
    review.sh --skills security-review           # Only security review
    review.sh --skills security-review,quality-review  # Two skills
    review.sh --files src/index.ts               # Review specific file
    review.sh --claude-flags '--model haiku'     # Use haiku model for faster reviews
    review.sh --claude-flags '--no-session-persistence'  # Disable session persistence

EXIT CODES:
    0   Review completed successfully
    1   Error occurred
    130 Interrupted by SIGINT (Ctrl+C)

EOF
}

##############################################################################
# Argument parsing
##############################################################################

parse_args() {
    local collecting_files=false

    while [[ $# -gt 0 ]]; do
        case "$1" in
            --dry-run)
                DRY_RUN=true
                collecting_files=false
                shift
                ;;
            --skills)
                if [[ -z "${2:-}" ]]; then
                    echo "Error: --skills requires comma-separated skill names" >&2
                    exit "$EXIT_FAILURE"
                fi
                IFS=',' read -ra SKILLS <<< "$2"
                # Validate skills
                for skill in "${SKILLS[@]}"; do
                    local valid=false
                    for valid_skill in "${VALID_SKILLS[@]}"; do
                        if [[ "$skill" == "$valid_skill" ]]; then
                            valid=true
                            break
                        fi
                    done
                    if [[ "$valid" != "true" ]]; then
                        echo "Error: Invalid skill '$skill'. Valid skills: ${VALID_SKILLS[*]}" >&2
                        exit "$EXIT_FAILURE"
                    fi
                done
                collecting_files=false
                shift 2
                ;;
            --files)
                collecting_files=true
                shift
                ;;
            --claude-flags)
                if [[ -z "${2:-}" ]]; then
                    echo "Error: --claude-flags requires a value" >&2
                    exit "$EXIT_FAILURE"
                fi
                # shellcheck disable=SC2206
                CLAUDE_FLAGS=($2)
                collecting_files=false
                shift 2
                ;;
            --help)
                usage
                exit "$EXIT_SUCCESS"
                ;;
            --version)
                echo "review.sh version $VERSION"
                exit "$EXIT_SUCCESS"
                ;;
            -*)
                echo "Error: Unknown option: $1" >&2
                usage >&2
                exit "$EXIT_FAILURE"
                ;;
            *)
                if [[ "$collecting_files" == "true" ]]; then
                    if [[ ! -f "$1" ]]; then
                        echo "Error: File not found: $1" >&2
                        exit "$EXIT_FAILURE"
                    fi
                    FILES_TO_REVIEW+=("$1")
                    shift
                else
                    echo "Error: Unexpected argument: $1" >&2
                    usage >&2
                    exit "$EXIT_FAILURE"
                fi
                ;;
        esac
    done
}

##############################################################################
# Lock file management
##############################################################################

is_review_running() {
    local pid="$1"
    local cmd

    if ! kill -0 "$pid" 2>/dev/null; then
        return 1
    fi

    cmd=$(ps -p "$pid" -o comm= 2>/dev/null) || return 1
    [[ "$cmd" == "review.sh" || "$cmd" == "bash" ]]
}

acquire_lock() {
    local branch="$1"
    local lock_content existing_pid existing_branch

    log DEBUG "Attempting to acquire lock for branch: $branch"

    lock_content="$$
$(date -Iseconds)
$branch"

    if ( set -o noclobber; echo "$lock_content" > "$LOCK_FILE" ) 2>/dev/null; then
        log INFO "Acquired lock (PID: $$)"
        return 0
    fi

    existing_pid=$(head -n1 "$LOCK_FILE" 2>/dev/null || echo "")
    existing_branch=$(sed -n '3p' "$LOCK_FILE" 2>/dev/null || echo "")

    log DEBUG "Lock file exists: PID=$existing_pid, branch=$existing_branch"

    if [[ -n "$existing_pid" ]] && is_review_running "$existing_pid"; then
        log ERROR "review.sh is already running on branch '$existing_branch' (PID: $existing_pid)"
        echo "If this is stale, remove $LOCK_FILE manually." >&2
        return 1
    fi

    log INFO "Removing stale lock file (PID $existing_pid not running)"
    rm -f "$LOCK_FILE"

    if ( set -o noclobber; echo "$lock_content" > "$LOCK_FILE" ) 2>/dev/null; then
        log INFO "Acquired lock (PID: $$)"
        return 0
    fi

    log ERROR "Another review.sh instance acquired the lock"
    return 1
}

release_lock() {
    if [[ -f "$LOCK_FILE" ]]; then
        local lock_pid
        lock_pid=$(head -n1 "$LOCK_FILE" 2>/dev/null || echo "")

        if [[ "$lock_pid" == "$$" ]]; then
            rm -f "$LOCK_FILE"
            log INFO "Released lock"
        fi
    fi
}

##############################################################################
# Epic detection (from ralph.sh)
##############################################################################

get_current_branch() {
    git branch --show-current 2>/dev/null || {
        echo "Error: Not in a git repository or HEAD is detached" >&2
        return 1
    }
}

extract_feature_name() {
    local branch="$1"
    echo "$branch" | sed 's/^[0-9]*-//'
}

find_epic_id() {
    local feature_name="$1"
    local epics_json

    epics_json=$(npx bd list --type epic --status open --json 2>/dev/null) || {
        echo "Error: Failed to query beads for epics" >&2
        return 1
    }

    local epic_id
    epic_id=$(echo "$epics_json" | jq -r --arg name "$feature_name" \
        '.[] | select(.title | ascii_downcase | contains($name | ascii_downcase)) | .id' | head -n1)

    if [[ -z "$epic_id" ]]; then
        return 1
    fi

    echo "$epic_id"
}

##############################################################################
# Epic management
##############################################################################

ensure_epic_exists() {
    local branch="$1"
    local feature_name epic_id

    feature_name=$(extract_feature_name "$branch")
    log INFO "Feature name: $feature_name"

    epic_id=$(find_epic_id "$feature_name" 2>/dev/null) || true

    if [[ -z "$epic_id" ]]; then
        log INFO "No epic found for feature '$feature_name', creating..."
        epic_id=$(npx bd create "Code Review: $feature_name" \
            --description "Automated code review epic for branch: $branch" \
            --type epic \
            --priority 0 \
            --json | jq -r '.id')
        log INFO "Created epic: $epic_id"
    else
        log INFO "Found existing epic: $epic_id"
    fi

    echo "$epic_id"
}

ensure_epic_open() {
    local epic_id="$1"
    local status

    status=$(npx bd show "$epic_id" --json | jq -r '.[0].status')

    if [[ "$status" == "closed" ]]; then
        log INFO "Reopening closed epic $epic_id"
        npx bd reopen "$epic_id"
    fi
}

get_open_tasks() {
    local epic_id="$1"
    local open_json

    open_json=$(npx bd list --status open --json 2>/dev/null) || {
        echo "[]"
        return 0
    }

    echo "$open_json" | jq --arg epic "$epic_id" \
        '[.[] | select(.id | startswith($epic)) | select(.id != $epic and .issue_type != "event")]'
}

##############################################################################
# File discovery
##############################################################################

find_typescript_files() {
    local files=()

    # Search src/, tests/, and functions/ if they exist
    for dir in src tests functions; do
        if [[ -d "$dir" ]]; then
            while IFS= read -r -d '' file; do
                files+=("$file")
            done < <(find "$dir" -type f -name "*.ts" \
                ! -name "*.spec.ts" \
                ! -name "*.test.ts" \
                ! -path "*/node_modules/*" \
                ! -path "*/.claude/*" \
                ! -path "*/dist/*" \
                -print0 2>/dev/null)
        fi
    done

    printf '%s\n' "${files[@]}" | sort
}

##############################################################################
# Retry logic (from ralph.sh)
##############################################################################

calculate_delay() {
    local attempt="$1"
    local delay

    delay=$((1 << (attempt - 1)))

    if (( delay > MAX_RETRY_DELAY )); then
        delay="$MAX_RETRY_DELAY"
    fi

    echo "$delay"
}

##############################################################################
# Skill invocation
##############################################################################

generate_review_prompt() {
    local file="$1"
    local skill="$2"
    local open_tasks_json="$3"

    # Check if file exists and is readable
    if [[ ! -f "$file" ]]; then
        log ERROR "File not found: $file"
        return 1
    fi

    if [[ ! -r "$file" ]]; then
        log ERROR "File not readable: $file"
        return 1
    fi

    # Check file size (warn if > 10KB, skip if > 100KB)
    local file_size
    file_size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo 0)

    if (( file_size > 102400 )); then
        log WARN "File too large to review (${file_size} bytes): $file"
        return 1
    elif (( file_size > 10240 )); then
        log WARN "Large file (${file_size} bytes): $file"
    fi

    # Read file content
    local file_content
    if ! file_content=$(cat "$file" 2>/dev/null); then
        log ERROR "Failed to read file: $file"
        return 1
    fi

    cat <<EOF
/$skill

## Review Context
**File:** $file

## File Content
\`\`\`typescript
$file_content
\`\`\`

## Deduplication Instructions
Check if findings are already tracked in these open tasks:

\`\`\`json
$open_tasks_json
\`\`\`

Compare your findings to existing task titles and descriptions.
Only report NEW findings not already tracked.
Use judgment to avoid duplicate work.

## Instructions
1. Review the file for issues
2. Check against existing open tasks (provided above) to avoid duplicates
3. For each NEW finding, immediately create a beads task using:

   npx bd create "[$skill] Title" \\
     --description "File: $file
Line: [line]
Severity: [severity]
Skill: $skill

Problem:
[problem description]

Fix:
[fix steps]" \\
     --priority [0-3] \\
     --parent $EPIC_ID

4. After creating tasks, output: "Created task: [task-id] - [title]"
5. If no new findings: "No new findings for $file"

## Priority Mapping Reference

| Severity | Priority | Description |
|----------|----------|-------------|
| Critical | 0        | Security vulnerability, data loss risk, production blocker |
| High     | 1        | Significant bug, test gap, important pattern violation |
| Medium   | 2        | Code smell, minor bug, improvement opportunity |
| Low      | 3        | Style issue, optional enhancement, documentation |

## Important
- Use the exact npx bd create command format shown above
- Always include --description with full context
- Always include --priority based on severity (Critical=0, High=1, Medium=2, Low=3)
- Always include --parent $EPIC_ID to attach to this epic
- The description should be multi-line with Problem: and Fix: sections

## Example
If you find a security issue, run:
npx bd create "[security-review] SQL Injection in search" \\
  --description "File: src/search.ts
Line: 45
Severity: Critical
Skill: security-review

Problem:
User input concatenated into SQL query without sanitization.

Fix:
Use parameterized queries with proper binding." \\
  --priority 0 \\
  --parent $EPIC_ID

Then output: "Created task: workspace-jat-123 - [security-review] SQL Injection in search"
EOF
}

invoke_claude_skill() {
    local prompt="$1"
    local exit_code
    local claude_output
    local temp_output
    local temp_stderr

    temp_output=$(mktemp)
    temp_stderr=$(mktemp)

    # Log prompt size for debugging
    local prompt_size=${#prompt}
    log DEBUG "Prompt size: $prompt_size characters"

    if [[ ${#CLAUDE_FLAGS[@]} -gt 0 ]]; then
        log DEBUG "Claude flags: ${CLAUDE_FLAGS[*]}"
    fi

    # Check if claude command is available
    if ! command -v claude &>/dev/null; then
        log ERROR "claude command not found in PATH"
        rm -f "$temp_output" "$temp_stderr"
        return 1
    fi

    # Invoke claude with proper error capture
    # shellcheck disable=SC2086
    if timeout "$CLAUDE_TIMEOUT" claude "${CLAUDE_FLAGS[@]}" -p "$prompt" >"$temp_output" 2>"$temp_stderr"; then
        exit_code=0
    else
        exit_code=$?
        if [[ "$exit_code" -eq 124 ]]; then
            log ERROR "Claude timed out after ${CLAUDE_TIMEOUT}s"
        elif [[ "$exit_code" -eq 130 ]]; then
            log ERROR "Claude was interrupted (SIGINT)"
            log_block "Claude stderr" "$(cat "$temp_stderr")"
            log ERROR "Possible causes: authentication issue, workspace permissions, or system signal"
        else
            log ERROR "Claude failed with exit code: $exit_code"
            log_block "Claude stderr" "$(cat "$temp_stderr")"
        fi
    fi

    claude_output=$(cat "$temp_output")
    rm -f "$temp_output" "$temp_stderr"

    echo "$claude_output"
    return "$exit_code"
}

invoke_claude_with_retry() {
    local prompt="$1"
    local attempt=0
    local delay
    local output
    local last_exit_code

    while (( attempt < MAX_RETRIES )); do
        attempt=$((attempt + 1))
        log DEBUG "Claude invocation attempt $attempt/$MAX_RETRIES"

        if output=$(invoke_claude_skill "$prompt"); then
            if (( attempt > 1 )); then
                log INFO "Claude succeeded after $attempt attempts"
            fi
            echo "$output"
            return 0
        fi

        last_exit_code=$?

        # Don't retry on SIGINT (user interrupt) or authentication failures
        if [[ "$last_exit_code" -eq 130 ]]; then
            log ERROR "SIGINT detected - not retrying (exit code 130)"
            log ERROR "This usually indicates: authentication failure, workspace restrictions, or system interrupt"
            return "$last_exit_code"
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
# Output logging
##############################################################################

log_skill_output() {
    local output="$1"
    local file="$2"
    local skill="$3"

    # Just log the output - Claude creates tasks directly
    log_block "Output for $file ($skill)" "$output"

    # Count tasks created (optional, for logging)
    local task_count
    task_count=$(echo "$output" | grep -c "Created task:" || echo 0)

    if [[ $task_count -gt 0 ]]; then
        log INFO "Created $task_count task(s) for $file from $skill"
    else
        log DEBUG "No tasks created for $file from $skill"
    fi
}

##############################################################################
# Parallel execution
##############################################################################

process_file_with_skill() {
    local file="$1"
    local skill="$2"
    local open_tasks_json="$3"

    log_section "REVIEWING: $file with $skill"
    log INFO "Processing $file with $skill"

    local prompt
    prompt=$(generate_review_prompt "$file" "$skill" "$open_tasks_json")

    log_block "Prompt for $file ($skill)" "$prompt"

    if [[ "$DRY_RUN" == "true" ]]; then
        log INFO "DRY RUN: Would invoke Claude with prompt"
        echo "--- DRY RUN: $skill for $file ---"
        echo "$prompt"
        echo "---"
        return 0
    fi

    local output
    if output=$(invoke_claude_with_retry "$prompt"); then
        log_skill_output "$output" "$file" "$skill"
    else
        log ERROR "Failed to process $file with $skill after retries"
        return 1
    fi
}

run_reviews() {
    local files=("$@")
    local file_count=${#files[@]}
    local skill_count=${#SKILLS[@]}
    local total_reviews=$((file_count * skill_count))

    log INFO "Starting reviews: $file_count files × $skill_count skills = $total_reviews reviews"
    log INFO "Max concurrent: $MAX_CONCURRENT"

    # Get open tasks once for deduplication
    local open_tasks_json
    open_tasks_json=$(get_open_tasks "$EPIC_ID")
    log_block "Open Tasks for Deduplication" "$open_tasks_json"

    # Track background jobs
    local active_pids=()

    for file in "${files[@]}"; do
        for skill in "${SKILLS[@]}"; do
            # Wait if at capacity
            while [[ ${#active_pids[@]} -ge $MAX_CONCURRENT ]]; do
                # Wait for any job to complete
                local finished_pid
                if wait -n 2>/dev/null; then
                    # Remove finished PIDs from array
                    local new_pids=()
                    for pid in "${active_pids[@]}"; do
                        if kill -0 "$pid" 2>/dev/null; then
                            new_pids+=("$pid")
                        fi
                    done
                    active_pids=("${new_pids[@]}")
                else
                    # wait -n failed, rebuild from jobs
                    active_pids=($(jobs -p))
                fi
            done

            # Launch skill invocation in background
            process_file_with_skill "$file" "$skill" "$open_tasks_json" &
            active_pids+=($!)
            log DEBUG "Launched background job for $file with $skill (PID: $!)"
        done
    done

    # Wait for all remaining jobs
    log INFO "Waiting for remaining background jobs..."
    wait

    log INFO "All reviews completed"
}

##############################################################################
# Summary
##############################################################################

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

generate_summary_prompt() {
    # Query tasks under the epic
    local tasks_json
    tasks_json=$(npx bd list --parent "$EPIC_ID" --status open --json 2>/dev/null || echo "[]")

    local task_count
    task_count=$(echo "$tasks_json" | jq length)

    if [[ $task_count -eq 0 ]]; then
        return 0
    fi

    cat <<EOF

## Code Review Summary

Review.sh found $task_count issue(s) across the codebase.

### Tasks Created

$(echo "$tasks_json" | jq -r '.[] | "- **\(.title)** (\(.id))
  Created: \(.created_at)"')

### Next Steps

You can address these issues by:

1. **Review tasks in beads:**
   \`\`\`bash
   npx bd list --parent $EPIC_ID
   \`\`\`

2. **Start working on high-priority tasks:**
   \`\`\`bash
   npx bd ready --parent $EPIC_ID
   \`\`\`

3. **Or ask Claude to fix specific issues**

EOF
}

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

    # Query beads for task count
    local task_count=0
    if [[ "$DRY_RUN" != "true" && -n "$EPIC_ID" ]]; then
        local tasks_json
        tasks_json=$(npx bd list --parent "$EPIC_ID" --status open --json 2>/dev/null || echo "[]")
        task_count=$(echo "$tasks_json" | jq length)
    fi

    # Log to file
    log_section "SESSION SUMMARY"
    {
        echo "Exit reason: $exit_reason"
        echo "Tasks created: $task_count"
        echo "Elapsed time: $elapsed_formatted"
        echo "Ended: $(date -Iseconds)"
    } >> "$LOG_FILE"

    # Display to console
    echo ""
    echo "[review] ========================================="
    echo "[review] Summary: $exit_reason"
    echo "[review] Tasks created: $task_count"
    echo "[review] Elapsed time: $elapsed_formatted"
    echo "[review] Log file: $LOG_FILE"
    echo "[review] ========================================="

    # Show detailed summary with Claude prompt
    if [[ $task_count -gt 0 ]]; then
        local summary_prompt
        summary_prompt=$(generate_summary_prompt)
        echo "$summary_prompt"
        log_block "Summary Prompt" "$summary_prompt"
    else
        echo ""
        echo "[review] No issues found! ✓"
    fi
}

##############################################################################
# Signal handlers
##############################################################################

handle_sigint() {
    echo ""
    show_summary "Interrupted by user"
    exit "$EXIT_SIGINT"
}

cleanup() {
    release_lock
}

##############################################################################
# Main entry point
##############################################################################

main() {
    parse_args "$@"

    init_log

    log INFO "Configuration: dry_run=$DRY_RUN, skills=${SKILLS[*]}"
    log INFO "Log file: $LOG_FILE"

    START_TIME=$(date +%s)

    # Determine files to review
    if [[ ${#FILES_TO_REVIEW[@]} -eq 0 ]]; then
        log INFO "Auto-discovering TypeScript files..."
        mapfile -t FILES_TO_REVIEW < <(find_typescript_files)
    fi

    if [[ ${#FILES_TO_REVIEW[@]} -eq 0 ]]; then
        log WARN "No TypeScript files found to review"
        echo "[review] No TypeScript files found to review" >&2
        exit "$EXIT_SUCCESS"
    fi

    log INFO "Files to review: ${#FILES_TO_REVIEW[@]}"
    log_block "Files" "$(printf '%s\n' "${FILES_TO_REVIEW[@]}")"

    # Detect epic for this branch
    local branch
    branch=$(get_current_branch) || exit "$EXIT_FAILURE"

    if [[ "$DRY_RUN" != "true" ]]; then
        # Acquire lock
        acquire_lock "$branch" || exit "$EXIT_FAILURE"

        # Set up traps
        trap cleanup EXIT
        trap handle_sigint SIGINT

        # Ensure epic exists and is open
        EPIC_ID=$(ensure_epic_exists "$branch")
        ensure_epic_open "$EPIC_ID"

        log INFO "Epic ID: $EPIC_ID"
    else
        log INFO "DRY RUN: Skipping lock and epic management"
        EPIC_ID="dry-run-epic"
    fi

    # Run reviews
    run_reviews "${FILES_TO_REVIEW[@]}"

    # Show summary
    show_summary "Review completed"

    exit "$EXIT_SUCCESS"
}

main "$@"
