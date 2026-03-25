#!/usr/bin/env bash
# Verify bd -> br migration is complete for a file or directory.
#
# Usage:
#   ./verify-migration.sh <file.md>     # Single file
#   ./verify-migration.sh <directory>    # All files in directory
#
# Exit codes:
#   0 - Migration verified complete
#   1 - File/directory not found
#   2 - Migration incomplete (errors found)

set -euo pipefail

target="${1:?Usage: verify-migration.sh <file-or-directory>}"

if [[ ! -e "$target" ]]; then
  echo "ERROR: Not found: $target"
  exit 1
fi

total_errors=0
total_warnings=0
files_checked=0

count_matches() {
  grep -c "$1" "$2" 2>/dev/null || true
}

count_matches_i() {
  grep -ci "$1" "$2" 2>/dev/null || true
}

check_file() {
  local file="$1"
  local errors=0
  local warnings=0

  echo "--- $file ---"

  # === MUST BE 0 ===

  local npx_refs
  npx_refs=$(count_matches 'npx bd\b' "$file")
  if [[ "$npx_refs" -gt 0 ]]; then
    echo "  FAIL: $npx_refs 'npx bd' references"
    errors=$((errors + 1))
  fi

  local bd_refs
  bd_refs=$(count_matches '`bd ' "$file")
  if [[ "$bd_refs" -gt 0 ]]; then
    echo "  FAIL: $bd_refs backtick-bd command references"
    errors=$((errors + 1))
  fi

  local bd_sync
  bd_sync=$(count_matches '\bbd sync\b' "$file")
  if [[ "$bd_sync" -gt 0 ]]; then
    echo "  FAIL: $bd_sync 'bd sync' references"
    errors=$((errors + 1))
  fi

  local pkg_ref
  pkg_ref=$(count_matches '@beads/bd' "$file")
  if [[ "$pkg_ref" -gt 0 ]]; then
    echo "  FAIL: $pkg_ref '@beads/bd' package references"
    errors=$((errors + 1))
  fi

  local bd_comment
  bd_comment=$(count_matches '\bbd comment\b' "$file")
  if [[ "$bd_comment" -gt 0 ]]; then
    echo "  FAIL: $bd_comment 'bd comment' references (should be 'br comments add')"
    errors=$((errors + 1))
  fi

  # === WARNINGS ===

  local daemon_refs
  daemon_refs=$(count_matches_i 'daemon' "$file")
  if [[ "$daemon_refs" -gt 0 ]]; then
    echo "  WARN: $daemon_refs daemon references (br has no daemon)"
    warnings=$((warnings + 1))
  fi

  # === POSITIVE CHECKS ===

  local has_beads
  has_beads=$(count_matches 'beads\|\.beads\|br ready\|br sync\|br list' "$file")

  if [[ "$has_beads" -gt 0 ]]; then
    local br_sync
    br_sync=$(count_matches 'br sync --flush-only' "$file")
    if [[ "$br_sync" -gt 0 ]]; then
      local git_add
      git_add=$(count_matches 'git add .beads/' "$file")
      if [[ "$git_add" -eq 0 ]]; then
        echo "  WARN: Has 'br sync --flush-only' but no 'git add .beads/'"
        warnings=$((warnings + 1))
      fi
    fi
  fi

  if [[ "$errors" -eq 0 ]]; then
    if [[ "$warnings" -gt 0 ]]; then
      echo "  PASS ($warnings warnings)"
    else
      echo "  PASS"
    fi
  else
    echo "  FAIL ($errors errors, $warnings warnings)"
  fi

  total_errors=$((total_errors + errors))
  total_warnings=$((total_warnings + warnings))
  files_checked=$((files_checked + 1))
}

if [[ -f "$target" ]]; then
  check_file "$target"
elif [[ -d "$target" ]]; then
  while IFS= read -r -d '' f; do
    check_file "$f"
  done < <(find "$target" \
    \( -name "*.md" -o -name "*.ts" -o -name "*.sh" \
       -o -name "*.yml" -o -name "*.yaml" \) \
    -not -path "*/node_modules/*" \
    -not -path "*/.git/*" \
    -print0 | sort -z)
fi

echo ""
echo "=== Summary ==="
echo "Files checked: $files_checked"
echo "Errors: $total_errors"
echo "Warnings: $total_warnings"

if [[ "$total_errors" -eq 0 ]]; then
  echo "Migration verified complete."
  exit 0
else
  echo "Migration INCOMPLETE. Fix errors above and re-run."
  exit 2
fi
