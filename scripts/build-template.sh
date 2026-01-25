#!/usr/bin/env bash
# build-template.sh - Package repository into a single .tmplr template file
#
# This script creates a tmplr-format template file from the repository,
# using the txtar-inspired format with {### FILE path ###} headers.
# The output is gzip-compressed to reduce file size.
#
# Usage: ./scripts/build-template.sh
# Output: dist/turtlebased-ts.tmplr.gz

set -euo pipefail

# Configuration
readonly OUTPUT_DIR="dist"
readonly OUTPUT_FILE="${OUTPUT_DIR}/turtlebased-ts.tmplr"
readonly OUTPUT_FILE_GZ="${OUTPUT_FILE}.gz"
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# Hardcoded exclusions (in addition to .gitignore)
readonly EXCLUSIONS=(
    ".git/"
    ".beads/"
    "specs/"
    "thoughts/"
)

# Statistics
files_processed=0
dirs_excluded=0
files_excluded=0

# Print error message and exit
error() {
    echo "Error: $1" >&2
    exit 1
}

# Print progress message
info() {
    echo "$1"
}

# Check if path should be excluded
is_excluded() {
    local path="$1"

    for exclusion in "${EXCLUSIONS[@]}"; do
        # Check if path starts with exclusion pattern (directory)
        if [[ "$path" == "${exclusion}"* ]] || [[ "$path" == "${exclusion%/}"* ]]; then
            return 0
        fi
    done

    return 1
}

# Validate we're in a git repository
validate_repository() {
    if ! git rev-parse --is-inside-work-tree &>/dev/null; then
        error "Not inside a git repository"
    fi

    # Get the actual repo root from git
    local git_root
    git_root="$(git rev-parse --show-toplevel)"

    if [[ "$git_root" != "$REPO_ROOT" ]]; then
        error "Script must be run from repository root. Expected: $REPO_ROOT, Got: $git_root"
    fi
}

# Create output directory if it doesn't exist (FR-013)
ensure_output_dir() {
    if [[ ! -d "$OUTPUT_DIR" ]]; then
        mkdir -p "$OUTPUT_DIR"
        info "Created output directory: $OUTPUT_DIR"
    fi
}

# Get list of files to include in template
# Uses git ls-files to respect .gitignore (FR-003)
get_files() {
    git ls-files --cached --others --exclude-standard | while read -r file; do
        # Skip excluded directories (FR-004 through FR-007)
        if is_excluded "$file"; then
            ((files_excluded++)) || true
            continue
        fi

        # Skip if file doesn't exist (deleted but still tracked)
        if [[ -f "$file" ]]; then
            echo "$file"
        fi
    done
}

# Transform package.json content to use app_name variable (FR-012)
transform_package_json() {
    local content="$1"
    # Replace the name field value with {{ app_name }}
    echo "$content" | sed 's/"name": "[^"]*"/"name": "{{ app_name }}"/'
}

# Generate wrangler.toml content (FR-008 through FR-010)
generate_wrangler_toml() {
    cat << 'EOF'
name = "{{ app_name }}"
pages_build_output_dir = "hugo/public"

# Uncomment and configure bindings as needed:
#
# [[d1_databases]]
# binding = "DB"
# database_name = "my-database"
# database_id = "your-database-id"
#
# [[kv_namespaces]]
# binding = "KV"
# id = "your-kv-namespace-id"
#
# [[r2_buckets]]
# binding = "R2"
# bucket_name = "my-bucket"
EOF
}

# Generate wrangler.worker.toml content for scheduled Workers (FR-014)
generate_wrangler_worker_toml() {
    cat << 'EOF'
# Cloudflare Worker configuration for scheduled tasks
# This is a SEPARATE Worker from your Pages deployment
#
# WHY TWO FILES?
# - wrangler.toml → Cloudflare Pages (static site + Functions)
# - wrangler.worker.toml → Standalone Worker (cron triggers)
#
# Cloudflare Pages does NOT support [triggers] configuration.
# If you need scheduled tasks (cron jobs), deploy this Worker separately.

name = "{{ app_name }}-cron"
main = "functions/cron/example-task.ts"
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]

# Cron Triggers
# Uncomment and configure as needed:
#
# [triggers]
# crons = [
#   "0 6 * * *",      # Daily at 6 AM UTC
#   "*/15 * * * *",   # Every 15 minutes
#   "0 0 * * 0"       # Weekly on Sunday at midnight
# ]
#
# Cron syntax: minute hour day month day-of-week
# See: https://developers.cloudflare.com/workers/configuration/cron-triggers/

# Bindings (should match wrangler.toml for shared resources)
# Uncomment and configure as needed:
#
# [[d1_databases]]
# binding = "DB"
# database_name = "{{ app_name }}-db"
# database_id = "your-database-id"  # Use same ID as Pages deployment
#
# [[kv_namespaces]]
# binding = "KV"
# id = "your-kv-namespace-id"  # Use same ID as Pages deployment
#
# [[r2_buckets]]
# binding = "R2"
# bucket_name = "{{ app_name }}-storage"  # Use same bucket as Pages deployment

# Environment Variables
# Set secrets via: wrangler secret put SECRET_NAME --config wrangler.worker.toml
#
# Example secrets you might need:
# - RESEND_API_KEY (for sending scheduled emails)
# - BASE_URL (for generating links in notifications)
# - FROM_EMAIL (for email sender address)

# Deployment
# Deploy this Worker separately from Pages:
#   wrangler deploy --config wrangler.worker.toml
#
# Test locally with cron simulation:
#   wrangler dev --config wrangler.worker.toml --test-scheduled
#   curl "http://localhost:8787/__scheduled?cron=*+*+*+*+*"

EOF
}

# Required scaffold directories (excluded from git but needed for tests)
readonly SCAFFOLD_DIRS=(
    "thoughts/handoffs"
    "thoughts/ledgers"
)

# Write a file section to the template (FR-011)
write_file_section() {
    local path="$1"
    local content="$2"

    echo "{### FILE ${path} ###}"
    echo "$content"
    echo ""
}

# Main build function
build_template() {
    info "Building template..."

    # Clear/create output file
    > "$OUTPUT_FILE"

    # Add template preamble (comment section)
    cat >> "$OUTPUT_FILE" << 'EOF'
# turtlebased-ts template
# Generated by build-template.sh
# Use with: gunzip -k turtlebased-ts.tmplr.gz && tmplr make turtlebased-ts.tmplr <output-dir> app_name=<your-app-name>

EOF

    # Add wrangler.toml (generated, not from source) (FR-008)
    local wrangler_content
    wrangler_content="$(generate_wrangler_toml)"
    write_file_section "wrangler.toml" "$wrangler_content" >> "$OUTPUT_FILE"
    ((files_processed++)) || true

    # Add wrangler.worker.toml (generated template for scheduled Workers) (FR-014)
    local wrangler_worker_content
    wrangler_worker_content="$(generate_wrangler_worker_toml)"
    write_file_section "wrangler.worker.toml" "$wrangler_worker_content" >> "$OUTPUT_FILE"
    ((files_processed++)) || true

    # Add scaffold directories with .gitkeep (excluded dirs that need to exist)
    for dir in "${SCAFFOLD_DIRS[@]}"; do
        write_file_section "${dir}/.gitkeep" "" >> "$OUTPUT_FILE"
        ((files_processed++)) || true
    done

    # Add example cron handler (FR-014)
    write_file_section "functions/cron/example-task.ts" "$(cat << 'CRON_EOF'
/**
 * Example scheduled task handler
 *
 * This file demonstrates how to create a Cloudflare Worker with cron triggers.
 * Deploy using: wrangler deploy --config wrangler.worker.toml
 *
 * For production use:
 * 1. Uncomment [triggers] in wrangler.worker.toml
 * 2. Configure cron schedule (e.g., "0 6 * * *" for daily at 6 AM)
 * 3. Replace this example with your actual scheduled task logic
 * 4. Configure bindings (D1, KV, R2) to match your Pages deployment
 */

interface Env {
  // Uncomment bindings as needed (must match wrangler.worker.toml):
  // DB: D1Database;
  // KV: KVNamespace;
  // R2: R2Bucket;
  // RESEND_API_KEY?: string;
  // BASE_URL?: string;
}

export default {
  async scheduled(
    event: ScheduledEvent,
    env: Env,
    ctx: ExecutionContext
  ): Promise<void> {
    console.log('Cron trigger executed at:', new Date(event.scheduledTime).toISOString());

    // Example: Log execution
    // In production, replace with actual task logic:
    // - Send daily reports
    // - Cleanup old records
    // - Sync data with external APIs
    // - Send scheduled notifications

    try {
      // Your scheduled task logic here
      const result = await performScheduledTask(env, event.scheduledTime);
      console.log('Task completed successfully:', result);
    } catch (error) {
      console.error('Scheduled task failed:', error);
      // Consider sending error notifications or logging to monitoring service
    }
  },
};

async function performScheduledTask(
  env: Env,
  scheduledTime: number
): Promise<{ message: string }> {
  // Replace with your actual task logic
  return {
    message: `Example task executed at ${new Date(scheduledTime).toISOString()}`,
  };
}
CRON_EOF
)" >> "$OUTPUT_FILE"
    ((files_processed++)) || true

    # Process each file from the repository
    while IFS= read -r file; do
        local content

        # Special handling for package.json (FR-012)
        if [[ "$file" == "package.json" ]]; then
            content="$(transform_package_json "$(cat "$file")")"
        else
            content="$(cat "$file")"
        fi

        write_file_section "$file" "$content" >> "$OUTPUT_FILE"
        ((files_processed++)) || true
    done < <(get_files)

    # Count excluded directories
    dirs_excluded="${#EXCLUSIONS[@]}"
}

# Compress the template file
compress_template() {
    info "Compressing template..."
    gzip -f "$OUTPUT_FILE"
}

# Print summary (FR-017)
print_summary() {
    local output_path
    output_path="$(cd "$REPO_ROOT" && pwd)/${OUTPUT_FILE_GZ}"
    local size
    size="$(du -h "$OUTPUT_FILE_GZ" | cut -f1)"

    info "Processed: ${files_processed} files"
    info "Excluded: ${dirs_excluded} directories, ${files_excluded} files (gitignore)"
    info "Output: ${output_path} (${size})"
}

# Main entry point
main() {
    cd "$REPO_ROOT"

    validate_repository
    ensure_output_dir
    build_template
    compress_template
    print_summary

    info "Template build complete!"
}

main "$@"
